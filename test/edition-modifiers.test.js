// Rules of the APP-6(B), MIL-STD-2525C/D/E, APP-6(D) and APP-6(E) profiles,
// which the Studio runs (citations in docs/edition-modifiers.md). The library
// draws these editions as upstream milsymbol 3.0.5.
import { app6dProfile } from "../studio/profiles/app6d.js";
import { app6bProfile } from "../studio/profiles/app6b.js";
import { std2525cProfile } from "../studio/profiles/std2525c.js";
import { app6eProfile } from "../studio/profiles/app6e.js";
import { std2525dProfile } from "../studio/profiles/std2525d.js";
import { std2525eProfile } from "../studio/profiles/std2525e.js";
import {
  editionField,
  editorGaps,
  movementControls,
  probeOffers,
  patchSidc
} from "../studio/profile-controls.js";
import { numericSidcEdition } from "../studio/sidc-editor.js";

// What is wrong with a code or its text: errors and text rule warnings together.
const errors = (profile, sidc, options) => {
  const { modifierErrors, fieldWarnings } = profile.validate(
    sidc,
    options
  ).details;
  return modifierErrors.concat(fieldWarnings.map((item) => item.message));
};
const flags = (profile, base, at, pad) =>
  probeOffers(
    profile,
    ["0", "1", "2", "4"],
    (digit) => patchSidc(base, at, digit, pad),
    base
  ).map((item) => item.offered);

export default {
  "Edition selection": {
    "control measures stay outside the numeric profiles": [
      std2525eProfile.fields("13032500001101000000"),
      null
    ],
    "the Studio reads 15 and 16 as edition E": [
      ["15", "16", "13", "12"].map((code) => numericSidcEdition(code)),
      ["e", "e", "e", "d"]
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
    "2525C task force on a ship is valid, with a note": [
      (() => {
        const result = std2525cProfile.validate("SFSPCLCC--E----", {});
        return [
          result.valid,
          result.details.notes.some((text) => /D Task Force/.test(text))
        ];
      })(),
      [true, true]
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
        app6bProfile.validate("SFGPUCI---F----", {}).valid
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
