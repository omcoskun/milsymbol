import Box from "@mui/material/Box";

// SVG markup from milsymbol (or a glyph cut from it), drawn as it is.
export default function Svg({ svg, component = "span", ...props }) {
  return <Box component={component} dangerouslySetInnerHTML={{ __html: svg || "" }} {...props} />;
}

// Each flag is its own image: flag drawings reuse ids, which would clash inline.
const flagUrls = new Map();
export function FlagImage({ code, svg }) {
  if (!svg) return <Box component="span" className="flag-empty" />;
  if (!flagUrls.has(code)) flagUrls.set(code, URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })));
  return <img className="flag-image" src={flagUrls.get(code)} alt="" loading="lazy" />;
}
