import { ms, app6b } from "../index.mjs";
import { createCountryFlagPart } from "../studio/country-flags.js";

ms.reset();
ms.addIcons(app6b);
ms.setStandard("APP6");
ms.addSymbolPart(
  createCountryFlagPart([{ code: "tr", svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"></svg>' }])
);

// Where the flag starts, and how far right the symbol reaches without it.
function flagAndSymbol(sidc) {
  const flagged = new ms.Symbol(sidc, { countryFlag: "tr" }).asSVG();
  const flagX = Number(/data-country-flag="tr" x="([-\d.]+)"/.exec(flagged)[1]);
  const plain = new ms.Symbol(sidc).bbox;
  return { flagX, right: plain.x2 };
}

const framed = flagAndSymbol("SFGPUCI--------");
// A tactical graphic has no frame: its base geometry is the point 100,100.
const frameless = flagAndSymbol("GFCPBOAIH------");

const result = {
  "The flag sits 20 units right of the frame": [Math.round(framed.flagX - framed.right), 20],
  "The flag clears a symbol that has no frame": [frameless.flagX >= frameless.right, true]
};

ms.reset();

export default result;
