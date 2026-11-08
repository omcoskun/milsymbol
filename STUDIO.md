# Military Symbol Studio

The repository includes an English military symbol editor in `studio/`, with a light interface, a search panel, tabbed configuration, and a persistent preview with a SIDC console.

## Run locally

```bash
npm install
npm run studio:build
npm run studio:serve
```

Open `http://127.0.0.1:4173`.

The build creates `dist/studio/`, including a normalized searchable catalog generated from the standard data packages already used by milsymbol. The site offers MIL-STD-2525C/D/E and APP-6A/B/D/E views. APP-6E uses a compatibility catalog; its codes carry version 16 (APP-06(E)(2), Table A-1). FM 1-02.2 is not offered in the editor; the underlying library is unchanged. Symbols can be exported as SVG or PNG.

## Local drafts

The editor automatically saves the standard, selected catalog row, applied or pending SIDC,
text fields (including inactive values), country/organization and display settings in
this browser's `localStorage`. Reloading restores that draft. The toolbar reports whether
saving succeeded. Drafts are local to this site and browser; they are not uploaded or
included when copying a SIDC. Unavailable storage does not prevent editing; malformed
or incompatible saved records are ignored. A visit that changes nothing stores nothing,
and a reload announces a restored draft only when it differs from a new editor.

Reset clears modifiers and immediately saves the reset draft. Undo reset restores the
complete previous draft until the next edit or reload. Preview background and preview
grid remain separate browser preferences.

## Layout

- **Top bar:** standard selector, source code link, Help and the search launcher. Click the launcher or press `/` to open the symbol search panel. The panel holds the symbol set list with counts, Recently used (the last 8 symbols per standard, stored in `localStorage`), and result tiles with mini previews. Browsing a set, the tiles sit under a closable heading for each group of the set and a subheading for each group inside it (APP-6A Ground units: COMBAT, then AIR DEFENSE, ARMOR, ...), taken from the catalogue hierarchy; All symbol sets has a heading per set. A search lists its matches as one grid. The preview heading names the symbol's set and groups in full; each opens the palette at that group. In the panel, `↑`/`↓` move between results, `Enter` selects, and `Esc` clears the search and then closes the panel. A full SIDC typed into the search finds its symbol, also in the form the publications print (`S*G*UCI---*****`); a long word such as reconnaissance stays a word search.
- **Left column (sticky):**
  - Preview card: name, path, class badge (Unit, Equipment, Installation, Tactical point on APP-6A), the render state (Rendered, or a red "Check code / modifiers" when the symbol does not render cleanly), and the preview stage. Under it, Edit text (opens Amplifiers in Field positions) and two small download links, PNG and SVG. Exports always use the normal render.
  - The preview grid and the outline are switches in the Display tab; the grid is an editor aid only, exports have a transparent background.
  - SIDC console: wide enough for a 30-digit code on one line (on narrow screens Apply sits under it), Copy next to the length. Apply, `Enter` to apply, `Esc` to return to the current code. Messages appear inline only when there is something to say: applied, wildcard and standard-switch notes, and errors that name the SIDC position. The collapsible Code details section shows each part's meaning.
- **Right column:** three tabs.
  - **Symbol:** identity and status chips drawn by the renderer for the current symbol, context, unit designation (with the S staff length under Headquarters while it is on; on APP-6A equipment the flag is Location offset), echelon or mobility (a picker that draws each choice on the current frame, all at one scale with the frame on the line of the text and in the modifier color when it is on, with its SIDC code; 2525E and APP-6E dismounted individuals also take Leader individual, and the control is then named Leadership), country or organization (a picker with each flag beside its name and the code it writes in the current standard; flags the standard does not code, such as NATO, the EU or England, follow under their own heading as display only; letters typed in the open list spell a name, accents optional), and edition-specific icon modifiers (pickers that draw each modifier alone on the current frame, with the groups of the symbol set; a sector code the entity may not use is listed but cannot be chosen) and frame shape (a picker that draws each shape for the current identity). Every disabled control states its reason.
    - Friend, Hostile, Neutral and Unknown are shown first; More identities holds the other choices and names any selected secondary identity even while closed. Information buttons beside section headings open dismissible boxes with position numbers and publication explanations, without shifting the form. Click outside, press Escape or use Close to dismiss. Adjustment warnings and the reason a control is off stay on the page, next to the control.
    - Identities: APP-6A offers its nine Annex B identities (including joker and faker). APP-6B and 2525C offer the seven standard identities with a Reality / Exercise context; exercise writes G, W, M, D, L, J or K into position 2. D/E editions offer the seven identities 0–6 with Reality / Exercise / Simulation in position 3, and exercise suspect and hostile are shown as Joker and Faker.
  - **Amplifiers:** two views of the same values. Field positions puts a box for each applicable field around the symbol in the order the standard places it; the boxes are spaced apart for typing, so the preview, not the boxes, shows the exact placement. A country flag keeps its place there too. The List shows only the fields that apply to the symbol in the selected edition, under the edition's own names, in fixed groups; a search (name or code) and "Filled only" hide fields without touching their values and say how many filled fields they hide. A help line at the bottom of the list, always the same height, shows the focused field's rule, format and example (edition-specific: APP-6A W DDHHMMSSZMONYY and Y latitude/longitude, 2525C W DDHHMMSSZMONYYYY and an AO without a code list, APP-6D installation AI component types). "Not available for this symbol", closed under the list, names the edition's fields that do not apply to the symbol class or identity and the graphics the standard defines that this editor cannot set (2525C AH/AI/AK and the S offset, APP-6A installation S offset, APP-6D Land Unit AC and installation Q offset line). Fields of other editions are not listed. Q (direction of movement: slider and degrees) and AJ (speed leader) are graphic amplifiers in the list, after Z (speed), shown only where the edition gives them to the symbol class (not on 2525C or APP-6D installations, where APP-6D Q is the offset location line; APP-6A has no AJ); a value set earlier is kept, unsent, and the closed list says so. Field positions lists them under "Not drawn here". W has "Now (UTC)" in the field's format; J has a reliability/credibility picker that opens on request; APP-6D AO is built from lists, with the bar colour (target, non-target, expired) under it for hostile tracks.
  - **Display:** display switches (fill, frame, icon, text labels, country flag, outline), size, stroke, palette and stack (not in APP-6A); an Editor card for what stays out of exports, kept in this browser (preview background: light, dark or map; preview grid); and, closed under "More style options", three groups: Colors (custom fill color, monochrome, modifier color for HQ staff, task force, feint/dummy, installation, echelon and mobility, with a note when the symbol has none of them, and fill opacity), Text (color, background, size) and Outline (width, color). None of the style options change the SIDC.

Below 900 px the two columns stack: the preview shrinks and stays on top while the settings scroll, with the SIDC and Copy in its card, the code console comes after the settings with its breakdown folded into Code details, and the notes come last. The preview shrinks further while a text amplifier field has the cursor. On short screens the card does not stay, and the compact symbol in the tab bar links to it. Touch screens get 44-pixel targets.

The symbol draws before the flag artwork arrives: `flags.json` is the largest download, so it loads after the first render, and the flag list says Loading flags… until then. The Studio runs the minified bundle.

Exports are named `standard_sidc_symbol-name`, for example `app6e_160310000012110000000000000000_infantry.png`. PNG exports are three times the symbol size; the tooltip of the PNG button gives the size in pixels.

A country flag sits as in the Unit Generator: 20 units right of the frame and 10 up from its bottom, whatever the text. The two text rows beside it start 70 units further right, through the library's `country_flag` option.

APP-6E shows a Compatibility view badge beside the render state, because its symbols come from the shared 2525E catalog.

The Amplifiers tab provides 27 text controls (plus Q and AJ) grouped by purpose: identity and
organization, information and assessment, time/location/movement, equipment and
installations, and engagement/maritime. New fields include quantity,
reinforced/reduced, staff comments, evaluation rating, combat effectiveness,
IFF/SIF/AIS, altitude/depth, speed, special headquarters, country text,
platform type, teardown time, common identifier, installation composition,
engagement bar and type, guarded unit, and special designator. Each field has
its identifier and guidance; actual placement follows the renderer's symbol-set
rules. APP-6A retains publication-specific applicability and length limits.
Reset clears every amplifier, including fields hidden by the current edition.
Text values are included in SVG/PNG, separately from the SIDC.

Graphic controls include speed-leader length, HQ staff length, and an optional
symbol stack outside APP-6A. E editions also offer frame-shape overrides,
encoded at SIDC position 23. Map range rings and
general-rank stars from the reference generator are separate features, not
rendered modifiers supplied by this library.

Echelon and mobility start unspecified, including after Reset or switching their
mode. A deliberately selected value is not silently replaced by clicking the
same mode. Search accepts names, function codes and full SIDCs; Clear / Escape
resets search and pagination. Section switches return the form to its top.
On short, narrow screens, the compact symbol links to the full preview/download panel.
A new editor draft opens on APP-6A; a saved draft restores its standard. Standards are grouped in edition order:
APP-6A/B/D/E, then MIL-2525C/D/E. The desktop preview receives approximately
one third of the workspace, with a larger symbol stage.

The SIDC input accepts `*` placeholders in letter-based publication examples,
including whitespace and line breaks copied from PDFs. Identity and status
placeholders use the current editor selections; other `*` characters become
`-` (unspecified). Explicit identity, status and modifier codes are preserved.
The input shows the resolved code, with `*` in a user-defined field that is
still empty. Copy and file names carry the code as drawn, with `-` there.
Numeric SIDCs are digits up to 30, except that position 23 of an edition E code
may hold `A`. A code of the other family is refused with a message that names the
standards that take it.

Applying a SIDC selects the matching catalog entry and synchronizes identity,
status, echelon/mobility, HQ/task force/feint, and numeric modifiers. Subsequent
control edits replace only their own SIDC fields, preserving country, order of
battle and national extensions. Unknown catalog entries retain their entered
function code. Numeric versions select their standard before decoding extension
fields (Table A-1): 11, 13 and 15 are MIL-STD-2525, 12, 14 and 16 are APP-6, and
10, which both D editions use, stays within the current NATO or MIL family.

APP-6B and 2525C print some codes on several rows (APP-6B `UCEC--` for Engineer
Combat and its bridging, mine and diving rows; 2525C Hospital under two branches).
Each row keeps its own card, name and place in the palette, writes the same code
and so draws the same symbol; a note under the preview says so. A SIDC cannot tell
these rows apart: the search lists all of them and Apply opens the first. Two
APP-6B codes are corrected when the catalog is built, see
[Amplifier profiles](docs/edition-modifiers.md).

APP-6A (1998) displays 713 publication-derived S-scheme tactical symbols.
Seven of those entries are taxonomy headings without separate Annex D artwork.
They remain selectable, with a **Category** badge and an explanatory preview note.
G-scheme tactical graphics are excluded from this editor view and from manual
APP-6A code entry. The library retains its existing 907-entry point profile.
The editor provides
edition-specific SIDC validation, Present/Planned status, and automatic installation
modifiers. It reuses the library's NATO drawing primitives; it is not a complete
implementation of multipoint tactical graphics or weather symbols. See
[APP-6A support and publication errata](docs/app6a.md).

The current visual audit covers only the 713 S-scheme entries. Follow the local
commands in [APP-6A documentation](docs/app6a.md), then open
`/audit/symbols/index.html` for publication / before / current / difference views.
G graphics are excluded.

## Edition profile controls

Every edition has a profile, so the Studio keeps no copy of an edition's rules. The profiles in `src/modifierprofiles/` are copied to `vendor/modifierprofiles/` and queried at runtime (`studio/profile-controls.js`):

- **Offered values.** Each candidate identity, status, HQ/task force/feint flag, echelon, mobility, towed array or sector code is written into the SIDC and passed to `profile.validate(sidc, {})`. A value is offered only if it adds no `*Errors` entry. Errors that every candidate shares (a bad sector elsewhere in the code) are ignored, so one problem does not hide every choice.
  - 2525C: identities D, L, M, J and K disappear for dimension Z; statuses C, D, X and F disappear for units; mobility and towed array appear for equipment only, echelon for units only. Task force is offered on every class, with a note off units.
  - APP-6D: context 1 and 2 are labelled "US only"; identity and status names come from `app6dIdentityName` and `app6dStatuses` (status 2-5 is not offered for Land Unit); amplifier values follow the symbol class, and HQ, task force and dummy are offered on every class because Annex A defines them for every dimension; the sector 1 and sector 2 selectors list only the codes of the Annex A dictionary for the symbol set, show where the sector sits (`sectorPlacement`, left and right for Air Missile) and disable codes the current entity may not use. The engagement bar AO is three dropdowns (A, BBB, CC) that compose `A:BBB-CC`; the counts for MLT come from the profile's own grammar.
  - APP-6A: identity `O` is never offered; an imported `O` stays as a flagged chip. The `uncertaintyMarker` option (publication default, field E, inside the frame) appears for pending, assumed friend and suspect.
  - APP-6(B), MIL-STD-2525D, MIL-STD-2525E and APP-6(E): fields, flags, statuses and amplifiers follow each symbol class, from Table I, Table VII, Table VI and Table 1-5 with the placement figures. HQ, task force and dummy are offered on every class, with a note where the class table gives them no field. APP-6(B) offers status A and P only. 2525D land units have no operational condition; 2525E and APP-6(E) land units do. 2525E and APP-6(E) add the restricted target and no-strike contexts (3-8); APP-6(E) draws their marks. The positions, the decisions where a table and a figure disagree, and the limits are in [Amplifier profiles](docs/edition-modifiers.md).
- **Warnings and errors.** A text value that breaks the edition's format, such as a two-digit year where the edition wants four, shows a warning under its field. The text is still drawn and the state stays Rendered. "Check code / modifiers" is for a code the edition does not define or a field the symbol does not take.
- **Rejected selections.** When a symbol or edition change leaves a value the profile rejects, the Studio falls back (Present, Friend, unspecified echelon) and says so beside the control. An applied SIDC is never rewritten: its rejected values stay, flagged "not valid here".
- **Field metadata.** `minLength`, `pattern`, `alternates`, `examples`, `unresolved` and `supported:false` from the field definitions drive hints, format warnings, datalist suggestions and a "Defined for this symbol, not editable here" list.
- **Text that changes meaning.** The Studio remembers under which field definition each text was typed. When the edition or symbol makes the field absent, or gives the same code a different meaning (APP-6D K on units, equipment and installations; P as IFF/SIF or AIS; AC as country text or installation graphic), the text is kept and a non-blocking "Check these entries" list explains it, with a Clear button. A select value the new edition does not define is cleared with a note and returns when a list defines it again.
- **Profile notes.** `details.notes`, `details.unresolved` and `details.versionExtension` appear under the SIDC console.

## Distribution and attribution

This is an independent modified version of
[milsymbol by Måns Beckman / Spatial Illusions](https://github.com/spatialillusions/milsymbol).
The original `LICENSE` and bundle license banner remain intact. The editor's
catalog uses `mil-std-2525`, `milstandard-e` and `stanag-app6`, each distributed
under MIT with its original copyright notice. The build includes their full
license texts in `THIRD_PARTY_LICENSES.txt`, linked from the editor, and copies
the original library license to `LICENSE.txt`.

For a public site, run `npm run studio:build:public` and publish **only**
`dist/studio-public/`, not the local `dist/studio/` audit directory. This separate
allow-listed build omits PDF reference images, audit snapshots and local hosting
configuration. Its publication-audit link is hidden. Nothing is deployed by
this command.

### GitHub Pages

The `.github/workflows/pages.yml` workflow runs the rendering tests, builds the
public site, and deploys only `dist/studio-public/`. It runs on pushes to `main`
and can also be started manually from the Actions tab. In the fork's
**Settings → Pages**, select **GitHub Actions** as the publishing source. Forks
may also require enabling Actions before their first run.

The site uses relative asset URLs, so it works at a repository subpath such as
`https://<owner>.github.io/<repository>/` without changing the renderer or
adding a framework. PDF references and generated visual-audit files stay local;
they are not required by the build or deployed by the workflow.

Using GitHub's Fork button is recommended for the visible upstream relationship
and future contributions; MIT does not require it. Preserve original copyright
and permission notices whether publishing a fork, another repository or a static
site. Do not publish an unchanged upstream package name as though this were an
official release. The editor explicitly identifies itself as an independent
extension and does not claim full APP-6A conformance.

The NATO publication is a separate reference document, not relicensed by the
software's MIT license. PDF/crop redistribution rights have not been established;
keep them local unless separately authorized. These packaging measures are not
a legal certification of every possible use of the standard.

Country and organization flags are available in the Symbol tab for every edition.
The Studio uses a separate SVG extension and MIT-licensed flag-icons artwork,
plus a public-domain NATO flag (provenance in `studio/flags/NOTICE.txt`),
not the proprietary country-flag extension from Spatial Illusions. The selected
flag sits at the lower right, beyond the complete symbol width, preserving labels and arrows.
SVG download, SVG copy, compact preview, and PNG export share the same embedded
vector artwork. The artwork represents the same national flags, but is not a
pixel-identical copy of the reference site's proprietary assets. Flags are
bundled locally and require no external service.

Country selection and SIDC entry are linked in both directions:

- APP-6A / APP-6B: FIPS 10-4 country code at positions 13–14 (`TU` for Türkiye);
  both name the FIPS Pub 10 series (APP-6A B.4.1.5).
- MIL-STD-2525C: ISO 3166-1 alpha-2 at positions 13–14 (`TR` for Türkiye).
- APP-6D / MIL-STD-2525D: ISO 3166-1 numeric at positions 21–23 (`792` for Türkiye).
  This is the **symbology originator** of national extensions, not a separate
  nationality field. APP-6D Annex A, Figure A-1, A.12 and Table A-9 define it;
  MIL-STD-2525D A.5.5 uses the same arrangement. The Studio uses that originator
  country for the flag. Positions 24–30 remain the originator's symbol set/data.
- MIL-STD-2525E: GENC numeric nationality/country code at positions 28–30
  (`792` for Türkiye; A.5.5.4 says the US shall use GENC). GENC adds numbers
  from 900 for entities ISO 3166-1 does not list, such as Kosovo (901).
  Positions 21–22 remain common modifier identifiers, and 23 remains frame shape.
- The Studio's APP-6E compatibility view shares the 2525E catalog and encoding;
  it does not claim a separately verified APP-6E catalog or SIDC layout.

The renderer applies the common modifier identifiers at 21–22 only in edition E;
an edition D national-originator code cannot change the core symbol's modifiers.

Applying a SIDC selects its country automatically. Empty, incomplete or unknown
country fields clear any previous flag; there is no fallback between FIPS and
ISO. Selecting another country preserves the rest of a custom SIDC, including
order of battle. The flag list puts the flags the standard's code list codes
first. Organizations (NATO, EU, UN), regions (England, Catalonia, the Canary
Islands) and entities a list splits or folds into another (Åland in FIPS and
GENC, Palestine in FIPS) follow under "No code in this standard · display only":
they draw the flag, say so, and clear any previous country code. Switching
standard keeps the selected flag and encodes it for the new edition when that
edition codes it. The Country (AC) free-text amplifier remains independent. Reset
clears the flag. Historical dissolved countries are not silently mapped to
modern successors. Mapping provenance is recorded in `studio/country-code-data.js`.
