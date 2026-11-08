import { ms, app6a, app6b } from "../index.mjs";
import { collectTextModifiers } from "../studio/modifier-fields.js";
import { getApp6aFields } from "../src/lettersidc/metadata.js";

ms.reset();
ms.addIcons(app6a);
ms.addIcons(app6b);

const values = {
  quantity: "12",
  reinforcedReduced: "(+)",
  staffComments: "READY",
  evaluationRating: "A1",
  combatEffectiveness: "85%",
  altitudeDepth: "1500FT",
  speed: "30KM/H",
  specialHeadquarters: "NATO",
  unknownOption: "IGNORE"
};
const options = collectTextModifiers(values);
const legacySvg = new ms.Symbol("SFGPUCI--------", options).asSVG();
const app6aSidc = "SFGPUCI--------";
const app6aOptions = collectTextModifiers(
  { ...values, country: "TUR", engagementBar: "R:ENG-M" },
  getApp6aFields(app6aSidc).map((field) => field.key)
);
const app6aSymbol = new ms.Symbol(app6aSidc, {
  ...app6aOptions,
  standard: "APP6A"
});

export default {
  "Studio modifier controls": {
    "new amplifiers reach letter SVG exports": [
      ["12", "(+)", "READY", "A1/85%", "1500FT", "30KM/H", "NATO"].every(
        (value) => legacySvg.includes(value)
      ),
      true
    ],
    "APP-6A keeps only publication-applicable fields": [
      [app6aOptions.quantity, app6aOptions.country, app6aOptions.engagementBar],
      ["", "", ""]
    ],
    "APP-6A applicable modifiers remain valid": [app6aSymbol.isValid(), true],
    "reset values remove all text amplifiers": [
      Object.values(collectTextModifiers({})).every((value) => value === ""),
      true
    ],
    "does not pass unrelated options to renderer": [
      options.unknownOption,
      undefined
    ]
  }
};
