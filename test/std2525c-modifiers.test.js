// MIL-STD-2525C scheme S modifier profile. Expected values come from the
// standard: Table IV (PDF 28-30, printed 22-24), Table A-I (PDF 57, printed 51),
// Table A-II (PDF 58-60, printed 52-54), Figure 2 (PDF 27, printed 21) and
// 5.4.4 (PDF 40, printed 34) of MIL-STD-2525C, not from current output.
import { joinFields } from "../src/modifierprofiles/common.js";
import {
  std2525cProfile,
  std2525cTableIV,
  std2525cFields,
  std2525cSymbolClass,
  std2525cValidate,
  std2525cTextLayout
} from "../src/modifierprofiles/std2525c.js";

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
result["status P on equipment is a recorded tension"] = [
  [ok(EQUIPMENT), std2525cValidate(EQUIPMENT).details.notes.length > 0],
  [true, true]
];
result["on order needs status A"] = [
  [ok(UNIT, { dtg: "O/O" }), ok("SFGAUCI-----", { dtg: "O/O" })],
  [false, true]
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

// Figure 2 layout (profile rows; the library draws 2525C as upstream).
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

// AL operational condition (Table IV AL: equipment and installations; 5.3.4.12,
// PDF 37 / 31). Table III-1 (PDF 24-25 / 18-19): full to capacity is N/A in the
// static form.
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
    result["towed array " + code + " on " + name + " is accepted"] = [
      ok(base + code),
      true
    ];
  });
  [
    ["unit", "SFGPUCI---"],
    ["installation", "SFGPIB----"],
    ["SOF unit", "SFFPA-----"]
  ].forEach(([name, base]) => {
    result["towed array " + code + " on " + name + " is an error"] = [
      [ok(base + code), errors(base + code).some((e) => /^AG /.test(e))],
      [false, true]
    ];
  });
  result[
    "towed array " + code + " on an unknown-class symbol is not rejected"
  ] = [ok("SFZPS-----" + code), true];
});
result["towed array SIDC code letters only: NX is not an array code"] = [
  ok("SFUPS-----NX"),
  false
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
      result[name + ": no validation error"] = [
        std2525cValidate(sidc, allBlank(blank)).details.modifierErrors,
        std2525cValidate(sidc).details.modifierErrors
      ];
      result[name + ": as valid as without text"] = [
        std2525cValidate(sidc, allBlank(blank)).valid,
        std2525cValidate(sidc).valid
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

export default { "MIL-STD-2525C modifiers": result };
