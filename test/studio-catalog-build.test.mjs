import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { test } from "node:test";

// A profile copy left by a build from before the profiles moved to the Studio.
mkdirSync("dist/studio-public/vendor/modifierprofiles", { recursive: true });
writeFileSync("dist/studio-public/vendor/modifierprofiles/app6d.js", "// stale\n");
// The public site's real catalog, built as the deploy workflow builds it.
execFileSync(process.execPath, ["scripts/build-studio.mjs", "--public"], { stdio: "pipe" });
const catalog = JSON.parse(readFileSync("dist/studio-public/catalog.json", "utf8"));
const editions = Object.entries(catalog.standards);

test("every palette row of every edition has its own id", () => {
  for (const [edition, { icons }] of editions) {
    const repeated = icons.map((icon) => icon.id).filter((id, index, ids) => ids.indexOf(id) !== index);
    assert.deepEqual(repeated, [], edition);
  }
});

test("every function code fills the six positions of its SIDC", () => {
  for (const [edition, { icons }] of editions) {
    assert.deepEqual(icons.filter((icon) => icon.code.length !== 6).map((icon) => icon.id), [], edition);
  }
});

test("rows that share a code keep it and say so", () => {
  const rows = catalog.standards.app6b.icons.filter((icon) => icon.code === "UCEC--");
  assert.equal(rows.length, 5);
  assert.ok(rows.every((icon) => icon.note));
});

test("APP-6(B) wheeled amphibious armour has its own code", () => {
  const row = catalog.standards.app6b.icons.find((icon) => icon.name === "ARMOUR, WHEELED AMPHIBIOUS");
  assert.equal(row.id, "S-G-UCAWW-");
});

test("the Studio ships its edition profiles with the library's shared helpers", () => {
  assert.equal(existsSync("dist/studio-public/profiles/app6d.js"), true);
  assert.equal(existsSync("dist/studio-public/edition-check.js"), true);
  assert.equal(
    readFileSync("dist/studio-public/profiles/common.js", "utf8"),
    'export * from "../vendor/modifierprofiles/common.js";\n'
  );
});

test("an earlier build's profile copies under vendor/ do not survive", () => {
  assert.equal(existsSync("dist/studio-public/vendor/modifierprofiles/app6d.js"), false);
  assert.equal(existsSync("dist/studio-public/vendor/modifierprofiles/app6a.js"), true);
});
