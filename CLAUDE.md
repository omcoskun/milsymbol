# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

milsymbol: a dependency-free JavaScript library that renders military unit symbols (MIL-STD-2525B/C/D/E, APP-6A/B/D/E) as SVG or Canvas from a SIDC code. This checkout also contains **Military Symbol Editor** (`studio/`, called the Studio in code and docs), a browser editor built on the library, and an APP-6A (1998) point-symbol profile. See `STUDIO.md` and `docs/app6a.md`.

## Commands

Node is at `/opt/homebrew/bin` (Homebrew). It may not be on `PATH` in non-login shells.

```bash
npm run bundle          # rollup: index.js -> dist/milsymbol.development.js (UMD, global `ms`)
npm run build           # prebuild runs read-only lint + tests, then bundle + minify -> dist/milsymbol.js
npm run lint            # eslint src test studio (checks without rewriting files)
npm run test:node       # Node integration tests, including fresh ESM/CJS/UMD package checks after build
npm run studio:build    # bundle + minify + scripts/build-studio.mjs -> dist/studio/ (catalog.json, vendor/milsymbol.js)
npm run studio:serve    # static server for dist/studio on http://127.0.0.1:4173 (PORT env overrides)
```

The React editor in `app/` has its own package. Run these inside `app/`:

```bash
npm install             # app/ dependencies only; the root package stays dependency-free
npm run data            # scripts/build-studio.mjs --data public -> catalog.json, flags.json, licenses (not in git)
npm start               # data + webpack-dev-server on http://localhost:3008
npm run build           # data + production build -> app/build/
IWC=hwf npm run build   # IWC is hap (default) or hwf, written into the bundle by DefinePlugin
```

```bash
npx tead
npx tead --testPattern='app6a\.test\.js$'
```

`src/ms.js` falls back to a literal version when rollup has not injected `__version__`, so tests and scripts can import from `src/` directly. Keep that literal equal to `package.json`; `test/ms.test.js` checks it.

The test runner is [tead](https://github.com/teadjs/tead). A test file default-exports nested objects whose leaves are `[actual, expected]` pairs, compared with deep equality. There are no `describe`/`it`/`expect`. Most `test/*-<symbolset>.test.js` files iterate the official symbol tables from the `mil-std-2525`, `stanag-app6` and `milstandard-e` devDependencies, using the helpers `test/letter-sidc.js` and `test/number-sidc.js`. Each file calls `ms.reset()` and adds only the icon sets it needs.

Style: Prettier with `trailingComma: "none"`; ESLint requires semicolons and `prefer-const`.

## Architecture

**The `ms` singleton is a plugin registry** (`src/ms.js`). Rendering is assembled from pluggable pieces that are registered at runtime:
- **Symbol parts** (`src/symbolfunctions/*`): `ms.reset()` registers them in order (stack, basegeometry, icon, modifier, statusmodifier, engagementbar, affiliation/dimension, textfields, directionarrow). Each part is called with `this` = the Symbol and returns `{pre, post, bbox}` draw instructions.
- **Icon sets** (`ms.addIcons(...)`): `src/lettersidc.js` (15-character letter SIDCs, which group modules into `app6a`, `app6b`, `std2525b`, `std2525c`) and `src/numbersidc.js` (20/30-digit number SIDCs, which group into `app6d`, `std2525d`, `std2525e`). Each module under `*/sidc/*.js` is `{type: "letter"|"number", getMetadata, getIcons, iconParts, icons}`. `icons(sId, bbox, icn, STD2525)` maps SIDC keys such as `"S-A-MFB---"` to arrays of named primitives from `src/iconparts/*.js`.
- `index.mjs` exports the pieces for tree-shaking. `index.js` (the rollup input) registers every set and default-exports `ms`.

**Rendering pipeline**: `new ms.Symbol(sidc, options)` → `setOptions` (`src/ms/symbol/setoptions.js`). The steps are:
1. Split options into `style` and `options`.
2. `getMetadata()` decides letter vs number SIDC by whether the first two characters are numeric, then dispatches to `ms._getMetadata[type]`.
3. `getColors()`.
4. Run every registered symbol part, accumulating `drawInstructions` and a `BBox`.

`asSVG()`/`asCanvas()` serialize those abstract draw instructions; no DOM is needed for SVG. `isValid()` checks for `null` in the draw instructions and for an invalid icon.

**Icon cache**: `src/symbolfunctions/icon.js` caches resolved icon tables in `ms._iconCache`. The cache key is built from standard, edition, dimension, affiliation, colors, etc. Anything that changes which icons resolve must also be part of that key. `ms.addIcons` clears the cache.

**Standard selection**: `ms.setStandard("2525" | "APP6" | "APP6A")` sets `ms._STD2525` and `ms._standardEdition`. A per-symbol `style.standard` override takes precedence. 2525 vs APP6 mostly changes frame and icon variants through the `STD2525` flag passed to icon functions.

**Edition profiles**: a profile gives `fields`, `validate`, `textLayout` and `unavailableReason` for a SIDC.
- The library applies only the APP-6A profile: `src/modifierprofiles/app6a.js`, with shared helpers in `common.js`. `applyProfile` stores its result on `metadata`, and `textfields.js` draws `metadata.textLayout` in place of the legacy rows, so a field outside the APP-6A layout is not drawn.
- Every other edition is drawn exactly as upstream milsymbol 3.0.5. The Studio holds their profiles in `studio/profiles/`: `app6b.js`, `std2525c.js`, `app6d.js` (with `app6d-sectors.js`), `std2525d.js`, `std2525e.js` and `app6e.js`; `fieldtable.js` builds the last three from a table of classes written in field codes. These profiles only check symbols. `studio/edition-check.js` combines `isValid()` with the profile's `validate`.
- In the profiles, numeric version 10-12 is edition D and 13-16 is edition E; `STD2525` picks 2525 or APP-6 within an edition. A letter SIDC with standard `APP6` is APP-6(B), scheme S only.
- Text values that break a length, list or format rule go in `details.fieldWarnings` and leave the symbol valid; `details.modifierErrors` is for a wrong code or a field the symbol does not take.
- `docs/edition-modifiers.md` has the positions and source decisions; `test/edition-modifiers.test.js` checks the profile rules.

**Upstream**: the `upstream` remote is spatialillusions/milsymbol. Take its releases with `git merge vX.Y.Z`, so the shared history stays usable for the next merge.
- In `src/`, only APP-6A code and the Sea Surface frame shape `A` differ from upstream. Fork rules that sit inside upstream code stay there as small guards, for example `!metadata.app6a` in `src/ms/symbol/resolvecolormode.js`.
- `test/upstream-parity.test.mjs` (`node --test test/upstream-parity.test.mjs`, also part of `npm run test:node`) compares every edition except APP-6A with the `milsymbol-upstream` devDependency, an npm alias pinned to the merged release. It compares SVG, validity, anchors and Canvas draw calls.
- When you merge a new upstream release, bump the alias to that exact version in the same change (`npm install -D -E milsymbol-upstream@npm:milsymbol@X.Y.Z`).
- `docs/upstream-parity-removals.md` lists what left the library, where it came from and how to restore it.

### APP-6A profile (fork extension, partial conformance)

- APP-6A explicitly lists the existing `lettersidc/sidc` and `iconparts` domain modules, registered through `ms.addIcons(app6a)`. It must not derive its bundle from `app6b` or load `std2525bextra`. Shared naval station geometry lives in the sea/subsurface icon-part modules. Do not add a second renderer or global provider registry.
- `src/lettersidc/metadata.js` contains the independent Annex B code vocabulary, `isApp6aSidc` and Table III field/modifier rules. The registered metadata provider returns optional `metadata.validation = {valid, details}`; `isValid()` consumes this result without importing edition-specific code. `setOptions()` recalculates it. APP-6A fails closed until a letter provider validates it.
- `studio/app6a-catalog.js` holds 907 editor/test entries with publication references. It is not part of the rendering library. Tests assert its IDs match the metadata vocabulary.
- EMS, US tactical, stability and SIGINT providers guard against overriding APP-6A definitions. Only explicitly registered modules are available after `ms.reset()`.
- Scope is point symbols only: no multipoint graphics, weather, or intel/mapping schemes. `docs/app6a.md` lists the errata and explicit local image-audit commands. Generated evidence stays in `output/app6a-audit/` and local `dist/studio/audit/`; the active image audit is S-scheme only.

### Studio

`studio/` (`index.html`, `app.js`, `styles.css`) is plain static HTML/JS. `scripts/build-studio.mjs` copies it to `dist/studio/` and does the following:
- Normalizes the symbol tables from the three standards devDependencies, plus the APP-6A catalog, into `catalog.json`.
- Copies the minified `dist/milsymbol.js` to `vendor/milsymbol.js` and `src/lettersidc/metadata.js` to `vendor/letter-metadata.js` for shared modifier rules.
- Copies `src/modifierprofiles/` (APP-6A and `common.js`) to `vendor/modifierprofiles/` and `studio/profiles/` to `profiles/`, with `profiles/common.js` rewritten to re-export the vendored helpers. Both folders are cleared first.
- Preserves the library and three catalog packages' complete licenses in the generated site. `npm run studio:build:public` uses allow-listed `dist/studio-public/`, excluding local PDF audits and hiding their link. It does not deploy.

Because the studio loads the bundled library, library changes are invisible in the studio until `npm run studio:build` runs again.

### React editor (`app/`)

`app/` is the same editor in React 18 + JSX, built with Webpack 5 and Babel 7, using MUI components with Emotion. GitHub Pages still publishes the vanilla `studio/`.
- The app imports the library from `../index.js` (so it needs no `studio:build`) and the editor rules from the plain `studio/` modules. The vanilla app's `./vendor/...` imports correspond to `src/lettersidc/metadata.js` and `src/modifierprofiles/app6a.js`.
- `app/src/editor/store.js` replaces the logic of `studio/app.js`. It is one React-independent store: state, control values (`controls`), the disabled map and a computed `view`, with no state kept in the DOM. It takes `ms`, `catalog` and `storage` as parameters. Each action commits a new snapshot, and components subscribe with `useSyncExternalStore` (`app/src/hooks.js`). One-time UI requests such as focus or scroll go through `signals`, which `useSignal` handles.
- Drafts keep the vanilla format and `symbol-studio:*` keys and must pass `validDraft` in `studio/draft-store.js`.
- `app/public/config.json` and `lang.json` are fetched at run time. `lang.json` holds only the components' fixed texts; editor messages come from the store. The UI stays English.
- `test/app-editor-store.test.mjs` (node:test, part of `npm run test:node`) runs the store against a catalog built with `--data`. `npm run lint` covers `app/src` with JSX enabled. `.openai/hosting.json` serves `dist/studio` statically.

## Releasing (from dev/README.md)

Fork versions are the upstream version plus `-vN`, such as `3.0.5-v1`: raise N for each fork release, and go back to `-v1` after merging a new upstream release. Set `version` in `package.json` and `package-lock.json` and the fallback in `src/ms.js`. The version string reaches the bundle via rollup replace. npm reads `-vN` as a prerelease, so an npm publish needs `--tag`. Then run `npm publish` and create a GitHub release tagged `vX.Y.Z`. For prereleases, use `npm pack` + `npm publish <tgz> --tag next`.
