// Field positions (Amplifiers tab) without the page: studio/app.js
// buildFieldLayout() as a function. Every applicable text field is a box where
// milsymbol draws its text, around the symbol drawn without text. A probe
// rendering with each field set to its "[code]" marker gives the rows. The
// component passes the room it has and a text measurer; the result says where
// each box goes, or that the boxes do not fit.
import { fieldValueChars, fitRowWidths, layoutFieldBoxes, placeholderOptions, readTextRows } from "../../../studio/editor-helpers.js";
import { svgTexts } from "./svg-text.js";

export const layoutScale = 38 / 40; // 38 px between two text rows of 40 symbol units
export const layoutMaxZoom = 1.3;

const svgViewBox = (svg) => {
  const [x, y, width, height] = (/viewBox="([^"]+)"/.exec(svg)?.[1] || "0 0 0 0").split(/[\s,]+/).map(Number);
  return { left: x * layoutScale, top: y * layoutScale, width: width * layoutScale, height: height * layoutScale };
};

// sidc, states, options and graphics as the store's view.layout gives them;
// draw(sidc, options) is a milsymbol Symbol; measure(text, code) is the width
// of a field name (code false) or code (code true); kindOf(definition) is
// "input", "select" or "open".
export function computeFieldLayout({ sidc, states, options, graphics, room, draw, measure, kindOf }) {
  const tags = placeholderOptions(states, {});
  const probe = draw(sidc, { ...options, ...tags.options, infoFields: true }).asSVG();
  const plain = draw(sidc, { ...options, infoFields: false }).asSVG();
  const rows = readTextRows(svgTexts(probe), tags.codes).map((row) => ({ ...row, x: row.x * layoutScale, y: row.y * layoutScale }));
  const symbol = svgViewBox(plain);
  const ends = rows.filter((row) => row.anchor === "end").map((row) => row.x);
  const starts = rows.filter((row) => row.anchor === "start").map((row) => row.x);
  const between = ends.length && starts.length ? Math.min(...starts) - Math.max(...ends) : symbol.width;
  const drawn = new Set(rows.flatMap((row) => row.keys));
  // Q and AJ are graphics with no box: they are listed, set in the list.
  const undrawn = [...states.filter((item) => !drawn.has(item.key)), ...graphics.map((item) => ({ ...item, graphic: true }))];
  // A box fits its code, the field's name and a usual value. chrome is all but
  // the text: padding, border, gaps, and the "now" button of W, the arrow of a
  // select or the chevron of a list link.
  const kinds = new Map(states.map((item) => [item.key, kindOf(item)]));
  const extra = { select: 18, open: 16, input: 0 };
  const chrome = (item) => 24 + measure(item.field, true) + extra[kinds.get(item.key)] + (item.key === "dtg" ? 28 : 0);
  const value = (item) => 7.2 * fieldValueChars(item);
  const named = Object.fromEntries(states.map((item) => [item.key, Math.ceil(chrome(item) + measure(item.label, false)) + 2]));
  const codeOnly = Object.fromEntries(states.map((item) => [item.key, Math.ceil(chrome(item) + value(item)) + 2]));
  const natural = Object.fromEntries(states.map((item) => [item.key, Math.max(named[item.key], codeOnly[item.key]) + 4]));
  const widths = fitRowWidths(rows, natural, { room, between, plain: codeOnly });
  if (!widths) return { fits: false, undrawn };
  const boxes = layoutFieldBoxes(rows, widths, { height: 30, gap: 8, center: 100 * layoutScale });
  const all = [symbol, ...boxes];
  const left = Math.min(...all.map((item) => item.left));
  const top = Math.min(...all.map((item) => item.top));
  const bounds = {
    left,
    top,
    width: Math.max(...all.map((item) => item.left + item.width)) - left,
    height: Math.max(...all.map((item) => item.top + item.height)) - top
  };
  if (bounds.width > room + 1) return { fits: false, undrawn };

  // Tab order: the left side, the middle, then the right side, top to bottom.
  const leftEdge = ends.length ? Math.max(...ends) : -Infinity;
  const rightEdge = starts.length ? Math.min(...starts) : Infinity;
  const column = (item) => (item.left + item.width <= leftEdge + 1 ? 0 : item.left >= rightEdge - 1 ? 2 : 1);
  const byKey = new Map(states.map((item) => [item.key, item]));
  const placed = [...boxes]
    .sort((a, b) => column(a) - column(b) || a.top - b.top || a.left - b.left)
    .map((item) => {
      const definition = byKey.get(item.key);
      // A box over the symbol is placed by its centre, so it can shrink to a
      // small target while empty.
      const middle = item.top + item.height / 2;
      const inside = column(item) === 1 && middle > symbol.top && middle < symbol.top + symbol.height;
      return {
        key: item.key,
        field: definition.field,
        label: definition.label,
        parts: Boolean(definition.parts),
        kind: kinds.get(item.key),
        inside,
        left: Math.round((inside ? item.left + item.width / 2 : item.left) - bounds.left),
        top: Math.round((inside ? middle : item.top) - bounds.top),
        width: item.width,
        // Without room for its whole name a box shows its code.
        placeholder: item.width >= named[item.key] ? definition.label : ""
      };
    });
  return {
    fits: true,
    width: Math.ceil(bounds.width),
    height: Math.ceil(bounds.height),
    // Spare room draws the whole layout larger, in steps of 5 %.
    zoom: Math.min(layoutMaxZoom, Math.max(1, Math.floor((room / bounds.width) * 20) / 20)),
    symbol: { svg: plain, left: Math.round(symbol.left - bounds.left), top: Math.round(symbol.top - bounds.top), width: symbol.width, height: symbol.height },
    boxes: placed,
    undrawn
  };
}
