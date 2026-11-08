# APP-6(D) Edition D Version 1: modifier and identity profile

> **Status (2026-11-08):** the library now draws APP-6(D) exactly as upstream
> milsymbol 3.0.5. This profile lives in `studio/profiles/app6d.js` and only checks symbols in the
> Studio, through `studio/edition-check.js`. Where this page says what the renderer
> draws, it describes the fork before that date. `docs/upstream-parity-removals.md`
> lists those changes and how to restore them from the tag
> `archive/before-upstream-parity`.

Source: `APP-6D_EDD_V1_E.pdf` (922 physical pages). Citations are "PDF physical page / printed page". The Studio applies the profile to a numeric SIDC with version 10-12 in its APP-6(D) view (standard `APP6`, not 2525). Code: `studio/profiles/app6d.js`, `studio/profiles/app6d-sectors.js`; tests: `test/app6d-modifiers.test.js`.

Scope: symbol sets 01, 02, 05, 10, 15, 20, 30, 35, 36 and 00 Unknown (fallback). Sets 11 (civilian organization) and 27 (dismounted individual) are classified and deliberately not profiled; 25, 40, METOC, 50-54, 60-64 and 06 are untouched.

## Identity, context, status (Table A-2 PDF 718/A-4; A-6 PDF 723/A-9; section 1.2.1 PDF 33/1-9)

| Digit | Rule |
|---|---|
| 3 context | 0 Reality; 1 Exercise and 2 Simulation are US-only (note 1); 3-9 reserved: error |
| 4 identity | 0 Pending, 2 Assumed Friend, 5 Suspect are uncertain (dotted frame, status not shown); 1, 3, 4, 6 certain (present solid, planned dashed); 7-9 reserved: error. Joker/Faker names exist only with context 1 (note 2). Groups follow Table A-3 PDF 719/A-5: 5 and 6 are the Hostile group |
| 7 status | 0-5; 6-8 reserved: error; 9 Version Extension Flag, reported under `details.versionExtension` (valid=false: extension content cannot be interpreted). 2-5 (operational condition) are N/A for Land Unit (Tables 1-3/1-4 PDF 35/1-11) |
| 8 HQ/TF/dummy | 0-7 on every class (A.9 item 2 PDF 724/A-10: "each combination of Standard Identity group, dimension" and these codes); 8 reserved; 9 VEF. The class tables give Land Unit 0-7, Equipment 0-1, Installation 0-3, others 0; a code outside that adds a note, not an error |
| 9-10 amplifier | Table A-8 PDF 724-726/A-10..A-12. Echelon 11-18, 21-26 (Land Unit, Installation); mobility 31-37, 41-42, 51-52 (Equipment); towed array 61-62 (Sea Surface, Subsurface); 71-72 leadership is set 27 only; 19/29/x9 VEF; reserved: 27-28, 38, 43-48, 53-58, 63-68, 73-78 and the whole 8x group; 9x VEF |

Rendering (only under the guard): uncertain identities use the dotted frame and the planned dash is not added (existing `notpresent` precedence, now covered by tests); Joker/Faker keep the Hostile frame instead of the 2525 Friend shape; Land Unit draws no condition bar. Operational condition uses the Table 1-4 bar (alternative representation); Full-to-capacity blue is one library colour because the PDF gives no RGB (Air/Space/Subsurface darker, Equipment/Installation/Sea Surface lighter in the figure).

Unknown dimension 00: Friend is the circle with `?` (Sea Friend geometry plus the unknown-dimension question mark); checked by image and by test.

Image check of identity and status (figures in `output/tactical-modifier-research/visual/app6d/`, compared with Table 1-2 PDF 33/1-9, Tables 1-3/1-4 PDF 35/1-11 and Table A-3 PDF 719/A-5):

- The seven identities draw the Unknown clover (Pending dotted, Unknown solid), the Friend rectangle (Assumed Friend dotted), the Neutral square and the Hostile diamond (Suspect dotted). Joker/Faker (context 1) draw the Hostile diamond with the 2525-style "J"/"K" letter; simulation draws "S". The APP-6D PDF only says exercise and simulation frames follow MIL-STD-2525(D) (A.6 item 3 PDF 719/A-5), so those letters are inherited and not source-checked here.
- Planned status is dashed on Unknown, Friend, Neutral and Hostile and is not added to the dotted frames of Pending, Assumed Friend and Suspect (section 1.2.1 item c(3) PDF 33/1-9); Air, Sea Surface and Subsurface frames behave the same.
- Operational condition: the Table 1-4 bar is drawn under Equipment, Sea Surface, Subsurface, Air and Installation (green, yellow, red, blue), nothing under Land Unit (N/A); monochrome mode draws one slash for Damaged and an X for Destroyed (Table 1-3). The blue of Full to capacity is a single colour.
- Exercise context with the Unknown dimension draws a frame only for Pending and Unknown (inherited MIL-STD-2525(D) rule); other identities draw nothing, and the profile now adds a note instead of silently returning `valid` with an empty symbol.
- HQ staff, task force bracket, feint/dummy V, echelon, mobility and towed-array amplifiers combine on Land Unit, Equipment, Installation, Sea Surface and Subsurface frames without overlapping the icon or each other. Long text fills both columns of Land Unit, Equipment, Air, Space, Sea Surface and Subsurface in the profile rows.

## Field matrix per class (placement = source order, left/right rows top to bottom)

| Class | Left | Right | Top / inner / bottom | Source |
|---|---|---|---|---|
| Air, Air Missile | none | T; P (IFF/SIF); V; Z X; G H | AO | Fig 2-2 PDF 54/2-4, Table 2-2 PDF 55-56/2-5..2-6 |
| Land Unit | AR W; X Y; V AD AE; T; Z | F; G; H AF; M; J K P | C top (B/C/D cell above the echelon), AO, AA inner, AH bottom | Fig 3-3 PDF 84/3-4, Table 3-2 PDF 85-88/3-5..3-8 |
| Land Equipment | W; X Y; V AD AF; T; Z | AC; G; H AE; M; J K L N P | C top | Fig 3-14 PDF 161/3-81, Table 3-16 PDF 162-164/3-82..3-84 |
| Land Installation | W; X Y; AI; T | AC; G; H AE; M; J K | none | Fig 3-18 PDF 216/3-136, Table 3-22 PDF 217-219/3-137..3-139 |
| Sea Surface | AQ AR | T; V; P (AIS); G H; Y Z | AO | Fig 5-3 PDF 293/5-5, Table 5-2 PDF 294-295/5-6..5-7 |
| Subsurface, Mine Warfare | AR | T; V; X (depth); G; H | AO | Fig 5-6 / Table 5-9 PDF 326-327/5-38..5-39; Table A-5 PDF 722/A-8 |
| Space | none | T; V; Z X; G H | AO | Fig 6-2 PDF 361/6-4, Table 6-2 PDF 362-363/6-5..6-6, section 6.2.4 item 2; shared cells from Air Fig 2-2 PDF 54/2-4 (product policy, D-SPACE) |
| 00 Unknown | no source layout | | | Fig 1-4 PDF 34/1-10 has unlabeled cells; legacy rows kept, no field restriction (policy) |

Field semantics per class (not shared letters): AC is the installation graphic block on Land Unit (no option; `country` is rejected) and a three-letter country text on Equipment/Installation (STANAG 1059 reference; character set not given beyond letters). K is FO/SO/MO/NO/UNK on units, the four long descriptions on equipment, free capacity text on installations. P is IFF/SIF except AIS on Sea Surface. X is altitude, height in feet (equipment/installation) or depth (subsurface). Y has the 22-character limit on Land Unit only. W is `DDHHMM[SS]ZMONYYYY` on units and `...YY` on equipment/installations, or `O/O`. J is one letter A-F and one digit 1-6 (all 36 pairs). F is `+ - ±` (Table 3-9) with the parenthesised Table 3-2 forms accepted and noted; only at echelon 11-18/21 (or unspecified). L `!` and N `ENY` only on hostile-group equipment (Table 3-16 PDF 163/3-83). AQ is exactly `BG`, AR `NRT`/`SIG` on Sea Surface/Subsurface (free text with examples on Land Unit). AO is `A:BBB-CC` with the closed Table 1-5/1-6 dictionaries (PDF 40-41/1-16..1-17). The separator for shared positions is one space (product policy, the source gives none).

Fields not in a class table are errors (no other-edition borrowing): e.g. quantity on Air/Installation, DTG on Air/Sea, R2 SIGINT and AG anywhere. Quantity C is defined on Land Unit and Land Equipment only (Land Unit: D-UNIT-C below). Space accepts H and Z like any other field (D-SPACE).

## Sector modifiers (Annex A PDF 735-815; printed = physical - 714)

All 15 dictionaries (Tables A-11, A-12, A-14, A-15, A-17, A-18, A-20, A-21, A-26, A-28, A-29, A-35, A-36, A-38, A-39) are in `app6d-sectors.js` with 00, reserved ranges and 99 VEF. Air Missile sectors are left/right (section 2.3.7 PDF 66/2-16 Figure 2-4: the octagon is "turned 90 degrees to the left"; sector 1 = left, sector 2 = right; Tables 2-7/2-8 PDF 76-79), all others top/bottom (Air Figures 2-5/2-6 PDF 67, 73; Land Unit Figures 3-7/3-8 PDF 127, 139; Sea Surface/Subsurface section 5.2.3 item 3 PDF 292 and 5.3.6 item 3 PDF 325; Space Figures 6-4/6-5 PDF 370, 372).

Placement check (done by rendering and by coordinates): Figure 1-15 (PDF 49/1-25) divides the bounding octagon into .3L / .4L / .3L. With the library units (L = 100, centred on 100,100) sector 1 is 50-80 and sector 2 is 120-150, vertical for every set except Air Missile where they are the left and right bands. `test/app6d-modifiers.test.js` measures the extent of every defined dictionary glyph (330 codes in sets 01, 02, 05, 10, 15, 20, 30, 35, frame and main icon removed) and requires it inside its band (2.5 unit tolerance for control-point bounds and text width estimates); all pass. Air Missile sector 1 glyphs sit at x 56-80 and sector 2 glyphs at x 120-146, so the old M1 anchor x = 68 is inside the left band. Figures: `output/tactical-modifier-research/visual/app6d/`.

Icon collisions (section 1.2.2 item 5 PDF 43/1-19: "A modifier may not be placed in any sector where the modifier overlaps the icon"): measured against the main sector (.4L = 80-120). Air, Air Missile and Space icons never leave it (0 of 52, 1, 36). For sets 10, 20, 30, 35 the icons that leave it are almost exactly the ones the PDF tables label "Icon Type: Full Octagon" or "Full Frame" (those do not follow the sectors; section 1.2.2 items 3-4), so no modifier overlap is a rendering error there; 25 icons that the PDF labels "Main" still extend past the main sector (sea surface 121100; subsurface 120300; land equipment 160900, 201501, 220100; installation 111500, 120501, 121301, 121307, 121309, 121310; land unit 110501, 111100, 121102, 121803, 121804, 140400, 140900, 141702, 141900, 150400, 160300, 160400, 163000, 163300). Resizing icons "due to the presence or absence of modifiers" is allowed (section 5.2.3 item 2 PDF 291-292, section 1.2.2 item 2) but the PDF gives no factor, so no scaling was added; the existing Land Equipment scaling is unchanged.

Glyph difference found: Land Equipment sector 1 code 06 Radiological is drawn "RAD" by the shared icon part; Table 3-18 (PDF 210/3-130) shows "R". Not changed (the part is shared with 2525D/E and APP-6E, where the APP-6D guard is not known at icon-map time). Land Equipment has no sector 2 (section 3.4.7 PDF 210/3-130), Mine Warfare and Unknown have no dictionary.

Entity constraints (validation; the renderer also draws only defined codes and none on local tracks): Air 38/39 rotary-wing entities 1102xx/1202xx (Table 2-5 PDF 73/2-23); Air Missile sector 2 07-11 only with sector 1 08 (PDF 78-79); Space sector 2 01-04 only with satellite entities (Table 6-5 PDF 372/6-15; "Antisatellite Weapon" is not treated as a satellite: policy); Subsurface sector 1 02, 03, 08-18 and sector 2 01-13 submarine entity type 1101xx, sector 2 14-16 AUV/UUV 1104xx/1202xx (Tables 5-11/5-12 PDF 331-336); sector 1 code 19 is valid with a Torpedo 1301xx or a Submarine 1101xx entity and carries a D-SUB19 note (product policy, any other entity is an error); local tracks 30/160000, 30/170000, 35/140000, 35/150000, 35/160000 allow no sector modifier but still allow outer text amplifiers (PDF 316/5-28, 336-337/5-48..5-49); Own Ship 30/150000 Friend only, fused and ETC/POSCON Pending, IED 35/130200 Hostile only (Suspect does not substitute); Sea Surface sector 1 code 01 Own Ship is separate data. Installation remarks (Electric Power, Telecommunication, CRBN) are noted, not enforced.

## Decision record (appendix section 9)

| ID | Sources | Decision |
|---|---|---|
| D-AL-01 | Table 1-4 PDF 35 vs section tables | threat and condition colours are not merged; note emitted; bar uses Table 1-4 colours |
| D-UNIT-AL | Fig 3-3/Table 3-2 vs Tables 1-3/1-4 | status 2-5 is an error on Land Unit; no bar drawn |
| D-EQ-AO | Fig 3-14 vs Table 3-16 | AO accepted on Equipment with a note |
| D-INST-AE | Fig 3-18 vs Table 3-22 | AE rendered in the figure position with a note; equipment semantics not assumed |
| D-SPACE | Fig 6-2/Table 6-2/section 6.2.4 PDF 361-363, Air Fig 2-2 PDF 54/2-4 | **Product policy (Decision 3).** Table 6-2 lists G, H, T, V, X, Z; Figure 6-2 draws only T, V, X, G and section 6.2.4 item 2 says "fields 1 through 5" on the right. The Air figure of the same edition gives the right column T; P; V; Z/X; G/H and the Space figure is that column without P, so Z and H share the X and G cells. H and Z are ordinary valid fields (no `unresolved`, `valid` does not depend on them), right rows T; V; Z X; G H (speed before altitude, staff comments before additional information), with a D-SPACE note when used |
| D-F | Table 3-2 PDF 85 vs Table 3-9 PDF 149 | both literal forms accepted, note; no `R`/`D` glyph generated |
| D-W | Tables 3-2/3-16/3-22 | per-class DTG pattern |
| D-AO-TYPO | Table 3-2 PDF 88 | `A:BBB-CC` used |
| D-SUB19 | Table 5-11 PDF 334/5-46 vs A-38 PDF 814/A-100 | **Product policy (Decision 4).** Table 5-11 says "Used with TORPEDO entity type only", Table A-38 says "Used with SUBMARINE entity type only"; each normative table permits one entity, so rejecting either would invalidate a symbol the other allows. Sector 1 code 19 is valid with a TORPEDO (1301xx) or a SUBMARINE (1101xx) entity, with a note and no `unresolved`; any other entity is an error |
| D-UNIT-C | Fig 3-3 PDF 84/3-4, Table 3-2 PDF 85/3-5 | **Source reading (Decision 5).** Figure 3-3 draws the B/C/D cell above the frame and Table 3-2 has a C (Quantity) row, so Land Unit accepts C (`top: ["quantity"]`). The row description reads "A text amplifier in an equipment symbol", the generic wording repeated in the field tables, so a note is emitted when C is used on a Land Unit. Rendering: C is drawn above the echelon and task force bracket (the B/C/D cell), AO above C (Fig 3-3, Fig 3-14 PDF 161/3-81) |
| D-EXT | Fig A-1 PDF 717 vs A.12 PDF 730 | only the 20-digit base is validated; 30 digits get a note |
| D-OFFSET | section 1.2.1 item 6 PDF 36/1-12 vs 3.3.9 PDF 151-152/3-71..3-72, Table 3-2 S row PDF 86/3-6 | Section 1.2.1 item 6 says the offset location line extends "downward from the left side of a frame or an appropriate anchor point on an icon" and has an elbow to the actual location; section 3.3.9 item 1 draws it "from the centre of the bottom of the frame" for ordinary units and item 2 "from the bottom left hand corner" for headquarters (Figures 3-9 to 3-12). The only offset-type graphic the renderer has is the headquarters staff, anchored at the left of the frame (bottom-left corner on rectangles), which matches section 3.3.9 item 2. A general offset line needs the application's actual location (length, elbow); no option carries it, and the two sections disagree on the anchor, so nothing was added and nothing changed. Open |
| D-K-EQ | Table 3-2 vs 3-16 | per-class K dictionaries |
| D-AC | Table 3-2 vs 3-16/3-22 | per-class meaning kept in the data model |
| A.11 item 2 | PDF 727/A-13 | entity Unspecified with non-zero remainder: note only (policy: the symbol-table tests build sector-only SIDCs) |

## Coverage limits

No image-by-image audit of the main icon or sector glyph tables was done (graphics come from the existing icon parts; the profile checks codes and sector placement, not glyph shapes). Offset/HQ staff anchors, Table 1-7 frame sizes, towed-array glyph geometry, engagement bar colours/contrast and 30-digit extensions were not re-verified. Studio changes (field choices, identity/status/amplifier pickers, sector dropdowns from `app6d-sectors.js`) are not implemented.
