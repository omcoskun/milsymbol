// The Studio's validity verdict. The library draws every edition except APP-6A
// as upstream milsymbol and does not apply these edition profiles, so the
// Studio adds the profile's verdict to the symbol's own isValid().
import { clearBlankText } from "./profiles/common.js";

export function editionCheck(symbol, profile, sidc, options) {
  if (!profile || profile.id === "app6a")
    return { valid: symbol.isValid(), details: symbol.isValid(true) };
  const copy = clearBlankText(Object.assign({}, options));
  const result = profile.validate(sidc, copy);
  return {
    valid: symbol.isValid() && result.valid,
    details: { ...symbol.isValid(true), ...result.details, profile: profile.id }
  };
}
