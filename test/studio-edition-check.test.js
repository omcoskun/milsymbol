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
import {
  editionCheck,
  drawingSidc,
  undrawnMark
} from "../studio/edition-check.js";
import {
  placeholderOptions,
  undrawnFieldKeys
} from "../studio/editor-helpers.js";

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
    new ms.Symbol(drawingSidc(withCountry), { standard }),
    profile,
    withCountry,
    {}
  );
// What the Studio draws for a code, as milsymbol renders it.
const drawn = (sidc, standard) =>
  new ms.Symbol(drawingSidc(sidc), { standard }).asSVG();
const plain = (sidc, standard) => new ms.Symbol(sidc, { standard }).asSVG();
// Sector 1 modifier 01 and land equipment show the tail most: upstream builds
// modifier keys from 21-22 and scales equipment icons when one is set.
const unitWithModifier = "10031000001211000100";
const equipment = "10031500001101000000";
// Frame shape is position 23; A is Sea Surface.
const shape = (version, code) =>
  version + "031000001211000000" + "00" + code + "0000000";
// Text fields a probe rendering of the 2525D land unit draws: T and AS asked.
const probeStates = [
  { key: "uniqueDesignation", field: "T", available: true },
  { key: "country", field: "AS", available: true }
];
const probeTexts = [
  ...new ms.Symbol(land, {
    standard: "2525",
    ...placeholderOptions(probeStates, {}).options
  })
    .asSVG()
    .matchAll(/<text[^>]*>([^<]*)<\/text>/g)
].map((match) => match[1]);
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
    "the Studio draws a 2525D unit with a country as its 20-digit core": [
      drawn(unitWithModifier + "7920000000", "2525"),
      plain(unitWithModifier, "2525")
    ],
    "the Studio draws APP-6D equipment with a country as its core": [
      drawn(equipment + "7920000000", "APP6"),
      plain(equipment, "APP6")
    ],
    "APP-6E version 16 draws the Sea Surface frame shape": [
      drawn(shape("16", "A"), "APP6") === drawn(shape("16", "0"), "APP6"),
      false
    ],
    "APP-6E version 16 draws as version 14": [
      drawn(shape("16", "A"), "APP6"),
      plain(shape("14", "A"), "APP6")
    ],
    "2525E version 15 draws as version 13": [
      drawn(shape("15", "A"), "2525"),
      plain(shape("13", "A"), "2525")
    ],
    "edition E context 5 draws the exercise frame of context 1": [
      drawn("13531000001211000000", "2525"),
      plain("13131000001211000000", "2525")
    ],
    "edition E context 4 draws as reality": [
      drawn("13431000001211000000", "2525"),
      plain("13031000001211000000", "2525")
    ],
    "an edition D code keeps a reserved context": [
      drawingSidc("10531000001211000000"),
      "10531000001211000000"
    ],
    "the missing marks are named": [
      ["3", "4", "5", "6", "7", "8", "1"].map(undrawnMark),
      [
        "restricted target",
        "no-strike",
        "restricted target",
        "no-strike",
        "restricted target",
        "no-strike",
        ""
      ]
    ],
    "AS on a 2525D land unit is a field milsymbol does not draw": [
      undrawnFieldKeys(probeStates, probeTexts),
      ["country"]
    ],
    "the SIDC the Studio keeps is not changed": [
      drawingSidc("SFGPUCI---*****"),
      "SFGPUCI---*****"
    ],
    "APP-6A keeps the library's verdict": [
      editionCheck(app6aSymbol, app6aProfile, "SFGPUCI--------", {}).valid,
      app6aSymbol.isValid()
    ]
  }
};
