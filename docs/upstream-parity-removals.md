# Upstream parity: what leaves the library

The library goes back to milsymbol 3.0.5 plus APP-6A
(plan: `docs/superpowers/plans/2026-11-08-library-upstream-parity.md`). This
note records what is removed, where it came from and how to get it back.

## Restore point

- Tag `archive/before-upstream-parity` is commit `bedcb9f`, the last state with
  every item below in the library. The work happens on `develop`; `main` keeps
  `bedcb9f` until `develop` is merged.
- One item: `git checkout archive/before-upstream-parity -- <file>`, or
  `git show <commit>` for the commit named below.
- Everything: `git switch develop && git reset --hard archive/before-upstream-parity`
  (discards the parity commits on `develop`).

## What stays in the library

- APP-6A: icon tables, `src/lettersidc/metadata.js` vocabulary and rules,
  `src/modifierprofiles/app6a.js`, `src/modifierprofiles/common.js`, and the
  guards in shared code that run only when `metadata.app6a` is true.
- The shared hooks APP-6A uses: `metadata.validation` in `isValid`, the text
  layout branch in `textfields.js`, `setStandard("APP6A")`.
- Sea Surface frame shape `A` (`cdb6f9d`, approved 2026-11-05).
- The fork version fallback in `src/ms.js`.

## Removed from rendering: other editions' profiles

The profiles move unchanged to `studio/profiles/`. The Studio still uses them
for controls, warnings and its validity badge; the library no longer applies
them when drawing.

| Behaviour | Editions | Commit |
|---|---|---|
| Text rows follow the edition figures; fields a class does not take are not drawn; fields joined with a space instead of `/` | 2525C (opt-in), APP-6B S, APP-6D, 2525D, 2525E, APP-6E | `910b281`, `3edf459`, `356a154`, `ffe69a3` |
| `isValid()` false for a field, condition, echelon or mobility the class does not take; `isValid(true)` carries `modifierErrors`, `fieldWarnings`, `notes` | same | same; warnings `1aa8aee`; HQ/TF/dummy on every class `ef1d1af` |
| Quantity above task force/echelon, engagement bar above quantity, quantity below a dismounted individual | APP-6D, D/E | `951e50e`, `ffe69a3` |
| No condition bar where the class has no AL (for example land units) | APP-6D, 2525D/E, APP-6E | `356a154`, `a2ea68f`, `ffe69a3` |
| Only dictionary sector codes drawn, none on local tracks | APP-6D | `356a154` |
| Identity rules: Own Ship Friend only, IED Hostile only, fused track/ETC Pending | APP-6D | `356a154`, `11857d5` |
| Joker/Faker keep the hostile frame | APP-6D | `a2ea68f` |
| 2525C mode: `setStandard("2525C")`, no direction arrow on installations, no condition bar on units, echelon/mobility only where Table IV allows, frame descriptor as first text token | 2525C | `3edf459` |
| Restricted target and no-strike marks for contexts 3–8; options `installationCapacity` (AT), `networkIdentifier` (AY) | APP-6E, 2525E | `ffe69a3` |
| No engagement bar on APP-6B S symbols | APP-6B | `ffe69a3` |

## Removed generic fixes (upstream candidates)

Each is a fix to upstream behaviour. Offer it to spatialillusions/milsymbol as
a pull request rather than keeping it in the fork.

| Fix | Visible effect in 3.0.5 | Commit |
|---|---|---|
| `ms._scale` copies instead of mutating the shared part | Sensor, naval, bridge and similar parts drawn thicker after a scaled copy was built (2525C `SFGPES`, D/E Naval, Bridge, Sensor Emplaced) | `4cb165a` |
| Canvas resets `globalAlpha` after a translucent path | Later strokes stay translucent | `4cb165a` |
| `octagonAnchor` computed after the HQ staff grows the bbox | Octagon anchor off on HQ symbols | `4cb165a` |
| Joker/Faker resolved from context, so exercise contexts 5/6 count | Wrong identity on those contexts | `4cb165a` |
| Versions other than 10–16 invalid | Unknown versions render as valid | `4cb165a` |
| Versions 14–16 are edition E; positions 21–22 are modifiers only in edition E | Edition D national tails read as modifiers | `ffe69a3`, `598a84d` |
| APP-6B `G-C-OXAH` uses the ASW rotary wing icon | The tactical point draws nothing | `172ac6d` |
| Named ESM exports in `index.js`, `types` first in `exports`, default-only UMD entry | `import { Symbol } from "milsymbol"` fails although `index.d.ts` declares it | `4cb165a` |

## Restored refactors

Output is the same as upstream, but the file differs from upstream. Restoring
it keeps future upstream merges clean.

- `src/iconparts/2525b.js` station parts taken from `sea.js`/`subsurface.js`
  (`93c6fe3`). APP-6A keeps its own copies in `sea.js`/`subsurface.js`.
- `src/lettersidc/geticons.js` loop and trailing-comma formatting in
  `src/lettersidc.js`, `index.js` and `index.mjs`.
