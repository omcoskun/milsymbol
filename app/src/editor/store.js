// The editor of studio/app.js without a DOM. Everything the vanilla editor kept in
// its page lives here: `state` (the same object as app.js), `controls` (the value
// of every form control, by its id in studio/index.html), `disabled` (which of
// them are off), `lists` (the options of each select) and `view` (every text the
// page shows). Actions change them and publish a new snapshot; React reads it with
// useSyncExternalStore. ms, the catalog and storage are parameters, so Node tests
// can run the editor without a browser.
//
// The functions keep the names and order of studio/app.js, so a change there can
// be carried here line by line.
import { app6aSymbolClass } from "../../../src/lettersidc/metadata.js";
import * as app6aRules from "../../../src/modifierprofiles/app6a.js";
import { app6dIdentityName, app6dStatuses, app6dEngagementError } from "../../../studio/profiles/app6d.js";
import * as app6dSectors from "../../../studio/profiles/app6d-sectors.js";
import { drawingSidc, editionCheck, frameContext, undrawnMark } from "../../../studio/edition-check.js";
import { completeEditorSidc, copiedSidc, decodeEditorSidc, displayEditorSidc, editImportedSidc, numericSidcEdition, standardForSidc } from "../../../studio/sidc-editor.js";
import { modifierGroups, textModifiers, collectTextModifiers } from "../../../studio/modifier-fields.js";
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
} from "../../../studio/profile-controls.js";
import {
  exportFilename,
  pngOutputSize,
  fieldStates,
  profileFieldStates,
  dtgForField,
  evaluationRating,
  sidcParts,
  pushRecent,
  placeholderOptions,
  undrawnFieldKeys,
  paletteProgress,
  baseBranch,
  entryCrumbs,
  groupEntries,
  paletteSections,
  matchesSearch,
  normalize,
  mobilities,
  mobilityModeName,
  amplifierChoice,
  amplifierPlacementNote,
  sharedViewBox,
  withViewBox,
  modifierColorUnused,
  modifierChoice,
  centeredGlyphs,
  frameShapeChoice,
  problemReasons,
  gridChoice,
  designationNotes,
  amplifierNotes,
  countryFlagNote,
  rankSearch,
  withoutRawCode
} from "../../../studio/editor-helpers.js";
import { createDraftAutosave, createDraftStore, draftStateKeys, sameDraft } from "../../../studio/draft-store.js";
import { fieldReference } from "../../../studio/field-reference.js";
import { fieldGuide } from "../../../studio/field-guide.js";
import {
  app6aIdentities,
  contextLabel,
  contextOptions,
  convertIdentity,
  decodeIdentity,
  identityCode,
  identityLabel,
  identityList,
  isUsOnlyContext,
  usOnlyIdentityLabel
} from "../../../studio/identities.js";
import { createCountryFlagPart } from "../../../studio/country-flags.js";
import { countryCodeForFlag, countryFlagFromSidc, countrySidcField, withCountryFlag } from "../../../studio/country-codes.js";
import {
  standards,
  profiles,
  profileNotes,
  profileTitles,
  editionTables,
  statuses,
  echelons,
  legacyFlagLetters,
  kindLabels,
  kindPlurals,
  sectorPlaces,
  engagementSourceNames,
  schemeNames,
  dimensionNames,
  contextNames,
  legacyFlagNames,
  graphicAmplifiers,
  frameShapes,
  uncertaintyMarkers,
  colorModes,
  stackChoices,
  paletteBatch
} from "./constants.js";
import { svgTexts } from "./svg-text.js";
import { sanitizeControl } from "./sanitize.js";

export { textModifiers, modifierGroups, graphicAmplifiers, fieldReference };

// The controls a draft saves, in the order of studio/app.js.
export const draftControlIds = [
  "sidcInput", "hq", "taskForce", "feintDummy", "hqStaffLength", "uncertaintyMarker",
  "frameShape", "countryFlag", "fill", "frame", "icon", "infoFields", "showFlag",
  "outlineToggle", "symbolSize", "strokeWidth", "colorMode", "direction", "speedLeader", "stack",
  "fillColorOn", "monoColorOn", "modifierColorOn", "infoColorOn", "infoBackgroundOn",
  "fillColor", "monoColor", "modifierColor", "infoColor", "infoBackground",
  "fillOpacity", "infoSize", "outlineWidth", "outlineColor", ...textModifiers.map((field) => field.id)
];

// Checkboxes hold true or false; every other control holds its text, as an
// input's value does.
const checkboxIds = new Set([
  "hq", "taskForce", "feintDummy", "fill", "frame", "icon", "infoFields", "showFlag", "outlineToggle",
  "fillColorOn", "monoColorOn", "modifierColorOn", "infoColorOn", "infoBackgroundOn", "gridToggle"
]);
// Selects among the saved controls: a saved value they do not list is added as
// "SIDC: …", as selectImportedValue() does.
const selectIds = new Set([
  "uncertaintyMarker", "frameShape", "countryFlag", "colorMode", "stack",
  ...textModifiers.filter((field) => field.choices).map((field) => field.id)
]);
// The one-line text inputs of the amplifiers.
const textInputIds = new Set(textModifiers.filter((field) => !field.choices).map((field) => field.id));

// The values of studio/index.html.
function defaultControls() {
  const controls = {
    sidcInput: "",
    hq: false,
    taskForce: false,
    feintDummy: false,
    hqStaffLength: "0",
    uncertaintyMarker: "table",
    frameShape: "0",
    countryFlag: "",
    fill: true,
    frame: true,
    icon: true,
    infoFields: true,
    showFlag: true,
    outlineToggle: false,
    symbolSize: "100",
    strokeWidth: "4",
    colorMode: "Light",
    direction: "-1",
    speedLeader: "0",
    stack: "0",
    fillColorOn: false,
    monoColorOn: false,
    modifierColorOn: false,
    infoColorOn: false,
    infoBackgroundOn: false,
    fillColor: "#80e0ff",
    monoColor: "#000000",
    modifierColor: "#d32f2f",
    infoColor: "#000000",
    infoBackground: "#ffffff",
    fillOpacity: "100",
    infoSize: "40",
    outlineWidth: "7",
    outlineColor: "#ffffff",
    affiliation: "",
    status: "",
    context: "",
    amplifierValue: "",
    modifier1: "",
    modifier2: "",
    previewBackground: "light",
    gridToggle: true
  };
  for (const field of textModifiers) controls[field.id] = field.choices ? field.choices[0][0] : "";
  return controls;
}

const pairList = (pairs) => pairs.map(([value, label]) => ({ value, label }));

export function createEditorStore({
  ms,
  catalog,
  storage = null,
  setTimer = (callback, delay) => setTimeout(callback, delay),
  clearTimer = (id) => clearTimeout(id),
  now = () => new Date()
}) {
  const read = (key) => {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  };
  const write = (key, value) => {
    try {
      storage.setItem(key, value);
    } catch {
      // Storage can be full or blocked; the editor keeps working without it.
    }
  };
  const remove = (key) => {
    try {
      storage.removeItem(key);
    } catch {
      // As write().
    }
  };

  // Amplifiers tab: boxes at the field positions, or the grouped list.
  function storedTextView() {
    return read("symbol-studio:text-view") || "positions";
  }

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
    positions: storedTextView() !== "list",
    searchOpen: false,
    sidcDirty: false,
    sidcMessage: null,
    fieldQuery: "",
    filledOnly: false,
    focusField: "",
    recent: [],
    adjustments: {},
    textOrigins: {},
    droppedChoices: {}
  };

  const controls = defaultControls();
  const disabled = { countryFlag: true };
  const lists = {
    affiliation: [],
    status: [],
    context: [],
    amplifierValue: [],
    modifier1: [],
    modifier2: [],
    countryFlag: [{ value: "", label: "Loading flags…" }],
    frameShape: pairList(frameShapes),
    uncertaintyMarker: pairList(uncertaintyMarkers),
    colorMode: pairList(colorModes),
    stack: pairList(stackChoices)
  };
  for (const field of textModifiers) if (field.choices) lists[field.id] = pairList(field.choices);
  const view = {};
  // Page state the vanilla editor kept in its elements.
  const ui = {
    tab: "symbol",
    helpOpen: false,
    layoutFits: true,
    undoReset: false,
    draftStatus: "Drafts stay on this device",
    toast: { message: "", open: false, id: 0 },
    preview: "light",
    grid: "on",
    flags: "loading",
    resetCount: 0,
    signals: {}
  };
  const closedSections = new Set();

  let flagArtwork = new Map();
  let flagNames = new Map();
  let currentSymbol = null;
  let currentCheck = null;
  let currentSvg = "";
  let toastTimer;
  let resetDraft = null;
  let pendingCountryFlag = null;
  let amplifierSidc = "";
  let mobilityLabel = "Mobility";
  let signalCount = 0;
  const fieldHelp = new Map();
  const fieldWarnings = new Map();
  // What an input kept from its last applicable definition (maxLength, placeholder...).
  const fieldKept = new Map();
  const choiceSignatures = new Map();
  const flagTitles = { feintDummy: "", hq: "", taskForce: "" };

  const drawSymbol = (sidc, options) => new ms.Symbol(drawingSidc(sidc), options);
  const draftStore = createDraftStore(storage);
  const draftAutosave = createDraftAutosave({ store: draftStore, capture: captureDraft, report: reportDraft });

  const listeners = new Set();
  let snapshot = null;

  function signal(name, payload = {}) {
    ui.signals = { ...ui.signals, [name]: { ...payload, n: ++signalCount } };
  }

  // A select's value as the DOM keeps it: a value it does not list reads as "".
  function setSelect(id, value) {
    controls[id] = lists[id].some((item) => item.value === value) ? value : "";
  }
  const selectedLabel = (id) => lists[id].find((item) => item.value === controls[id])?.label || "";

  const activeProfile = () => profiles[state.standardId] || null;
  const movementFor = (sidc) => movementControls(activeProfile(), sidc, profileTitles[state.standardId]);

  function identityLabelFor(entry, context = state.context) {
    const named = state.standardId === "app6d" && entry.numeric && app6dIdentityName(context, entry.numeric);
    return usOnlyIdentityLabel(config(), named || identityLabel(entry, context));
  }
  function statusLabelFor(entry) {
    const named = state.standardId === "app6d" && app6dStatuses.find((item) => item.digit === entry.numeric);
    return named ? named.name : entry.label;
  }

  function captureDraft() {
    const values = Object.fromEntries(draftControlIds.map((id) => [id, controls[id]]));
    if (pendingCountryFlag !== null) values.countryFlag = pendingCountryFlag;
    return JSON.parse(JSON.stringify({
      state: Object.fromEntries(draftStateKeys.map((key) => [key, state[key]])),
      controls: values
    }));
  }

  function reportDraft(saved) {
    ui.draftStatus = saved ? "Saved on this device" : "Draft could not be saved on this device";
    commit();
  }

  function restoreDraft(draft) {
    if (!standards.some((standard) => standard.id === draft.state.standardId)) return false;
    const entries = catalog.standards[catalog.aliases?.[draft.state.standardId] || draft.state.standardId].icons;
    if (!draft.state.customSidc && !entries.some((icon) => icon.id === draft.state.selectedId)) return false;
    Object.assign(state, draft.state);
    state.sidcMessage = null;
    state.importedIcon = state.customSidc
      ? decodeEditorSidc(state.customSidc, { ...config(), icons: entries }).icon : null;
    if (state.importedIcon) state.importedIcon = entries.find((icon) => icon.id === state.selectedId) || state.importedIcon;
    state.category = "all";
    loadRecent();
    const restoreControls = () => {
      for (const id of draftControlIds) {
        const value = draft.controls[id];
        if (value === undefined) continue;
        if (checkboxIds.has(id)) controls[id] = Boolean(value);
        else if (id === "countryFlag" && disabled.countryFlag) pendingCountryFlag = value;
        else if (id === "countryFlag") setCountryFlag(value);
        else if (selectIds.has(id)) selectImportedValue(id, String(value));
        // As the vanilla <input> would hold it: clamped, snapped, one line.
        else controls[id] = sanitizeControl(id, value, { textIds: textInputIds });
      }
    };
    restoreControls();
    syncStandardControls();
    restoreControls();
    renderAll();
    return true;
  }

  const config = () => standards.find((standard) => standard.id === state.standardId);
  const dataset = () => {
    const key = catalog.aliases?.[state.standardId] || state.standardId;
    return catalog.standards[key];
  };
  const selectedIcon = () =>
    (state.customSidc && state.importedIcon) ||
    dataset().icons.find((icon) => icon.id === state.selectedId) ||
    dataset().icons[0];

  function toast(message) {
    ui.toast = { message, open: true, id: ui.toast.id + 1 };
    clearTimer(toastTimer);
    toastTimer = setTimer(() => {
      ui.toast = { ...ui.toast, open: false };
      commit();
    }, 1800);
    toastTimer?.unref?.();
  }

  function currentOptions(minimal = false) {
    const direction = Number(controls.direction);
    const app6a = state.standardId === "app6a";
    const sidc = state.customSidc || buildSidc();
    const countryFlag = minimal || !controls.showFlag ? "" : controls.countryFlag;
    const values = minimal ? {} : Object.fromEntries(textModifiers.map(({ key, id }) => [key, controls[id] || ""]));
    // A heading or speed leader the symbol does not take stays in its control, unsent.
    const movement = minimal ? null : movementFor(sidc);
    const options = {
      standard: config().standard,
      countryFlag,
      // The library moves the two text rows beside the flag 70 units to the right.
      country_flag: Boolean(countryFlag),
      size: minimal ? 34 : Number(controls.symbolSize),
      strokeWidth: Number(controls.strokeWidth),
      colorMode: controls.colorMode,
      fill: minimal ? true : controls.fill,
      frame: minimal ? true : controls.frame,
      icon: minimal ? true : controls.icon,
      infoFields: minimal ? false : controls.infoFields,
      outlineWidth: !minimal && state.outline ? Number(controls.outlineWidth) : 0,
      outlineColor: controls.outlineColor,
      fillColor: !minimal && controls.fillColorOn ? controls.fillColor : "",
      monoColor: !minimal && controls.monoColorOn ? controls.monoColor : "",
      modifierColor: !minimal && controls.modifierColorOn ? controls.modifierColor : "",
      fillOpacity: minimal ? 1 : Number(controls.fillOpacity) / 100,
      infoColor: !minimal && controls.infoColorOn ? controls.infoColor : "",
      infoSize: minimal ? 40 : Number(controls.infoSize),
      infoBackground: !minimal && controls.infoBackgroundOn ? controls.infoBackground : "",
      ...collectTextModifiers(values, profiledFieldKeys(sidc)),
      direction: minimal || direction < 0 || !movement.direction.applies ? undefined : direction,
      speedLeader: minimal || !movement.speedLeader.applies ? 0 : Number(controls.speedLeader),
      hqStaffLength: minimal ? 0 : Number(controls.hqStaffLength),
      stack: minimal || app6a ? 0 : Number(controls.stack)
    };
    // APP-6A 503.1a lets the "?" of pending, assumed friend and suspect sit in field E or in the frame.
    if (app6a && !minimal && controls.uncertaintyMarker !== "table") options.uncertaintyMarker = controls.uncertaintyMarker;
    return options;
  }

  // Flags turned off only because a mobility code holds positions 11–12. They
  // still count here: buildSidc() writes the mobility code over them, and once
  // the mobility goes back to Unspecified they return before the next sync.
  const heldByMobility = new Set();
  function flagCode() {
    const on = (key) => controls[key] && (!disabled[key] || heldByMobility.has(key));
    return (on("feintDummy") ? 1 : 0) + (on("hq") ? 2 : 0) + (on("taskForce") ? 4 : 0);
  }

  function legacyFlagCharacter() {
    return legacyFlagLetters[flagCode()];
  }

  // What the active edition profile accepts for this symbol (see app.js).
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

  function statusChoices() {
    return state.standardId === "app6a" ? statuses.slice(0, 2) : statuses;
  }

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
    const affiliation = identityList(standard).find((item) => item.value === (minimal ? "friend" : state.affiliation));
    const identity = affiliation
      ? identityCode(affiliation, standard, minimal ? "0" : state.context)
      : state.affiliation.split(":").at(-1);
    const status = statuses.find((item) => item.value === (minimal ? "present" : state.status)) ||
      { legacy: state.status.split(":").at(-1), numeric: state.status.split(":").at(-1) };

    if (standard.family === "legacy") {
      let amplifier = [minimal ? "-" : legacyFlagCharacter(), "-"];
      if (!minimal && state.amplifierMode === "echelon") {
        amplifier = [
          legacyFlagCharacter(),
          echelons.find((item) => item[0] === state.amplifierValue)?.[3] || (state.amplifierValue.startsWith("code:") ? state.amplifierValue.slice(5) : "-")
        ];
      } else if (!minimal && state.amplifierMode === "mobility") {
        const code = state.amplifierValue &&
          (mobilities.find((item) => item[0] === state.amplifierValue)?.[3] ||
            (state.amplifierValue.startsWith("code:") ? state.amplifierValue.slice(5) : ""));
        // With no mobility chosen, position 11 keeps the headquarters, task force and feint flag.
        if (code) amplifier = [...code];
      }
      // Installations keep their H (APP-6A and 2525C catalogue entries, imported codes).
      if (icon.defaultModifier?.startsWith("H")) {
        amplifier = ["H", !minimal && controls.feintDummy ? "B" : "-"];
      }
      if (state.standardId === "app6a" && icon.codingScheme === "G") amplifier = ["-", "-"];
      const sidc = `${icon.codingScheme || "S"}${icon.prescribedAffiliation || identity}${icon.battleDimension || "G"}${icon.prescribedStatus || status.legacy}${icon.code || "------"}${amplifier.join("")}---`;
      return minimal ? sidc : withCountryFlag(sidc, controls.countryFlag, state.standardId);
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
      if (numericSidcEdition(standard.version) === "e") sidc[22] = controls.frameShape;
    }
    return minimal ? sidc.join("") : withCountryFlag(sidc.join(""), controls.countryFlag, state.standardId);
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
    // A raw code kept from an applied SIDC goes with that SIDC (editor-helpers.js).
    state.status = withoutRawCode(state.status, "present");
    state.amplifierValue = withoutRawCode(state.amplifierValue);
    if (id === "app6a" && !["present", "planned"].includes(state.status)) state.status = "present";
    ms.setStandard(next.standard);
    chooseInitialSymbol();
    syncStandardControls();
    renderAll();
    signal("editorTop");
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

  function recentKey() {
    return `symbol-studio:recent:${state.standardId}`;
  }

  function loadRecent() {
    try {
      const stored = JSON.parse(read(recentKey()) || "[]");
      state.recent = Array.isArray(stored) ? stored.filter((id) => typeof id === "string") : [];
    } catch {
      state.recent = [];
    }
  }

  function rememberRecent(id) {
    state.recent = pushRecent(state.recent, id);
    write(recentKey(), JSON.stringify(state.recent));
  }

  function filteredIcons() {
    const icons = dataset().icons.filter((icon) =>
      (state.category === "all" || icon.category === state.category) && matchesSearch(icon, state.search, config().family)
    );
    return rankSearch(icons, state.search);
  }

  // The palette's small pictures, drawn on demand and kept per standard and style.
  const miniCache = new Map();
  function miniSvg(icon) {
    const key = `${state.standardId}|${controls.colorMode}|${controls.strokeWidth}|${icon.id}`;
    if (!miniCache.has(key)) {
      let svg = "";
      try {
        svg = drawSymbol(buildSidc(icon, true), { ...currentOptions(true), size: 40 }).asSVG();
      } catch {
        svg = "";
      }
      if (miniCache.size > 3000) miniCache.clear();
      miniCache.set(key, svg);
    }
    return miniCache.get(key);
  }

  const baseCache = new Map();
  function categoryBase(category) {
    const key = `${state.standardId}|${category}`;
    if (!baseCache.has(key)) baseCache.set(key, baseBranch(dataset().icons.filter((icon) => icon.category === category)));
    return baseCache.get(key);
  }

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

  const sectionKey = (section) => `${state.standardId}|${state.category}|${JSON.stringify(section.branch)}|${section.name}`;

  // The palette as renderCatalog() and feedPalette() draw it: the first
  // state.visible cards with the headings before them.
  let paletteMemo = { key: "", value: null };
  function paletteView() {
    const key = JSON.stringify([state.standardId, state.search, state.category, state.visible, state.recent, state.selectedId, [...closedSections]]);
    if (paletteMemo.key === key) return paletteMemo.value;
    const icons = filteredIcons();
    const counts = new Map();
    for (const icon of dataset().icons) counts.set(icon.category, (counts.get(icon.category) || 0) + 1);
    const categories = [
      { value: "all", label: "All symbol sets", count: dataset().icons.length },
      ...[...counts.keys()].sort((a, b) => a.localeCompare(b)).map((item) => ({ value: item, label: item, count: counts.get(item) }))
    ];
    const recent = !state.search.trim() && state.category === "all"
      ? state.recent.map((id) => dataset().icons.find((icon) => icon.id === id)).filter(Boolean)
      : [];
    const sections = icons.length ? paletteGroups(icons) : null;
    let grouped = null;
    let flat = null;
    let shown = 0;
    if (sections) {
      grouped = [];
      let section = null;
      let grid = null;
      for (const item of paletteItems(sections)) {
        if (shown >= state.visible) break;
        if (item.type === "section") {
          const key = sectionKey(item.section);
          section = {
            key,
            name: item.section.name,
            branchKey: JSON.stringify(item.section.branch),
            count: item.section.count,
            open: !closedSections.has(key),
            body: []
          };
          grouped.push(section);
          grid = null;
        } else if (item.type === "group") {
          section.body.push({ type: "group", name: item.group.name, branchKey: JSON.stringify(item.group.branch) });
          grid = { type: "grid", icons: [] };
          section.body.push(grid);
        } else {
          if (!grid) {
            grid = { type: "grid", icons: [] };
            section.body.push(grid);
          }
          grid.icons.push(item.icon);
          shown += 1;
        }
      }
    } else {
      flat = icons.slice(0, state.visible);
      shown = flat.length;
    }
    const value = {
      categories,
      category: state.category,
      search: state.search,
      heading: state.search.trim()
        ? `Results in ${state.category === "all" ? "all symbol sets" : state.category}`
        : state.category === "all" ? "All symbol sets" : state.category,
      count: icons.length,
      recent,
      grouped,
      flat,
      empty: !icons.length,
      more: shown < icons.length,
      status: paletteProgress(Math.min(state.visible, icons.length), icons.length),
      selectedId: state.selectedId
    };
    paletteMemo = { key, value };
    return value;
  }

  // Opens the palette on a group of a set (from the symbol's heading).
  function showGroup(category, branch) {
    state.search = "";
    state.category = category;
    state.visible = paletteBatch;
    openSearch();
    signal("paletteTop");
    const base = categoryBase(category);
    const keys = [branch.slice(0, base.length + 2), branch.slice(0, base.length + 1)]
      .filter((key) => key.length > base.length && key.length <= branch.length)
      .map((key) => JSON.stringify(key));
    const icons = filteredIcons();
    const sections = icons.length ? paletteGroups(icons) : null;
    if (!sections) return;
    // A heading is drawn once a batch reaches it: when fewer cards than are
    // shown come before it. Batches load until one of the keys is drawn, the
    // deeper key first, as studio/app.js finds them.
    const headings = new Map();
    let cards = 0;
    let section = null;
    for (const item of paletteItems(sections)) {
      if (item.type === "section") section = item.section;
      const branchKey = item.type === "section" ? item.section.name && JSON.stringify(item.section.branch) : item.type === "group" ? JSON.stringify(item.group.branch) : "";
      if (branchKey && !headings.has(branchKey)) headings.set(branchKey, { cards, section });
      if (item.type === "card") cards += 1;
    }
    for (let visible = paletteBatch; ; visible += paletteBatch) {
      const key = keys.find((candidate) => headings.has(candidate) && headings.get(candidate).cards < visible);
      if (key) {
        state.visible = visible;
        closedSections.delete(sectionKey(headings.get(key).section));
        signal("paletteScrollTo", { key });
        return;
      }
      if (visible >= cards) return;
    }
  }

  function mobilityNameFor(offers) {
    if (!offers || !offers.amplifier) return "Mobility";
    return mobilityModeName(mobilities.filter((item) => item[0] !== "" && offers.amplifier.get(item[0])?.offered).map((item) => item[0]));
  }

  function populateAmplifier() {
    let source = state.amplifierMode === "mobility" ? mobilities : echelons;
    if (config().family === "legacy") source = source.filter((item) => item[3] !== "");
    if (state.standardId === "app6a") source = source.filter((item) => !["N", "NS", "NL"].includes(item[3]));
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
    disabled.amplifierValue = state.amplifierMode === "none";
    mobilityLabel = mobilityNameFor(offers);
    view.amplifierLabel = state.amplifierMode === "mobility" ? mobilityLabel : "Echelon";
    lists.amplifierValue = source.map((item) => rejected.has(item[0])
      ? { value: item[0], label: `${item[1]} (not valid here)`, title: rejected.get(item[0]) }
      : { value: item[0], label: item[1] });
    const exists = source.some((item) => item[0] === state.amplifierValue);
    if (!exists && state.amplifierValue.startsWith("code:"))
      lists.amplifierValue = [...lists.amplifierValue, { value: state.amplifierValue, label: `SIDC: ${state.amplifierValue.slice(5)}` }];
    else if (!exists) state.amplifierValue = "";
    setSelect("amplifierValue", state.amplifierValue);
  }

  // The picker draws each choice on the current frame.
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
    return lists.amplifierValue.map((item) => amplifierChoice({ value: item.value, textContent: item.label, title: item.title || "" }, source, modern));
  }

  function amplifierSvg(value) {
    return chipSvg(amplifierPreviewSidc(amplifierSidc, value), {
      size: 24,
      icon: false,
      modifierColor: controls.modifierColorOn ? controls.modifierColor : ""
    });
  }

  function sharedGlyphs(rows, draw) {
    const drawn = new Map(["", ...rows.map((item) => item.value)].map((value) => [value, draw(value)]));
    const box = sharedViewBox([...drawn.values()], drawn.get(""));
    return (value) => withViewBox(drawn.get(value) || "", box);
  }

  function iconModifierSvg(type, value) {
    const base = (state.customSidc || buildSidc()).padEnd(30, "0");
    const sidc = `${base.slice(0, 7)}${"0".repeat(15)}${base.slice(22)}`.split("");
    applyModernModifier(sidc, value, type);
    return chipSvg(sidc.join(""), { size: 24 });
  }

  function frameShapeSvg(value) {
    const base = (state.customSidc || buildSidc()).padEnd(30, "0");
    return chipSvg(`${base.slice(0, 7)}${"0".repeat(15)}${value}${base.slice(23)}`, { size: 24 });
  }

  // Flags the standard's country list codes come first; the others follow.
  function renderCountryOptions() {
    if (disabled.countryFlag) return;
    const current = controls.countryFlag;
    const flags = [...flagNames];
    const coded = flags.filter(([code]) => countryCodeForFlag(code, state.standardId));
    const uncoded = flags.filter(([code]) => !countryCodeForFlag(code, state.standardId));
    lists.countryFlag = [{ value: "", label: "No flag" }, ...[...coded, ...uncoded].map(([code, name]) => ({ value: code, label: name }))];
    setCountryFlag(current);
  }

  function setCountryFlag(value) {
    controls.countryFlag = flagNames.has(value) ? value : "";
  }

  function countryChoices() {
    return lists.countryFlag.map((item) => {
      const code = countryCodeForFlag(item.value, state.standardId);
      return {
        value: item.value,
        name: item.label,
        code,
        group: item.value && !code ? "No code in this standard · display only" : "",
        reason: ""
      };
    });
  }

  function populateModifierSelect(id, field, selected) {
    const icon = selectedIcon();
    const setModifiers = dataset().modifiers?.[icon?.symbolSet]?.[field] || [];
    const commonModifiers = dataset().common?.[field] || [];
    // The tables' own 00 row writes what Unspecified writes, so it is not listed twice.
    const entries = [
      ...setModifiers.map((item) => ({ ...item, scope: "set" })),
      ...commonModifiers.map((item) => ({ ...item, scope: "common" }))
    ].filter((item) => !/^0+$/.test(item.code));
    const list = [{ value: "", label: "Unspecified" }];
    for (const item of entries) {
      const group = `${item.scope === "common" ? "Common" : icon.category} / ${item.category || "Other"}`;
      list.push({ value: `${item.scope}:${item.code}`, label: `${item.code} — ${item.name}`, group });
    }
    if (selected && !list.some((item) => item.value === selected)) list.push({ value: selected, label: `SIDC: ${selected}` });
    // An optgroup lists its options together, in the order the groups first appear.
    const order = [...new Set(list.map((item) => item.group || ""))];
    lists[id] = [list[0], ...order.flatMap((group) => list.slice(1).filter((item) => (item.group || "") === group))];
    setSelect(id, selected);
    return controls[id];
  }

  function syncModifiers() {
    const modern = config().family === "modern";
    const app6a = state.standardId === "app6a";
    const prescribedAffiliation = app6a && selectedIcon()?.prescribedAffiliation;
    disabled.affiliation = Boolean(prescribedAffiliation);
    setSelect("affiliation", prescribedAffiliation ? app6aIdentities.find((a) => a.legacy === prescribedAffiliation).value : state.affiliation);
    const kind = app6a ? app6aSymbolClass(state.customSidc || buildSidc()) : "";
    const installation = !modern && selectedIcon()?.defaultModifier?.startsWith("H");
    const tactical = state.standardId === "app6a" && selectedIcon()?.codingScheme === "G";
    disabled.hq = Boolean(installation || tactical);
    disabled.taskForce = Boolean(installation || (app6a && kind !== "unit"));
    disabled.feintDummy = Boolean(tactical);
    disabled.amplifierValue = Boolean(installation || tactical || state.amplifierMode === "none");
    for (const mode of ["echelon", "mobility", "none"])
      disabled[`mode:${mode}`] = Boolean(installation || tactical || (app6a && mode === "echelon" && kind !== "unit") || (app6a && mode === "mobility" && kind !== "equipment"));
    if (app6a && ((state.amplifierMode === "echelon" && kind !== "unit") || (state.amplifierMode === "mobility" && kind !== "equipment"))) {
      state.amplifierMode = "none";
      state.amplifierValue = "";
      populateAmplifier();
    }
    const offers = app6a ? null : profileOffers(state.customSidc || buildSidc());
    const flagReasons = {};
    for (const key of Object.keys(flagTitles)) flagTitles[key] = "";
    if (offers && offers.flags) {
      for (const [key, offer] of Object.entries(offers.flags)) {
        if (offer.offered) continue;
        disabled[key] = true;
        flagTitles[key] = offer.reason;
        flagReasons[key] = offer.reason;
      }
      const hasOffer = (list) => list.some((item) => item[0] !== "" && offers.amplifier.get(item[0])?.offered);
      for (const [mode, list] of [["echelon", echelons], ["mobility", mobilities]])
        if (!hasOffer(list)) disabled[`mode:${mode}`] = true;
    }
    if (offers) populateAmplifier();
    // A mobility or towed array code fills positions 11–12 of a letter SIDC,
    // where the headquarters, task force and feint flag would go.
    const mobilityCode = !modern && !installation && !tactical && state.amplifierMode === "mobility" && Boolean(state.amplifierValue);
    heldByMobility.clear();
    if (mobilityCode)
      for (const key of ["hq", "taskForce", "feintDummy"]) {
        if (disabled[key]) continue;
        disabled[key] = true;
        heldByMobility.add(key);
        flagTitles[key] = "Positions 11–12 hold the mobility code";
      }
    syncRuleNotes({ modern, app6a, kind, installation, tactical, mobilityCode, prescribed: Boolean(prescribedAffiliation), flagReasons });
    syncApp6aTextFields();
    view.legacyNote = installation
      ? "Installation modifier H is applied automatically. Feint / dummy changes it to HB; unit echelon and headquarters flags do not apply."
      : tactical
        ? "Tactical point: unit echelon, mobility and headquarters flags do not apply. Choose the graphic variant from the library."
        : "In this edition, icon variants are selected directly from the symbol library.";
    // A letter-based edition has nothing for this card unless a symbol class needs its note.
    view.editionSectionHidden = !modern && !installation && !tactical;
    view.symbolModifiersHidden = !modern;
    view.legacyNoteHidden = modern;
    if (!modern) {
      state.modifier1 = "";
      state.modifier2 = "";
      return;
    }
    if (state.standardId === "app6d") {
      const first = populateSectorSelect("modifier1", 1, state.modifier1);
      const second = populateSectorSelect("modifier2", 2, state.modifier2);
      state.modifier1 = first.value;
      state.modifier2 = second.value;
      const blocked = [...first.choices.entries, ...second.choices.entries].filter((entry) => !entry.offered);
      view.modifierNote = [
        first.choices.dictionary || second.choices.dictionary
          ? `Sector modifiers follow APP-6D ${[first.choices, second.choices].filter((item) => item.dictionary).map((item) => item.table).join(" and ")}. Only defined codes are listed.`
          : "APP-6D defines no sector modifiers for this symbol set.",
        blocked.length ? `${blocked.length} listed codes are disabled for this entity, for example: ${humanize(shortReason(blocked[0].reason))}.` : ""
      ].filter(Boolean).join(" ");
      return;
    }
    view.modifierLabels = { modifier1: "Icon modifier 1", modifier2: "Icon modifier 2" };
    disabled.modifier1 = disabled.modifier2 = false;
    state.modifier1 = populateModifierSelect("modifier1", "modifier1", state.modifier1);
    state.modifier2 = populateModifierSelect("modifier2", "modifier2", state.modifier2);
    const setName = selectedIcon()?.category || "symbol set";
    view.modifierNote = `${setName} and common modifiers for this edition.`;
  }

  // Sector 1 / sector 2 from the APP-6D dictionary for this symbol set.
  function populateSectorSelect(id, sector, selected) {
    const sidc = state.customSidc || buildSidc();
    const current = selected.startsWith("set:") ? selected.slice(4) : "";
    const choices = sectorChoices({ profile: profiles.app6d, sectors: app6dSectors, sidc, set: sidc.slice(4, 6), sector, start: sector === 1 ? 16 : 18, current });
    view.modifierLabels = { ...view.modifierLabels, [id]: `Sector ${sector} modifier (${sectorPlaces[choices.placement]})` };
    const list = [
      { value: "", label: choices.dictionary ? "Unspecified" : "None defined for this symbol set" },
      ...choices.entries.map((entry) => ({
        value: `set:${entry.code}`,
        label: `${entry.code} — ${entry.name}${entry.offered ? "" : " (not for this entity)"}`,
        ...(entry.offered ? {} : { disabled: true, title: entry.reason })
      }))
    ];
    if (selected && !list.some((item) => item.value === selected)) {
      const label = sectorStatusLabels[choices.status];
      list.push({ value: selected, label: `SIDC: ${current || selected}${label ? ` — ${label}` : ""}` });
    }
    lists[id] = list;
    disabled[id] = !choices.dictionary && !current;
    setSelect(id, selected);
    return { value: controls[id], choices };
  }

  // Explain every rule that disables a control, next to the control.
  function syncRuleNotes({ modern, app6a, kind, installation, tactical, mobilityCode, prescribed, flagReasons = {} }) {
    const profile = activeProfile();
    const editionE = ["2525e", "app6e"].includes(state.standardId);
    const contextNote = {
      1: `Exercise: an X is drawn beside the frame; suspect and hostile become Joker (J) and Faker (K).${modern ? "" : " Position 2 uses the exercise letters G, W, M, D, L, J and K."}`,
      2: "Simulation: an S is drawn beside the frame."
    }[app6a ? "0" : editionE ? frameContext(state.context) : state.context];
    const mark = state.standardId === "app6e" && undrawnMark(state.context);
    const usOnly = !app6a && isUsOnlyContext(config(), state.context) && contextOptions(config()).find(([digit]) => digit === state.context)[1];
    view.identityNote = [contextNote, mark && `milsymbol does not draw the ${mark} mark.`, usOnly && `${usOnly} is for US use only.`].filter(Boolean).join(" ");
    view.identityReason = prescribed ? "This symbol prescribes its identity, so the identity is fixed." : "";
    view.identityAdjust = state.adjustments.identity || "";
    view.statusAdjust = state.adjustments.status || "";
    view.amplifierAdjust = state.adjustments.amplifier || "";
    const marked = app6a && app6aRules.app6aIdentities[(state.customSidc || buildSidc())[1]];
    const uncertainty = { hidden: !(marked && marked.marker === "?"), note: view.uncertainty?.note || "" };
    if (marked) {
      const table = marked.placement === "frame" ? "inside the frame" : "in field E";
      uncertainty.note = `${marked.name}: the publication default puts the ? ${table}. APP-6A 503.1a allows field E or the frame. A symbol without a frame always uses field E.`;
    }
    view.uncertainty = uncertainty;
    view.statusMeta = modern ? "Position 7" : "Position 4";
    view.statusNote = app6a
      ? "APP-6A defines Present and Planned. Fully capable, damaged, destroyed and full to capacity appear in the other editions."
      : profile
        ? `Only the statuses ${profileTitles[state.standardId]} allows for this symbol are listed.`
        : "";
    view.designationMeta = modern ? "Position 8" : "Position 11";
    const offsetRole = app6a && (kind === "equipment" || kind === "installation");
    view.hqLabel = offsetRole ? "Location offset" : "Headquarters";
    view.hqStaffLabel = offsetRole ? "Offset line length" : "HQ staff length";
    const designation = designationNotes({
      app6a, modern, kind, installation, tactical,
      mobility: mobilityCode,
      flagReasons: Object.fromEntries(Object.entries(flagReasons).map(([key, reason]) => [key, humanize(shortReason(reason))]))
    });
    view.designationReason = designation.reason;
    view.designationNote = designation.about;
    view.amplifierMeta = modern ? "Positions 9–10" : "Positions 11–12";
    const modeNames = { echelon: "Echelon", mobility: mobilityLabel };
    const amplifier = amplifierNotes({
      app6a, kind, installation, tactical,
      disabled: ["echelon", "mobility"].filter((mode) => disabled[`mode:${mode}`]).map((mode) => modeNames[mode]),
      edition: profileTitles[state.standardId],
      placement: `${amplifierPlacementNote(mobilityNameFor(profileOffers(state.customSidc || buildSidc())))}${profile && !app6a ? ` Only the values ${profileTitles[state.standardId]} allows for this symbol are listed.` : ""}`
    });
    view.amplifierReason = amplifier.reason;
    view.amplifierNote = amplifier.about;
    view.countryMeta = countrySidcField(state.standardId)?.description || "";
    view.editionMeta = modern ? (numericSidcEdition(config().version) === "e" ? "Edition E" : "Edition D") : "";
    view.modifierNoteHidden = !modern;
    view.symbolClass = app6a ? kindLabels[kind] || "Symbol" : selectedIcon()?.category || "Symbol";
    disabled.hqStaffLength = !controls.hq || disabled.hq;
    view.hqStaffRow = {
      hidden: disabled.hqStaffLength,
      title: `${offsetRole ? "Length of the location offset line" : "Length of the headquarters staff"}; 0 draws the default length.`
    };
  }

  // J: one letter A-F for source reliability and one digit 1-6 for information credibility.
  const ratingScale = (pattern) => fieldReference.evaluationRating.rows.filter(([code]) => pattern.test(code));

  // Now (UTC) for W: the year length of this symbol's W definition, else the
  // edition's printed format (field-guide.js).
  function nowForDtg() {
    const sidc = state.customSidc || buildSidc();
    const definition = currentFieldStates(sidc).find((item) => item.key === "dtg");
    const guide = fieldGuide(state.standardId, symbolClassOf(sidc), textModifiers.find((item) => item.key === "dtg"));
    return dtgForField(now(), definition, guide.printed);
  }

  function symbolClassOf(sidc) {
    const profile = activeProfile();
    return profile && profile.fields(sidc) ? profile.symbolClass(sidc) : "";
  }

  // Remember what a text field meant where the user typed it.
  function recordTextOrigin(key) {
    delete state.droppedChoices[key];
    const field = textModifiers.find((item) => item.key === key);
    const definition = controls[field.id] && currentFieldStates().find((item) => item.key === key);
    if (definition && definition.available) state.textOrigins[key] = { meaning: fieldMeaning(definition), where: describeWhere() };
    else delete state.textOrigins[key];
  }

  function describeWhere(sidc = state.customSidc || buildSidc()) {
    const profile = activeProfile();
    const kind = profile && classWords(profile.symbolClass(sidc));
    return kind ? `${config().label} ${kind}` : config().label;
  }

  function engagementBuilder(definition, value, previous) {
    const composite = Boolean(definition && definition.parts);
    const builder = {
      composite,
      reference: !composite && ["2525d", "2525e", "app6e"].includes(state.standardId),
      parts: previous?.parts || null,
      preview: previous?.preview || { text: "", problem: false }
    };
    if (!composite) return builder;
    const options = engagementOptions(definition.parts, app6dEngagementError);
    const parts = parseEngagement(value);
    const fill = (name, list, current, blank, label) => ({
      options: [
        { value: "", label: blank },
        ...list.map(([code, text]) => ({ value: code, label: label(code, text) })),
        ...(current && !list.some(([code]) => code === current) ? [{ value: current, label: `${current} (not defined)` }] : [])
      ],
      value: current,
      disabled: name !== "b" && !parts.b
    });
    builder.parts = {
      a: fill("a", options.sources, parts.a, "Local (no prefix)", (code) => `${code} — ${engagementSourceNames[code] || code}`),
      b: fill("b", options.stages, parts.b, "None", (code, text) => `${code} — ${text}`),
      c: fill("c", parts.b === "MLT" ? options.counts : options.weapons, parts.c, "None", (code, text) => `${code} — ${text}`)
    };
    const message = parts.b || value ? app6dEngagementError(value) : "";
    builder.preview = {
      text: value ? `Drawn as ${value}${message ? ` — ${message}` : ""}` : `Format ${definition.format}. Choose the stage first.`,
      problem: Boolean(message)
    };
    return builder;
  }

  function currentFieldStates(sidc = state.customSidc || buildSidc()) {
    const profile = activeProfile();
    const states = profile ? profileFieldStates(textModifiers, profile, sidc) : fieldStates(textModifiers, null);
    const ao = states.find((item) => item.key === "engagementBar");
    const type = engagementTypeState(profile, sidc, Boolean(ao && ao.available));
    return states.map((item) =>
      item.key === "engagementType" ? { ...item, field: "", label: "Engagement bar colour", available: type.available, reason: type.reason, choices: null } : item
    );
  }

  function profiledFieldKeys(sidc) {
    const profile = activeProfile();
    if (profile && !profile.fields(sidc)) return null;
    if (!profile && state.standardId !== "app6a") return null;
    return currentFieldStates(sidc).filter((item) => item.available).map((item) => item.key);
  }

  // Offer a profile's literal values: rebuild a select, or suggest via a datalist.
  function applyFieldChoices(field, kept, profileChoices, alternates) {
    const choices = field.key !== "evaluationRating" && profileChoices && profileChoices.map((choice) => (Array.isArray(choice) ? choice : [String(choice), String(choice)]));
    if (field.choices) {
      let list = choices ? [["", field.choices[0][1]], ...choices.filter(([code]) => code !== "")] : field.choices;
      const dropped = state.droppedChoices[field.key];
      const wanted = controls[field.id] || dropped || "";
      if (wanted && !list.some(([code]) => code === wanted) && (alternates || []).includes(wanted)) list = [...list, [wanted, `${wanted} (alternate form)`]];
      const signature = JSON.stringify(list);
      if (choiceSignatures.get(field.key) === signature) return;
      lists[field.id] = pairList(list);
      choiceSignatures.set(field.key, signature);
      if (wanted && list.some(([code]) => code === wanted)) {
        controls[field.id] = wanted;
        delete state.droppedChoices[field.key];
      } else {
        controls[field.id] = "";
        if (wanted) state.droppedChoices[field.key] = wanted;
      }
      return;
    }
    kept.datalist = choices ? pairList(choices) : null;
  }

  // Text fields milsymbol draws no text for on this symbol, from a probe
  // rendering with every field set to its "[code]" marker.
  function undrawnTextFields(sidc, states) {
    const tags = placeholderOptions(states, {});
    try {
      const probe = drawSymbol(sidc, { ...currentOptions(true), ...tags.options, infoFields: true }).asSVG();
      return undrawnFieldKeys(states, svgTexts(probe).map((node) => node.content));
    } catch {
      return [];
    }
  }

  function syncApp6aTextFields() {
    const sidc = state.customSidc || buildSidc();
    const profile = activeProfile();
    const active = profile ? Boolean(profile.fields(sidc)) : state.standardId === "app6a";
    const kind = active && profile ? profile.symbolClass(sidc) : "";
    view.fieldNote = { hidden: !active, text: profileNotes[state.standardId] || "" };
    const states = new Map(currentFieldStates(sidc).map((item) => [item.key, item]));
    const undrawn = new Set(undrawnTextFields(sidc, [...states.values()]));
    const extras = profile ? profileExtraFields(profile, sidc, textModifiers.map((field) => field.key)) : [];
    const values = Object.fromEntries(textModifiers.map(({ key, id }) => [key, controls[id]]));
    const warned = new Map();
    for (const { key, message } of (profile && profile.validate(sidc, values).details.fieldWarnings) || [])
      warned.set(key, [...(warned.get(key) || []), `${humanize(shortReason(message))}.`]);
    for (const key of Object.keys(state.textOrigins)) if (!values[key]) delete state.textOrigins[key];
    const carried = new Map(carryWarnings({ states: [...states.values()], values, origins: state.textOrigins, extras }).map((item) => [item.key, item]));
    const query = normalize(state.fieldQuery).trim();
    const matches = (definition) => !query || normalize(definition.field) === query || normalize(definition.label).includes(query);
    const counts = { available: 0, shown: 0, filled: 0, hiddenFilled: 0 };
    const fields = {};
    for (const field of textModifiers) {
      const definition = states.get(field.key);
      if (!fieldKept.has(field.key)) fieldKept.set(field.key, { label: field.label, code: field.field || "–", maxLength: 0, placeholder: "", about: "", datalist: null, ao: null, rating: false });
      const kept = fieldKept.get(field.key);
      if (field.key === "engagementType") {
        fields[field.key] = { hidden: !definition.available, label: kept.label };
        disabled[field.id] = !definition.available;
        fieldWarnings.set(field.key, []);
        continue;
      }
      const filled = Boolean(controls[field.id]);
      const visible = definition.available && matches(definition) && (!state.filledOnly || filled);
      disabled[field.id] = !definition.available;
      if (definition.available) {
        counts.available += 1;
        if (filled) counts.filled += 1;
        if (visible) counts.shown += 1;
        else if (filled) counts.hiddenFilled += 1;
      }
      const lines = [];
      if (definition.available) {
        const guide = fieldGuide(state.standardId, kind, field);
        kept.label = definition.label;
        kept.code = definition.field || "–";
        applyFieldChoices(field, kept, definition.choices || definition.examples || null, definition.alternates);
        if (field.key === "engagementBar") kept.ao = engagementBuilder(definition, controls[field.id], kept.ao);
        const listed = field.key !== "evaluationRating" && (definition.examples || definition.choices || [])[0];
        const example = listed ? String(Array.isArray(listed) ? listed[0] : listed) : guide.example;
        if (!field.choices) {
          kept.maxLength = definition.maxLength || 0;
          kept.placeholder = example ? `e.g. ${example}` : "";
        }
        const rule = fieldRule(definition, controls[field.id]);
        const help = [guide.description];
        const format = rule.hint || guide.format;
        if (format) help.push(`Format: ${format}.`);
        if (definition.maxLength && !field.choices) help.push(`At most ${definition.maxLength} characters.`);
        if (example && !field.choices && !definition.parts) help.push(`Example: ${example}.`);
        if (definition.requiresEchelonDivisionOrBelow) help.push("Used at division level and below.");
        if (definition.unresolved) help.push(`${definition.nonBlocking ? "Source note" : "Unresolved in the source"}: ${definition.unresolved}.`);
        fieldHelp.set(field.key, help.join(" "));
        kept.about = help.join(" ");
        if (warned.has(field.key)) lines.push(...warned.get(field.key));
        else if (rule.problem) lines.push(`${definition.field} ${rule.problem}.`);
        if (definition.unresolved && !definition.nonBlocking && controls[field.id]) lines.push("Unresolved in the source: the symbol is reported as not valid while this field is filled.");
        if (carried.has(field.key)) lines.push(carried.get(field.key).message);
        if (filled && undrawn.has(field.key)) lines.push("milsymbol does not draw this field for this symbol: the value is kept, but it is not in the preview or exports.");
      }
      fieldWarnings.set(field.key, lines);
      const value = controls[field.id];
      const max = !field.choices && kept.maxLength > 0 ? kept.maxLength : 0;
      fields[field.key] = {
        hidden: !visible,
        filled,
        label: kept.label,
        code: kept.code,
        maxLength: field.choices ? 0 : kept.maxLength,
        placeholder: kept.placeholder,
        about: kept.about,
        datalist: kept.datalist,
        ao: field.key === "engagementBar" ? kept.ao : null,
        warnings: lines,
        count: field.choices || definition.parts ? "" : max ? `${value.length}/${max}` : filled ? String(value.length) : "",
        countFull: Boolean(max) && value.length >= max,
        available: definition.available
      };
    }
    // Q and AJ: shown where the edition gives them to the symbol, like the rest.
    const movement = movementFor(sidc);
    const graphics = {};
    for (const definition of graphicAmplifiers) {
      const applies = movement[definition.key].applies;
      const filled = applies && graphicFilled(definition.key);
      const visible = applies && matches(definition) && (!state.filledOnly || filled);
      const help = graphicHelp(definition.key);
      fieldHelp.set(definition.key, help);
      graphics[definition.key] = { hidden: !visible, filled, about: help };
      if (!applies) continue;
      counts.available += 1;
      if (filled) counts.filled += 1;
      if (visible) counts.shown += 1;
      else if (filled) counts.hiddenFilled += 1;
    }
    view.textFields = fields;
    view.graphicFields = graphics;
    view.groupHidden = modifierGroups.map((group) =>
      !group.fields.some((field) => field.key !== "engagementType" && !fields[field.key].hidden) &&
      !(group.fields.some((field) => field.key === "speed") && graphicAmplifiers.some((item) => !graphics[item.key].hidden))
    );
    renderCarryNotes([...carried.values()], states);
    renderUnavailable(states, { sidc, profile, kind, active });
    renderListFilters(counts, query);
    view.textSummary = active ? `${config().label} · ${counts.available} applicable fields` : `${config().label} · ${counts.available} fields`;
    view.textApplies = active
      ? `${profileTitles[state.standardId]}: ${counts.available} text fields apply to ${kindPlurals[kind] || (kind ? `${classWords(kind)} symbols` : "this symbol")}.`
      : `${config().label} has no field table here: all ${counts.available} fields are offered, and placement follows the renderer's symbol-set rules. Offering a field does not mean this edition defines it for the symbol.`;
    view.filledBadge = counts.filled ? `${counts.filled} filled` : "";
    // Stacking is a display extension outside the APP-6A publication profile.
    view.stackHidden = disabled.stack = state.standardId === "app6a";
    syncListHelp();
  }

  function renderListFilters(counts, query) {
    const filtering = Boolean(query) || state.filledOnly;
    const parts = [];
    if (filtering) parts.push(counts.shown ? `Showing ${counts.shown} of ${counts.available} fields.` : query ? `No applicable field matches "${state.fieldQuery.trim()}".` : "No field is filled yet.");
    if (counts.hiddenFilled) parts.push(`${counts.hiddenFilled} filled ${counts.hiddenFilled === 1 ? "field is" : "fields are"} hidden by the filter.`);
    view.listFilters = {
      filledOnly: state.filledOnly,
      filledOnlyLabel: counts.filled ? `Filled only · ${counts.filled}` : "Filled only",
      status: parts.join(" ")
    };
  }

  // Fields of this edition that do not apply to the symbol, and graphics the
  // edition defines that this editor cannot set.
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
        if (control.applies || control.defined === false) continue;
        const kept = !graphicFilled(definition.key) ? "" : definition.key === "direction" ? `The heading ${graphicValue("direction")}°` : `The length ${graphicValue("speedLeader")}`;
        notHere.push({ field: definition.field, label: definition.label, reason: movementNote(control, kept), full: control.reason, kept });
      }
    const gaps = active ? editorGaps({ standardId: state.standardId, profile, sidc, tables: editionTables, movement }) : [];
    for (let index = notHere.length - 1; index >= 0; index -= 1) {
      const gap = gaps.find((item) => item.field === notHere[index].field);
      if (!gap) continue;
      if (notHere[index].kept) gap.kept = `${notHere[index].kept} is kept and returns on a symbol that takes it.`;
      notHere.splice(index, 1);
    }
    const total = notHere.length + gaps.length;
    view.unavailable = {
      hidden: !total,
      summary: `Not available for this symbol · ${total}`,
      notHereTitle: `Not for ${kind ? classWords(kind) : "this"} symbols`,
      notHere: notHere.map((item) => ({ field: item.field || "–", label: item.label, reason: item.reason, title: item.full || item.reason })),
      gaps: gaps.map((item) => ({
        field: item.field || "–",
        label: item.label,
        reason: `${humanize(shortReason(item.reason)) || item.reason}${item.kept ? `. ${item.kept}` : ""}`,
        title: item.reason
      }))
    };
  }

  // One help line under the List: the focused field's code, name, rule and example.
  function syncListHelp() {
    const key = state.focusField;
    const field = textModifiers.find((item) => item.key === key) || graphicAmplifiers.find((item) => item.key === key);
    const graphic = graphicAmplifiers.includes(field);
    const shown = field && (graphic ? view.graphicFields?.[key] : view.textFields?.[key]);
    const inputDisabled = field && (graphic ? disabled[key === "direction" ? "directionNumber" : key] : disabled[field.id]);
    if (!field || !shown || shown.hidden || inputDisabled) {
      view.listHelp = null;
      return;
    }
    const code = graphic ? field.field : shown.code;
    const name = graphic ? field.label : shown.label;
    const max = !graphic && !field.choices ? shown.maxLength : 0;
    const value = graphic ? "" : controls[field.id];
    view.listHelp = { code, name, count: max > 0 ? `${value.length} / ${max}` : "", text: fieldHelp.get(key) || field.description };
  }

  // Text that is kept but not drawn, read differently, or a choice cleared.
  function renderCarryNotes(warnings, states) {
    const rows = warnings.map((item) => ({ ...item, clearable: true }));
    for (const [key, value] of Object.entries(state.droppedChoices)) {
      const definition = states.get(key);
      if (definition) rows.push({ key, field: definition.field, label: definition.label, value, kind: "dropped", message: `"${value}" is not a defined value in ${config().label}, so the choice is cleared. It returns if a symbol or edition defines it again.` });
    }
    view.carryNotes = rows.map((item) => ({
      key: item.key,
      kind: item.kind,
      field: item.field || "–",
      label: item.label,
      value: item.kind === "dropped" ? "" : item.value,
      message: item.message,
      clearable: Boolean(item.clearable)
    }));
  }

  function selectImportedValue(id, value) {
    if (!lists[id].some((item) => item.value === value))
      lists[id] = [...lists[id], { value, label: `SIDC: ${value.replace(/^code:/, "")}` }];
    controls[id] = value;
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
    const amplifierValue = source.find((item) => item[modern ? 2 : 3] === amplifier)?.[0];
    Object.assign(state, {
      customSidc: value,
      importedIcon: parsed.icon,
      selectedId: parsed.icon.id,
      affiliation: identity?.value || `code:${parsed.identity}`,
      status: statuses.find((item) => item[encoding] === parsed.status)?.value || `code:${parsed.status}`,
      context: identity?.context || parsed.context,
      amplifierMode: parsed.mobility ? "mobility" : ["-", "00"].includes(amplifier) ? "none" : "echelon",
      amplifierValue: amplifierValue ?? `code:${amplifier}`,
      modifier1: parsed.modifier1,
      modifier2: parsed.modifier2
    });
    for (const key of ["hq", "taskForce", "feintDummy"]) controls[key] = parsed[key];
    selectImportedValue("frameShape", parsed.frameShape);
    syncStandardControls();
  }

  // Exercise relabels suspect and hostile as Joker and Faker.
  function populateIdentityOptions() {
    lists.affiliation = identityList(config()).map((item) => ({ value: item.value, label: identityLabelFor(item) }));
    selectImportedValue("affiliation", state.affiliation);
  }

  function syncStandardControls() {
    const contexts = contextOptions(config());
    view.contextHidden = !contexts.length;
    view.frameShapeHidden = numericSidcEdition(config().version) !== "e";
    populateIdentityOptions();
    lists.status = statusChoices().map((item) => ({ value: item.value, label: statusLabelFor(item) }));
    selectImportedValue("status", state.status);
    lists.context = contexts.map((item) => ({ value: item[0], label: contextLabel(config(), item) }));
    if (contexts.length) selectImportedValue("context", state.context);
    else controls.context = "";
    populateAmplifier();
    syncModifiers();
    renderCountryOptions();
  }

  function describePart(key, value, sidc) {
    const modern = /^\d/.test(sidc);
    const icon = selectedIcon();
    const flagName = (code) => (code && flagNames.get(code)) || "";
    switch (key) {
      case "scheme":
        return schemeNames[value] || "";
      case "identity": {
        const identity = decodeIdentity(modern ? value[1] : value, config(), modern ? value[0] : "0");
        const entry = identity && identityList(config()).find((item) => item.value === identity.value);
        const label = entry ? identityLabelFor(entry, identity.context) : "";
        const context = contextOptions(config()).find(([code]) => code === value[0]);
        if (modern) return [(context && context[1]) || contextNames[value[0]] || "Context " + value[0], label].filter(Boolean).join(" · ");
        return identity?.context === "1" ? `Exercise · ${label}` : label;
      }
      case "dimension":
        return dimensionNames[value] || "";
      case "status":
        return statuses.find((item) => item.legacy === value)?.label || "";
      case "function":
      case "entity":
        return icon?.name || "";
      case "set":
        return icon?.category || "";
      case "version":
        return { d: "Edition D", e: "Edition E" }[numericSidcEdition(value)] || "";
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
      case "originatorCountry":
        return flagName(countryFlagFromSidc(sidc, state.standardId)) || (/^[-0*]+$/.test(value) ? "Not set" : "");
      case "frameShape":
        return lists.frameShape.find((item) => item.value === value)?.label || "";
      case "oob":
        return value === "-" || value === "*" ? "Not set" : "";
      default:
        return "";
    }
  }

  function updateSegments(sidc) {
    const dEdition = ["app6d", "2525d"].includes(state.standardId);
    view.segments = sidcParts(sidc, dEdition).map(({ key, label, value }) => ({
      key,
      label,
      value: value || "—",
      meaning: describePart(key, value, sidc),
      wide: key === "function" || key === "entity"
    }));
  }

  const chipCache = new Map();
  function chipSvg(sidc, { size = 18, icon = true, modifierColor = "", hqStaffLength = 0 } = {}) {
    const key = `${state.standardId}|${sidc}|${controls.colorMode}|${controls.strokeWidth}|${size}|${icon}|${modifierColor}|${hqStaffLength}`;
    if (!chipCache.has(key)) {
      let svg = "";
      try {
        svg = drawSymbol(sidc, { ...currentOptions(true), size, icon, infoFields: false, modifierColor, hqStaffLength }).asSVG();
      } catch {
        svg = "";
      }
      if (chipCache.size > 400) chipCache.clear();
      chipCache.set(key, svg);
    }
    return chipCache.get(key);
  }

  const designationCodes = { feintDummy: 1, hq: 2, taskForce: 4 };
  function renderDesignationGlyphs(base, modern) {
    const options = { size: 30, hqStaffLength: 40 };
    const svgs = Object.values(designationCodes).map((code) => {
      if (modern) return chipSvg(`${base.slice(0, 7)}${code}${base.slice(8)}`, options);
      const amplifier = base[10] === "H" ? `H${code === 1 ? "B" : "-"}` : `${legacyFlagLetters[code]}-`;
      return chipSvg(`${base.slice(0, 10)}${amplifier}${base.slice(12)}`, options);
    });
    const drawn = centeredGlyphs(svgs);
    view.designationGlyphs = Object.fromEntries(Object.keys(designationCodes).map((key, index) => [key, drawn[index]]));
  }

  // Chips are a visual front end for the identity and status selects.
  function renderChips(sidc) {
    const modern = config().family === "modern";
    let base = sidc;
    if (modern) base = base.padEnd(20, "0").slice(0, 7) + "000" + base.padEnd(20, "0").slice(10);
    else if (base[10] !== "H") base = base.padEnd(15, "-").slice(0, 10) + "--" + base.padEnd(15, "-").slice(12);
    const variant = (position, code) => base.slice(0, position) + code + base.slice(position + 1);
    const glyphsFor = (rows, position) => centeredGlyphs(rows.map((row) => (row.code ? chipSvg(variant(position, row.code), { size: 30 }) : "")));
    const standard = config();
    const identities = identityList(standard);
    const offers = profileOffers(sidc);
    const offerFlag = (id, kind, value, importedReason) => {
      if (value.startsWith("code:")) return importedReason || "This code is not defined in this edition.";
      const offer = offers && offers[kind].get(value);
      if (!offer || offer.offered) return "";
      return controls[id] === value ? offer.reason || "Not valid for this symbol." : null;
    };
    const importedIdentityReason = (value) =>
      state.standardId === "app6a" ? app6aRules.app6aIdentity(value.replace(/^code:/, ""), sidc[2]).reason : "";
    const identityRows = [];
    let secondarySelection = "";
    for (const item of lists.affiliation) {
      const entry = identities.find((candidate) => candidate.value === item.value);
      const flag = offerFlag("affiliation", "identity", item.value, importedIdentityReason(item.value));
      if (flag === null) continue;
      const code = entry ? identityCode(entry, standard, state.context) : item.value.replace(/^code:/, "");
      const label = entry ? identityLabelFor(entry) : item.label;
      const common = ["friend", "hostile", "neutral", "unknown"].includes(item.value);
      identityRows.push({ value: item.value, label, code, flag, common });
      if (!common && item.value === controls.affiliation) secondarySelection = `· ${label}${flag ? " — not valid here" : ""}`;
    }
    const chips = (id, rows, glyphs) => rows.map((row, index) => ({
      value: row.value,
      label: row.label,
      glyph: glyphs[index],
      flag: row.flag,
      pressed: controls[id] === row.value,
      disabled: Boolean(disabled[id])
    }));
    const identityChips = (common) => {
      const rows = identityRows.filter((row) => row.common === common);
      return chips("affiliation", rows, glyphsFor(rows, modern ? 3 : 1));
    };
    const statusRows = [];
    for (const item of lists.status) {
      const entry = statuses.find((candidate) => candidate.value === item.value);
      const flag = offerFlag("status", "status", item.value);
      if (flag === null) continue;
      const code = entry ? entry[modern ? "numeric" : "legacy"] : item.value.replace(/^code:/, "");
      statusRows.push({ value: item.value, label: entry ? statusLabelFor(entry) : item.label, code, flag });
    }
    view.chips = {
      primary: identityChips(true),
      secondary: identityChips(false),
      moreHidden: identityRows.every((row) => row.common),
      moreSelection: secondarySelection,
      status: chips("status", statusRows, glyphsFor(statusRows, modern ? 6 : 3))
    };
    renderDesignationGlyphs(base, modern);
  }

  // Name the SIDC position when an imported code is outside this edition.
  function renderProblem() {
    if (!currentSymbol) return "This code cannot be rendered.";
    if (currentCheck.valid) return "";
    const modern = config().family === "modern";
    const detail = currentCheck.details;
    const sidc = state.customSidc || buildSidc();
    const imported = (id, start, end, what) =>
      selectedLabel(id).startsWith("SIDC: ")
        ? [{ text: `Position ${end - start > 1 ? `${start + 1}–${end}` : start + 1}: "${sidc.slice(start, end)}" is not ${what} in this edition.`, value: sidc.slice(start, end) }]
        : [];
    const reasons = problemReasons({
      named: [
        ...imported("affiliation", modern ? 3 : 1, modern ? 4 : 2, "an identity"),
        ...imported("status", modern ? 6 : 3, modern ? 7 : 4, "a status"),
        ...imported("amplifierValue", modern ? 8 : 10, modern ? 10 : 12, "an echelon or mobility code")
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
        text = [message?.sidc === sidc ? message.notes : "", problem].filter(Boolean).join(" ");
      }
    }
    view.sidcStatus = {
      kind,
      text,
      hidden: kind === "idle",
      dirty: state.sidcDirty && kind === "pending",
      error: state.sidcDirty && kind === "error",
      applyReady: state.sidcDirty,
      length: controls.sidcInput.replace(/\s/g, "").length
    };
  }

  function renderProfileDetails() {
    const lines = currentCheck ? profileDetailLines(currentCheck.details) : { notes: [], unresolved: [], versionExtension: [] };
    const issues = [...lines.unresolved.map((text) => `Unresolved source conflict. ${text}`), ...lines.versionExtension];
    view.profileDetails = {
      hidden: !issues.length && !lines.notes.length,
      issues,
      notes: lines.notes,
      notesSummary: `${lines.notes.length} note${lines.notes.length === 1 ? "" : "s"} from ${profileTitles[state.standardId] || "the edition profile"}`
    };
  }

  function setTextView(next) {
    state.positions = next === "positions";
    write("symbol-studio:text-view", next);
    renderAll();
  }

  // The current symbol without text, outline, direction or speed leader.
  function layoutOptions() {
    const options = { ...currentOptions(), size: 100, infoSize: 40, outlineWidth: 0, direction: undefined, speedLeader: 0, infoColor: "", infoBackground: "" };
    for (const { key } of textModifiers) options[key] = "";
    return options;
  }

  function layoutStates(sidc) {
    return currentFieldStates(sidc).filter((item) => item.available && item.field && item.key !== "engagementType");
  }

  // AO built from lists opens the list view; F and L are lists.
  function layoutKind(definition) {
    if (definition.parts) return "open";
    return textModifiers.find((field) => field.key === definition.key).choices ? "select" : "input";
  }

  const graphicValue = (key) => (key === "direction" ? Number(controls.direction) : Number(controls.speedLeader));
  const graphicFilled = (key) => (key === "direction" ? graphicValue(key) >= 0 : graphicValue(key) > 0);

  function movementNote(control, kept) {
    const reason = humanize(control.reason.replace(/^[A-Z]{1,2} [a-zA-Z]+: /, ""));
    return `${reason.charAt(0).toUpperCase()}${reason.slice(1)}.${kept ? ` ${kept} is kept and returns on a symbol that takes it.` : ""}`;
  }

  function syncGraphicsControls() {
    const movement = movementFor(state.customSidc || buildSidc());
    const value = Number(controls.direction);
    const on = value >= 0 && movement.direction.applies;
    disabled.direction = disabled.directionNumber = !movement.direction.applies;
    disabled.speedLeader = !movement.speedLeader.applies || !on;
    view.directionNumber = value < 0 ? "" : String(value);
    view.directionOffHidden = value < 0;
  }

  function graphicHelp(key) {
    const definition = graphicAmplifiers.find((item) => item.key === key);
    if (key !== "direction" || !controls.hq || disabled.hq) return definition.description;
    return `${definition.description} ${state.standardId === "app6a"
      ? "APP-6A draws it from the bottom centre of the frame, also with a headquarters (505.1a)."
      : "With a headquarters, the arrow starts at the end of the HQ staff."}`;
  }

  function renderPickers() {
    const modern = config().family === "modern";
    const amplifierRows = amplifierChoices();
    const pickers = {
      ...view.pickers,
      amplifier: {
        value: controls.amplifierValue,
        disabled: Boolean(disabled.amplifierValue),
        choices: amplifierRows,
        fallback: { value: "", name: "Unspecified" },
        glyph: sharedGlyphs(amplifierRows, amplifierSvg)
      },
      country: { value: controls.countryFlag, disabled: Boolean(disabled.countryFlag), choices: countryChoices(), flags: true }
    };
    if (modern) {
      for (const type of [1, 2]) {
        const id = `modifier${type}`;
        const rows = lists[id].map((item) => modifierChoice({ value: item.value, textContent: item.label, title: item.title || "", disabled: Boolean(item.disabled), parentElement: { label: item.group || "" } }));
        pickers[id] = { value: controls[id], disabled: Boolean(disabled[id]), choices: rows, glyph: sharedGlyphs(rows, (value) => iconModifierSvg(type, value)) };
      }
      const shapeRows = lists.frameShape.map((item) => frameShapeChoice({ value: item.value, textContent: item.label }));
      const drawn = centeredGlyphs(shapeRows.map((item) => frameShapeSvg(item.value)));
      pickers.frameShape = {
        value: controls.frameShape,
        disabled: false,
        choices: shapeRows,
        glyph: (value) => drawn[shapeRows.findIndex((item) => item.value === value)] || ""
      };
    }
    view.pickers = pickers;
  }

  function renderAll() {
    const icon = selectedIcon();
    if (!icon) return;
    state.selectedId = icon.id;
    reconcileSelections();
    if (lists.status.some((item) => item.value === state.status)) controls.status = state.status;
    syncModifiers();
    const sidc = state.customSidc || buildSidc(icon);
    const countryCode = countryCodeForFlag(controls.countryFlag, state.standardId);
    const countryField = countrySidcField(state.standardId);
    view.countryFlagNote = countryFlagNote({ selected: controls.countryFlag, code: countryCode, label: countryField?.label });
    ms.setStandard(config().standard);
    try {
      const options = currentOptions();
      currentSymbol = drawSymbol(sidc, options);
      currentCheck = editionCheck(currentSymbol, activeProfile(), sidc, options);
      currentSvg = currentSymbol.asSVG();
      const valid = Boolean(currentCheck.valid);
      const detail = currentCheck.details;
      view.preview = { svg: currentSvg, error: "" };
      view.renderState = {
        valid,
        text: valid ? "Rendered" : "Check code / modifiers",
        title: [...(detail.sidcErrors || []), ...(detail.identityErrors || []), ...(detail.modifierErrors || []), ...(detail.notes || [])].join("; ")
      };
    } catch (error) {
      currentSymbol = null;
      currentCheck = null;
      currentSvg = "";
      view.preview = { svg: "", error: error.message };
      view.renderState = { valid: false, text: "Rendering error", title: view.renderState?.title || "" };
    }
    view.selectedName = icon.name;
    renderSelectedPath(icon);
    view.supportNote = state.standardId === "app6e"
      ? "Compatibility view using the shared 2525E catalog. This is not a separate edition-specific catalog."
      : state.standardId === "app6a"
        ? `${icon.source || "APP-6A (1998)"}. ${dataset().icons.length} S-scheme catalog entries.${icon.categoryOnly ? " Category — no separate illustration in APP-6A Annex D; preview is the renderer’s representation." : ""}${icon.remarks ? " " + icon.remarks : ""}`
        : `Rendered with milsymbol. Symbol appearance may differ from older standard publications.${icon.note ? ` ${icon.note}` : ""}`;
    if (!state.sidcDirty) controls.sidcInput = displayEditorSidc(sidc);
    view.compactSidc = controls.sidcInput;
    view.exportDisabled = !currentSvg;
    updateSegments(displayEditorSidc(sidc));
    renderSidcStatus(sidc);
    renderProfileDetails();
    renderChips(sidc);
    amplifierSidc = sidc;
    renderPickers();
    view.modifierColorUnused = modifierColorUnused({ on: controls.modifierColorOn, color: controls.modifierColor, svg: currentSvg });
    syncGraphicsControls();
    renderExportSize();
    view.coverage = { hidden: !config().coverage, text: config().coverage || "", title: config().coverageNote || "" };
    view.layout = { sidc, states: layoutStates(sidc), options: layoutOptions(), graphics: graphicAmplifiers.filter((item) => movementFor(sidc)[item.key].applies) };
    view.documentTitle = `${icon.name} — Military Symbol Editor`;
    draftAutosave.schedule();
  }

  function renderSelectedPath(icon) {
    const known = dataset().icons.some((item) => item.category === icon.category);
    const crumbs = known ? entryCrumbs(icon, categoryBase(icon.category)) : [];
    view.path = {
      steps: [{ label: icon.category, branch: known ? [] : null }, ...crumbs.map((crumb) => ({ label: crumb.name, branch: crumb.branch }))],
      category: icon.category,
      imported: Boolean(state.customSidc)
    };
  }

  function updateSidcAndRender(field) {
    if (state.customSidc) state.customSidc = editImportedSidc(state.customSidc, buildSidc(), field, config());
    renderAll();
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
    write(`symbol-studio:${state.standardId}`, id);
    renderAll();
  }

  function exportName(extension) {
    return exportFilename({ standardId: state.standardId, sidc: state.customSidc || buildSidc(), name: selectedIcon()?.name }, extension);
  }

  function renderExportSize() {
    const size = currentSymbol ? pngOutputSize(currentSymbol.getSize()) : null;
    const label = size ? `${size.width} × ${size.height} px` : "";
    view.pngLabel = `Download PNG${label ? `, ${label}` : ""}`;
    view.pngTitle = `Download PNG${label ? `, ${label}` : ""} (transparent background)`;
  }

  function resetControls() {
    const previousDraft = captureDraft();
    for (const field of textModifiers) controls[field.id] = "";
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
    ui.resetCount += 1;
    for (const id of ["fillColorOn", "monoColorOn", "modifierColorOn", "infoColorOn", "infoBackgroundOn"]) controls[id] = false;
    controls.showFlag = true;
    controls.fillColor = "#80e0ff";
    controls.monoColor = "#000000";
    controls.modifierColor = "#d32f2f";
    controls.infoColor = "#000000";
    controls.infoBackground = "#ffffff";
    controls.fillOpacity = "100";
    controls.infoSize = "40";
    controls.outlineWidth = "7";
    controls.outlineColor = "#ffffff";
    setSelect("countryFlag", "");
    pendingCountryFlag = null;
    setSelect("colorMode", "Light");
    for (const id of ["hq", "taskForce", "feintDummy"]) controls[id] = false;
    controls.speedLeader = "0";
    controls.hqStaffLength = "0";
    setSelect("stack", "0");
    setSelect("frameShape", "0");
    setSelect("uncertaintyMarker", "table");
    controls.direction = "-1";
    controls.fill = controls.frame = controls.icon = controls.infoFields = true;
    controls.symbolSize = "100";
    controls.strokeWidth = "4";
    controls.outlineToggle = false;
    syncStandardControls();
    renderAll();
    resetDraft = previousDraft;
    ui.undoReset = true;
    draftAutosave.flush();
    toast("Modifiers reset");
  }

  function dismissResetUndo() {
    resetDraft = null;
    ui.undoReset = false;
  }

  function activateTab(tab) {
    ui.tab = tab;
    signal("tabTop");
  }

  // Opens a field in the List view.
  function openField(key) {
    const field = textModifiers.find((item) => item.key === key);
    const id = field ? field.id : key === "direction" ? "directionNumber" : key === "speedLeader" ? "speedLeader" : null;
    if (!id || disabled[id]) return;
    state.fieldQuery = "";
    state.filledOnly = false;
    setTextView("list");
    activateTab("text");
    setFocusField(key);
    signal("focusField", { key, composite: Boolean(field && view.textFields[key]?.ao?.composite) });
  }

  function setFocusField(key) {
    state.focusField = key;
    syncListHelp();
  }

  function openSearch() {
    if (state.searchOpen) {
      signal("focusSearch");
      return;
    }
    state.searchOpen = true;
    signal("focusSearch", { select: true });
  }

  function closeSearch() {
    if (!state.searchOpen) return;
    state.searchOpen = false;
  }

  function setEditorChoice(name, value, fallback) {
    ui[name] = value;
    if (value === fallback) remove(`symbol-studio:${name}`);
    else write(`symbol-studio:${name}`, value);
  }

  function loadEditorChoices() {
    remove("symbol-studio:theme");
    const preview = read("symbol-studio:preview");
    const grid = read("symbol-studio:grid");
    controls.previewBackground = ["dark", "map"].includes(preview) ? preview : "light";
    controls.gridToggle = gridChoice(grid) === "on";
    setEditorChoice("preview", controls.previewBackground, "light");
    setEditorChoice("grid", gridChoice(grid), "on");
  }

  // The SIDC in the box as Apply reads it (studio/app.js, applySidc click).
  function applySidc() {
    const completion = completeEditorSidc(controls.sidcInput, config().family);
    const completionNote = !completion.added ? ""
      : config().family === "modern" ? `Completed with 0 to ${completion.value.length} digits.`
        : `Completed as ${completion.value}; * positions left unspecified.`;
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
    if (value.includes("*")) {
      const characters = [...value];
      if (characters[1] === "*") {
        const identity = identityList(config()).find((item) => item.value === state.affiliation);
        characters[1] = identity ? identityCode(identity, config(), state.context) : state.affiliation.replace(/^code:/, "");
      }
      if (characters[3] === "*")
        characters[3] = statuses.find((item) => item.value === state.status)?.legacy || state.status.replace(/^code:/, "");
      value = characters.join("").replace(/\*/g, "-");
    }
    applyImportedSidc(value);
    const importedFlag = countryFlagFromSidc(value, state.standardId);
    pendingCountryFlag = disabled.countryFlag ? importedFlag : null;
    setSelect("countryFlag", importedFlag);
    state.sidcDirty = false;
    state.sidcMessage = null;
    renderAll();
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
  }

  function loadFlags(flags) {
    if (ui.flags === "ready") return;
    flagArtwork = new Map(flags.map((flag) => [flag.code, flag.svg]));
    flagNames = new Map(flags.map((flag) => [flag.code, flag.name]));
    ms.addSymbolPart(createCountryFlagPart(flags));
    disabled.countryFlag = false;
    ui.flags = "ready";
    renderCountryOptions();
    if (pendingCountryFlag !== null) {
      setCountryFlag(pendingCountryFlag);
      pendingCountryFlag = null;
    } else if (state.customSidc) setSelect("countryFlag", countryFlagFromSidc(state.customSidc, state.standardId));
    renderAll();
  }

  function flagsFailed() {
    lists.countryFlag = [{ value: "", label: "Flags unavailable — reload to retry" }];
    controls.countryFlag = "";
    disabled.countryFlag = true;
    ui.flags = "failed";
    renderPickers();
  }

  // Derived state the page reads; recomputed with every snapshot.
  function derived() {
    const positionsShown = state.positions && ui.layoutFits;
    return {
      positionsShown,
      positionsDisabled: !ui.layoutFits,
      positionsTitle: ui.layoutFits ? "Boxes around the symbol, where milsymbol draws each field" : "Field positions need a wider window; the list is shown",
      amplifierModes: ["echelon", "mobility", "none"].map((mode) => ({
        mode,
        label: { echelon: "Echelon", mobility: mobilityLabel, none: "None" }[mode],
        active: state.amplifierMode === mode,
        disabled: Boolean(disabled[`mode:${mode}`])
      })),
      flagTitles: { ...flagTitles },
      undoReset: ui.undoReset,
      standards: standards.map(({ id, label }) => ({ id, label })),
      modern: config().family === "modern",
      editionE: numericSidcEdition(config().version) === "e",
      ratingScales: { reliability: ratingScale(/^[A-F]$/), credibility: ratingScale(/^[1-6]$/) },
      engagementReference: fieldReference.engagementBar
    };
  }

  function commit() {
    snapshot = {
      state: { ...state },
      controls: { ...controls },
      disabled: { ...disabled },
      lists: { ...lists },
      view: { ...view, ...derived() },
      ui: { ...ui },
      palette: state.searchOpen ? paletteView() : null
    };
    for (const listener of [...listeners]) listener();
  }

  // Each action is one user event of studio/app.js; it publishes once.
  const act = (fn, { dismiss = false } = {}) => (...args) => {
    if (dismiss) dismissResetUndo();
    const result = fn(...args);
    commit();
    return result;
  };

  const actions = {
    setStandard: act((id) => setStandard(id), { dismiss: true }),
    applySidc: act(applySidc),
    setSidcInput: act((value) => {
      controls.sidcInput = String(value).replace(/_/g, "-");
      state.sidcDirty = true;
      state.sidcMessage = null;
      renderSidcStatus(state.customSidc || buildSidc());
      draftAutosave.schedule();
    }, { dismiss: true }),
    cancelSidcInput: act(() => {
      if (!state.sidcDirty) return false;
      state.sidcDirty = false;
      state.sidcMessage = null;
      renderAll();
      return true;
    }),
    chooseIdentity: act((value) => {
      if (disabled.affiliation) return;
      dismissResetUndo();
      setSelect("affiliation", value);
      delete state.adjustments.identity;
      state.affiliation = controls.affiliation;
      updateSidcAndRender("affiliation");
    }),
    setContext: act((value) => {
      setSelect("context", value);
      delete state.adjustments.identity;
      state.context = controls.context;
      populateIdentityOptions();
      updateSidcAndRender("context");
    }, { dismiss: true }),
    chooseStatus: act((value) => {
      setSelect("status", value);
      delete state.adjustments.status;
      state.status = controls.status;
      updateSidcAndRender("status");
    }, { dismiss: true }),
    setAmplifierMode: act((mode) => {
      if (disabled[`mode:${mode}`] || mode === state.amplifierMode) return;
      dismissResetUndo();
      delete state.adjustments.amplifier;
      state.amplifierMode = mode;
      state.amplifierValue = "";
      populateAmplifier();
      updateSidcAndRender("amplifier");
    }),
    setAmplifierValue: act((value) => {
      setSelect("amplifierValue", value);
      delete state.adjustments.amplifier;
      state.amplifierValue = controls.amplifierValue;
      updateSidcAndRender("amplifier");
    }, { dismiss: true }),
    setModifier: act((type, value) => {
      const id = `modifier${type}`;
      setSelect(id, value);
      state[id] = controls[id];
      updateSidcAndRender(id);
    }, { dismiss: true }),
    setFlag: act((id, checked) => {
      controls[id] = Boolean(checked);
      updateSidcAndRender("flags");
    }, { dismiss: true }),
    setCountryFlag: act((value) => {
      setSelect("countryFlag", value);
      if (state.customSidc) state.customSidc = withCountryFlag(state.customSidc, controls.countryFlag, state.standardId);
      renderAll();
    }, { dismiss: true }),
    setFrameShape: act((value) => {
      setSelect("frameShape", value);
      updateSidcAndRender("frameShape");
    }, { dismiss: true }),
    // Display switches, selects and numbers that only redraw.
    setControl: act((id, value) => {
      if (checkboxIds.has(id)) controls[id] = Boolean(value);
      else if (lists[id]) setSelect(id, String(value));
      else controls[id] = String(value);
      renderAll();
    }, { dismiss: true }),
    // Colors, opacity, text size and outline: changing one turns its switch on.
    setStyleValue: act((id, value) => {
      controls[id] = String(value);
      const toggle = { fillColor: "fillColorOn", monoColor: "monoColorOn", modifierColor: "modifierColorOn", infoColor: "infoColorOn", infoBackground: "infoBackgroundOn" }[id];
      if (toggle) controls[toggle] = true;
      if (id.startsWith("outline") && !state.outline) state.outline = controls.outlineToggle = true;
      renderAll();
    }, { dismiss: true }),
    setOutline: act((on) => {
      controls.outlineToggle = Boolean(on);
      state.outline = controls.outlineToggle;
      renderAll();
    }, { dismiss: true }),
    setDirectionText: act((raw) => {
      const text = String(raw).trim();
      controls.direction = text === "" ? "-1" : String(Math.min(360, Math.max(0, Math.round(Number(text) || 0))));
      renderAll();
    }, { dismiss: true }),
    directionOff: act(() => {
      controls.direction = "-1";
      renderAll();
      signal("focusDirection");
    }),
    // A text amplifier, from the list or a box (one value for both).
    setTextField: act((key, value) => {
      const field = textModifiers.find((item) => item.key === key);
      if (!field) return;
      controls[field.id] = field.choices && lists[field.id] && !lists[field.id].some((item) => item.value === value) ? "" : String(value);
      recordTextOrigin(key);
      renderAll();
    }, { dismiss: true }),
    setRating: act((reliability, credibility) => {
      const value = evaluationRating(reliability, credibility);
      if (!value) return;
      const field = textModifiers.find((item) => item.key === "evaluationRating");
      controls[field.id] = value;
      recordTextOrigin("evaluationRating");
      renderAll();
    }, { dismiss: true }),
    setEngagementPart: act((part, value) => {
      const field = textModifiers.find((item) => item.key === "engagementBar");
      const current = parseEngagement(controls[field.id]);
      const parts = { ...current, [part]: value };
      if (part === "b" && (parts.b === "MLT") !== (current.b === "MLT")) parts.c = "";
      controls[field.id] = composeEngagement(parts);
      recordTextOrigin("engagementBar");
      renderAll();
    }, { dismiss: true }),
    fillDtgNow: act(() => {
      const field = textModifiers.find((item) => item.key === "dtg");
      controls[field.id] = nowForDtg();
      recordTextOrigin("dtg");
      renderAll();
    }, { dismiss: true }),
    clearTextField: act((key) => {
      const field = textModifiers.find((item) => item.key === key);
      if (!field) return;
      controls[field.id] = "";
      recordTextOrigin(key);
      renderAll();
    }, { dismiss: true }),
    clearText: act(() => {
      dismissResetUndo();
      state.textOrigins = {};
      state.droppedChoices = {};
      for (const field of textModifiers) controls[field.id] = "";
      ui.resetCount += 1;
      controls.direction = "-1";
      controls.speedLeader = "0";
      renderAll();
      toast("Amplifiers cleared");
    }),
    setFieldQuery: act((value) => {
      state.fieldQuery = String(value);
      syncApp6aTextFields();
    }, { dismiss: true }),
    toggleFilledOnly: act(() => {
      state.filledOnly = !state.filledOnly;
      syncApp6aTextFields();
    }),
    clearFilters: act(() => {
      state.fieldQuery = "";
      state.filledOnly = false;
      syncApp6aTextFields();
      signal("focusFieldFilter");
    }),
    setFocusField: act((key) => {
      if (state.focusField === key) return;
      setFocusField(key);
    }),
    setTextView: act(setTextView),
    // Whether the boxes fit is measured once the tab is drawn: the Amplifiers
    // tab answers the showLayout signal with a toast or a scroll.
    openPositions: act(() => {
      setTextView("positions");
      activateTab("text");
      signal("showLayout");
    }),
    openField: act(openField),
    setTab: act(activateTab),
    setLayoutFits: (fits) => {
      if (ui.layoutFits === fits) return;
      ui.layoutFits = fits;
      commit();
    },
    reset: act(resetControls),
    undoReset: act(() => {
      const previous = resetDraft;
      dismissResetUndo();
      if (previous && restoreDraft(previous)) {
        draftAutosave.flush();
        toast("Reset undone");
        signal("focusReset");
      }
    }),
    // Any input or change event outside the actions above ends Undo reset.
    dismissResetUndo: () => {
      if (!ui.undoReset) return;
      dismissResetUndo();
      commit();
    },
    openSearch: act(openSearch),
    closeSearch: act(closeSearch),
    setSearch: act((value) => {
      state.search = String(value);
      state.visible = paletteBatch;
      signal("paletteTop");
    }, { dismiss: true }),
    clearSearch: act(() => {
      state.search = "";
      state.visible = paletteBatch;
      signal("paletteTop");
      signal("focusSearch");
    }),
    setCategory: act((category) => {
      state.category = category;
      state.visible = paletteBatch;
      signal("paletteTop");
    }),
    // The next batch of results; false when every result is shown.
    loadMore: () => {
      const palette = paletteView();
      if (!palette.more) return false;
      state.visible += paletteBatch;
      commit();
      return true;
    },
    setSectionOpen: act((key, open) => {
      if (open) closedSections.delete(key);
      else closedSections.add(key);
    }),
    chooseSymbol: act((id) => {
      selectSymbol(id);
      closeSearch();
    }),
    chooseFirst: act(() => {
      const first = filteredIcons()[0];
      if (!first) return;
      selectSymbol(first.id);
      closeSearch();
    }),
    showGroup: act((branch) => showGroup(selectedIcon().category, branch)),
    setEditorChoice: act((name, value) => {
      if (name === "grid") {
        controls.gridToggle = Boolean(value);
        setEditorChoice("grid", value ? "on" : "off", "on");
      } else {
        controls.previewBackground = String(value);
        setEditorChoice("preview", String(value), "light");
      }
    }, { dismiss: true }),
    setHelpOpen: act((open) => {
      ui.helpOpen = Boolean(open);
    }),
    toast: act(toast),
    loadFlags: act(loadFlags),
    flagsFailed: act(flagsFailed),
    flushDraft: () => draftAutosave.flush()
  };

  // Reads that do not change the editor.
  const queries = {
    drawSymbol,
    miniSvg,
    flagSvg: (code) => flagArtwork.get(code) || "",
    exportName,
    currentSvg: () => currentSvg,
    copiedSidc: () => copiedSidc({ shown: controls.sidcInput, sidc: state.customSidc || buildSidc(), dirty: state.sidcDirty }),
    sidc: () => state.customSidc || buildSidc(),
    valid: () => Boolean(currentCheck && currentCheck.valid),
    nowForDtg,
    layoutKind,
    captureDraft,
    fieldHelp: (key) => fieldHelp.get(key) || "",
    fieldWarnings: (key) => fieldWarnings.get(key) || []
  };

  // init() of studio/app.js, after the catalog has loaded.
  loadEditorChoices();
  loadRecent();
  chooseInitialSymbol();
  const recent = read(`symbol-studio:${state.standardId}`);
  if (recent && dataset().icons.some((icon) => icon.id === recent)) state.selectedId = recent;
  syncStandardControls();
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
  commit();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    ...actions,
    ...queries
  };
}
