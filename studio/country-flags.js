// Studio-only SVG extension. Flag artwork comes from the pinned, MIT-licensed
// flag-icons package at build time; never accept user-supplied SVG here.
export function createCountryFlagPart(flags) {
  const artwork = new Map(flags.map(({ code, svg }) => [code, svg]));
  let sequence = 0;
  return function countryFlagPart() {
    const code = this.options.countryFlag;
    const source = artwork.get(code);
    if (!source) return { pre: [], post: [] };

    // Namespace both definitions and references: EU, UK, and many complex flags
    // reuse paths and clipping. Different flags may coexist in the same page.
    const prefix = `studio-flag-${++sequence}-`;
    const vector = source
      .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
      .replace(/(href=")#([^"]+)"/g, (_, attr, id) => `${attr}#${prefix}${id}"`)
      .replace(/url\(#([^\)]+)\)/g, (_, id) => `url(#${prefix}${id})`);
    // Match the reference generator's 640 × 480 artwork at 0.09 scale.
    const width = 57.6;
    const height = 43.2;
    // The reference generator keeps the flag by the frame whatever the text says:
    // 20 units right of it, as the text rows start, and 10 up from its bottom.
    // The two rows beside it move right through the library's country_flag option.
    // A tactical graphic has no frame: its base geometry is one point, so the
    // flag goes by what has been drawn instead of on top of it.
    const base = this.metadata.baseGeometry.bbox;
    const frame = base.x2 > base.x1 || !(this.bbox.x2 > this.bbox.x1) ? base : this.bbox;
    const stack = this.options.stack ? this.options.stack * 15 : 0;
    const x = frame.x2 + 20 + stack;
    const y = frame.y2 - 10;
    const svg = vector.replace(
      /<svg\b/,
      `<svg data-country-flag="${code}" x="${x}" y="${y}" width="${width}" height="${height}"`
    );
    return {
      pre: [],
      post: [
        {
          type: "svg",
          svg: `${svg}<path d="M${x},${y}h${width}v${height}h-${width}Z" fill="none" stroke="#667788" stroke-width="0.75"/>`
        }
      ],
      bbox: { x1: x - 1, y1: y - 1, x2: x + width + 1, y2: y + height + 1 }
    };
  };
}
