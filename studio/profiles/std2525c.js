// MIL-STD-2525C (17 November 2008) modifier profile for scheme S warfighting
// symbols. Active only when the edition is selected explicitly with
// ms.setStandard("2525C") or style.standard "2525C". See common.js.
//
// Sources (physical PDF page / printed page, printed = physical - 6):
//   Table IV   fields, U/E/I applicability and display lengths  PDF 28-30 / 22-24
//   Table A-I  SIDC positions 1-4                               PDF 57 / 51
//   Table A-II SIDC positions 11-12                             PDF 58-60 / 52-54
//   Figure 2   field layout                                     PDF 27 / 21
//   5.4.4      alignment and single-space joining               PDF 40 / 34
// Scope is the S scheme only. Every other scheme gets a neutral result (no
// field restriction, no layout, always valid) and keeps its current rendering.
// See docs/std2525c-modifiers.md for the rule matrix and decision records.

import { isBlank } from "./common.js";

const CLASSES = ["unit", "equipment", "installation"];
const IDENTITIES = "PUAFNSHGWMDLJK";
const DIMENSIONS = "PAGSUFXZ";
const STATUSES = "APCDXF";
// Table II: exercise identities and the descriptor drawn with the frame (E).
const DESCRIPTORS = { G: "X", W: "X", M: "X", D: "X", L: "X", J: "J", K: "K" };
// Table II: unknown dimension Z has examples only for G and W; D L M J K are N/A.
const NO_UNKNOWN_DIMENSION = "DLMJK";
const PAIRS = [];
"ABCDEF"
  .split("")
  .forEach((r) => "123456".split("").forEach((c) => PAIRS.push(r + c)));

// Table IV: [field, title, U, E, I, option key or SIDC-derived key, support]
// Numbers are maximum display characters, "G" a graphic, "G/8" a graphic with
// at most 8 characters, null the dash (not applicable). AM and AN are not in
// Table IV; they are Table XIV only and always dash for U/E/I.
// support: "text" | "choice" | "option" (graphic option) | "sidc" (derived from
// the SIDC) | "status" (SIDC position 4) | "dynamic" (not rendered) | "none".
const TABLE_IV = [
  ["A", "Symbol Icon", "G", "G", "G", "icon", "sidc"],
  ["B", "Echelon", "G", null, null, "echelon", "sidc"],
  ["C", "Quantity", null, 9, null, "quantity", "text"],
  ["D", "Task Force Indicator", "G", null, null, "taskForce", "sidc"],
  ["E", "Frame Shape Modifier", "G", "G", "G", "frameDescriptor", "sidc"],
  ["F", "Reinforced or Reduced", 3, null, null, "reinforcedReduced", "choice"],
  ["G", "Staff Comments", 20, 20, 20, "staffComments", "text"],
  ["H", "Additional Information", 20, 20, 20, "additionalInformation", "text"],
  ["J", "Evaluation Rating", 2, 2, 2, "evaluationRating", "choice"],
  ["K", "Combat Effectiveness", 5, null, 5, "combatEffectiveness", "text"],
  ["L", "Signature Equipment", null, 1, null, "signatureEquipment", "choice"],
  ["M", "Higher Formation", 21, null, null, "higherFormation", "text"],
  ["N", "Hostile (Enemy)", null, 3, null, "hostile", "choice"],
  ["P", "IFF/SIF", 5, 5, 5, "iffSif", "text"],
  ["Q", "Direction of Movement", "G", "G", null, "direction", "option"],
  ["R", "Mobility Indicator", null, "G", null, "mobility", "sidc"],
  ["R2", "SIGINT Mobility Indicator", null, null, null, "sigint", "none"],
  [
    "S",
    "Headquarters Staff / Offset Location",
    "G",
    "G",
    "G",
    "headquarters",
    "sidc"
  ],
  ["T", "Unique Designation", 21, 21, 21, "uniqueDesignation", "text"],
  ["V", "Type", null, 24, null, "type", "text"],
  ["W", "Date-Time Group", 16, 16, 16, "dtg", "text"],
  ["X", "Altitude/Depth", 14, 14, 14, "altitudeDepth", "text"],
  ["Y", "Location", 19, 19, 19, "location", "text"],
  ["Z", "Speed", 8, 8, null, "speed", "text"],
  [
    "AA",
    "Special C2 Headquarters",
    9,
    null,
    null,
    "specialHeadquarters",
    "text"
  ],
  ["AB", "Feint/Dummy", "G", "G", "G", "feintDummy", "sidc"],
  ["AC", "Installation", "G", "G", "G", "installation", "sidc"],
  ["AD", "Platform Type", null, null, null, "platformType", "none"],
  [
    "AE",
    "Equipment Teardown Time",
    null,
    null,
    null,
    "equipmentTeardownTime",
    "none"
  ],
  ["AF", "Common Identifier", null, null, null, "commonIdentifier", "none"],
  [
    "AG",
    "Auxiliary Equipment Indicator",
    null,
    "G",
    null,
    "towedArray",
    "sidc"
  ],
  ["AH", "Area of Uncertainty", "G", "G", null, "areaOfUncertainty", "dynamic"],
  [
    "AI",
    "Dead Reckoning Trailer",
    "G",
    "G",
    null,
    "deadReckoningTrailer",
    "dynamic"
  ],
  ["AJ", "Speed Leader", "G", "G", null, "speedLeader", "option"],
  ["AK", "Pairing Line", "G", "G", null, "pairingLine", "dynamic"],
  [
    "AL",
    "Operational Condition",
    null,
    "G",
    "G",
    "operationalCondition",
    "status"
  ],
  ["AM", "Distance", null, null, null, "distance", "none"],
  ["AN", "Azimuth", null, null, null, "azimuth", "none"],
  ["AO", "Engagement Bar", "G/8", "G/8", "G/8", "engagementBar", "text"]
].map(([field, title, u, e, i, key, support]) => ({
  field: field,
  title: title,
  limits: [u, e, i],
  key: key,
  support: support
}));
export const std2525cTableIV = TABLE_IV;

const BY_KEY = {};
TABLE_IV.forEach((entry) => {
  BY_KEY[entry.key] = entry;
});

// Choice values. F: display forms only; the transmission codes R, D and RD
// (Table XIV) are a different representation and are rejected, not mapped.
// The reinforced-and-reduced glyph (plus over minus) has no ASCII form; the
// plus-minus sign is the closest character and is a product choice.
export const std2525cChoices = {
  reinforcedReduced: ["(+)", "(-)", "(±)"],
  evaluationRating: PAIRS,
  signatureEquipment: ["!"],
  hostile: ["ENY"]
};
export const std2525cTransmission = { R: "(+)", D: "(-)", RD: "(±)" };

// Options that exist in the library but are not scheme S fields in 2525C.
const NOT_S_KEYS = {
  sigint: "R2 applies to SIGINT symbols only",
  country: "AC is the installation graphic in 2525C, not a country field",
  platformType: "AD applies to SIGINT symbols only",
  equipmentTeardownTime: "AE applies to SIGINT symbols only",
  commonIdentifier: "AF applies to SIGINT symbols only",
  auxiliaryEquipmentIndicator:
    "AG is the towed-array graphic encoded in SIDC 11-12 (NS/NL), not a text option",
  headquartersElement: "AH is the dynamic area-of-uncertainty graphic in 2525C",
  installationComposition: "AI is the dynamic dead-reckoning trailer in 2525C",
  guardedUnit: "AQ does not exist in 2525C",
  specialDesignator: "AR does not exist in 2525C"
};

export function normalizeSidc(sidc) {
  return String(sidc == null ? "" : sidc)
    .toUpperCase()
    .replace(/\*/g, "-")
    .replace(/ /g, "");
}

// Symbol class from the real object, derived from SIDC positions 3 and 5:
//   G Ground          function ID starts with I -> installation, E -> equipment,
//                     anything else (U, or the generic ------) -> unit
//   P A S U           space, air, sea surface, subsurface platforms -> equipment
//   F SOF             unit. Table IV note 2 (PDF 30 / 24) lists SOF under
//                     equipment, but SOF aircraft are in the AIR dimension
//                     (Table A-III, PDF 63-64), every F entry is a "SOF UNIT"
//                     (Table A-III, PDF 94) and 5.3.1.3 (PDF 23 / 17) gives
//                     units the rectangle frame. The note covers SOF platforms,
//                     which are equipment through their own dimension. See
//                     docs/std2525c-modifiers.md, decision 12.
//   Z X               no object class is known -> "unknown"; only fields that
//                     apply to units, equipment and installations alike are open
// Limits: the H installation modifier (SIDC 11) does not change the class; a
// unit shown with H keeps the unit fields. The class is a property of the
// catalogue function, so a hand-written function ID is classified by its first
// letter only. Non-S schemes return "".
export function std2525cSymbolClass(sidc) {
  sidc = normalizeSidc(sidc);
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
  // Unknown class: only what every class accepts.
  if (entry.limits.some((value) => value === null)) return null;
  const numbers = entry.limits.filter((value) => typeof value === "number");
  return numbers.length === 3 ? Math.min.apply(null, numbers) : entry.limits[0];
}
function maxLengthOf(limit) {
  if (typeof limit === "number") return limit;
  return limit === "G/8" ? 8 : null;
}

// Identity restriction: L is "a text modifier for hostile equipment" (Table IV,
// PDF 28 / 22). Hostile is the identity H only. Suspect is a separate identity
// defined as "potentially hostile" (3.2.42, PDF 16 / 10), so S is not hostile;
// exercise identities and Joker/Faker (J, K) are not included either. The same
// reading as APP-6A (Table III, definition 32). See docs, decision 13.
function identityAllows(key, sidc) {
  return key !== "signatureEquipment" || sidc.charAt(1) === "H";
}

// One applicability rule used by fields, unavailableReason, validate and the
// text layout, so the Studio, the validator and the renderer agree.
function applicable(key, sidc) {
  const entry = BY_KEY[key];
  if (!entry || entry.support === "none" || entry.support === "dynamic")
    return false;
  const limit = limitOf(entry, std2525cSymbolClass(sidc));
  return limit !== null && identityAllows(key, sidc);
}

// A missing, empty or whitespace-only value is not present (common.js isBlank).
function present(value, key) {
  if (isBlank(value)) return false;
  return !(key === "speedLeader" && Number(value) === 0);
}
function length(value) {
  return Array.from(String(value)).length;
}

// SIDC positions 11-12 (Table A-II), checked against the class.
// Returns the errors and which graphics the renderer may draw.
export function std2525cModifierRules(sidc) {
  sidc = normalizeSidc(sidc);
  const a = sidc.charAt(10) || "-";
  const b = sidc.charAt(11) || "-";
  const cls = std2525cSymbolClass(sidc);
  const strict = cls === "equipment" || cls === "installation";
  const errors = [];
  const notes = [];
  const draw = {
    echelon: false,
    taskForce: false,
    mobility: true,
    towedArray: true
  };
  const code = a + b;
  if ("-ABCDEFG".indexOf(a) > -1) {
    if (b !== "-" && "ABCDEFGHIJKLMN".indexOf(b) < 0) {
      errors.push(
        "SIDC 11-12 " + code + ": " + b + " is not an echelon code (Table A-II)"
      );
    } else {
      draw.echelon = b !== "-";
      draw.taskForce = "BDEG".indexOf(a) > -1;
      if (strict && draw.echelon) {
        errors.push(
          "B Echelon is a unit modifier; not applicable to " +
            cls +
            " (Table IV)"
        );
        draw.echelon = false;
      }
      // Table IV gives D to units, but Table A-III leaves positions 11-12
      // user-defined (**) on these symbols, NAVY TASK FORCE among them.
      if (strict && draw.taskForce)
        notes.push(
          "D Task Force on " +
            cls +
            ": valid and drawn, positions 11-12 are user-defined (A.5.2.1 PDF 56/50); Table IV PDF 28/22 gives D to units"
        );
    }
  } else if (a === "H") {
    if (b !== "-" && b !== "B")
      errors.push(
        "SIDC 11-12 " +
          code +
          ": only H- and HB are defined for installations (Table A-II)"
      );
  } else if (a === "M") {
    if ("OPQRSTUVWXY".indexOf(b) < 0) {
      errors.push("SIDC 11-12 " + code + ": not a mobility code (Table A-II)");
    } else if (cls !== "equipment" && cls !== "unknown") {
      errors.push(
        "R Mobility is an equipment modifier; not applicable to " +
          cls +
          " (Table IV)"
      );
      draw.mobility = false;
    }
  } else if (a === "N") {
    if (b !== "S" && b !== "L") {
      errors.push(
        "SIDC 11-12 " + code + ": not a towed array code (Table A-II)"
      );
    } else if (cls !== "equipment" && cls !== "unknown") {
      errors.push(
        "AG Auxiliary Equipment is an equipment modifier; not applicable to " +
          cls +
          " (Table IV)"
      );
      draw.towedArray = false;
    }
  } else {
    errors.push(
      "SIDC 11-12 " +
        code +
        ": " +
        a +
        " is not a Table A-II symbol modifier code"
    );
  }
  return { errors: errors, notes: notes, draw: draw };
}

export function std2525cFields(sidc) {
  sidc = normalizeSidc(sidc);
  if (sidc.charAt(0) !== "S") return null;
  const cls = std2525cSymbolClass(sidc);
  return TABLE_IV.filter(
    (entry) =>
      (entry.support === "text" ||
        entry.support === "choice" ||
        entry.support === "option") &&
      applicable(entry.key, sidc)
  ).map((entry) => ({
    key: entry.key,
    field: entry.field,
    label: entry.title,
    maxLength: maxLengthOf(limitOf(entry, cls)),
    kind:
      entry.support === "option"
        ? "graphic"
        : entry.support === "choice"
          ? "choice"
          : "text",
    choices: std2525cChoices[entry.key] || null
  }));
}

export function std2525cValidate(sidc, options) {
  sidc = normalizeSidc(sidc);
  options = options || {};
  const errors = [];
  const notes = [];
  const warnings = [];
  if (sidc.charAt(0) !== "S")
    return {
      valid: true,
      details: { modifierErrors: errors, fieldWarnings: warnings, notes: notes }
    };

  const identity = sidc.charAt(1);
  const dimension = sidc.charAt(2);
  const status = sidc.charAt(3);
  const cls = std2525cSymbolClass(sidc);
  if (IDENTITIES.indexOf(identity) < 0 || identity === "")
    errors.push("SIDC 2 " + identity + ": not a Table A-I standard identity");
  if (DIMENSIONS.indexOf(dimension) < 0 || dimension === "")
    errors.push("SIDC 3 " + dimension + ": not a Table A-I battle dimension");
  if (STATUSES.indexOf(status) < 0 || status === "")
    errors.push("SIDC 4 " + status + ": not a Table A-I status (A P C D X F)");

  // Table II: unknown dimension is N/A for D L M J K. Table A-I: X is "no frame".
  if (dimension === "Z" && NO_UNKNOWN_DIMENSION.indexOf(identity) > -1)
    errors.push(
      "Table II: identity " +
        identity +
        " has no unknown-dimension (Z) symbol; no frame is drawn"
    );
  if (dimension === "X")
    notes.push(
      "Table A-I: battle dimension X (Other) has no frame; it is not equal to Z (Unknown)"
    );

  // Status against class.
  if ("CDXF".indexOf(status) > -1 && status !== "" && cls === "unit")
    errors.push(
      "AL Operational Condition (status " +
        status +
        ") is not applicable to units (Table IV, III-1, III-2)"
    );
  if (status === "P" && (cls === "equipment" || cls === "installation"))
    notes.push(
      "Table A-I: status P is 'Units only', yet Table A-V prints equipment and installations with P; the SIDC is kept as given"
    );
  if (status === "F")
    notes.push(
      "Table III-1 shows N/A for every Full To Capacity cell while Table III-2 and Table A-I define F; capacity semantics are kept"
    );
  if ("PAS".indexOf(identity) > -1 || "GM".indexOf(identity) > -1) {
    if (status === "A")
      notes.push(
        "Tables I/II draw P A S G M with an uncertainty contour while 5.3.1.4 maps dashed to planned; identity uncertainty and planned status are kept as separate data and the source gives no combining algorithm (the identity contour is drawn)"
      );
  }

  // SIDC 11-12.
  const modifierRules = std2525cModifierRules(sidc);
  modifierRules.errors.forEach((message) => errors.push(message));
  modifierRules.notes.forEach((message) => notes.push(message));

  // On order: status A together with W = O/O (5.3.1.4).
  if (
    String(options.dtg == null ? "" : options.dtg).toUpperCase() === "O/O" &&
    status !== "A"
  )
    errors.push("W O/O (on order) requires status A (5.3.1.4)");

  // Fields.
  TABLE_IV.forEach((entry) => {
    const key = entry.key;
    if (entry.support === "none" || entry.support === "dynamic") {
      if (NOT_S_KEYS[key] && present(options[key], key))
        errors.push(entry.field + " " + key + ": " + NOT_S_KEYS[key]);
      return;
    }
    if (entry.support === "sidc" || entry.support === "status") return;
    const value = options[key];
    if (!present(value, key)) return;
    if (!applicable(key, sidc)) {
      errors.push(
        entry.field +
          " " +
          key +
          ": not applicable to " +
          (cls === "unknown" ? "this symbol" : cls + " symbols") +
          (key === "signatureEquipment"
            ? " (L is for hostile equipment, identity H only)"
            : " (Table IV)")
      );
      return;
    }
    const limit = maxLengthOf(limitOf(entry, cls));
    if (entry.support === "option") return;
    // The text is drawn either way: a broken rule is a warning under the field.
    const warn = (message) => warnings.push({ key: key, message: message });
    if (limit !== null && length(value) > limit)
      warn(
        entry.field + " " + key + ": at most " + limit + " display characters"
      );
    const choices = std2525cChoices[key];
    if (choices && choices.indexOf(String(value)) < 0) {
      if (key === "reinforcedReduced" && std2525cTransmission[String(value)])
        warn(
          "F: R, D and RD are transmission codes; use the display forms (+), (-), (±)"
        );
      else
        warn(
          entry.field +
            " " +
            key +
            ": use " +
            (key === "evaluationRating" ? "A1 through F6" : choices.join(", "))
        );
    }
  });
  // Options with no 2525C scheme S meaning (library options of later editions).
  Object.keys(NOT_S_KEYS).forEach((key) => {
    if (
      !BY_KEY[key] ||
      BY_KEY[key].support === "sidc" ||
      BY_KEY[key].support === "status"
    ) {
      if (present(options[key], key)) errors.push(key + ": " + NOT_S_KEYS[key]);
    }
  });
  return {
    valid: errors.length === 0,
    details: { modifierErrors: errors, fieldWarnings: warnings, notes: notes }
  };
}

// Figure 2 / 5.4.4. Left rows top to bottom: W; X Y; V; T; Z. Right rows: E F;
// G; H; M; J K L N P. Quantity C sits in the top group, special C2 HQ AA inside
// the frame. Keys that do not apply to the class are left out, so the renderer
// does not draw what the validator rejects. The derived E descriptor (X, J, K)
// leads the E/F row; derived supplies its value to the renderer.
export function std2525cTextLayout(sidc) {
  sidc = normalizeSidc(sidc);
  if (sidc.charAt(0) !== "S") return null;
  const keep = (keys) => keys.filter((key) => applicable(key, sidc));
  const descriptor = DESCRIPTORS[sidc.charAt(1)];
  const first = keep(["reinforcedReduced"]);
  if (descriptor) first.unshift("frameDescriptor");
  const derived = {};
  if (descriptor) derived.frameDescriptor = descriptor;
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
    derived: derived
  };
}

export const std2525cProfile = {
  id: "2525c",
  symbolClass: std2525cSymbolClass,
  // null: not scheme S, no edition-specific restriction.
  fields: std2525cFields,
  unavailableReason(key, sidc) {
    sidc = normalizeSidc(sidc);
    if (sidc.charAt(0) !== "S") return "";
    if (NOT_S_KEYS[key]) return NOT_S_KEYS[key];
    const entry = BY_KEY[key];
    if (!entry) return "";
    if (entry.support === "dynamic")
      return (
        entry.field + " is a dynamic map graphic that milsymbol does not render"
      );
    if (
      applicable(key, sidc) ||
      entry.support === "sidc" ||
      entry.support === "status"
    )
      return "";
    if (
      key === "signatureEquipment" &&
      limitOf(entry, std2525cSymbolClass(sidc)) !== null
    )
      return "L is for hostile equipment (identity H only)";
    return (
      entry.field +
      " is not applicable to " +
      std2525cSymbolClass(sidc) +
      " symbols (Table IV)"
    );
  },
  validate: std2525cValidate,
  textLayout: std2525cTextLayout
};
