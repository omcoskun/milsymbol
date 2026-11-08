// MIL-STD-2525E Change 1 amplifier profile for numeric SIDCs (version 13-16)
// rendered with the 2525 standard. See fieldtable.js.
//
// Sources (physical PDF page / printed page, printed = physical - 17):
//   5.3.7       alignment and order of amplifier fields  PDF 38 / 21
//   Figure 13   generic field locations                  PDF 38 / 21
//   Table VI    fields, formats and lengths              PDF 39-48 / 22-31
//   Table A-I   versions                                 PDF 76 / 59
//   Table A-II  context and identity                     PDF 76-77 / 59-60
//   Table A-VII HQ/task force/dummy                      PDF 79 / 62
//   Table A-VIII amplifying descriptor                   PDF 80-81 / 63-64
// The figure of the class decides where a field goes. Table VI lists some
// fields for a symbol set that no figure places, and figures show some fields
// Table VI does not give the set. Both are accepted with a note; each case is
// listed in docs/edition-modifiers.md.
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

export const DTG_E = /^(O\/O|[0-9]{6}([0-9]{2})?[A-Za-z][A-Za-z]{3}[0-9]{4})$/;
export const reinforcedOneCharacter = {
  kind: "choice",
  choices: [
    ["+", "Reinforced (+)"],
    ["-", "Reduced (-)"],
    ["±", "Reinforced and reduced (±)"]
  ],
  alternates: ["(+)", "(-)", "(±)"]
};
export const compositionChoices = [
  ["DEVELOP", "Development"],
  ["RSRCH", "Research"],
  ["PROD", "Production"],
  ["SVC", "Service"],
  ["STORE", "Storage"],
  ["UTIL", "Utility"]
];
export const platformChoices = [
  ["ELNOT", "ELNOT"],
  ["CENOT", "CENOT"]
];

const definitions = {
  C: def("C", "Quantity", { maxLength: 19 }),
  F: def("F", "Reinforced or reduced", reinforcedOneCharacter),
  G: def("G", "Staff comments", { maxLength: 20 }),
  H: def("H", "Additional information", { maxLength: 20 }),
  J: def("J", "Evaluation rating", evaluationPattern),
  K: def("K", "Combat effectiveness", {
    kind: "choice",
    maxLength: 3,
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
    hostileOnly: true,
    note: "N Hostile: Table VI PDF 40/23 sets it from SIDC position 4 for set 15; Figure E-4 PDF 266/249 has no N cell, so it keeps the 2525D place after L (Decision E-N)"
  }),
  P: def("P", "IFF/SIF/AIS"),
  T: def("T", "Unique designation", { maxLength: 30 }),
  V: def("V", "Type", { maxLength: 24 }),
  W: def("W", "Date-time group", {
    maxLength: 16,
    minLength: 3,
    pattern: DTG_E,
    patternText: "DDHHMM[SS]ZMONYYYY or O/O (Table VI)"
  }),
  X: def("X", "Altitude/depth", { maxLength: 16, minLength: 3 }),
  // Table VI PDF 44/27 says {3,16}; the format example of Table E-II PDF
  // 214/197 has 22 characters. The example stays valid (Decision E-Y).
  Y: def("Y", "Location", { maxLength: 22, minLength: 3 }),
  Z: def("Z", "Speed", { maxLength: 9, minLength: 5 }),
  AA: def("AA", "Special C2 headquarters", { maxLength: 9 }),
  AD: def("AD", "Platform type", {
    kind: "choice",
    maxLength: 5,
    choices: platformChoices
  }),
  AE: def("AE", "Equipment teardown time", {
    maxLength: 3,
    pattern: /^[0-9]{1,3}$/,
    patternText: "minutes, one to three digits"
  }),
  AF: def("AF", "Common identifier", { maxLength: 12 }),
  AO: def("AO", "Engagement bar", { maxLength: 10, minLength: 3 }),
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
  AS: def("AS", "Country", countryPattern),
  AW: def("AW", "Headquarters element", { maxLength: 8 }),
  AX: def("AX", "Installation composition", {
    kind: "choice",
    maxLength: 7,
    choices: compositionChoices
  })
};

const FEINT = "01";
const ALL = "01234567";
const RESTRICTED_NOTE =
  "Table A-II PDF 76/59 defines this context but 2525E gives it no graphic; the frame is drawn in its Reality, Exercise or Simulation form";
const airLike = (source) => ({
  source: source,
  left: "W; AR; AD",
  right: "AS; T Y; V AF; P X Z; G H J",
  top: "C",
  extra: "AO",
  direction: false,
  hqTfDummy: FEINT,
  amplifiers: ["echelon"],
  amplifierNote: {
    echelon:
      "Echelon: Table VI PDF 39/22 gives B to sets 10, 25 and 60; the figure and field table of this class also list it"
  }
});
const air = airLike("Figure D-3 PDF 192/175; Table D-II PDF 192-194/175-177");
const space = airLike("Figure C-2 PDF 176/159; Table C-II PDF 176-178/159-161");
const landUnit = {
  source: "Figure E-3 PDF 212/195; Table E-II PDF 213-215/196-198",
  left: "W AR; X Y; V AD AE; C T; Z",
  right: "F AS; G AQ; H AF; M; J K L P",
  inner: "AA",
  bottom: "AW",
  extra: "AO",
  speedLeader: false,
  hqTfDummy: ALL,
  amplifiers: ["echelon", "mobility"],
  notes: {
    AR: "AR on a Land Unit: Table VI PDF 47/30 lists set 10, Figure E-3 PDF 212/195 has no AR cell; it joins W as in Figure D-5 of 2525D and Figure 3-3 of APP-6(E) (Decision E-AR)",
    AW: "AW Headquarters element: Table VI PDF 47/30 lists set 10, Figure E-3 PDF 212/195 has no AW cell; it is drawn in the bottom field of Figure 13 (Decision E-AW)"
  }
};

export const std2525eProfile = buildProfile({
  id: "2525e",
  title: "MIL-STD-2525E",
  table: "Table VI PDF 39-48/22-31",
  statusTable: "Table A-VI PDF 79/62",
  hqTable: "Table A-VII PDF 79/62",
  hqAnnex: "A.5.3.5.1 PDF 80/63",
  amplifierTable: "Table A-VIII PDF 80-81/63-64",
  engagementTable: "Tables XII, XIII PDF 63-64/46-47",
  engagementError: app6dEngagementError,
  contexts: {
    digits: "012345678",
    table: "Table A-II PDF 76-77/59-60",
    notes: {
      3: RESTRICTED_NOTE,
      4: RESTRICTED_NOTE,
      5: RESTRICTED_NOTE,
      6: RESTRICTED_NOTE,
      7: RESTRICTED_NOTE,
      8: RESTRICTED_NOTE
    }
  },
  definitions: definitions,
  foreignKeys: [
    "sigint",
    "auxiliaryEquipmentIndicator",
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
    27: "dismountedIndividual",
    30: "seaSurface",
    35: "seaSubsurface",
    36: "mineWarfare",
    40: "activities",
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
      source: "Figure E-4 PDF 266/249; Table E-IX PDF 266-268/249-251",
      left: "W; X Y; V AD AE; C T; Z",
      right: "AS; G AQ; H AF; J K L N P",
      extra: "AO",
      speedLeader: false,
      hqTfDummy: FEINT,
      amplifiers: ["mobility", "towedArray"]
    },
    landInstallation: {
      source: "Figure E-5 PDF 300/283; Table E-XIII PDF 300-302/283-285",
      left: "W; X Y; C AE AX; T",
      right: "AS; G AQ; H; M; J K P",
      inner: "AA",
      direction: false,
      speedLeader: false,
      hqTfDummy: "0123",
      amplifiers: ["echelon"],
      notes: {
        AA: "AA on an installation: Figure E-5 PDF 300/283 draws A/AA; Table VI PDF 45/28 gives AA to set 10 only",
        AX: "AX Installation composition: Table VI PDF 47/30 lists set 20, Figure E-5 PDF 300/283 has no AX cell; it joins C/AE, the row AX has in Figure 3-13 of APP-6(E) (Decision E-AX)"
      },
      amplifierNote: {
        echelon:
          "Echelon on an installation: Table VI PDF 39/22 gives B to sets 10, 25 and 60 and Figure E-5 has no B cell"
      }
    },
    dismountedIndividual: {
      source: "Figure F-2 PDF 329/312; Table F-II PDF 329-331/312-314",
      left: "W; X Y; V AF; T; Z",
      right: "AS; G; H; M; J K P",
      bottom: "C",
      condition: false,
      speedLeader: false,
      hqTfDummy: FEINT,
      amplifiers: ["leadership"],
      notes: {
        C: "C on a dismounted individual: Table VI PDF 39/22 lists set 27, Figure F-2 PDF 329/312 has no C cell; it stays below the frame as in Figure 4-3 of APP-6(E)"
      }
    },
    seaSurface: {
      source: "Figure G-2 PDF 346/329; Table G-II PDF 346-348/329-331",
      left: "AQ AR",
      leftFrom: 0,
      right: "AS; T; V; P; G H; Y Z",
      rightFrom: 0,
      extra: "AO",
      direction: false,
      hqTfDummy: FEINT,
      amplifiers: ["towedArray"],
      overrides: { P: { label: "Automatic identification system (AIS)" } }
    },
    seaSubsurface: {
      source: "Figure H-3 PDF 368/351; Table H-II PDF 368-369/351-352",
      left: "AR; X",
      leftFrom: 0,
      right: "AS; T; V; P; G H; Y Z",
      rightFrom: 0,
      extra: "AO",
      direction: false,
      hqTfDummy: FEINT,
      amplifiers: ["towedArray"],
      overrides: { X: { label: "Depth" } }
    },
    // 5.3.7 PDF 38/21 and Table VI note 1 PDF 48/31: "Mine Warfare (MIW)
    // symbols do not use amplifiers."
    mineWarfare: {
      source: "5.3.7 PDF 38/21 (mine warfare symbols use no amplifiers)",
      condition: false,
      direction: false,
      speedLeader: false,
      hqTfDummy: FEINT
    },
    activities: {
      source: "Figure I-2 PDF 390/373; Table I-II PDF 390-391/373-374",
      left: "W; Y; ; C",
      right: "AS; T; G; H; J",
      condition: false,
      hqTfDummy: FEINT
    },
    cyberspace: {
      source: "Figure K-2 PDF 432/415; Table K-II PDF 432-433/415-416",
      left: "W; Y; V; T",
      right: "F AS; G; H; M; K L",
      extra: "AO",
      condition: false,
      direction: false,
      speedLeader: false,
      hqTfDummy: ALL,
      amplifiers: ["echelon"]
    }
  }
});

export const std2525eFields = fieldTable(definitions);
