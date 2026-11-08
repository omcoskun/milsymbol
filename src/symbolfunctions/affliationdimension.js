//Affiliation and dimension addons to base geometries ####################################
import strWidth from "./string-width.js";
export default function affliationdimension(ms) {
  const drawArray1 = [];
  const drawArray2 = [];
  let bbox = this.metadata.baseGeometry.bbox;
  const frameColor = this.colors.frameColor[this.metadata.affiliation];
  // APP-6A S symbols: the derived identity mark of Table I / field E.
  const app6aMarker = this.metadata.app6a ? this.metadata.affiliationMarker : null;
  let markerBbox = null;
  if (app6aMarker && app6aMarker.placement == "frame" && frameColor) {
    // Embedded in the frame (503.1a, Table I): centred without an icon,
    // otherwise in the free upper part of the frame so the icon stays intact.
    const frame = this.metadata.baseGeometry.bbox;
    const height = frame.y2 - frame.y1;
    const hasIcon =
      this.style.icon && !/^-*$/.test(this.metadata.functionid || "");
    drawArray2.push({
      type: "text",
      text: app6aMarker.text,
      x: 100,
      y: hasIcon ? frame.y1 + height * 0.25 : frame.y1 + height / 2,
      fill: frameColor,
      fontfamily: this.style.fontfamily,
      fontsize: hasIcon ? 35 : 60,
      fontweight: "bold",
      textanchor: "middle",
      alignmentBaseline: "middle"
    });
  } else if (
    app6aMarker &&
    app6aMarker.placement == "field" &&
    !this.style.infoFields &&
    bbox.x2
  ) {
    // Field E, first of row E/F (Figure 2a). With text fields on, the text
    // layout draws it in front of field F instead; never both.
    const fontSize = this.style.infoSize;
    const stack = this.options.stack ? this.options.stack * 15 : 0;
    drawArray2.push({
      type: "text",
      text: app6aMarker.text,
      x: bbox.x2 + 20 + stack,
      y: 100 - 1.5 * fontSize,
      fill:
        (typeof this.style.infoColor === "object"
          ? this.style.infoColor[this.metadata.affiliation]
          : this.style.infoColor) ||
        this.colors.iconColor[this.metadata.affiliation] ||
        this.colors.iconColor["Friend"],
      fontfamily: this.style.fontfamily,
      fontsize: fontSize,
      stroke: false,
      textanchor: "start"
    });
    markerBbox = {
      x2: bbox.x2 + strWidth(app6aMarker.text, fontSize, 20 + stack),
      y1: 100 - 2.5 * fontSize
    };
  }
  //Draws the a question mark for some unknown or other dimension symbols
  if (this.metadata.dimensionUnknown && frameColor) {
    drawArray2.push({
      type: "text",
      text: "?",
      x: 100,
      y: 127,
      fill: frameColor,
      fontfamily: this.style.fontfamily,
      fontsize: 80,
      fontweight: "bold",
      textanchor: "middle"
    });
  }
  //If we don't have a geometry we shouldn't add anything.
  if (this.metadata.baseGeometry.g && frameColor) {
    let spacing = 10;
    if (
      this.metadata.affiliation == "Unknown" ||
      (this.metadata.affiliation == "Hostile" &&
        this.metadata.dimension != "Subsurface")
    ) {
      spacing = -10;
    }
    if (this.metadata.context == "Exercise") {
      if (!(this.metadata.joker || this.metadata.faker)) {
        drawArray2.push({
          type: "text",
          text: "X",
          x: bbox.x2 + spacing,
          y: 50,
          fill: frameColor,
          fontfamily: this.style.fontfamily,
          fontsize: 35,
          fontweight: "bold",
          textanchor: "start",
          alignmentBaseline: "middle"
        });
      }
      if (this.metadata.joker) {
        drawArray2.push({
          type: "text",
          text: "J",
          x: bbox.x2 + spacing,
          y: 40,
          fill: frameColor,
          fontfamily: this.style.fontfamily,
          fontsize: 35,
          fontweight: "bold",
          textanchor: "start",
          alignmentBaseline: "middle"
        });
      }
      if (this.metadata.faker) {
        drawArray2.push({
          type: "text",
          text: "K",
          x: bbox.x2 + spacing,
          y: 40,
          fill: frameColor,
          fontfamily: this.style.fontfamily,
          fontsize: 35,
          fontweight: "bold",
          textanchor: "start",
          alignmentBaseline: "middle"
        });
      }
      bbox = { x2: bbox.x2 + spacing + 22, y1: 40 - 25 };
    }
    // APP-6A Table I: uncertainty is a question mark, not a dashed present frame.
    // (S symbols use the profile marker above; G points keep this mark.)
    if (
      this.metadata.app6a &&
      this.options.sidc[0] !== "S" &&
      ["P", "A", "S"].includes(this.options.sidc[1])
    ) {
      drawArray2.push({ type: "text", text: "?", x: bbox.x2 + spacing, y: 40,
        fill: frameColor, fontfamily: this.style.fontfamily, fontsize: 35,
        fontweight: "bold", textanchor: "start", alignmentBaseline: "middle" });
      bbox = { x2: bbox.x2 + spacing + 22, y1: 15 };
    }
    if (this.metadata.context == "Simulation") {
      drawArray2.push({
        type: "text",
        text: "S",
        x: bbox.x2 + spacing,
        y: 40,
        fill: frameColor,
        fontfamily: this.style.fontfamily,
        fontsize: 35,
        fontweight: "bold",
        textanchor: "start",
        alignmentBaseline: "middle"
      });
      bbox = new ms.BBox({ x2: bbox.x2 + spacing + 22, y1: 40 - 25 });
    }
  }
  //outline
  if (this.style.outlineWidth > 0)
    drawArray1.push(
      ms.outline(
        drawArray2,
        this.style.outlineWidth,
        this.style.strokeWidth,
        typeof this.style.outlineColor === "object"
          ? this.style.outlineColor[this.metadata.affiliation]
          : this.style.outlineColor
      )
    );
  return { pre: drawArray1, post: drawArray2, bbox: markerBbox || bbox };
}
