import { metadata as metadata_letter } from "../metadata.js";
import { geticons as getIcons_letter } from "../geticons.js";
import icons from "../../iconparts/space.js";
import { ms } from "../../ms.js";

export default {
  type: "letter",
  getMetadata: metadata_letter,
  getIcons: getIcons_letter,
  iconParts: [icons],
  icons: function space(sId, bbox, icn, _STD2525) {
    // SPACE =========================================================================
    sId["S-P-------"] = [];
    sId["S-P-S-----"] = [icn["SP.I.FF.SATELLITE"]];
    sId["S-P-V-----"] = [icn["SP.I.FF.CREWED SPACE VEHICLE"]];
    sId["S-P-T-----"] = [icn["SP.I.FF.SPACE STATION"]];
    if (this.metadata.app6a) {
      sId["S-P-T-----"] = [
        ms._translate(0, -15, ms._scale(1.08, icn["SP.I.FF.SPACE STATION"]))
      ];
    }
    sId["S-P-L-----"] = [icn["SP.I.SPACE LAUNCH VEHICLE"]];
  },
};
