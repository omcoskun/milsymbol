# Library Upstream Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The milsymbol library is upstream 3.0.5 plus APP-6A and nothing else. Every non-APP-6A symbol renders and validates exactly as upstream does. The other editions' modifier profiles move to the Studio, which uses them only to check symbols.

**Architecture:** A parity test renders every point symbol of 2525B, 2525C, APP-6B, 2525D, APP-6D, 2525E and APP-6E with the published `milsymbol@3.0.5` and with this fork. It must find zero differences. Non-APP-6A hunks in `src/` go back to upstream. APP-6A keeps only hunks guarded by `metadata.app6a`. The 2525C, APP-6(B/D/E) and 2525D/E profiles move unchanged to `studio/profiles/`. The Studio merges `profile.validate()` into the library's `isValid()` result.

**Tech Stack:** JavaScript ES modules, tead, `node --test`, Rollup, static Studio.

**Spec:** The user's decision of 2026-11-08: "ana milsymbol koduna app6a için dokunmak istemiyordum … `/` olarak çıktı kalabilir diğerleri için", then "Yes, plan it". The measured differences this plan removes are in the Review Focus section and in the Task 1 baseline.

## Global Constraints

- Library files (`src/`, `index.js`, `index.mjs`, `index.d.ts`, `rollup.config.mjs`, `package.json` `exports`) equal `v3.0.5` except for these four:
  - The APP-6A modules and their guards.
  - `ms.addIcons(app6a)` with its `app6a` export.
  - The version fallback `"3.0.5-v5"` in `src/ms.js`.
  - The Sea Surface frame shape `A` hunk in `src/numbersidc/metadata.js`, approved 2026-11-05.
- Restore a file with `git checkout v3.0.5 -- <file>`, then re-apply only the allowed hunks. Restored files keep upstream formatting, trailing commas included. New code follows Prettier `trailingComma: "none"`.
- An APP-6A hunk in shared code must be a no-op when `metadata.app6a` is false.
- If an APP-6A test fails after a core file is restored, fix it inside an `if (metadata.app6a)` block of the module that owns the part. Never change core code to fix it.
- The moved profiles keep their logic byte-for-byte. Only import paths change.
- Work on `develop`. Only `main` and `develop` exist, and a push to `main` deploys. Run `git fetch` before every commit. Do not push, release or deploy without the user's go-ahead.
- Node is at `/opt/homebrew/bin`. Studio UI text stays English.

## Review Focus

1. **Canvas output:** `asCanvas` must match upstream as well as `asSVG`. Task 2 adds a draw-call parity check.
2. **Studio validity:** A symbol the library calls valid but its profile rejects (for example 2525D land unit with C quantity) must show "Check code / modifiers" in the Studio. Task 6 adds `studio-edition-check.test.js`.
3. **Field positions panel:** For D/E editions the panel shows the standard's positions while the preview now uses upstream rows (`/` joins). The panel must still render without errors and say it shows the standard's positions. Task 7 checks this in the browser.
4. **Upstream bump:** After the next upstream merge, the `milsymbol-upstream` alias must follow. Task 1 asserts it matches the `package.json` version without `-vN`.
5. **Public Studio build:** `profiles/*.js` must pass the public allow-list and load in the page. Task 6 extends `studio-catalog-build.test.mjs`.

---

### Task 1: Upstream parity test

**Files:**
- Modify: `package.json`, `package-lock.json` (devDependency `"milsymbol-upstream": "npm:milsymbol@3.0.5"`)
- Create: `test/upstream-parity.test.mjs`

**Interfaces:**
- Produces: `node --test --test-name-pattern="<edition>" test/upstream-parity.test.mjs`, one `test()` per edition named `2525B`, `2525C`, `APP-6B`, `2525D`, `APP-6D`, `2525E`, `APP-6E`. Later tasks run their editions by name.

- [ ] **Step 1: Install the alias.** Run `npm install --save-dev milsymbol-upstream@npm:milsymbol@3.0.5`.
- [ ] **Step 2: Write the test.** Import the fork's default `ms` from `../index.js` and upstream's from `milsymbol-upstream`. Read tables as `test/*.test.js` do: `ms2525b`, `ms2525c` and `ms2525d` from `mil-std-2525`, `app6b` and `app6d` from `stanag-app6`, `ms2525e` from `milstandard-e`. APP-6E uses the `ms2525e` table with `setStandard("APP6")` and version `13`. Letter entries skip `remarks == "N/A"`. Number entries skip non-`Point` geometric rendering and codes that are not 6 digits.
  - Letter cases per entry:
    - affiliations `F H N U P A S G W D L M J K` with status `P`;
    - statuses `A C D X F`;
    - positions 11–12 `D-`, `-E` and `MO`;
    - affiliation `F` and `H` with the text set.
  - Number cases per entry:
    - context+identity `01 03 04 05 06 13 15 16 23 26`;
    - for E editions only, contexts `3`–`8` with identity `6`;
    - status `2`–`5`;
    - HQ/TF/dummy `7`;
    - amplifier `15` and `31`;
    - identity `3` and `6` with the text set.
  - The text set is `{quantity: "200", reinforcedReduced: "+", staffComments: "STAFF", additionalInformation: "ADDINFO", evaluationRating: "A1", combatEffectiveness: "CE", signatureEquipment: "!", higherFormation: "HIGHER", hostile: "ENY", iffSif: "IFF", direction: "45", sigint: "M", uniqueDesignation: "UNIQUE", type: "TYPE", dtg: "301200ZNOV26", altitudeDepth: "100FT", location: "LOCATION", speed: "10KPH", specialHeadquarters: "SHQ", country: "USA", platformType: "ELNOT", equipmentTeardownTime: "5", commonIdentifier: "COMMON", auxiliaryEquipmentIndicator: "AUX", headquartersElement: "TOC", installationComposition: "COMP", engagementBar: "B:2-1", guardedUnit: "BG", specialDesignator: "SD"}`. Add one more case with only `{country: "USA"}`.
  - For each case, compare `asSVG()`, `isValid()`, `JSON.stringify(isValid(true))`, `getAnchor()` and `getOctagonAnchor()`.
  - Assertion per edition: `assert.deepEqual(differences.slice(0, 20), [], edition)`, where `differences` lists `"<sidc> <what differs>"`.
  - Add a test `upstream alias matches the fork base`: `milsymbol-upstream/package.json` version equals `pkg.version.replace(/-v\d+$/, "")`.
- [ ] **Step 3: Run it and confirm RED.** Run `node --test test/upstream-parity.test.mjs`. Expected: `2525B` passes and the other six fail. Baseline from 2026-11-08: 2525C has 3 sensor icons; APP-6B has `G*C*OXAH`; D/E fail on text, status 2–5, amplifiers and the 9 naval/sensor icons; APP-6D also fails on identities 15/16.
- [ ] **Step 4: Commit.** Message: `Test that non-APP-6A symbols match upstream 3.0.5`.

### Task 2: Core renderer back to upstream

**Files:**
- Restore: `src/ms/symbol/setoptions.js`, `src/ms/symbol/canvasdraw.js`, `src/lettersidc/geticons.js`, `src/iconparts/2525b.js`, `src/ms/symbol.js`
- Modify: `src/ms.js`
  - Restore it, then re-apply the version fallback and `this._standardEdition = ""` in `reset()`.
  - In `setStandard`, re-apply `this._standardEdition = ""` in the `2525` and `APP6` branches, and the `"APP6A"` branch.
  - Leave out the `"2525C"` branch and the `_scale` rewrite.
- Modify: `src/lettersidc/sidc/tactical-points-app6.js`. Restore the two `G-C-OXAH--` lines; keep the `if (this.metadata.app6a)` block.
- Modify: `test/review-rendering-regressions.test.js`. Delete the cases for the `_scale`, Canvas alpha and octagon-anchor fixes. Keep any other case; delete the file if none is left.
- Modify: `test/upstream-parity.test.mjs`. Add a test `canvas draw calls match upstream`. It runs `canvasDraw(recorder, symbol.drawInstructions)` from both `src/ms/symbol/canvasdraw.js` files and compares the recorded calls.
  - Symbols: the first 50 entries of each edition, plus `SFGPES---------`, `10031000001701000000`, `10031500001301000000` and `10031500002202000000`.
  - Upstream's file path: `path.dirname(require.resolve("milsymbol-upstream/package.json"))` + `/src/ms/symbol/canvasdraw.js`, because its `exports` blocks subpaths.
  - Set up `Path2D` as `test/canvas-renderer-internals.test.js` does. The recorder is a `Proxy` that logs every method call and property set.
- Create: `docs/upstream-candidates.md`. One line per removed generic fix, with the commit it came from, for a possible upstream PR:
  - `ms._scale` mutation (`4cb165a`);
  - Canvas `globalAlpha` reset (`4cb165a`);
  - `octagonAnchor` after the HQ bbox (`4cb165a`);
  - APP-6B `G-C-OXAH` icon;
  - named ESM exports and `types` order (Task 3);
  - Joker/Faker by context, versions 10–16 check, E contexts 3–8 (Task 4).

- [ ] **Step 1: Write the Canvas parity test.**
- [ ] **Step 2: Run it and confirm RED.** Run `node --test --test-name-pattern="canvas" test/upstream-parity.test.mjs`. Expected: FAIL. The fork sets `globalAlpha` where upstream does not, and the four listed symbols differ in stroke width.
- [ ] **Step 3: Restore and edit the files listed above.**
- [ ] **Step 4: Run `npx tead --testPattern='app6a'`.** Fix any APP-6A failure under the Global Constraints rule. Expected: PASS.
- [ ] **Step 5: Run the parity check.** Run `node --test --test-name-pattern="2525B|2525C|canvas" test/upstream-parity.test.mjs`. Expected: all three pass. `2525C` now passes because its sensor stroke width came from `_scale`.
- [ ] **Step 6: Commit.** Message: `Return the core renderer to upstream; list the fixes for upstream`.

### Task 3: Package entry back to upstream

**Files:**
- Restore: `index.js`, `index.mjs`, `rollup.config.mjs`. Then re-add `app6a` to the `index.mjs` export line, and to the `index.js` import list with `ms.addIcons(app6a)` before `ms.addIcons(app6b)`.
- Modify: `package.json`. Restore upstream's `exports` order (`require`, `import`, `types`). Keep fork scripts, version and devDependencies.
- Modify: `index.d.ts`. Restore it, then re-add only `"APP6A"` to `setStandard`.
- Modify: `test/package-exports.test.mjs`. Remove the named-export assertions. Keep the default `ms` checks for ESM, CJS and UMD, including `ms.setStandard("APP6A") === true`.

- [ ] **Step 1: Edit the files.**
- [ ] **Step 2: Build and test.** Run `npm run build && npm run test:node`. Expected: the build, `package-exports` and the other Node tests pass. Only the parity tests for APP-6B, 2525D, APP-6D, 2525E and APP-6E still fail.
- [ ] **Step 3: Commit.** Message: `Return the package entry to upstream with APP-6A registered`.

### Task 4: Number SIDCs back to upstream

**Files:**
- Modify: `src/numbersidc/metadata.js`. Restore it, then re-apply only the Sea Surface hunk: `case "A": metadata.dimension = "Sea"; break;` with its comment, and removal of `if (frameshape == "A") metadata.frame = false;`.
- Modify: `src/symbolfunctions/icon.js`. Remove the `app6d-sectors.js` import and `app6dDraw`. Keep the APP-6A `affiliation === "none"` guard and `ms._getIcons.letter.call(this, …)`.
- Restore: `src/symbolfunctions/modifier.js`.
- Modify: `src/symbolfunctions/engagmentbar.js`. Restore it, then add only `&& !(this.metadata.app6a && this.options.sidc[0] === "S")` to the `engagementBar !== ""` condition, with its comment.
- Modify: `src/symbolfunctions/textfields.js`. Keep the layout hook APP-6A uses:
  - the `joinFields`/`layoutKeys` import;
  - `layout`, `allowed` and `values` (with `derivedFields`);
  - the `layoutKeys(layout).some(...)` trigger;
  - `allowed(...)` on `specialHeadquarters`, `quantity` (upstream `y: bbox.y1 - 10`) and `headquartersElement`;
  - the `!layout &&` guards;
  - the row-join loop for rows 1–5.

  Remove:
  - the `country`, `installationCapacity` and `networkIdentifier` triggers;
  - `quantityTop`;
  - the below-frame quantity;
  - `L0`/`R0`, because APP-6A row 0 is empty;
  - `layout.derived` with its `layoutHasText` import.
- Modify: `src/symbolfunctions/affliationdimension.js`. Remove the APP-6E restricted/no-strike block and its bbox merge. Restore the upstream `if (this.metadata.context == "Exercise")` line and drop its `layoutHasText` import. Keep the APP-6A marker, `strWidth` and the APP-6A `?` block.
- Restore: `test/app6d-sea.test.js`, `test/app6d-subsurface.test.js`, `test/number-sidc.js`.
- Delete: `test/numeric-country-fields.test.js`.
- Modify: `test/app6d-modifiers.test.js`, `test/edition-modifiers.test.js`, `test/field-warnings.test.js`, `test/review-sidc-regressions.test.js`.
  - Delete assertions whose actual value comes from `new ms.Symbol(<number SIDC>)`, meaning its SVG, `isValid`, `metadata` or drawn rows.
  - Where such an assertion checked a profile's errors or warnings, rewrite it as `profile.validate(sidc, options).details` from the same profile.
  - Keep assertions on profile functions unchanged.
  - Apply the same rule to any other test that fails because it asserted the fork's rendering of a non-APP-6A symbol. Name each such file in the commit body.

- [ ] **Step 1: Edit the source files.**
- [ ] **Step 2: Run the number parity check and confirm GREEN.** Run `node --test --test-name-pattern="2525D|APP-6D|2525E|APP-6E" test/upstream-parity.test.mjs`. Expected: PASS.
- [ ] **Step 3: Edit the tests as listed above.**
- [ ] **Step 4: Run all tead tests.** Run `npx tead`. Expected: PASS. `std2525e-frame-shape.test.js` still passes.
- [ ] **Step 5: Commit.** Message: `Render number SIDCs as upstream; keep D/E checks in the profiles`.

### Task 5: Letter SIDCs back to upstream

**Files:**
- Modify: `src/lettersidc/metadata.js`. Remove the `std2525c.js` and `app6b.js` imports, the two `metadata.std2525c` blocks, and the `metadata.app6b` block. Keep the APP-6A import, export, block and helpers, and the `!metadata.app6a` guards.
- Modify: `src/ms/symbol/getmetadata.js`. `standardEdition` maps only `APP6A` → `"A"`. Remove `metadata.std2525c`.
- Modify: `src/symbolfunctions/directionarrow.js`. Restore the upstream `if (this.style.infoFields)` line. Keep the APP-6A arrow hunk.
- Modify: `src/lettersidc.js`. Restore it, then re-add the `app6a` array (with its comment) and its export.
- Modify: `test/std2525c-modifiers.test.js`, plus the letter cases of `test/field-warnings.test.js` and `test/edition-modifiers.test.js`. Apply the same rule as Task 4, for letter SIDCs under `"2525C"` or `"APP6"`.

- [ ] **Step 1: Edit the files.**
- [ ] **Step 2: Run the full parity test.** Run `node --test test/upstream-parity.test.mjs`. Expected: all nine tests PASS.
- [ ] **Step 3: Run lint and all tead tests.** Run `npx tead && npm run lint`. Expected: PASS.
- [ ] **Step 4: Prove only APP-6A code differs.** Run `git diff v3.0.5 -- src | grep '^+' | grep -v -i app6a | grep -v '^+\s*\(//\|$\)'`. Every remaining line must belong to an APP-6A module or guard, the version, or Sea Surface. List them in the commit body.
- [ ] **Step 5: Commit.** Message: `Render letter SIDCs as upstream outside APP-6A`.

### Task 6: Profiles move to the Studio

**Files:**
- Move (`git mv`, contents unchanged): `src/modifierprofiles/{app6b,app6d,app6d-sectors,app6e,fieldtable,std2525c,std2525d,std2525e}.js` to `studio/profiles/`.
- Create: `studio/profiles/common.js`, containing `export * from "../../src/modifierprofiles/common.js";`.
- Create: `studio/edition-check.js` with `editionCheck(symbol, profile, sidc, options) -> { valid: boolean, details: object }`.
  - When `profile` is null or `profile.id === "app6a"`, return `{ valid: symbol.isValid(), details: symbol.isValid(true) }`.
  - Otherwise, copy `options`, run `clearBlankText` (from `./profiles/common.js`) on the copy, then call `result = profile.validate(sidc, copy)`. Return `valid` as `symbol.isValid() && result.valid` and `details` as `{ ...symbol.isValid(true), ...result.details, profile: profile.id }`.
- Modify: `studio/app.js`.
  - Import the moved profiles from `./profiles/…`. `app6a.js` stays under `./vendor/modifierprofiles/`.
  - Change the `2525c` config to `standard: "2525"`.
  - In `renderAll`, set `currentCheck = editionCheck(currentSymbol, activeProfile(), sidc, options)`, where `options` is the object already passed to `new ms.Symbol`.
  - Replace `currentSymbol.isValid()` and `currentSymbol.isValid(true)` at the three call sites (`renderProblem`, the `profileDetailLines` caller, and the render state) with `currentCheck.valid` and `currentCheck.details`.
- Modify: `scripts/build-studio.mjs`.
  - Copy `studio/profiles/*.js` to `dist/studio/profiles/`.
  - Overwrite `dist/studio/profiles/common.js` with `export * from "../vendor/modifierprofiles/common.js";\n`.
  - Add `edition-check.js` to `studioAssets`.
  - Allow `^profiles\/[a-z0-9-]+\.js$` and the `profiles` directory in the public allow-list.
- Modify: every test importing `src/modifierprofiles/<moved>.js` so it imports `studio/profiles/<moved>.js`. That is `test/app6d-modifiers`, `edition-modifiers`, `field-warnings`, `review-sidc-regressions`, `std2525c-modifiers`, `studio-identities`, `studio-editor-helpers`, `studio-profile-controls`, `studio-review-fixes` and `studio-live-audit-fixes`.
- Create: `test/studio-edition-check.test.js`. Use `ms` from `../index.mjs` with every icon set added, and `ms.setStandard("2525")`. Let `land = "10031000001211000000"`. Tead leaves:
  - `editionCheck(new ms.Symbol(land, { quantity: "200" }), std2525dProfile, land, { quantity: "200" }).valid` → `false`;
  - the same call's `details.modifierErrors.some((m) => m.startsWith("C quantity is not defined for landUnit"))` → `true`;
  - `editionCheck(new ms.Symbol(land, {}), std2525dProfile, land, {}).valid` → `true`;
  - for `a = new ms.Symbol("SFGPUCI--------", { standard: "APP6A" })`, `editionCheck(a, app6aProfile, "SFGPUCI--------", {}).valid` → `a.isValid()`.
- Modify: `test/studio-catalog-build.test.mjs`. After `npm run studio:build:public`, `dist/studio-public/profiles/app6d.js` exists and `dist/studio-public/profiles/common.js` re-exports from `../vendor/`.

- [ ] **Step 1: Write `test/studio-edition-check.test.js`.**
- [ ] **Step 2: Run it and confirm RED.** Run `npx tead --testPattern='studio-edition-check'`. Expected: FAIL, because the module is missing.
- [ ] **Step 3: Move the files and make the edits above.**
- [ ] **Step 4: Run the full suite and builds.** Run `npx tead && npm run lint && npm run studio:build && npm run studio:build:public && npm run test:node`. Expected: PASS.
- [ ] **Step 5: Commit.** Message: `Move edition profiles into the Studio as checks`.

### Task 7: Documentation and end-to-end check

**Files:**
- Modify: `CLAUDE.md`.
  - **Edition profiles:** only `app6a.js` and `common.js` live in the library. The others live in `studio/profiles/` and only check symbols.
  - **Upstream:** the parity test command, and bumping `milsymbol-upstream` with each upstream merge.
  - **Studio:** the `profiles/` copy.
- Modify: `docs/edition-modifiers.md`, `docs/app6d-modifiers.md`, `docs/std2525c-modifiers.md` and `STUDIO.md`. These rules are Studio checks now, and the library draws upstream rows.
- Modify: memory `library-code-boundary.md`. Record the profiles' new home, the parity test, and that the Sea Surface exception is the only one.

- [ ] **Step 1: Update the docs.**
- [ ] **Step 2: Build and test from clean.** Run `npm run build && npm run test:node`. Expected: PASS.
- [ ] **Step 3: Check the Studio in the browser.** Run `npm run studio:serve`. For each of the seven standards and APP-6A, load the default symbol, set a text field, and confirm three things: the preview renders, no console errors appear, and the validity badge matches `editionCheck`. In 2525D, a land unit with C quantity shows "Check code / modifiers". The Field positions panel renders for D/E. Take screenshots.
- [ ] **Step 4: Request review and commit.** Run the final code review. Commit with message `Document the upstream-parity library and Studio profile checks`. Stop and ask the user before any push.
