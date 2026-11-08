// APP-6(D) Edition D Version 1 (October 2017) modifier profile for numeric
// SIDCs (version 10-12) rendered with the APP6 standard. See common.js.
//
// Scope: symbol sets 01, 02, 05, 10, 15, 20, 30, 35, 36 and the 00 Unknown
// fallback. Sets 11 and 27 are classified but deliberately NOT profiled; sets
// 25, 40, METOC, 50-54, 60-64 and 06 are untouched. Page citations are
// "PDF <physical page> / <printed page>". Product-policy choices are marked
// "policy" and are never presented as source requirements.
import { classifySectorCode, sectorDictionary } from "./app6d-sectors.js";

const SET_CLASS = {
  "00": "unknown",
  "01": "air",
  "02": "airMissile",
  "05": "space",
  10: "landUnit",
  15: "landEquipment",
  20: "landInstallation",
  30: "seaSurface",
  35: "seaSubsurface",
  36: "mineWarfare"
};
// Classified explicitly, not profiled (no silent scope extension).
const OUT_OF_SCOPE = { 11: "civilianOrganization", 27: "dismountedIndividual" };

export const app6dClasses = Object.keys(SET_CLASS).map((set) => SET_CLASS[set]);

const SOURCE = {
  air: "Figure 2-2 PDF 54/2-4; Table 2-2 PDF 55-56/2-5..2-6",
  airMissile: "Figure 2-2 PDF 54/2-4; Table 2-2 PDF 55-56/2-5..2-6",
  space: "Figure 6-2 PDF 361/6-4; Table 6-2 PDF 362-363/6-5..6-6",
  landUnit: "Figure 3-3 PDF 84/3-4; Table 3-2 PDF 85-88/3-5..3-8",
  landEquipment: "Figure 3-14 PDF 161/3-81; Table 3-16 PDF 162-164/3-82..3-84",
  landInstallation:
    "Figure 3-18 PDF 216/3-136; Table 3-22 PDF 217-219/3-137..3-139",
  seaSurface: "Figure 5-3 PDF 293/5-5; Table 5-2 PDF 294-295/5-6..5-7",
  seaSubsurface: "Figure 5-6 PDF 326/5-38; Table 5-9 PDF 326-327/5-38..5-39",
  mineWarfare:
    "Table A-5 PDF 722/A-8 binds set 36 to Sea Subsurface; Figure 5-6 PDF 326/5-38"
};

export const app6dContexts = [
  { digit: "0", name: "Reality" },
  {
    digit: "1",
    name: "Exercise",
    note: "US use only (Table A-2 note 1, PDF 718/A-4)"
  },
  {
    digit: "2",
    name: "Simulation",
    note: "US use only (Table A-2 note 1, PDF 718/A-4)"
  }
];
export const app6dIdentities = [
  { digit: "0", name: "Pending", group: "Unknown", uncertain: true },
  { digit: "1", name: "Unknown", group: "Unknown", uncertain: false },
  { digit: "2", name: "Assumed Friend", group: "Friend", uncertain: true },
  { digit: "3", name: "Friend", group: "Friend", uncertain: false },
  { digit: "4", name: "Neutral", group: "Neutral", uncertain: false },
  {
    digit: "5",
    name: "Suspect",
    exerciseName: "Joker",
    group: "Hostile",
    uncertain: true
  },
  {
    digit: "6",
    name: "Hostile",
    exerciseName: "Faker",
    group: "Hostile",
    uncertain: false
  }
];
// Joker/Faker are US-only names that exist only with context 1 (Table A-2 note 2).
export function app6dIdentityName(context, identity) {
  const entry = app6dIdentities.filter((i) => i.digit === String(identity))[0];
  if (!entry) return "";
  return String(context) === "1" && entry.exerciseName
    ? entry.exerciseName
    : entry.name;
}
export const app6dStatuses = [
  { digit: "0", name: "Present" },
  { digit: "1", name: "Planned/Anticipated/Suspect" },
  { digit: "2", name: "Present/Fully capable", condition: true },
  { digit: "3", name: "Present/Damaged", condition: true },
  { digit: "4", name: "Present/Destroyed", condition: true },
  { digit: "5", name: "Present/Full to capacity", condition: true }
];
export const app6dHqTfDummy = [
  { digit: "0", feintDummy: false, headquarters: false, taskForce: false },
  { digit: "1", feintDummy: true, headquarters: false, taskForce: false },
  { digit: "2", feintDummy: false, headquarters: true, taskForce: false },
  { digit: "3", feintDummy: true, headquarters: true, taskForce: false },
  { digit: "4", feintDummy: false, headquarters: false, taskForce: true },
  { digit: "5", feintDummy: true, headquarters: false, taskForce: true },
  { digit: "6", feintDummy: false, headquarters: true, taskForce: true },
  { digit: "7", feintDummy: true, headquarters: true, taskForce: true }
];

// Table A-8 (PDF 724-726 / A-10..A-12): first digit group -> highest defined
// second digit; 9 is the Version Extension Flag, the rest up to 8 is reserved.
const AMPLIFIER_GROUPS = {
  1: { kind: "echelon", max: 8 },
  2: { kind: "echelon", max: 6 },
  3: { kind: "mobility", max: 7 },
  4: { kind: "mobility", max: 2 },
  5: { kind: "mobility", max: 2 },
  6: { kind: "towedArray", max: 2 },
  7: { kind: "leadership", max: 2 }
};
export function app6dAmplifierKind(amplifier) {
  const a = String(amplifier).charAt(0);
  const b = String(amplifier).charAt(1);
  if (amplifier === "00") return "none";
  if (a === "8") return "reserved";
  if (a === "9" || b === "9") return "vef";
  const group = AMPLIFIER_GROUPS[a];
  if (!group || b === "0" || b === "") return "undefined";
  return Number(b) <= group.max ? group.kind : "reserved";
}

// Engagement bar A:BBB-CC (Tables 1-5 and 1-6, PDF 40-41 / 1-16..1-17).
export const app6dEngagementSource = ["R", "B"];
export const app6dEngagementStages = [
  ["ASN", "Assign/cover"],
  ["ENG", "Engage"],
  ["MIF", "Missile in flight"],
  ["CF", "Cease fire"],
  ["CE", "Cease engage"],
  ["HF", "Hold fire"],
  ["TE", "Terminate engagement"],
  ["BE", "Break engagement"],
  ["MBE", "Management by exception"],
  ["M<T", "MBE less than threshold"],
  ["MLT", "Multiple engagements (number in CC)"]
];
export const app6dEngagementWeapons = [
  ["M", "Missile"],
  ["BM", "Ballistic missile"],
  ["CM", "Cruise missile"],
  ["GN", "Gun"],
  ["T", "Torpedo"],
  ["A", "Attack aircraft"],
  ["C", "Combat air patrol (defensive counter air)"],
  ["D", "Defensive counter air (combat air patrol)"],
  ["UW", "USW/ASW engagement"],
  ["MW", "Mine warfare engagement"],
  ["SW", "Surface warfare engagement"],
  ["EA", "Electronic attack"],
  ["ED", "Electronic defense"],
  ["UV", "Unmanned vehicle"],
  ["CW", "Close-in weapon system"],
  ["L3", "LAMPS"],
  ["VA", "Vertical launch ASROC"]
];
export function app6dEngagementError(value) {
  const text = String(value);
  let local = "";
  let rest = text;
  if (text.indexOf(":") >= 0) {
    local = text.slice(0, text.indexOf(":"));
    rest = text.slice(text.indexOf(":") + 1);
  }
  let stage = rest;
  let weapon = "";
  if (rest.indexOf("-") >= 0) {
    stage = rest.slice(0, rest.indexOf("-"));
    weapon = rest.slice(rest.indexOf("-") + 1);
  }
  const stages = app6dEngagementStages.map((s) => s[0]);
  const weapons = app6dEngagementWeapons.map((w) => w[0]);
  const numeric = /^(0[2-9]|[1-9][0-9])$/.test(weapon);
  if (local !== "" && app6dEngagementSource.indexOf(local) < 0)
    return "A must be R (remote) or B (both); local has no letter";
  if (stage === "") return "BBB engagement stage is required (Table 1-5)";
  if (stages.indexOf(stage) < 0)
    return "BBB must be one of " + stages.join(", ");
  if (weapon !== "" && !numeric && weapons.indexOf(weapon) < 0)
    return "CC must be one of " + weapons.join(", ") + " or 02-99 with MLT";
  if (numeric && stage !== "MLT")
    return "numeric CC (02-99) is only used with MLT";
  if (stage === "MLT" && !numeric)
    return "MLT requires the number of engagements 02-99 in CC";
  if (local === "B" && stage !== "MLT")
    return "A=B (local and remote) is used with MLT";
  return "";
}

const REINFORCED = [
  ["+", "Reinforced (+)"],
  ["-", "Reduced (-)"],
  ["±", "Reinforced and reduced (±)"]
];
const REINFORCED_ALTERNATES = ["(+)", "(-)", "(±)", "–", "(–)"];
const DTG_UNIT = /^(O\/O|[0-9]{6}([0-9]{2})?[A-Za-z][A-Za-z]{3}[0-9]{4})$/;
const DTG_SHORT = /^(O\/O|[0-9]{6}([0-9]{2})?[A-Za-z][A-Za-z]{3}[0-9]{2})$/;
const UNIT_K = [
  ["FO", "Fully operational"],
  ["SO", "Substantially operational"],
  ["MO", "Marginally operational"],
  ["NO", "Not operational"],
  ["UNK", "Unknown"]
];
const EQUIPMENT_K = [
  ["Fully Operational", "Fully Operational"],
  ["Substantially Operational", "Substantially Operational"],
  ["Marginally Operational", "Marginally Operational"],
  ["Not Operational", "Not Operational"]
];
const COMPOSITION = [
  "Development",
  "Research",
  "Production",
  "Service",
  "Storage",
  "Utility"
].map((v) => [v, v]);

function def(key, field, label, kind, extra) {
  return Object.assign(
    {
      key: key,
      field: field,
      label: label,
      kind: kind,
      maxLength: null,
      choices: null
    },
    extra || {}
  );
}
const BASE = {
  quantity: def("quantity", "C", "Quantity", "text"),
  reinforcedReduced: def(
    "reinforcedReduced",
    "F",
    "Reinforced / reduced",
    "choice",
    {
      choices: REINFORCED,
      alternates: REINFORCED_ALTERNATES,
      requiresEchelonDivisionOrBelow: true
    }
  ),
  staffComments: def("staffComments", "G", "Staff comments", "text"),
  additionalInformation: def(
    "additionalInformation",
    "H",
    "Additional information",
    "text"
  ),
  evaluationRating: def("evaluationRating", "J", "Evaluation rating", "text", {
    maxLength: 2,
    minLength: 2,
    pattern: /^[A-F][1-6]$/,
    patternText: "one reliability letter A-F and one credibility digit 1-6"
  }),
  signatureEquipment: def(
    "signatureEquipment",
    "L",
    "Signature equipment",
    "choice",
    {
      choices: [["!", "! detectable electronic signature"]],
      maxLength: 1,
      hostileOnly: true
    }
  ),
  higherFormation: def("higherFormation", "M", "Higher formation", "text"),
  hostile: def("hostile", "N", "Hostile (enemy)", "choice", {
    choices: [["ENY", "ENY"]],
    maxLength: 3,
    hostileOnly: true
  }),
  iffSif: def("iffSif", "P", "IFF/SIF", "text"),
  uniqueDesignation: def(
    "uniqueDesignation",
    "T",
    "Unique designation / track number",
    "text"
  ),
  type: def("type", "V", "Type", "text"),
  altitudeDepth: def("altitudeDepth", "X", "Altitude / depth", "text"),
  location: def("location", "Y", "Location", "text"),
  speed: def("speed", "Z", "Speed", "text"),
  specialHeadquarters: def(
    "specialHeadquarters",
    "AA",
    "Named C2 headquarters",
    "text"
  ),
  country: def("country", "AC", "Country indicator", "text", {
    maxLength: 3,
    minLength: 3,
    pattern: /^[A-Za-z]{3}$/,
    patternText: "three-letter geographical entity code (STANAG 1059)"
  }),
  platformType: def(
    "platformType",
    "AD",
    "Platform type (ELNOT/CENOT)",
    "text"
  ),
  equipmentTeardownTime: def(
    "equipmentTeardownTime",
    "AE",
    "Equipment teardown time (minutes)",
    "text"
  ),
  commonIdentifier: def("commonIdentifier", "AF", "Common identifier", "text"),
  headquartersElement: def(
    "headquartersElement",
    "AH",
    "Headquarters element",
    "text"
  ),
  installationComposition: def(
    "installationComposition",
    "AI",
    "Installation composition",
    "choice",
    { choices: COMPOSITION }
  ),
  engagementBar: def(
    "engagementBar",
    "AO",
    "Engagement bar (A:BBB-CC)",
    "graphic",
    {
      format: "A:BBB-CC",
      parts: [
        { name: "A", choices: app6dEngagementSource },
        { name: "BBB", choices: app6dEngagementStages },
        { name: "CC", choices: app6dEngagementWeapons }
      ]
    }
  ),
  guardedUnit: def("guardedUnit", "AQ", "Guarded unit", "choice", {
    choices: [["BG", "BG"]],
    maxLength: 2
  }),
  specialDesignator: def(
    "specialDesignator",
    "AR",
    "Special designator",
    "choice",
    {
      choices: [
        ["NRT", "Non-real time"],
        ["SIG", "Tactically significant"]
      ],
      maxLength: 3
    }
  )
};
const ALL_OPTION_KEYS = Object.keys(BASE).concat([
  "dtg",
  "combatEffectiveness"
]);
const NOT_APP6D_KEYS = {
  sigint: "R2 SIGINT",
  auxiliaryEquipmentIndicator: "AG auxiliary equipment"
};

function field(key, overrides) {
  const spec =
    key === "dtg"
      ? def("dtg", "W", "Date-time group", "text", { pattern: DTG_SHORT })
      : key === "combatEffectiveness"
        ? def("combatEffectiveness", "K", "Combat effectiveness", "text")
        : BASE[key];
  return Object.assign({}, spec, overrides || {});
}

// Per class: ordered field list, layout and source.
const UNIT_DTG = {
  pattern: DTG_UNIT,
  patternText: "DDHHMM[SS]ZMONYYYY or O/O (Table 3-2: four-digit year)",
  maxLength: 16
};
const SHORT_DTG = {
  patternText: "DDHHMM[SS]ZMONYY or O/O (Tables 3-16/3-22: two-digit year)",
  maxLength: 14
};
const sea = (key) => field(key);
const SPACE_HZ_NOTE =
  "D-SPACE (product policy): Table 6-2 PDF 362-363/6-5..6-6 lists this field for Space symbols, Figure 6-2 PDF 361/6-4 and section 6.2.4 item 2 (fields 1 through 5) show only T, V, X, G; it is accepted and drawn in the shared Z X / G H cells as in Air Figure 2-2 PDF 54/2-4 (the Space figure is the Air column without P)";
const UNIT_QUANTITY_NOTE =
  'C Quantity on a Land Unit: Figure 3-3 PDF 84/3-4 shows the B/C/D cell above the frame and Table 3-2 PDF 85/3-5 lists C; its description says "in an equipment symbol" (the generic wording repeated in every field table), so figure and table are read together and C is accepted and drawn above the echelon (Decision 5)';
function rows() {
  const out = [[]];
  for (let i = 0; i < arguments.length; i++) out.push(arguments[i]);
  return out;
}
const CLASS_DEF = {
  air: {
    fields: [
      "uniqueDesignation",
      "iffSif",
      "type",
      "speed",
      "altitudeDepth",
      "staffComments",
      "additionalInformation",
      "engagementBar"
    ].map(sea),
    layout: {
      left: [],
      right: rows(
        ["uniqueDesignation"],
        ["iffSif"],
        ["type"],
        ["speed", "altitudeDepth"],
        ["staffComments", "additionalInformation"]
      ),
      top: [],
      inner: [],
      bottom: []
    }
  },
  // D-SPACE (product policy, Decision 3): Table 6-2 PDF 362-363/6-5..6-6 lists
  // G, H, T, V, X and Z for Space symbols; Figure 6-2 PDF 361/6-4 draws only the
  // T, V, X, G cells and section 6.2.4 item 2 puts "fields 1 through 5" to the
  // right of the symbol. The Air figure of the same edition (Figure 2-2 PDF
  // 54/2-4) shows the right column T; P; V; Z/X; G/H, and the Space figure is
  // that column without P. H and Z are therefore ordinary valid fields and
  // share the cells Z X and G H, in the Air order (Z before X, G before H).
  space: {
    fields: [
      "uniqueDesignation",
      "type",
      "speed",
      "altitudeDepth",
      "staffComments",
      "additionalInformation",
      "engagementBar"
    ].map((k) =>
      k === "speed" || k === "additionalInformation"
        ? field(k, { note: SPACE_HZ_NOTE })
        : field(k)
    ),
    layout: {
      left: [],
      right: rows(
        ["uniqueDesignation"],
        ["type"],
        ["speed", "altitudeDepth"],
        ["staffComments", "additionalInformation"]
      ),
      top: [],
      inner: [],
      bottom: []
    }
  },
  landUnit: {
    fields: [
      field("specialDesignator", {
        kind: "text",
        choices: null,
        maxLength: null,
        examples: ["NRT", "SIG"]
      }),
      field("dtg", UNIT_DTG),
      field("altitudeDepth"),
      field("location", { maxLength: 22 }),
      field("type"),
      field("platformType"),
      field("equipmentTeardownTime"),
      field("uniqueDesignation"),
      field("speed"),
      field("reinforcedReduced"),
      field("staffComments"),
      field("additionalInformation"),
      field("commonIdentifier"),
      field("higherFormation"),
      field("evaluationRating"),
      field("combatEffectiveness", { kind: "choice", choices: UNIT_K }),
      field("iffSif"),
      field("specialHeadquarters"),
      field("headquartersElement"),
      // Decision 5: Figure 3-3 PDF 84/3-4 draws the B/C/D cell above the frame
      // and Table 3-2 PDF 85/3-5 has a C (Quantity) row. Its description reads
      // "A text amplifier in an equipment symbol", the generic wording that all
      // APP-6 field tables repeat; figure and table together give the field to
      // Land Unit, so it is accepted and drawn above the echelon.
      field("quantity", { note: UNIT_QUANTITY_NOTE }),
      field("engagementBar"),
      {
        key: "installationIndicator",
        field: "AC",
        label: "Installation indicator",
        kind: "graphic",
        maxLength: null,
        choices: null,
        supported: false,
        unresolved:
          "Land Unit AC is the installation graphic block, not country text; no SIDC digit and no renderer option exists"
      }
    ],
    layout: {
      left: rows(
        ["specialDesignator", "dtg"],
        ["altitudeDepth", "location"],
        ["type", "platformType", "equipmentTeardownTime"],
        ["uniqueDesignation"],
        ["speed"]
      ),
      right: rows(
        ["reinforcedReduced"],
        ["staffComments"],
        ["additionalInformation", "commonIdentifier"],
        ["higherFormation"],
        ["evaluationRating", "combatEffectiveness", "iffSif"]
      ),
      top: ["quantity"],
      inner: ["specialHeadquarters"],
      bottom: ["headquartersElement"]
    }
  },
  landEquipment: {
    fields: [
      field("dtg", SHORT_DTG),
      field("altitudeDepth"),
      field("location"),
      field("type"),
      field("platformType"),
      field("commonIdentifier"),
      field("uniqueDesignation"),
      field("speed"),
      field("country"),
      field("staffComments"),
      field("additionalInformation"),
      field("equipmentTeardownTime"),
      field("higherFormation"),
      field("evaluationRating"),
      field("combatEffectiveness", {
        kind: "choice",
        choices: EQUIPMENT_K,
        caseInsensitive: true
      }),
      field("signatureEquipment"),
      field("hostile"),
      field("iffSif"),
      field("quantity"),
      field("engagementBar", {
        unresolved:
          "D-EQ-AO: Figure 3-14 shows AO but Table 3-16 has no AO row",
        nonBlocking: true
      })
    ],
    layout: {
      left: rows(
        ["dtg"],
        ["altitudeDepth", "location"],
        ["type", "platformType", "commonIdentifier"],
        ["uniqueDesignation"],
        ["speed"]
      ),
      right: rows(
        ["country"],
        ["staffComments"],
        ["additionalInformation", "equipmentTeardownTime"],
        ["higherFormation"],
        [
          "evaluationRating",
          "combatEffectiveness",
          "signatureEquipment",
          "hostile",
          "iffSif"
        ]
      ),
      top: ["quantity"],
      inner: [],
      bottom: []
    }
  },
  landInstallation: {
    fields: [
      field("dtg", SHORT_DTG),
      field("altitudeDepth"),
      field("location"),
      field("installationComposition"),
      field("uniqueDesignation"),
      field("country"),
      field("staffComments"),
      field("additionalInformation"),
      field("equipmentTeardownTime", {
        unresolved:
          "D-INST-AE: Figure 3-18 shows AE but Table 3-22 has no AE row",
        nonBlocking: true
      }),
      field("higherFormation"),
      field("evaluationRating"),
      field("combatEffectiveness", {
        label: "Capacity of installation",
        kind: "text"
      })
    ],
    layout: {
      left: rows(
        ["dtg"],
        ["altitudeDepth", "location"],
        ["installationComposition"],
        ["uniqueDesignation"]
      ),
      right: rows(
        ["country"],
        ["staffComments"],
        ["additionalInformation", "equipmentTeardownTime"],
        ["higherFormation"],
        ["evaluationRating", "combatEffectiveness"]
      ),
      top: [],
      inner: [],
      bottom: []
    }
  },
  seaSurface: {
    fields: [
      "uniqueDesignation",
      "type",
      "iffSif",
      "staffComments",
      "additionalInformation",
      "location",
      "speed",
      "guardedUnit",
      "specialDesignator",
      "engagementBar"
    ].map((k) =>
      k === "iffSif"
        ? field(k, { label: "AIS (automatic identification system)" })
        : field(k)
    ),
    layout: {
      left: rows(["guardedUnit", "specialDesignator"]),
      right: rows(
        ["uniqueDesignation"],
        ["type"],
        ["iffSif"],
        ["staffComments", "additionalInformation"],
        ["location", "speed"]
      ),
      top: [],
      inner: [],
      bottom: []
    }
  },
  seaSubsurface: {
    fields: [
      "uniqueDesignation",
      "type",
      "altitudeDepth",
      "staffComments",
      "additionalInformation",
      "specialDesignator",
      "engagementBar"
    ].map((k) =>
      k === "altitudeDepth" ? field(k, { label: "Depth" }) : field(k)
    ),
    layout: {
      left: rows(["specialDesignator"]),
      right: rows(
        ["uniqueDesignation"],
        ["type"],
        ["altitudeDepth"],
        ["staffComments"],
        ["additionalInformation"]
      ),
      top: [],
      inner: [],
      bottom: []
    }
  }
};
CLASS_DEF.airMissile = CLASS_DEF.air;
CLASS_DEF.mineWarfare = CLASS_DEF.seaSubsurface;

// Amplifier digit rules per class (SIDC digits 8 and 9-10), Tables 3-2/3-16/3-22.
const AMPLIFIERS = {
  landUnit: { hqTfDummy: "01234567", kinds: ["echelon"] },
  landEquipment: { hqTfDummy: "01", kinds: ["mobility"] },
  landInstallation: { hqTfDummy: "0123", kinds: ["echelon"] },
  seaSurface: { hqTfDummy: "0", kinds: ["towedArray"] },
  seaSubsurface: { hqTfDummy: "0", kinds: ["towedArray"] },
  mineWarfare: { hqTfDummy: "0", kinds: [] },
  air: { hqTfDummy: "0", kinds: [] },
  airMissile: { hqTfDummy: "0", kinds: [] },
  space: { hqTfDummy: "0", kinds: [] }
};

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
    amplifier: p.substr(8, 2),
    entity6: p.substr(10, 6),
    sector1: p.substr(16, 2),
    sector2: p.substr(18, 2)
  };
}
export function app6dSymbolClass(sidc) {
  const set = parse(sidc).set;
  return SET_CLASS[set] || OUT_OF_SCOPE[set] || "";
}
function profiled(cls) {
  return (
    Object.prototype.hasOwnProperty.call(CLASS_DEF, cls) || cls === "unknown"
  );
}

// Entity classifiers used by the sector constraints (entity+type digits).
const SATELLITE = [
  "110600",
  "110700",
  "110900",
  "111000",
  "111100",
  "111200",
  "111300",
  "111400",
  "111500",
  "111700",
  "111800",
  "120300",
  "120400",
  "120500",
  "120600",
  "120700",
  "120800",
  "120900",
  "121100",
  "121200"
];
const entityIs = {
  rotaryWing: (e) => e.slice(0, 4) === "1102" || e.slice(0, 4) === "1202",
  satellite: (e) =>
    SATELLITE.indexOf(e.slice(0, 4) + "00") >= 0 || SATELLITE.indexOf(e) >= 0,
  submarine: (e) => e.slice(0, 4) === "1101",
  torpedo: (e) => e.slice(0, 4) === "1301",
  auvUuv: (e) => e.slice(0, 4) === "1104" || e.slice(0, 4) === "1202"
};
const LOCAL_TRACKS = {
  30: ["160000", "170000"],
  35: ["140000", "150000", "160000"]
};

function identityRules(p, errors) {
  const e = p.entity6;
  const need = (digit, text, page) => {
    if (p.identity !== digit) errors.push(text + " (" + page + ")");
  };
  if (p.set === "30" && e === "150000")
    need(
      "3",
      "Own Ship is used with a Friend standard identity only",
      "Table 5-4 PDF 316/5-28"
    );
  if (p.set === "30" && e === "160000")
    need(
      "0",
      "fused tracks have a Pending standard identity frame",
      "section 5.2.6 PDF 316/5-28"
    );
  if (p.set === "35" && (e === "140000" || e === "150000"))
    need(
      "0",
      "ETC/POSCON and fused tracks have a Pending standard identity frame",
      "Table 5-13 PDF 337/5-49"
    );
  if (p.set === "35" && e === "130200")
    need(
      "6",
      "IED is used with the Hostile standard identity only (Suspect does not substitute)",
      "Table 5-10 PDF 331/5-43"
    );
}

function sectorRules(p, cls, errors, notes, unresolved, vef) {
  const entityUnspecified = p.entity6.slice(0, 2) === "00";
  const local = (LOCAL_TRACKS[p.set] || []).indexOf(p.entity6) >= 0;
  const sectors = { sector1: p.sector1, sector2: p.sector2 };
  [1, 2].forEach((n) => {
    const code = n === 1 ? p.sector1 : p.sector2;
    if (code === "00" || !/^[0-9]{2}$/.test(code)) {
      if (!/^[0-9]{2}$/.test(code))
        errors.push("sector " + n + ": two digits required");
      return;
    }
    const status = classifySectorCode(p.set, n, code);
    const dict = sectorDictionary(p.set, n);
    const where = dict
      ? "Table " +
        dict.table +
        " PDF " +
        dict.pdf.join("-") +
        "/" +
        dict.printed.join("..")
      : "";
    if (status === "vef") {
      vef.push({ position: "sector" + n, code: code });
      return;
    }
    if (status === "reserved") {
      errors.push(
        "sector " +
          n +
          " code " +
          code +
          " is reserved for future use (" +
          where +
          ")"
      );
      return;
    }
    if (status === "undefined") {
      errors.push(
        dict
          ? "sector " + n + " code " + code + " is not defined (" + where + ")"
          : "sector " +
              n +
              " has no modifier dictionary for symbol set " +
              p.set +
              " in this edition (Annex A; Land Equipment section 3.4.7 PDF 210/3-130)"
      );
      return;
    }
    if (local)
      errors.push(
        "sector " +
          n +
          ": modifiers are not permitted with local track symbols (section 5.2.6 PDF 316/5-28; 5.3.7 PDF 336/5-48)"
      );
    if (entityUnspecified) return;
    const e = p.entity6;
    if (
      p.set === "01" &&
      n === 1 &&
      (code === "38" || code === "39") &&
      !entityIs.rotaryWing(e)
    )
      errors.push(
        "sector 1 code " +
          code +
          " must be paired with a rotary-wing icon (Table 2-5 PDF 73/2-23)"
      );
    if (
      p.set === "02" &&
      n === 2 &&
      Number(code) >= 7 &&
      Number(code) <= 11 &&
      p.sector1 !== "08"
    )
      errors.push(
        "sector 2 code " +
          code +
          " is used only with sector 1 08 Interceptor (Table 2-8 PDF 78-79/2-28..2-29)"
      );
    if (
      p.set === "05" &&
      n === 2 &&
      Number(code) >= 1 &&
      Number(code) <= 4 &&
      !entityIs.satellite(e)
    )
      errors.push(
        "sector 2 code " +
          code +
          " is used only with satellite icons (Table 6-5 PDF 372/6-15)"
      );
    if (p.set === "35" && n === 1) {
      const sub =
        ["02", "03"].indexOf(code) >= 0 ||
        (Number(code) >= 8 && Number(code) <= 18);
      if (sub && !entityIs.submarine(e))
        errors.push(
          "sector 1 code " +
            code +
            " is used with the SUBMARINE entity type only (Table 5-11 PDF 331-333/5-43..5-45)"
        );
      // D-SUB19 (Decision 4): Table 5-11 PDF 334/5-46 says "TORPEDO entity type
      // only" for 19 Anti-Torpedo Torpedo, Table A-38 PDF 814/A-100 says
      // "SUBMARINE entity type only". Each normative table permits one entity
      // type, so rejecting either would invalidate a symbol the other table
      // allows: valid with a TORPEDO or a SUBMARINE entity, with a note
      // (product policy). Any other entity stays an error.
      if (code === "19") {
        if (entityIs.torpedo(e) || entityIs.submarine(e))
          notes.push(
            "D-SUB19 (product policy): sector 1 code 19 Anti-Torpedo Torpedo is used with the TORPEDO entity type in Table 5-11 PDF 334/5-46 and with the SUBMARINE entity type in Table A-38 PDF 814/A-100; both are accepted"
          );
        else
          errors.push(
            "sector 1 code 19 is used with the TORPEDO (Table 5-11 PDF 334/5-46) or SUBMARINE (Table A-38 PDF 814/A-100) entity type only (D-SUB19)"
          );
      }
    }
    if (p.set === "35" && n === 2) {
      if (Number(code) >= 1 && Number(code) <= 13 && !entityIs.submarine(e))
        errors.push(
          "sector 2 code " +
            code +
            " is used with the SUBMARINE entity type only (Table 5-12 PDF 334-336/5-46..5-48)"
        );
      if (Number(code) >= 14 && Number(code) <= 16 && !entityIs.auvUuv(e))
        errors.push(
          "sector 2 code " +
            code +
            " is used with the AUV/UUV entity type only (Table 5-12 PDF 336/5-48)"
        );
    }
    if (p.set === "20")
      notes.push(
        "sector " +
          n +
          " code " +
          code +
          ": Table A-28/A-29 remarks (Electric Power, Telecommunication, CRBN) are recorded, not enforced; Table A-29 and Table 3-25 PDF 252-253 name the codes differently"
      );
  });
  if (
    entityUnspecified &&
    (p.sector1 !== "00" || p.sector2 !== "00" || p.entity6 !== "000000")
  )
    notes.push(
      "entity Unspecified (digits 11-12 = 00) with non-zero remaining digits: A.11 item 2 PDF 727/A-13 requires zeros; entity-dependent sector constraints are not evaluated (policy: keeps the symbol-table tests that build sector-only SIDCs evaluable)"
    );
  return sectors;
}

// The text is drawn either way, so a broken rule is a warning under the field.
function checkValue(spec, raw, p, warnings, notes) {
  const warn = (message) => warnings.push({ key: spec.key, message: message });
  const value = String(raw);
  const tag = spec.field + " " + spec.label;
  if (spec.maxLength != null && value.length > spec.maxLength)
    warn(tag + ": maximum " + spec.maxLength + " characters");
  if (spec.minLength != null && value.length < spec.minLength)
    warn(tag + ": minimum " + spec.minLength + " characters");
  if (spec.key === "engagementBar") {
    const message = app6dEngagementError(value);
    if (message)
      warn(
        "AO engagement bar: " +
          message +
          " (Tables 1-5, 1-6 PDF 40-41/1-16..1-17)"
      );
    return;
  }
  if (spec.kind === "choice" && spec.choices) {
    const allowed = spec.choices.map((c) => c[0]).concat(spec.alternates || []);
    const probe = spec.caseInsensitive ? value.toLowerCase() : value;
    const pool = spec.caseInsensitive
      ? allowed.map((a) => a.toLowerCase())
      : allowed;
    if (pool.indexOf(probe) < 0)
      warn(
        tag + ": use one of " + spec.choices.map((c) => c[0]).join(", ")
      );
    if (
      spec.key === "reinforcedReduced" &&
      (spec.alternates || []).indexOf(value) >= 0
    )
      notes.push(
        "F: parenthesised form accepted; Table 3-2 PDF 85/3-5 writes (+) (-) (±), Table 3-9 PDF 149/3-69 writes + - ± (D-F)"
      );
  }
  if (spec.pattern && !spec.pattern.test(value))
    warn(tag + ": " + (spec.patternText || "invalid format"));
}

function validate(sidc, options) {
  const p = parse(sidc);
  const cls = app6dSymbolClass(sidc);
  const errors = [];
  const notes = [];
  const warnings = [];
  const unresolved = [];
  const vef = [];
  const opt = options || {};
  const details = {
    profile: "app6d",
    symbolClass: cls,
    context: p.context,
    standardIdentity: p.identity,
    modifierErrors: errors,
    fieldWarnings: warnings,
    notes: notes,
    unresolved: unresolved,
    versionExtension: vef
  };
  if (!profiled(cls)) {
    if (OUT_OF_SCOPE[p.set])
      notes.push(
        "symbol set " +
          p.set +
          " is classified out of this profile's scope (not silently extended); no APP-6(D) modifier rules applied"
      );
    return { valid: true, details: details };
  }
  if (p.sidc.length !== 20 && p.sidc.length !== 30)
    notes.push(
      "SIDC has " +
        p.sidc.length +
        " digits; the base is 20 digits (30 with the third ten digits, D-EXT)"
    );
  // Context, identity, status, HQ/TF/dummy, amplifier (Annex A tables A-2, A-6, A-7, A-8).
  if (["0", "1", "2"].indexOf(p.context) < 0)
    errors.push(
      "context " +
        p.context +
        " is reserved for future use (Table A-2 PDF 718/A-4)"
    );
  if (p.context === "1" || p.context === "2")
    notes.push(
      "context " +
        p.context +
        " is US use only in this standard (Table A-2 note 1)"
    );
  if (app6dIdentities.map((i) => i.digit).indexOf(p.identity) < 0)
    errors.push(
      "standard identity " +
        p.identity +
        " is reserved for future use (Table A-2 PDF 718/A-4)"
    );
  details.identityName = app6dIdentityName(p.context, p.identity);
  details.uncertainIdentity = ["0", "2", "5"].indexOf(p.identity) >= 0;
  if (p.status === "9") vef.push({ position: "status", code: "9" });
  else if ("012345".indexOf(p.status) < 0)
    errors.push(
      "status " +
        p.status +
        " is reserved for future use (Table A-6 PDF 723/A-9)"
    );
  if (p.status === "1" && details.uncertainIdentity)
    notes.push(
      "planned status is not shown on an uncertain-identity (dotted) frame (section 1.2.1 item c(3) PDF 33/1-9)"
    );
  if (["2", "3", "4", "5"].indexOf(p.status) >= 0) {
    if (cls === "landUnit")
      errors.push(
        "operational condition (status " +
          p.status +
          ") is N/A for Land Unit (Tables 1-3/1-4 PDF 35/1-11; Figure 3-3 shows AL, D-UNIT-AL)"
      );
    if (cls === "unknown")
      notes.push(
        "Unknown dimension has no Table 1-3/1-4 column; operational condition is not evaluated"
      );
    notes.push(
      "AL colours: Table 1-4 bar colours (PDF 35) differ from the red/green examples in the section tables (D-AL-01); threat and condition are not merged"
    );
  }
  const amps = AMPLIFIERS[cls];
  if (p.hqtfd === "9") vef.push({ position: "hqTaskForceDummy", code: "9" });
  else if (p.hqtfd === "8")
    errors.push(
      "HQ/task force/dummy 8 is reserved for future use (Table A-7 PDF 723/A-9)"
    );
  else if (!/^[0-7]$/.test(p.hqtfd))
    errors.push(
      "HQ/task force/dummy " + p.hqtfd + " is not defined (Table A-7)"
    );
  else if (amps && amps.hqTfDummy.indexOf(p.hqtfd) < 0)
    // A.9 item 2: "Code values exist for each of the eight possible combinations",
    // with graphics for each dimension. The class tables only say what they show.
    notes.push(
      "HQ/task force/dummy " +
        p.hqtfd +
        " on " +
        cls +
        ": valid and drawn, A.9 item 2 PDF 724/A-10 defines the eight codes for every dimension; Tables 3-2, 3-16, 3-22 give AB to units, equipment and installations, D to units and S to units and installations"
    );
  const kind = app6dAmplifierKind(p.amplifier);
  if (kind === "vef") vef.push({ position: "amplifier", code: p.amplifier });
  else if (kind === "reserved")
    errors.push(
      "echelon/mobility/towed array " +
        p.amplifier +
        " is reserved for future use (Table A-8 PDF 724-726/A-10..A-12)"
    );
  else if (kind === "undefined")
    errors.push(
      "echelon/mobility/towed array " +
        p.amplifier +
        " is not defined (Table A-8)"
    );
  else if (kind === "leadership")
    errors.push(
      "leadership indicator " +
        p.amplifier +
        " belongs to set 27 (out of scope)"
    );
  else if (kind !== "none" && amps && amps.kinds.indexOf(kind) < 0)
    errors.push(
      kind +
        " amplifier " +
        p.amplifier +
        " is not defined for " +
        cls +
        " (Tables 3-2, 3-16, 3-22)"
    );
  if (kind === "echelon" && cls === "landInstallation")
    notes.push(
      "echelon on installations follows section 1.2.1 item 2 PDF 36/1-12; Table 3-22 and Figure 3-18 omit B"
    );
  if (kind === "towedArray")
    notes.push(
      "towed array amplifier: glyph in Table 3-19 PDF 211-212/3-131..3-132; the Chapter 5 amplifier figures define no R placement"
    );
  identityRules(p, errors);
  const sectors = sectorRules(p, cls, errors, notes, unresolved, vef);
  details.sectors = sectors;
  // Text and graphic amplifiers.
  const specs = {};
  const list = (CLASS_DEF[cls] || { fields: [] }).fields;
  list.forEach((s) => {
    specs[s.key] = s;
  });
  const hostileGroup = p.identity === "5" || p.identity === "6";
  if (CLASS_DEF[cls]) {
    ALL_OPTION_KEYS.forEach((key) => {
      const raw = opt[key] == null ? "" : String(opt[key]);
      if (raw === "") return;
      const spec = specs[key];
      if (!spec) {
        errors.push(
          (BASE[key] ? BASE[key].field : key) +
            " " +
            key +
            " is not defined for " +
            cls +
            " (" +
            SOURCE[cls] +
            ")" +
            (key === "country" && cls === "landUnit"
              ? "; Land Unit AC is the installation graphic block (D-AC)"
              : "")
        );
        return;
      }
      if (spec.unresolved && !spec.nonBlocking) {
        unresolved.push({ id: key, detail: spec.unresolved });
        return;
      }
      if (spec.unresolved) notes.push(spec.unresolved);
      if (spec.note) notes.push(spec.note);
      if (spec.hostileOnly && !hostileGroup)
        errors.push(
          spec.field +
            " " +
            spec.label +
            " applies to hostile equipment only (Table 3-16 PDF 163/3-83)"
        );
      checkValue(spec, raw, p, warnings, notes);
      if (spec.requiresEchelonDivisionOrBelow) {
        const a = p.amplifier;
        const divisionOrBelow = /^1[1-8]$/.test(a) || a === "21" || a === "00";
        if (!divisionOrBelow)
          errors.push(
            "F is used at division and below (section 3.3.8 item 4 PDF 148/3-68); echelon " +
              a +
              " is higher or is not a size echelon"
          );
        if (a === "00")
          notes.push(
            "F with unspecified echelon: division-and-below cannot be checked (policy: allowed)"
          );
      }
    });
    Object.keys(NOT_APP6D_KEYS).forEach((key) => {
      if (opt[key])
        errors.push(
          key +
            " (" +
            NOT_APP6D_KEYS[key] +
            ") is not an APP-6(D) field (Annex field tables)"
        );
    });
    if (
      opt.direction != null &&
      opt.direction !== "" &&
      cls === "landInstallation"
    )
      errors.push(
        "Q on installations is the offset-location line, not a direction arrow (Table 3-22 PDF 217/3-137)"
      );
    const type = String(
      opt.engagementType == null ? "" : opt.engagementType
    ).toUpperCase();
    if (type !== "") {
      if (["TARGET", "NON-TARGET", "EXPIRED"].indexOf(type) < 0)
        errors.push(
          "engagementType must be TARGET, NON-TARGET or EXPIRED (section 1.2.1 item 11 PDF 38-39/1-14..1-15)"
        );
      else if (!hostileGroup)
        errors.push(
          "target designation colours apply to hostile tracks (section 1.2.1 item 11 PDF 38-39/1-14..1-15)"
        );
    }
  }
  if (
    cls === "unknown" &&
    p.context === "1" &&
    p.identity !== "0" &&
    p.identity !== "1"
  )
    notes.push(
      "Exercise context with the Unknown dimension draws no frame unless the identity is Pending or Unknown: the renderer keeps the MIL-STD-2525(D) rule, and this edition leaves exercise frames to 2525(D) (Table A-2 note 1 and A.6 item 3 PDF 718-719/A-4..A-5)"
    );
  if (cls === "unknown")
    notes.push(
      "Unknown dimension: no source layout or field matrix (Figure 1-4 PDF 34/1-10 has unlabeled cells); legacy rows kept, no field restrictions (policy)"
    );
  if (vef.length)
    notes.push(
      "Version Extension Flag used; extension content cannot be interpreted here (D-EXT)"
    );
  details.separator = " ";
  const valid =
    errors.length === 0 && unresolved.length === 0 && vef.length === 0;
  return { valid: valid, details: details };
}

export const app6dProfile = {
  id: "app6d",
  symbolClass: app6dSymbolClass,
  fields(sidc) {
    const def_ = CLASS_DEF[app6dSymbolClass(sidc)];
    return def_ ? def_.fields : null;
  },
  unavailableReason(key, sidc) {
    const cls = app6dSymbolClass(sidc);
    const def_ = CLASS_DEF[cls];
    if (!def_) return "";
    if (NOT_APP6D_KEYS[key])
      return NOT_APP6D_KEYS[key] + " is not an APP-6(D) field";
    const spec = def_.fields.filter((f) => f.key === key)[0];
    if (!spec)
      return key + " is not defined for " + cls + " (" + SOURCE[cls] + ")";
    if (spec.unresolved && !spec.nonBlocking) return spec.unresolved;
    if (spec.hostileOnly && ["5", "6"].indexOf(parse(sidc).identity) < 0)
      return "hostile equipment only";
    return "";
  },
  validate: validate,
  textLayout(sidc) {
    const def_ = CLASS_DEF[app6dSymbolClass(sidc)];
    return def_ ? Object.assign({ separator: " " }, def_.layout) : null;
  },
  // Extra API for editors (not part of the common contract).
  source(sidc) {
    return SOURCE[app6dSymbolClass(sidc)] || "";
  },
  amplifiers(sidc) {
    return AMPLIFIERS[app6dSymbolClass(sidc)] || null;
  }
};
