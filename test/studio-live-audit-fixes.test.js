// Regression tests for the live-site audit of 3 November 2026
// (output/live-site-audit). Expected values come from the publications the
// profiles cite: MIL-STD-2525C Table IV (PDF 28-30/22-24)
// and Table A-III (PDF 87-88/81-82); APP-6A Table III (PDF 25-27/19-21);
// APP-6D section 1.2.1 items 11-12 (PDF 38-39) and Table 3-22 (PDF 217-219).
import legacyStandards from "mil-std-2525";
import natoStandards from "stanag-app6";
import {
  std2525cProfile,
  std2525cTableIV
} from "../studio/profiles/std2525c.js";
import { app6aProfile, app6aTextFields } from "../src/modifierprofiles/app6a.js";
import { app6dProfile } from "../studio/profiles/app6d.js";
import {
  profileFieldStates,
  dtgForField,
  legacyDefaultModifier,
  inBranch,
  baseBranch,
  groupEntries,
  paletteSections,
  entryCrumbs
} from "../studio/editor-helpers.js";
import { textModifiers } from "../studio/modifier-fields.js";
import {
  movementControls,
  engagementTypeState,
  editionField,
  editorGaps
} from "../studio/profile-controls.js";
import { fieldGuide } from "../studio/field-guide.js";

// -------------------------------- 2. 2525C catalogue installations keep H
const collect = (dataset) => {
  const rows = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node.mainIcon)) node.mainIcon.forEach((item) => rows.push(item));
    for (const [key, child] of Object.entries(node)) if (key !== "mainIcon") walk(child);
  };
  walk(dataset);
  return rows;
};
const rows2525c = collect(legacyStandards.ms2525c);
const withH = rows2525c.filter((item) => legacyDefaultModifier(item, { installationModifier: true }) === "H-");
const installation = {
  "every 2525C ground installation gets H, nothing else does (Table A-III)": [
    {
      count: withH.length,
      allInstallations: withH.every((item) => item.codingscheme === "S" && item.battledimension === "G" && item.functionid.startsWith("I")),
      militaryBase: withH.some((item) => item.functionid === "IB----")
    },
    { count: 51, allInstallations: true, militaryBase: true }
  ],
  "an edition that does not print it gets none": [
    collect(natoStandards.app6b).filter((item) => legacyDefaultModifier(item)).length,
    0
  ],
  "Military Base/Facility with H is valid": [
    std2525cProfile.validate("SFGPIB----H----", {}).valid,
    true
  ]
};

// ------------------------------------- 3. APP-6D engagement bar colour
const ao = (profile, sidc) => {
  const states = profileFieldStates(textModifiers, profile, sidc);
  const bar = states.find((item) => item.key === "engagementBar");
  return engagementTypeState(profile, sidc, Boolean(bar && bar.available));
};
const engagement = {
  "APP-6D hostile equipment offers TARGET, NON-TARGET and EXPIRED": [
    {
      state: ao(app6dProfile, "10061500001201000000"),
      valid: ["TARGET", "NON-TARGET", "EXPIRED"].map(
        (engagementType) => app6dProfile.validate("10061500001201000000", { engagementBar: "ENG-M", engagementType }).valid
      )
    },
    { state: { available: true, reason: "" }, valid: [true, true, true] }
  ],
  "APP-6D hostile air too": [ao(app6dProfile, "10060100001101000000").available, true],
  "APP-6D friendly equipment: colours are for hostile tracks": [
    ao(app6dProfile, "10031500001201000000"),
    {
      available: false,
      reason: "target designation colours apply to hostile tracks (section 1.2.1 item 11 PDF 38-39/1-14..1-15)"
    }
  ],
  "APP-6D installation has no AO, so no colour": [
    ao(app6dProfile, "10062000001101000000").available,
    false
  ],
  "2525C defines no engagement bar type": [
    ao(std2525cProfile, "SHGPEWM--------"),
    { available: false, reason: "This edition defines no engagement bar type" }
  ],
  "APP-6A has no AO": [ao(app6aProfile, "SHGPEWAL-------").available, false],
  "an edition without a profile keeps it with AO": [
    engagementTypeState(null, "10061500001201000000", true).available,
    true
  ]
};

// ---------------------------------------------- 4. Q and AJ by class
const movement = (profile, sidc, title) => {
  const result = movementControls(profile, sidc, title);
  return [result.direction.applies, result.speedLeader.applies];
};
const movementCases = {
  "2525C unit and equipment take Q and AJ": [
    [movement(std2525cProfile, "SFGPUCI--------"), movement(std2525cProfile, "SFGPEWM--------")],
    [[true, true], [true, true]]
  ],
  "2525C installation takes neither (Table IV)": [
    {
      applies: movement(std2525cProfile, "SFGPIB----H----"),
      reason: movementControls(std2525cProfile, "SFGPIB----H----").direction.reason
    },
    {
      applies: [false, false],
      reason: "Q direction: not applicable to installation symbols (Table IV)"
    }
  ],
  "APP-6D installation: Q is the offset location line, not an arrow": [
    {
      applies: movement(app6dProfile, "10032000001101000000"),
      reason: movementControls(app6dProfile, "10032000001101000000").direction.reason
    },
    {
      applies: [false, false],
      reason: "Q on installations is the offset-location line, not a direction arrow (Table 3-22 PDF 217/3-137)"
    }
  ],
  "APP-6D unit and equipment take Q and AJ": [
    [movement(app6dProfile, "10031000141211000000"), movement(app6dProfile, "10031500001201000000")],
    [[true, true], [true, true]]
  ],
  "APP-6A units, equipment and installations take Q; Table III has no AJ": [
    {
      applies: ["SFGPUCI--------", "SFGPEWAL-------", "SFGPI-----H----"].map((sidc) => movement(app6aProfile, sidc, "APP-6A Table III")),
      reason: movementControls(app6aProfile, "SFGPI-----H----", "APP-6A Table III").speedLeader.reason,
      tableIII: app6aTextFields.some((field) => field.field === "AJ")
    },
    {
      applies: [[true, false], [true, false], [true, false]],
      reason: "APP-6A Table III has no AJ speed leader",
      tableIII: false
    }
  ],
  "no profile, no restriction": [movement(null, "10032000001101000000"), [true, true]]
};

// ------------------------------------ 5. names and gaps of each edition
const gaps = (standardId, profile, sidc) =>
  editorGaps({
    standardId,
    profile,
    sidc,
    tables: { app6a: app6aTextFields, "2525c": std2525cTableIV },
    movement: movementControls(profile, sidc)
  }).map((row) => `${row.field} ${row.label}`);
const tables = { app6a: app6aTextFields, "2525c": std2525cTableIV };
const names = {
  "2525C names its own fields; other editions' AC/AH/AI/AQ/AR are not listed": [
    ["country", "headquartersElement", "installationComposition", "guardedUnit", "specialDesignator", "platformType", "quantity"].map(
      (key) => editionField("2525c", key, tables)
    ),
    [null, null, null, null, null, { field: "AD", label: "Platform Type" }, { field: "C", label: "Quantity" }]
  ],
  "APP-6A lists only Table III fields": [
    ["country", "engagementBar", "hostile"].map((key) => editionField("app6a", key, tables)),
    [null, null, { field: "N", label: "Hostile indicator (ENY)" }]
  ],
  "APP-6D keeps the form's names (every key is an APP-6D field)": [
    editionField("app6d", "country", tables),
    undefined
  ],
  "2525C unit: AH, AI, AK and the S offset are not supported here": [
    gaps("2525c", std2525cProfile, "SFGPUCI--------"),
    ["AH Area of Uncertainty", "AI Dead Reckoning Trailer", "AK Pairing Line", "S Offset Location Indicator"]
  ],
  "2525C installation: only the S offset": [
    gaps("2525c", std2525cProfile, "SFGPIB----H----"),
    ["S Offset Location Indicator"]
  ],
  "APP-6D land unit: the AC installation graphic": [
    gaps("app6d", app6dProfile, "10031000141211000000"),
    ["AC Installation indicator"]
  ],
  "APP-6D installation: the Q offset location line": [
    gaps("app6d", app6dProfile, "10032000001101000000"),
    ["Q Offset location indicator"]
  ],
  "APP-6A installation: the S location offset; equipment has it": [
    [gaps("app6a", app6aProfile, "SFGPI-----H----"), gaps("app6a", app6aProfile, "SFGPEWAL-------")],
    [["S Location offset indicator"], []]
  ]
};

// --------------------------------------------- 6. edition-specific help
const field = (key) => textModifiers.find((item) => item.key === key);
const guide = {
  "APP-6D installation AI lists its component types (Table 3-22)": [
    (({ description, example }) => ({ types: /Development, Research, Production, Service, Storage or Utility/.test(description), example }))(
      fieldGuide("app6d", "landInstallation", field("installationComposition"))
    ),
    { types: true, example: "Production" }
  ],
  "APP-6A location is latitude and longitude, not MGRS": [
    (({ description, example }) => ({ wgs: /WGS-84/.test(description), mgrs: /\d{2}[A-Z] [A-Z]{2} /.test(example) }))(
      fieldGuide("app6a", "unit", field("location"))
    ),
    { wgs: true, mgrs: false }
  ],
  "2525C AO gives no code list": [
    /no code list/.test(fieldGuide("2525c", "equipment", field("engagementBar")).description),
    true
  ],
  "fields without an edition entry keep the shared wording": [
    fieldGuide("app6d", "landUnit", field("staffComments")),
    { description: field("staffComments").description, example: "READY", format: "", printed: null }
  ]
};

// ---------------------------------- 7. Now (UTC) in the printed format
const now = new Date(Date.UTC(2026, 10, 3, 9, 30, 15));
const dtg = (profile, standardId, sidc) => {
  const definition = profileFieldStates(textModifiers, profile, sidc).find((item) => item.key === "dtg");
  const value = dtgForField(now, definition, fieldGuide(standardId, profile.symbolClass(sidc), field("dtg")).printed);
  return { value, valid: profile.validate(sidc, { dtg: value }).valid };
};
const nowCases = {
  "APP-6A W: DDHHMMSSZMONYY, 14 characters (Table III)": [
    dtg(app6aProfile, "app6a", "SFGPUCI--------"),
    { value: "03093015ZNOV26", valid: true }
  ],
  "2525C W: DDHHMMSSZMONYYYY, 16 characters (Table IV)": [
    dtg(std2525cProfile, "2525c", "SFGPIB----H----"),
    { value: "03093015ZNOV2026", valid: true }
  ],
  "APP-6D keeps the year of the class pattern": [
    [dtg(app6dProfile, "app6d", "10031000141211000000").value, dtg(app6dProfile, "app6d", "10031500001201000000").value],
    ["030930ZNOV2026", "030930ZNOV26"]
  ]
};

// -------------------- 8. L and N follow each edition's own identity rule
const ln = (profile, sidc) => {
  const states = profileFieldStates(textModifiers, profile, sidc);
  return ["signatureEquipment", "hostile"].map((key) => states.find((item) => item.key === key).available);
};
const identities = {
  "APP-6A: L for hostile equipment; N is equipment text for any identity (Table III)": [
    [ln(app6aProfile, "SFGPEWAL-------"), ln(app6aProfile, "SHGPEWAL-------")],
    [[false, true], [true, true]]
  ],
  "2525C: L for hostile equipment; N for equipment (Table IV)": [
    [ln(std2525cProfile, "SFGPEWM--------"), ln(std2525cProfile, "SHGPEWM--------")],
    [[false, true], [true, true]]
  ],
  "APP-6D: L and N for hostile equipment only (Table 3-16)": [
    [ln(app6dProfile, "10031500001201000000"), ln(app6dProfile, "10061500001201000000")],
    [[false, false], [true, true]]
  ],
  "units take neither in any edition": [
    [ln(app6aProfile, "SHGPUCI--------"), ln(std2525cProfile, "SHGPUCI--------"), ln(app6dProfile, "10061000141211000000")],
    [[false, false], [false, false], [false, false]]
  ]
};

// ------------------------- 9. palette groups from the catalogue paths
const groundUnits = [
  { name: "GROUND TRACK", path: ["GROUND TRACK"] },
  { name: "UNIT", path: ["GROUND TRACK", "UNIT"] },
  { name: "COMBAT", path: ["GROUND TRACK", "UNIT", "COMBAT"] },
  { name: "AIR DEFENSE", path: ["GROUND TRACK", "UNIT", "COMBAT", "AIR DEFENSE"] },
  { name: "SHORT RANGE", path: ["GROUND TRACK", "UNIT", "COMBAT", "AIR DEFENSE", "SHORT RANGE"] },
  { name: "CHAPARRAL", path: ["GROUND TRACK", "UNIT", "COMBAT", "AIR DEFENSE", "SHORT RANGE", "CHAPARRAL"] },
  { name: "INFANTRY", path: ["GROUND TRACK", "UNIT", "COMBAT", "INFANTRY"] },
  { name: "COMBAT SUPPORT", path: ["GROUND TRACK", "UNIT", "COMBAT SUPPORT"] },
  { name: "MILITARY POLICE", path: ["GROUND TRACK", "UNIT", "COMBAT SUPPORT", "MILITARY POLICE"] }
];
const base = baseBranch(groundUnits);
const groups = {
  "a set starts below the levels all its entries share": [base, ["GROUND TRACK", "UNIT"]],
  "groups one level down hold more than one entry; the rest are loose": [
    (({ loose, groups }) => ({ loose: loose.map((icon) => icon.name), groups: groups.map((group) => [group.name, group.icons.length]) }))(groupEntries(groundUnits, base)),
    { loose: ["GROUND TRACK", "UNIT"], groups: [["COMBAT", 5], ["COMBAT SUPPORT", 2]] }
  ],
  "the palette shows a heading per group and subheadings for their groups": [
    paletteSections(groundUnits, base).map((section) => ({
      name: section.name,
      loose: section.loose.map((icon) => icon.name),
      groups: section.groups.map((group) => [group.name, group.icons.map((icon) => icon.name)])
    })),
    [
      { name: "", loose: ["GROUND TRACK", "UNIT"], groups: [] },
      { name: "COMBAT", loose: ["COMBAT", "INFANTRY"], groups: [["AIR DEFENSE", ["AIR DEFENSE", "SHORT RANGE", "CHAPARRAL"]]] },
      { name: "COMBAT SUPPORT", loose: ["COMBAT SUPPORT", "MILITARY POLICE"], groups: [] }
    ]
  ],
  "a group holds its own entry and everything under it": [
    groundUnits.filter((icon) => inBranch(icon, ["GROUND TRACK", "UNIT", "COMBAT", "AIR DEFENSE"])).map((icon) => icon.name),
    ["AIR DEFENSE", "SHORT RANGE", "CHAPARRAL"]
  ],
  "the heading names the groups above an entry, not the entry itself": [
    entryCrumbs(groundUnits[5], base).map((crumb) => crumb.name),
    ["COMBAT", "AIR DEFENSE", "SHORT RANGE"]
  ],
  "each crumb opens its group": [
    entryCrumbs(groundUnits[5], base)[1].branch,
    ["GROUND TRACK", "UNIT", "COMBAT", "AIR DEFENSE"]
  ],
  "an entry above the base has no crumbs": [entryCrumbs(groundUnits[0], base), []]
};

export default {
  "9 palette groups": groups,
  "2 2525C catalogue installations": installation,
  "3 engagement bar colour with AO": engagement,
  "4 direction and speed leader by edition and class": movementCases,
  "5 field names and editor gaps": names,
  "6 edition-specific help": guide,
  "7 Now (UTC) format": nowCases,
  "8 L and N by identity": identities
};
