// The Studio's validity verdict. The library draws every edition except APP-6A
// as upstream milsymbol and does not apply these edition profiles, so the
// Studio adds the profile's verdict to the symbol's own isValid().
import { clearBlankText } from "./profiles/common.js";

const supportedVersions = ["10", "11", "12", "13", "14", "15", "16"];

// Upstream draws any two-digit version. The profiles know editions D (10-12)
// and E (13-16) only, so another version must not pass as checked.
function versionErrors(sidc) {
  const version = String(sidc).slice(0, 2);
  if (!/^\d\d$/.test(version) || supportedVersions.includes(version)) return [];
  return [
    `Position 1–2: version ${version} is not supported. Supported versions are 10–16.`
  ];
}

// Edition D (versions 10-12) keeps the originator's country and symbol at
// positions 21-30. Upstream reads 21-22 as modifier codes in every edition and
// then calls the icon invalid, so the core 20 digits decide the library verdict.
function libraryCheck(symbol, sidc) {
  const code = String(sidc);
  if (code.length <= 20 || !["10", "11", "12"].includes(code.slice(0, 2)))
    return symbol;
  return new symbol.constructor(symbol.options, symbol.style, {
    sidc: code.slice(0, 20)
  });
}

export function editionCheck(drawn, profile, sidc, options) {
  const symbol = libraryCheck(drawn, sidc);
  const sidcErrors = versionErrors(sidc);
  if (sidcErrors.length)
    return {
      valid: false,
      details: { ...symbol.isValid(true), sidcErrors }
    };
  if (!profile || profile.id === "app6a")
    return { valid: symbol.isValid(), details: symbol.isValid(true) };
  const copy = clearBlankText(Object.assign({}, options));
  const result = profile.validate(sidc, copy);
  return {
    valid: symbol.isValid() && result.valid,
    details: { ...symbol.isValid(true), ...result.details, profile: profile.id }
  };
}
