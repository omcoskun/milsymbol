// A restored draft value as the vanilla editor's inputs would hold it. Vanilla
// writes each saved value into its <input>, and the browser cleans it up
// (HTML "value sanitization algorithm"): ranges are clamped and snapped to their
// step, numbers that do not parse become empty, colors become lowercase #rrggbb,
// one-line text loses its line breaks. The React store holds no inputs, so it
// applies the same rules itself.

// The range and number inputs of studio/index.html.
export const rangeControls = {
  direction: { min: -1, max: 360, step: 1 },
  symbolSize: { min: 55, max: 170, step: 1 },
  strokeWidth: { min: 1, max: 8, step: 0.5 },
  fillOpacity: { min: 10, max: 100, step: 5 },
  infoSize: { min: 20, max: 80, step: 2 },
  outlineWidth: { min: 1, max: 20, step: 1 }
};
export const numberControls = new Set(["hqStaffLength", "speedLeader"]);
export const colorControls = new Set(["fillColor", "monoColor", "modifierColor", "infoColor", "infoBackground", "outlineColor"]);

// HTML "valid floating-point number".
const floatPattern = /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][-+]?\d+)?$/;

export function sanitizeRange(value, { min, max, step }) {
  // A value that does not parse takes the range's default: halfway.
  let number = floatPattern.test(value) ? Number(value) : min + (max - min) / 2;
  number = Math.min(max, Math.max(min, number));
  // Snap to the step counted from min; a tie goes up, but not past max.
  const steps = (number - min) / step;
  let snapped = Math.floor(steps + 0.5);
  if (min + snapped * step > max) snapped = Math.floor((max - min) / step);
  number = min + snapped * step;
  // Decimal steps (0.5) stay exact; drop float noise such as 4.499999.
  return String(Number(number.toFixed(10)));
}

// #rrggbb and #rgb, as current Chrome reads them. Chrome also takes CSS color
// names and rgb(); older browsers do not, and the editor only ever saves
// #rrggbb, so those fall back to black like any other unreadable value.
export function sanitizeColor(value) {
  const color = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(color)) return color;
  if (/^#[0-9a-f]{3}$/.test(color)) return `#${[...color.slice(1)].map((digit) => digit + digit).join("")}`;
  return "#000000";
}

export function sanitizeControl(id, value, { textIds = new Set() } = {}) {
  const raw = String(value);
  if (rangeControls[id]) return sanitizeRange(raw, rangeControls[id]);
  if (numberControls.has(id)) return floatPattern.test(raw) ? raw : "";
  if (colorControls.has(id)) return sanitizeColor(raw);
  if (id === "sidcInput") return raw.replace(/\r\n?/g, "\n");
  if (textIds.has(id)) return raw.replace(/[\r\n]/g, "");
  return raw;
}
