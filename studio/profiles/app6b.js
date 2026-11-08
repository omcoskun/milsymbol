// APP-6(B) symbol modifier profile for scheme S warfighting symbols. Active when
// a letter SIDC is rendered with the APP6 standard (APP-6A has its own edition).
// See common.js.
//
// Sources (physical PDF page / printed page):
//   Table I   fields, U/E/I applicability and lengths  PDF 30-32 / 2-8..2-10
//   Figure 5  field positions                          PDF 33 / 2-11
//   0213.b    arrangement and single-space joining     PDF 38 / 2-16
//   Table B-I SIDC positions 1-4                       PDF 104 / B-2
//   Table B-II SIDC positions 11-12                    PDF 105-107 / B-3..B-5
// Scope is the S scheme only. Every other scheme keeps its current rendering.
import { isBlank } from "./common.js";

const CLASSES = ["unit", "equipment", "installation"];
// Table B-I. G, W, D, L and M are not in it; the Studio still offers them (the
// exercise context), so they are reported as a note and not as an error.
const IDENTITIES = "PUAFNSHJKO";
const EXERCISE_IDENTITIES = "GWDLM";
const DIMENSIONS = "PAGSUFX";
const STATUSES = "AP";
// Field E (Table I): "J": Joker, "K": Faker.
const DESCRIPTORS = { J: "J", K: "K" };
const PAIRS = [];
"ABCDEF"
  .split("")
  .forEach((r) => "123456".split("").forEach((c) => PAIRS.push(r + c)));

// Table I: [field, title, U, E, I, option key, support]. Numbers are maximum
// characters, "G" a graphic, null the dash. support: "text" | "choice" | "option"
// (graphic option) | "sidc" (derived from the SIDC).
const TABLE_I = [
  ["C", "Quantity of equipment", null, 9, null, "quantity", "text"],
  ["F", "Reinforced or detached", 3, null, null, "reinforcedReduced", "choice"],
  ["G", "Staff comments", 20, 20, 20, "staffComments", "text"],
  ["H", "Additional information", 20, 20, 20, "additionalInformation", "text"],
  ["J", "Evaluation rating", 2, 2, 2, "evaluationRating", "choice"],
  ["K", "Combat effectiveness", 5, null, 5, "combatEffectiveness", "text"],
  ["L", "Signature equipment", null, 1, null, "signatureEquipment", "choice"],
  ["M", "Higher formation", 21, null, null, "higherFormation", "text"],
  ["N", "Hostile (enemy)", null, 3, null, "hostile", "choice"],
  ["P", "IFF/SIF", 5, 5, 5, "iffSif", "text"],
  ["Q", "Direction of movement indicator", 4, 4, 4, "direction", "option"],
  ["T", "Unique designation", 21, 21, 21, "uniqueDesignation", "text"],
  ["V", "Type of equipment", null, 24, null, "type", "text"],
  ["W", "Date/time group", 14, 14, 14, "dtg", "text"],
  ["X", "Altitude/depth", 6, 6, 6, "altitudeDepth", "text"],
  ["Y", "Location", 19, 19, 19, "location", "text"],
  ["Z", "Speed", 8, 8, 8, "speed", "text"],
  [
    "AA",
    "Special C2 headquarters",
    9,
    null,
    null,
    "specialHeadquarters",
    "text"
  ]
].map(([field, title, u, e, i, key, support]) => ({
  field: field,
  title: title,
  label: title,
  limits: [u, e, i],
  key: key,
  support: support
}));
export const app6bTableI = TABLE_I;

const BY_KEY = {};
TABLE_I.forEach((entry) => {
  BY_KEY[entry.key] = entry;
});

export const app6bChoices = {
  reinforcedReduced: ["(+)", "(-)", "(±)"],
  evaluationRating: PAIRS,
  signatureEquipment: ["!"],
  hostile: ["ENY"]
};

// Options of later editions: no APP-6(B) Table I row.
const LATER_KEYS = [
  "sigint",
  "country",
  "platformType",
  "equipmentTeardownTime",
  "commonIdentifier",
  "auxiliaryEquipmentIndicator",
  "headquartersElement",
  "installationComposition",
  "installationCapacity",
  "networkIdentifier",
  "engagementBar",
  "guardedUnit",
  "specialDesignator"
];

function normalize(sidc) {
  return String(sidc == null ? "" : sidc)
    .toUpperCase()
    .replace(/\*/g, "-")
    .replace(/ /g, "");
}

// Table I has three symbol columns. G Ground: the function ID says installation
// (I), equipment (E) or unit. P A S U: platforms, equipment. F SOF: Table B-VIII
// lists SOF units. Anything else has no column. Non-S schemes return "".
export function app6bSymbolClass(sidc) {
  sidc = normalize(sidc);
  if (sidc.charAt(0) !== "S") return "";
  const dimension = sidc.charAt(2);
  if (dimension === "G") {
    const first = sidc.charAt(4);
    return first === "I"
      ? "installation"
      : first === "E"
        ? "equipment"
        : "unit";
  }
  if ("PASU".indexOf(dimension) > -1) return "equipment";
  if (dimension === "F") return "unit";
  return "unknown";
}

function limitOf(entry, cls) {
  const index = CLASSES.indexOf(cls);
  if (index > -1) return entry.limits[index];
  return entry.limits.some((value) => value === null) ? null : entry.limits[0];
}

// L: "hostile equipment only" (Table I). H is the identity the table names; the
// same reading as APP-6A and 2525C.
function applicable(key, sidc) {
  const entry = BY_KEY[key];
  if (!entry) return false;
  const limit = limitOf(entry, app6bSymbolClass(sidc));
  return (
    limit !== null && (key !== "signatureEquipment" || sidc.charAt(1) === "H")
  );
}

// SIDC positions 11-12 (Table B-II) against the class of Table I. B is listed
// for equipment and installations with a number and a G, so an echelon stays
// allowed on them; R (mobility) has one column.
export function app6bModifierRules(sidc, notes = []) {
  sidc = normalize(sidc);
  const a = sidc.charAt(10) || "-";
  const b = sidc.charAt(11) || "-";
  const code = a + b;
  const cls = app6bSymbolClass(sidc);
  const errors = [];
  if (!/^(?:[-A-G][-A-M]|H[-B]|M[-O-Y]|N[SL]|S-)$/.test(code))
    errors.push("SIDC 11-12 " + code + ": not a Table B-II code");
  else if (
    "BDEG".indexOf(a) > -1 &&
    (cls === "equipment" || cls === "installation")
  )
    // Table I gives D to units; the note of Table B-II lets any symbol fill 11-12.
    notes.push(
      "D Task force on " +
        cls +
        ": valid and drawn, the note of Table B-II PDF 105/B-3 lets positions 11-12 be filled; Table I PDF 30/2-8 gives D to units"
    );
  else if ("MN".indexOf(a) > -1 && cls !== "equipment" && cls !== "unknown")
    errors.push(
      "R Mobility is an equipment modifier; not applicable to " +
        cls +
        " (Table I)"
    );
  return errors;
}

export function app6bFields(sidc) {
  sidc = normalize(sidc);
  if (sidc.charAt(0) !== "S") return null;
  const cls = app6bSymbolClass(sidc);
  return TABLE_I.filter((entry) => applicable(entry.key, sidc)).map(
    (entry) => ({
      key: entry.key,
      field: entry.field,
      label: entry.title,
      maxLength: entry.support === "option" ? null : limitOf(entry, cls),
      kind:
        entry.support === "option"
          ? "graphic"
          : entry.support === "choice"
            ? "choice"
            : "text",
      choices: app6bChoices[entry.key] || null
    })
  );
}

export function app6bValidate(sidc, options) {
  sidc = normalize(sidc);
  options = options || {};
  const errors = [];
  const notes = [];
  const warnings = [];
  const details = {
    modifierErrors: errors,
    fieldWarnings: warnings,
    notes: notes
  };
  if (sidc.charAt(0) !== "S") return { valid: true, details: details };
  const identity = sidc.charAt(1);
  const dimension = sidc.charAt(2);
  const status = sidc.charAt(3);
  const cls = app6bSymbolClass(sidc);
  if (EXERCISE_IDENTITIES.indexOf(identity) > -1 && identity !== "")
    notes.push(
      "Identity " +
        identity +
        " is an exercise identity of MIL-STD-2525; Table B-I PDF 104/B-2 does not list it"
    );
  else if (IDENTITIES.indexOf(identity) < 0 || identity === "")
    errors.push("SIDC 2 " + identity + ": not a Table B-I affiliation");
  if (dimension === "Z")
    notes.push(
      "Battle dimension Z is a MIL-STD-2525 code; Table B-I PDF 104/B-2 does not list it"
    );
  else if (DIMENSIONS.indexOf(dimension) < 0 || dimension === "")
    errors.push("SIDC 3 " + dimension + ": not a Table B-I battle dimension");
  if (STATUSES.indexOf(status) < 0 || status === "")
    errors.push("SIDC 4 " + status + ": Table B-I has status A and P only");
  app6bModifierRules(sidc, notes).forEach((message) => errors.push(message));

  TABLE_I.forEach((entry) => {
    const key = entry.key;
    const value = options[key];
    if (isBlank(value)) return;
    if (!applicable(key, sidc)) {
      errors.push(
        entry.field +
          " " +
          key +
          ": not applicable to " +
          (cls === "unknown" ? "this symbol" : cls + " symbols") +
          (key === "signatureEquipment"
            ? " (L is for hostile equipment, identity H only)"
            : " (Table I)")
      );
      return;
    }
    if (entry.support === "option") return;
    // The text is drawn either way: a broken rule is a warning under the field.
    const warn = (message) => warnings.push({ key: key, message: message });
    const limit = limitOf(entry, cls);
    if (Array.from(String(value)).length > limit)
      warn(
        entry.field + " " + key + ": at most " + limit + " characters (Table I)"
      );
    const choices = app6bChoices[key];
    if (choices && choices.indexOf(String(value)) < 0)
      warn(
        entry.field +
          " " +
          key +
          ": use " +
          (key === "evaluationRating" ? "A1 through F6" : choices.join(", "))
      );
  });
  LATER_KEYS.forEach((key) => {
    if (!isBlank(options[key]))
      errors.push(key + ": no such field in APP-6(B) Table I");
  });
  if (Number(options.speedLeader) > 0)
    errors.push("AJ speed leader: no such field in APP-6(B) Table I");
  return { valid: errors.length === 0, details: details };
}

// Figure 5 and 0213.b: left rows W; X Y; V; T; Z, right rows E F; G; H; M;
// J K L N P, single spaces. C sits in the B/C/D cell, AA inside the frame.
export function app6bTextLayout(sidc) {
  sidc = normalize(sidc);
  if (sidc.charAt(0) !== "S") return null;
  const keep = (keys) => keys.filter((key) => applicable(key, sidc));
  const descriptor = DESCRIPTORS[sidc.charAt(1)];
  const first = keep(["reinforcedReduced"]);
  if (descriptor) first.unshift("frameDescriptor");
  return {
    left: [
      [],
      keep(["dtg"]),
      keep(["altitudeDepth", "location"]),
      keep(["type"]),
      keep(["uniqueDesignation"]),
      keep(["speed"])
    ],
    right: [
      [],
      first,
      keep(["staffComments"]),
      keep(["additionalInformation"]),
      keep(["higherFormation"]),
      keep([
        "evaluationRating",
        "combatEffectiveness",
        "signatureEquipment",
        "hostile",
        "iffSif"
      ])
    ],
    separator: " ",
    top: keep(["quantity"]),
    inner: keep(["specialHeadquarters"]),
    bottom: [],
    derived: descriptor ? { frameDescriptor: descriptor } : {}
  };
}

export const app6bProfile = {
  id: "app6b",
  title: "APP-6(B)",
  symbolClass: app6bSymbolClass,
  fields: app6bFields,
  unavailableReason(key, sidc) {
    sidc = normalize(sidc);
    if (sidc.charAt(0) !== "S") return "";
    if (LATER_KEYS.indexOf(key) > -1)
      return key + " is not a field of APP-6(B) Table I";
    const entry = BY_KEY[key];
    if (!entry || applicable(key, sidc)) return "";
    if (
      key === "signatureEquipment" &&
      limitOf(entry, app6bSymbolClass(sidc)) !== null
    )
      return "L is for hostile equipment (identity H only)";
    return (
      entry.field +
      " is not applicable to " +
      app6bSymbolClass(sidc) +
      " symbols (Table I)"
    );
  },
  validate: app6bValidate,
  textLayout: app6bTextLayout
};
