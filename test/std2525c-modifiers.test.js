// MIL-STD-2525C scheme S modifier profile. Expected values come from the
// standard: Table IV (PDF 28-30, printed 22-24), Table A-I (PDF 57, printed 51),
// Table A-II (PDF 58-60, printed 52-54), Figure 2 (PDF 27, printed 21) and
// 5.4.4 (PDF 40, printed 34) of MIL-STD-2525C, not from current output.
import { ms, std2525c } from "../index.mjs";
import { joinFields } from "../src/modifierprofiles/common.js";
import { drawExtents, viewBoxOf, outside } from "./draw-extents.js";
import {
  std2525cProfile,
  std2525cTableIV,
  std2525cFields,
  std2525cSymbolClass,
  std2525cValidate,
  std2525cTextLayout
} from "../src/modifierprofiles/std2525c.js";

ms.reset();
ms.addIcons(std2525c);
ms.setStandard("2525C");

function visit(parts) {
  return parts.reduce(
    (all, part) =>
      all.concat(
        Array.isArray(part)
          ? visit(part)
          : part
            ? [part].concat(visit(part.draw || []))
            : []
      ),
    []
  );
}
const texts = (symbol) =>
  visit(symbol.drawInstructions)
    .filter((part) => part.type === "text")
    .map((part) => part.text);
const sym = (sidc, options) => new ms.Symbol(sidc, options || {});
const errors = (sidc, options) =>
  std2525cValidate(sidc, options).details.modifierErrors;
// Accepted: valid, and no text rule warns.
const ok = (sidc, options) => {
  const result = std2525cValidate(sidc, options);
  return result.valid && !result.details.fieldWarnings.length;
};

const UNIT = "SFGPUCI-----";
const EQUIPMENT = "SFGPEWM-----";
const INSTALLATION = "SFGPIB------";
const result = {};

// Table IV: 39 entries; U/E/I limits for selected rows.
const row = (field) =>
  std2525cTableIV.filter((e) => e.field === field)[0].limits;
result["Table IV has 39 entries"] = [std2525cTableIV.length, 39];
result["C is U- E9 I-"] = [row("C"), [null, 9, null]];
result["K is U5 E- I5"] = [row("K"), [5, null, 5]];
result["Z is U8 E8 I-"] = [row("Z"), [8, 8, null]];
result["W 16 and X 14"] = [
  [row("W")[1], row("X")[1]],
  [16, 14]
];
result["AO is G/8"] = [row("AO"), ["G/8", "G/8", "G/8"]];
result["SIGINT-only AD AE AF R2 are dashes"] = [
  ["AD", "AE", "AF", "R2"].map((f) => row(f).join()),
  ["AD", "AE", "AF", "R2"].map(() => ",,")
];

// Symbol class.
[
  [UNIT, "unit"],
  [EQUIPMENT, "equipment"],
  [INSTALLATION, "installation"],
  ["SFAPMF------", "equipment"],
  ["SFPPS-------", "equipment"],
  ["SFSPCL------", "equipment"],
  ["SFUPSA------", "equipment"],
  ["SFFPA-------", "unit"],
  ["SFZP--------", "unknown"],
  ["GFGPGLB-----", ""]
].forEach(([sidc, cls]) => {
  result["class " + sidc] = [std2525cSymbolClass(sidc), cls];
});

// Field lists by class.
const keys = (sidc) => std2525cFields(sidc).map((f) => f.key);
result["unit has F, no C/V/L/N"] = [
  [
    "reinforcedReduced",
    "quantity",
    "type",
    "signatureEquipment",
    "hostile"
  ].map((k) => keys(UNIT).indexOf(k) > -1),
  [true, false, false, false, false]
];
result["equipment has C V Z, no K F M AA"] = [
  [
    "quantity",
    "type",
    "speed",
    "combatEffectiveness",
    "reinforcedReduced",
    "higherFormation",
    "specialHeadquarters"
  ].map((k) => keys(EQUIPMENT).indexOf(k) > -1),
  [true, true, true, false, false, false, false]
];
result["installation has K, no Z V C Q"] = [
  ["combatEffectiveness", "speed", "type", "quantity", "direction"].map(
    (k) => keys(INSTALLATION).indexOf(k) > -1
  ),
  [true, false, false, false, false]
];
result["non-S scheme is unrestricted"] = [std2525cFields("GFGPGLB-----"), null];
result["non-S scheme validates"] = [
  ok("GFGPGLB-----", { country: "TR" }),
  true
];
result["non-S scheme has no layout"] = [
  std2525cTextLayout("GFGPGLB-----"),
  null
];

// SOF (dimension F) is a unit: SOF aircraft are in the AIR dimension (Table A-III,
// PDF 63-64), every F entry is a "SOF UNIT" (PDF 94), 5.3.1.3 (PDF 23 / 17) gives
// units the rectangle frame. Table IV note 2 (PDF 30 / 24) covers SOF platforms,
// which are equipment through the AIR dimension.
const SOF = "SFFPA-------";
result["SOF class is unit"] = [std2525cSymbolClass(SOF), "unit"];
result["SOF aircraft in AIR are equipment"] = [
  std2525cSymbolClass("SFAPMF------"),
  "equipment"
];
result["SOF takes the unit fields"] = [
  [
    "reinforcedReduced",
    "combatEffectiveness",
    "higherFormation",
    "specialHeadquarters"
  ].map((k) => keys(SOF).indexOf(k) > -1),
  [true, true, true, true]
];
result["SOF rejects the equipment-only fields C L N V"] = [
  [
    ok(SOF, { quantity: "5" }),
    ok("SHFPA-------", { signatureEquipment: "!" }),
    ok(SOF, { hostile: "ENY" }),
    ok(SOF, { type: "X" })
  ],
  [false, false, false, false]
];
result["SOF is valid without a class note"] = [
  [ok(SOF), std2525cValidate(SOF).details.notes],
  [true, []]
];
result["SOF unit draws its echelon"] = [
  sym("SFFPA-----" + "-E").metadata.echelon !== "",
  true
];
result["SOF rejects mobility like any unit"] = [ok("SFFPA-----MQ"), false];

// Min / max / max+1 / empty for every free text field and class.
[
  [UNIT, "unit"],
  [EQUIPMENT, "equipment"],
  [INSTALLATION, "installation"]
].forEach(([sidc, cls]) => {
  std2525cFields(sidc)
    .filter((f) => f.kind === "text" && f.maxLength !== null)
    .forEach((f) => {
      const set = (n) => {
        const o = {};
        o[f.key] = "x".repeat(n);
        return o;
      };
      const name = cls + " " + f.field + " " + f.key;
      result[name + " min"] = [ok(sidc, set(1)), true];
      result[name + " max " + f.maxLength] = [ok(sidc, set(f.maxLength)), true];
      result[name + " max+1"] = [ok(sidc, set(f.maxLength + 1)), false];
    });
});
result["empty values are valid"] = [
  ok(UNIT, { staffComments: "", dtg: undefined }),
  true
];
result["no invented character set (lowercase/punctuation)"] = [
  ok(UNIT, { staffComments: "a/b-c é ü" }),
  true
];

// Not applicable per class.
result["unit rejects C"] = [ok(UNIT, { quantity: "5" }), false];
result["equipment accepts C"] = [ok(EQUIPMENT, { quantity: "5" }), true];
result["installation rejects C"] = [ok(INSTALLATION, { quantity: "5" }), false];
result["installation rejects Z"] = [ok(INSTALLATION, { speed: "5" }), false];
result["equipment rejects K"] = [
  ok(EQUIPMENT, { combatEffectiveness: "80" }),
  false
];
result["equipment rejects M"] = [
  ok(EQUIPMENT, { higherFormation: "1" }),
  false
];
result["installation rejects Q"] = [ok(INSTALLATION, { direction: 90 }), false];
result["unit accepts Q 0"] = [ok(UNIT, { direction: 0 }), true];
[
  "country",
  "platformType",
  "equipmentTeardownTime",
  "commonIdentifier",
  "headquartersElement",
  "installationComposition",
  "sigint",
  "guardedUnit",
  "specialDesignator",
  "auxiliaryEquipmentIndicator"
].forEach((key) => {
  const o = {};
  o[key] = "x";
  result["not a 2525C S field " + key] = [ok(UNIT, o), false];
});
result["AO accepts 8 rejects 9"] = [
  [
    ok(UNIT, { engagementBar: "A".repeat(8) }),
    ok(UNIT, { engagementBar: "A".repeat(9) })
  ],
  [true, false]
];

// J: all 36 pairs; K free text; L only !; N only ENY; F display forms.
let pairs = 0;
"ABCDEF".split("").forEach((r) =>
  "123456".split("").forEach((c) => {
    if (ok(UNIT, { evaluationRating: r + c })) pairs++;
  })
);
result["J accepts 36 pairs"] = [pairs, 36];
result["J rejects G1 A7 1A"] = [
  ["G1", "A7", "1A", "A"].map((v) => ok(UNIT, { evaluationRating: v })),
  [false, false, false, false]
];
result["K is free text up to 5"] = [
  [
    ok(UNIT, { combatEffectiveness: "80%" }),
    ok(UNIT, { combatEffectiveness: "123456" })
  ],
  [true, false]
];
result["L only ! and only hostile"] = [
  [
    ok("SHGPEWM-----", { signatureEquipment: "!" }),
    ok(EQUIPMENT, { signatureEquipment: "!" }),
    ok("SHGPEWM-----", { signatureEquipment: "?" })
  ],
  [true, false, false]
];
// Table IV L (PDF 28 / 22): "text modifier for hostile equipment". Hostile is
// identity H. Suspect is a separate identity, "potentially hostile" (3.2.42,
// PDF 16 / 10), so S does not qualify; exercise identities and J/K do not either.
"PUAFNSGWMDLJK".split("").forEach((id) => {
  result["L rejected for identity " + id] = [
    ok("S" + id + "GPEWM-----", { signatureEquipment: "!" }),
    false
  ];
  result["L unavailable reason for identity " + id] = [
    std2525cProfile.unavailableReason(
      "signatureEquipment",
      "S" + id + "GPEWM-----"
    ),
    "L is for hostile equipment (identity H only)"
  ];
  result["L is not a field for identity " + id] = [
    keys("S" + id + "GPEWM-----").indexOf("signatureEquipment"),
    -1
  ];
  result["L is not in the layout for identity " + id] = [
    std2525cTextLayout("S" + id + "GPEWM-----").right[5].indexOf(
      "signatureEquipment"
    ),
    -1
  ];
});
result["L accepted for identity H (field, reason, layout)"] = [
  [
    keys("SHGPEWM-----").indexOf("signatureEquipment") > -1,
    std2525cProfile.unavailableReason("signatureEquipment", "SHGPEWM-----"),
    std2525cTextLayout("SHGPEWM-----").right[5].indexOf("signatureEquipment") >
      -1
  ],
  [true, "", true]
];
result["L error text names identity H only"] = [
  errors("SSGPEWM-----", { signatureEquipment: "!" }),
  [
    "L signatureEquipment: not applicable to equipment symbols (L is for hostile equipment, identity H only)"
  ]
];
result["L is not drawn for suspect equipment"] = [
  texts(sym("SSGPEWM-----", { signatureEquipment: "!" })).indexOf("!"),
  -1
];
result["L never applies to units or installations, even for H"] = [
  [
    ok("SHGPUCI-----", { signatureEquipment: "!" }),
    ok("SHGPIB------", { signatureEquipment: "!" })
  ],
  [false, false]
];
result["N ENY only, independent of identity"] = [
  [
    ok(EQUIPMENT, { hostile: "ENY" }),
    ok("SHGPEWM-----", { hostile: "ENY" }),
    ok(EQUIPMENT, { hostile: "EN" }),
    ok(UNIT, { hostile: "ENY" })
  ],
  [true, true, false, false]
];
result["H identity does not generate ENY"] = [
  texts(sym("SHGPEWM-----")).indexOf("ENY"),
  -1
];
result["F display forms"] = [
  ["(+)", "(-)", "(±)"].map((v) => ok(UNIT, { reinforcedReduced: v })),
  [true, true, true]
];
result["F transmission codes are not display values"] = [
  ["R", "D", "RD"].map((v) => ok(UNIT, { reinforcedReduced: v })),
  [false, false, false]
];

// Identities and Table II N/A for unknown dimension.
"PUAFNSHGWMDLJK".split("").forEach((id) => {
  result["identity " + id + " ground unit valid"] = [
    ok("S" + id + "GPUCI-----"),
    true
  ];
  result["identity " + id + " unknown dimension"] = [
    ok("S" + id + "ZP--------"),
    "GWPUAFNSH".indexOf(id) > -1
  ];
});
result["X Other is a note, not a frame"] = [
  sym("SFXP--------").metadata.frame,
  false
];
result["Joker friend shape red"] = [
  [
    sym("SJGPUCI-----").metadata.affiliation,
    sym("SJGPUCI-----").metadata.joker
  ],
  ["Friend", true]
];
result["Faker friend shape"] = [
  [
    sym("SKGPUCI-----").metadata.affiliation,
    sym("SKGPUCI-----").metadata.faker
  ],
  ["Friend", true]
];
result["Joker uses the hostile (red) frame colour"] = [
  sym("SJGPUCI-----").colors.frameColor.Friend,
  sym("SHGPUCI-----").colors.frameColor.Hostile
];

// Status.
result["unit rejects C D X F"] = [
  ["C", "D", "X", "F"].map((s) =>
    ok("SFGP" === "" ? "" : "SFG" + s + "UCI-----")
  ),
  [false, false, false, false]
];
result["equipment accepts C D X F"] = [
  ["C", "D", "X", "F"].map((s) => ok("SFG" + s + "EWM-----")),
  [true, true, true, true]
];
result["unit never draws AL"] = [sym("SFGCUCI-----").metadata.condition, ""];
result["equipment C draws fully capable"] = [
  sym("SFGCEWM-----").metadata.condition,
  "FullyCapable"
];
result["status P on equipment is a recorded tension"] = [
  [ok(EQUIPMENT), std2525cValidate(EQUIPMENT).details.notes.length > 0],
  [true, true]
];
result["on order needs status A"] = [
  [ok(UNIT, { dtg: "O/O" }), ok("SFGAUCI-----", { dtg: "O/O" })],
  [false, true]
];
result["planned and uncertainty kept apart"] = [
  [
    sym("SAGAUCI-----").metadata.identityUncertain,
    sym("SAGAUCI-----").metadata.plannedStatus,
    sym("SFGAUCI-----").metadata.identityUncertain
  ],
  [true, true, false]
];

// SIDC 11-12 (Table A-II).
const sm = (cls, code) => ok(cls.substr(0, 10) + code);
result["unit modifier codes"] = [
  ["--", "-A", "-N", "AN", "BB", "DN", "EA", "FA", "GN", "H-", "HB"].map((c) =>
    sm(UNIT, c)
  ),
  Array(11).fill(true)
];
result["H only H- HB"] = [
  ["HA", "HC", "HN"].map((c) => sm(UNIT, c)),
  [false, false, false]
];
result["unit rejects mobility and array"] = [
  ["MQ", "NS"].map((c) => sm(UNIT, c)),
  [false, false]
];
result["equipment mobility MO..MY"] = [
  ["MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY"].map((c) =>
    sm(EQUIPMENT, c)
  ),
  Array(11).fill(true)
];
result["mobility rejects MA MZ"] = [
  ["MA", "MZ"].map((c) => sm(EQUIPMENT, c)),
  [false, false]
];
result["towed array NS NL on equipment"] = [
  ["NS", "NL", "NX"].map((c) => sm(EQUIPMENT, c)),
  [true, true, false]
];
result["equipment HQ, FD and TF ok, echelon not"] = [
  ["A-", "C-", "F-", "H-", "HB", "-E", "AE", "E-", "B-"].map((c) =>
    sm(EQUIPMENT, c)
  ),
  [true, true, true, true, true, false, false, true, true]
];
result["installation HQ ok, echelon not"] = [
  ["A-", "H-", "HB", "-A"].map((c) => sm(INSTALLATION, c)),
  [true, true, true, false]
];
result["renderer agrees: equipment echelon and mobility on unit are not drawn; TF is"] =
  [
    [
      sym("SFGPEWM---E-").metadata.taskForce,
      sym("SFGPEWM----E").metadata.echelon,
      sym("SFGPUCI---MQ").metadata.mobility
    ],
    [true, "", ""]
  ];
result["renderer: HA does not draw an echelon"] = [
  sym("SFGPUCI---HA").metadata.echelon,
  ""
];

// Figure 2 layout, single space, collapse of empties.
const layout = std2525cTextLayout(UNIT);
result["left rows"] = [
  layout.left,
  [
    [],
    ["dtg"],
    ["altitudeDepth", "location"],
    [],
    ["uniqueDesignation"],
    ["speed"]
  ]
];
result["right rows"] = [
  layout.right,
  [
    [],
    ["reinforcedReduced"],
    ["staffComments"],
    ["additionalInformation"],
    ["higherFormation"],
    ["evaluationRating", "combatEffectiveness", "iffSif"]
  ]
];
result["equipment left rows"] = [
  std2525cTextLayout(EQUIPMENT).left[3],
  ["type"]
];
result["equipment quantity is top, AA is not"] = [
  [std2525cTextLayout(EQUIPMENT).top, std2525cTextLayout(EQUIPMENT).inner],
  [["quantity"], []]
];
result["unit AA is inner"] = [layout.inner, ["specialHeadquarters"]];
result["exercise descriptor first in E/F row"] = [
  std2525cTextLayout("SDGPUCI-----").right[1],
  ["frameDescriptor", "reinforcedReduced"]
];
result["joker descriptor J"] = [
  std2525cTextLayout("SJGPUCI-----").derived,
  { frameDescriptor: "J" }
];
result["single space and collapse"] = [
  texts(sym(UNIT, { evaluationRating: "B2", iffSif: "1234" })).filter(
    (t) => t.indexOf("B2") > -1
  ),
  ["B2 1234"]
];
result["full right-lower group order"] = [
  texts(
    sym(UNIT, {
      iffSif: "1234",
      combatEffectiveness: "80%",
      evaluationRating: "B2"
    })
  ).filter((t) => t.indexOf("B2") > -1),
  ["B2 80% 1234"]
];
result["equipment J K L N P order"] = [
  texts(
    sym("SHGPEWM-----", {
      evaluationRating: "A1",
      signatureEquipment: "!",
      hostile: "ENY",
      iffSif: "12"
    })
  ).filter((t) => t.indexOf("A1") > -1),
  ["A1 ! ENY 12"]
];
result["X Y share a row with one space"] = [
  texts(sym(UNIT, { altitudeDepth: "100 FT AGL", location: "12.5N" })).filter(
    (t) => t.indexOf("100") > -1
  ),
  ["100 FT AGL 12.5N"]
];
result["exercise X drawn once, without F"] = [
  texts(sym("SDGPUCI-----")).filter((t) => t === "X"),
  ["X"]
];
result["inapplicable text is not drawn"] = [
  texts(
    sym(UNIT, { quantity: "55", headquartersElement: "HQE", type: "TYPEX" })
  ).filter((t) => ["55", "HQE", "TYPEX"].indexOf(t) > -1),
  []
];

// Isolation: 2525 (B/C mix) keeps drawing everything; stale cache check.
const mixed = (standard) =>
  sym(UNIT, { standard: standard, quantity: "55", reinforcedReduced: "(+)" });
result["2525 mix still draws C on a unit"] = [
  texts(mixed("2525")).indexOf("55") > -1,
  true
];
result["2525C does not"] = [texts(mixed("2525C")).indexOf("55") > -1, false];
result["interleaved standards stay stable"] = [
  [
    texts(mixed("2525")).indexOf("55") > -1,
    texts(mixed("2525C")).indexOf("55") > -1,
    texts(mixed("2525")).indexOf("55") > -1
  ],
  [true, false, true]
];
result["2525 unit with status C keeps its bar"] = [
  new ms.Symbol("SFGCUCI-----", { standard: "2525" }).metadata.condition,
  "FullyCapable"
];

// AL operational condition (Table IV AL: equipment and installations; 5.3.4.12,
// PDF 37 / 31). Table III-2 (PDF 25 / 19) alternate: a coloured bar under the
// symbol, green fully capable, yellow damaged, red destroyed, blue full to
// capacity. The colours were sampled from the page render of the PDF: (0,255,0),
// (255,255,0), (255,0,0) and (0,176,240); a tolerance of 6 per channel covers
// raster sampling. The bar is as wide as the frame (measured 92-100% of the
// symbol width on the page) and sits below it. Table III-1 (PDF 24-25 / 18-19)
// static: damaged is a single slash, destroyed a cross, fully capable has no
// mark and full to capacity is N/A.
const rgb = (fill) => String(fill).match(/\d+/g).map(Number);
const near = (fill, expected) =>
  rgb(fill).every((value, i) => Math.abs(value - expected[i]) <= 6);
const alDimensions = [
  ["air", "SFA?MF------"],
  ["space", "SFP?S-------"],
  ["land equipment", "SFG?EWM-----"],
  ["land installation", "SFG?IB------"],
  ["sea surface", "SFS?CL------"],
  ["subsurface", "SFU?S-------"]
];
const alColours = {
  C: [0, 255, 0],
  D: [255, 255, 0],
  X: [255, 0, 0],
  F: [0, 176, 240]
};
const alParts = (symbol) =>
  visit(symbol.drawInstructions).filter(
    (part) => part.type === "path" && !part.icon
  );
const alBars = (symbol) =>
  alParts(symbol).filter((part) =>
    /^M-?[\d.]+,-?[\d.]+ l[\d.]+,0 0,25 /.test(part.d || "")
  );
const alSlashes = (symbol) =>
  alParts(symbol).filter((part) =>
    /^M(150,20 L50,180|50,20 L150,180)$/.test(part.d || "")
  );
alDimensions.forEach(([name, template]) => {
  "CDXF".split("").forEach((status) => {
    const sidc = template.replace("?", status);
    const label = name + " status " + status;
    const symbol = sym(sidc);
    const bars = alBars(symbol);
    const frameBox = symbol.metadata.baseGeometry.bbox;
    const view = viewBoxOf(symbol.asSVG());
    result[label + ": one bar in the Table III-2 colour"] = [
      [bars.length, bars.length === 1 && near(bars[0].fill, alColours[status])],
      [1, true]
    ];
    if (bars.length === 1) {
      const m = /^M(-?[\d.]+),(-?[\d.]+) l([\d.]+),0 0,(\d+)/.exec(bars[0].d);
      const x = parseFloat(m[1]);
      const y = parseFloat(m[2]);
      const width = parseFloat(m[3]);
      result[label + ": bar is below the frame and as wide as the frame"] = [
        [
          y >= frameBox.y2,
          width / frameBox.width() >= 0.92,
          width / frameBox.width() <= 1.0001,
          x >= frameBox.x1 - 0.001
        ],
        [true, true, true, true]
      ];
    }
    result[label + ": bar lies inside the SVG viewBox"] = [
      drawExtents(symbol.drawInstructions, symbol.style.strokeWidth)
        .filter((e) => outside(e.outer, view))
        .map((e) => e.part.d || e.part.text),
      []
    ];
    const plain = sym(sidc, { simpleStatusModifier: true });
    const slashes = alSlashes(plain);
    result[label + ": static modifier (Table III-1) draws no bar"] = [
      alBars(plain).length,
      0
    ];
    const expected = { C: 0, D: 1, X: 2, F: 0 }[status];
    result[label + ": static modifier has " + expected + " slash(es)"] = [
      slashes.length,
      expected
    ];
    const staticView = viewBoxOf(plain.asSVG());
    result[label + ": static slashes lie inside the SVG viewBox"] = [
      drawExtents(plain.drawInstructions, plain.style.strokeWidth)
        .filter((e) => outside(e.outer, staticView))
        .map((e) => e.part.d || e.part.text),
      []
    ];
  });
  ["P", "A"].forEach((status) => {
    const symbol = sym(template.replace("?", status));
    result[name + " status " + status + ": no AL bar and no slash"] = [
      [
        alBars(symbol).length,
        alSlashes(
          sym(template.replace("?", status), { simpleStatusModifier: true })
        ).length
      ],
      [0, 0]
    ];
  });
});
// Damaged is "/" (lower left to upper right); destroyed adds the other diagonal.
const damaged = alSlashes(
  sym("SFGDEWM-----", { simpleStatusModifier: true })
)[0];
result["static damaged slash rises to the right"] = [
  damaged.d
    .replace(/^M/, "")
    .split(" L")
    .map((point) => point.split(",").map(Number)),
  [
    [150, 20],
    [50, 180]
  ]
];
result["destroyed draws both diagonals"] = [
  alSlashes(sym("SFGXEWM-----", { simpleStatusModifier: true }))
    .map((p) => p.d)
    .sort(),
  ["M150,20 L50,180", "M50,20 L150,180"]
];
// Units have no AL: no bar and no slash, in either representation.
["C", "D", "X", "F"].forEach((status) => {
  ["SFG?UCI-----", "SFF?A-------"].forEach((template) => {
    const sidc = template.replace("?", status);
    result["unit " + sidc + " draws no AL in any representation"] = [
      [
        alBars(sym(sidc)).length,
        alSlashes(sym(sidc, { simpleStatusModifier: true })).length
      ],
      [0, 0]
    ];
  });
});
result["AL is a Studio-visible fact: unit status C is an error"] = [
  std2525cValidate("SFGCUCI-----").details.modifierErrors.length,
  1
];
result["Table III-1: full to capacity is N/A in the static form (note kept)"] =
  [
    std2525cValidate("SFGFEWM-----").details.notes.some((note) =>
      /Table III-1 shows N\/A/.test(note)
    ),
    true
  ];

// AG towed sonar array (Table IV AG, PDF 30 / 24: a graphic modifier for equipment
// only, U and I are dashes; 5.3.4.4, PDF 33 / 27: "only used for towed equipment";
// Table VII, PDF 34 / 28: short and long shown on a submarine; Table A-II, PDF 60 /
// 54: NS short, NL long). The source names no further class or dimension, so
// every equipment symbol accepts it and units and installations do not.
const arrays = { NS: "Short towed array", NL: "Long towed Array" };
const equipmentBases = [
  ["land equipment", "SFGPEWM---"],
  ["air", "SFAPMF----"],
  ["space", "SFPPS-----"],
  ["sea surface", "SFSPCL----"],
  ["subsurface", "SFUPS-----"]
];
Object.keys(arrays).forEach((code) => {
  equipmentBases.forEach(([name, base]) => {
    const symbol = sym(base + code);
    result["towed array " + code + " on " + name + " is accepted and drawn"] = [
      [ok(base + code), symbol.metadata.mobility],
      [true, arrays[code]]
    ];
  });
  [
    ["unit", "SFGPUCI---"],
    ["installation", "SFGPIB----"],
    ["SOF unit", "SFFPA-----"]
  ].forEach(([name, base]) => {
    const symbol = sym(base + code);
    result[
      "towed array " + code + " on " + name + " is an error and not drawn"
    ] = [
      [
        ok(base + code),
        symbol.metadata.mobility,
        errors(base + code).some((e) => /^AG /.test(e))
      ],
      [false, "", true]
    ];
  });
  result[
    "towed array " + code + " on an unknown-class symbol is not rejected"
  ] = [ok("SFZPS-----" + code), true];
});
// Short = 3 markers (both ends and the middle), long = 5 (ends and every
// quarter), joined by a line below the symbol (Table VII, PDF 34 / 28). The
// marker glyph itself (a square with a tick in the PDF, a diamond here for the
// inner markers) is a drawing detail that is not compared.
const arrayPath = (symbol) =>
  visit(symbol.drawInstructions).filter(
    (part) => part.type === "path" && /^M 50,5 l 100,0/.test(part.d || "")
  );
result["towed array short has 3 markers on a 100 unit line"] = [
  arrayPath(sym("SFUPS-----NS")).map((p) => (p.d.match(/z/g) || []).length),
  [3]
];
result["towed array long has 5 markers on a 100 unit line"] = [
  arrayPath(sym("SFUPS-----NL")).map((p) => (p.d.match(/z/g) || []).length),
  [5]
];
result["towed array is drawn below the symbol and inside the viewBox"] =
  (() => {
    const symbol = sym("SFUPS-----NL");
    const view = viewBoxOf(symbol.asSVG());
    const frameBox = symbol.metadata.baseGeometry.bbox;
    const shapes = drawExtents(
      symbol.drawInstructions,
      symbol.style.strokeWidth
    );
    const array = shapes.filter((e) =>
      /^M 50,5 l 100,0/.test(e.part.d || "")
    )[0];
    return [
      [
        array.box.y1 >= frameBox.y2,
        shapes.filter((e) => outside(e.outer, view)).length
      ],
      [true, 0]
    ];
  })();
result["towed array SIDC code letters only: NX is not an array code"] = [
  [ok("SFUPS-----NX"), !!sym("SFUPS-----NX").metadata.mobility],
  [false, false]
];
result["towed array: no MO..MY mobility is drawn for NS/NL"] = [
  sym("SFUPS-----NS").metadata.mobility !==
    sym("SFUPS-----MS").metadata.mobility,
  true
];
result["towed array does not apply with an array text option"] = [
  ok(EQUIPMENT, { auxiliaryEquipmentIndicator: "NS" }),
  false
];

// Whitespace-only text is empty: no row, no reserved separator, not "present"
// for validation. Non-blank text is never trimmed.
const TEXT_KEYS = [
  "quantity",
  "reinforcedReduced",
  "staffComments",
  "additionalInformation",
  "evaluationRating",
  "combatEffectiveness",
  "signatureEquipment",
  "higherFormation",
  "hostile",
  "iffSif",
  "sigint",
  "uniqueDesignation",
  "type",
  "dtg",
  "altitudeDepth",
  "location",
  "speed",
  "specialHeadquarters",
  "country",
  "platformType",
  "equipmentTeardownTime",
  "commonIdentifier",
  "auxiliaryEquipmentIndicator",
  "headquartersElement",
  "installationComposition",
  "engagementBar",
  "engagementType",
  "guardedUnit",
  "specialDesignator"
];
const BLANKS = ["   ", "\t", " \n ", " ", "　 "];
const allBlank = (blank) => {
  const o = {};
  TEXT_KEYS.forEach((key) => {
    o[key] = blank;
  });
  return o;
};
result["joinFields drops whitespace-only values and their separators"] = [
  [
    joinFields({ a: "  ", b: "x" }, ["a", "b"]),
    joinFields({ a: "x", b: " \t ", c: "y" }, ["a", "b", "c"]),
    joinFields({ a: "x", b: " " }, ["a", "b"]),
    joinFields({ a: " ", b: "\n" }, ["a", "b"])
  ],
  ["x", "x y", "x", ""]
];
result["joinFields keeps non-blank values untrimmed"] = [
  joinFields({ a: " x ", b: "y" }, ["a", "b"]),
  " x  y"
];
[UNIT, EQUIPMENT, INSTALLATION, "SHGPEWM-----", "SDGPUCI-----", SOF].forEach(
  (sidc) => {
    BLANKS.forEach((blank, i) => {
      const name = "blank " + i + " on " + sidc;
      const blanked = sym(sidc, allBlank(blank));
      const plain = sym(sidc);
      result[name + ": renders exactly like no text"] = [
        blanked.asSVG(),
        plain.asSVG()
      ];
      result[name + ": same bounding box"] = [
        [blanked.bbox.x1, blanked.bbox.x2, blanked.bbox.y1, blanked.bbox.y2],
        [plain.bbox.x1, plain.bbox.x2, plain.bbox.y1, plain.bbox.y2]
      ];
      result[name + ": no validation error"] = [
        std2525cValidate(sidc, allBlank(blank)).details.modifierErrors,
        std2525cValidate(sidc).details.modifierErrors
      ];
      result[name + ": symbol is as valid as without text"] = [
        blanked.isValid(),
        plain.isValid()
      ];
    });
  }
);
result["blank is not present: inapplicable and out-of-range values"] = [
  [
    ok(UNIT, { quantity: " ", type: " ", hostile: " " }),
    ok(UNIT, { evaluationRating: " ", reinforcedReduced: " " }),
    ok(EQUIPMENT, { signatureEquipment: " ", combatEffectiveness: "\t" }),
    ok(UNIT, { country: " ", headquartersElement: "  ", sigint: " " }),
    ok(UNIT, { dtg: " ", staffComments: "　" })
  ],
  [true, true, true, true, true]
];
result["blank does not make L available to other identities"] = [
  ok("SSGPEWM-----", { signatureEquipment: " " }),
  true
];
result["blank among real text: real text is still checked"] = [
  [
    ok(UNIT, { quantity: "5", staffComments: " " }),
    ok(UNIT, { staffComments: "x".repeat(21) + " " })
  ],
  [false, false]
];
result["whitespace plus text counts as text (length includes spaces)"] = [
  ok(UNIT, { staffComments: " ".repeat(10) + "x".repeat(11) }),
  false
];
result["blank X keeps no leading space before Y"] = [
  texts(sym(UNIT, { altitudeDepth: "   ", location: "12.5N" })),
  ["12.5N"]
];
result["blank Y keeps no trailing space after X"] = [
  texts(sym(UNIT, { altitudeDepth: "100 FT", location: "\t" })),
  ["100 FT"]
];
result["blank K does not split J and P"] = [
  texts(
    sym(UNIT, {
      evaluationRating: "B2",
      combatEffectiveness: "  ",
      iffSif: "7"
    })
  ),
  ["B2 7"]
];
result["blank J K L N leaves P alone"] = [
  texts(
    sym("SHGPEWM-----", {
      evaluationRating: " ",
      signatureEquipment: " ",
      hostile: " ",
      iffSif: "12"
    })
  ),
  ["12"]
];
result["blank F: exercise X is drawn alone and once"] = [
  texts(sym("SDGPUCI-----", { reinforcedReduced: "  " })),
  ["X"]
];
result["blank F: joker J is drawn alone and once"] = [
  texts(sym("SJGPUCI-----", { reinforcedReduced: " " })),
  ["J"]
];
result["blank quantity C creates no top text and no extra height"] = [
  [
    texts(sym(EQUIPMENT, { quantity: "  " })),
    sym(EQUIPMENT, { quantity: "  " }).bbox.y1
  ],
  [[], sym(EQUIPMENT).bbox.y1]
];
result["blank AA creates no inner text and no extra width"] = [
  [
    texts(sym(UNIT, { specialHeadquarters: "          " })),
    sym(UNIT, { specialHeadquarters: "          " }).bbox.x2
  ],
  [[], sym(UNIT).bbox.x2]
];
result["blank AO draws no engagement bar"] = [
  sym(UNIT, { engagementBar: "   " }).bbox.y1,
  sym(UNIT).bbox.y1
];
result["blank direction Q draws no arrow"] = [
  sym(UNIT, { direction: " " }).asSVG(),
  sym(UNIT).asSVG()
];
result["blank value is not trimmed away from real text"] = [
  texts(sym(UNIT, { staffComments: " x " })),
  [" x "]
];
result["the caller's options object is not modified"] = (() => {
  const given = { quantity: "  ", staffComments: " " };
  sym(EQUIPMENT, given);
  return [given, { quantity: "  ", staffComments: " " }];
})();

ms.reset();
export default { "MIL-STD-2525C modifiers": result };
