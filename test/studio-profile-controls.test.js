import {
  profileErrors,
  probeOffers,
  patchSidc,
  shortReason,
  classWords,
  sectorChoices,
  parseEngagement,
  composeEngagement,
  engagementOptions,
  fieldMeaning,
  meaningChange,
  carryWarnings,
  fieldRule,
  explainUnavailable,
  humanize,
  profileExtraFields,
  profileDetailLines
} from "../studio/profile-controls.js";
import { profileFieldStates } from "../studio/editor-helpers.js";
import { textModifiers } from "../studio/modifier-fields.js";
import { std2525cProfile } from "../studio/profiles/std2525c.js";
import { app6aProfile } from "../src/modifierprofiles/app6a.js";
import {
  app6dProfile,
  app6dEngagementError,
  app6dIdentities,
  app6dStatuses
} from "../studio/profiles/app6d.js";
import * as sectors from "../studio/profiles/app6d-sectors.js";

const offered = (profile, items, sidcFor, baseline) =>
  probeOffers(profile, items, sidcFor, baseline)
    .filter((entry) => entry.offered)
    .map((entry) => entry.item);
const numeric = (
  set,
  {
    entity = "121100",
    context = "0",
    identity = "3",
    status = "0",
    hq = "0",
    amplifier = "00",
    s1 = "00",
    s2 = "00"
  } = {}
) =>
  `10${context}${identity}${set}${status}${hq}${amplifier}${entity}${s1}${s2}0000000000`;
const keys = (states) =>
  Object.fromEntries(states.map((state) => [state.key, state]));

const identities2525 = "PUAFNSHGWMDLJK".split("");
const identityOffers = (sidc) =>
  offered(std2525cProfile, identities2525, (code) => patchSidc(sidc, 1, code));
const statusOffers = (sidc) =>
  offered(std2525cProfile, "APCDXF".split(""), (code) =>
    patchSidc(sidc, 3, code)
  );

const landUnitStatuses = offered(
  app6dProfile,
  app6dStatuses.map((s) => s.digit),
  (digit) => patchSidc(numeric("10"), 6, digit)
);
const equipmentStatuses = offered(
  app6dProfile,
  app6dStatuses.map((s) => s.digit),
  (digit) => patchSidc(numeric("15", { entity: "110000" }), 6, digit)
);

const flagOffer = (profile, sidc, index, digit) =>
  probeOffers(
    profile,
    [digit],
    (value) => patchSidc(sidc, index, value, "0"),
    sidc
  )[0].offered;

const sector1 = (set, entity, extra = {}) =>
  sectorChoices({
    profile: app6dProfile,
    sectors,
    sidc: numeric(set, { entity, ...extra }),
    set,
    sector: 1,
    start: 16,
    current: extra.s1 || "00"
  });
const byCode = (choices) =>
  Object.fromEntries(choices.entries.map((entry) => [entry.code, entry]));

const states = (profile, sidc) =>
  profileFieldStates(textModifiers, profile, sidc);

export default {
  "Studio profile controls": {
    "errors of a clean code are empty": [
      profileErrors(std2525cProfile, "SFGPUCI--------"),
      []
    ],
    "no profile means no errors": [profileErrors(null, "SFGPUCI--------"), []],
    "errors come from every *Errors list": [
      [
        profileErrors(app6aProfile, "SOGP-----------").length > 0,
        profileErrors(app6aProfile, "SFGPUCI---K-").length > 0
      ],
      [true, true]
    ],
    "2525C unknown dimension offers no D L M J K": [
      identityOffers("SFZP-----------"),
      "PUAFNSHGW".split("")
    ],
    "2525C ground dimension offers every identity": [
      identityOffers("SFGPUCI--------").length,
      14
    ],
    "2525C unit offers only present and planned": [
      statusOffers("SFGPUCI--------"),
      ["A", "P"]
    ],
    "2525C equipment offers all six statuses": [
      statusOffers("SFGPEVAT-------"),
      "APCDXF".split("")
    ],
    "a shared unrelated error does not hide every value": [
      offered(std2525cProfile, "APCDXF".split(""), (code) =>
        patchSidc("SFGPUCI--ZZ---", 3, code)
      ).length,
      2
    ],
    "2525C unit: task force is allowed, mobility is not": [
      [
        flagOffer(std2525cProfile, "SFGPUCI--------", 10, "E"),
        flagOffer(std2525cProfile, "SFGPUCI--------", 10, "A"),
        offered(
          std2525cProfile,
          ["MO", "NS"],
          (code) => patchSidc("SFGPUCI--------", 10, code),
          "SFGPUCI--------"
        )
      ],
      [true, true, []]
    ],
    "2525C equipment: task force, mobility and towed array are all allowed":
      [
        [
          flagOffer(std2525cProfile, "SFGPEVAT-------", 10, "E"),
          flagOffer(std2525cProfile, "SFGPEVAT-------", 10, "A"),
          offered(
            std2525cProfile,
            ["MO", "NS"],
            (code) => patchSidc("SFGPEVAT-------", 10, code),
            "SFGPEVAT-------"
          )
        ],
        [true, true, ["MO", "NS"]]
      ],
    "2525C equipment: echelons are hidden": [
      offered(
        std2525cProfile,
        ["-A", "-B", "-H"],
        (code) => patchSidc("SFGPEVAT-------", 10, code),
        "SFGPEVAT-------"
      ),
      []
    ],
    "2525C unit: echelons are offered": [
      offered(
        std2525cProfile,
        ["-A", "-B", "-H"],
        (code) => patchSidc("SFGPUCI--------", 10, code),
        "SFGPUCI--------"
      ),
      ["-A", "-B", "-H"]
    ],
    "APP-6D land unit offers status 0 and 1 only": [
      landUnitStatuses,
      ["0", "1"]
    ],
    "APP-6D equipment offers every status 0-5": [
      equipmentStatuses,
      ["0", "1", "2", "3", "4", "5"]
    ],
    "APP-6D offers identities 0-6": [
      offered(
        app6dProfile,
        app6dIdentities.map((i) => i.digit),
        (digit) => patchSidc(numeric("10"), 3, digit)
      ),
      ["0", "1", "2", "3", "4", "5", "6"]
    ],
    "APP-6D Own Ship accepts the Friend identity only": [
      offered(
        app6dProfile,
        app6dIdentities.map((i) => i.digit),
        (digit) => patchSidc(numeric("30", { entity: "150000" }), 3, digit)
      ),
      ["3"]
    ],
    "APP-6D land unit: HQ, task force and dummy are all offered": [
      ["1", "2", "4"].map((digit) =>
        flagOffer(app6dProfile, numeric("10"), 7, digit)
      ),
      [true, true, true]
    ],
    "APP-6D land equipment: Annex A defines all three": [
      ["1", "2", "4"].map((digit) =>
        flagOffer(app6dProfile, numeric("15", { entity: "110000" }), 7, digit)
      ),
      [true, true, true]
    ],
    "APP-6D installation: Annex A defines all three": [
      ["1", "2", "4"].map((digit) =>
        flagOffer(app6dProfile, numeric("20", { entity: "110000" }), 7, digit)
      ),
      [true, true, true]
    ],
    "APP-6D air: Annex A defines all three": [
      ["1", "2", "4"].map((digit) =>
        flagOffer(app6dProfile, numeric("01", { entity: "110000" }), 7, digit)
      ),
      [true, true, true]
    ],
    "APP-6D equipment: mobility yes, echelon no, towed array no": [
      offered(
        app6dProfile,
        ["11", "31", "61"],
        (code) => patchSidc(numeric("15", { entity: "110000" }), 8, code, "0"),
        numeric("15", { entity: "110000" })
      ),
      ["31"]
    ],
    "APP-6D sea surface: towed array yes": [
      offered(
        app6dProfile,
        ["11", "31", "61"],
        (code) => patchSidc(numeric("30", { entity: "110000" }), 8, code, "0"),
        numeric("30", { entity: "110000" })
      ),
      ["61"]
    ],
    "patchSidc pads short codes and keeps the tail": [
      [
        patchSidc("SFG", 3, "P"),
        patchSidc("10031000", 6, "5", "0"),
        patchSidc("ABCDEF", 2, "xy")
      ],
      ["SFGP", "10031050", "ABxyEF"]
    ],
    "shortReason drops the trailing source and keeps inner words": [
      [
        shortReason(
          "D Task Force is a unit modifier; not applicable to equipment (Table IV)"
        ),
        shortReason(
          "HQ/task force/dummy 2 is not defined for landEquipment (Tables 3-2: AB feint/dummy (units))"
        ),
        shortReason("(only a source)"),
        shortReason("plain")
      ],
      [
        "D Task Force is a unit modifier; not applicable to equipment",
        "HQ/task force/dummy 2 is not defined for landEquipment",
        "(only a source)",
        "plain"
      ]
    ],
    "class names read as words": [
      classWords("landEquipment"),
      "land equipment"
    ],
    "camelCase in a reason reads as words": [
      humanize("not defined for landUnit; towedArray amplifier"),
      "not defined for land unit; towed array amplifier"
    ],
    "unavailable reason: short sentence, full wording kept": (() => {
      const country = keys(states(app6dProfile, numeric("10"))).country;
      const text = explainUnavailable(country, []);
      return {
        "short has no source": [
          text.short,
          "country is not defined for land unit"
        ],
        "full keeps the source": [/Figure 3-3/.test(text.full), true]
      };
    })()
  },

  "Studio profile controls: sectors": {
    "Land Unit sector 1 lists defined codes only, vertical placement": [
      (() => {
        const choices = sector1("10", "121100");
        const map = byCode(choices);
        return [
          map["01"].name,
          "00" in map,
          "71" in map,
          "99" in map,
          choices.placement,
          choices.table
        ];
      })(),
      [
        "Air Mobile/Air Assault",
        false,
        false,
        false,
        "top",
        "Table A-20, PDF 750-751-752"
      ]
    ],
    "Air Missile sectors sit left and right": [
      [
        sectorChoices({
          profile: app6dProfile,
          sectors,
          sidc: numeric("02", { entity: "110000" }),
          set: "02",
          sector: 1,
          start: 16,
          current: "00"
        }).placement,
        sectorChoices({
          profile: app6dProfile,
          sectors,
          sidc: numeric("02", { entity: "110000" }),
          set: "02",
          sector: 2,
          start: 18,
          current: "00"
        }).placement
      ],
      ["left", "right"]
    ],
    "Air rotary-wing codes are disabled for a fixed-wing entity": [
      (() => {
        const map = byCode(sector1("01", "110100"));
        return [
          map["38"].offered,
          map["38"].reason.length > 0,
          map["01"].offered
        ];
      })(),
      [false, true, true]
    ],
    "Air rotary-wing codes are enabled for a rotary-wing entity": [
      (() => {
        const map = byCode(sector1("01", "110200"));
        return [map["38"].offered, map["39"].offered];
      })(),
      [true, true]
    ],
    "Land Equipment has no sector 2 dictionary": [
      sectorChoices({
        profile: app6dProfile,
        sectors,
        sidc: numeric("15", { entity: "110000" }),
        set: "15",
        sector: 2,
        start: 18,
        current: "00"
      }).dictionary,
      null
    ],
    "Mine Warfare has no sector dictionary at all": [
      [
        sectorChoices({
          profile: app6dProfile,
          sectors,
          sidc: numeric("36", { entity: "110000" }),
          set: "36",
          sector: 1,
          start: 16,
          current: "00"
        }).dictionary,
        sectorChoices({
          profile: app6dProfile,
          sectors,
          sidc: numeric("36", { entity: "110000" }),
          set: "36",
          sector: 2,
          start: 18,
          current: "00"
        }).dictionary
      ],
      [null, null]
    ],
    "a reserved current code is reported, not offered": [
      (() => {
        const choices = sector1("10", "121100", { s1: "71" });
        return [choices.status, byCode(choices)["71"]];
      })(),
      ["reserved", undefined]
    ],
    "Subsurface submarine codes need a submarine entity": [
      (() => {
        const sub = byCode(sector1("35", "110100"));
        const other = byCode(sector1("35", "120100"));
        return [sub["08"].offered, other["08"].offered];
      })(),
      [true, false]
    ],
    "a sector error elsewhere does not disable every code": [
      byCode(sector1("10", "121100", { s2: "71" }))["01"].offered,
      true
    ]
  },

  "Studio profile controls: engagement bar": {
    "A:BBB-CC splits into three parts": [
      parseEngagement("R:ENG-M"),
      { a: "R", b: "ENG", c: "M" }
    ],
    "a local engagement has no source part": [
      parseEngagement("ENG-GN"),
      { a: "", b: "ENG", c: "GN" }
    ],
    "a stage with no weapon": [
      parseEngagement("CF"),
      { a: "", b: "CF", c: "" }
    ],
    "the multiple-engagement stage keeps its count": [
      parseEngagement("B:MLT-12"),
      { a: "B", b: "MLT", c: "12" }
    ],
    "empty text parses to empty parts": [
      parseEngagement(""),
      { a: "", b: "", c: "" }
    ],
    "compose rebuilds the grammar": [
      [
        composeEngagement({ a: "R", b: "ENG", c: "M" }),
        composeEngagement({ a: "", b: "CF", c: "" }),
        composeEngagement({ a: "R", b: "", c: "M" })
      ],
      ["R:ENG-M", "CF", ""]
    ],
    "round trip of a valid value is lossless": [
      composeEngagement(parseEngagement("B:MLT-12")),
      "B:MLT-12"
    ],
    "options come from the profile parts": (() => {
      const field = app6dProfile
        .fields(numeric("10"))
        .find((item) => item.key === "engagementBar");
      const options = engagementOptions(field.parts, app6dEngagementError);
      return {
        "sources are R and B": [
          options.sources.map((entry) => entry[0]),
          ["R", "B"]
        ],
        "stages include MLT": [
          options.stages.some((entry) => entry[0] === "MLT"),
          true
        ],
        "weapons include M": [
          options.weapons.some((entry) => entry[0] === "M"),
          true
        ],
        "counts run 02 to 99 as the grammar allows": [
          [
            options.counts[0][0],
            options.counts[options.counts.length - 1][0],
            options.counts.length
          ],
          ["02", "99", 98]
        ]
      };
    })()
  },

  "Studio profile controls: text carried between editions": {
    "same code, same words, no change": [
      meaningChange(
        { field: "G", label: "Staff comments", choices: null },
        { field: "G", label: "Staff Comments", choices: null }
      ),
      ""
    ],
    "reworded label sharing a word is not a change": [
      meaningChange(
        { field: "N", label: "Hostile indicator (ENY)", choices: null },
        { field: "N", label: "Hostile (enemy)", choices: null }
      ),
      ""
    ],
    "K unit effectiveness is not installation capacity": [
      meaningChange(
        { field: "K", label: "Combat effectiveness", choices: null },
        { field: "K", label: "Capacity of installation", choices: null }
      ),
      '"Combat effectiveness" is now "Capacity of installation"'
    ],
    "IFF/SIF is not AIS": [
      meaningChange(
        { field: "P", label: "IFF/SIF", choices: null },
        {
          field: "P",
          label: "AIS (automatic identification system)",
          choices: null
        }
      ),
      '"IFF/SIF" is now "AIS (automatic identification system)"'
    ],
    "a changed closed list is a change": [
      meaningChange(
        {
          field: "K",
          label: "Combat effectiveness",
          choices: ["fo", "no", "so"]
        },
        {
          field: "K",
          label: "Combat effectiveness",
          choices: ["fully operational", "not operational"]
        }
      ),
      "its list of allowed values changed"
    ],
    "a closed list against free text is not a change": [
      meaningChange(
        { field: "J", label: "Evaluation rating", choices: ["a1"] },
        { field: "J", label: "Evaluation rating", choices: null }
      ),
      ""
    ],
    "different field codes are a change": [
      meaningChange(
        { field: "C", label: "Quantity", choices: null },
        { field: "B", label: "Quantity", choices: null }
      ),
      "field C is now field B"
    ],
    "meaning keeps lower-cased sorted values": [
      fieldMeaning({ field: "K", label: "K", choices: [["FO", "Fully"], "NO"] })
        .choices,
      ["fo", "no"]
    ],
    "APP-6D equipment K typed for units warns when read by installations":
      (() => {
        const equipment = keys(
          states(app6dProfile, numeric("15", { entity: "110000" }))
        );
        const installation = keys(
          states(app6dProfile, numeric("20", { entity: "110000" }))
        );
        const warnings = carryWarnings({
          states: Object.values(installation),
          values: { combatEffectiveness: "Fully Operational" },
          origins: {
            combatEffectiveness: {
              meaning: fieldMeaning(equipment.combatEffectiveness),
              where: "APP-6D land equipment"
            }
          }
        });
        return {
          "one warning": [warnings.length, 1],
          "kind is changed": [warnings[0].kind, "changed"],
          "names where it was typed": [
            /APP-6D land equipment/.test(warnings[0].message),
            true
          ]
        };
      })(),
    "AC country text on Land Unit is kept but not drawn": (() => {
      const unit = states(app6dProfile, numeric("10"));
      const warnings = carryWarnings({
        states: unit,
        values: { country: "TUR" },
        origins: {},
        extras: profileExtraFields(
          app6dProfile,
          numeric("10"),
          textModifiers.map((field) => field.key)
        )
      });
      return {
        "one inactive warning": [
          warnings.map((item) => [item.key, item.kind]),
          [["country", "inactive"]]
        ],
        "the text is reported unchanged": [warnings[0].value, "TUR"],
        "reason comes from the profile": [
          /installation graphic block/.test(warnings[0].message),
          true
        ]
      };
    })(),
    "AC country text on equipment has no warning": [
      carryWarnings({
        states: states(app6dProfile, numeric("15", { entity: "110000" })),
        values: { country: "TUR" },
        origins: {}
      }),
      []
    ],
    "empty values never warn": [
      carryWarnings({
        states: states(app6dProfile, numeric("10")),
        values: { country: "" },
        origins: {}
      }),
      []
    ]
  },

  "Studio profile controls: field metadata": {
    "APP-6D country demands three letters": (() => {
      const country = keys(
        states(app6dProfile, numeric("15", { entity: "110000" }))
      ).country;
      return {
        "rule text": [
          fieldRule(country, "").hint,
          "exactly 3 characters; three-letter geographical entity code (STANAG 1059)"
        ],
        "short value is a problem": [
          fieldRule(country, "TU").problem.length > 0,
          true
        ],
        "three letters pass": [fieldRule(country, "TUR").problem, ""],
        "digits fail the pattern": [
          fieldRule(country, "T1R").problem.length > 0,
          true
        ]
      };
    })(),
    "APP-6D evaluation rating pattern": (() => {
      const rating = keys(states(app6dProfile, numeric("10"))).evaluationRating;
      return {
        "A1 passes": [fieldRule(rating, "A1").problem, ""],
        "G9 fails": [fieldRule(rating, "G9").problem.length > 0, true]
      };
    })(),
    "metadata passes through the field states": (() => {
      const unit = keys(states(app6dProfile, numeric("10")));
      const equipment = keys(
        states(app6dProfile, numeric("15", { entity: "110000" }))
      );
      return {
        "alternates on F": [
          unit.reinforcedReduced.alternates.includes("(+)"),
          true
        ],
        "examples on Land Unit AR": [
          unit.specialDesignator.examples,
          ["NRT", "SIG"]
        ],
        "AO parts": [
          unit.engagementBar.parts.map((part) => part.name),
          ["A", "BBB", "CC"]
        ],
        "AO is a nonBlocking tension on equipment": [
          [
            equipment.engagementBar.nonBlocking,
            /D-EQ-AO/.test(equipment.engagementBar.unresolved)
          ],
          [true, true]
        ]
      };
    })(),
    "Land Unit AC installation block is listed as unsupported": [
      profileExtraFields(
        app6dProfile,
        numeric("10"),
        textModifiers.map((field) => field.key)
      ).map((item) => [item.key, item.field]),
      [["installationIndicator", "AC"]]
    ],
    "no unsupported fields on equipment": [
      profileExtraFields(
        app6dProfile,
        numeric("15", { entity: "110000" }),
        textModifiers.map((field) => field.key)
      ),
      []
    ],
    "a null profile lists nothing": [profileExtraFields(null, "x", []), []]
  },

  "Studio profile controls: detail lines": {
    "notes collapse duplicates": [
      profileDetailLines({ notes: ["a", "a", "b"] }).notes,
      ["a", "b"]
    ],
    "unresolved items show id and detail": [
      profileDetailLines({
        unresolved: [{ id: "D-SUB19", detail: "conflict" }]
      }).unresolved,
      ["D-SUB19: conflict"]
    ],
    "version extension names the position": [
      /status \(position 7\).*code 9/.test(
        profileDetailLines({
          versionExtension: [{ position: "status", code: "9" }]
        }).versionExtension[0]
      ),
      true
    ],
    "missing details are empty": [
      profileDetailLines(undefined),
      { notes: [], unresolved: [], versionExtension: [] }
    ],
    "the real profile reports a version extension flag": [
      profileDetailLines(
        app6dProfile.validate(numeric("10", { status: "9" }), {}).details
      ).versionExtension.length,
      1
    ]
  }
};
