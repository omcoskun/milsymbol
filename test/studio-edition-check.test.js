// The Studio's validity check: the library draws other editions as upstream,
// and the Studio adds the edition profile's verdict on top of isValid().
import {
  ms,
  app6a,
  app6b,
  std2525b,
  std2525c,
  app6d,
  std2525d,
  std2525e
} from "../index.mjs";
import { app6aProfile } from "../src/modifierprofiles/app6a.js";
import { std2525dProfile } from "../studio/profiles/std2525d.js";
import { editionCheck } from "../studio/edition-check.js";

ms.reset();
[app6a, app6b, std2525b, std2525c, app6d, std2525d, std2525e].forEach((set) =>
  ms.addIcons(set)
);
ms.setStandard("2525");

const land = "10031000001211000000";
const withQuantity = editionCheck(
  new ms.Symbol(land, { quantity: "200" }),
  std2525dProfile,
  land,
  { quantity: "200" }
);
const app6aSymbol = new ms.Symbol("SFGPUCI--------", { standard: "APP6A" });

export default {
  "Studio edition check": {
    "2525D land unit with a quantity is not valid": [withQuantity.valid, false],
    "the profile's error is in the details": [
      withQuantity.details.modifierErrors.some((m) =>
        m.startsWith("C quantity is not defined for landUnit")
      ),
      true
    ],
    "2525D land unit without a quantity is valid": [
      editionCheck(new ms.Symbol(land, {}), std2525dProfile, land, {}).valid,
      true
    ],
    "APP-6A keeps the library's verdict": [
      editionCheck(app6aSymbol, app6aProfile, "SFGPUCI--------", {}).valid,
      app6aSymbol.isValid()
    ]
  }
};
