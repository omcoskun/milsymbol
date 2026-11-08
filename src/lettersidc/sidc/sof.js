import { ms } from "../../ms.js";
import { metadata as metadata_letter } from "../metadata.js";
import { geticons as getIcons_letter } from "../geticons.js";
import icons from "../../iconparts/ground.js";
import icons_air from "../../iconparts/air.js";

export default {
  type: "letter",
  getMetadata: metadata_letter,
  getIcons: getIcons_letter,
  iconParts: [icons, icons_air],
  icons: function sof(sId, bbox, icn, _STD2525) {
    // SOF ===========================================================================
    sId["S-F-------"] = [icn["GR.IC.SPECIAL OPERATIONS FORCES"]];
    sId["S-F-A-----"] = [
      icn["AR.I.MILITARY ROTARY WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
    ];
    sId["S-F-AF----"] = [
      icn["AR.I.MILITARY FIXED WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
    ];
    sId["S-F-AFA---"] = [
      icn["AR.I.MILITARY FIXED WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["SOF.M2.ATTACK"],
    ];
    sId["S-F-AFK---"] = [
      icn["AR.I.MILITARY FIXED WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["SOF.M2.REFUEL"],
    ];
    sId["S-F-AFU---"] = [
      icn["AR.I.MILITARY FIXED WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["SOF.M2.UTILITY"],
    ];
    sId["S-F-AFUL--"] = [
      icn["AR.I.MILITARY FIXED WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["AIR.M2.LIGHT"],
    ];
    sId["S-F-AFUM--"] = [
      icn["AR.I.MILITARY FIXED WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["AIR.M2.MEDIUM"],
    ];
    sId["S-F-AFUH--"] = [
      icn["AR.I.MILITARY FIXED WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["AIR.M2.HEAVY"],
    ];
    sId["S-F-AV----"] = [
      icn["AR.I.MILITARY FIXED WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["SOF.M2.VSTOL"],
    ];
    sId["S-F-AH----"] = _STD2525
      ? [
          icn["GR.IC.AVIATION ROTARY WING"],
          icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
          icn["GR.IC.AVIATION ROTARY WING 2525C"],
        ]
      : [
          icn["GR.IC.AVIATION ROTARY WING"],
          icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
        ];
    sId["S-F-AHH---"] = [
      icn["GR.IC.AVIATION ROTARY WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["SOF.M2.COMBAT SEARCH AND RESCUE"],
    ];
    sId["S-F-AHA---"] = [
      icn["GR.IC.AVIATION ROTARY WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["SOF.M2.ATTACK"],
    ];
    sId["S-F-AHU---"] = [
      icn["GR.IC.AVIATION ROTARY WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["SOF.M2.UTILITY"],
    ];
    sId["S-F-AHUL--"] = [
      icn["GR.IC.AVIATION ROTARY WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["AIR.M2.LIGHT"],
    ];
    sId["S-F-AHUM--"] = [
      icn["GR.IC.AVIATION ROTARY WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["AIR.M2.MEDIUM"],
    ];
    sId["S-F-AHUH--"] = [
      icn["GR.IC.AVIATION ROTARY WING"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
      icn["AIR.M2.HEAVY"],
    ];
    sId["S-F-SN----"] = sId["S-F-N-----"] = [
      icn["GR.IC.NAVAL"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
    ];
    sId["S-F-SNS---"] = sId["S-F-NS----"] = [icn["GR.IC.SEA-AIR-LAND"]];
    sId["S-F-SNU---"] = sId["S-F-NU----"] = [
      icn["SOF.IC.UNDERWATER DEMOLITION TEAM"],
    ];
    sId["S-F-SNB---"] = sId["S-F-NB----"] = [
      icn["GR.IC.COMBATANT"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
    ];
    sId["S-F-SNN---"] = sId["S-F-NN----"] = [
      icn["GR.IC.SUBMARINE NUCLEAR PROPULSION"],
      icn["AIR.M1.SPECIAL OPERATIONS FORCES"],
    ];
    sId["S-F-G-----"] = [
      icn["GR.IC.FF.INFANTRY"],
      icn["GR.IC.SPECIAL OPERATIONS FORCES"],
    ];
    sId["S-F-GS----"] = [icn["GR.IC.SPECIAL FORCES"]];
    sId["S-F-GR----"] = sId["S-F-GSR---"] = [
      icn["GR.IC.FF.INFANTRY"],
      icn["AIR.M1.RECONNAISSANCE"],
      icn["GR.M2.AIRBORNE"],
    ];
    sId["S-F-GP----"] = sId["S-F-GSP---"] = [
      icn["GR.EQ.PSYCHOLOGICAL OPERATIONS EQUIPMENT"],
    ];
    sId["S-F-GPA---"] = sId["S-F-GSPA--"] = [
      icn["GR.EQ.PSYCHOLOGICAL OPERATIONS EQUIPMENT"],
      ms._translate(0, -30, ms._scale(0.7, icn["AR.I.MILITARY FIXED WING"])),
    ];
    sId["S-F-GC----"] = sId["S-F-GCA---"] = [icn["GR.IC.CIVIL AFFAIRS"]];
    sId["S-F-GB----"] = sId["S-F-B-----"] = [
      icn["GR.IC.SPECIAL OPERATIONS FORCES"],
      icn["GR.M2.SUPPORT"]
    ];
    if (this.metadata.app6a) {
      // Annex D, PDF p. 170: lower the anchor beneath SOF, lengthen its
      // shaft and retain the small upward flukes rather than broad arrows.
      sId["S-F-SN----"] = [
        {
          ...icn["GR.IC.NAVAL"][0],
          d: "M106,96 A6,6 0 1,1 94,96 A6,6 0 1,1 106,96 Z M80,104 H120 M100,102 V140",
          strokewidth: 1.5
        },
        {
          ...icn["GR.IC.NAVAL"][1],
          d: "M74,116 L79,123 V126 Q100,146 121,126 V123 L126,116 V129 Q100,153 74,129 Z",
          stroke: false
        },
        { ...icn["AIR.M1.SPECIAL OPERATIONS FORCES"], y: 74, fontsize: 27 }
      ];
      // Annex D, PDF p. 171: the hull stands clear below SOF: a tower on a
      // wide chamfered body, without an outline around it.
      const friend = this.metadata.affiliation === "Friend";
      const hull = friend ? 135 : 136;
      sId["S-F-SNN---"] = [
        {
          ...icn["GR.IC.SUBMARINE NUCLEAR PROPULSION"],
          d: `M78,87.5 H121.5 V101 L124.5,103 137.5,118 122,${hull} H78 L61.5,118 75,103 78,101 Z`,
          stroke: false
        },
        { ...icn["AIR.M1.SPECIAL OPERATIONS FORCES"], y: friend ? 76 : 74.7, fontsize: 28 }
      ];
      // Annex D retains the rotor mast and uses two equally sized support lines.
      sId["S-F-AH----"] = [
        {
          ...icn["GR.IC.AVIATION ROTARY WING"],
          d: "M60,80 100,100 140,80 V120 L100,100 60,120 Z"
        },
        { ...icn["AIR.M1.SPECIAL OPERATIONS FORCES"], y: 76 },
        {
          ...icn["GR.IC.AVIATION ROTARY WING"],
          d: "M100,100 V150",
          fill: false,
          stroke: icn["GR.IC.AVIATION ROTARY WING"].fill,
          strokewidth: 1.5
        }
      ];
      sId["S-F-GB----"] = [
        { ...icn["GR.IC.SPECIAL OPERATIONS FORCES"], y: 85, fontsize: 32 },
        { ...icn["GR.M2.SUPPORT"], y: 116, fontsize: 32 }
      ];
    }
  }
};
