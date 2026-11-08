// MIL-STD-2525D Change 1 (2525D w/CHANGE 1) amplifier profile for numeric SIDCs
// (version 10-12) rendered with the 2525 standard. See fieldtable.js.
//
// Sources (physical PDF page / printed page, printed = physical - 16):
//   5.3.7        alignment and order of amplifier fields  PDF 37 / 21
//   Table VII    fields and display lengths               PDF 38-41 / 22-25
//   Table A-II   context and identity                     PDF 67 / 51
//   Table A-VII  HQ/task force/dummy                      PDF 70 / 54
//   Table A-VIII echelon/mobility/towed array             PDF 71 / 55
//   Tables XII, XIII engagement bar codes                 PDF 56-57 / 40-41
// A placement figure wins over Table VII for where a field goes and whether a
// class has it (5.3.7: field descriptions "vary by dimension and are detailed
// within the respective appendices"). docs/edition-modifiers.md lists each
// place the table and the figure disagree.
import {
  app6dEngagementError,
  buildProfile,
  countryPattern,
  def,
  designatorChoices,
  effectivenessChoices,
  evaluationPattern,
  fieldTable
} from "./fieldtable.js";

const DTG =
  /^(O\/O|[0-9]{6}([0-9]{2})?[A-Za-z][A-Za-z]{3}([0-9]{2}|[0-9]{4}))$/;

const definitions = {
  C: def("C", "Quantity", { maxLength: 9 }),
  F: def("F", "Reinforced or reduced", {
    kind: "choice",
    maxLength: 3,
    choices: [
      ["(+)", "Reinforced (+)"],
      ["(-)", "Reduced (-)"],
      ["(±)", "Reinforced and reduced (±)"]
    ]
  }),
  G: def("G", "Staff comments", { maxLength: 20 }),
  H: def("H", "Additional information", { maxLength: 20 }),
  J: def("J", "Evaluation rating", evaluationPattern),
  K: def("K", "Combat effectiveness", {
    kind: "choice",
    maxLength: 5,
    choices: effectivenessChoices
  }),
  L: def("L", "Signature equipment", {
    kind: "choice",
    maxLength: 1,
    choices: [["!", "! detectable electronic signature"]],
    hostileOnly: true
  }),
  M: def("M", "Higher formation", { maxLength: 21 }),
  N: def("N", "Hostile (enemy)", {
    kind: "choice",
    maxLength: 3,
    choices: [["ENY", "ENY"]],
    hostileOnly: true
  }),
  P: def("P", "IFF/SIF/AIS", { maxLength: 15 }),
  R2: def("R2", "SIGINT mobility", {
    kind: "choice",
    maxLength: 1,
    choices: [
      ["M", "Mobile"],
      ["S", "Static"],
      ["U", "Uncertain"]
    ]
  }),
  T: def("T", "Unique designation", { maxLength: 30 }),
  V: def("V", "Type", { maxLength: 24 }),
  W: def("W", "Date-time group", {
    maxLength: 16,
    pattern: DTG,
    patternText: "DDHHMM[SS]ZMONYY[YY] or O/O (5.3.7.7)"
  }),
  X: def("X", "Altitude/depth", { maxLength: 14 }),
  Y: def("Y", "Location", { maxLength: 22 }),
  Z: def("Z", "Speed", { maxLength: 8 }),
  AA: def("AA", "Special C2 headquarters", { maxLength: 9 }),
  AD: def("AD", "Platform type", { maxLength: 6 }),
  AE: def("AE", "Equipment teardown time", { maxLength: 3 }),
  AF: def("AF", "Common identifier", { maxLength: 12 }),
  AO: def("AO", "Engagement bar", { maxLength: 8 }),
  AQ: def("AQ", "Guarded unit", {
    kind: "choice",
    maxLength: 2,
    choices: [["BG", "BG"]]
  }),
  AR: def("AR", "Special designator", {
    kind: "choice",
    maxLength: 3,
    choices: designatorChoices
  }),
  AS: def("AS", "Country", countryPattern)
};

const FEINT = "01";
const ALL = "01234567";
const air = {
  source: "Figure C-3 PDF 167/151; Table C-II PDF 167-168/151-152",
  right: "T; P; V; Z X; G H",
  extra: "AO",
  hqTfDummy: FEINT
};
const seaSubsurface = {
  source: "Figure F-3 PDF 352/336; Table F-II PDF 352-353/336-337",
  left: "AR",
  right: "T; V; X; G; H",
  extra: "AO",
  hqTfDummy: FEINT,
  amplifiers: ["towedArray"]
};
const space = {
  source: "Figure B-3 PDF 153/137; Table B-II PDF 153-154/137-138",
  right: "T; V; Z X; G H",
  extra: "AO",
  hqTfDummy: FEINT
};
const landUnit = {
  source: "Figure D-4 PDF 190/174; Table D-III PDF 190-193/174-177",
  left: "W; X Y; T; Z",
  right: "F AS; G; H; M; J K P",
  inner: "AA",
  extra: "AO",
  // Table VII: AL is dashed for units and Figure D-4 has no AL cell.
  condition: false,
  hqTfDummy: ALL,
  amplifiers: ["echelon"]
};

export const std2525dProfile = buildProfile({
  id: "2525d",
  title: "MIL-STD-2525D",
  table: "Table VII PDF 38-41/22-25",
  statusTable: "Table A-VI PDF 70/54",
  hqTable: "Table A-VII PDF 70/54",
  hqAnnex: "A.5.4.5.1 PDF 70/54",
  amplifierTable: "Table A-VIII PDF 71/55",
  engagementTable: "Tables XII, XIII PDF 56-57/40-41",
  engagementError: app6dEngagementError,
  contexts: { digits: "012", table: "Table A-II PDF 67/51" },
  definitions: definitions,
  foreignKeys: [
    "auxiliaryEquipmentIndicator",
    "headquartersElement",
    "installationComposition",
    "installationCapacity",
    "networkIdentifier"
  ],
  setClass: {
    "01": "air",
    "02": "airMissile",
    "05": "space",
    "06": "spaceMissile",
    10: "landUnit",
    11: "landCivilian",
    15: "landEquipment",
    20: "landInstallation",
    30: "seaSurface",
    35: "seaSubsurface",
    36: "mineWarfare",
    40: "activities",
    50: "sigint",
    51: "sigint",
    52: "sigint",
    53: "sigint",
    54: "sigint",
    60: "cyberspace"
  },
  classes: {
    air: air,
    airMissile: air,
    space: space,
    spaceMissile: space,
    landUnit: landUnit,
    landCivilian: landUnit,
    landEquipment: {
      source: "Figure D-5 PDF 251/235; Table D-X PDF 251-253/235-237",
      left: "W AR; X Y; V AD AE; T; Z",
      right: "G AQ; H AF; J L N P",
      rightFrom: 2,
      top: "C",
      extra: "AO",
      hqTfDummy: FEINT,
      amplifiers: ["mobility", "towedArray"]
    },
    landInstallation: {
      source: "Figure D-6 PDF 296/280; Table D-XIV PDF 296-297/280-281",
      left: "W; X Y; T",
      leftFrom: 2,
      right: "G; H; J K P",
      rightFrom: 2,
      extra: "AO",
      // Table VII gives installations AJ and no Q, and Figure D-6 shows neither;
      // the renderer starts AJ from Q, so neither is offered (Decision D-INST).
      direction: false,
      speedLeader: false,
      hqTfDummy: "0123",
      amplifiers: ["echelon"],
      amplifierNote: {
        echelon:
          "Echelon on an installation: 5.3.7.1 PDF 42/26 uses it on installations; Table VII PDF 38/22 dashes B for them and Figure D-6 has no B cell"
      }
    },
    seaSurface: {
      source: "Figure E-2 PDF 326/310; Table E-II PDF 326-327/310-311",
      left: "AQ AR",
      right: "T; V; P; G H; Y Z",
      extra: "AO",
      hqTfDummy: FEINT,
      amplifiers: ["towedArray"],
      overrides: { P: { label: "Automatic identification system (AIS)" } }
    },
    seaSubsurface: seaSubsurface,
    // Table A-V PDF 69/53 binds Mine Warfare to the Sea Subsurface dimension.
    mineWarfare: seaSubsurface,
    activities: {
      source: "Figure G-2 PDF 378/362; Table G-II PDF 378-379/362-363",
      left: "W; Y",
      right: "AS; G; H; J",
      condition: false,
      hqTfDummy: ALL,
      amplifiers: ["echelon"]
    },
    // Table VII column SI: no figure places these fields. Product policy: the
    // Land Equipment order, with R2 in the first free right row.
    sigint: {
      source: "Table VII column SI PDF 38-41/22-25 (no placement figure)",
      left: "W; Y; V AD AE; T",
      right: "R2; G; H AF; M; J L",
      direction: false,
      speedLeader: false,
      condition: false,
      hqTfDummy: FEINT
    },
    cyberspace: {
      source: "Figure L-2 PDF 721/705; Table L-II PDF 721-722/705-706",
      left: "W; Y; T V",
      right: "F AS; G; H; M; K L",
      extra: "AO",
      direction: false,
      speedLeader: false,
      condition: false,
      hqTfDummy: ALL,
      amplifiers: ["echelon"]
    }
  }
});

export const std2525dFields = fieldTable(definitions);
