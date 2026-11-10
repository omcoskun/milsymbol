// Tables of the editor, as studio/app.js and studio/index.html define them.
// Plain data: the store (store.js) and the components both read them.
import * as app6aRules from "../../../src/modifierprofiles/app6a.js";
import { std2525cProfile, std2525cTableIV } from "../../../studio/profiles/std2525c.js";
import { app6bProfile, app6bTableI } from "../../../studio/profiles/app6b.js";
import { app6eFields, app6eProfile } from "../../../studio/profiles/app6e.js";
import { std2525dFields, std2525dProfile } from "../../../studio/profiles/std2525d.js";
import { std2525eFields, std2525eProfile } from "../../../studio/profiles/std2525e.js";
import { app6dProfile } from "../../../studio/profiles/app6d.js";

export const standards = [
  { id: "app6a", label: "APP‑6A", detail: "NATO / 1998", family: "legacy", standard: "APP6A", version: "" },
  { id: "app6b", label: "APP‑6B", detail: "NATO / 15 CHAR", family: "legacy", standard: "APP6", version: "" },
  { id: "app6d", label: "APP‑6D", detail: "NATO / D", family: "modern", standard: "APP6", version: "10" },
  {
    id: "app6e",
    label: "APP‑6E",
    detail: "NATO / E",
    family: "modern",
    standard: "APP6",
    // Table A-1 PDF 747/713: 13 is MIL-STD-2525E, 16 is APP-06(E)(2).
    version: "16",
    coverage: "Compatibility view",
    coverageNote: "APP-6E has no catalog of its own here: the symbols come from the shared 2525E catalog. The field rules follow APP-06 Edition E Version 2; the fields sit where milsymbol draws them."
  },
  { id: "2525c", label: "MIL‑2525C", detail: "15 CHAR", family: "legacy", standard: "2525", version: "" },
  { id: "2525d", label: "MIL‑2525D", detail: "NUMERIC / D", family: "modern", standard: "2525", version: "10" },
  { id: "2525e", label: "MIL‑2525E", detail: "NUMERIC / E", family: "modern", standard: "2525", version: "13" }
];

// Edition modifier profiles shared with the renderer.
export const profiles = {
  app6a: app6aRules.app6aProfile,
  app6b: app6bProfile,
  "2525c": std2525cProfile,
  app6d: app6dProfile,
  "2525d": std2525dProfile,
  "2525e": std2525eProfile,
  app6e: app6eProfile
};

export const profileNotes = {
  app6a: "APP-6A Table III (pp. 19–21). Only applicable fields are editable; limits follow the publication.",
  "2525c": "MIL-STD-2525C Table IV (pp. 22–24) for warfighting (S) symbols. Only applicable fields are editable; limits follow the publication.",
  app6d: "APP-6D amplifier tables of this symbol set. Only applicable fields are editable; limits appear only where the publication sets one.",
  app6b: "APP-6(B) Table I (pp. 2-8 to 2-10) for warfighting (S) symbols. Only applicable fields are editable; limits follow the publication.",
  "2525d": "MIL-STD-2525D Change 1 Table VII and the placement figure of this symbol set. Only applicable fields are editable.",
  "2525e": "MIL-STD-2525E Change 1 Table VI and the placement figure of this symbol set. Only applicable fields are editable.",
  app6e: "APP-06 Edition E Version 2 Table 1-5 and the placement figure of this symbol set. Only applicable fields are editable."
};

export const profileTitles = {
  app6a: "APP-6A Table III",
  app6b: "APP-6(B) Table I",
  "2525c": "MIL-STD-2525C Table IV",
  app6d: "APP-6D",
  "2525d": "MIL-STD-2525D",
  "2525e": "MIL-STD-2525E",
  app6e: "APP-6(E)"
};

// Field tables that name a form key the way the edition does (see editionField).
export const editionTables = {
  app6a: app6aRules.app6aTextFields,
  app6b: app6bTableI,
  "2525c": std2525cTableIV,
  "2525d": std2525dFields,
  "2525e": std2525eFields,
  app6e: app6eFields
};

export const statuses = [
  { value: "present", label: "Present", numeric: "0", legacy: "P" },
  { value: "planned", label: "Planned / anticipated", numeric: "1", legacy: "A" },
  { value: "fullyCapable", label: "Fully capable", numeric: "2", legacy: "C" },
  { value: "damaged", label: "Damaged", numeric: "3", legacy: "D" },
  { value: "destroyed", label: "Destroyed", numeric: "4", legacy: "X" },
  { value: "fullToCapacity", label: "Full to capacity", numeric: "5", legacy: "F" }
];

export const echelons = [
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

// Position 11 of a letter SIDC, indexed by the flag code: feint/dummy 1, HQ 2, task force 4.
export const legacyFlagLetters = ["-", "F", "A", "C", "E", "G", "B", "D"];

export const kindLabels = { unit: "Unit", equipment: "Equipment", installation: "Installation", point: "Tactical point", nuclear: "Nuclear point" };
export const kindPlurals = { unit: "units", equipment: "equipment", installation: "installations", point: "tactical points", nuclear: "nuclear points" };
export const sectorPlaces = { top: "above the symbol", bottom: "below the symbol", left: "left of the symbol", right: "right of the symbol" };
export const engagementSourceNames = { R: "remote", B: "local and remote" };

export const schemeNames = { S: "Warfighting", G: "Tactical graphic", W: "Weather", I: "Intelligence", O: "Stability operations", E: "Emergency management" };
export const dimensionNames = { P: "Space", A: "Air", G: "Ground", S: "Sea surface", U: "Subsurface", F: "Special operations", X: "Other", Z: "Unknown" };
export const contextNames = { 0: "Reality", 1: "Exercise", 2: "Simulation" };
export const legacyFlagNames = { "-": "", F: "Feint / dummy", A: "Headquarters", C: "HQ · feint", E: "Task force", G: "Task force · feint", B: "Task force HQ", D: "Task force HQ · feint" };

// Q and AJ: the graphic amplifiers set in the Amplifiers list, next to Z.
export const graphicAmplifiers = [
  { key: "direction", field: "Q", label: "Direction of movement", description: "Direction the object moves or will move, in degrees from north; drawn as an arrow." },
  { key: "speedLeader", field: "AJ", label: "Speed leader", description: "A line in the direction of movement instead of the arrow, in pixels; 0 draws the arrow. Needs a direction (Q)." }
];

// Select lists written into studio/index.html.
export const frameShapes = [
  ["0", "Default for symbol set"],
  ["1", "Space"],
  ["2", "Air"],
  ["3", "Land unit"],
  ["4", "Land equipment"],
  ["5", "Land installation"],
  ["6", "Dismounted individual"],
  ["7", "Sea subsurface"],
  ["8", "Activity / event"],
  ["9", "Cyberspace"],
  ["A", "Sea surface"]
];
export const uncertaintyMarkers = [
  ["table", "Publication default"],
  ["field", "In field E"],
  ["frame", "Inside the frame"]
];
export const colorModes = [["Light", "Light"], ["Medium", "Medium"], ["Dark", "Dark"]];
export const stackChoices = [
  ["0", "Single symbol"],
  ["1", "2 symbols"],
  ["2", "3 symbols"],
  ["3", "4 symbols"],
  ["4", "5 symbols"],
  ["5", "6 symbols"]
];
export const previewBackgrounds = [["light", "Light"], ["dark", "Dark"], ["map", "Map"]];

// The symbol palette renders its results in batches as the list scrolls.
export const paletteBatch = 40;
