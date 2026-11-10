// The <text> elements of an SVG that milsymbol wrote, without a DOM: studio/app.js
// reads them with DOMParser, which Node does not have. milsymbol writes each one
// as <text attributes>escaped text</text> (src/ms/symbol/assvg.js).
const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

const decode = (text) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name) => {
    if (name[0] === "#")
      return String.fromCodePoint(name[1] === "x" || name[1] === "X" ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
    return entities[name.toLowerCase()] ?? whole;
  });

// [{ x, y, anchor, fontSize, middle, content }], as buildFieldLayout() reads them.
export function svgTexts(svg) {
  const texts = [];
  for (const [, attributes, body] of String(svg).matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    const attribute = (name) => {
      const match = new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(attributes);
      return match ? decode(match[1]) : null;
    };
    texts.push({
      x: Number(attribute("x")),
      y: Number(attribute("y")),
      anchor: attribute("text-anchor"),
      fontSize: Number(attribute("font-size")) || 40,
      middle: attribute("dominant-baseline") === "middle",
      content: decode(body.replace(/<[^>]*>/g, ""))
    });
  }
  return texts;
}
