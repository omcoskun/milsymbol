// Pure editor helpers shared by the Studio page and its Node tests.

const symbolClasses = ["unit", "equipment", "installation", "point", "nuclear"];
const classNames = ["Units", "Equipment", "Installations"];
const classLabels = {
  unit: "units",
  equipment: "equipment",
  installation: "installations",
  point: "tactical points",
  nuclear: "nuclear points"
};

function unavailableReason(entry, kind, identity) {
  if (!entry) return "Not in APP-6A";
  const index = symbolClasses.indexOf(kind);
  // L is for hostile equipment (Table III): the identities come from the table.
  if (entry.limits[index] > 0)
    return entry.identities && !entry.identities.includes(identity)
      ? "Hostile (H) only"
      : "";
  if (index > 2) return `Not for ${classLabels[kind]}`;
  const allowed = classNames.filter(
    (_, position) => entry.limits[position] > 0
  );
  if (!allowed.length) return `Not for ${classLabels[kind]}`;
  const list = allowed
    .map((name, position) => (position ? name.toLowerCase() : name))
    .join(" and ");
  return `${list} only`;
}

// app6a: null for every other standard, else
// {available: getApp6aFields(sidc), table: app6aTextFields, kind, identity}.
export function fieldStates(textModifiers, app6a) {
  return textModifiers.map(({ key, field, label }) => {
    if (!app6a)
      return {
        key,
        field,
        label,
        available: true,
        maxLength: null,
        reason: ""
      };
    const definition = app6a.available.find((item) => item.key === key);
    if (definition)
      return {
        key,
        field: definition.field,
        label: definition.label,
        available: true,
        maxLength: definition.maxLength,
        reason: ""
      };
    const entry = app6a.table.find((item) => item.key === key);
    return {
      key,
      field,
      label,
      available: false,
      maxLength: null,
      reason:
        unavailableReason(entry, app6a.kind, app6a.identity) || "Not available"
    };
  });
}

// Field states from an edition modifier profile (studio/profiles; APP-6A in src/modifierprofiles). A
// profile whose fields() returns null leaves every field available. A field
// the class table lists can still be ruled out for this SIDC: APP-6D lists L
// and N for all equipment, and its unavailableReason() limits them to hostile
// identities, as its validator does. The field's own unresolved note is not a
// rule-out; it is shown as a warning on an editable field.
export function profileFieldStates(textModifiers, profile, sidc) {
  const available = profile ? profile.fields(sidc) : null;
  if (!available) return fieldStates(textModifiers, null);
  return textModifiers.map(({ key, field, label }) => {
    const definition = available.find((item) => item.key === key);
    const reason = profile.unavailableReason(key, sidc);
    const ruledOut = definition && reason && reason !== definition.unresolved;
    if (definition && !ruledOut)
      return {
        key,
        field: definition.field || field,
        label: definition.label || label,
        available: true,
        maxLength: definition.maxLength || null,
        choices: definition.choices || null,
        reason: "",
        // Metadata a profile may attach to a field; the Studio shows it.
        kind: definition.kind || "text",
        minLength: definition.minLength || null,
        pattern: definition.pattern || null,
        patternText: definition.patternText || "",
        alternates: definition.alternates || null,
        examples: definition.examples || null,
        parts: definition.parts || null,
        format: definition.format || "",
        unresolved: definition.unresolved || "",
        nonBlocking: Boolean(definition.nonBlocking),
        requiresEchelonDivisionOrBelow: Boolean(
          definition.requiresEchelonDivisionOrBelow
        )
      };
    return {
      key,
      field: definition?.field || field,
      label: definition?.label || label,
      available: false,
      maxLength: null,
      choices: null,
      reason: reason || "Not available"
    };
  });
}

// PNG exports draw the symbol at this multiple of its size.
export const pngScale = 3;

export function pngOutputSize({ width, height }, scale = pngScale) {
  return { width: Math.ceil(width * scale), height: Math.ceil(height * scale) };
}

// app6e_160310000012110000000000000000_infantry.png: the standard and the code
// tell files apart when one symbol name recurs across a set of exports.
export function exportFilename({ standardId, sidc, name }, extension) {
  const slug = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const code = String(sidc || "").replace(/[^A-Za-z0-9-]/g, "-");
  return `${[standardId, code, slug || "military-symbol"].filter(Boolean).join("_")}.${extension}`;
}

const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC"
];
const twoDigits = (value) => String(value).padStart(2, "0");

// DDHHMMZMONYY; seconds add SS after the minutes, fourDigitYear gives YYYY.
export function formatDtg(
  date,
  { fourDigitYear = false, seconds = false } = {}
) {
  const year = fourDigitYear
    ? String(date.getUTCFullYear()).padStart(4, "0")
    : twoDigits(date.getUTCFullYear() % 100);
  return `${twoDigits(date.getUTCDate())}${twoDigits(date.getUTCHours())}${twoDigits(date.getUTCMinutes())}${seconds ? twoDigits(date.getUTCSeconds()) : ""}Z${months[date.getUTCMonth()]}${year}`;
}

// Now (UTC) for the W field of the current symbol: the year length the field's
// own pattern asks for (APP-6D Land Unit W1 four digits, Table 3-2 PDF 87/3-7;
// equipment and installations two). A field without a pattern takes the
// edition's printed format when one is given (APP-6A DDHHMMSSZMONYY, 2525C
// DDHHMMSSZMONYYYY; see field-guide.js), else two digits.
export function dtgForField(date, definition, printed = null) {
  const short = formatDtg(date);
  const pattern = definition && definition.pattern;
  if (!pattern && printed) {
    const value = formatDtg(date, printed);
    return !definition ||
      !definition.maxLength ||
      value.length <= definition.maxLength
      ? value
      : short;
  }
  if (!pattern || pattern.test(short)) return short;
  const long = formatDtg(date, { fourDigitYear: true });
  return pattern.test(long) ? long : short;
}

export function evaluationRating(reliability, credibility) {
  const letter = String(reliability || "").toUpperCase();
  const digit = String(credibility || "");
  return /^[A-F]$/.test(letter) && /^[1-6]$/.test(digit) ? letter + digit : "";
}

export function sidcParts(sidc, dEdition) {
  const part = (key, label, start, end) => ({
    key,
    label,
    value: sidc.slice(start, end)
  });
  if (!/^\d/.test(sidc))
    return [
      part("scheme", "Scheme", 0, 1),
      part("identity", "Identity", 1, 2),
      part("dimension", "Dimension", 2, 3),
      part("status", "Status", 3, 4),
      part("function", "Function", 4, 10),
      part("modifiers", "Modifiers", 10, 12),
      part("country", "Country", 12, 14),
      part("oob", "OOB", 14)
    ];
  return [
    part("version", "Version", 0, 2),
    part("identity", "Identity", 2, 4),
    part("set", "Set", 4, 6),
    part("amplifier", "Amplifier", 6, 10),
    part("entity", "Entity", 10, 16),
    part("modifiers", "Modifiers", 16, 20),
    ...(dEdition
      ? [
          part("originatorCountry", "Originator country", 20, 23),
          part("originatorSet", "Originator set", 23, 24),
          part("nationalData", "National data", 24, 30)
        ]
      : [
          part("extension", "Ext.", 20, 22),
          part("frameShape", "Frame shape", 22, 23),
          part("otherExtension", "Other ext.", 23, 27),
          part("country", "Country", 27, 30)
        ])
  ];
}

// Catalogue entries of a letter-SIDC edition carry no positions 11-12.
// MIL-STD-2525C prints every ground installation (S*G*I...) with H there: the
// AC installation modifier (Table A-III PDF 87-88/81-82, for example Military
// Base/Facility S*G*IB----H****, Table A-V PDF 270/264). Only an edition that
// prints it (installationModifier) gets it; no other symbol does.
export function legacyDefaultModifier(
  item,
  { installationModifier = false } = {}
) {
  return installationModifier &&
    item.codingscheme === "S" &&
    item.battledimension === "G" &&
    String(item.functionid || "").startsWith("I")
    ? "H-"
    : undefined;
}

export const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// The code of a catalogue row. Rows that share a code carry a "#2" mark on their
// id (distinctEntries); the mark is not part of the code.
const entryCode = (icon) => icon.id.split("#")[0];

// A search shaped like a letter SIDC finds that symbol. Words of the same
// length have that shape too ("reconnaissance", "air defense" without its
// space), so a code that matches nothing falls through to the text search.
export function matchesSearch(icon, search, family) {
  const term = normalize(search).trim();
  if (!term) return true;
  const code = search.toUpperCase().replace(/\s/g, "");
  if (
    family === "legacy" &&
    /^[A-Z][A-Z*-][A-Z][A-Z*-][A-Z0-9-]{6}[A-Z0-9*-]{0,5}$/.test(code) &&
    entryCode(icon) === `${code[0]}-${code[2]}-${code.slice(4, 10)}`
  )
    return true;
  if (family === "modern" && /^(?:\d{20,30}|\d{22}A\d{0,7})$/.test(code))
    return (
      icon.symbolSet === code.slice(4, 6) && icon.code === code.slice(10, 16)
    );
  return normalize(
    [
      icon.name,
      icon.category,
      icon.code,
      entryCode(icon),
      ...(icon.path || [])
    ].join(" ")
  ).includes(term);
}

// A publication can print one code on several rows: APP-6(B) gives UCEC-- to
// Engineer Combat and its bridging, mine and diving rows, 2525C lists Hospital
// under two branches. The palette selects by id, so each row needs its own:
// later rows take a "#2" mark. The code they write into the SIDC stays, so they
// draw alike, and the note says so.
export function distinctEntries(icons, edition) {
  const rows = new Map();
  for (const icon of icons)
    rows.set(icon.id, [...(rows.get(icon.id) || []), icon]);
  const seen = new Map();
  return icons.map((icon) => {
    const same = rows.get(icon.id);
    if (same.length === 1) return icon;
    const position = (seen.get(icon.id) || 0) + 1;
    seen.set(icon.id, position);
    const others = [...new Set(same.map((row) => row.name))].filter(
      (name) => name !== icon.name
    );
    return {
      ...icon,
      id: position > 1 ? `${icon.id}#${position}` : icon.id,
      note: `${edition} gives ${same.length} rows this code${others.length ? ` (also ${others.join(", ")})` : ""}, so they draw the same symbol.`
    };
  });
}

// APP-6(B) rows whose printed code cannot be used as it stands (keyed by the
// data package's id and name). See docs/edition-modifiers.md.
const app6bCorrections = {
  "S-G-UCRLL--|RECONNAISSANCE LIGHT": {
    code: "UCRL--",
    note: "APP-6(B) prints seven function characters (UCRLL--); the code is read as UCRL--, as in APP-6A."
  },
  "S-G-UCAWA-|ARMOUR, WHEELED AMPHIBIOUS": {
    code: "UCAWW-",
    note: "The APP-6(B) code table prints UCAWA-, the code of wheeled airborne armour. Its symbol page prints UCAWW-, used here."
  }
};

export function correctApp6bEntries(icons) {
  return icons.map((icon) => {
    const correction = app6bCorrections[`${icon.id}|${icon.name}`];
    return correction
      ? {
          ...icon,
          ...correction,
          id: `${icon.id.slice(0, 4)}${correction.code}`
        }
      : icon;
  });
}

export function pushRecent(list, id, max = 8) {
  return [id, ...list.filter((item) => item !== id)].slice(0, max);
}

// Field positions probe: each available text field without a value is drawn
// as its "[code]" marker, so the rows show where each field goes.
export function placeholderOptions(states, values) {
  const options = {};
  const codes = {};
  for (const state of states) {
    if (
      !state.available ||
      values[state.key] ||
      state.key === "engagementType" ||
      !state.field
    )
      continue;
    const tag = `[${state.field}]`;
    options[state.key] = tag;
    codes[tag] = state.key;
  }
  return { options, codes };
}

// The rows of a probe rendering whose text fields are all "[code]" markers.
// texts: the probe's <text> elements as {x, y, anchor, fontSize, middle,
// content}, in symbol units. A row keeps its anchor point, its vertical centre
// (y is the baseline unless the text is centred on it) and the fields in the
// order they are drawn.
export function readTextRows(texts, codes) {
  const markers = Object.keys(codes).map((marker) =>
    marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  if (!markers.length) return [];
  const pattern = new RegExp(`(${markers.join("|")})`);
  const rows = [];
  for (const text of texts) {
    const parts = text.content.split(pattern);
    const keys = parts
      .filter((part, index) => index % 2 && Object.hasOwn(codes, part))
      .map((part) => codes[part]);
    if (!keys.length) continue;
    rows.push({
      anchor: text.anchor || "start",
      x: text.x,
      y: text.middle ? text.y : text.y - 0.35 * text.fontSize,
      keys
    });
  }
  return rows;
}

// Text fields milsymbol leaves out of a symbol. probeTexts: the content of each
// <text> of a rendering made with placeholderOptions(states, {}).options.
export function undrawnFieldKeys(states, probeTexts) {
  const { codes } = placeholderOptions(states, {});
  const rows = readTextRows(
    probeTexts.map((content) => ({ content })),
    codes
  );
  const drawn = new Set(rows.flatMap((row) => row.keys));
  return Object.values(codes).filter((key) => !drawn.has(key));
}

// Characters a box makes room for: a usual value, or the field's limit when
// that is shorter.
const boxChars = {
  dtg: 14,
  location: 15,
  altitudeDepth: 8,
  type: 9,
  uniqueDesignation: 16,
  speed: 8,
  reinforcedReduced: 3,
  staffComments: 16,
  additionalInformation: 16,
  higherFormation: 14,
  evaluationRating: 2,
  combatEffectiveness: 5,
  signatureEquipment: 1,
  hostile: 3,
  iffSif: 5,
  quantity: 5,
  specialHeadquarters: 8,
  headquartersElement: 8,
  engagementBar: 12,
  country: 3,
  platformType: 8,
  equipmentTeardownTime: 7,
  commonIdentifier: 10,
  installationComposition: 12,
  guardedUnit: 10,
  specialDesignator: 12
};

export function fieldValueChars(state) {
  const typical = boxChars[state.key] || 10;
  return state.maxLength ? Math.min(typical, state.maxLength) : typical;
}

// Narrows the side rows until the widest left row, the room between the side
// rows and the widest right row fit room. Names go first: the widest row of
// the wider side gives up its widest name, down to plain[key] (the box's code
// and a usual value), until the rows fit or no widest row has a name left.
// Then value room goes: the narrower side keeps its boxes when the other can
// give up enough, otherwise both give up in proportion, the widest boxes most,
// down to min px. null when the rows cannot fit even then. rows as
// readTextRows() gives them; widths and plain by field key.
export function fitRowWidths(
  rows,
  widths,
  { room, between, plain = widths, gap = 8, min = 48 }
) {
  const fitted = { ...widths };
  const spaces = (row) => gap * (row.keys.length - 1);
  const side = (anchor) => rows.filter((row) => row.anchor === anchor);
  // How far a row starts outside the side's first column: the two rows beside a
  // country flag start further right, and that distance uses room too.
  const offset = (row) => {
    if (!Number.isFinite(row.x)) return 0;
    const starts = side(row.anchor)
      .map((item) => item.x)
      .filter(Number.isFinite);
    return Math.abs(
      row.x -
        (row.anchor === "start" ? Math.min(...starts) : Math.max(...starts))
    );
  };
  const span = (row) =>
    offset(row) +
    row.keys.reduce((sum, key) => sum + fitted[key], 0) +
    spaces(row);
  const widest = (anchor) =>
    side(anchor).reduce(
      (best, row) => (best && span(best) >= span(row) ? best : row),
      null
    );
  const need = (anchor) => (widest(anchor) ? span(widest(anchor)) : 0);
  const floor = (anchor) =>
    Math.max(
      0,
      ...side(anchor).map(
        (row) => offset(row) + row.keys.length * min + spaces(row)
      )
    );
  const free = room - between;
  const named = (row) =>
    row.keys
      .filter((key) => fitted[key] > plain[key])
      .sort((a, b) => fitted[b] - plain[b] - (fitted[a] - plain[a]));
  while (need("end") + need("start") > free) {
    const order =
      need("end") >= need("start") ? ["end", "start"] : ["start", "end"];
    const key = order
      .map((anchor) => widest(anchor) && named(widest(anchor))[0])
      .find(Boolean);
    if (!key) break;
    fitted[key] = plain[key];
  }
  const left = need("end");
  const right = need("start");
  if (left + right <= free) return fitted;
  if (floor("end") + floor("start") > free) return null;
  let caps;
  if (left <= right && free - left >= floor("start"))
    caps = { end: left, start: free - left };
  else if (right < left && free - right >= floor("end"))
    caps = { end: free - right, start: right };
  else {
    const end = Math.min(
      free - floor("start"),
      Math.max(floor("end"), (free * left) / (left + right))
    );
    caps = { end, start: free - end };
  }
  for (const anchor of ["end", "start"])
    for (const row of side(anchor)) {
      for (const key of named(row)) {
        if (span(row) <= caps[anchor]) break;
        fitted[key] = plain[key];
      }
      const excess = span(row) - caps[anchor];
      if (excess <= 0) continue;
      const slack = row.keys.reduce((sum, key) => sum + fitted[key] - min, 0);
      for (const key of row.keys)
        fitted[key] = Math.floor(
          fitted[key] - (excess * (fitted[key] - min)) / slack
        );
    }
  return fitted;
}

// Boxes for the rows, in editor pixels: rows as readTextRows() gives them,
// already scaled; widths by field key. Each row grows away from its anchor:
// left of an "end" anchor, right of a "start" one, centred on a "middle" one.
// A centred row too wide for the room between the side rows at its height
// moves away from center (the symbol's vertical centre) past them when that
// is less than a row away, and narrows otherwise. Any row that would meet a
// box already placed moves away from center until it is clear.
export function layoutFieldBoxes(
  rows,
  widths,
  { height = 30, gap = 8, center = 0 } = {}
) {
  const boxes = [];
  const meets = (a, b) =>
    a.left < b.left + b.width + gap / 2 &&
    b.left < a.left + a.width + gap / 2 &&
    a.top < b.top + b.height + gap / 2 &&
    b.top < a.top + a.height + gap / 2;
  const centred = (row) => row.anchor === "middle";
  const ordered = [...rows].sort(
    (a, b) =>
      centred(a) - centred(b) || Math.abs(a.y - center) - Math.abs(b.y - center)
  );
  for (const row of ordered) {
    const spaces = gap * (row.keys.length - 1);
    const step = row.y < center ? -1 : 1;
    let sizes = row.keys.map((key) => widths[key]);
    let y = row.y;
    if (centred(row)) {
      const spanAt = (at) => {
        const beside = rows.filter(
          (other) =>
            !centred(other) && Math.abs(other.y - at) < height + gap / 2
        );
        return (
          2 *
          (Math.min(
            ...beside.map((other) =>
              other.anchor === "start" ? other.x - row.x : row.x - other.x
            )
          ) -
            gap)
        );
      };
      const natural = sizes.reduce((sum, size) => sum + size, 0);
      let shift = 0;
      while (
        shift <= height + gap &&
        natural + spaces > spanAt(row.y + step * shift)
      )
        shift++;
      if (shift <= height + gap) y = row.y + step * shift;
      else
        sizes = sizes.map((size) =>
          Math.max(40, Math.floor((size * (spanAt(row.y) - spaces)) / natural))
        );
    }
    const total = sizes.reduce((sum, size) => sum + size, 0) + spaces;
    let left =
      row.anchor === "end"
        ? row.x - total
        : centred(row)
          ? row.x - total / 2
          : row.x;
    const own = sizes.map((width, index) => {
      const box = {
        key: row.keys[index],
        left,
        top: y - height / 2,
        width,
        height
      };
      left += width + gap;
      return box;
    });
    for (let guard = 0; guard < 24; guard++) {
      const hit = boxes.find((box) => own.some((item) => meets(item, box)));
      if (!hit) break;
      const top =
        step < 0 ? hit.top - gap - height : hit.top + hit.height + gap;
      for (const item of own) item.top = top;
    }
    boxes.push(...own);
  }
  return boxes;
}

// Catalogue hierarchy. Every entry's path ends with its own name, so a branch
// (a path prefix) holds the entry of that name and everything under it.
export const inBranch = (icon, branch) =>
  branch.every((name, index) => (icon.path || [])[index] === name);

// The branch a category starts from: the levels every entry under it shares
// are skipped (APP-6A Ground units all sit under GROUND TRACK › UNIT).
export function baseBranch(icons) {
  const branch = [];
  for (;;) {
    const next = new Set(
      icons
        .filter(
          (icon) =>
            (icon.path || []).length > branch.length && inBranch(icon, branch)
        )
        .map((icon) => icon.path[branch.length])
    );
    if (next.size !== 1) return branch;
    branch.push([...next][0]);
  }
}

// The entries of a branch split for the palette: the groups one level below
// it that hold more than one entry (each with every entry under it, in
// catalogue order) and the loose entries that belong to no group (entries
// above the branch, the branch's own entry and single leaves).
export function groupEntries(icons, branch) {
  const groups = new Map();
  for (const icon of icons) {
    const path = icon.path || [];
    if (path.length <= branch.length || !inBranch(icon, branch)) continue;
    if (!groups.has(path[branch.length])) groups.set(path[branch.length], []);
    groups.get(path[branch.length]).push(icon);
  }
  const kept = [...groups].filter(([, list]) => list.length > 1);
  const grouped = new Set(kept.flatMap(([, list]) => list));
  return {
    loose: icons.filter((icon) => !grouped.has(icon)),
    groups: kept.map(([name, list]) => ({
      name,
      branch: [...branch, name],
      icons: list
    }))
  };
}

// A symbol set in the palette: a heading for each group under the set's base
// branch, and inside it a subheading for each of its own groups (APP-6A
// Ground units: COMBAT, then INFANTRY, ARMOR, FIELD ARTILLERY ...). Entries
// that fit no group open the list without a heading.
export function paletteSections(icons, base) {
  const top = groupEntries(icons, base);
  const sections = top.loose.length
    ? [
        {
          name: "",
          branch: base,
          count: top.loose.length,
          loose: top.loose,
          groups: []
        }
      ]
    : [];
  for (const group of top.groups) {
    const inner = groupEntries(group.icons, group.branch);
    sections.push({
      name: group.name,
      branch: group.branch,
      count: group.icons.length,
      loose: inner.loose,
      groups: inner.groups
    });
  }
  return sections;
}

// The groups above an entry, below its category's base branch, each with the
// branch it opens: CHAPARRAL in APP-6A is COMBAT › AIR DEFENSE › SHORT RANGE.
export function entryCrumbs(icon, base) {
  const path = icon.path || [];
  if (!inBranch(icon, base)) return [];
  const crumbs = [];
  for (let index = base.length; index < path.length - 1; index += 1)
    crumbs.push({ name: path[index], branch: path.slice(0, index + 1) });
  return crumbs;
}

// Status line under the symbol palette, which loads its results in batches.
export function paletteProgress(shown, total) {
  if (!total) return "";
  if (total === 1) return "1 symbol shown";
  const count = (value) => value.toLocaleString("en-US");
  return shown < total
    ? `Showing ${count(shown)} of ${count(total)}`
    : `All ${count(total)} symbols shown`;
}

// Id, name, code in a numeric SIDC, code in a letter SIDC. Leader individual is
// numeric only: 2525E Table A-VIII, APP-06(E)(2) Table A-8.
export const mobilities = [
  ["", "Unspecified", "00", "--"],
  ["wheeledLimited", "Wheeled, limited cross-country", "31", "MO"],
  ["wheeled", "Wheeled, cross-country", "32", "MP"],
  ["tracked", "Tracked", "33", "MQ"],
  ["combined", "Wheeled and tracked", "34", "MR"],
  ["towed", "Towed", "35", "MS"],
  ["rail", "Rail", "36", "MT"],
  ["pack", "Pack animals", "37", "MW"],
  ["snow", "Over snow", "41", "MU"],
  ["sled", "Sled", "42", "MV"],
  ["barge", "Barge", "51", "MX"],
  ["amphibious", "Amphibious", "52", "MY"],
  ["shortArray", "Short towed array", "61", "NS"],
  ["longArray", "Long towed array", "62", "NL"],
  ["leader", "Leader individual", "71", ""]
];

const towedArrays = ["shortArray", "longArray"];

// The name of the mobility control, from the ids this symbol may carry.
export function mobilityModeName(offered) {
  const mobility = offered.some(
    (id) => id !== "leader" && !towedArrays.includes(id)
  );
  const names =
    [
      mobility && "mobility",
      offered.some((id) => towedArrays.includes(id)) && "towed array",
      offered.includes("leader") && "leadership"
    ]
      .filter(Boolean)
      .join(" / ") || "mobility";
  return names[0].toUpperCase() + names.slice(1);
}

// Where the values of the control are drawn, from the control's name.
export function amplifierPlacementNote(mobilityName) {
  if (mobilityName === "Leadership")
    return "Leader individual is drawn above the frame.";
  return `${mobilityName.includes("leadership") ? "Leader individual" : "Echelon"} is drawn above the frame; mobility below it.`;
}

// A row of the amplifier picker, from an option of its select. The code is drawn
// beside the name, so a code the list has no row for is not named by itself too.
export function amplifierChoice({ value, textContent, title }, source, modern) {
  const entry = source.find((candidate) => candidate[0] === value);
  const imported = value.startsWith("code:");
  const code = imported
    ? value.slice(5)
    : value && entry
      ? entry[modern ? 2 : 3]
      : "";
  return {
    value,
    name: entry ? entry[1] : imported ? "From SIDC" : textContent,
    code,
    reason: title
  };
}

// A row of an icon modifier picker, from an option of its select.
export function modifierChoice({
  value,
  textContent,
  title,
  disabled,
  parentElement
}) {
  const [, code = "", name = textContent] =
    /^(\S+) — (.*)$/.exec(textContent) || [];
  return {
    value,
    name: name.replace(/ \(not for this entity\)$/, ""),
    code,
    reason: title,
    disabled,
    note: disabled ? "not for this entity" : "",
    group: parentElement?.label || ""
  };
}

// A row of the frame shape picker, from an option of its select.
export function frameShapeChoice({ value, textContent }) {
  return {
    value,
    name: textContent.startsWith("SIDC: ") ? "From SIDC" : textContent,
    code: value,
    reason: ""
  };
}

// The glyphs of one list share a box, so a frame has one size and one place in every
// row. Left to itself each glyph is fitted alone, and a tall amplifier shrinks its frame.
const viewBoxOf = (svg) => {
  const match = /viewBox="([^"]+)"/.exec(svg);
  if (!match) return null;
  const [x, y, width, height] = match[1].split(/[\s,]+/).map(Number);
  return { x, y, width, height };
};

export function sharedViewBox(svgs, center = "") {
  const boxes = svgs.map(viewBoxOf).filter(Boolean);
  if (!boxes.length) return null;
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.width));
  const bottom = Math.max(...boxes.map((box) => box.y + box.height));
  const frame = viewBoxOf(center);
  if (!frame)
    return { x: left, y: top, width: right - left, height: bottom - top };
  // The bare frame goes in the middle, so it sits on the line of the text beside it
  // whatever an amplifier adds on one side.
  const middleX = frame.x + frame.width / 2;
  const middleY = frame.y + frame.height / 2;
  const halfWidth = Math.max(middleX - left, right - middleX);
  const halfHeight = Math.max(middleY - top, bottom - middleY);
  return {
    x: middleX - halfWidth,
    y: middleY - halfHeight,
    width: halfWidth * 2,
    height: halfHeight * 2
  };
}

// Frames of different shapes have no middle in common, so each keeps its own, at one
// scale for the list. That puts every frame on the line of the text beside it.
export function centeredGlyphs(svgs) {
  const boxes = svgs.map(viewBoxOf);
  const drawn = boxes.filter(Boolean);
  const width = Math.max(...drawn.map((box) => box.width));
  const height = Math.max(...drawn.map((box) => box.height));
  return svgs.map((svg, index) => {
    const box = boxes[index];
    if (!box) return svg;
    return withViewBox(svg, {
      x: box.x + (box.width - width) / 2,
      y: box.y + (box.height - height) / 2,
      width,
      height
    });
  });
}

export function withViewBox(svg, box) {
  if (!svg || !box) return svg;
  return svg.replace(/<svg\b[^>]*>/, (tag) =>
    tag
      .replace(/\s(?:width|height)="[^"]*"/g, "")
      .replace(
        /viewBox="[^"]*"/,
        `viewBox="${box.x} ${box.y} ${box.width} ${box.height}"`
      )
  );
}

// The row typed letters go to, or -1. One letter moves on from the active row, so
// pressing it again walks the names; more letters stay on a row while it still fits.
export function typeaheadIndex(names, query, from) {
  const wanted = normalize(query);
  const start = wanted.length > 1 ? from : from + 1;
  for (let step = 0; step < names.length; step++) {
    const index = (start + step) % names.length;
    if (normalize(names[index]).startsWith(wanted)) return index;
  }
  return -1;
}

// Modifier color is on and the drawn symbol has nothing that takes it.
export function modifierColorUnused({ on, color, svg }) {
  return Boolean(on && svg && !svg.includes(color));
}

// What to say about a code the edition does not take. A value a named reason covers
// is not repeated in the library's words, and a general reason speaks only when
// nothing says more.
export function problemReasons({ named, errors, generic }) {
  const covers = (value, error) =>
    new RegExp(
      `(^|[^A-Z0-9*-])${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^A-Z0-9*-])`
    ).test(error);
  const specific = [
    ...named.map(({ text }) => text),
    ...new Set(
      errors.filter((error) => !named.some(({ value }) => covers(value, error)))
    )
  ];
  return specific.length ? specific : [...new Set(generic)];
}

// The saved preview grid choice; anything else draws the grid.
export const gridChoice = (saved) => (saved === "off" ? "off" : "on");

const flagNames = {
  hq: "Headquarters",
  taskForce: "Task force",
  feintDummy: "Feint / dummy"
};

// In both notes below, reason says why a control is off and stays on the page beside
// it; about says what the section does and sits behind its information button.
export function designationNotes({
  app6a,
  modern,
  kind,
  installation,
  tactical,
  mobility,
  flagReasons = {}
}) {
  // APP-6A Table III S is the location offset indicator on equipment and
  // installations, the headquarters staff on units (505.1c, 505.1e).
  const offsetRole = app6a && (kind === "equipment" || kind === "installation");
  const reasons = [];
  if (installation)
    reasons.push(
      app6a
        ? "Installations carry the installation modifier H in position 11, so task force does not apply. Table III also gives installations the location offset indicator (S); this editor cannot set it, because position 11 holds the H."
        : "Installations carry the installation modifier (H in position 11), so headquarters and task force do not apply."
    );
  else if (tactical)
    reasons.push(
      "Tactical points take no headquarters, task force or feint flag."
    );
  else {
    if (app6a && mobility)
      reasons.push(
        `Mobility uses positions 11–12, so ${offsetRole ? "location offset" : "headquarters"} is off.`
      );
    if (app6a && kind !== "unit")
      reasons.push("Task force applies to units only.");
  }
  for (const [key, reason] of Object.entries(flagReasons))
    reasons.push(`${flagNames[key]}: ${reason}.`);
  const written = modern
    ? "Writes one combined code to position 8 of the SIDC."
    : "Writes one combined code to position 11, for example A for headquarters or E for task force.";
  const offset =
    offsetRole && !installation && !tactical
      ? "On equipment, S is the location offset indicator: a line down from the left side of the frame whose end marks the actual location (Table III, 505.1e). "
      : "";
  return { reason: reasons.join(" "), about: `${offset}${written}` };
}

// disabled names the echelon and mobility modes that are off, as their buttons read.
export function amplifierNotes({
  app6a,
  kind,
  installation,
  tactical,
  disabled = [],
  edition = "",
  placement = ""
}) {
  let reason = "";
  if (installation || tactical || disabled.length > 1)
    reason = "This symbol takes no echelon or mobility amplifier.";
  else if (app6a && kind === "unit")
    reason =
      "Units take an echelon above the frame. Mobility is for equipment.";
  else if (app6a && kind === "equipment")
    reason =
      "Equipment takes a mobility amplifier below the frame. Echelon is for units.";
  else if (disabled.length)
    reason = `${edition} offers no ${disabled[0].toLowerCase()} amplifier for this symbol.`;
  return { reason, about: placement };
}

// The encoding is named once, on the line above this note.
export function countryFlagNote({ selected, code, label }) {
  const start = code
    ? `${label} code: ${code}.`
    : selected
      ? "Display-only flag: this standard has no country code for it, so the SIDC carries none."
      : "Select a country or apply a SIDC to select its flag.";
  return `${start} Included in SVG and PNG exports.`;
}
