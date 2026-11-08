// Pure helpers that derive Studio controls from an edition modifier profile
// (studio/profiles; APP-6A from src/modifierprofiles via vendor/). The Studio keeps
// no copy of an edition's rules: it asks the profile whether a candidate SIDC
// is acceptable and offers only what the profile accepts. Profiles and the
// APP-6D sector helpers are passed in, so this file works in the page and in
// Node tests without importing the vendor copy.

// Problems of a candidate code. Every `*Errors` list a profile reports counts
// (modifierErrors, sidcErrors, identityErrors, ...). For SIDC-level questions
// option values are not part of the question, so validate() gets none.
export function profileErrors(profile, sidc, options = {}) {
  if (!profile) return [];
  let details;
  try {
    details = (profile.validate(sidc, options) || {}).details || {};
  } catch {
    return [];
  }
  return Object.keys(details)
    .filter((key) => /Errors$/.test(key) && Array.isArray(details[key]))
    .flatMap((key) => details[key]);
}

// Ask the profile about several candidate codes at once.
// - With a `baselineSidc`, errors the baseline already has are not the
//   candidate's fault (use it for "unspecified" versus a value).
// - Without one, errors shared by every candidate belong to other positions of
//   the SIDC (for example an invalid sector) and cannot be fixed by choosing a
//   value here, so they are ignored. A lone candidate is therefore always kept.
// Returns [{item, offered, reason}] in the order of `items`.
export function probeOffers(profile, items, sidcFor, baselineSidc) {
  const probed = items.map((item) => ({
    item,
    errors: profileErrors(profile, sidcFor(item))
  }));
  let ignored;
  if (baselineSidc !== undefined)
    ignored = profileErrors(profile, baselineSidc);
  else if (probed.length)
    ignored = probed
      .map((entry) => entry.errors)
      .reduce((all, errors) => all.filter((error) => errors.includes(error)));
  else ignored = [];
  return probed.map(({ item, errors }) => {
    const reasons = errors.filter((error) => !ignored.includes(error));
    return { item, offered: reasons.length === 0, reason: reasons[0] || "" };
  });
}

// Replace characters of a SIDC at `index`, padding when it is too short.
export function patchSidc(sidc, index, text, pad = "-") {
  const padded = sidc.padEnd(index + text.length, pad);
  return padded.slice(0, index) + text + padded.slice(index + text.length);
}

// A profile reason ends with its source in parentheses. Keep the sentence for
// the visible note and leave the source to a tooltip. Parentheses may nest.
export function shortReason(reason) {
  let text = String(reason || "").trim();
  while (text.endsWith(")")) {
    let depth = 0;
    let open = -1;
    for (let index = text.length - 1; index >= 0; index -= 1) {
      if (text[index] === ")") depth += 1;
      else if (text[index] === "(" && --depth === 0) {
        open = index;
        break;
      }
    }
    if (open <= 0) break;
    text = text.slice(0, open).trim();
  }
  return text;
}

// "landEquipment" -> "land equipment"
export function classWords(symbolClass) {
  return String(symbolClass || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
}

// Profile reasons name classes and keys in camelCase ("not defined for
// landUnit"). Read them as words; the full text stays available as a tooltip.
export function humanize(text) {
  return String(text || "").replace(/\b[a-z]+(?:[A-Z][a-z]+)+\b/g, (word) =>
    classWords(word)
  );
}

// Why a field is unavailable, in one sentence, plus the profile's full wording.
// An unsupported profile field with the same code (the Land Unit AC block next
// to country text) says what the code means here.
export function explainUnavailable(state, extras = []) {
  const full = String(state.reason || "");
  const same = extras.find(
    (extra) => extra.field && extra.field === state.field
  );
  const short = humanize(shortReason(full)) || "Not available";
  return {
    short: same ? `${short}. ${humanize(same.reason)}` : short,
    full: same ? `${full} | ${same.reason}` : full
  };
}

// Errors that `options` add to the symbol over `base`.
function addedErrors(profile, sidc, options, base) {
  const before = profileErrors(profile, sidc, base);
  return profileErrors(profile, sidc, options).filter(
    (error) => !before.includes(error)
  );
}

// ------------------------------------------------------ graphic amplifiers

// Q (direction of movement) and AJ (speed leader) for this symbol, from the
// edition profile: a control applies when the validator accepts it here. AJ
// starts from the direction, so it applies only where Q does. A profile that
// lists Q among its fields for the symbol (APP-6A Table III, 2525C Table IV)
// also lists AJ when the symbol takes it. An edition without a profile, or a
// symbol outside its field tables, keeps both. `title` names the edition's
// table in the reasons.
export function movementControls(profile, sidc, title = "This edition's field table") {
  const yes = { applies: true, reason: "" };
  const fields = profile && profile.fields(sidc);
  if (!fields) return { direction: yes, speedLeader: yes };
  const q = addedErrors(profile, sidc, { direction: 90 }, {});
  if (q.length)
    return {
      direction: { applies: false, reason: q[0] },
      speedLeader: {
        applies: false,
        reason: "AJ starts from the direction of movement (Q), which does not apply here"
      }
    };
  const listed = (key) => fields.some((item) => item.key === key);
  if (listed("direction") && !listed("speedLeader"))
    return {
      direction: yes,
      // Not a field of this edition at all (defined: false), not a rule-out.
      speedLeader: { applies: false, defined: false, reason: `${title} has no AJ speed leader` }
    };
  const aj = addedErrors(
    profile,
    sidc,
    { direction: 90, speedLeader: 30 },
    { direction: 90 }
  );
  return {
    direction: yes,
    speedLeader: aj.length ? { applies: false, reason: aj[0] } : yes
  };
}

// The engagement bar type (the target designation colour of the bar) belongs
// to AO; it is not a lettered field. It is offered where AO is and where the
// edition's validator knows the option (it rejects an unknown value) and
// accepts a type for this symbol: APP-6D colours hostile tracks only
// (section 1.2.1 items 11-12 PDF 38-39). 2525C has no such option.
export function engagementTypeState(profile, sidc, aoAvailable) {
  if (!aoAvailable)
    return { available: false, reason: "Set together with the engagement bar (AO)" };
  if (!profile || !profile.fields(sidc)) return { available: true, reason: "" };
  const base = { engagementBar: "ENG" };
  const unknown = addedErrors(profile, sidc, { ...base, engagementType: "?" }, base);
  if (!unknown.length)
    return { available: false, reason: "This edition defines no engagement bar type" };
  const target = addedErrors(profile, sidc, { ...base, engagementType: "TARGET" }, base);
  return target.length
    ? { available: false, reason: target[0] }
    : { available: true, reason: "" };
}

// ------------------------------------------------- fields of an edition

// A form key as the edition names it: {field, label}, or null when the
// edition has no such field (the key is another edition's field: 2525C AC is
// the installation graphic, not country text). `undefined` when the edition
// has no field table here, so the form's own name stays. tables:
// {app6a: app6aTextFields, "2525c": std2525cTableIV}.
export function editionField(standardId, key, tables) {
  const table = tables && tables[standardId];
  if (!table) return undefined;
  const entry = table.find((item) => item.key === key);
  return entry ? { field: entry.field, label: entry.label || entry.title } : null;
}

// Graphics of the edition that need map data this editor does not hold.
const dynamicGraphics = {
  app6b: [["S", "Location offset indicator"]],
  "2525d": [
    ["S2", "Offset location indicator"],
    ["AH", "Area of uncertainty"],
    ["AI", "Dead reckoning trailer"],
    ["AK", "Pairing line"]
  ],
  "2525e": [
    ["BA", "Offset location"],
    ["AH", "Area of uncertainty"],
    ["AI", "Dead reckoning trailer"],
    ["AK", "Pairing line"]
  ],
  app6e: [
    ["S2", "Offset location indicator"],
    ["AH", "Area of uncertainty indicator"]
  ]
};

// Graphics the edition defines for this symbol that this editor cannot set.
// They need data the editor does not hold (map positions, tracks) or have no
// SIDC position or renderer option. Rows: {field, label, reason}.
export function editorGaps({ standardId, profile, sidc, tables, movement }) {
  const rows = [];
  const symbolClass = profile ? profile.symbolClass(sidc) : "";
  if (standardId === "2525c" && tables && tables["2525c"] && symbolClass) {
    const index = ["unit", "equipment", "installation"].indexOf(symbolClass);
    for (const entry of tables["2525c"]) {
      if (entry.support !== "dynamic" || index < 0 || entry.limits[index] === null) continue;
      rows.push({
        field: entry.field,
        label: entry.title,
        reason: "A dynamic map graphic built from track data (5.3.4.11); this editor has no position or track data"
      });
    }
    if (index > -1)
      rows.push({
        field: "S",
        label: "Offset Location Indicator",
        reason: "Its elbow ends at the actual location (5.3.4.9), which this editor does not hold; the headquarters staff is set in the Symbol tab"
      });
  }
  if (standardId === "app6a" && symbolClass === "installation")
    rows.push({
      field: "S",
      label: "Location offset indicator",
      reason: "Table III S applies to installations (505.1e), but SIDC position 11 holds the installation H and the renderer has no separate option"
    });
  const dynamic = dynamicGraphics[standardId];
  if (dynamic && profile && profile.fields(sidc))
    for (const [field, label] of dynamic)
      rows.push({
        field,
        label,
        reason: "A map graphic built from position or track data; this editor holds neither"
      });
  if (standardId === "app6d") {
    for (const extra of profileExtraFields(profile, sidc, [])) rows.push(extra);
    if (symbolClass === "landInstallation" && movement && !movement.direction.applies)
      rows.push({
        field: "Q",
        label: "Offset location indicator",
        reason: "On installations Q is the offset location line, not a direction arrow (Table 3-22 PDF 217); the renderer cannot draw it"
      });
  }
  return rows;
}

// ------------------------------------------------------------------ sectors

// Sector 1 / sector 2 choices of an APP-6D symbol set. `sectors` carries
// sectorDictionary, classifySectorCode and sectorPlacement from
// app6d-sectors.js. Only codes the dictionary defines are listed; a code the
// current entity may not use is listed but disabled with the profile's reason.
// `start` is the SIDC index of the sector's first digit (16 or 18).
export function sectorChoices({
  profile,
  sectors,
  sidc,
  set,
  sector,
  start,
  current
}) {
  const dictionary = sectors.sectorDictionary(set, sector);
  const placement = sectors.sectorPlacement(set, sector);
  const status =
    current && current !== "00"
      ? sectors.classifySectorCode(set, sector, current)
      : "none";
  if (!dictionary)
    return { dictionary: null, placement, entries: [], status, table: "" };
  const defined = dictionary.entries.filter(([code]) => code !== "00");
  const probed = probeOffers(
    profile,
    defined,
    ([code]) => patchSidc(sidc, start, code, "0"),
    patchSidc(sidc, start, "00", "0")
  );
  return {
    dictionary,
    placement,
    status,
    table: `Table ${dictionary.table}, PDF ${dictionary.pdf.join("-")}`,
    entries: probed.map(({ item, offered, reason }) => ({
      code: item[0],
      name: item[1],
      offered,
      reason
    }))
  };
}

export const sectorStatusLabels = {
  reserved: "reserved for future use",
  undefined: "not defined in this edition",
  vef: "version extension flag",
  none: "",
  defined: ""
};

// ------------------------------------------------------- engagement bar AO

// "A:BBB-CC" -> parts. Never throws; anything unrecognised stays in `rest`.
export function parseEngagement(text) {
  let rest = String(text || "");
  let a = "";
  let c = "";
  const colon = rest.indexOf(":");
  if (colon >= 0) {
    a = rest.slice(0, colon);
    rest = rest.slice(colon + 1);
  }
  const dash = rest.indexOf("-");
  if (dash >= 0) {
    c = rest.slice(dash + 1);
    rest = rest.slice(0, dash);
  }
  return { a, b: rest, c };
}

export function composeEngagement({ a, b, c }) {
  if (!b) return "";
  return `${a ? `${a}:` : ""}${b}${c ? `-${c}` : ""}`;
}

// Options of the three AO dropdowns. `errorFn` is the profile's engagement
// grammar check (empty string when valid). Counts for MLT are found by asking
// the grammar, not by repeating its range.
export function engagementOptions(parts, errorFn) {
  const pair = (choice) =>
    Array.isArray(choice) ? choice : [String(choice), String(choice)];
  const named = (name) =>
    (parts.find((part) => part.name === name) || { choices: [] }).choices.map(
      pair
    );
  const counts = [];
  for (let n = 2; n <= 99; n += 1) {
    const value = String(n).padStart(2, "0");
    if (!errorFn(`MLT-${value}`)) counts.push([value, `${n} engagements`]);
  }
  return {
    sources: named("A"),
    stages: named("BBB"),
    weapons: named("CC"),
    counts
  };
}

// -------------------------------------------------- text carried over editions

const stopWords = new Set([
  "of",
  "the",
  "and",
  "or",
  "an",
  "for",
  "in",
  "to",
  "is"
]);
const wordsOf = (label) =>
  new Set(
    (
      String(label || "")
        .toLowerCase()
        .match(/[a-z0-9]+/g) || []
    ).filter((word) => word.length > 1 && !stopWords.has(word))
  );

// What a text field meant where it was typed: its code, its name and the
// closed value list it offered, if any.
export function fieldMeaning(definition) {
  const choices = definition.choices
    ? definition.choices
        .map((choice) =>
          String(Array.isArray(choice) ? choice[0] : choice).toLowerCase()
        )
        .sort()
    : null;
  return {
    field: definition.field || "",
    label: definition.label || "",
    choices
  };
}

// Non-empty reason when the same free text would be read differently under
// `to` than it was typed under `from`. Two definitions agree when they share a
// field code, at least one significant word of their names, and (if both are
// closed lists) the same values.
export function meaningChange(from, to) {
  if (!from || !to) return "";
  if (from.field !== to.field)
    return `field ${from.field || "-"} is now field ${to.field || "-"}`;
  const before = wordsOf(from.label);
  const shared = [...wordsOf(to.label)].some((word) => before.has(word));
  if (!shared) return `"${from.label}" is now "${to.label}"`;
  if (
    from.choices &&
    to.choices &&
    from.choices.join("|") !== to.choices.join("|")
  )
    return "its list of allowed values changed";
  return "";
}

// Warnings about typed text the current edition or symbol reads differently or
// not at all. `states` come from profileFieldStates, `values` maps key -> text,
// `origins` maps key -> {meaning, where} recorded when the text was typed. The
// text itself is never touched.
export function carryWarnings({ states, values, origins, extras = [] }) {
  const warnings = [];
  for (const state of states) {
    const value = String(values[state.key] == null ? "" : values[state.key]);
    if (!value) continue;
    const base = {
      key: state.key,
      field: state.field,
      label: state.label,
      value
    };
    if (!state.available) {
      warnings.push({
        ...base,
        kind: "inactive",
        message: `${explainUnavailable(state, extras).short}. The text is kept but not drawn.`
      });
      continue;
    }
    const origin = origins[state.key];
    const change = origin && meaningChange(origin.meaning, fieldMeaning(state));
    if (change)
      warnings.push({
        ...base,
        kind: "changed",
        message: `Typed for ${origin.where}; here ${change}. Check that it still fits.`
      });
  }
  return warnings;
}

// Fields a profile defines for the symbol but marks supported:false (for
// example the APP-6D Land Unit AC installation block): there is no SIDC digit
// or renderer option to set them. They are listed so the user knows the field
// exists and why it cannot be set.
export function profileExtraFields(profile, sidc, knownKeys) {
  const defined = (profile && profile.fields(sidc)) || [];
  return defined
    .filter(
      (definition) =>
        definition.supported === false && !knownKeys.includes(definition.key)
    )
    .map((definition) => ({
      key: definition.key,
      field: definition.field || "",
      label: definition.label || definition.key,
      reason:
        definition.unresolved || "The renderer does not support this field"
    }));
}

// Inline hints from the metadata a field definition carries (minLength,
// maxLength, pattern/patternText). Returns {hint, problem}: the rule as help
// text, and what is wrong with the value, if anything.
export function fieldRule(definition, value) {
  const text = String(value || "");
  const hints = [];
  const problems = [];
  const length = Array.from(text).length;
  if (definition.minLength && definition.maxLength === definition.minLength)
    hints.push(`exactly ${definition.minLength} characters`);
  else if (definition.minLength)
    hints.push(`at least ${definition.minLength} characters`);
  if (definition.patternText) hints.push(definition.patternText);
  if (text) {
    if (definition.minLength && length < definition.minLength)
      problems.push(
        `needs ${definition.minLength === definition.maxLength ? "exactly" : "at least"} ${definition.minLength} characters`
      );
    if (definition.pattern && !definition.pattern.test(text))
      problems.push(
        definition.patternText
          ? `expected ${definition.patternText}`
          : "unexpected format"
      );
  }
  return { hint: hints.join("; "), problem: problems.join("; ") };
}

// ----------------------------------------------------- profile detail lines

const positionNames = {
  status: "status (position 7)",
  hqTaskForceDummy: "HQ / task force / dummy (position 8)",
  amplifier: "echelon / mobility / towed array (positions 9-10)",
  sector1: "sector 1 modifier (positions 17-18)",
  sector2: "sector 2 modifier (positions 19-20)"
};

// details.notes, details.unresolved and details.versionExtension as lines for
// the user. Duplicates collapse.
export function profileDetailLines(details) {
  const unique = (list) => [...new Set(list)];
  const info = details || {};
  return {
    notes: unique((info.notes || []).map(String)),
    unresolved: unique(
      (info.unresolved || []).map((item) =>
        typeof item === "string" ? item : `${item.id}: ${item.detail}`
      )
    ),
    versionExtension: unique(
      (info.versionExtension || []).map(
        (item) =>
          `Version Extension Flag in ${positionNames[item.position] || item.position} (code ${item.code}): extension content cannot be interpreted, so the symbol is reported as not valid.`
      )
    )
  };
}
