// Placement and rules of the APP-6(B), MIL-STD-2525D, MIL-STD-2525E and APP-6(E)
// profiles. The expected rows are copied by hand from the placement figures of
// each publication (citations in docs/edition-modifiers.md), and compared with
// what the renderer draws, so a wrong profile table fails here.
import { ms, app6b, std2525c } from "../index.mjs";
import { app6dProfile } from "../src/modifierprofiles/app6d.js";
import { fieldKeys } from "../src/modifierprofiles/fieldtable.js";
import { app6bProfile } from "../src/modifierprofiles/app6b.js";
import { app6eProfile } from "../src/modifierprofiles/app6e.js";
import { std2525dProfile } from "../src/modifierprofiles/std2525d.js";
import { std2525eProfile } from "../src/modifierprofiles/std2525e.js";
import {
  editionField,
  editorGaps,
  movementControls,
  probeOffers,
  patchSidc
} from "../studio/profile-controls.js";
import { numericSidcEdition } from "../studio/sidc-editor.js";

ms.reset();
ms.addIcons(app6b);
ms.addIcons(std2525c);

const codes = Object.keys(fieldKeys);
const allFields = (extra) => {
  const options = {};
  codes.forEach((code) => {
    options[fieldKeys[code]] = code;
  });
  // AO is a bar with its own text, not a row.
  options.engagementBar = "";
  return Object.assign(options, extra || {});
};

// What the renderer drew: {left, right, centre} as row texts, top to bottom.
function drawn(sidc, standard, extra) {
  const svg = new ms.Symbol(sidc, allFields(extra), {
    standard,
    icon: false
  }).asSVG();
  const found = [
    ...svg.matchAll(
      /<text[^>]*?x="([^"]+)"[^>]*?y="([^"]+)"[^>]*?text-anchor="(\w+)"[^>]*>([^<]*)<\/text>/g
    )
  ].map((match) => ({
    y: Number(match[2]),
    anchor: match[3],
    text: match[4]
  }));
  const side = (anchor) =>
    found
      .filter((item) => item.anchor === anchor)
      .sort((a, b) => a.y - b.y)
      .map((item) => item.text);
  return { left: side("end"), right: side("start"), centre: side("middle") };
}

const figures = {
  "APP-6(B) Figure 5 land unit": [
    "SFGPUCI--------",
    "APP6",
    ["W", "X Y", "T", "Z"],
    ["F", "G", "H", "M", "J K P"],
    ["AA"]
  ],
  "APP-6(B) Figure 5 land equipment": [
    "SHGPEWM--------",
    "APP6",
    ["W", "X Y", "V", "T", "Z"],
    ["G", "H", "J L N P"],
    ["C"],
    { signatureEquipment: "L" }
  ],
  "APP-6(B) Figure 5 land installation": [
    "SFGPIB---------",
    "APP6",
    ["W", "X Y", "T", "Z"],
    ["G", "H", "J K P"],
    []
  ],
  "APP-6(B) Figure 5 air": [
    "SFAPMF---------",
    "APP6",
    ["W", "X Y", "V", "T", "Z"],
    ["G", "H", "J N P"],
    ["C"]
  ]
};

const placement = {};
Object.keys(figures).forEach((name) => {
  const [sidc, standard, left, right, centre, extra] = figures[name];
  const result = drawn(sidc, standard, extra);
  placement[name + " left"] = [result.left, left];
  placement[name + " right"] = [result.right, right];
  placement[name + " top, inner and bottom"] = [result.centre, centre];
});

// What is wrong with a code or its text: errors and text rule warnings together.
const errors = (profile, sidc, options) => {
  const { modifierErrors, fieldWarnings } = profile.validate(
    sidc,
    options
  ).details;
  return modifierErrors.concat(fieldWarnings.map((item) => item.message));
};
const valid = (sidc, options, standard) =>
  new ms.Symbol(sidc, options || {}, { standard: standard }).isValid();
const flags = (profile, base, at, pad) =>
  probeOffers(
    profile,
    ["0", "1", "2", "4"],
    (digit) => patchSidc(base, at, digit, pad),
    base
  ).map((item) => item.offered);

export default {
  "Edition modifier placement": placement,
  "Edition selection": {
    "letter SIDCs with 2525 keep no APP-6(B) profile": [
      new ms.Symbol("SFGPUCI--------", { standard: "2525" }).metadata.profile,
      undefined
    ],
    "tactical graphics stay outside the APP-6(B) profile": [
      new ms.Symbol("GFGPGPUUD------", { standard: "APP6" }).metadata.profile,
      undefined
    ],
    "control measures stay outside the numeric profiles": [
      std2525eProfile.fields("13032500001101000000"),
      null
    ],
    "the Studio reads 15 and 16 as edition E": [
      ["15", "16", "13", "12"].map((code) => numericSidcEdition(code)),
      ["e", "e", "e", "d"]
    ]
  },
  "Separators and collapsed fields": {
    "APP-6(B) 0213.b joins J K with one space": [
      drawn("SFGPUCI--------", "APP6", {}).right.pop(),
      "J K P"
    ]
  },
  "The E descriptor is drawn once": {
    "APP-6(B) Joker with other text: in the E row": [
      new ms.Symbol("SJGPUCI--------", {
        standard: "APP6",
        staffComments: "HELLO"
      })
        .asSVG()
        .match(/>J<\/text>/g).length,
      1
    ],
    "APP-6(B) Joker alone: by the frame": [
      new ms.Symbol("SJGPUCI--------", { standard: "APP6" })
        .asSVG()
        .match(/>J<\/text>/g).length,
      1
    ],
    "2525C exercise equipment with text": [
      new ms.Symbol("SGGPEWM--------", {
        standard: "2525C",
        staffComments: "HELLO"
      })
        .asSVG()
        .match(/>X<\/text>/g).length,
      1
    ]
  },
  "Fields of a class": {
    "2525D unit has no quantity (Table VII)": [
      errors(std2525dProfile, "10031000001211000000", { quantity: "3" }).length,
      1
    ],
    "2525E unit has a quantity (Table VI)": [
      errors(std2525eProfile, "13031000001211000000", { quantity: "3" }),
      []
    ],
    "2525D equipment takes AQ and AR": [
      errors(std2525dProfile, "10031500001101000000", {
        guardedUnit: "BG",
        specialDesignator: "NRT"
      }),
      []
    ],
    "2525D equipment has no AS (Table VII, Figure D-5)": [
      std2525dProfile.unavailableReason("country", "10031500001101000000") !==
        "",
      true
    ],
    "APP-6(E) installation has AT and AX": [
      errors(app6eProfile, "16032000001101000000", {
        installationCapacity: "400 BEDS",
        installationComposition: "PROD"
      }),
      []
    ],
    "APP-6(E) cyberspace unit has AY": [
      errors(app6eProfile, "16036000001101000000", {
        networkIdentifier: "192.168.25.0"
      }),
      []
    ],
    "2525E has no AT": [
      errors(std2525eProfile, "13032000001101000000", {
        installationCapacity: "400 BEDS"
      }).length,
      1
    ],
    "APP-6(B) has no engagement bar": [
      errors(app6bProfile, "SFGPUCI--------", { engagementBar: "ENG" }).length,
      1
    ],
    "APP-6(B) installation takes Z (Table I), 2525C does not": [
      errors(app6bProfile, "SFGPIB---------", { speed: "20KTS" }),
      []
    ],
    "APP-6(B) L is hostile only": [
      app6bProfile.unavailableReason("signatureEquipment", "SFGPEWM--------"),
      "L is for hostile equipment (identity H only)"
    ]
  },
  "Values and lengths": {
    "2525D T takes 30 characters": [
      errors(std2525dProfile, "10031000001211000000", {
        uniqueDesignation: "X".repeat(31)
      }).length,
      1
    ],
    "APP-6(B) T takes 21 characters": [
      errors(app6bProfile, "SFGPUCI--------", {
        uniqueDesignation: "X".repeat(22)
      }).length,
      1
    ],
    "APP-6(B) X takes 6 characters": [
      errors(app6bProfile, "SFGPUCI--------", { altitudeDepth: "1500 FT" })
        .length,
      1
    ],
    "2525D W accepts the short form of 5.3.7.7": [
      errors(std2525dProfile, "10031000001211000000", { dtg: "031430ZNOV26" }),
      []
    ],
    "2525E W needs a four-digit year": [
      errors(std2525eProfile, "13031000001211000000", { dtg: "031430ZNOV26" })
        .length,
      1
    ],
    "2525E Y accepts the 22-character example of Table E-II": [
      errors(std2525eProfile, "13031000001211000000", {
        location: "3317.0921N 04412.6332E"
      }),
      []
    ],
    "APP-6(E) Y has a minimum of 12": [
      errors(app6eProfile, "16031000001211000000", { location: "38SMB" })
        .length,
      1
    ],
    "F is one character in edition E, the bracket form is accepted": [
      [
        errors(std2525eProfile, "13031000001211000000", {
          reinforcedReduced: "+"
        }).length,
        errors(std2525eProfile, "13031000001211000000", {
          reinforcedReduced: "(+)"
        }).length,
        errors(std2525dProfile, "10031000001211000000", {
          reinforcedReduced: "+"
        }).length
      ],
      [0, 0, 1]
    ],
    "2525 and APP-6(E) read L differently": [
      [
        std2525eProfile.unavailableReason(
          "signatureEquipment",
          "13031500001101000000"
        ),
        app6eProfile.unavailableReason(
          "signatureEquipment",
          "16031500001101000000"
        )
      ],
      ["hostile symbols only", ""]
    ],
    "AO follows the A:BBB-CC grammar": [
      [
        errors(std2525dProfile, "10031000001211000000", {
          engagementBar: "R:ENG-M"
        }).length,
        errors(std2525dProfile, "10031000001211000000", {
          engagementBar: "NOPE"
        }).length
      ],
      [0, 1]
    ],
    "APP-6(E) writes MT where 2525 writes M<T": [
      [
        errors(app6eProfile, "16031000001211000000", {
          engagementBar: "R:MT-M"
        }).length,
        errors(std2525eProfile, "13031000001211000000", {
          engagementBar: "R:M<T-M"
        }).length
      ],
      [0, 0]
    ],
    "target colours apply to hostile tracks": [
      errors(std2525eProfile, "13031000001211000000", {
        engagementBar: "ENG",
        engagementType: "TARGET"
      }).filter((text) => /hostile/.test(text)).length,
      1
    ]
  },
  "SIDC digits": {
    "2525D unit has no operational condition": [
      errors(std2525dProfile, "10031030001211000000").length,
      1
    ],
    "APP-6(B) has status A and P only": [
      ["P", "A", "C", "D", "X", "F"].map(
        (status) => errors(app6bProfile, "SFG" + status + "UCI--------").length
      ),
      [0, 0, 1, 1, 1, 1]
    ],
    "APP-6(B) draws no condition bar": [
      new ms.Symbol("SFGDUCI--------", { standard: "APP6" }).metadata.condition,
      ""
    ],
    "2525D unit: feint, HQ, task force": [
      flags(std2525dProfile, "10031000001211000000", 7, "0"),
      [true, true, true, true]
    ],
    "2525D equipment: Annex A defines every code": [
      flags(std2525dProfile, "10031500001101000000", 7, "0"),
      [true, true, true, true]
    ],
    "APP-6(E) air: Annex A defines every code": [
      flags(app6eProfile, "16030100001101000000", 7, "0"),
      [true, true, true, true]
    ],
    "task force HQ on a merchant ship is valid, with a note": [
      [
        [std2525eProfile, "130330060014010500000000000000"],
        [std2525dProfile, "100330060014010500000000000000"],
        [app6eProfile, "160330060014010500000000000000"],
        [app6dProfile, "100330060014010500000000000000"]
      ].map(([profile, sidc]) => {
        const result = profile.validate(sidc, {});
        return [
          result.valid,
          result.details.notes.some((text) => /eight codes/.test(text))
        ];
      }),
      [
        [true, true],
        [true, true],
        [true, true],
        [true, true]
      ]
    ],
    "HQ/task force/dummy 8 and 9 stay undefined": [
      [
        errors(std2525eProfile, "13033008001401050000").length,
        errors(std2525dProfile, "10033009001401050000").length
      ],
      [1, 1]
    ],
    "2525C task force on a ship is valid and drawn, with a note": [
      (() => {
        const symbol = new ms.Symbol("SFSPCLCC--E----", { standard: "2525C" });
        return [
          symbol.isValid(),
          symbol.metadata.taskForce,
          symbol.isValid(true).notes.some((text) => /D Task Force/.test(text))
        ];
      })(),
      [true, true, true]
    ],
    "2525D unit takes an echelon, not mobility": [
      [
        errors(std2525dProfile, "10031000161211000000").length,
        errors(std2525dProfile, "10031000331211000000").length
      ],
      [0, 1]
    ],
    "2525E unit takes mobility (Figure E-3)": [
      errors(std2525eProfile, "13031000331211000000"),
      []
    ],
    "leadership belongs to the dismounted individual": [
      [
        errors(std2525eProfile, "13032700711101000000").length,
        errors(std2525eProfile, "13031000711211000000").length
      ],
      [0, 1]
    ],
    "contexts 3-8 exist in edition E only": [
      [
        errors(std2525dProfile, "10331000001211000000").length,
        errors(std2525eProfile, "13331000001211000000").length,
        errors(app6eProfile, "16331000001211000000").length
      ],
      [1, 0, 0]
    ],
    "APP-6(B) task force is valid on every class, with a note off units": [
      [
        errors(app6bProfile, "SFGPUCI---E----").length,
        errors(app6bProfile, "SFGPEWM---E----").length,
        app6bProfile.validate("SFGPEWM---E----", {}).details.notes.length
      ],
      [0, 0, 1]
    ],
    "APP-6(B) mobility is for equipment": [
      [
        errors(app6bProfile, "SFGPEWM---MO---").length,
        errors(app6bProfile, "SFGPUCI---MO---").length
      ],
      [0, 1]
    ]
  },
  "Graphic amplifiers": {
    "APP-6(B) has Q and no AJ": [
      (() => {
        const controls = movementControls(
          app6bProfile,
          "SFGPUCI--------",
          "APP-6(B) Table I"
        );
        return [controls.direction.applies, controls.speedLeader.applies];
      })(),
      [true, false]
    ],
    "2525D installations have no Q": [
      movementControls(std2525dProfile, "10032000001101000000").direction
        .applies,
      false
    ],
    "2525E air uses AJ": [
      movementControls(std2525eProfile, "13030100001101000000").speedLeader
        .applies,
      true
    ],
    "2525E land units use Q and not AJ (Table VI AJ)": [
      (() => {
        const controls = movementControls(
          std2525eProfile,
          "13031000001211000000"
        );
        return [controls.direction.applies, controls.speedLeader.applies];
      })(),
      [true, false]
    ]
  },
  "Studio field tables": {
    "the edition's own name replaces the form's": [
      [
        editionField("2525e", "headquartersElement", {
          "2525e": [{ key: "headquartersElement", field: "AW", label: "x" }]
        }).field
      ],
      ["AW"]
    ],
    "map graphics are listed as gaps": [
      editorGaps({
        standardId: "2525d",
        profile: std2525dProfile,
        sidc: "10031000001211000000",
        tables: {},
        movement: null
      }).map((row) => row.field),
      ["S2", "AH", "AI", "AK"]
    ],
    "a symbol outside the profile lists no gaps": [
      editorGaps({
        standardId: "2525e",
        profile: std2525eProfile,
        sidc: "13032500001101000000",
        tables: {},
        movement: null
      }),
      []
    ]
  },
  "Valid symbols stay valid": {
    "no options": [
      [
        std2525dProfile.validate("10031000161211000000", {}).valid,
        std2525eProfile.validate("13031000161211000000", {}).valid,
        app6eProfile.validate("16031000161211000000", {}).valid,
        valid("SFGPUCI---F----", {}, "APP6")
      ],
      [true, true, true, true]
    ],
    "a full 2525D unit": [
      std2525dProfile.validate("10031000161211000000", {
        uniqueDesignation: "1/23 INF",
        dtg: "03143000ZNOV2026",
        speed: "220KPH",
        reinforcedReduced: "(+)",
        evaluationRating: "A1",
        combatEffectiveness: "FO"
      }).valid,
      true
    ]
  }
};
