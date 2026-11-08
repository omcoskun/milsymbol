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

const frameContexts = { 3: "0", 4: "0", 5: "1", 6: "1", 7: "2", 8: "2" };
const marks = {
  3: "restricted target",
  4: "no-strike",
  5: "restricted target",
  6: "no-strike",
  7: "restricted target",
  8: "no-strike"
};

// The code the Studio hands to milsymbol; the SIDC box keeps the full code.
// - Edition D (versions 10-12) keeps the originator's country and symbol at
//   positions 21-30. Upstream reads 21-22 as modifier codes in every edition,
//   so a country would change the drawing; the core 20 digits are drawn.
// - Upstream knows edition E as versions 13 and 14 only. 15 (2525E Change 1)
//   and 16 (APP-6(E) version 2) are the same edition, drawn as 13 and 14.
// - Edition E contexts 3-8 are drawn in their frame context (frameContext).
export function drawingSidc(sidc) {
  const code = String(sidc);
  // Position 23 (frame shape) may be a letter, so only 1-2 must be digits.
  if (!/^\d\d/.test(code) || code.length < 20 || code.length > 30) return sidc;
  const version = code.slice(0, 2);
  if (["10", "11", "12"].includes(version)) return code.slice(0, 20);
  if (!["13", "14", "15", "16"].includes(version)) return code;
  const edition = { 15: "13", 16: "14" }[version] || version;
  // Contexts 3-8 keep the frame context of Table A-2: reality, exercise or
  // simulation. Upstream knows only 0-2; the marks are named by undrawnMark().
  return edition + frameContext(code[2]) + code.slice(3);
}

// Table A-2: an edition E context 3-8 is a reality, exercise or simulation
// context with a mark.
export function frameContext(context) {
  return frameContexts[context] || context;
}

// The restricted target or no-strike mark of an edition E context, which
// APP-6(E) draws and milsymbol does not. 2525E gives these contexts no mark.
export function undrawnMark(context) {
  return marks[context] || "";
}

// symbol is drawn from drawingSidc(sidc); sidc is the full code.
export function editionCheck(symbol, profile, sidc, options) {
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
