// IWC is written into the bundle by webpack's DefinePlugin (webpack.config.js).
/* global IWC */
export const iwc = typeof IWC === "string" ? IWC : "hap";
