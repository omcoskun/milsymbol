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
import { std2525eProfile } from "../studio/profiles/std2525e.js";
import { app6dProfile } from "../studio/profiles/app6d.js";
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
// Edition D keeps the originator country at positions 21-23 (792 Türkiye).
// Upstream reads 21-22 as modifier codes in every edition and calls the icon
// invalid, though it draws the symbol as it does without the tail.
const withCountry = "10031000001211000000" + "7920000000";
const countryCheck = (profile, standard) =>
  editionCheck(
    new ms.Symbol(withCountry, { standard }),
    profile,
    withCountry,
    {}
  );
// The library draws any two-digit version as upstream does; only 10-16 are
// editions the Studio's profiles know.
const unknownVersion = "99031000001211000000";
const unknownCheck = editionCheck(
  new ms.Symbol(unknownVersion, {}),
  std2525eProfile,
  unknownVersion,
  {}
);

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
    "a numeric SIDC with version 99 is not valid": [unknownCheck.valid, false],
    "the unknown version is named in the SIDC errors": [
      unknownCheck.details.sidcErrors,
      [
        "Position 1–2: version 99 is not supported. Supported versions are 10–16."
      ]
    ],
    "version 13 is still valid": [
      editionCheck(
        new ms.Symbol("13031000001211000000", {}),
        std2525eProfile,
        "13031000001211000000",
        {}
      ).valid,
      true
    ],
    "an APP-6D symbol with an originator country is valid": [
      countryCheck(app6dProfile, "APP6").valid,
      true
    ],
    "a 2525D symbol with an originator country is valid": [
      countryCheck(std2525dProfile, "2525").valid,
      true
    ],
    "edition E still reads 21-22 as modifier codes": [
      editionCheck(
        new ms.Symbol("13031000001211000000" + "7900000000", {}),
        std2525eProfile,
        "13031000001211000000" + "7900000000",
        {}
      ).valid,
      false
    ],
    "APP-6A keeps the library's verdict": [
      editionCheck(app6aSymbol, app6aProfile, "SFGPUCI--------", {}).valid,
      app6aSymbol.isValid()
    ]
  }
};
