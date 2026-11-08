import { app6aSymbolClass, app6aTextFields, getApp6aFields } from "./vendor/letter-metadata.js";
import * as app6aRules from "./vendor/modifierprofiles/app6a.js";
import { std2525cProfile, std2525cTableIV } from "./profiles/std2525c.js";
import { app6bProfile, app6bTableI } from "./profiles/app6b.js";
import { app6eFields, app6eProfile } from "./profiles/app6e.js";
import { std2525dFields, std2525dProfile } from "./profiles/std2525d.js";
import { std2525eFields, std2525eProfile } from "./profiles/std2525e.js";
import {
  app6dProfile,
  app6dIdentityName,
  app6dStatuses,
  app6dEngagementError
} from "./profiles/app6d.js";
import * as app6dSectors from "./profiles/app6d-sectors.js";
import { editionCheck } from "./edition-check.js";
import { completeEditorSidc, copiedSidc, decodeEditorSidc, displayEditorSidc, editImportedSidc, numericSidcEdition, standardForSidc } from "./sidc-editor.js";
import { modifierGroups, textModifiers, collectTextModifiers } from "./modifier-fields.js";
import {
  probeOffers,
  patchSidc,
  shortReason,
  humanize,
  classWords,
  sectorChoices,
  sectorStatusLabels,
  parseEngagement,
  composeEngagement,
  engagementOptions,
  fieldMeaning,
  carryWarnings,
  fieldRule,
  profileExtraFields,
  profileDetailLines,
  movementControls,
  engagementTypeState,
  editionField,
  editorGaps
} from "./profile-controls.js";

import { exportFilename, pngOutputSize, pngScale, fieldStates, profileFieldStates, dtgForField, evaluationRating, sidcParts, pushRecent, placeholderOptions, readTextRows, fieldValueChars, fitRowWidths, layoutFieldBoxes, paletteProgress, baseBranch, entryCrumbs, groupEntries, paletteSections, matchesSearch, normalize, mobilities, mobilityModeName, amplifierChoice, amplifierPlacementNote, sharedViewBox, withViewBox, modifierColorUnused, modifierChoice, centeredGlyphs, frameShapeChoice, problemReasons, gridChoice, designationNotes, amplifierNotes, countryFlagNote } from "./editor-helpers.js";
import { createGlyphPicker } from "./glyph-picker.js";
import { createDraftAutosave, createDraftStore, draftStateKeys, sameDraft } from "./draft-store.js";
import { setupInfoPopovers } from "./info-popover.js";
import { fieldReference } from "./field-reference.js";
import { fieldGuide } from "./field-guide.js";
import { app6aIdentities, contextLabel, contextOptions, convertIdentity, decodeIdentity, identityCode, identityLabel, identityList, isUsOnlyContext, usOnlyIdentityLabel } from "./identities.js";
import { createCountryFlagPart } from "./country-flags.js";
import { countryCodeForFlag, countryFlagFromSidc, countrySidcField, withCountryFlag } from "./country-codes.js";

const standards = [
  {
    id: "app6a",
    label: "APP‑6A",
    detail: "NATO / 1998",
    family: "legacy",
    standard: "APP6A",
    version: ""
  },
  {
    id: "app6b",
    label: "APP‑6B",
    detail: "NATO / 15 CHAR",
    family: "legacy",
    standard: "APP6",
    version: ""
  },
  {
    id: "app6d",
    label: "APP‑6D",
    detail: "NATO / D",
    family: "modern",
    standard: "APP6",
    version: "10"
  },
  {
    id: "app6e",
    label: "APP‑6E",
    detail: "NATO / E",
    family: "modern",
    standard: "APP6",
    // Table A-1 PDF 747/713: 13 is MIL-STD-2525E, 16 is APP-06(E)(2).
    version: "16",
    coverage: "Compatibility view",
    coverageNote: "APP-6E has no catalog of its own here: the symbols come from the shared 2525E catalog. Field positions and rules follow APP-06 Edition E Version 2."
  },
  {
    id: "2525c",
    label: "MIL‑2525C",
    detail: "15 CHAR",
    family: "legacy",
    standard: "2525",
    version: ""
  },
  {
    id: "2525d",
    label: "MIL‑2525D",
    detail: "NUMERIC / D",
    family: "modern",
    standard: "2525",
    version: "10"
  },
  {
    id: "2525e",
    label: "MIL‑2525E",
    detail: "NUMERIC / E",
    family: "modern",
    standard: "2525",
    version: "13"
  }
];

// Edition modifier profiles shared with the renderer. APP-6A falls back to its
// Table III helpers until the edition exports a profile object.
const profiles = { app6a: app6aRules.app6aProfile, app6b: app6bProfile, "2525c": std2525cProfile, app6d: app6dProfile, "2525d": std2525dProfile, "2525e": std2525eProfile, app6e: app6eProfile };
const profileNotes = {
  app6a: "APP-6A Table III (pp. 19–21). Only applicable fields are editable; limits follow the publication.",
  "2525c": "MIL-STD-2525C Table IV (pp. 22–24) for warfighting (S) symbols. Only applicable fields are editable; limits follow the publication.",
  app6d: "APP-6D amplifier tables of this symbol set. Only applicable fields are editable; limits appear only where the publication sets one.",
  app6b: "APP-6(B) Table I (pp. 2-8 to 2-10) for warfighting (S) symbols. Only applicable fields are editable; limits follow the publication.",
  "2525d": "MIL-STD-2525D Change 1 Table VII and the placement figure of this symbol set. Only applicable fields are editable.",
  "2525e": "MIL-STD-2525E Change 1 Table VI and the placement figure of this symbol set. Only applicable fields are editable.",
  app6e: "APP-06 Edition E Version 2 Table 1-5 and the placement figure of this symbol set. Only applicable fields are editable."
};
const profileTitles = { app6a: "APP-6A Table III", app6b: "APP-6(B) Table I", "2525c": "MIL-STD-2525C Table IV", app6d: "APP-6D", "2525d": "MIL-STD-2525D", "2525e": "MIL-STD-2525E", app6e: "APP-6(E)" };
// Field tables that name a form key the way the edition does (see editionField).
const editionTables = { app6a: app6aRules.app6aTextFields, app6b: app6bTableI, "2525c": std2525cTableIV, "2525d": std2525dFields, "2525e": std2525eFields, app6e: app6eFields };
const activeProfile = () => profiles[state.standardId] || null;
// Q and AJ for the symbol, as the edition profile allows them.
const movementFor = (sidc) => movementControls(activeProfile(), sidc, profileTitles[state.standardId]);
// Names come from the edition's own table when its profile has one: APP-6D
// names Joker and Faker only with context 1 and calls status 2-5 "Present/...".
function identityLabelFor(entry, context = state.context) {
  const named = state.standardId === "app6d" && entry.numeric && app6dIdentityName(context, entry.numeric);
  return usOnlyIdentityLabel(config(), named || identityLabel(entry, context));
}
function statusLabelFor(entry) {
  const named = state.standardId === "app6d" && app6dStatuses.find((item) => item.digit === entry.numeric);
  return named ? named.name : entry.label;
}
const statuses = [
  { value: "present", label: "Present", numeric: "0", legacy: "P" },
  {
    value: "planned",
    label: "Planned / anticipated",
    numeric: "1",
    legacy: "A"
  },
  { value: "fullyCapable", label: "Fully capable", numeric: "2", legacy: "C" },
  { value: "damaged", label: "Damaged", numeric: "3", legacy: "D" },
  { value: "destroyed", label: "Destroyed", numeric: "4", legacy: "X" },
  {
    value: "fullToCapacity",
    label: "Full to capacity",
    numeric: "5",
    legacy: "F"
  }
];

const echelons = [
  ["", "Unspecified", "00", "-"],
  ["team", "Team / crew", "11", "A"],
  ["squad", "Squad", "12", "B"],
  ["section", "Section", "13", "C"],
  ["platoon", "Platoon / detachment", "14", "D"],
  ["company", "Company / battery", "15", "E"],
  ["battalion", "Battalion / squadron", "16", "F"],
  ["regiment", "Regiment / group", "17", "G"],
  ["brigade", "Brigade", "18", "H"],
  ["division", "Division", "21", "I"],
  ["corps", "Corps / MEF", "22", "J"],
  ["army", "Army", "23", "K"],
  ["armyGroup", "Army group / front", "24", "L"],
  ["region", "Region / theater", "25", "M"],
  ["command", "Command", "26", "N"]
];

const dom = Object.fromEntries(
  [
    "standardSelect",
    "coverageBadge",
    "draftStatus",
    "undoReset",
    "identityReason",
    "designationReason",
    "amplifierReason",
    "legacyNote",
    "sidcDetails",
    "symbolSearch",
    "clearSearch",
    "searchLauncher",
    "searchPanel",
    "searchResults",
    "categoryList",
    "recentSection",
    "recentGrid",
    "resultHeading",
    "symbolGrid",
    "resultCount",
    "paletteStatus",
    "selectedName",
    "selectedPath",
    "symbolPreview",
    "stage",
    "gridToggle",
    "outlineToggle",
    "positionsToggle",
    "fieldLayout",
    "layoutCanvas",
    "layoutHelp",
    "layoutMore",
    "layoutMoreSummary",
    "layoutMoreList",
    "textViewSwitch",
    "textInfoButton",
    "textInfo",
    "textApplies",
    "symbolClass",
    "sidcStatus",
    "identityChips",
    "identityNote",
    "identityAdjust",
    "uncertaintyField",
    "uncertaintyMarker",
    "uncertaintyNote",
    "statusChips",
    "statusMeta",
    "statusNote",
    "statusAdjust",
    "designationMeta",
    "designationNote",
    "amplifierMeta",
    "amplifierNote",
    "amplifierAdjust",
    "countryMeta",
    "countryButton",
    "countryList",
    "modifierColorNote",
    "compactSidc",
    "compactCopy",
    "editionSection",
    "previewBackground",
    "editionMeta",
    "textSummary",
    "carryNotes",
    "profileDetails",
    "profileIssues",
    "profileNotesBox",
    "profileNotesSummary",
    "profileNotesList",
    "textList",
    "listTools",
    "fieldFilter",
    "filledOnly",
    "filterStatus",
    "listHelp",
    "unavailableFields",
    "unavailableSummary",
    "unavailableBody",
    "hqLabel",
    "hqStaffLabel",
    "clearText",
    "textFilledBadge",
    "directionNumber",
    "graphicFields",
    "directionRow",
    "directionOff",
    "speedLeaderRow",
    "hqStaffRow",
    "stackField",
    "showFlag",
    "fillColorOn",
    "fillColor",
    "monoColorOn",
    "monoColor",
    "modifierColorOn",
    "modifierColor",
    "infoColorOn",
    "infoColor",
    "infoBackgroundOn",
    "infoBackground",
    "fillOpacity",
    "fillOpacityOutput",
    "infoSize",
    "infoSizeOutput",
    "outlineWidth",
    "outlineWidthOutput",
    "outlineColor",
    "sidcInput",
    "applySidc",
    "copySidc",
    "sidcLength",
    "sidcSegments",
    "downloadSvg",
    "downloadPng",
    "renderState",
    "affiliation",
    "context",
    "contextField",
    "status",
    "colorMode",
    "countryFlag",
    "hq",
    "taskForce",
    "feintDummy",
    "amplifierMode",
    "amplifierLabel",
    "amplifierValue",
    "amplifierButton",
    "amplifierList",
    "symbolModifiers",
    "modifier1",
    "modifier2",
    "modifier1Label",
    "modifier2Label",
    "modifier1Button",
    "modifier2Button",
    "modifier1List",
    "modifier2List",
    "modifierNote",
    "direction",
    "speedLeader",
    "hqStaffLength",
    "stack",
    "frameShape",
    "frameShapeField",
    "frameShapeButton",
    "frameShapeList",
    "fill",
    "frame",
    "icon",
    "infoFields",
    "symbolSize",
    "sizeOutput",
    "strokeWidth",
    "strokeOutput",
    "resetButton",
    "helpButton",
    "helpDialog",
    "closeHelp",
    "toast"
  ].map((id) => [id, document.getElementById(id)])
);

// The symbol palette renders its results in batches as the list scrolls.
const paletteBatch = 40;

const state = {
  standardId: "app6a",
  selectedId: null,
  search: "",
  category: "all",
  visible: paletteBatch,
  affiliation: "friend",
  context: "0",
  status: "present",
  amplifierMode: "echelon",
  amplifierValue: "",
  modifier1: "",
  modifier2: "",
  customSidc: "",
  importedIcon: null,
  outline: false,
  // Amplifiers tab: boxes at the field positions, or the grouped list.
  positions: storedTextView() !== "list",
  searchOpen: false,
  sidcDirty: false,
  sidcMessage: null,
  // List view filters: they hide fields, never their values.
  fieldQuery: "",
  filledOnly: false,
  focusField: "",
  recent: [],
  // Fallbacks the Studio made after the edition profile rejected a selection.
  adjustments: {},
  // Where free text was typed (key -> {meaning, where}); see carryWarnings().
  textOrigins: {},
  // Select values dropped because the edition does not define them (key -> text).
  droppedChoices: {}
};

let catalog;
let flagArtwork = new Map();
let currentSymbol;
// The symbol's isValid() plus the edition profile's verdict (edition-check.js).
let currentCheck = null;
let currentSvg = "";
let toastTimer;

const draftControlIds = [
  "sidcInput", "hq", "taskForce", "feintDummy", "hqStaffLength", "uncertaintyMarker",
  "frameShape", "countryFlag", "fill", "frame", "icon", "infoFields", "showFlag",
  "outlineToggle", "symbolSize", "strokeWidth", "colorMode", "direction", "speedLeader", "stack",
  "fillColorOn", "monoColorOn", "modifierColorOn", "infoColorOn", "infoBackgroundOn",
  "fillColor", "monoColor", "modifierColor", "infoColor", "infoBackground",
  "fillOpacity", "infoSize", "outlineWidth", "outlineColor", ...textModifiers.map(field => field.id)
];
let browserStorage;
try { browserStorage = window.localStorage; } catch {}
const draftStore = createDraftStore(browserStorage);
const draftAutosave = createDraftAutosave({ store: draftStore, capture: captureDraft, report: reportDraft });
let resetDraft = null;
let pendingCountryFlag = null;

function captureDraft() {
  const controls = Object.fromEntries(draftControlIds.map(id => {
    const input = document.getElementById(id);
    return [id, input.type === "checkbox" ? input.checked : input.value];
  }));
  if (pendingCountryFlag !== null) controls.countryFlag = pendingCountryFlag;
  return JSON.parse(JSON.stringify({
    state: Object.fromEntries(draftStateKeys.map(key => [key, state[key]])), controls
  }));
}

function reportDraft(saved) {
  dom.draftStatus.textContent = saved ? "Saved on this device" : "Draft could not be saved on this device";
}

function restoreDraft(draft) {
  if (!standards.some(standard => standard.id === draft.state.standardId)) return false;
  const entries = catalog.standards[catalog.aliases?.[draft.state.standardId] || draft.state.standardId].icons;
  if (!draft.state.customSidc && !entries.some(icon => icon.id === draft.state.selectedId)) return false;
  Object.assign(state, draft.state);
  state.sidcMessage = null;
  state.importedIcon = state.customSidc
    ? decodeEditorSidc(state.customSidc, { ...config(), icons: entries }).icon : null;
  if (state.importedIcon) state.importedIcon = entries.find(icon => icon.id === state.selectedId) || state.importedIcon;
  state.category = "all";
  loadRecent();
  renderStandardSelect();
  populateCategories();
  const restoreControls = () => {
    for (const id of draftControlIds) {
      const value = draft.controls[id];
      const input = document.getElementById(id);
      if (value === undefined) continue;
      if (input.type === "checkbox") input.checked = value;
      else if (id === "countryFlag" && input.disabled) pendingCountryFlag = value;
      else if (id === "countryFlag") setCountryFlag(value);
      else if (input.tagName === "SELECT") selectImportedValue(input, value);
      else input.value = value;
    }
  };
  restoreControls();
  syncStandardControls();
  restoreControls();
  renderAll();
  renderCatalog();
  return true;
}

const config = () =>
  standards.find((standard) => standard.id === state.standardId);
const dataset = () => {
  const key = catalog.aliases?.[state.standardId] || state.standardId;
  return catalog.standards[key];
};
const selectedIcon = () =>
  (state.customSidc && state.importedIcon) ||
  dataset().icons.find((icon) => icon.id === state.selectedId) ||
  dataset().icons[0];
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]
  );
const option = (value, label) =>
  `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;

function toast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.remove("visible"), 1800);
}

function currentOptions(minimal = false) {
  const direction = Number(dom.direction.value);
  const app6a = state.standardId === "app6a";
  const sidc = state.customSidc || buildSidc();
  const countryFlag = minimal || !dom.showFlag.checked ? "" : dom.countryFlag.value;
  const values = minimal ? {} : Object.fromEntries(textModifiers.map(({ key, id }) =>
    [key, document.getElementById(id)?.value || ""]
  ));
  // A heading or speed leader the symbol does not take stays in its control, unsent.
  const movement = minimal ? null : movementFor(sidc);
  const options = {
    standard: config().standard,
    countryFlag,
    // The library moves the two text rows beside the flag 70 units to the right.
    country_flag: Boolean(countryFlag),
    size: minimal ? 34 : Number(dom.symbolSize.value),
    strokeWidth: Number(dom.strokeWidth.value),
    colorMode: dom.colorMode.value,
    fill: minimal ? true : dom.fill.checked,
    frame: minimal ? true : dom.frame.checked,
    icon: minimal ? true : dom.icon.checked,
    infoFields: minimal ? false : dom.infoFields.checked,
    outlineWidth: !minimal && state.outline ? Number(dom.outlineWidth.value) : 0,
    outlineColor: dom.outlineColor.value,
    fillColor: !minimal && dom.fillColorOn.checked ? dom.fillColor.value : "",
    monoColor: !minimal && dom.monoColorOn.checked ? dom.monoColor.value : "",
    modifierColor: !minimal && dom.modifierColorOn.checked ? dom.modifierColor.value : "",
    fillOpacity: minimal ? 1 : Number(dom.fillOpacity.value) / 100,
    infoColor: !minimal && dom.infoColorOn.checked ? dom.infoColor.value : "",
    infoSize: minimal ? 40 : Number(dom.infoSize.value),
    infoBackground: !minimal && dom.infoBackgroundOn.checked ? dom.infoBackground.value : "",
    ...collectTextModifiers(values, profiledFieldKeys(sidc)),
    direction: minimal || direction < 0 || !movement.direction.applies ? undefined : direction,
    speedLeader: minimal || !movement.speedLeader.applies ? 0 : Number(dom.speedLeader.value),
    hqStaffLength: minimal ? 0 : Number(dom.hqStaffLength.value),
    stack: minimal || app6a ? 0 : Number(dom.stack.value)
  };
  // APP-6A 503.1a lets the "?" of pending, assumed friend and suspect sit in field E or in the frame.
  if (app6a && !minimal && dom.uncertaintyMarker.value !== "table") options.uncertaintyMarker = dom.uncertaintyMarker.value;
  return options;
}

function flagCode() {
  return (
    (dom.feintDummy.checked && !dom.feintDummy.disabled ? 1 : 0) +
    (dom.hq.checked && !dom.hq.disabled ? 2 : 0) +
    (dom.taskForce.checked && !dom.taskForce.disabled ? 4 : 0)
  );
}

// Position 11 of a letter SIDC, indexed by flagCode(): feint/dummy 1, HQ 2, task force 4.
const legacyFlagLetters = ["-", "F", "A", "C", "E", "G", "B", "D"];

function legacyFlagCharacter() {
  return legacyFlagLetters[flagCode()];
}

// What the active edition profile accepts for this symbol. Each candidate value
// is written into the SIDC and handed to profile.validate(); a value is
// offered only when that adds no SIDC-level error (see profile-controls.js).
// Returns null when the edition has no profile (or APP-6A, which keeps its
// own Table III rules for these controls).
const offerCache = new Map();
function profileOffers(sidc) {
  const profile = activeProfile();
  if (!profile) return null;
  const key = `${state.standardId}|${state.context}|${sidc}`;
  if (offerCache.has(key)) return offerCache.get(key);
  const standard = config();
  const modern = standard.family === "modern";
  const pad = modern ? "0" : "-";
  const base = sidc.padEnd(modern ? 20 : 15, pad);
  const at = modern ? { identity: 3, status: 6, flags: 7, amplifier: 8 } : { identity: 1, status: 3, flags: 10, amplifier: 10 };
  const map = (rows, valueOf) => new Map(rows.map(({ item, offered, reason }) => [valueOf(item), { offered, reason }]));
  const offers = {
    identity: map(
      probeOffers(profile, identityList(standard), (entry) => patchSidc(base, at.identity, identityCode(entry, standard, state.context), pad)),
      (entry) => entry.value
    ),
    status: map(
      probeOffers(profile, statusChoices(), (entry) => patchSidc(base, at.status, modern ? entry.numeric : entry.legacy, pad)),
      (entry) => entry.value
    )
  };
  if (state.standardId !== "app6a") {
    // Flags and amplifiers are probed one at a time against a symbol that has none.
    const clear = patchSidc(base, at.amplifier, modern ? "00" : "--", pad);
    const flagsClear = patchSidc(base, at.flags, modern ? "0" : "--", pad);
    const flagProbe = (code) => probeOffers(profile, [code], (value) => patchSidc(flagsClear, at.flags, modern ? String(value) : `${legacyFlagLetters[value]}-`, pad), flagsClear)[0];
    offers.flags = { feintDummy: flagProbe(1), hq: flagProbe(2), taskForce: flagProbe(4) };
    const amplifiers = [...echelons, ...mobilities].filter((item) => item[0] !== "" && (modern || item[3]));
    offers.amplifier = map(
      probeOffers(
        profile,
        amplifiers,
        (item) => patchSidc(clear, at.amplifier, modern ? item[2] : echelons.includes(item) ? `-${item[3]}` : item[3], pad),
        clear
      ),
      (item) => item[0]
    );
  }
  if (offerCache.size > 300) offerCache.clear();
  offerCache.set(key, offers);
  return offers;
}

// Statuses of the edition as they are listed in the status select.
function statusChoices() {
  return state.standardId === "app6a" ? statuses.slice(0, 2) : statuses;
}

// A new symbol or standard can leave a selection the edition profile rejects
// for it (a "damaged" status on a unit). Fall back to a value the profile
// accepts and say so next to the control. An imported SIDC is never rewritten:
// its rejected values stay, flagged, so the code the user pasted is kept.
function reconcileSelections() {
  if (state.customSidc) return;
  const offers = profileOffers(buildSidc());
  if (!offers) return;
  const rejected = (kind, value) => {
    const offer = offers[kind].get(value);
    return offer && !offer.offered ? offer : null;
  };
  const firstOffered = (kind, preferred) =>
    offers[kind].get(preferred)?.offered ? preferred : [...offers[kind]].find(([, offer]) => offer.offered)?.[0];
  const note = (what, current, reason, next) => `${what} ${current} does not fit this symbol (${humanize(shortReason(reason))}); switched to ${next}.`;
  let offer = rejected("identity", state.affiliation);
  if (offer) {
    const next = firstOffered("identity", "friend");
    const label = (value) => identityLabelFor(identityList(config()).find((item) => item.value === value) || { label: value });
    if (next) {
      state.adjustments.identity = note("Identity", label(state.affiliation), offer.reason, label(next));
      state.affiliation = next;
    }
  }
  offer = rejected("status", state.status);
  if (offer) {
    const next = firstOffered("status", "present");
    const label = (value) => statusLabelFor(statuses.find((item) => item.value === value) || { label: value });
    if (next) {
      state.adjustments.status = note("Status", label(state.status), offer.reason, label(next));
      state.status = next;
    }
  }
  if (offers.amplifier) {
    offer = state.amplifierValue && offers.amplifier.get(state.amplifierValue);
    if (offer && !offer.offered) {
      const label = [...echelons, ...mobilities].find((item) => item[0] === state.amplifierValue)?.[1] || state.amplifierValue;
      state.adjustments.amplifier = note("Amplifier", label, offer.reason, "unspecified");
      state.amplifierValue = "";
    }
    // A mode with nothing to offer ("echelon" on equipment) moves to the other
    // mode when that one has values, else to none. The value stays unspecified.
    const hasOffer = (list) => list.some((item) => item[0] !== "" && offers.amplifier.get(item[0])?.offered);
    const modes = { echelon: echelons, mobility: mobilities };
    if (modes[state.amplifierMode] && !hasOffer(modes[state.amplifierMode])) {
      const other = state.amplifierMode === "echelon" ? "mobility" : "echelon";
      state.amplifierMode = hasOffer(modes[other]) ? other : "none";
      state.amplifierValue = "";
    }
  }
}

function applyModernModifier(sidc, value, type) {
  if (!value) return;
  const [scope, code] = value.split(":");
  const start = type === 1 ? 16 : 18;
  if (scope === "common" && code.length === 3) {
    sidc[start] = code[1];
    sidc[start + 1] = code[2];
    sidc[type === 1 ? 20 : 21] = code[0];
  } else {
    sidc[start] = code.padStart(2, "0")[0];
    sidc[start + 1] = code.padStart(2, "0")[1];
  }
}

function buildSidc(icon = selectedIcon(), minimal = false) {
  if (!icon) return "";
  const standard = config();
  const affiliation = identityList(standard).find(
    (item) => item.value === (minimal ? "friend" : state.affiliation)
  );
  const identity = affiliation
    ? identityCode(affiliation, standard, minimal ? "0" : state.context)
    : state.affiliation.split(":").at(-1);
  const status = statuses.find(
    (item) => item.value === (minimal ? "present" : state.status)
  ) || { legacy: state.status.split(":").at(-1), numeric: state.status.split(":").at(-1) };

  if (standard.family === "legacy") {
    let amplifier = [minimal ? "-" : legacyFlagCharacter(), "-"];
    if (!minimal && state.amplifierMode === "echelon") {
      amplifier = [
        legacyFlagCharacter(),
        echelons.find((item) => item[0] === state.amplifierValue)?.[3] || (state.amplifierValue.startsWith("code:") ? state.amplifierValue.slice(5) : "-")
      ];
    } else if (!minimal && state.amplifierMode === "mobility") {
      amplifier = [
        ...(mobilities.find((item) => item[0] === state.amplifierValue)?.[3] ||
          (state.amplifierValue.startsWith("code:") ? state.amplifierValue.slice(5) : "--"))
      ];
    }
    // Installations keep their H (APP-6A and 2525C catalogue entries, imported codes).
    if (icon.defaultModifier?.startsWith("H")) {
      amplifier = ["H", !minimal && dom.feintDummy.checked ? "B" : "-"];
    }
    if (state.standardId === "app6a" && icon.codingScheme === "G")
      amplifier = ["-", "-"];
    const sidc = `${icon.codingScheme || "S"}${icon.prescribedAffiliation || identity}${icon.battleDimension || "G"}${icon.prescribedStatus || status.legacy}${icon.code || "------"}${amplifier.join("")}---`;
    return minimal ? sidc : withCountryFlag(sidc, dom.countryFlag.value, state.standardId);
  }

  const sidc = Array(30).fill("0");
  sidc.splice(0, 2, ...standard.version);
  sidc[2] = minimal ? "0" : state.context;
  sidc[3] = identity;
  sidc.splice(4, 2, ...(icon.symbolSet || "10").padStart(2, "0"));
  sidc[6] = status.numeric;
  sidc[7] = minimal ? "0" : String(flagCode());
  const amplifier =
    minimal || state.amplifierMode === "none"
      ? "00"
      : state.amplifierMode === "mobility"
        ? mobilities.find((item) => item[0] === state.amplifierValue)?.[2] ||
          (state.amplifierValue.startsWith("code:") ? state.amplifierValue.slice(5) : "00")
        : echelons.find((item) => item[0] === state.amplifierValue)?.[2] ||
          (state.amplifierValue.startsWith("code:") ? state.amplifierValue.slice(5) : "00");
  sidc.splice(8, 2, ...amplifier);
  sidc.splice(10, 6, ...(icon.code || "000000").padEnd(6, "0").slice(0, 6));
  if (!minimal) {
    applyModernModifier(sidc, state.modifier1, 1);
    applyModernModifier(sidc, state.modifier2, 2);
    if (numericSidcEdition(standard.version) === "e") sidc[22] = dom.frameShape.value;
  }
  return minimal ? sidc.join("") : withCountryFlag(sidc.join(""), dom.countryFlag.value, state.standardId);
}

function renderStandardSelect() {
  dom.standardSelect.innerHTML = standards
    .map((standard) => `<option value="${standard.id}">${standard.label}</option>`)
    .join("");
  dom.standardSelect.value = state.standardId;
}

function setStandard(id) {
  const next = standards.find((item) => item.id === id);
  if (!next) return;
  state.standardId = id;
  state.adjustments = {};
  loadRecent();
  const identity = convertIdentity({ value: state.affiliation, context: state.context }, next);
  state.affiliation = identity.value;
  state.context = identity.context;
  state.selectedId = null;
  state.category = "all";
  state.visible = paletteBatch;
  state.modifier1 = "";
  state.modifier2 = "";
  state.customSidc = "";
  state.importedIcon = null;
  if (id === "app6a" && !["present", "planned"].includes(state.status))
    state.status = "present";
  window.ms.setStandard(next.standard);
  renderStandardSelect();
  populateCategories();
  chooseInitialSymbol();
  syncStandardControls();
  renderCatalog();
  renderAll();
  document.querySelector(".control-scroll").scrollTop = 0;
}

function chooseInitialSymbol() {
  const matches = filteredIcons();
  const icons = matches.length ? matches : dataset().icons;
  const preferred =
    icons.find((icon) => /infantry$/i.test(icon.name)) ||
    icons.find((icon) => /infantry/i.test(icon.name)) ||
    icons[0];
  state.selectedId = preferred?.id || null;
}

function populateCategories() {
  const counts = new Map();
  for (const icon of dataset().icons) counts.set(icon.category, (counts.get(icon.category) || 0) + 1);
  const categories = [...counts.keys()].sort((a, b) => a.localeCompare(b));
  const button = (value, label, count) =>
    `<button type="button" data-category="${escapeHtml(value)}" aria-pressed="${value === state.category}"><span>${escapeHtml(label)}</span><small>${count.toLocaleString("en-US")}</small></button>`;
  dom.categoryList.innerHTML =
    button("all", "All symbol sets", dataset().icons.length) +
    categories.map((item) => button(item, item, counts.get(item))).join("");
}

function recentKey() {
  return `symbol-studio:recent:${state.standardId}`;
}

function loadRecent() {
  try {
    const stored = JSON.parse(localStorage.getItem(recentKey()) || "[]");
    state.recent = Array.isArray(stored) ? stored.filter((id) => typeof id === "string") : [];
  } catch {
    state.recent = [];
  }
}

function rememberRecent(id) {
  state.recent = pushRecent(state.recent, id);
  try {
    localStorage.setItem(recentKey(), JSON.stringify(state.recent));
  } catch {}
}

// Cards under a set's own headings leave the set name out.
function symbolCard(icon, { inSection = false } = {}) {
  return `
    <button type="button" class="symbol-card ${icon.id === state.selectedId ? "active" : ""}" aria-pressed="${icon.id === state.selectedId}" data-symbol-id="${escapeHtml(icon.id)}" title="${escapeHtml(icon.name + (icon.categoryOnly ? " — Category: no separate illustration in APP-6A" : ""))}">
      <span class="mini-symbol">${safeMiniSvg(icon)}</span>
      <strong>${escapeHtml(icon.name)}${icon.categoryOnly ? ' <span class="category-badge">Category</span>' : ""}</strong>
      <small>${inSection ? "" : `<span class="card-category">${escapeHtml(icon.category)}</span><span aria-hidden="true">·</span>`}<span class="card-code">${escapeHtml(icon.code)}</span></small>
    </button>`;
}

function openSearch() {
  if (state.searchOpen) return dom.symbolSearch.focus();
  state.searchOpen = true;
  dom.searchPanel.hidden = false;
  dom.searchLauncher.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
  renderCatalog();
  dom.symbolSearch.focus();
  dom.symbolSearch.select();
}

function closeSearch() {
  if (!state.searchOpen) return;
  state.searchOpen = false;
  dom.searchPanel.hidden = true;
  dom.searchLauncher.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  dom.searchLauncher.focus();
}

function filteredIcons() {
  return dataset().icons.filter((icon) =>
    (state.category === "all" || icon.category === state.category) && matchesSearch(icon, state.search, config().family)
  );
}

function safeMiniSvg(icon) {
  try {
    return new window.ms.Symbol(buildSidc(icon, true), { ...currentOptions(true), size: 40 }).asSVG();
  } catch {
    return "<span>—</span>";
  }
}

// The groups of a category come from the catalogue paths (editor-helpers.js).
const baseCache = new Map();
function categoryBase(category) {
  const key = `${state.standardId}|${category}`;
  if (!baseCache.has(key)) baseCache.set(key, baseBranch(dataset().icons.filter((icon) => icon.category === category)));
  return baseCache.get(key);
}

// Browsing (no search), the results are sections: one per group of the
// chosen set, or one per set under All symbol sets, each with subheadings for
// its groups. A search lists its matches as one grid.
function paletteGroups(icons) {
  if (state.search.trim()) return null;
  if (state.category !== "all") return paletteSections(icons, categoryBase(state.category));
  const categories = [...new Set(icons.map((icon) => icon.category))].sort((a, b) => a.localeCompare(b));
  return categories.map((category) => {
    const members = icons.filter((icon) => icon.category === category);
    const base = categoryBase(category);
    return { name: category, branch: base, count: members.length, ...groupEntries(members, base) };
  });
}

// Headings and cards in reading order; the palette renders them in batches.
function paletteItems(sections) {
  const items = [];
  for (const section of sections) {
    items.push({ type: "section", section });
    for (const icon of section.loose) items.push({ type: "card", icon });
    for (const group of section.groups) {
      items.push({ type: "group", group });
      for (const icon of group.icons) items.push({ type: "card", icon });
    }
  }
  return items;
}

// Sections the user closed stay closed while the palette re-renders.
const closedSections = new Set();
let feed = null;
const sectionKey = (section) => `${state.standardId}|${state.category}|${JSON.stringify(section.branch)}|${section.name}`;

// Render the next `limit` cards of the grouped list, with the headings that
// come before them. Returns the number of cards added.
function feedPalette(limit) {
  let added = 0;
  while (feed.index < feed.items.length && added < limit) {
    const item = feed.items[feed.index++];
    if (item.type === "section") {
      const { section } = item;
      if (section.name) {
        const key = sectionKey(section);
        const element = document.createElement("details");
        element.className = "palette-section";
        element.open = !closedSections.has(key);
        element.dataset.sectionKey = key;
        element.dataset.key = JSON.stringify(section.branch);
        element.innerHTML = `<summary><h4>${escapeHtml(section.name)}</h4><small>${section.count.toLocaleString("en-US")}</small><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg></summary><div class="palette-section-body"></div>`;
        dom.symbolGrid.append(element);
        feed.body = element.lastElementChild;
      } else {
        feed.body = document.createElement("div");
        feed.body.className = "palette-section-body";
        dom.symbolGrid.append(feed.body);
      }
      feed.grid = null;
    } else if (item.type === "group") {
      feed.body.insertAdjacentHTML("beforeend", `<h5 class="palette-group" data-key="${escapeHtml(JSON.stringify(item.group.branch))}">${escapeHtml(item.group.name)}</h5><div class="symbol-grid"></div>`);
      feed.grid = feed.body.lastElementChild;
    } else {
      if (!feed.grid) {
        feed.body.insertAdjacentHTML("beforeend", '<div class="symbol-grid"></div>');
        feed.grid = feed.body.lastElementChild;
      }
      feed.grid.insertAdjacentHTML("beforeend", symbolCard(item.icon, { inSection: true }));
      added += 1;
    }
  }
  feed.shown += added;
  return added;
}

function renderCatalog() {
  const focusedId = document.activeElement?.dataset.symbolId;
  const icons = filteredIcons();
  dom.resultCount.textContent = icons.length.toLocaleString("en-US");
  dom.resultHeading.textContent = state.search.trim()
    ? `Results in ${state.category === "all" ? "all symbol sets" : state.category}`
    : state.category === "all" ? "All symbol sets" : state.category;
  dom.clearSearch.hidden = !state.search;
  for (const button of dom.categoryList.querySelectorAll("[data-category]"))
    button.setAttribute("aria-pressed", String(button.dataset.category === state.category));
  const recent = !state.search.trim() && state.category === "all"
    ? state.recent.map((id) => dataset().icons.find((icon) => icon.id === id)).filter(Boolean)
    : [];
  dom.recentSection.hidden = !recent.length;
  dom.recentGrid.innerHTML = recent.map((icon) => symbolCard(icon)).join("");
  const sections = icons.length ? paletteGroups(icons) : null;
  dom.symbolGrid.classList.toggle("grouped", Boolean(sections));
  dom.symbolGrid.replaceChildren();
  feed = null;
  if (sections) {
    feed = { items: paletteItems(sections), index: 0, shown: 0, body: null, grid: null };
    feedPalette(state.visible);
  } else
    dom.symbolGrid.innerHTML = icons.length
      ? icons.slice(0, state.visible).map((icon) => symbolCard(icon)).join("")
      : `<div class="empty-state">No symbols found.<br>Try a different name, code, or symbol set.</div>`;
  dom.paletteStatus.textContent = paletteProgress(Math.min(state.visible, icons.length), icons.length);
  if (focusedId && dom.searchPanel.contains(document.activeElement)) [...dom.symbolGrid.querySelectorAll("[data-symbol-id]")].find(card=>card.dataset.symbolId === focusedId)?.focus({preventScroll:true});
  fillPalette();
}

// Append the next batch of results; returns false when every result is shown.
function appendCatalogBatch() {
  const icons = filteredIcons();
  if (feed) {
    if (!feedPalette(paletteBatch)) return false;
    state.visible = feed.shown;
  } else {
    const batch = icons.slice(state.visible, state.visible + paletteBatch);
    if (!batch.length) return false;
    dom.symbolGrid.insertAdjacentHTML("beforeend", batch.map((icon) => symbolCard(icon)).join(""));
    state.visible += batch.length;
  }
  dom.paletteStatus.textContent = paletteProgress(state.visible, icons.length);
  return true;
}

// Keep loading while the end of the list is within 400px of the visible area,
// so scrolling never reaches a gap and tall windows fill on open.
function fillPalette() {
  if (!state.searchOpen) return;
  const list = dom.searchResults;
  while (list.scrollHeight - list.scrollTop - list.clientHeight < 400 && appendCatalogBatch());
}

// Opens the palette on a group of a set (from the symbol's heading): the set
// is chosen and the list scrolls to the group's heading or subheading.
function showGroup(category, branch) {
  dom.symbolSearch.value = state.search = "";
  state.category = category;
  state.visible = paletteBatch;
  renderCatalog();
  openSearch();
  dom.searchResults.scrollTop = 0;
  const base = categoryBase(category);
  const keys = [branch.slice(0, base.length + 2), branch.slice(0, base.length + 1)]
    .filter((key) => key.length > base.length && key.length <= branch.length)
    .map((key) => JSON.stringify(key));
  const find = () => keys.map((key) => [...dom.symbolGrid.querySelectorAll("[data-key]")].find((element) => element.dataset.key === key)).find(Boolean);
  let target = find();
  while (!target && appendCatalogBatch()) target = find();
  if (!target) return;
  const section = target.closest("details");
  if (section) section.open = true;
  target.scrollIntoView({ block: "start" });
  fillPalette();
}

function mobilityNameFor(offers) {
  if (!offers || !offers.amplifier) return "Mobility";
  return mobilityModeName(mobilities.filter((item) => item[0] !== "" && offers.amplifier.get(item[0])?.offered).map((item) => item[0]));
}

function populateAmplifier() {
  let source = state.amplifierMode === "mobility" ? mobilities : echelons;
  if (config().family === "legacy") source = source.filter((item) => item[3] !== "");
  if (state.standardId === "app6a")
    source = source.filter((item) => !["N", "NS", "NL"].includes(item[3]));
  // Edition profiles list only the echelons, mobilities and towed arrays the
  // symbol may carry; a current value they reject stays, flagged.
  const offers = profileOffers(state.customSidc || buildSidc());
  const rejected = new Map();
  if (offers && offers.amplifier)
    source = source.filter((item) => {
      const offer = offers.amplifier.get(item[0]);
      if (!offer || offer.offered) return true;
      if (item[0] !== state.amplifierValue) return false;
      rejected.set(item[0], offer.reason);
      return true;
    });
  dom.amplifierValue.disabled = state.amplifierMode === "none";
  // Where a profile offers only towed arrays (APP-6D sea surface) name them as such.
  const mobilityName = mobilityNameFor(offers);
  dom.amplifierMode.querySelector('[data-mode="mobility"]').textContent = mobilityName;
  dom.amplifierLabel.textContent =
    state.amplifierMode === "mobility" ? mobilityName : "Echelon";
  dom.amplifierValue.innerHTML = source
    .map((item) => rejected.has(item[0])
      ? `<option value="${escapeHtml(item[0])}" title="${escapeHtml(rejected.get(item[0]))}">${escapeHtml(item[1])} (not valid here)</option>`
      : option(item[0], item[1]))
    .join("");
  const exists = source.some((item) => item[0] === state.amplifierValue);
  if (!exists && state.amplifierValue.startsWith("code:"))
    dom.amplifierValue.innerHTML += option(state.amplifierValue, `SIDC: ${state.amplifierValue.slice(5)}`);
  else if (!exists) state.amplifierValue = "";
  dom.amplifierValue.value = state.amplifierValue;
  [...dom.amplifierMode.querySelectorAll("button")].forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.mode === state.amplifierMode
    );
    button.setAttribute("aria-pressed", String(button.dataset.mode === state.amplifierMode));
  });
}

// The picker draws each choice on the current frame, so the user sees what the
// amplifier looks like.
function amplifierPreviewSidc(sidc, value) {
  const modern = config().family === "modern";
  const item = (state.amplifierMode === "mobility" ? mobilities : echelons).find((entry) => entry[0] === value);
  const code = value.startsWith("code:") ? value.slice(5) : value && item ? item[modern ? 2 : 3] : "";
  if (modern) {
    const base = sidc.padEnd(20, "0");
    return `${base.slice(0, 7)}0${code || "00"}${base.slice(10)}`;
  }
  const base = sidc.padEnd(15, "-");
  if (base[10] === "H") return base;
  const amplifier = !code ? "--" : state.amplifierMode === "mobility" ? code : `-${code}`;
  return `${base.slice(0, 10)}${amplifier}${base.slice(12)}`;
}

function amplifierChoices() {
  const modern = config().family === "modern";
  const source = state.amplifierMode === "mobility" ? mobilities : echelons;
  return [...dom.amplifierValue.options].map((item) => amplifierChoice(item, source, modern));
}

let amplifierSidc = "";

function amplifierSvg(value) {
  return chipSvg(amplifierPreviewSidc(amplifierSidc, value), {
    size: 24,
    icon: false,
    modifierColor: dom.modifierColorOn.checked ? dom.modifierColor.value : ""
  });
}

// A list's pictures to one scale, with the bare frame ("") on the line of the text.
function sharedGlyphs(rows, draw) {
  const drawn = new Map(["", ...rows.map((item) => item.value)].map((value) => [value, draw(value)]));
  const box = sharedViewBox([...drawn.values()], drawn.get(""));
  return (value) => withViewBox(drawn.get(value) || "", box);
}

const amplifierPicker = createGlyphPicker({
  button: dom.amplifierButton,
  list: dom.amplifierList,
  select: dom.amplifierValue,
  idPrefix: "amplifierOption",
  fallback: { value: "", name: "Unspecified" },
  choices: amplifierChoices,
  glyphs: (rows) => sharedGlyphs(rows, amplifierSvg),
  escapeHtml
});

// Only this modifier on the current frame, as the amplifier picker draws its own. The
// common modifiers need all of the SIDC around them, so the code stays 30 digits long.
function iconModifierSvg(type, value) {
  const base = (state.customSidc || buildSidc()).padEnd(30, "0");
  const sidc = `${base.slice(0, 7)}${"0".repeat(15)}${base.slice(22)}`.split("");
  applyModernModifier(sidc, value, type);
  return chipSvg(sidc.join(""), { size: 24 });
}

const iconModifierPickers = [1, 2].map((type) =>
  createGlyphPicker({
    button: dom[`modifier${type}Button`],
    list: dom[`modifier${type}List`],
    select: dom[`modifier${type}`],
    idPrefix: `modifier${type}Option`,
    choices: () => [...dom[`modifier${type}`].options].map(modifierChoice),
    glyphs: (rows) => sharedGlyphs(rows, (value) => iconModifierSvg(type, value)),
    escapeHtml
  })
);

// The bare frame this shape gives the current symbol.
function frameShapeSvg(value) {
  const base = (state.customSidc || buildSidc()).padEnd(30, "0");
  return chipSvg(`${base.slice(0, 7)}${"0".repeat(15)}${value}${base.slice(23)}`, { size: 24 });
}

const frameShapePicker = createGlyphPicker({
  button: dom.frameShapeButton,
  list: dom.frameShapeList,
  select: dom.frameShape,
  idPrefix: "frameShapeOption",
  choices: () => [...dom.frameShape.options].map(frameShapeChoice),
  glyphs: (rows) => {
    const drawn = centeredGlyphs(rows.map((item) => frameShapeSvg(item.value)));
    return (value) => drawn[rows.findIndex((item) => item.value === value)] || "";
  },
  escapeHtml
});

// Flags the standard's country list codes come first. Organizations, regions and
// entities the list does not code follow under their own heading: they draw the
// flag but write no country into the SIDC.
function renderCountryOptions() {
  if (dom.countryFlag.disabled) return;
  const current = dom.countryFlag.value;
  const flags = [...flagNames];
  const coded = flags.filter(([code]) => countryCodeForFlag(code, state.standardId));
  const uncoded = flags.filter(([code]) => !countryCodeForFlag(code, state.standardId));
  dom.countryFlag.innerHTML = option("", "No flag") + [...coded, ...uncoded]
    .map(([code, name]) => option(code, name))
    .join("");
  setCountryFlag(current);
}

function setCountryFlag(value) {
  dom.countryFlag.value = flagNames.has(value) ? value : "";
}

function countryChoices() {
  return [...dom.countryFlag.options].map((item) => {
    const code = countryCodeForFlag(item.value, state.standardId);
    return {
      value: item.value,
      name: item.textContent,
      code,
      group: item.value && !code ? "No code in this standard · display only" : "",
      reason: ""
    };
  });
}

// Each flag is its own image: flag drawings reuse ids, which would clash inline.
const flagUrls = new Map();

function flagGlyph(value) {
  const artwork = flagArtwork.get(value);
  if (!artwork) return '<span class="flag-empty"></span>';
  if (!flagUrls.has(value)) flagUrls.set(value, URL.createObjectURL(new Blob([artwork], { type: "image/svg+xml" })));
  return `<img class="flag-image" src="${flagUrls.get(value)}" alt="" loading="lazy" />`;
}

const countryPicker = createGlyphPicker({
  button: dom.countryButton,
  list: dom.countryList,
  select: dom.countryFlag,
  idPrefix: "countryOption",
  choices: countryChoices,
  glyphs: () => flagGlyph,
  escapeHtml
});

function populateModifierSelect(select, field, selected) {
  const icon = selectedIcon();
  const setModifiers = dataset().modifiers?.[icon?.symbolSet]?.[field] || [];
  const commonModifiers = dataset().common?.[field] || [];
  const entries = [
    ...setModifiers.map((item) => ({ ...item, scope: "set" })),
    ...commonModifiers.map((item) => ({ ...item, scope: "common" }))
  ];
  select.innerHTML = option("", "Unspecified");
  const groups = new Map();
  for (const item of entries) {
    const groupName = `${item.scope === "common" ? "Common" : icon.category} / ${item.category || "Other"}`;
    if (!groups.has(groupName)) groups.set(groupName, []);
    groups.get(groupName).push(item);
  }
  for (const [label, items] of groups) {
    const group = document.createElement("optgroup");
    group.label = label;
    for (const item of items) {
      const itemOption = document.createElement("option");
      itemOption.value = `${item.scope}:${item.code}`;
      itemOption.textContent = `${item.code} — ${item.name}`;
      group.append(itemOption);
    }
    select.append(group);
  }
  if (selected && ![...select.options].some(item => item.value === selected))
    select.insertAdjacentHTML("beforeend", option(selected, `SIDC: ${selected}`));
  select.value = selected;
  return select.value;
}

function syncModifiers() {
  const modern = config().family === "modern";
  const app6a = state.standardId === "app6a";
  const prescribedAffiliation = app6a && selectedIcon()?.prescribedAffiliation;
  dom.affiliation.disabled = Boolean(prescribedAffiliation);
  dom.affiliation.value = prescribedAffiliation ? app6aIdentities.find(a => a.legacy === prescribedAffiliation).value : state.affiliation;
  const kind = app6a ? app6aSymbolClass(state.customSidc || buildSidc()) : "";
  const installation =
    !modern && selectedIcon()?.defaultModifier?.startsWith("H");
  const tactical =
    state.standardId === "app6a" && selectedIcon()?.codingScheme === "G";
  dom.hq.disabled = Boolean(installation || tactical || (app6a && state.amplifierMode === "mobility"));
  dom.taskForce.disabled = Boolean(installation || (app6a && kind !== "unit"));
  dom.feintDummy.disabled = tactical;
  dom.amplifierValue.disabled =
    installation || tactical || state.amplifierMode === "none";
  for (const button of dom.amplifierMode.querySelectorAll("button"))
    button.disabled = Boolean(installation || tactical || (app6a && button.dataset.mode === "echelon" && kind !== "unit") || (app6a && button.dataset.mode === "mobility" && kind !== "equipment"));
  if (app6a && ((state.amplifierMode === "echelon" && kind !== "unit") || (state.amplifierMode === "mobility" && kind !== "equipment"))) {
    state.amplifierMode = "none"; state.amplifierValue = ""; populateAmplifier();
  }
  // Editions with a profile (2525C, APP-6D) say which flags and amplifier
  // modes the symbol may carry; every disabled control keeps the profile's reason.
  const offers = app6a ? null : profileOffers(state.customSidc || buildSidc());
  const flagReasons = {};
  for (const control of [dom.feintDummy, dom.hq, dom.taskForce]) control.closest("label").title = "";
  if (offers && offers.flags) {
    for (const [key, offer] of Object.entries(offers.flags)) {
      const control = { feintDummy: dom.feintDummy, hq: dom.hq, taskForce: dom.taskForce }[key];
      if (offer.offered) continue;
      control.disabled = true;
      control.closest("label").title = offer.reason;
      flagReasons[key] = offer.reason;
    }
    const hasOffer = (list) => list.some((item) => item[0] !== "" && offers.amplifier.get(item[0])?.offered);
    for (const button of dom.amplifierMode.querySelectorAll("button")) {
      const list = { echelon: echelons, mobility: mobilities }[button.dataset.mode];
      if (list && !hasOffer(list)) button.disabled = true;
    }
  }
  if (offers) populateAmplifier();
  syncRuleNotes({ modern, app6a, kind, installation, tactical, prescribed: Boolean(prescribedAffiliation), flagReasons });
  syncApp6aTextFields();
  dom.legacyNote.textContent = installation
    ? "Installation modifier H is applied automatically. Feint / dummy changes it to HB; unit echelon and headquarters flags do not apply."
    : tactical
      ? "Tactical point: unit echelon, mobility and headquarters flags do not apply. Choose the graphic variant from the library."
      : "In this edition, icon variants are selected directly from the symbol library.";
  // A letter-based edition has nothing for this card unless a symbol class needs its note.
  dom.editionSection.hidden = !modern && !installation && !tactical;
  dom.symbolModifiers.hidden = !modern;
  dom.legacyNote.hidden = modern;
  if (!modern) {
    state.modifier1 = "";
    state.modifier2 = "";
    return;
  }
  if (state.standardId === "app6d") {
    // APP-6D lists only the sector codes its Annex A tables define.
    const first = populateSectorSelect(dom.modifier1, 1, state.modifier1);
    const second = populateSectorSelect(dom.modifier2, 2, state.modifier2);
    state.modifier1 = first.value;
    state.modifier2 = second.value;
    const blocked = [...first.choices.entries, ...second.choices.entries].filter((entry) => !entry.offered);
    dom.modifierNote.textContent = [
      first.choices.dictionary || second.choices.dictionary
        ? `Sector modifiers follow APP-6D ${[first.choices, second.choices].filter((item) => item.dictionary).map((item) => item.table).join(" and ")}. Only defined codes are listed.`
        : "APP-6D defines no sector modifiers for this symbol set.",
      blocked.length ? `${blocked.length} listed codes are disabled for this entity, for example: ${humanize(shortReason(blocked[0].reason))}.` : ""
    ].filter(Boolean).join(" ");
    return;
  }
  dom.modifier1Label.textContent = "Icon modifier 1";
  dom.modifier2Label.textContent = "Icon modifier 2";
  dom.modifier1.disabled = dom.modifier2.disabled = false;
  state.modifier1 = populateModifierSelect(
    dom.modifier1,
    "modifier1",
    state.modifier1
  );
  state.modifier2 = populateModifierSelect(
    dom.modifier2,
    "modifier2",
    state.modifier2
  );
  const setName = selectedIcon()?.category || "symbol set";
  dom.modifierNote.textContent = `${setName} and common modifiers for this edition.`;
}

const sectorPlaces = { top: "above the symbol", bottom: "below the symbol", left: "left of the symbol", right: "right of the symbol" };

// Sector 1 / sector 2 select from the APP-6D dictionary for this symbol set.
// A code the entity may not use is listed but disabled; a current code the
// dictionary does not define (imported) stays, flagged.
function populateSectorSelect(select, sector, selected) {
  const sidc = state.customSidc || buildSidc();
  const current = selected.startsWith("set:") ? selected.slice(4) : "";
  const choices = sectorChoices({ profile: app6dProfile, sectors: app6dSectors, sidc, set: sidc.slice(4, 6), sector, start: sector === 1 ? 16 : 18, current });
  dom[`modifier${sector}Label`].textContent = `Sector ${sector} modifier (${sectorPlaces[choices.placement]})`;
  select.innerHTML =
    option("", choices.dictionary ? "Unspecified" : "None defined for this symbol set") +
    choices.entries
      .map((entry) => `<option value="set:${entry.code}"${entry.offered ? "" : ` disabled title="${escapeHtml(entry.reason)}"`}>${entry.code} — ${escapeHtml(entry.name)}${entry.offered ? "" : " (not for this entity)"}</option>`)
      .join("");
  if (selected && ![...select.options].some((item) => item.value === selected)) {
    const label = sectorStatusLabels[choices.status];
    select.insertAdjacentHTML("beforeend", option(selected, `SIDC: ${current || selected}${label ? ` — ${label}` : ""}`));
  }
  select.disabled = !choices.dictionary && !current;
  select.value = selected;
  return { value: select.value, choices };
}

const kindLabels = { unit: "Unit", equipment: "Equipment", installation: "Installation", point: "Tactical point", nuclear: "Nuclear point" };

function showNote(element, text) {
  element.hidden = !text;
  element.textContent = text;
}

// Explain every rule that disables a control, next to the control.
function syncRuleNotes({ modern, app6a, kind, installation, tactical, prescribed, flagReasons = {} }) {
  const profile = activeProfile();
  const contextNote = {
    1: `Exercise: an X is drawn beside the frame; suspect and hostile become Joker (J) and Faker (K).${modern ? "" : " Position 2 uses the exercise letters G, W, M, D, L, J and K."}`,
    2: "Simulation: an S is drawn beside the frame."
  }[app6a ? "0" : state.context];
  // APP-6D and APP-6E Table A-2 keep Exercise and Simulation for US use.
  const usOnly = !app6a && isUsOnlyContext(config(), state.context) && contextOptions(config()).find(([digit]) => digit === state.context)[1];
  showNote(dom.identityNote, [contextNote, usOnly && `${usOnly} is for US use only.`].filter(Boolean).join(" "));
  showNote(dom.identityReason, prescribed ? "This symbol prescribes its identity, so the identity is fixed." : "");
  for (const [key, element] of [["identity", dom.identityAdjust], ["status", dom.statusAdjust], ["amplifier", dom.amplifierAdjust]])
    showNote(element, state.adjustments[key] || "");
  // The "?" placement choice applies only where the profile's identity table has one.
  const marked = app6a && app6aRules.app6aIdentities[(state.customSidc || buildSidc())[1]];
  dom.uncertaintyField.hidden = dom.uncertaintyNote.hidden = !(marked && marked.marker === "?");
  if (marked) {
    const table = marked.placement === "frame" ? "inside the frame" : "in field E";
    dom.uncertaintyNote.textContent = `${marked.name}: the publication default puts the ? ${table}. APP-6A 503.1a allows field E or the frame. A symbol without a frame always uses field E.`;
  }
  dom.statusMeta.textContent = modern ? "Position 7" : "Position 4";
  dom.statusNote.textContent = app6a
    ? "APP-6A defines Present and Planned. Fully capable, damaged, destroyed and full to capacity appear in the other editions."
    : profile
      ? `Only the statuses ${profileTitles[state.standardId]} allows for this symbol are listed.`
      : "";
  dom.designationMeta.textContent = modern ? "Position 8" : "Position 11";
  // APP-6A Table III S is the location offset indicator on equipment and
  // installations, the headquarters staff on units (505.1c, 505.1e).
  const offsetRole = app6a && (kind === "equipment" || kind === "installation");
  dom.hqLabel.textContent = offsetRole ? "Location offset" : "Headquarters";
  dom.hqStaffLabel.textContent = offsetRole ? "Offset line length" : "HQ staff length";
  const designation = designationNotes({
    app6a, modern, kind, installation, tactical,
    mobility: state.amplifierMode === "mobility",
    flagReasons: Object.fromEntries(Object.entries(flagReasons).map(([key, reason]) => [key, humanize(shortReason(reason))]))
  });
  showNote(dom.designationReason, designation.reason);
  dom.designationNote.textContent = designation.about;
  dom.amplifierMeta.textContent = modern ? "Positions 9–10" : "Positions 11–12";
  const amplifier = amplifierNotes({
    app6a, kind, installation, tactical,
    disabled: [...dom.amplifierMode.querySelectorAll("button:disabled")].filter((button) => button.dataset.mode !== "none").map((button) => button.textContent),
    edition: profileTitles[state.standardId],
    placement: `${amplifierPlacementNote(mobilityNameFor(profileOffers(state.customSidc || buildSidc())))}${profile && !app6a ? ` Only the values ${profileTitles[state.standardId]} allows for this symbol are listed.` : ""}`
  });
  showNote(dom.amplifierReason, amplifier.reason);
  dom.amplifierNote.textContent = amplifier.about;
  dom.countryMeta.textContent = countrySidcField(state.standardId)?.description || "";
  dom.editionMeta.textContent = modern ? (numericSidcEdition(config().version) === "e" ? "Edition E" : "Edition D") : "";
  dom.modifierNote.hidden = !modern;
  dom.symbolClass.hidden = false;
  dom.symbolClass.textContent = app6a ? kindLabels[kind] || "Symbol" : selectedIcon()?.category || "Symbol";
  // S appears with its flag: Headquarters (or Location offset) in the Symbol tab.
  dom.hqStaffRow.hidden = dom.hqStaffLength.disabled = !dom.hq.checked || dom.hq.disabled;
  dom.hqStaffRow.title = `${offsetRole ? "Length of the location offset line" : "Length of the headquarters staff"}; 0 draws the default length.`;
}

// J: one letter A-F for source reliability and one digit 1-6 for information
// credibility (APP-6A Table III note b, 2525C Table IV note 4).
const ratingScale = (pattern) => fieldReference.evaluationRating.rows.filter(([code]) => pattern.test(code));

// Small tools next to a field's input: Now (UTC) for W, the scale picker for J.
function fieldTools(field) {
  if (field.key === "dtg")
    return `<button type="button" class="field-tool" data-dtg-now="${field.id}" title="Fill the current time in this field's format">Now (UTC)</button>`;
  if (field.key === "evaluationRating")
    return `<button type="button" class="field-tool" data-rating-toggle aria-expanded="false" aria-controls="rating-${field.id}" title="Choose from the reliability and credibility scales">A–F · 1–6</button>`;
  return "";
}

function ratingHelperHtml(field) {
  const select = (part, caption, codes) =>
    `<label><span>${caption}</span><select data-rating-part="${part}">${option("", "Choose…")}${codes.map(([code, meaning]) => option(code, `${code} — ${meaning}`)).join("")}</select></label>`;
  return `<div class="rating-helper" id="rating-${field.id}" data-rating-helper hidden>${select("reliability", "Source reliability", ratingScale(/^[A-F]$/))}${select("credibility", "Information credibility", ratingScale(/^[1-6]$/))}</div>`;
}

// The code table of AO for the editions that use the A:BBB-CC grammar without
// a field table here (MIL-STD-2525D/E, APP-6E). APP-6D builds AO from lists;
// 2525C and APP-6B define no code list. Opened on request only.
function engagementReferenceHtml() {
  const reference = fieldReference.engagementBar;
  return `<details class="field-reference" data-ao-reference hidden><summary>${escapeHtml(reference.title)}</summary><dl class="reference-table">${reference.rows
    .map(([code, meaning]) => `<dt>${escapeHtml(code)}</dt><dd>${escapeHtml(meaning)}</dd>`)
    .join("")}</dl><p>${escapeHtml(reference.note)}</p></details>`;
}

function fieldHtml(field) {
  const described = `aria-describedby="about-${field.id} warn-${field.id}"`;
  const control = field.choices
    ? `<select id="${field.id}" data-modifier-field="${field.key}" ${described}>${field.choices.map(([value, label]) => option(value, label)).join("")}</select>`
    : `<input id="${field.id}" data-modifier-field="${field.key}" autocomplete="off" spellcheck="false" ${described} />`;
  return `<div class="text-field" data-field-wrapper="${field.key}">
    <label class="field-label" for="${field.id}"><span class="field-code" data-field-code>${escapeHtml(field.field || "–")}</span><span class="field-name" data-field-label>${escapeHtml(field.label)}</span><span class="field-count" data-field-count aria-hidden="true"></span></label>
    <div class="field-control">${control}${fieldTools(field)}</div>
    ${field.key === "evaluationRating" ? ratingHelperHtml(field) : ""}${field.key === "engagementBar" ? engagementBuilderHtml() + engagementReferenceHtml() : ""}
    <span class="visually-hidden" id="about-${field.id}" data-field-about></span>
    <div class="field-warn" id="warn-${field.id}" data-field-warn hidden></div>
  </div>`;
}

function createTextFields() {
  const container = document.getElementById("app6aTextFields");
  // One form for every edition. Groups and fields keep this order; fields that
  // do not apply to the symbol are hidden and listed under "Not available".
  container.innerHTML = modifierGroups.map((group, index) => `<section class="modifier-group" data-group="${index}" aria-labelledby="group-${index}">
    <h4 id="group-${index}">${escapeHtml(group.label)}</h4>
    <div class="field-grid">${group.fields.filter((field) => field.key !== "engagementType").map(fieldHtml).join("")}</div>
  </section>`).join("");
  // Q and AJ join the movement group, after Z (speed).
  container.querySelector('[data-field-wrapper="speed"]').parentElement.append(dom.directionRow, dom.speedLeaderRow);
  container.addEventListener("input", (event) => {
    // Q and AJ have their own listeners (bindEvents).
    if (event.target.matches("[data-rating-part], [data-ao-part]") || event.target.closest(".graphic-field")) return;
    recordTextOrigin(event.target);
    renderAll();
  });
  container.addEventListener("change", (event) => {
    if (event.target.matches("[data-ao-part]")) return composeEngagementInput(event.target);
    if (!event.target.matches("[data-rating-part]")) return;
    const wrapper = event.target.closest(".text-field");
    const value = evaluationRating(
      wrapper.querySelector('[data-rating-part="reliability"]').value,
      wrapper.querySelector('[data-rating-part="credibility"]').value
    );
    if (!value) return;
    const input = wrapper.querySelector("[data-modifier-field]");
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  container.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-rating-toggle]");
    if (toggle) {
      const helper = document.getElementById(toggle.getAttribute("aria-controls"));
      helper.hidden = !helper.hidden;
      toggle.setAttribute("aria-expanded", String(!helper.hidden));
      if (!helper.hidden) helper.querySelector("select").focus();
      return;
    }
    const button = event.target.closest("[data-dtg-now]");
    if (!button) return;
    const input = document.getElementById(button.dataset.dtgNow);
    input.value = nowForDtg();
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  });
  container.addEventListener("focusin", (event) => {
    const wrapper = event.target.closest("[data-field-wrapper]");
    if (wrapper) setFocusField(wrapper.dataset.fieldWrapper);
  });
  dom.carryNotes.addEventListener("click", (event) => {
    const button = event.target.closest("[data-clear-field]");
    const field = button && textModifiers.find((item) => item.key === button.dataset.clearField);
    if (!field) return;
    const input = document.getElementById(field.id);
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

// Now (UTC) for W: the year length of this symbol's W definition, else the
// edition's printed format (field-guide.js).
function nowForDtg() {
  const sidc = state.customSidc || buildSidc();
  const definition = currentFieldStates(sidc).find((item) => item.key === "dtg");
  const guide = fieldGuide(state.standardId, symbolClassOf(sidc), textModifiers.find((item) => item.key === "dtg"));
  return dtgForField(new Date(), definition, guide.printed);
}

// The profile's class name for the symbol ("unit", "landInstallation"), or "".
function symbolClassOf(sidc) {
  const profile = activeProfile();
  return profile && profile.fields(sidc) ? profile.symbolClass(sidc) : "";
}

// Remember what a text field meant where the user typed it, so a later change
// of edition or symbol can warn when the same text is read differently.
function recordTextOrigin(input) {
  const key = input.dataset.modifierField;
  if (!key) return;
  delete state.droppedChoices[key];
  const definition = input.value && currentFieldStates().find((item) => item.key === key);
  if (definition && definition.available) state.textOrigins[key] = { meaning: fieldMeaning(definition), where: describeWhere() };
  else delete state.textOrigins[key];
}

function describeWhere(sidc = state.customSidc || buildSidc()) {
  const profile = activeProfile();
  const kind = profile && classWords(profile.symbolClass(sidc));
  return kind ? `${config().label} ${kind}` : config().label;
}

// AO "A:BBB-CC" (APP-6D): three lists compose the text that is sent; the stage
// comes first because the other two depend on it. The bar colour (engagement
// type) is a companion of AO, shown under it where the edition defines it.
const engagementSourceNames = { R: "remote", B: "local and remote" };
function engagementBuilderHtml() {
  const type = textModifiers.find((field) => field.key === "engagementType");
  const part = (name, caption) => `<label class="ao-part"><span>${caption}</span><select data-ao-part="${name}"></select></label>`;
  return `<div class="ao-builder" data-ao-builder hidden>${part("b", "Stage (BBB)")}${part("a", "Engaged by (A)")}${part("c", "Weapon or count (CC)")}<p class="ao-preview" data-ao-preview></p></div>
    <div class="ao-type" data-companion="engagementType" hidden><label for="${type.id}">Bar colour</label><select id="${type.id}" data-modifier-field="engagementType" aria-describedby="about-${type.id}">${type.choices.map(([value, label]) => option(value, label)).join("")}</select><span class="visually-hidden" id="about-${type.id}">Target designation colour of the engagement bar: target, non-target or expired. It is drawn with the AO text.</span></div>`;
}

function composeEngagementInput(select) {
  const wrapper = select.closest("[data-field-wrapper]");
  const input = wrapper.querySelector('[data-modifier-field="engagementBar"]');
  const value = (name) => wrapper.querySelector(`[data-ao-part="${name}"]`).value;
  const parts = { a: value("a"), b: value("b"), c: value("c") };
  // The list behind CC changes with the stage (weapons, or counts for MLT).
  if (select.dataset.aoPart === "b" && (parts.b === "MLT") !== (parseEngagement(input.value).b === "MLT")) parts.c = "";
  input.value = composeEngagement(parts);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function syncEngagementBuilder(wrapper, definition, input) {
  const builder = wrapper.querySelector("[data-ao-builder]");
  if (!builder) return;
  const composite = Boolean(definition && definition.parts);
  builder.hidden = !composite;
  input.hidden = composite;
  wrapper.classList.toggle("wide", composite);
  wrapper.querySelector("[data-ao-reference]").hidden = composite || !["2525d", "2525e", "app6e"].includes(state.standardId);
  if (!composite) return;
  const options = engagementOptions(definition.parts, app6dEngagementError);
  const parts = parseEngagement(input.value);
  const fill = (name, list, value, blank, label) => {
    const select = builder.querySelector(`[data-ao-part="${name}"]`);
    select.innerHTML =
      option("", blank) +
      list.map(([code, text]) => option(code, label(code, text))).join("") +
      (value && !list.some(([code]) => code === value) ? option(value, `${value} (not defined)`) : "");
    select.value = value;
    select.disabled = name !== "b" && !parts.b;
  };
  fill("a", options.sources, parts.a, "Local (no prefix)", (code) => `${code} — ${engagementSourceNames[code] || code}`);
  fill("b", options.stages, parts.b, "None", (code, text) => `${code} — ${text}`);
  fill("c", parts.b === "MLT" ? options.counts : options.weapons, parts.c, "None", (code, text) => `${code} — ${text}`);
  const message = parts.b || input.value ? app6dEngagementError(input.value) : "";
  const preview = builder.querySelector("[data-ao-preview]");
  preview.textContent = input.value ? `Drawn as ${input.value}${message ? ` — ${message}` : ""}` : `Format ${definition.format}. Choose the stage first.`;
  preview.classList.toggle("problem", Boolean(message));
}

// The bar colour sits under AO and follows engagementTypeState(); a value it
// cannot use stays in the select and is reported, unsent.
function syncEngagementType(definition, select) {
  const companion = select.closest("[data-companion]");
  companion.hidden = !definition.available;
  select.disabled = !definition.available;
}

function setFocusField(key) {
  if (state.focusField !== key) {
    state.focusField = key;
    for (const wrapper of document.querySelectorAll("[data-field-wrapper]"))
      wrapper.classList.toggle("focused", wrapper.dataset.fieldWrapper === key);
    for (const box of dom.layoutCanvas.querySelectorAll("[data-layout-key]"))
      box.classList.toggle("focused", box.dataset.layoutKey === key);
  }
  syncListHelp();
}

function currentFieldStates(sidc = state.customSidc || buildSidc()) {
  const profile = activeProfile();
  const states = profile
    ? profileFieldStates(textModifiers, profile, sidc)
    : fieldStates(textModifiers, null);
  // The bar colour is offered with AO, as the edition allows (APP-6D: hostile).
  const ao = states.find((item) => item.key === "engagementBar");
  const type = engagementTypeState(profile, sidc, Boolean(ao && ao.available));
  return states.map((item) =>
    item.key === "engagementType" ? { ...item, field: "", label: "Engagement bar colour", available: type.available, reason: type.reason, choices: null } : item
  );
}

// Keys the edition allows for this SIDC; null when every field applies.
function profiledFieldKeys(sidc) {
  const profile = activeProfile();
  if (profile && !profile.fields(sidc)) return null;
  if (!profile && state.standardId !== "app6a") return null;
  return currentFieldStates(sidc).filter((item) => item.available).map((item) => item.key);
}

// Offer a profile's literal values: rebuild a select, or suggest via a datalist.
function applyFieldChoices(field, input, profileChoices, alternates) {
  // Profiles may list plain literals; the form uses [value, label] pairs. J
  // has its own scale picker instead of a list of all 36 pairs.
  const choices = field.key !== "evaluationRating" && profileChoices && profileChoices.map((choice) => (Array.isArray(choice) ? choice : [String(choice), String(choice)]));
  if (field.choices) {
    let list = choices ? [["", field.choices[0][1]], ...choices.filter(([code]) => code !== "")] : field.choices;
    // A form the profile accepts besides its own list (APP-6D F "(+)") stays selectable.
    const dropped = state.droppedChoices[field.key];
    const wanted = input.value || dropped || "";
    if (wanted && !list.some(([code]) => code === wanted) && (alternates || []).includes(wanted)) list = [...list, [wanted, `${wanted} (alternate form)`]];
    const signature = JSON.stringify(list);
    if (input.dataset.choices === signature) return;
    input.innerHTML = list.map(([code, label]) => option(code, label)).join("");
    input.dataset.choices = signature;
    // A value this edition does not define is not reinterpreted: it is cleared,
    // reported next to the form, and comes back when a list defines it again.
    if (wanted && list.some(([code]) => code === wanted)) {
      input.value = wanted;
      delete state.droppedChoices[field.key];
    } else {
      input.value = "";
      if (wanted) state.droppedChoices[field.key] = wanted;
    }
    return;
  }
  const id = `choices-${field.id}`;
  let datalist = document.getElementById(id);
  if (!choices) {
    input.removeAttribute("list");
    return;
  }
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = id;
    input.after(datalist);
  }
  datalist.innerHTML = choices.map(([code, label]) => option(code, label)).join("");
  input.setAttribute("list", id);
}

// What the List and the help line say about a field: its rule, format,
// example and source notes, for the symbol in the editor.
const fieldHelp = new Map();

function syncApp6aTextFields() {
  const sidc = state.customSidc || buildSidc();
  const profile = activeProfile();
  const active = profile ? Boolean(profile.fields(sidc)) : state.standardId === "app6a";
  const kind = active && profile ? profile.symbolClass(sidc) : "";
  const fieldNote = document.getElementById("app6aFieldNote");
  fieldNote.hidden = !active;
  fieldNote.textContent = profileNotes[state.standardId] || "";
  const container = document.getElementById("app6aTextFields");
  const states = new Map(currentFieldStates(sidc).map((item) => [item.key, item]));
  const extras = profile ? profileExtraFields(profile, sidc, textModifiers.map((field) => field.key)) : [];
  const values = Object.fromEntries(textModifiers.map(({ key, id }) => [key, document.getElementById(id).value]));
  // Text that breaks the edition's format warns under its field; the symbol is
  // still drawn and stays valid.
  const warned = new Map();
  for (const { key, message } of (profile && profile.validate(sidc, values).details.fieldWarnings) || [])
    warned.set(key, [...(warned.get(key) || []), `${humanize(shortReason(message))}.`]);
  for (const key of Object.keys(state.textOrigins)) if (!values[key]) delete state.textOrigins[key];
  const carried = new Map(carryWarnings({ states: [...states.values()], values, origins: state.textOrigins, extras }).map((item) => [item.key, item]));
  const query = normalize(state.fieldQuery).trim();
  const matches = (definition) => !query || normalize(definition.field) === query || normalize(definition.label).includes(query);
  const counts = { available: 0, shown: 0, filled: 0, hiddenFilled: 0 };
  for (const field of textModifiers) {
    const input = document.getElementById(field.id);
    const definition = states.get(field.key);
    if (field.key === "engagementType") {
      syncEngagementType(definition, input);
      fieldWarnings.set(field.key, []);
      continue;
    }
    const wrapper = input.closest("[data-field-wrapper]");
    const filled = Boolean(input.value);
    const visible = definition.available && matches(definition) && (!state.filledOnly || filled);
    wrapper.hidden = !visible;
    wrapper.classList.toggle("filled", filled);
    input.disabled = !definition.available;
    if (definition.available) {
      counts.available += 1;
      if (filled) counts.filled += 1;
      if (visible) counts.shown += 1;
      else if (filled) counts.hiddenFilled += 1;
    }
    const warning = wrapper.querySelector("[data-field-warn]");
    const lines = [];
    if (definition.available) {
      const guide = fieldGuide(state.standardId, kind, field);
      wrapper.querySelector("[data-field-label]").textContent = definition.label;
      wrapper.querySelector("[data-field-code]").textContent = definition.field || "–";
      applyFieldChoices(field, input, definition.choices || definition.examples || null, definition.alternates);
      syncEngagementBuilder(wrapper, definition, input);
      // A value the profile lists (APP-6D K "Fully Operational") is the
      // example; else the edition's guide; J keeps its own A1-F6 example.
      const listed = field.key !== "evaluationRating" && (definition.examples || definition.choices || [])[0];
      const example = listed ? String(Array.isArray(listed) ? listed[0] : listed) : guide.example;
      if (!field.choices) {
        if (definition.maxLength) input.maxLength = definition.maxLength;
        else input.removeAttribute("maxlength");
        input.placeholder = example ? `e.g. ${example}` : "";
      }
      if (field.key === "evaluationRating") syncRatingHelper(wrapper, input.value);
      // Rules the profile attaches to the field: format, length, source tensions.
      const rule = fieldRule(definition, input.value);
      const help = [guide.description];
      const format = rule.hint || guide.format;
      if (format) help.push(`Format: ${format}.`);
      if (definition.maxLength && !field.choices) help.push(`At most ${definition.maxLength} characters.`);
      if (example && !field.choices && !definition.parts) help.push(`Example: ${example}.`);
      if (definition.requiresEchelonDivisionOrBelow) help.push("Used at division level and below.");
      if (definition.unresolved) help.push(`${definition.nonBlocking ? "Source note" : "Unresolved in the source"}: ${definition.unresolved}.`);
      fieldHelp.set(field.key, help.join(" "));
      wrapper.querySelector("[data-field-about]").textContent = help.join(" ");
      // The edition's own wording when it has a rule for the value; a broken
      // rule warns here and leaves the symbol valid.
      if (warned.has(field.key)) lines.push(...warned.get(field.key));
      else if (rule.problem) lines.push(`${definition.field} ${rule.problem}.`);
      if (definition.unresolved && !definition.nonBlocking && input.value) lines.push("Unresolved in the source: the symbol is reported as not valid while this field is filled.");
      if (carried.has(field.key)) lines.push(carried.get(field.key).message);
    }
    warning.hidden = !lines.length;
    warning.innerHTML = lines.map(escapeHtml).join("<br>");
    fieldWarnings.set(field.key, lines);
    const counter = wrapper.querySelector("[data-field-count]");
    const max = !field.choices && input.maxLength > 0 ? input.maxLength : 0;
    counter.textContent = field.choices || definition.parts ? "" : max ? `${input.value.length}/${max}` : filled ? String(input.value.length) : "";
    counter.classList.toggle("full", Boolean(max) && input.value.length >= max);
  }
  // Q and AJ: shown where the edition gives them to the symbol, like the rest.
  const movement = movementFor(sidc);
  for (const definition of graphicAmplifiers) {
    const wrapper = document.querySelector(`[data-field-wrapper="${definition.key}"]`);
    const applies = movement[definition.key].applies;
    const filled = applies && graphicFilled(definition.key);
    const visible = applies && matches(definition) && (!state.filledOnly || filled);
    wrapper.hidden = !visible;
    wrapper.classList.toggle("filled", filled);
    const help = graphicHelp(definition.key);
    fieldHelp.set(definition.key, help);
    wrapper.querySelector("[data-field-about]").textContent = help;
    if (!applies) continue;
    counts.available += 1;
    if (filled) counts.filled += 1;
    if (visible) counts.shown += 1;
    else if (filled) counts.hiddenFilled += 1;
  }
  for (const group of container.querySelectorAll(".modifier-group"))
    group.hidden = ![...group.querySelectorAll("[data-field-wrapper]")].some((wrapper) => !wrapper.hidden);
  renderCarryNotes([...carried.values()], states);
  renderUnavailable(states, { sidc, profile, kind, active });
  renderListFilters(counts, query);
  dom.textSummary.textContent = active ? `${config().label} · ${counts.available} applicable fields` : `${config().label} · ${counts.available} fields`;
  dom.textApplies.textContent = active
    ? `${profileTitles[state.standardId]}: ${counts.available} text fields apply to ${({ unit: "units", equipment: "equipment", installation: "installations", point: "tactical points", nuclear: "nuclear points" })[kind] || (kind ? `${classWords(kind)} symbols` : "this symbol")}.`
    : `${config().label} has no field table here: all ${counts.available} fields are offered, and placement follows the renderer's symbol-set rules. Offering a field does not mean this edition defines it for the symbol.`;
  dom.textFilledBadge.hidden = !counts.filled;
  dom.textFilledBadge.textContent = `${counts.filled} filled`;
  // Stacking is a display extension outside the APP-6A publication profile.
  dom.stackField.hidden = dom.stack.disabled = state.standardId === "app6a";
  syncListHelp();
}

// J scale picker: follows the typed value.
function syncRatingHelper(wrapper, value) {
  const valid = /^[A-F][1-6]$/.test(value);
  for (const [part, index] of [["reliability", 0], ["credibility", 1]]) {
    const select = wrapper.querySelector(`[data-rating-part="${part}"]`);
    if (document.activeElement !== select) select.value = valid ? value[index] : "";
  }
}

// Search and "Filled only" hide fields, never their values; the status line
// says how many filled fields a filter hides.
function renderListFilters(counts, query) {
  dom.filledOnly.setAttribute("aria-pressed", String(state.filledOnly));
  dom.filledOnly.classList.toggle("active", state.filledOnly);
  dom.filledOnly.textContent = counts.filled ? `Filled only · ${counts.filled}` : "Filled only";
  const filtering = Boolean(query) || state.filledOnly;
  const parts = [];
  if (filtering) parts.push(counts.shown ? `Showing ${counts.shown} of ${counts.available} fields.` : query ? `No applicable field matches "${state.fieldQuery.trim()}".` : "No field is filled yet.");
  if (counts.hiddenFilled) parts.push(`${counts.hiddenFilled} filled ${counts.hiddenFilled === 1 ? "field is" : "fields are"} hidden by the filter.`);
  dom.filterStatus.innerHTML = parts.length ? `${escapeHtml(parts.join(" "))} <button type="button" class="link-button" data-clear-filters>Show all</button>` : "";
  dom.filterStatus.hidden = !parts.length;
}

// Closed section under the form: fields of this edition that do not apply to
// the symbol (with the edition's own names) and graphics the edition defines
// that this editor cannot set. Another edition's fields are not listed.
function renderUnavailable(states, { sidc, profile, kind, active }) {
  const notHere = [];
  if (active)
    for (const field of textModifiers) {
      const definition = states.get(field.key);
      if (field.key === "engagementType" || definition.available) continue;
      const own = editionField(state.standardId, field.key, editionTables);
      if (own === null) continue;
      const name = own || { field: definition.field, label: definition.label };
      const reason = humanize(shortReason(definition.reason).replace(new RegExp(`^${field.key} is `), ""));
      notHere.push({ field: name.field, label: name.label, reason: reason.charAt(0).toUpperCase() + reason.slice(1), full: definition.reason });
    }
  const movement = movementFor(sidc);
  if (active)
    for (const definition of graphicAmplifiers) {
      const control = movement[definition.key];
      // A field the edition does not have (APP-6A AJ) is not listed.
      if (control.applies || control.defined === false) continue;
      const kept = !graphicFilled(definition.key) ? "" : definition.key === "direction" ? `The heading ${graphicValue("direction")}°` : `The length ${graphicValue("speedLeader")}`;
      notHere.push({ field: definition.field, label: definition.label, reason: movementNote(control, kept), full: control.reason, kept });
    }
  const gaps = active ? editorGaps({ standardId: state.standardId, profile, sidc, tables: editionTables, movement }) : [];
  // A code that means something else for this class (APP-6D Land Unit AC is
  // the installation graphic) is listed once, with that meaning.
  for (let index = notHere.length - 1; index >= 0; index -= 1) {
    const gap = gaps.find((item) => item.field === notHere[index].field);
    if (!gap) continue;
    // A kept value (the heading of Q) is still reported on the remaining row.
    if (notHere[index].kept) gap.kept = `${notHere[index].kept} is kept and returns on a symbol that takes it.`;
    notHere.splice(index, 1);
  }
  const row = (item) => `<li><span class="field-code">${escapeHtml(item.field || "–")}</span><span class="unavailable-name">${escapeHtml(item.label)}</span><small title="${escapeHtml(item.full || item.reason)}">${escapeHtml(item.reason)}</small></li>`;
  const total = notHere.length + gaps.length;
  dom.unavailableFields.hidden = !total;
  dom.unavailableSummary.textContent = `Not available for this symbol · ${total}`;
  dom.unavailableBody.innerHTML = [
    notHere.length ? `<h5>Not for ${escapeHtml(kind ? classWords(kind) : "this")} symbols</h5><ul>${notHere.map(row).join("")}</ul>` : "",
    gaps.length ? `<h5>Defined by the standard, not supported by this editor</h5><ul>${gaps.map((item) => row({ ...item, reason: `${humanize(shortReason(item.reason)) || item.reason}${item.kept ? `. ${item.kept}` : ""}`, full: item.reason })).join("")}</ul>` : ""
  ].join("");
}

// One help line under the List, always the same height, so focusing a field
// never moves the form: the focused field's code, name, rule and example.
function syncListHelp() {
  const key = state.focusField;
  const field = textModifiers.find((item) => item.key === key) || graphicAmplifiers.find((item) => item.key === key);
  const input = field && document.getElementById(field.id || (key === "direction" ? "directionNumber" : key));
  const wrapper = input && input.closest("[data-field-wrapper]");
  if (!field || !wrapper || wrapper.hidden || input.disabled) {
    dom.listHelp.innerHTML = '<span class="list-help-title"><span>Select a field for its format and an example.</span></span><span class="list-help-text">Values stay when you switch views.</span>';
    return;
  }
  const code = wrapper.querySelector("[data-field-code]").textContent;
  const name = wrapper.querySelector("[data-field-label]").textContent;
  const count = !field.choices && input.maxLength > 0 ? `<span class="layout-count">${input.value.length} / ${input.maxLength}</span>` : "";
  const text = fieldHelp.get(key) || field.description;
  dom.listHelp.innerHTML = `<span class="list-help-title"><span class="field-code">${escapeHtml(code)}</span><strong>${escapeHtml(name)}</strong>${count}</span><span class="list-help-text" title="${escapeHtml(text)}">${escapeHtml(text)}</span>`;
}

// Non-blocking list above the text fields: text that is kept but not drawn,
// text now read under a different meaning, and select values cleared because
// the edition does not define them. Nothing here changes what the user typed.
function renderCarryNotes(warnings, states) {
  const rows = warnings.map((item) => ({ ...item, clearable: true }));
  for (const [key, value] of Object.entries(state.droppedChoices)) {
    const definition = states.get(key);
    if (definition) rows.push({ key, field: definition.field, label: definition.label, value, kind: "dropped", message: `"${value}" is not a defined value in ${config().label}, so the choice is cleared. It returns if a symbol or edition defines it again.` });
  }
  dom.carryNotes.hidden = !rows.length;
  dom.carryNotes.innerHTML = rows.length
    ? `<h4>Check these entries (${rows.length})</h4>` +
      rows.map((item) => `<div class="carry-row" data-kind="${item.kind}"><span class="field-code">${escapeHtml(item.field || "–")}</span><div><b>${escapeHtml(item.label)}</b>${item.kind === "dropped" ? "" : ` <q>${escapeHtml(item.value)}</q>`}<span>${escapeHtml(item.message)}</span></div>${item.clearable ? `<button type="button" class="quiet-button" data-clear-field="${escapeHtml(item.key)}">Clear</button>` : ""}</div>`).join("")
    : "";
}

function selectImportedValue(select, value) {
  if (![...select.options].some(item => item.value === value))
    select.insertAdjacentHTML("beforeend", option(value, `SIDC: ${value.replace(/^code:/, "")}`));
  select.value = value;
}

function applyImportedSidc(value) {
  const standardId = config().family === "modern" ? standardForSidc(value, state.standardId) : state.standardId;
  if (standardId !== state.standardId) setStandard(standardId);
  state.adjustments = {};
  const parsed = decodeEditorSidc(value, { ...config(), icons: dataset().icons });
  const modern = config().family === "modern";
  const encoding = modern ? "numeric" : "legacy";
  const identity = decodeIdentity(parsed.identity, config(), parsed.context);
  const source = parsed.mobility ? mobilities : echelons;
  const amplifier = parsed.mobility || parsed.echelon;
  const amplifierValue = source.find(item => item[modern ? 2 : 3] === amplifier)?.[0];
  Object.assign(state, {
    customSidc: value,
    importedIcon: parsed.icon,
    selectedId: parsed.icon.id,
    affiliation: identity?.value || `code:${parsed.identity}`,
    status: statuses.find(item => item[encoding] === parsed.status)?.value || `code:${parsed.status}`,
    context: identity?.context || parsed.context,
    amplifierMode: parsed.mobility ? "mobility" : ["-", "00"].includes(amplifier) ? "none" : "echelon",
    amplifierValue: amplifierValue ?? `code:${amplifier}`,
    modifier1: parsed.modifier1,
    modifier2: parsed.modifier2
  });
  for (const key of ["hq", "taskForce", "feintDummy"]) dom[key].checked = parsed[key];
  selectImportedValue(dom.frameShape, parsed.frameShape);
  syncStandardControls();
}

// Exercise relabels suspect and hostile as Joker and Faker.
function populateIdentityOptions() {
  dom.affiliation.innerHTML = identityList(config())
    .map((item) => option(item.value, identityLabelFor(item)))
    .join("");
  selectImportedValue(dom.affiliation, state.affiliation);
}

function syncStandardControls() {
  const contexts = contextOptions(config());
  dom.contextField.hidden = !contexts.length;
  dom.frameShapeField.hidden = numericSidcEdition(config().version) !== "e";
  // Validate after removing publication whitespace, not while pasting it.
  dom.sidcInput.removeAttribute("maxlength");
  populateIdentityOptions();
  dom.status.innerHTML = statusChoices()
    .map((item) => option(item.value, statusLabelFor(item)))
    .join("");
  selectImportedValue(dom.status, state.status);
  dom.context.innerHTML = contexts.map((item) => option(item[0], contextLabel(config(), item))).join("");
  if (contexts.length) selectImportedValue(dom.context, state.context);
  populateAmplifier();
  syncModifiers();
  renderCountryOptions();
}

const schemeNames = { S: "Warfighting", G: "Tactical graphic", W: "Weather", I: "Intelligence", O: "Stability operations", E: "Emergency management" };
const dimensionNames = { P: "Space", A: "Air", G: "Ground", S: "Sea surface", U: "Subsurface", F: "Special operations", X: "Other", Z: "Unknown" };
const contextNames = { 0: "Reality", 1: "Exercise", 2: "Simulation" };
const legacyFlagNames = { "-": "", F: "Feint / dummy", A: "Headquarters", C: "HQ · feint", E: "Task force", G: "Task force · feint", B: "Task force HQ", D: "Task force HQ · feint" };
let flagNames = new Map();

function describePart(key, value, sidc) {
  const modern = /^\d/.test(sidc);
  const icon = selectedIcon();
  const flagName = (code) => (code && flagNames.get(code)) || "";
  switch (key) {
    case "scheme": return schemeNames[value] || "";
    case "identity": {
      const identity = decodeIdentity(modern ? value[1] : value, config(), modern ? value[0] : "0");
      const entry = identity && identityList(config()).find((item) => item.value === identity.value);
      const label = entry ? identityLabelFor(entry, identity.context) : "";
      const context = contextOptions(config()).find(([code]) => code === value[0]);
      if (modern) return [(context && context[1]) || contextNames[value[0]] || "Context " + value[0], label].filter(Boolean).join(" · ");
      return identity?.context === "1" ? `Exercise · ${label}` : label;
    }
    case "dimension": return dimensionNames[value] || "";
    case "status": return statuses.find((item) => item.legacy === value)?.label || "";
    case "function":
    case "entity": return icon?.name || "";
    case "set": return icon?.category || "";
    case "version": return { d: "Edition D", e: "Edition E" }[numericSidcEdition(value)] || "";
    case "modifiers": {
      if (modern) return value === "0000" ? "None" : "Icon modifiers";
      if (/^\*+$/.test(value)) return "Not set";
      if (value[0] === "H") return value === "HB" ? "Installation · feint" : "Installation";
      const mobility = mobilities.find((item) => item[3] === value);
      if (mobility) return mobility[1];
      const echelon = echelons.find((item) => item[3] === value[1] && item[3] !== "-");
      return [legacyFlagNames[value[0]], echelon?.[1]].filter(Boolean).join(" · ") || "None";
    }
    case "amplifier": {
      const statusEntry = statuses.find((item) => item.numeric === value[0]);
      const status = statusEntry && statusLabelFor(statusEntry);
      const flags = ["", "Feint / dummy", "Headquarters", "HQ · feint", "Task force", "TF · feint", "Task force HQ", "TF HQ · feint"][Number(value[1])];
      const amplifier = [...echelons, ...mobilities].find((item) => item[2] === value.slice(2) && item[2] !== "00")?.[1];
      return [status, flags, amplifier].filter(Boolean).join(" · ");
    }
    case "country":
    case "originatorCountry": return flagName(countryFlagFromSidc(sidc, state.standardId)) || (/^[-0*]+$/.test(value) ? "Not set" : "");
    case "frameShape": return [...dom.frameShape.options].find((item) => item.value === value)?.textContent || "";
    case "oob": return value === "-" || value === "*" ? "Not set" : "";
    default: return "";
  }
}

function updateSegments(sidc) {
  const dEdition = ["app6d", "2525d"].includes(state.standardId);
  dom.sidcSegments.innerHTML = sidcParts(sidc, dEdition)
    .map(({ key, label, value }) => {
      const meaning = describePart(key, value, sidc);
      // The symbol's own part (function or entity) gets a full row for its long names.
      const wide = key === "function" || key === "entity" ? ' class="wide"' : "";
      // Every box keeps its second line. A part the standard's tables give no
      // meaning (national data, extensions) shows a quiet dash, not a guess.
      const said = meaning
        ? `<dd>${escapeHtml(meaning)}</dd>`
        : `<dd class="none"><span aria-hidden="true">—</span><span class="visually-hidden">No meaning listed</span></dd>`;
      return `<div${wide}><dt><span>${escapeHtml(label)}</span><code>${escapeHtml(value || "—")}</code></dt>${said}</div>`;
    })
    .join("");
}

const chipCache = new Map();

function chipSvg(sidc, { size = 18, icon = true, modifierColor = "", hqStaffLength = 0 } = {}) {
  const key = `${state.standardId}|${sidc}|${dom.colorMode.value}|${dom.strokeWidth.value}|${size}|${icon}|${modifierColor}|${hqStaffLength}`;
  if (!chipCache.has(key)) {
    let svg = "";
    try {
      svg = new window.ms.Symbol(sidc, { ...currentOptions(true), size, icon, infoFields: false, modifierColor, hqStaffLength }).asSVG();
    } catch {}
    if (chipCache.size > 400) chipCache.clear();
    chipCache.set(key, svg);
  }
  return chipCache.get(key);
}

// Unit designation: each switch shows the current frame with its mark alone,
// coded as flagCode() codes them (feint/dummy 1, headquarters 2, task force 4).
// base is the SIDC without designation or amplifier, as renderChips() makes it.
const designationCodes = { feintDummy: 1, hq: 2, taskForce: 4 };
// The thumbnails draw a short staff (40 units instead of 100): at full length
// the headquarters or location-offset staff is the tallest part and shrinks
// every frame of the group to a few pixels.
function renderDesignationGlyphs(base, modern) {
  const options = { size: 30, hqStaffLength: 40 };
  const svgs = Object.values(designationCodes).map((code) => {
    if (modern) return chipSvg(`${base.slice(0, 7)}${code}${base.slice(8)}`, options);
    // An installation keeps its H; only feint/dummy goes with it.
    const amplifier = base[10] === "H" ? `H${code === 1 ? "B" : "-"}` : `${legacyFlagLetters[code]}-`;
    return chipSvg(`${base.slice(0, 10)}${amplifier}${base.slice(12)}`, options);
  });
  const drawn = centeredGlyphs(svgs);
  Object.keys(designationCodes).forEach((key, index) => {
    dom[key].closest("label").querySelector(".toggle-glyph").innerHTML = drawn[index];
  });
}

// Chips are a visual front end for the identity and status selects, which
// stay the single source of truth for import and edit logic.
function renderChips(sidc) {
  const modern = config().family === "modern";
  let base = sidc;
  if (modern) base = base.padEnd(20, "0").slice(0, 7) + "000" + base.padEnd(20, "0").slice(10);
  else if (base[10] !== "H") base = base.padEnd(15, "-").slice(0, 10) + "--" + base.padEnd(15, "-").slice(12);
  const variant = (position, code) => base.slice(0, position) + code + base.slice(position + 1);
  // A chip the edition profile does not offer stays only while it is the
  // current value, flagged, so the problem line and the chip agree.
  const chip = (select, value, label, glyph, flag) =>
    `<button type="button" class="chip${flag ? " chip-invalid" : ""}" data-value="${escapeHtml(value)}" aria-pressed="${select.value === value}"${flag ? ` title="${escapeHtml(flag)}"` : ""}${select.disabled ? " disabled" : ""}><span class="chip-glyph">${glyph}</span><span>${escapeHtml(label)}</span>${flag ? '<small class="chip-flag">not valid here</small>' : ""}</button>`;
  // The pictures of a group share one scale, each frame centred in its box,
  // so the CSS can draw them as large as the chip allows.
  const glyphsFor = (rows, position) => centeredGlyphs(rows.map((row) => (row.code ? chipSvg(variant(position, row.code), { size: 30 }) : "")));
  const standard = config();
  const identities = identityList(standard);
  const offers = profileOffers(sidc);
  // Returns "" to show the chip, null to hide it, or the reason to flag it.
  const offerFlag = (select, kind, value, importedReason) => {
    if (value.startsWith("code:")) return importedReason || "This code is not defined in this edition.";
    const offer = offers && offers[kind].get(value);
    if (!offer || offer.offered) return "";
    return select.value === value ? offer.reason || "Not valid for this symbol." : null;
  };
  // Re-rendering replaces the buttons; keep keyboard focus on the same chip.
  const focused = document.activeElement?.closest?.(".chip");
  const focusedGroup = focused && (dom.identityChips.contains(focused) ? dom.identityChips : dom.statusChips.contains(focused) ? dom.statusChips : null);
  const focusedValue = focusedGroup && focused.dataset.value;
  const importedIdentityReason = (value) =>
    state.standardId === "app6a" ? app6aRules.app6aIdentity(value.replace(/^code:/, ""), sidc[2]).reason : "";
  const identityRows = [];
  let secondarySelection = "";
  for (const item of dom.affiliation.options) {
    const entry = identities.find((candidate) => candidate.value === item.value);
    const flag = offerFlag(dom.affiliation, "identity", item.value, importedIdentityReason(item.value));
    if (flag === null) continue;
    const code = entry ? identityCode(entry, standard, state.context) : item.value.replace(/^code:/, "");
    const label = entry ? identityLabelFor(entry) : item.textContent;
    const common = ["friend", "hostile", "neutral", "unknown"].includes(item.value);
    identityRows.push({ value: item.value, label, code, flag, common });
    if (!common && item.value === dom.affiliation.value) secondarySelection = `· ${label}${flag ? " — not valid here" : ""}`;
  }
  // The four common identities and the rest are scaled apart: the "?", J and
  // K marks of the others widen their box and would shrink the four frames.
  const identityChips = (common) => {
    const rows = identityRows.filter((row) => row.common === common);
    const glyphs = glyphsFor(rows, modern ? 3 : 1);
    return rows.map((row, index) => chip(dom.affiliation, row.value, row.label, glyphs[index], row.flag)).join("");
  };
  document.getElementById("primaryIdentityChips").innerHTML = identityChips(true);
  document.getElementById("secondaryIdentityChips").innerHTML = identityChips(false);
  document.getElementById("moreIdentities").hidden = identityRows.every((row) => row.common);
  document.getElementById("moreIdentitySelection").textContent = secondarySelection;
  const statusRows = [];
  for (const item of dom.status.options) {
    const entry = statuses.find((candidate) => candidate.value === item.value);
    const flag = offerFlag(dom.status, "status", item.value);
    if (flag === null) continue;
    const code = entry ? entry[modern ? "numeric" : "legacy"] : item.value.replace(/^code:/, "");
    statusRows.push({ value: item.value, label: entry ? statusLabelFor(entry) : item.textContent, code, flag });
  }
  const statusGlyphs = glyphsFor(statusRows, modern ? 6 : 3);
  dom.statusChips.innerHTML = statusRows.map((row, index) => chip(dom.status, row.value, row.label, statusGlyphs[index], row.flag)).join("");
  renderDesignationGlyphs(base, modern);
  if (focusedGroup)
    [...focusedGroup.querySelectorAll(".chip")].find((item) => item.dataset.value === focusedValue)?.focus({ preventScroll: true });
}

// Name the SIDC position when an imported code is outside this edition.
function renderProblem() {
  if (!currentSymbol) return "This code cannot be rendered.";
  if (currentCheck.valid) return "";
  const modern = config().family === "modern";
  const detail = currentCheck.details;
  const sidc = state.customSidc || buildSidc();
  // selectImportedValue() adds "SIDC: …" options for values this edition does not offer.
  const imported = (select, start, end, what) =>
    select.selectedOptions[0]?.textContent.startsWith("SIDC: ")
      ? [{ text: `Position ${end - start > 1 ? `${start + 1}–${end}` : start + 1}: "${sidc.slice(start, end)}" is not ${what} in this edition.`, value: sidc.slice(start, end) }]
      : [];
  const reasons = problemReasons({
    named: [
      ...imported(dom.affiliation, modern ? 3 : 1, modern ? 4 : 2, "an identity"),
      ...imported(dom.status, modern ? 6 : 3, modern ? 7 : 4, "a status"),
      ...imported(dom.amplifierValue, modern ? 8 : 10, modern ? 10 : 12, "an echelon or mobility code")
    ],
    errors: [
      ...(detail.sidcErrors || []),
      ...(detail.identityErrors || []),
      ...(detail.modifierErrors || []),
      ...(detail.icon === false ? ["Unknown function code for this standard."] : [])
    ],
    generic: [
      ...(detail.affiliation === "undefined" ? ["Unknown identity."] : []),
      ...(detail.mobility === false ? ["Unknown echelon or mobility code."] : [])
    ]
  });
  return reasons.join(" ") || "The renderer could not validate this code.";
}

function renderSidcStatus(sidc) {
  const message = state.sidcMessage;
  let kind = "idle";
  let text = "Valid code. It follows every change in the editor.";
  if (state.sidcDirty) {
    kind = message && ["error", "info"].includes(message.kind) ? message.kind : "pending";
    text = kind === "pending" ? "Not applied yet. Press Enter or Apply; Esc returns to the current code." : message.text;
  } else {
    const problem = renderProblem();
    if (message && message.sidc === sidc) ({ kind, text } = message);
    if (problem) {
      kind = "error";
      // The badge already says to check the code, and "Applied" reads wrong on a fault.
      text = [message?.sidc === sidc ? message.notes : "", problem].filter(Boolean).join(" ");
    }
  }
  dom.sidcStatus.dataset.kind = kind;
  dom.sidcStatus.textContent = text;
  // A valid code with nothing to report needs no line; Rendered says so.
  dom.sidcStatus.hidden = kind === "idle";
  dom.sidcInput.classList.toggle("dirty", state.sidcDirty && kind === "pending");
  dom.sidcInput.classList.toggle("error", state.sidcDirty && kind === "error");
  dom.applySidc.classList.toggle("ready", state.sidcDirty);
  const length = dom.sidcInput.value.replace(/\s/g, "").length;
  dom.sidcLength.innerHTML = `${length}<span class="unit"> characters</span>`;
  dom.sidcLength.title = `${length} characters`;
  fitSidcInput();
}

function fitSidcInput() {
  dom.sidcInput.style.height = "auto";
  dom.sidcInput.style.height = `${dom.sidcInput.scrollHeight + 2}px`;
}

// What the edition profile reports besides errors: unresolved source conflicts
// and Version Extension Flags are shown outright; notes sit in a fold-out.
function renderProfileDetails() {
  const lines = currentCheck ? profileDetailLines(currentCheck.details) : { notes: [], unresolved: [], versionExtension: [] };
  const issues = [...lines.unresolved.map((text) => `Unresolved source conflict. ${text}`), ...lines.versionExtension];
  dom.profileIssues.innerHTML = issues.map((text) => `<li>${escapeHtml(text)}</li>`).join("");
  dom.profileNotesBox.hidden = !lines.notes.length;
  dom.profileNotesSummary.textContent = `${lines.notes.length} note${lines.notes.length === 1 ? "" : "s"} from ${profileTitles[state.standardId] || "the edition profile"}`;
  dom.profileNotesList.innerHTML = lines.notes.map((text) => `<li>${escapeHtml(text)}</li>`).join("");
  dom.profileDetails.hidden = !issues.length && !lines.notes.length;
}

// Field positions (Amplifiers tab): every applicable text field is a box
// where the renderer draws its text, around the symbol drawn without text. A
// probe rendering with each field set to its "[code]" marker gives the rows;
// the boxes and the form fields hold the same values.
const layoutScale = 38 / 40; // 38 px between two text rows of 40 symbol units
const layoutMaxZoom = 1.3;
let layoutSignature = "";
let layoutFits = true;
let layoutUndrawn = [];
const fieldWarnings = new Map();

function storedTextView() {
  try {
    return localStorage.getItem("symbol-studio:text-view") || "positions";
  } catch {
    return "positions";
  }
}

function setTextView(view) {
  state.positions = view === "positions";
  try {
    localStorage.setItem("symbol-studio:text-view", view);
  } catch {}
  renderAll();
}

const svgViewBox = (svg) => {
  const [x, y, width, height] = (/viewBox="([^"]+)"/.exec(svg)?.[1] || "0 0 0 0").split(/[\s,]+/).map(Number);
  return { left: x * layoutScale, top: y * layoutScale, width: width * layoutScale, height: height * layoutScale };
};

// The current symbol without text, outline, direction or speed leader.
function layoutOptions() {
  const options = { ...currentOptions(), size: 100, infoSize: 40, outlineWidth: 0, direction: undefined, speedLeader: 0, infoColor: "", infoBackground: "" };
  for (const { key } of textModifiers) options[key] = "";
  return options;
}

function layoutStates(sidc) {
  return currentFieldStates(sidc).filter((item) => item.available && item.field && item.key !== "engagementType");
}

function renderFieldLayout() {
  const panel = document.getElementById("panel-text");
  if (!panel.hidden && state.positions) {
    const sidc = state.customSidc || buildSidc();
    const states = layoutStates(sidc);
    // The stage's padding and border take 34 px of the panel width.
    const room = panel.clientWidth - 34;
    const options = layoutOptions();
    const signature = JSON.stringify([sidc, state.standardId, room, states.map((item) => [item.key, item.field, item.maxLength]), options]);
    if (signature !== layoutSignature) {
      layoutSignature = signature;
      try {
        layoutFits = buildFieldLayout(sidc, states, options, room);
      } catch {
        layoutFits = false;
      }
    }
  }
  const showing = !panel.hidden && state.positions && layoutFits;
  dom.fieldLayout.hidden = !showing;
  dom.textList.hidden = showing;
  if (showing) syncLayoutBoxes();
  // The switch shows the view on screen: a window too narrow for the boxes
  // shows the list, and says so on the disabled Field positions button.
  const positionsShown = state.positions && layoutFits;
  for (const button of dom.textViewSwitch.querySelectorAll("[data-text-view]")) {
    const active = (button.dataset.textView === "positions") === positionsShown;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  const positionsButton = dom.textViewSwitch.querySelector('[data-text-view="positions"]');
  positionsButton.disabled = !layoutFits;
  positionsButton.title = layoutFits ? "Boxes around the symbol, in the order the standard places the fields" : "Field positions need a wider window; the list is shown";
}

// Lays out the boxes; false when they do not fit the room.
function buildFieldLayout(sidc, states, options, room) {
  const tags = placeholderOptions(states, {});
  const probe = new window.ms.Symbol(sidc, { ...options, ...tags.options, infoFields: true }).asSVG();
  const plain = new window.ms.Symbol(sidc, { ...options, infoFields: false }).asSVG();
  const texts = [...new DOMParser().parseFromString(probe, "image/svg+xml").querySelectorAll("text")].map((node) => ({
    x: Number(node.getAttribute("x")),
    y: Number(node.getAttribute("y")),
    anchor: node.getAttribute("text-anchor"),
    fontSize: Number(node.getAttribute("font-size")) || 40,
    middle: node.getAttribute("dominant-baseline") === "middle",
    content: node.textContent
  }));
  const rows = readTextRows(texts, tags.codes).map((row) => ({ ...row, x: row.x * layoutScale, y: row.y * layoutScale }));
  const symbol = svgViewBox(plain);
  const ends = rows.filter((row) => row.anchor === "end").map((row) => row.x);
  const starts = rows.filter((row) => row.anchor === "start").map((row) => row.x);
  const between = ends.length && starts.length ? Math.min(...starts) - Math.max(...ends) : symbol.width;
  const drawn = new Set(rows.flatMap((row) => row.keys));
  // Q and AJ are graphics with no box: they are listed here, set in the list.
  const movement = movementFor(sidc);
  layoutUndrawn = [...states.filter((item) => !drawn.has(item.key)), ...graphicAmplifiers.filter((item) => movement[item.key].applies)];
  // A box fits its code, the field's name and a usual value. chrome is all
  // but the text: padding, border, gaps, and the "now" button of W, the arrow
  // of a select or the chevron of a list link. Crowded rows give up names
  // before the room for a value; a name is shown whole or not at all.
  const kinds = new Map(states.map((item) => [item.key, layoutKind(item)]));
  const extra = { select: 18, open: 16, input: 0 };
  const chrome = (item) => 24 + textWidth(item.field, "layout-code") + extra[kinds.get(item.key)] + (item.key === "dtg" ? 28 : 0);
  const value = (item) => 7.2 * fieldValueChars(item);
  const named = Object.fromEntries(states.map((item) => [item.key, Math.ceil(chrome(item) + textWidth(item.label)) + 2]));
  const codeOnly = Object.fromEntries(states.map((item) => [item.key, Math.ceil(chrome(item) + value(item)) + 2]));
  const natural = Object.fromEntries(states.map((item) => [item.key, Math.max(named[item.key], codeOnly[item.key]) + 4]));
  const widths = fitRowWidths(rows, natural, { room, between, plain: codeOnly });
  if (!widths) return false;
  const boxes = layoutFieldBoxes(rows, widths, { height: 30, gap: 8, center: 100 * layoutScale });
  const all = [symbol, ...boxes];
  const left = Math.min(...all.map((item) => item.left));
  const top = Math.min(...all.map((item) => item.top));
  const bounds = {
    left,
    top,
    width: Math.max(...all.map((item) => item.left + item.width)) - left,
    height: Math.max(...all.map((item) => item.top + item.height)) - top
  };
  if (bounds.width > room + 1) return false;

  const canvas = dom.layoutCanvas;
  const px = (value) => `${Math.round(value)}px`;
  canvas.style.width = px(Math.ceil(bounds.width));
  canvas.style.height = px(Math.ceil(bounds.height));
  // Spare room draws the whole layout larger, boxes and text with the symbol,
  // in steps of 5 %, so a few pixels of resizing do not change it.
  canvas.style.zoom = String(Math.min(layoutMaxZoom, Math.max(1, Math.floor((room / bounds.width) * 20) / 20)));
  let art = canvas.querySelector(".layout-symbol");
  if (!art) {
    art = document.createElement("div");
    art.className = "layout-symbol";
    art.setAttribute("aria-hidden", "true");
    canvas.prepend(art);
  }
  art.innerHTML = plain;
  Object.assign(art.style, { left: px(symbol.left - bounds.left), top: px(symbol.top - bounds.top), width: `${symbol.width}px`, height: `${symbol.height}px` });

  // Tab order: the left side, the middle, then the right side, top to bottom.
  const leftEdge = ends.length ? Math.max(...ends) : -Infinity;
  const rightEdge = starts.length ? Math.min(...starts) : Infinity;
  const column = (item) => (item.left + item.width <= leftEdge + 1 ? 0 : item.left >= rightEdge - 1 ? 2 : 1);
  const ordered = [...boxes].sort((a, b) => column(a) - column(b) || a.top - b.top || a.left - b.left);
  const byKey = new Map(states.map((item) => [item.key, item]));
  const kept = new Set();
  for (const item of ordered) {
    const definition = byKey.get(item.key);
    const kind = kinds.get(item.key);
    let box = canvas.querySelector(`[data-layout-key="${item.key}"]`);
    if (box && box.dataset.kind !== kind) {
      box.remove();
      box = null;
    }
    if (!box) box = createLayoutBox(item.key, kind);
    // A box over the symbol is placed by its centre, so it can shrink to a
    // small target while empty.
    const middle = item.top + item.height / 2;
    const inside = column(item) === 1 && middle > symbol.top && middle < symbol.top + symbol.height;
    box.classList.toggle("inside", inside);
    box.style.left = px((inside ? item.left + item.width / 2 : item.left) - bounds.left);
    box.style.top = px((inside ? middle : item.top) - bounds.top);
    box.style.setProperty("--w", `${item.width}px`);
    box.querySelector(".layout-code").textContent = definition.field;
    box.dataset.label = definition.label;
    // Without room for its whole name a box shows its code; the line under
    // the boxes names it on hover and focus.
    box.dataset.placeholder = item.width >= named[item.key] ? definition.label : "";
    box.querySelector(".layout-about").textContent = layoutAbout(definition);
    // Appending moves boxes into tab order; the one being typed in stays put.
    if (!box.contains(document.activeElement)) canvas.append(box);
    kept.add(box);
  }
  for (const box of canvas.querySelectorAll("[data-layout-key]")) if (!kept.has(box)) box.remove();

  dom.layoutMore.hidden = !layoutUndrawn.length;
  dom.layoutMoreSummary.textContent = `Not drawn here · ${layoutUndrawn.length}`;
  dom.layoutMoreList.innerHTML = `${layoutUndrawn
    .map((item) => `<span class="layout-chip"><span class="field-code">${escapeHtml(item.field)}</span>${escapeHtml(item.label)}</span>`)
    .join("")}<span>These have no box here. <button type="button" class="link-button" data-text-view="list">Edit them in the list</button></span>`;
  return true;
}

// AO built from lists opens the list view; F and L are lists.
function layoutKind(definition) {
  if (definition.parts) return "open";
  return textModifiers.find((field) => field.key === definition.key).choices ? "select" : "input";
}

// Text width as the boxes draw it: a field name, or a code with className
// "layout-code".
let measurer;
function textWidth(text, className = "layout-name") {
  if (!measurer) {
    measurer = document.createElement("span");
    measurer.setAttribute("aria-hidden", "true");
    document.body.append(measurer);
  }
  measurer.className = `layout-measure ${className}`;
  measurer.textContent = text;
  return measurer.getBoundingClientRect().width;
}

function createLayoutBox(key, kind) {
  const box = document.createElement("label");
  box.className = "layout-box";
  box.dataset.layoutKey = key;
  box.dataset.kind = kind;
  const code = document.createElement("span");
  code.className = "layout-code";
  // A box over the symbol shows its value as text until it is opened.
  const shown = document.createElement("span");
  shown.className = "layout-shown";
  shown.setAttribute("aria-hidden", "true");
  const about = document.createElement("span");
  about.className = "layout-about visually-hidden";
  about.id = `layout-about-${key}`;
  box.append(code, shown, about);
  if (kind === "open") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "layout-open";
    button.dataset.layoutOpen = key;
    button.setAttribute("aria-describedby", about.id);
    button.innerHTML = '<span class="layout-open-text"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 4 4 4-4 4" /></svg>';
    box.append(button);
  } else {
    const control = document.createElement(kind);
    control.dataset.layoutInput = key;
    control.setAttribute("aria-describedby", about.id);
    if (kind === "input") control.autocomplete = "off";
    box.append(control);
  }
  if (key === "dtg") {
    const now = document.createElement("button");
    now.type = "button";
    now.className = "layout-now";
    now.dataset.layoutNow = "";
    now.title = "Now (UTC)";
    now.setAttribute("aria-label", "Set the date-time group to now (UTC)");
    now.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>';
    box.append(now);
  }
  return box;
}

// Values, choices, limits and states follow the form fields.
function syncLayoutBoxes() {
  for (const box of dom.layoutCanvas.querySelectorAll("[data-layout-key]")) {
    const key = box.dataset.layoutKey;
    const field = textModifiers.find((item) => item.key === key);
    const source = document.getElementById(field.id);
    const code = box.querySelector(".layout-code").textContent;
    const warnings = fieldWarnings.get(key) || [];
    const name = `${code} ${box.dataset.label}`;
    box.classList.toggle("filled", Boolean(source.value));
    box.classList.toggle("problem", warnings.length > 0);
    box.classList.toggle("focused", key === state.focusField);
    // An empty box over the symbol is a small target until it is used.
    box.classList.toggle("compact", box.classList.contains("inside") && !source.value);
    box.querySelector(".layout-shown").textContent = source.value;
    const control = box.querySelector("[data-layout-input]");
    const open = box.querySelector("[data-layout-open]");
    if (open) {
      open.querySelector(".layout-open-text").textContent = source.value || box.dataset.placeholder;
      open.setAttribute("aria-label", `${name}: ${source.value || "not set"}. Opens the list.`);
    } else if (control.tagName === "SELECT") {
      // The options show what is drawn; empty shows the field name.
      const choices = [...source.options].map((item) => [item.value, item.value || box.dataset.placeholder]);
      const signature = JSON.stringify(choices);
      if (control.dataset.choices !== signature) {
        control.innerHTML = choices.map(([value, label]) => option(value, label)).join("");
        control.dataset.choices = signature;
      }
      control.value = source.value;
      control.setAttribute("aria-label", name);
    } else {
      if (document.activeElement !== control) control.value = source.value;
      control.placeholder = box.dataset.placeholder;
      control.setAttribute("aria-label", name);
      if (source.maxLength > 0) control.maxLength = source.maxLength;
      else control.removeAttribute("maxlength");
      if (source.getAttribute("list")) control.setAttribute("list", source.getAttribute("list"));
      else control.removeAttribute("list");
    }
  }
  syncLayoutHelp();
}

// The code, name, description and example of a field, as one sentence for
// the box's screen-reader description.
function layoutAbout(definition) {
  return fieldHelp.get(definition.key) || textModifiers.find((item) => item.key === definition.key).description;
}

// Two lines under the boxes, always the same height: the field under the
// pointer, else the one being edited (with its count and any problem), else
// how the view works.
let hoveredBox = null;
function syncLayoutHelp() {
  const focused = document.activeElement?.closest?.("[data-layout-key]");
  const box = hoveredBox?.isConnected ? hoveredBox : focused && dom.layoutCanvas.contains(focused) ? focused : null;
  if (!box) {
    dom.layoutHelp.innerHTML = dom.layoutCanvas.querySelector("[data-layout-key]")
      ? '<span class="layout-help-title">Click a box and type.</span><span class="layout-help-text">Boxes follow the standard\'s field layout, spaced apart for typing; the preview shows the exact placement. Empty fields are left out.</span>'
      : '<span class="layout-help-title">No text amplifier is drawn around this symbol.</span>';
    return;
  }
  const key = box.dataset.layoutKey;
  const field = textModifiers.find((item) => item.key === key);
  const source = document.getElementById(field.id);
  const editing = box === focused;
  const count = editing && source.maxLength > 0 && !field.choices ? `<span class="layout-count">${source.value.length} / ${source.maxLength}</span>` : "";
  const warnings = editing ? fieldWarnings.get(key) || [] : [];
  const definition = layoutStates(state.customSidc || buildSidc()).find((item) => item.key === key);
  const text = definition?.parts ? `${field.description} Built from lists in the list view.` : box.querySelector(".layout-about").textContent;
  dom.layoutHelp.innerHTML = `<span class="layout-help-title"><span class="field-code">${escapeHtml(box.querySelector(".layout-code").textContent)}</span><strong>${escapeHtml(box.dataset.label)}</strong>${count}</span>${
    warnings.length ? `<span class="layout-help-text layout-warn">${escapeHtml(warnings.join(" "))}</span>` : `<span class="layout-help-text">${escapeHtml(text)}</span>`
  }`;
}

// Q and AJ: the graphic amplifiers set in the Amplifiers list, next to Z.
// They are renderer options, not text fields, so they have their own rows.
const graphicAmplifiers = [
  { key: "direction", field: "Q", label: "Direction of movement", description: "Direction the object moves or will move, in degrees from north; drawn as an arrow." },
  { key: "speedLeader", field: "AJ", label: "Speed leader", description: "A line in the direction of movement instead of the arrow, in pixels; 0 draws the arrow. Needs a direction (Q)." }
];
const graphicValue = (key) => (key === "direction" ? Number(dom.direction.value) : Number(dom.speedLeader.value));
const graphicFilled = (key) => (key === "direction" ? graphicValue(key) >= 0 : graphicValue(key) > 0);

// Why Q or AJ is off for this symbol, and that a set value is kept.
function movementNote(control, kept) {
  // Profile reasons may start with the field ("Q direction: ..."); the row names it.
  const reason = humanize(control.reason.replace(/^[A-Z]{1,2} [a-zA-Z]+: /, ""));
  return `${reason.charAt(0).toUpperCase()}${reason.slice(1)}.${kept ? ` ${kept} is kept and returns on a symbol that takes it.` : ""}`;
}

// The Q and AJ controls follow their values; whether they show at all is
// decided with the other amplifiers (syncApp6aTextFields).
function syncGraphicsControls() {
  const movement = movementFor(state.customSidc || buildSidc());
  const value = Number(dom.direction.value);
  const on = value >= 0 && movement.direction.applies;
  dom.direction.disabled = dom.directionNumber.disabled = !movement.direction.applies;
  dom.speedLeader.disabled = !movement.speedLeader.applies || !on;
  if (document.activeElement !== dom.directionNumber) dom.directionNumber.value = value < 0 ? "" : String(value);
  dom.directionOff.hidden = value < 0;
  dom.sizeOutput.value = `${dom.symbolSize.value}%`;
  dom.strokeOutput.value = dom.strokeWidth.value;
  dom.fillOpacityOutput.value = `${dom.fillOpacity.value}%`;
  dom.infoSizeOutput.value = dom.infoSize.value;
  dom.outlineWidthOutput.value = dom.outlineWidth.value;
}

// Help of Q and AJ for this symbol: where the arrow starts depends on the
// edition and on a headquarters (APP-6A 505.1a: from the bottom centre).
function graphicHelp(key) {
  const definition = graphicAmplifiers.find((item) => item.key === key);
  if (key !== "direction" || !dom.hq.checked || dom.hq.disabled) return definition.description;
  return `${definition.description} ${state.standardId === "app6a"
    ? "APP-6A draws it from the bottom centre of the frame, also with a headquarters (505.1a)."
    : "With a headquarters, the arrow starts at the end of the HQ staff."}`;
}

// A larger stage shows a larger symbol: the drawing scales with the stage's
// shorter side over previewBase px, never below its own size. The scale does
// not follow the symbol, so the size slider still shows its effect; a symbol
// too big for the stage is fitted into it. Editor only: exports keep the size
// the options give.
const previewBase = 230;
const previewMaxZoom = 1.5;
function fitPreview() {
  const svg = dom.symbolPreview.querySelector(":scope > svg");
  if (!svg) return;
  const width = Number(svg.getAttribute("width"));
  const height = Number(svg.getAttribute("height"));
  const room = { width: dom.symbolPreview.clientWidth, height: dom.symbolPreview.clientHeight };
  if (!width || !height || !room.width || !room.height) return;
  const zoom = Math.min(previewMaxZoom, Math.max(1, Math.min(room.width, room.height) / previewBase));
  const scale = Math.min(zoom, room.width / width, room.height / height);
  svg.style.width = `${Math.floor(width * scale)}px`;
  svg.style.height = `${Math.floor(height * scale)}px`;
}

function renderAll() {
  const icon = selectedIcon();
  if (!icon) return;
  state.selectedId = icon.id;
  reconcileSelections();
  if ([...dom.status.options].some((item) => item.value === state.status)) dom.status.value = state.status;
  syncModifiers();
  const sidc = state.customSidc || buildSidc(icon);
  const countryCode = countryCodeForFlag(dom.countryFlag.value, state.standardId);
  const countryField = countrySidcField(state.standardId);
  document.getElementById("countryFlagNote").textContent = countryFlagNote({ selected: dom.countryFlag.value, code: countryCode, label: countryField?.label });
  window.ms.setStandard(config().standard);
  try {
    const options = currentOptions();
    currentSymbol = new window.ms.Symbol(sidc, options);
    currentCheck = editionCheck(currentSymbol, activeProfile(), sidc, options);
    currentSvg = currentSymbol.asSVG();
    dom.symbolPreview.innerHTML = currentSvg;
    fitPreview();
    document.getElementById("compactPreview").innerHTML = currentSvg;
    const valid = Boolean(currentCheck.valid);
    dom.renderState.classList.toggle("invalid", !valid);
    dom.renderState.innerHTML = `<i></i>${valid ? "Rendered" : "Check code / modifiers"}`;
    const detail = currentCheck.details;
    dom.renderState.title = [...(detail.sidcErrors || []), ...(detail.identityErrors || []), ...(detail.modifierErrors || []), ...(detail.notes || [])].join("; ");
  } catch (error) {
    currentSymbol = null;
    currentCheck = null;
    currentSvg = "";
    document.getElementById("compactPreview").replaceChildren();
    dom.symbolPreview.innerHTML = `<div class="empty-state">Unable to render symbol.<br>${escapeHtml(error.message)}</div>`;
    dom.renderState.classList.add("invalid");
    dom.renderState.innerHTML = "<i></i>Rendering error";
  }
  dom.selectedName.textContent = icon.name;
  renderSelectedPath(icon);
  document.getElementById("supportNote").textContent = state.standardId === "app6e"
    ? "Compatibility view using the shared 2525E catalog. This is not a separate edition-specific catalog."
    : state.standardId === "app6a"
      ? `${icon.source || "APP-6A (1998)"}. ${dataset().icons.length} S-scheme catalog entries.${icon.categoryOnly ? " Category — no separate illustration in APP-6A Annex D; preview is the renderer’s representation." : ""}${icon.remarks ? " " + icon.remarks : ""}`
      : `Rendered with milsymbol. Symbol appearance may differ from older standard publications.${icon.note ? ` ${icon.note}` : ""}`;
  if (!state.sidcDirty) dom.sidcInput.value = displayEditorSidc(sidc);
  dom.compactSidc.textContent = dom.sidcInput.value;
  for (const button of [dom.downloadSvg, dom.downloadPng, dom.copySidc, dom.compactCopy]) button.disabled = !currentSvg;
  const auditLink = document.getElementById("publicationAudit");
  auditLink.hidden = document.documentElement.dataset.localAudit !== "true" || state.standardId !== "app6a" || !icon.id.startsWith("S");
  auditLink.href = `audit/symbols/index.html?symbol=${encodeURIComponent(icon.id)}`;
  updateSegments(displayEditorSidc(sidc));
  renderSidcStatus(sidc);
  renderProfileDetails();
  renderChips(sidc);
  amplifierSidc = sidc;
  amplifierPicker.render();
  countryPicker.render();
  if (config().family === "modern") for (const picker of [...iconModifierPickers, frameShapePicker]) picker.render();
  dom.modifierColorNote.hidden = !modifierColorUnused({ on: dom.modifierColorOn.checked, color: dom.modifierColor.value, svg: currentSvg });
  syncGraphicsControls();
  renderExportSize();
  dom.coverageBadge.hidden = !config().coverage;
  dom.coverageBadge.textContent = config().coverage || "";
  dom.coverageBadge.title = config().coverageNote || "";
  renderFieldLayout();
  document.title = `${icon.name} — Military Symbol Editor`;
  draftAutosave.schedule();
}

// Where the symbol sits in the palette: its set and the groups above it, each
// opening the palette at that group. The symbol's own name is the title.
function renderSelectedPath(icon) {
  const known = dataset().icons.some((item) => item.category === icon.category);
  const crumbs = known ? entryCrumbs(icon, categoryBase(icon.category)) : [];
  const step = (label, branch) =>
    known
      ? `<button type="button" class="path-link" data-open-branch="${escapeHtml(JSON.stringify(branch))}" title="Show in the symbol palette">${escapeHtml(label)}</button>`
      : `<span>${escapeHtml(label)}</span>`;
  dom.selectedPath.innerHTML =
    [step(icon.category, []), ...crumbs.map((crumb) => step(crumb.name, crumb.branch))].join('<span class="path-sep" aria-hidden="true">›</span>') +
    (state.customSidc ? '<span class="path-tag">Imported SIDC</span>' : "");
}

function updateSidcAndRender(field, { rerenderCatalog = false } = {}) {
  if (state.customSidc)
    state.customSidc = editImportedSidc(state.customSidc, buildSidc(), field, config());
  renderAll();
  if (rerenderCatalog) renderCatalog();
}

function selectSymbol(id) {
  dismissResetUndo();
  state.selectedId = id;
  state.adjustments = {};
  rememberRecent(id);
  state.modifier1 = "";
  state.modifier2 = "";
  state.customSidc = "";
  state.importedIcon = null;
  try {
    localStorage.setItem(`symbol-studio:${state.standardId}`, id);
  } catch {}
  renderCatalog();
  renderAll();
}

function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyText(text, success) {
  try {
    await navigator.clipboard.writeText(text);
    toast(success);
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
    toast(success);
  }
}

function exportName(extension) {
  return exportFilename({ standardId: state.standardId, sidc: state.customSidc || buildSidc(), name: selectedIcon()?.name }, extension);
}

// The size a PNG export will have, in the tooltip of the button that makes it.
function renderExportSize() {
  const size = currentSymbol ? pngOutputSize(currentSymbol.getSize()) : null;
  const label = size ? `${size.width} × ${size.height} px` : "";
  dom.downloadPng.title = `Download PNG${label ? `, ${label}` : ""} (transparent background)`;
  dom.downloadPng.setAttribute("aria-label", `Download PNG${label ? `, ${label}` : ""}`);
}

function downloadPng() {
  if (!currentSvg) return;
  const image = new Image();
  const blobUrl = URL.createObjectURL(
    new Blob([currentSvg], { type: "image/svg+xml" })
  );
  image.onload = () => {
    const canvas = document.createElement("canvas");
    const output = pngOutputSize({ width: image.naturalWidth, height: image.naturalHeight });
    canvas.width = output.width;
    canvas.height = output.height;
    const context = canvas.getContext("2d");
    context.scale(pngScale, pngScale);
    context.drawImage(image, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = exportName("png");
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    }, "image/png");
    URL.revokeObjectURL(blobUrl);
  };
  image.onerror = () => {
    URL.revokeObjectURL(blobUrl);
    toast("PNG export failed. Try downloading SVG instead.");
  };
  image.src = blobUrl;
}

function resetControls() {
  const previousDraft = captureDraft();
  for (const input of document.querySelectorAll("[data-modifier-field]")) input.value = "";
  Object.assign(state, {
    affiliation: "friend",
    context: "0",
    status: "present",
    amplifierMode: "echelon",
    amplifierValue: "",
    modifier1: "",
    modifier2: "",
    customSidc: "",
    importedIcon: null,
    outline: false,
    sidcDirty: false,
    sidcMessage: null,
    adjustments: {},
    textOrigins: {},
    droppedChoices: {}
  });
  for (const select of document.querySelectorAll("[data-rating-part]")) select.value = "";
  for (const id of ["fillColorOn", "monoColorOn", "modifierColorOn", "infoColorOn", "infoBackgroundOn"]) dom[id].checked = false;
  dom.showFlag.checked = true;
  dom.fillColor.value = "#80e0ff";
  dom.monoColor.value = "#000000";
  dom.modifierColor.value = "#d32f2f";
  dom.infoColor.value = "#000000";
  dom.infoBackground.value = "#ffffff";
  dom.fillOpacity.value = 100;
  dom.infoSize.value = 40;
  dom.outlineWidth.value = 7;
  dom.outlineColor.value = "#ffffff";
  dom.countryFlag.value = "";
  pendingCountryFlag = null;
  dom.colorMode.value = "Light";
  for (const id of ["hq", "taskForce", "feintDummy"]) dom[id].checked = false;
  for (const id of ["speedLeader", "hqStaffLength", "stack", "frameShape"]) dom[id].value = "0";
  dom.uncertaintyMarker.value = "table";
  dom.direction.value = -1;
  dom.fill.checked =
    dom.frame.checked =
    dom.icon.checked =
    dom.infoFields.checked =
      true;
  dom.symbolSize.value = 100;
  dom.strokeWidth.value = 4;
  dom.outlineToggle.checked = false;
  syncStandardControls();
  renderAll();
  renderCatalog();
  resetDraft = previousDraft;
  dom.undoReset.hidden = false;
  draftAutosave.flush();
  toast("Modifiers reset");
}

function dismissResetUndo() {
  resetDraft = null;
  dom.undoReset.hidden = true;
}

function activateTab(tab) {
  for (const candidate of document.querySelectorAll("[data-editor-tab]")) {
    const active = candidate === tab;
    candidate.setAttribute("aria-selected", String(active));
    candidate.tabIndex = active ? 0 : -1;
    document.getElementById(candidate.getAttribute("aria-controls")).hidden =
      !active;
  }
  // Section switches return the form to its top.
  const panel = document.querySelector(".editor-panel");
  if (panel.getBoundingClientRect().top < 0) panel.scrollIntoView({ block: "start" });
  renderFieldLayout();
}

// Opens a field in the List view, with its tools (the AO builder, the rating
// parts) next to it.
function openField(key) {
  const field = textModifiers.find((item) => item.key === key);
  const input = field ? document.getElementById(field.id) : key === "direction" ? dom.directionNumber : key === "speedLeader" ? dom.speedLeader : null;
  if (!input || input.disabled) return;
  // A list filter must not hide the field being opened.
  state.fieldQuery = dom.fieldFilter.value = "";
  state.filledOnly = false;
  setTextView("list");
  activateTab(document.getElementById("tab-text"));
  setFocusField(key);
  // Scroll to the field itself: the AO text is hidden when it is composed from
  // lists, so the field's block is the target and the stage list gets focus.
  const wrapper = input.closest("[data-field-wrapper]");
  wrapper.scrollIntoView({ block: "center" });
  (input.hidden ? wrapper.querySelector('[data-ao-part="b"]') : input).focus({ preventScroll: true });
}

function moveCardFocus(card, step) {
  // Cards in a closed section are skipped.
  const allCards = () => [...dom.searchResults.querySelectorAll("[data-symbol-id]")].filter((item) => item.offsetParent !== null);
  let cards = allCards();
  const index = cards.indexOf(card);
  if (index < 0) return;
  // At the last loaded card, load the next batch before moving on.
  if (step > 0 && index === cards.length - 1 && appendCatalogBatch()) cards = allCards();
  const next = cards[index + step];
  if (next) next.focus();
  else if (step < 0) dom.symbolSearch.focus();
}

function bindEvents() {
  setupInfoPopovers();
  for (const event of ["input", "change"]) document.addEventListener(event, dismissResetUndo, true);
  window.addEventListener("pagehide", draftAutosave.flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") draftAutosave.flush();
  });
  dom.undoReset.addEventListener("click", () => {
    const previous = resetDraft;
    dismissResetUndo();
    if (previous && restoreDraft(previous)) {
      draftAutosave.flush();
      toast("Reset undone");
      dom.resetButton.focus();
    }
  });
  const editorTabs = [...document.querySelectorAll("[data-editor-tab]")];
  editorTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const target =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? editorTabs.length - 1
            : (index +
                (event.key === "ArrowRight" ? 1 : -1) +
                editorTabs.length) %
              editorTabs.length;
      activateTab(editorTabs[target]);
      editorTabs[target].focus();
    });
  });
  dom.standardSelect.addEventListener("change", () => {
    setStandard(dom.standardSelect.value);
  });
  dom.symbolSearch.addEventListener("input", () => {
    state.search = dom.symbolSearch.value;
    state.visible = paletteBatch;
    renderCatalog();
    dom.searchResults.scrollTop = 0;
  });
  const clearSearch = () => {
    dom.symbolSearch.value = "";
    state.search = "";
    state.visible = paletteBatch;
    renderCatalog();
    dom.searchResults.scrollTop = 0;
    dom.symbolSearch.focus();
  };
  dom.clearSearch.addEventListener("click", clearSearch);
  dom.categoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    state.visible = paletteBatch;
    renderCatalog();
    dom.searchResults.scrollTop = 0;
  });
  dom.searchResults.addEventListener("click", (event) => {
    const card = event.target.closest("[data-symbol-id]");
    if (!card) return;
    selectSymbol(card.dataset.symbolId);
    closeSearch();
  });
  dom.searchResults.addEventListener("keydown", (event) => {
    const card = event.target.closest("[data-symbol-id]");
    if (!card) return;
    if (["ArrowDown", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      moveCardFocus(card, 1);
    } else if (["ArrowUp", "ArrowLeft"].includes(event.key)) {
      event.preventDefault();
      moveCardFocus(card, -1);
    }
  });
  dom.symbolSearch.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      [...dom.searchResults.querySelectorAll("[data-symbol-id]")].find((item) => item.offsetParent !== null)?.focus();
    } else if (event.key === "Enter") {
      event.preventDefault();
      const first = filteredIcons()[0];
      if (first) {
        selectSymbol(first.id);
        closeSearch();
      }
    }
  });
  dom.searchLauncher.addEventListener("click", openSearch);
  dom.selectedPath.addEventListener("click", (event) => {
    const link = event.target.closest("[data-open-branch]");
    if (!link) return;
    showGroup(selectedIcon().category, JSON.parse(link.dataset.openBranch));
  });
  // The search panel is modal: keep focus inside it while it is open.
  document.addEventListener("focusin", (event) => {
    if (state.searchOpen && !dom.searchPanel.contains(event.target)) dom.symbolSearch.focus();
  });
  for (const element of document.querySelectorAll("[data-close-search]"))
    element.addEventListener("click", closeSearch);
  dom.identityChips.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-value]");
    if (!chip || chip.disabled || dom.affiliation.disabled) return;
    dom.affiliation.value = chip.dataset.value;
    dom.affiliation.dispatchEvent(new Event("change"));
  });
  dom.statusChips.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-value]");
    if (!chip || chip.disabled) return;
    dom.status.value = chip.dataset.value;
    dom.status.dispatchEvent(new Event("change"));
  });
  dom.searchResults.addEventListener("scroll", fillPalette, { passive: true });
  // A closed section stays closed; closing one may bring more into view.
  dom.symbolGrid.addEventListener("toggle", (event) => {
    const section = event.target.closest?.(".palette-section");
    if (!section) return;
    if (section.open) closedSections.delete(section.dataset.sectionKey);
    else closedSections.add(section.dataset.sectionKey);
    fillPalette();
  }, true);

  dom.affiliation.addEventListener("change", () => {
    delete state.adjustments.identity;
    state.affiliation = dom.affiliation.value;
    updateSidcAndRender("affiliation", { rerenderCatalog: true });
  });
  dom.context.addEventListener("change", () => {
    delete state.adjustments.identity;
    state.context = dom.context.value;
    populateIdentityOptions();
    updateSidcAndRender("context");
  });
  dom.status.addEventListener("change", () => {
    delete state.adjustments.status;
    state.status = dom.status.value;
    updateSidcAndRender("status", { rerenderCatalog: true });
  });
  dom.amplifierMode.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (!button || button.disabled || button.dataset.mode === state.amplifierMode) return;
    dismissResetUndo();
    delete state.adjustments.amplifier;
    state.amplifierMode = button.dataset.mode;
    state.amplifierValue = "";
    populateAmplifier();
    updateSidcAndRender("amplifier");
  });
  dom.amplifierValue.addEventListener("change", () => {
    delete state.adjustments.amplifier;
    state.amplifierValue = dom.amplifierValue.value;
    updateSidcAndRender("amplifier");
  });
  amplifierPicker.bind();
  countryPicker.bind();
  for (const picker of [...iconModifierPickers, frameShapePicker]) picker.bind();
  dom.modifier1.addEventListener("change", () => {
    state.modifier1 = dom.modifier1.value;
    updateSidcAndRender("modifier1");
  });
  dom.modifier2.addEventListener("change", () => {
    state.modifier2 = dom.modifier2.value;
    updateSidcAndRender("modifier2");
  });

  for (const id of ["hq", "taskForce", "feintDummy"])
    dom[id].addEventListener("change", () => updateSidcAndRender("flags"));
  for (const id of ["fill", "frame", "icon", "infoFields"])
    dom[id].addEventListener("change", renderAll);
  dom.countryFlag.addEventListener("change", () => {
    if (state.customSidc)
      state.customSidc = withCountryFlag(state.customSidc, dom.countryFlag.value, state.standardId);
    renderAll();
  });
  dom.frameShape.addEventListener("change", () => updateSidcAndRender("frameShape"));
  dom.uncertaintyMarker.addEventListener("change", renderAll);
  for (const id of ["speedLeader", "hqStaffLength", "stack"])
    dom[id].addEventListener("input", renderAll);
  for (const id of ["showFlag", "fillColorOn", "monoColorOn", "modifierColorOn", "infoColorOn", "infoBackgroundOn"])
    dom[id].addEventListener("change", renderAll);
  for (const id of ["fillColor", "monoColor", "modifierColor", "infoColor", "infoBackground", "fillOpacity", "infoSize", "outlineWidth", "outlineColor"])
    dom[id].addEventListener("input", () => {
      const toggle = { fillColor: "fillColorOn", monoColor: "monoColorOn", modifierColor: "modifierColorOn", infoColor: "infoColorOn", infoBackground: "infoBackgroundOn" }[id];
      if (toggle) dom[toggle].checked = true;
      if (id.startsWith("outline") && !state.outline) state.outline = dom.outlineToggle.checked = true;
      renderAll();
    });
  dom.directionNumber.addEventListener("input", () => {
    const raw = dom.directionNumber.value.trim();
    dom.direction.value = raw === "" ? -1 : Math.min(360, Math.max(0, Math.round(Number(raw) || 0)));
    renderAll();
  });
  dom.directionOff.addEventListener("click", () => {
    dom.direction.value = -1;
    renderAll();
    dom.directionNumber.focus();
  });
  dom.fieldFilter.addEventListener("input", () => {
    state.fieldQuery = dom.fieldFilter.value;
    syncApp6aTextFields();
  });
  dom.filledOnly.addEventListener("click", () => {
    state.filledOnly = !state.filledOnly;
    syncApp6aTextFields();
  });
  dom.filterStatus.addEventListener("click", (event) => {
    if (!event.target.closest("[data-clear-filters]")) return;
    state.fieldQuery = dom.fieldFilter.value = "";
    state.filledOnly = false;
    syncApp6aTextFields();
    dom.fieldFilter.focus();
  });
  dom.clearText.addEventListener("click", () => {
    dismissResetUndo();
    state.textOrigins = {};
    state.droppedChoices = {};
    for (const input of document.querySelectorAll("[data-modifier-field]")) input.value = "";
    for (const select of document.querySelectorAll("[data-rating-part]")) select.value = "";
    dom.direction.value = -1;
    dom.speedLeader.value = 0;
    renderAll();
    toast("Amplifiers cleared");
  });
  // Edit text opens the boxes under Amplifiers.
  dom.positionsToggle.addEventListener("click", () => {
    setTextView("positions");
    activateTab(document.getElementById("tab-text"));
    if (!layoutFits) toast("Field positions need a wider window");
    else if (dom.fieldLayout.getBoundingClientRect().bottom > window.innerHeight) dom.fieldLayout.scrollIntoView({ block: "nearest" });
  });
  dom.textInfoButton.addEventListener("click", () => {
    const open = dom.textInfo.hidden;
    dom.textInfo.hidden = !open;
    dom.textInfoButton.setAttribute("aria-expanded", String(open));
  });
  for (const container of [dom.textViewSwitch, dom.layoutMore])
    container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-text-view]");
      if (button) setTextView(button.dataset.textView);
    });
  // Box edits go through the form field, so both stay one value.
  dom.layoutCanvas.addEventListener("input", (event) => {
    const key = event.target.dataset.layoutInput;
    if (!key) return;
    hoveredBox = null;
    const source = document.getElementById(textModifiers.find((item) => item.key === key).id);
    source.value = event.target.value;
    source.dispatchEvent(new Event("input", { bubbles: true }));
  });
  dom.layoutCanvas.addEventListener("click", (event) => {
    const open = event.target.closest("[data-layout-open]");
    if (open) return openField(open.dataset.layoutOpen);
    if (!event.target.closest("[data-layout-now]")) return;
    const source = document.getElementById(textModifiers.find((item) => item.key === "dtg").id);
    // The format follows this symbol's W definition and the edition.
    source.value = nowForDtg();
    source.dispatchEvent(new Event("input", { bubbles: true }));
    dom.layoutCanvas.querySelector('[data-layout-input="dtg"]')?.focus();
  });
  dom.layoutCanvas.addEventListener("focusin", (event) => {
    const box = event.target.closest("[data-layout-key]");
    if (box) setFocusField(box.dataset.layoutKey);
    syncLayoutHelp();
  });
  dom.layoutCanvas.addEventListener("focusout", () => requestAnimationFrame(syncLayoutHelp));
  dom.layoutCanvas.addEventListener("mouseover", (event) => {
    const box = event.target.closest("[data-layout-key]");
    if (box === hoveredBox) return;
    hoveredBox = box;
    syncLayoutHelp();
  });
  dom.layoutCanvas.addEventListener("mouseleave", () => {
    hoveredBox = null;
    syncLayoutHelp();
  });
  new ResizeObserver(() => renderFieldLayout()).observe(document.getElementById("panel-text"));
  new ResizeObserver(() => fitPreview()).observe(dom.stage);
  // Reflow a long code when the sidebar narrows or the mobile Apply button
  // moves below it. Ignore height-only changes caused by fitting the text.
  let sidcWidth = 0;
  new ResizeObserver(([entry]) => {
    if (entry.contentRect.width === sidcWidth) return;
    sidcWidth = entry.contentRect.width;
    fitSidcInput();
  }).observe(dom.sidcInput);
  dom.sidcInput.addEventListener("input", () => {
    // "_" counts as "-"; replace it in place without moving the caret.
    if (dom.sidcInput.value.includes("_")) {
      const { selectionStart, selectionEnd } = dom.sidcInput;
      dom.sidcInput.value = dom.sidcInput.value.replace(/_/g, "-");
      dom.sidcInput.setSelectionRange(selectionStart, selectionEnd);
    }
    state.sidcDirty = true;
    state.sidcMessage = null;
    renderSidcStatus(state.customSidc || buildSidc());
    draftAutosave.schedule();
  });
  for (const id of ["colorMode", "direction", "symbolSize", "strokeWidth"])
    dom[id].addEventListener("input", () => {
      renderAll();
      if (id === "colorMode" || id === "strokeWidth") renderCatalog();
    });

  dom.applySidc.addEventListener("click", () => {
    const completion = completeEditorSidc(dom.sidcInput.value, config().family);
    const completionNote = !completion.added ? ""
      : config().family === "modern" ? `Completed with 0 to ${completion.value.length} digits.`
        : `Completed as ${completion.value}; * positions left unspecified.`;
    // Identity and status wildcards get the note; * in positions 11-15 (from
    // completion or the box itself) only means "not specified".
    const typedWildcards = completion.value[1] === "*" || completion.value[3] === "*";
    let value = completion.value;
    const reject = (text) => {
      state.sidcDirty = true;
      state.sidcMessage = { kind: "error", text };
      renderSidcStatus(state.customSidc || buildSidc());
    };
    if (completion.error) {
      reject(completion.error);
      return;
    }
    if (state.standardId === "app6a" && !value.startsWith("S")) {
      reject("APP-6A: enter an S-scheme tactical symbol code. G-scheme tactical graphics are not part of this editor.");
      return;
    }
    const startStandard = state.standardId;
    const hasWildcards = value.includes("*");
    if (hasWildcards) {
      // Publication templates leave identity/status open. Resolve those using
      // the editor selections; unspecified optional fields remain empty.
      const characters = [...value];
      if (characters[1] === "*") {
        const identity = identityList(config()).find(item => item.value === state.affiliation);
        characters[1] = identity ? identityCode(identity, config(), state.context) : state.affiliation.replace(/^code:/, "");
      }
      if (characters[3] === "*")
        characters[3] = statuses.find(item => item.value === state.status)?.legacy || state.status.replace(/^code:/, "");
      value = characters.join("").replace(/\*/g, "-");
    }
    applyImportedSidc(value);
    // A newly applied SIDC is authoritative, including empty/unknown country
    // fields. Never leave the previously selected country's flag on a new code.
    const importedFlag = countryFlagFromSidc(value, state.standardId);
    pendingCountryFlag = dom.countryFlag.disabled ? importedFlag : null;
    dom.countryFlag.value = importedFlag;
    state.sidcDirty = false;
    state.sidcMessage = null;
    renderAll();
    renderCatalog();
    const notes = [
      completionNote,
      typedWildcards ? "Wildcards resolved with the current identity and status; other fields left unspecified." : "",
      state.standardId !== startStandard ? `Standard switched to ${config().label}.` : "",
      state.importedIcon?.name === "Custom SIDC" ? "This function code is not in the catalog; it is kept as entered." : ""
    ].filter(Boolean);
    state.sidcMessage = {
      kind: notes.length ? "info" : "ok",
      text: `Applied · ${selectedIcon().name}. ${notes.join(" ")}`.trim(),
      notes: notes.join(" "),
      sidc: state.customSidc || buildSidc()
    };
    renderSidcStatus(state.sidcMessage.sidc);
  });
  dom.sidcInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      dom.applySidc.click();
    } else if (event.key === "Escape" && state.sidcDirty) {
      event.preventDefault();
      state.sidcDirty = false;
      state.sidcMessage = null;
      renderAll();
    }
  });
  dom.copySidc.addEventListener("click", () =>
    copyText(copiedSidc({ shown: dom.sidcInput.value, sidc: state.customSidc || buildSidc(), dirty: state.sidcDirty }), "SIDC copied")
  );
  dom.compactCopy.addEventListener("click", () => dom.copySidc.click());
  dom.downloadSvg.addEventListener(
    "click",
    () => currentSvg && download(currentSvg, exportName("svg"), "image/svg+xml")
  );
  dom.downloadPng.addEventListener("click", downloadPng);
  // The grid is a preview aid only; exports stay transparent.
  dom.gridToggle.addEventListener("change", () => setEditorChoice("grid", dom.gridToggle.checked ? "on" : "off", "on"));
  dom.previewBackground.addEventListener("change", () => setEditorChoice("preview", dom.previewBackground.value, "light"));
  dom.outlineToggle.addEventListener("change", () => {
    state.outline = dom.outlineToggle.checked;
    renderAll();
  });
  dom.resetButton.addEventListener("click", resetControls);
  dom.helpButton.addEventListener("click", () => dom.helpDialog.showModal());
  dom.closeHelp.addEventListener("click", () => dom.helpDialog.close());
  dom.helpDialog.addEventListener("click", (event) => {
    if (event.target === dom.helpDialog) dom.helpDialog.close();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) &&
      !dom.helpDialog.open
    ) {
      event.preventDefault();
      openSearch();
    }
    if (event.key === "Escape" && state.searchOpen) {
      event.preventDefault();
      if (document.activeElement === dom.symbolSearch && dom.symbolSearch.value) clearSearch();
      else closeSearch();
    }
  });
}

// Flags are the largest download and a symbol does not need them, so the editor
// draws first. A missing artwork file cannot take the editor offline, and
// downloads stay vector-only and never need a remote CDN.
async function loadFlags() {
  try {
    const response = await fetch("./flags.json");
    if (!response.ok) throw new Error(`Flag request failed: ${response.status}`);
    const flags = await response.json();
    flagArtwork = new Map(flags.map((flag) => [flag.code, flag.svg]));
    flagNames = new Map(flags.map((flag) => [flag.code, flag.name]));
    window.ms.addSymbolPart(createCountryFlagPart(flags));
    dom.countryFlag.disabled = false;
    renderCountryOptions();
    // A code applied while the list was loading names its country in the SIDC.
    if (pendingCountryFlag !== null) {
      setCountryFlag(pendingCountryFlag);
      pendingCountryFlag = null;
    } else if (state.customSidc) dom.countryFlag.value = countryFlagFromSidc(state.customSidc, state.standardId);
    renderAll();
  } catch (error) {
    dom.countryFlag.innerHTML = option("", "Flags unavailable — reload to retry");
    dom.countryFlag.disabled = true;
    countryPicker.render();
    console.error("Unable to load flag artwork", error);
  }
}

// Editor choices stay on this browser: they change the page, not the symbol. The
// default is no attribute, so the stylesheet alone decides it.
function setEditorChoice(name, value, fallback) {
  if (value === fallback) delete document.documentElement.dataset[name];
  else document.documentElement.dataset[name] = value;
  try {
    if (value === fallback) localStorage.removeItem(`symbol-studio:${name}`);
    else localStorage.setItem(`symbol-studio:${name}`, value);
  } catch {}
}

function loadEditorChoices() {
  let preview = null;
  let grid = null;
  try {
    // The interface is always light now; drop a theme saved by an earlier version.
    localStorage.removeItem("symbol-studio:theme");
    preview = localStorage.getItem("symbol-studio:preview");
    grid = localStorage.getItem("symbol-studio:grid");
  } catch {}
  dom.previewBackground.value = ["dark", "map"].includes(preview) ? preview : "light";
  dom.gridToggle.checked = gridChoice(grid) === "on";
  setEditorChoice("preview", dom.previewBackground.value, "light");
  setEditorChoice("grid", gridChoice(grid), "on");
}

async function init() {
  try {
    const response = await fetch("./catalog.json");
    if (!response.ok)
      throw new Error(`Catalog request failed: ${response.status}`);
    catalog = await response.json();
    createTextFields();
    dom.countryFlag.innerHTML = option("", "Loading flags…");
    dom.countryFlag.disabled = true;
    bindEvents();
    loadEditorChoices();
    loadRecent();
    renderStandardSelect();
    populateCategories();
    chooseInitialSymbol();
    try {
      const recent = localStorage.getItem(`symbol-studio:${state.standardId}`);
      if (recent && dataset().icons.some((icon) => icon.id === recent))
        state.selectedId = recent;
    } catch {}
    syncStandardControls();
    renderCatalog();
    renderAll();
    const savedDraft = draftStore.load();
    if (savedDraft) {
      const initialDraft = captureDraft();
      try {
        if (restoreDraft(savedDraft)) {
          reportDraft(true);
          if (!sameDraft(savedDraft, initialDraft)) toast("Draft restored from this device");
        }
      } catch (error) {
        restoreDraft(initialDraft);
        draftStore.save(initialDraft);
        toast("Saved draft could not be restored");
        console.warn("Unable to restore saved draft", error);
      }
    }
    draftAutosave.start();
    loadFlags();
  } catch (error) {
    for (const button of [dom.downloadSvg, dom.downloadPng, dom.copySidc, dom.applySidc]) button.disabled = true;
    dom.symbolGrid.innerHTML = `<div class="empty-state">Unable to load the symbol library.<br>${error.message}<br><br><b>npm run studio:build</b> to rebuild the library.</div>`;
    dom.symbolPreview.innerHTML = `<div class="empty-state">The symbol library is unavailable.</div>`;
  }
}

init();
