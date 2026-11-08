import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";

import ms from "milsymbol";

const sidc = "SFGPUCI----K---";

test("the ESM default export is the full registry with APP-6A", () => {
  assert.equal(typeof ms.Symbol, "function");
  assert.equal(new ms.Symbol(sidc).isValid(), true);
  const standard = ms._STD2525 ? "2525" : "APP6";
  try {
    assert.equal(ms.setStandard("APP6A"), true);
    assert.equal(new ms.Symbol(sidc).getMetadata().app6a, true);
  } finally {
    ms.setStandard(standard);
  }
});

test("CommonJS keeps the direct registry API", () => {
  const commonjs = createRequire(import.meta.url)("milsymbol");
  assert.equal(typeof commonjs.Symbol, "function");
  assert.equal(commonjs.default, undefined);
  assert.equal(new commonjs.Symbol(sidc).isValid(), true);
});

test("the browser UMD bundle keeps the direct ms global", () => {
  const browser = { console: { info() {} } };
  vm.runInNewContext(
    readFileSync(
      new URL("../dist/milsymbol.development.js", import.meta.url),
      "utf8"
    ),
    browser
  );
  assert.equal(typeof browser.ms.Symbol, "function");
  assert.equal(browser.ms.default, undefined);
  assert.equal(new browser.ms.Symbol(sidc).isValid(), true);
});
