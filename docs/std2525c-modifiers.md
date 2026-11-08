# MIL-STD-2525C scheme S modifier profile

> **Status (2026-11-08):** the library now draws MIL-STD-2525C exactly as upstream
> milsymbol 3.0.5. This profile lives in `studio/profiles/std2525c.js` and only checks symbols in the
> Studio, through `studio/edition-check.js`. Where this page says what the renderer
> draws, it describes the fork before that date. `docs/upstream-parity-removals.md`
> lists those changes and how to restore them from the tag
> `archive/before-upstream-parity`.

Source: MIL-STD-2525C, 17 November 2008. Page citations give the physical PDF
page first and the printed page second (printed = PDF - 6). Code:
`studio/profiles/std2525c.js`, run by `studio/edition-check.js`.

## Scope and activation

- The Studio applies the profile to letter SIDCs in its MIL-STD-2525C view. The
  library has no 2525C mode: that view renders with `ms.setStandard("2525")` (the
  2525B/C mix), exactly as upstream.
- Scheme S only. Every other first character (G, I, O, E, W) gets a neutral
  result: no field restriction, always valid, no layout. S-scheme rules are not
  applied to them.
- `validate()` returns `details.modifierErrors` (source-backed violations, which
  make the Studio check false) and `details.notes` (source tensions and product
  policy, which do not).

## Symbol class

Class is the real object class, derived from SIDC positions 3 and 5:

| SIDC | Class |
|---|---|
| dimension G, function ID starts with `I` | installation |
| dimension G, function ID starts with `E` | equipment |
| dimension G, any other (`U...`, `------`) | unit |
| dimension P A S U (space, air, sea surface, subsurface) | equipment (Table IV note 2, PDF 30 / 24) |
| dimension F (SOF) | unit (see decision 12) |
| dimension Z X | unknown: only fields that apply to U, E and I alike are open |

Limits: the class is read from the first function letter, so a hand-written
function ID is classified by that letter only. The `H` installation modifier
(SIDC 11) does not change the class; a unit shown with H keeps the unit fields.

## Table IV matrix (PDF 28-30 / printed 22-24)

`G` graphic, number = maximum display characters, `-` not applicable. 39 entries:
the 37 Table IV rows plus AM and AN (Table XIV only; always `-` for U/E/I).
The data is `std2525cTableIV` in the profile; Studio, validator and layout read
the same table.

| Field | Key | U | E | I | Notes |
|---|---|---|---|---|---|
| A | icon | G | G | G | catalogue icon |
| B | echelon (SIDC 12) | G | - | - | Table A-II echelon letters |
| C | quantity | - | 9 | - | `9` with note 3, not "93" and not an installation value |
| D | taskForce (SIDC 11) | G | - | - | |
| E | frameDescriptor (derived) | G | G | G | exercise `X`, Joker `J`, Faker `K` |
| F | reinforcedReduced | 3 | - | - | display `(+)` `(-)` `(±)` |
| G | staffComments | 20 | 20 | 20 | free text |
| H | additionalInformation | 20 | 20 | 20 | free text |
| J | evaluationRating | 2 | 2 | 2 | `[A-F][1-6]`, 36 pairs |
| K | combatEffectiveness | 5 | - | 5 | free text, SO value 3 not carried |
| L | signatureEquipment | - | 1 | - | `!` only, hostile equipment: identity H only (decision 13) |
| M | higherFormation | 21 | - | - | |
| N | hostile | - | 3 | - | `ENY` only |
| P | iffSif | 5 | 5 | 5 | |
| Q | direction | G | G | - | |
| R | mobility (SIDC 11-12) | - | G | - | `MO`-`MY`, equipment only |
| R2 | sigint | - | - | - | SIGINT only |
| S | headquarters / offset | G | G | G | HQ staff via SIDC 11 A-D |
| T | uniqueDesignation | 21 | 21 | 21 | |
| V | type | - | 24 | - | |
| W | dtg | 16 | 16 | 16 | `DDHHMMSSZMONYYYY`, short forms, `O/O` |
| X | altitudeDepth | 14 | 14 | 14 | alternatives in 5.5.2.5 |
| Y | location | 19 | 19 | 19 | |
| Z | speed | 8 | 8 | - | |
| AA | specialHeadquarters | 9 | - | - | inside the frame |
| AB | feintDummy (SIDC 11) | G | G | G | |
| AC | installation (SIDC 11 `H`) | G | G | G | graphic block, not a country |
| AD AE AF | platformType, equipmentTeardownTime, commonIdentifier | - | - | - | SIGINT only |
| AG | towedArray (SIDC `NS`/`NL`) | - | G | - | |
| AH AI AK | dynamic map graphics | G | G | - | not rendered (reported) |
| AJ | speedLeader | G | G | - | static line of caller-given length |
| AL | operational condition (status C D X F) | - | G | G | |
| AM AN | distance, azimuth | - | - | - | Table XIV only |
| AO | engagementBar | G/8 | G/8 | G/8 | length 8 only; no `A:BBB-CC` grammar in 2525C |

A value that is only whitespace (what `String.prototype.trim()` removes, including
no-break and ideographic spaces) is empty: it creates no row, reserves no
separator, and is not "present" for validation. Non-blank text is not trimmed.
This is product policy shared by all three edition profiles and implemented in
`src/modifierprofiles/common.js` (`isBlank`, `joinFields`, `clearBlankText`,
applied by the Studio check to a copy of the symbol's options). The source does not
define whitespace handling.

Display length is counted in Unicode code points (a modern-display choice; the
transmission lengths of Table XIV are ASCII and are a separate matter). The
source gives no character set, so none is enforced.

## Values

- **J**: reliability A-F and credibility 1-6, 36 pairs (Table IV, PDF 28 / 22).
- **L**: `!` only, and only on equipment of identity H (decision 13). Suspect (S),
  the exercise identities and Joker/Faker (J, K) are not hostile and are rejected;
  the unavailable reason reads "L is for hostile equipment (identity H only)".
- **N**: `ENY` only. Independent of identity H: choosing H does not generate it
  and `hostile: "ENY"` does not change the SIDC.
- **F**: the API accepts the display forms `(+)`, `(-)`, `(±)`. The transmission
  codes `R`, `D`, `RD` (Table XIV) are a different representation: they are
  rejected with an explanatory error and are not mapped silently. The combined
  reinforced-and-reduced glyph (plus over minus) has no ASCII form; `(±)` is the
  closest character and is a product choice.
- **W**: length 16. Long `DDHHMMSSZMONYYYY`, short forms such as `DDHHMMZMONYY`
  and `O/O` are all accepted; no regex is invented. On order is status `A` plus
  W `O/O`; W `O/O` with any other status is a modifier error (5.3.1.4).
- **X**: length 14. The documented alternatives (GL/MSL, relative altitude with
  FT/M/KM/SM, depth in FT, AGL/AMSL/HAE/BMSL, FL nnn) are content guidance, not
  enforced beyond the length.
- **Q**: any value; no closed range because 2525C defines none.

## Status (Table A-I, PDF 57 / 51)

A planned (dashed frame); P present, "Units only"; C, D, X, F equipment and
installations only (units are an error, the renderer draws no AL on units).
P on equipment/installation is allowed and recorded as a note (decision 5).

**AL operational condition, checked against the PDF (Tables III-1 and III-2, PDF 24-25 / 18-19;
5.3.4.12, PDF 37 / 31).** Alternate form (default, `simpleStatusModifier` off, filled):
a bar under the symbol, as wide as the frame (the PDF shows 92-100% of the symbol
width), green fully capable (C), yellow damaged (D), red destroyed (X), blue full to
capacity (F). The colours sampled from the PDF page render are (0,255,0), (255,255,0),
(255,0,0) and (0,176,240); the renderer uses (0,255,0), (255,255,0), (255,0,0) and
(0,180,240), so full-to-capacity differs by 4 in one channel and was not changed (a raster
sample is not a normative value). Static form (`simpleStatusModifier`, monochrome or
unfilled): a slash rising to the right for damaged, a cross for destroyed, nothing for
fully capable (Table III-1 note 1: "fully capable ... or when the operational condition
is unknown"), and nothing for full to capacity (N/A in III-1; a note records it).
Applies to air, space, land equipment, land installations, sea surface and subsurface;
never to units or the F (SOF) unit class. Planned A and present P draw no bar or slash.
The P-on-equipment reading "rendered using the applicable operational condition modifier"
(Table III, PDF 24 / 18) would give a green bar in the alternate form; the profile keeps the
SIDC as given and records it as decision 5 instead of inventing a bar for P.

## Identities (Tables I/II, A-I)

All 14 codes P U A F N S H G W M D L J K are accepted. Joker and Faker use the
Friend shape in the hostile (red) colour with descriptor J/K; exercise codes use
the X descriptor. Unknown dimension Z with D, L, M, J, K is N/A in Table II: a
modifier error and no frame. Battle dimension X (Other) is "No frame" in Table
A-I: the renderer draws no frame or question mark and a note records it.

## SIDC 11-12 (Table A-II, PDF 58-60 / 52-54)

First character `-` or `A`-`G` with second `-` or `A`-`N` (N is Command);
`H-` and `HB` only (no HA, HC...); `MO`-`MY` mobility; `NS`/`NL` towed array.
The validator and renderer share `std2525cModifierRules`: invalid or inapplicable
echelon, mobility and array are neither drawn nor accepted. Echelon letters are
unit-only and mobility is equipment-only and not intrinsic to the icon. Task-force
codes (B, D, E, G) are valid and drawn on every class: Table IV gives D to units,
but positions 11-12 are user-defined (A.5.2.1 PDF 56/50) and Table A-III prints
them as `**` on sea symbols such as NAVY TASK FORCE, so off a unit they add a note.

**Towed array (AG, `NS` short, `NL` long).** Source: Table IV AG (PDF 30 / 24): "a
graphic modifier for equipment" with U and I as dashes; 5.3.4.4 (PDF 33 / 27): "only
used for towed equipment"; Table VII (PDF 34 / 28): short and long arrays drawn
on a submarine in every identity; Table A-II (PDF 60 / 54): `NS`, `NL`. Enforced:
equipment class only (units, installations and the SOF unit class get an AG error and
draw nothing; an unknown-class symbol, dimension Z or X, is not rejected because its
class cannot be told). Not enforced, because the source says nothing: restriction
to sonar, subsurface or sea symbols (Table VII shows only a submarine, which is an
example, not a rule). Short draws 3 markers and long 5 on a 100 unit line below the
symbol, as Table VII. The inner marker glyph differs (the PDF shows a square with a
tick, the renderer a diamond); it was not changed.

## Layout (Figure 2, PDF 27 / 21; 5.4.4, PDF 40 / 34)

Left rows, top to bottom: W; X Y; V; T; Z (right aligned). Right rows: E F; G; H;
M; J K L N P (left aligned). Joined with one space, empties collapse. Quantity C
is in the top group, AA inside the frame. Keys that do not apply to the class
are removed from the layout, so they are not drawn. The derived E descriptor
(X, J or K) is the first token of the E/F row when F text is shown (`X (+)`); it
is then not drawn a second time. Without F it stays the bold frame marker.
AB, AO (above), R/AG and the AL bar (below) are graphics drawn by their parts.

## Decision records (appendix section 8)

1. **C quantity 9 with note 3** (PDF 28 / 22, PDF 52 / 46): implemented as U- E9 I-.
2. **K columns** (PDF 28 / 22): U5 E- I5; SI and SO values are not carried to S.
3. **F glyph** (PDF 28 / 22): display `(+)` `(-)` `(±)` and transmission R/D/RD kept
   distinct; see Values.
4. **Identity dotted contour vs status** (Tables I/II, 5.3.1.4): identity
   uncertainty (`metadata.identityUncertain`) and planned status
   (`metadata.plannedStatus`) are separate data. The existing identity contour
   rendering is kept. When both apply the source gives no combining algorithm; a
   note records it. APP-6D's precedence rule is not copied.
5. **P status vs catalogue** (Table A-I vs Table A-V): the SIDC is never
   rewritten; P on equipment/installation yields a note, not an error.
6. **Full to capacity** (Tables III-1 / III-2, A-I): F is accepted on equipment
   and installations; a note records the N/A row in III-1.
7. **AG transmission** (Table XIV R/AG, A-II): display graphic, transmission
   field and SIDC encoding are separate; `NS`/`NL` are two SIDC characters.
8. **E transmission** (Table XIV SIDC 3-4 vs Table A-I position 2): the identity
   is read from position 2 as Table A-I defines it.
9. **Special C2 reference** (PDF 206, C.4.4.2 not found): AA is kept as the inner
   text only; no new glyph is added.
10. **AO grammar**: only the 8-character limit is enforced.
11. **AB cross-reference** (5.3.4.7 says table III): the field definition in
    Table IV is used.
12. **SOF class (F dimension stays a unit)**. Table IV note 2 (PDF 30 / 24) says
    "Equipment includes air, space, sea surface, subsurface, and SOF, as well as
    land-based equipment as shown in table I". Three pieces of evidence say that
    the note covers SOF *platforms*, and those are already equipment through
    another dimension, while the F dimension itself holds units only:
    - SOF aircraft are in the AIR dimension (Table A-III, PDF 63-64 / 57-58:
      `WAR.AIRTRK.MIL.FIXD.SOF` and `WAR.AIRTRK.MIL.FIXD.DRN.SOF` on PDF 63,
      `WAR.AIRTRK.MIL.ROT.SOF` on PDF 64, all with SIDC dimension `A`), so they
      take the equipment fields as air.
    - Every F entry of the symbol hierarchy is a unit: 1.X.6 "SPECIAL OPERATIONS
      FORCES (SOF) UNIT", and the children are "SOF UNIT ..." (Table A-III, PDF 94 /
      88; catalogue pages from PDF 303; `WAR.SOFUNT`, SIDC dimension `F`). There
      is no equipment entry under F.
    - 5.3.1.3 (PDF 23 / 17): "All units, regardless of service affiliation ... are
      depicted with a rectangle frame"; the SOF frame is the unit rectangle.
    Result: dimension F is class "unit" (no code change, `std2525cSymbolClass`
    returns "unit"). Equipment-only fields (C L N R V) are errors on F, and unit
    fields (B D F K M AA) are open. This is a reading of the note against the
    catalogue, recorded as product policy; no note is emitted per symbol because
    no remaining ambiguity applies to the F catalogue entries.
13. **L identity (H only)**. Table IV L (PDF 28 / 22): "A text modifier for hostile
    equipment; ! indicates detectable electronic signatures". Hostile is the
    identity H (Tables I/II). The standard defines Suspect separately, as an
    identity that is "potentially hostile because of its characteristics,
    behavior, origin, or nationality" (3.2.42, PDF 16 / 10), so S is not hostile
    equipment. Joker, Faker (J, K) and the exercise identities are not hostile
    either. L is therefore accepted only for equipment of identity H. APP-6A
    (Table III "hostile equipment only", PDF 25 / 19; definition 32 Suspect, PDF 16
    / 10) reads the same way. A previous reading of the 2525C profile allowed H and
    S; that was removed. (The Studio helper `studio/editor-helpers.js` may still
    mention H/S; it is not part of this profile and is reported to the Studio
    owner.)

## Coverage limits

No full image audit of the catalogue was done: the 860 framing declarations, the
FO icon pairs and the full Table A-III/A-V reconciliation are not checked. AH, AI
and AK (dynamic map graphics) and offset location are not rendered. Tests cover
the rules above through `test/std2525c-modifiers.test.js`; they are not a
certificate that every 2525C symbol is visually correct.
