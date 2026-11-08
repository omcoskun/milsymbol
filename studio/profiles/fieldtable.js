// Shared builder for the numeric editions that describe their amplifiers with
// one field table and one placement figure per symbol class: MIL-STD-2525D,
// MIL-STD-2525E and APP-6(E). APP-6(D) keeps its own file (sector rules); the
// result here has the same shape, see common.js for the profile contract.
//
// A class is written as the figure reads, in field codes:
//   left: "W AR; X Y; V AD AE; T; Z"   rows top to bottom, codes in figure order
//   rightFrom: 2                       the row the column starts on (default 1;
//                                      0 is the row above the usual first row)
// Three-row columns start on row 2, so they sit level with the frame the way
// the figures draw them. Fields that only appear as a graphic cell go in
// `extra`. `notes` attaches a reason to a field the sources disagree on.
import { app6dEngagementError } from "./app6d.js";

// SIDC-free option names of the field codes.
export const fieldKeys = {
  C: "quantity",
  F: "reinforcedReduced",
  G: "staffComments",
  H: "additionalInformation",
  J: "evaluationRating",
  K: "combatEffectiveness",
  L: "signatureEquipment",
  M: "higherFormation",
  N: "hostile",
  P: "iffSif",
  R2: "sigint",
  T: "uniqueDesignation",
  V: "type",
  W: "dtg",
  X: "altitudeDepth",
  Y: "location",
  Z: "speed",
  AA: "specialHeadquarters",
  AD: "platformType",
  AE: "equipmentTeardownTime",
  AF: "commonIdentifier",
  AO: "engagementBar",
  AQ: "guardedUnit",
  AR: "specialDesignator",
  AS: "country",
  AT: "installationCapacity",
  AW: "headquartersElement",
  AX: "installationComposition",
  AY: "networkIdentifier"
};

export function def(code, label, extra) {
  return Object.assign(
    {
      key: fieldKeys[code],
      field: code,
      label: label,
      kind: "text",
      maxLength: null,
      choices: null
    },
    extra || {}
  );
}

// Field values shared by the editions.
export const evaluationPattern = {
  maxLength: 2,
  minLength: 2,
  pattern: /^[A-F][1-6]$/,
  patternText: "one reliability letter A-F and one credibility digit 1-6"
};
export const effectivenessChoices = [
  ["FO", "Fully operational"],
  ["SO", "Substantially operational"],
  ["MO", "Marginally operational"],
  ["NO", "Not operational"],
  ["UNK", "Unknown"]
];
export const countryPattern = {
  maxLength: 3,
  minLength: 3,
  pattern: /^[A-Za-z]{3}$/,
  patternText: "three-letter country code"
};
export const designatorChoices = [
  ["NRT", "Non-real time"],
  ["SIG", "Tactically significant"]
];

const list = (text) =>
  String(text || "")
    .split(/\s+/)
    .filter(Boolean);
const rowsOf = (text, start) => {
  const rows = [];
  for (let row = 0; row < start; row += 1) rows.push([]);
  if (text)
    String(text)
      .split(";")
      .forEach((row) => rows.push(list(row)));
  return rows;
};
const keysOf = (codes) => codes.map((code) => fieldKeys[code]);

function buildClass(edition, spec) {
  const left = rowsOf(
    spec.left,
    spec.leftFrom === undefined ? 1 : spec.leftFrom
  );
  const right = rowsOf(
    spec.right,
    spec.rightFrom === undefined ? 1 : spec.rightFrom
  );
  const top = list(spec.top);
  const inner = list(spec.inner);
  const bottom = list(spec.bottom);
  const codes = []
    .concat(left.flat(), right.flat(), top, inner, bottom, list(spec.extra))
    .filter((code, index, all) => all.indexOf(code) === index);
  const layout = {
    left: left.map(keysOf),
    right: right.map(keysOf),
    top: keysOf(top),
    inner: keysOf(inner),
    bottom: keysOf(bottom),
    separator: " "
  };
  // C shares the cell of the echelon and task force, above both.
  if (top.indexOf("C") > -1) layout.quantityAbove = true;
  const overrides = spec.overrides || {};
  const notes = spec.notes || {};
  return {
    source: spec.source,
    fields: codes.map((code) => {
      if (!edition.definitions[code])
        throw new Error(edition.id + ": no definition for field " + code);
      const field = Object.assign(
        {},
        edition.definitions[code],
        overrides[code] || {}
      );
      if (notes[code]) field.note = notes[code];
      return field;
    }),
    layout: layout,
    condition: spec.condition !== false,
    hqTfDummy: spec.hqTfDummy || "0",
    amplifiers: spec.amplifiers || [],
    direction: spec.direction !== false,
    speedLeader: spec.speedLeader !== false,
    amplifierNote: spec.amplifierNote || {},
    conditionNote: spec.conditionNote || ""
  };
}

function parse(sidc) {
  const s = String(sidc == null ? "" : sidc).replace(/ /g, "");
  const p = s.length < 20 ? s + new Array(21 - s.length).join("0") : s;
  return {
    sidc: s,
    context: p.substr(2, 1),
    identity: p.substr(3, 1),
    set: p.substr(4, 2),
    status: p.substr(6, 1),
    hqtfd: p.substr(7, 1),
    amplifier: p.substr(8, 2)
  };
}

const AMPLIFIER_GROUPS = {
  1: { kind: "echelon", max: 8 },
  2: { kind: "echelon", max: 6 },
  3: { kind: "mobility", max: 7 },
  4: { kind: "mobility", max: 2 },
  5: { kind: "mobility", max: 2 },
  6: { kind: "towedArray", max: 2 },
  7: { kind: "leadership", max: 1 }
};
function amplifierKind(amplifier) {
  if (amplifier === "00") return "none";
  const group = AMPLIFIER_GROUPS[amplifier.charAt(0)];
  const second = Number(amplifier.charAt(1));
  if (!group || !second || second > group.max) return "undefined";
  return group.kind;
}

const HOSTILE_GROUP = "56";

// Value rules of one text field. The text is drawn either way, so a broken rule
// is a warning under the field and the symbol stays valid.
function checkValue(edition, spec, raw, warnings) {
  const warn = (message) => warnings.push({ key: spec.key, message: message });
  const value = String(raw);
  const tag = spec.field + " " + spec.label;
  const size = Array.from(value).length;
  if (spec.maxLength != null && size > spec.maxLength)
    warn(
      tag +
        ": maximum " +
        spec.maxLength +
        " characters (" +
        edition.table +
        ")"
    );
  if (spec.minLength != null && size < spec.minLength)
    warn(
      tag +
        ": minimum " +
        spec.minLength +
        " characters (" +
        edition.table +
        ")"
    );
  if (spec.key === "engagementBar") {
    const message = edition.engagementError(value);
    if (message)
      warn(
        "AO engagement bar: " + message + " (" + edition.engagementTable + ")"
      );
    return;
  }
  if (spec.kind === "choice" && spec.choices) {
    const allowed = spec.choices
      .map((choice) => choice[0])
      .concat(spec.alternates || []);
    if (allowed.indexOf(value) < 0)
      warn(
        tag +
          ": use one of " +
          spec.choices.map((choice) => choice[0]).join(", ")
      );
  }
  if (spec.pattern && !spec.pattern.test(value))
    warn(tag + ": " + (spec.patternText || "invalid format"));
}

// profile from {id, table, setClass, outOfScope, classes, definitions,
// contexts, engagementError, engagementTable}.
export function buildProfile(edition) {
  const classes = {};
  Object.keys(edition.classes).forEach((name) => {
    classes[name] = buildClass(edition, edition.classes[name]);
  });
  const classOf = (sidc) => edition.setClass[parse(sidc).set] || "";
  const classDef = (sidc) => classes[classOf(sidc)] || null;
  const optionKeys = Object.keys(edition.definitions).map(
    (code) => edition.definitions[code].key
  );
  const contexts = edition.contexts;

  function validate(sidc, options) {
    const p = parse(sidc);
    const cls = classOf(sidc);
    const definition = classes[cls];
    const errors = [];
    const notes = [];
    const warnings = [];
    const opt = options || {};
    const details = {
      profile: edition.id,
      symbolClass: cls,
      context: p.context,
      standardIdentity: p.identity,
      modifierErrors: errors,
      fieldWarnings: warnings,
      notes: notes,
      unresolved: [],
      versionExtension: [],
      separator: " "
    };
    if (!definition) return { valid: true, details: details };

    if (contexts.digits.indexOf(p.context) < 0)
      errors.push(
        "context " + p.context + " is not defined (" + contexts.table + ")"
      );
    if (contexts.notes && contexts.notes[p.context])
      notes.push(contexts.notes[p.context]);
    if ("0123456".indexOf(p.identity) < 0 || p.identity === "")
      errors.push(
        "standard identity " +
          p.identity +
          " is not defined (" +
          contexts.table +
          ")"
      );
    if ("012345".indexOf(p.status) < 0 || p.status === "")
      errors.push(
        "status " + p.status + " is not defined (" + edition.statusTable + ")"
      );
    else if (p.status > "1") {
      if (!definition.condition)
        errors.push(
          "AL Operational Condition (status " +
            p.status +
            ") is not defined for " +
            cls +
            " (" +
            definition.source +
            ")"
        );
      else if (definition.conditionNote) notes.push(definition.conditionNote);
    }

    if (!/^[0-7]$/.test(p.hqtfd))
      errors.push(
        "HQ/task force/dummy " +
          p.hqtfd +
          " is not defined (" +
          edition.hqTable +
          ")"
      );
    else if (definition.hqTfDummy.indexOf(p.hqtfd) < 0)
      // Annex A: "Code values exist for each of the eight possible combinations"
      // and graphics for "each combination of standard identity group, dimension"
      // and these codes. A class table only says what the figure shows.
      notes.push(
        "HQ/task force/dummy " +
          p.hqtfd +
          " on " +
          cls +
          ": valid and drawn, " +
          edition.hqAnnex +
          " defines the eight codes for every dimension; " +
          definition.source +
          " gives this class no cell for it"
      );

    const kind = amplifierKind(p.amplifier);
    if (kind === "undefined")
      errors.push(
        "echelon/mobility/towed array " +
          p.amplifier +
          " is not defined (" +
          edition.amplifierTable +
          ")"
      );
    else if (kind !== "none" && definition.amplifiers.indexOf(kind) < 0)
      errors.push(
        kind +
          " amplifier " +
          p.amplifier +
          " is not defined for " +
          cls +
          " (" +
          definition.source +
          ")"
      );
    else if (definition.amplifierNote[kind])
      notes.push(definition.amplifierNote[kind]);

    const specs = {};
    definition.fields.forEach((spec) => {
      specs[spec.key] = spec;
    });
    const hostile = HOSTILE_GROUP.indexOf(p.identity) > -1;
    optionKeys.forEach((key) => {
      const raw = opt[key] == null ? "" : String(opt[key]);
      if (raw === "") return;
      const spec = specs[key];
      if (!spec) {
        const code = Object.keys(fieldKeys).filter(
          (item) => fieldKeys[item] === key
        )[0];
        errors.push(
          code +
            " " +
            key +
            " is not defined for " +
            cls +
            " (" +
            definition.source +
            ")"
        );
        return;
      }
      if (spec.note) notes.push(spec.note);
      if (spec.hostileOnly && !hostile)
        errors.push(
          spec.field +
            " " +
            spec.label +
            " applies to hostile symbols only (" +
            edition.table +
            ")"
        );
      checkValue(edition, spec, raw, warnings);
    });
    (edition.foreignKeys || []).forEach((key) => {
      if (opt[key] != null && opt[key] !== "")
        errors.push(key + " is not a field of " + edition.title);
    });

    const heading = opt.direction != null && opt.direction !== "";
    const leader = Number(opt.speedLeader) > 0;
    if (heading && !definition.direction) {
      if (definition.speedLeader) {
        if (!leader)
          notes.push(
            "Q Direction of movement is not defined for " +
              cls +
              "; a heading is only used to draw AJ Speed leader (" +
              definition.source +
              ")"
          );
      } else
        errors.push(
          "Q Direction of movement is not defined for " +
            cls +
            " (" +
            definition.source +
            ")"
        );
    }
    if (leader && !definition.speedLeader)
      errors.push(
        "AJ Speed leader is not defined for " +
          cls +
          " (" +
          definition.source +
          ")"
      );

    const type = String(
      opt.engagementType == null ? "" : opt.engagementType
    ).toUpperCase();
    if (type !== "") {
      if (["TARGET", "NON-TARGET", "EXPIRED"].indexOf(type) < 0)
        errors.push("engagementType must be TARGET, NON-TARGET or EXPIRED");
      else if (!hostile)
        errors.push(
          "target designation colours apply to hostile tracks (" +
            edition.engagementTable +
            ")"
        );
    }
    return { valid: errors.length === 0, details: details };
  }

  return {
    id: edition.id,
    title: edition.title,
    symbolClass: classOf,
    fields(sidc) {
      const definition = classDef(sidc);
      return definition ? definition.fields : null;
    },
    unavailableReason(key, sidc) {
      const cls = classOf(sidc);
      const definition = classes[cls];
      if (!definition) return "";
      if ((edition.foreignKeys || []).indexOf(key) > -1)
        return key + " is not a field of " + edition.title;
      const spec = definition.fields.filter((item) => item.key === key)[0];
      if (!spec)
        return (
          key + " is not defined for " + cls + " (" + definition.source + ")"
        );
      if (spec.hostileOnly && HOSTILE_GROUP.indexOf(parse(sidc).identity) < 0)
        return "hostile symbols only";
      return "";
    },
    validate: validate,
    textLayout(sidc) {
      const definition = classDef(sidc);
      return definition ? definition.layout : null;
    },
    // False when the edition gives this class no operational condition (AL).
    showsCondition(sidc) {
      const definition = classDef(sidc);
      return definition ? definition.condition : true;
    },
    source(sidc) {
      const definition = classDef(sidc);
      return definition ? definition.source : "";
    },
    amplifiers(sidc) {
      const definition = classDef(sidc);
      return definition
        ? { hqTfDummy: definition.hqTfDummy, kinds: definition.amplifiers }
        : null;
    }
  };
}

// {key, field, label} of every field of an edition, for the Studio's field list.
export function fieldTable(definitions) {
  return Object.keys(definitions).map((code) => ({
    key: definitions[code].key,
    field: code,
    label: definitions[code].label
  }));
}

export { app6dEngagementError };
