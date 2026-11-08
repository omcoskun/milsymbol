// APP-06 Edition E Version 2 amplifier profile for numeric SIDCs (version
// 13-16) rendered with the APP6 standard. See fieldtable.js.
//
// Sources (physical PDF page / printed page, printed = physical - 34):
//   1.2.3       alignment of amplifier fields        PDF 65 / 31
//   Figure 1-5  generic field locations              PDF 65 / 31
//   Table 1-5   fields, formats and lengths          PDF 66-88 / 32-54
//   Table A-1   versions                             PDF 747 / 713
//   Table A-2   context and identity                 PDF 748 / 714
//   Table A-7   HQ/task force/dummy                  PDF 752 / 718
//   Table A-8   amplifier                            PDF 753-754 / 719-720
// APP-6(E) has no per-class field tables: the figure of each chapter gives the
// fields of the class and Table 1-5 their format. A field a figure draws for a
// set that Table 1-5 does not list is accepted with a note, see
// docs/edition-modifiers.md.
import {
  buildProfile,
  def,
  designatorChoices,
  effectivenessChoices,
  evaluationPattern,
  fieldTable
} from "./fieldtable.js";
import { app6dEngagementError } from "./app6d.js";
import {
  DTG_E,
  compositionChoices,
  platformChoices,
  reinforcedOneCharacter
} from "./std2525e.js";

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
  // Table 1-5 PDF 69/35: "!" for equipment, with no hostile limit (unlike 2525).
  L: def("L", "Signature equipment", {
    kind: "choice",
    maxLength: 1,
    choices: [["!", "! detectable electromagnetic signature"]]
  }),
  M: def("M", "Higher formation", { maxLength: 21 }),
  N: def("N", "Hostile (enemy)", {
    kind: "choice",
    maxLength: 3,
    choices: [["ENY", "ENY"]],
    hostileOnly: true
  }),
  P: def("P", "IFF/SIF/AIS", { maxLength: 17 }),
  T: def("T", "Unique designation", { maxLength: 30 }),
  V: def("V", "Type of equipment", { maxLength: 24 }),
  W: def("W", "Date-time group", {
    maxLength: 16,
    minLength: 3,
    pattern: DTG_E,
    patternText: "DDHHMM[SS]ZMMMYYYY or O/O (Table 1-5)"
  }),
  X: def("X", "Altitude/depth", { maxLength: 14, minLength: 2 }),
  Y: def("Y", "Location", { maxLength: 22, minLength: 12 }),
  Z: def("Z", "Speed", { maxLength: 9, minLength: 5 }),
  AA: def("AA", "Named command and control headquarters", { maxLength: 9 }),
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
  AO: def("AO", "Engagement bar text", { maxLength: 10, minLength: 3 }),
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
  // Table 1-5 PDF 87/53 permits three alphanumeric characters. The
  // geographical entity code list is explicitly outside this standard.
  AS: def("AS", "Geographical entity", {
    maxLength: 3,
    minLength: 3,
    pattern: /^[A-Za-z0-9]{3}$/,
    patternText: "three alphanumeric characters"
  }),
  AT: def("AT", "Capacity of installation", { maxLength: 20 }),
  AW: def("AW", "Headquarters element", { maxLength: 8 }),
  AX: def("AX", "Installation composition", {
    kind: "choice",
    maxLength: 7,
    choices: compositionChoices
  }),
  AY: def("AY", "Network identifier", { maxLength: 40 })
};

// Table 1-5 PDF 82-84/48-50 writes MT for "MBE less than threshold"; 2525 and
// APP-6(D) write M<T.
function engagementError(value) {
  return app6dEngagementError(String(value).replace(/(^|:)MT(?=$|-)/, "$1M<T"));
}

const ALL = "01234567";
const air = {
  source: "Figure 2-2 PDF 119/85; Table 1-5 PDF 66-88/32-54",
  right: "T AS; P; V; Z X; G H",
  extra: "AO",
  direction: false
};
const space = {
  source: "Figure 6-2 PDF 389/355; Table 1-5 PDF 66-88/32-54",
  right: "T AS; V; Z X; G H",
  extra: "AO",
  direction: false
};
const landUnit = {
  source: "Figure 3-3 PDF 147/113; Table 1-5 PDF 66-88/32-54",
  left: "AR W; X Y; V AD AE; T; Z",
  right: "F AS; G; H AF; M; J K P",
  top: "C",
  inner: "AA",
  bottom: "AW",
  extra: "AO",
  speedLeader: false,
  hqTfDummy: ALL,
  amplifiers: ["echelon", "mobility"],
  notes: {
    AE: "AE on a Land Unit: Figure 3-3 PDF 147/113 draws V/AD/AE; Table 1-5 PDF 78/44 gives AE to sets 15, 60 and 64"
  }
};
const landEquipment = {
  source: "Figure 3-9 PDF 219/185; Table 1-5 PDF 66-88/32-54",
  left: "W; X Y; V AD AF; T; Z",
  right: "AS; G; H AE; M; J K L N P",
  top: "C",
  extra: "AO",
  speedLeader: false,
  hqTfDummy: "01",
  amplifiers: ["mobility"]
};

export const app6eProfile = buildProfile({
  id: "app6e",
  title: "APP-6(E)",
  table: "Table 1-5 PDF 66-88/32-54",
  statusTable: "Table A-6 PDF 752/718",
  hqTable: "Table A-7 PDF 752/718",
  hqAnnex: "A.9 item 2 PDF 753/719",
  amplifierTable: "Table A-8 PDF 753-754/719-720",
  engagementTable: "Table 1-5 PDF 82-85/48-51",
  engagementError: engagementError,
  contexts: {
    digits: "012345678",
    table: "Table A-2 PDF 748/714",
    notes: {
      1: "Context 1 Exercise is for US use only in this standard (Table A-2 note 1 PDF 748/714)",
      2: "Context 2 Simulation is for US use only in this standard (Table A-2 note 1 PDF 748/714)",
      5: "Context 5 Restricted Target - Exercise is for US use only (Table A-2 note 1 PDF 748/714)",
      6: "Context 6 No Strike Entity - Exercise is for US use only (Table A-2 note 1 PDF 748/714)",
      7: "Context 7 Restricted Target - Simulation is for US use only (Table A-2 note 1 PDF 748/714)",
      8: "Context 8 No Strike Entity - Simulation is for US use only (Table A-2 note 1 PDF 748/714)"
    }
  },
  definitions: definitions,
  foreignKeys: ["sigint", "auxiliaryEquipmentIndicator"],
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
    60: "cyberspace",
    64: "cyberspaceNonUnit"
  },
  classes: {
    air: air,
    airMissile: air,
    space: space,
    spaceMissile: space,
    landUnit: landUnit,
    landCivilian: landUnit,
    landEquipment: landEquipment,
    landInstallation: {
      source: "Figure 3-13 PDF 265/231; Table 1-5 PDF 66-88/32-54",
      left: "W; X Y; AX; T",
      right: "AS; G; H AE; M; J K AT",
      direction: false,
      speedLeader: false,
      hqTfDummy: "0123",
      amplifiers: ["mobility"],
      notes: {
        K: "K on an installation: Figure 3-13 PDF 265/231 draws J/K/AT; Table 1-5 PDF 69/35 does not list set 20",
        AE: "AE on an installation: Figure 3-13 PDF 265/231 draws H/AE; Table 1-5 PDF 78/44 gives AE to sets 15, 60 and 64"
      },
      amplifierNote: {
        mobility:
          "R on an installation: Table 1-5 PDF 71/37 lists set 20; Figure 3-13 PDF 265/231 has no R cell"
      }
    },
    dismountedIndividual: {
      source: "Figure 4-3 PDF 296/262; Table 1-5 PDF 66-88/32-54",
      left: "W; X Y; V AF; T; Z",
      right: "AS; G; H; M; J K P",
      bottom: "C",
      condition: false,
      speedLeader: false,
      hqTfDummy: "01",
      amplifiers: ["leadership", "mobility"],
      amplifierNote: {
        mobility:
          "R on a dismounted individual: Table 1-5 PDF 71/37 lists set 27; Figure 4-3 PDF 296/262 has no R cell"
      }
    },
    seaSurface: {
      source: "Figure 5-3 PDF 324/290; Table 1-5 PDF 66-88/32-54",
      left: "AQ AR",
      right: "T AS; V; P; G H; Y Z",
      extra: "AO",
      direction: false,
      amplifiers: ["towedArray"],
      overrides: { P: { label: "Automatic identification system (AIS)" } },
      amplifierNote: {
        towedArray:
          "Towed array: Table A-8 PDF 754/720 defines it; Table 1-5 PDF 79/45 keeps AG only to account for US values"
      }
    },
    seaSubsurface: {
      source: "Figure 5-6 PDF 355/321; Table 1-5 PDF 66-88/32-54",
      left: "AR",
      right: "T AS; V; P X; G H; Y Z",
      extra: "AO",
      direction: false,
      amplifiers: ["towedArray"],
      notes: {
        Y: "Y on a subsurface symbol: Figure 5-6 PDF 355/321 draws Y/Z; Table 1-5 PDF 76/42 does not list set 35"
      },
      amplifierNote: {
        towedArray:
          "Towed array: Table A-8 PDF 754/720 defines it; Table 1-5 PDF 79/45 keeps AG only to account for US values"
      }
    },
    // Table A-5 PDF 751/717 binds Mine Warfare to the Sea Subsurface dimension.
    mineWarfare: {
      source: "Table A-5 PDF 751/717; Figure 5-6 PDF 355/321",
      left: "AR",
      right: "T AS; V; P X; G H; Y Z",
      extra: "AO",
      direction: false
    },
    activities: {
      source: "Figure 7-2 PDF 403/369; Table 1-5 PDF 66-88/32-54",
      left: "W; Y; T",
      right: "AS; G; H; ; J",
      condition: false,
      speedLeader: false,
      hqTfDummy: "02",
      notes: {
        T: "T on an activity: Figure 7-2 PDF 403/369 draws T; Table 1-5 PDF 72/38 does not list set 40"
      }
    },
    cyberspace: {
      source: "Figure 9-2 PDF 713/679; Table 1-5 PDF 66-88/32-54",
      left: "AR W; Y; V AD AE; T; AY",
      right: "F AS; G; H AF; M; K L P",
      top: "C",
      inner: "AA",
      bottom: "AW",
      extra: "AO",
      direction: false,
      speedLeader: false,
      hqTfDummy: ALL,
      amplifiers: ["echelon"]
    },
    cyberspaceNonUnit: {
      source: "Figure 9-3 PDF 714/680; Table 1-5 PDF 66-88/32-54",
      left: "W; X Y; V AD AF; T; Z",
      right: "AS; G; H AE; M; J K L N P",
      top: "C",
      extra: "AO",
      speedLeader: false,
      hqTfDummy: "01",
      amplifiers: ["mobility"]
    }
  }
});

export const app6eFields = fieldTable(definitions);
