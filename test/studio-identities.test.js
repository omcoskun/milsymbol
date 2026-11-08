import {
  identityList,
  contextOptions,
  identityCode,
  identityLabel,
  decodeIdentity,
  convertIdentity,
  contextLabel,
  isUsOnlyContext,
  usOnlyIdentityLabel
} from "../studio/identities.js";
import { app6dContexts } from "../studio/profiles/app6d.js";
import { app6eProfile } from "../studio/profiles/app6e.js";

const app6a = { id: "app6a", family: "legacy" };
const app6b = { id: "app6b", family: "legacy" };
const c2525 = { id: "2525c", family: "legacy" };
const d2525 = { id: "2525d", family: "modern" };
const e2525 = { id: "2525e", family: "modern" };
const d6 = { id: "app6d", family: "modern" };
const e6 = { id: "app6e", family: "modern" };
const codes = (standard, context) =>
  identityList(standard).map((entry) => identityCode(entry, standard, context));
const byValue = (standard, value) =>
  identityList(standard).find((entry) => entry.value === value);
const labelsIn = (standard) =>
  contextOptions(standard).map((option) => contextLabel(standard, option));
const digits = (standard) =>
  contextOptions(standard).map(([digit]) => digit);
// The contexts the APP-6(E) profile itself notes as US use only.
const notedByProfile = digits(e6).filter((digit) =>
  app6eProfile
    .validate(`16${digit}31000001211000000`, {})
    .details.notes.some((note) => note.includes("US use only"))
);

export default {
  "Studio identities": {
    "numeric editions offer all seven standard identities": [
      codes(e2525, "0").sort(),
      ["0", "1", "2", "3", "4", "5", "6"]
    ],
    "numeric pending is 0 and unknown is 1": [
      [byValue(d2525, "pending").numeric, byValue(d2525, "unknown").numeric],
      ["0", "1"]
    ],
    "numeric context does not change the identity digit": [
      codes(d2525, "1"),
      codes(d2525, "0")
    ],
    "letter editions offer the seven reality identities": [
      codes(c2525, "0"),
      ["F", "H", "N", "U", "P", "A", "S"]
    ],
    "letter exercise identities use G, W, M, D, L, J and K": [
      codes(app6b, "1"),
      ["D", "K", "L", "W", "G", "M", "J"]
    ],
    "APP-6A keeps its nine identities without exercise letters": [
      [codes(app6a, "0"), codes(app6a, "1")],
      [
        ["F", "H", "N", "U", "P", "A", "S", "J", "K"],
        ["F", "H", "N", "U", "P", "A", "S", "J", "K"]
      ]
    ],
    "exercise suspect and hostile are labelled Joker and Faker": [
      [
        identityLabel(byValue(e2525, "suspect"), "1"),
        identityLabel(byValue(e2525, "hostile"), "1"),
        identityLabel(byValue(e2525, "hostile"), "0"),
        identityLabel(byValue(e2525, "friend"), "1")
      ],
      ["Joker", "Faker", "Hostile", "Friend"]
    ],
    "context choices follow what each SIDC can encode": [
      [app6a, c2525, d2525].map((standard) =>
        contextOptions(standard).map(([value]) => value)
      ),
      [[], ["0", "1"], ["0", "1", "2"]]
    ],
    "letter exercise friend decodes to friend in exercise context": [
      decodeIdentity("D", c2525),
      { value: "friend", context: "1" }
    ],
    "2525C J decodes as exercise suspect": [
      decodeIdentity("J", c2525),
      { value: "suspect", context: "1" }
    ],
    "APP-6A J stays a joker identity": [
      decodeIdentity("J", app6a),
      { value: "joker", context: "0" }
    ],
    "numeric identity keeps the SIDC context": [
      decodeIdentity("6", e2525, "2"),
      { value: "hostile", context: "2" }
    ],
    "unknown identity codes are not decoded": [
      [
        decodeIdentity("X", c2525),
        decodeIdentity("G", app6a),
        decodeIdentity("7", d2525)
      ],
      [null, null, null]
    ],
    "APP-6A joker becomes exercise suspect elsewhere": [
      convertIdentity({ value: "joker", context: "0" }, c2525),
      { value: "suspect", context: "1" }
    ],
    "exercise hostile becomes the APP-6A faker": [
      convertIdentity({ value: "hostile", context: "1" }, app6a),
      { value: "faker", context: "0" }
    ],
    "exercise friend has no APP-6A form and becomes friend": [
      convertIdentity({ value: "friend", context: "1" }, app6a),
      { value: "friend", context: "0" }
    ],
    "simulation has no letter form": [
      convertIdentity({ value: "neutral", context: "2" }, c2525),
      { value: "neutral", context: "0" }
    ],
    "numeric editions keep exercise and simulation": [
      convertIdentity({ value: "pending", context: "2" }, d2525),
      { value: "pending", context: "2" }
    ],
    "imported identity codes fall back to friend": [
      convertIdentity({ value: "code:X", context: "0" }, d2525),
      { value: "friend", context: "0" }
    ]
  },
  "US only contexts and identities": {
    "APP-6E labels every context of Table A-2 note 1": [
      labelsIn(e6),
      [
        "Reality",
        "Exercise (US only)",
        "Simulation (US only)",
        "Restricted target",
        "No-strike entity",
        "Restricted target, exercise (US only)",
        "No-strike entity, exercise (US only)",
        "Restricted target, simulation (US only)",
        "No-strike entity, simulation (US only)"
      ]
    ],
    "APP-6D keeps its labels": [
      labelsIn(d6),
      ["Reality", "Exercise (US only)", "Simulation (US only)"]
    ],
    "MIL-STD-2525E has no such note": [
      labelsIn(e2525).some((label) => label.includes("US only")),
      false
    ],
    "the APP-6E list matches the notes of its profile": [
      digits(e6).filter((digit) => isUsOnlyContext(e6, digit)),
      notedByProfile
    ],
    "the APP-6D list matches its context table": [
      digits(d6).filter((digit) => isUsOnlyContext(d6, digit)),
      app6dContexts.filter((item) => item.note).map((item) => item.digit)
    ],
    "Joker is marked in APP-6E": [
      usOnlyIdentityLabel(e6, "Joker"),
      "Joker (US only)"
    ],
    "Faker is marked in APP-6D": [
      usOnlyIdentityLabel(d6, "Faker"),
      "Faker (US only)"
    ],
    "other identities are not": [usOnlyIdentityLabel(e6, "Hostile"), "Hostile"],
    "Joker is not marked in 2525E": [
      usOnlyIdentityLabel(e2525, "Joker"),
      "Joker"
    ]
  }
};
