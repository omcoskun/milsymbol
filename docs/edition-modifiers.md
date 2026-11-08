# Amplifier profiles: APP-6(B), MIL-STD-2525D, MIL-STD-2525E, APP-6(E)

These four editions have modifier profiles, as MIL-STD-2525C and APP-6(D) do. A profile says which fields a symbol class has, how long they may be, which values they take and where each field belongs.

Since 2026-11-08 the library draws these editions exactly as upstream milsymbol 3.0.5, for example with `/` between fields in one cell, and does not apply the profiles. The Studio uses them to check a symbol: `studio/edition-check.js` adds the profile's verdict to `isValid()`. Only APP-6A has a profile in the library. `docs/upstream-parity-removals.md` lists what left the library and how to restore it from the tag `archive/before-upstream-parity`.

Code: `studio/profiles/app6b.js`, `std2525d.js`, `std2525e.js`, `app6e.js`, with the shared builder `fieldtable.js`. Tests: `test/edition-modifiers.test.js` checks each class's fields, rules and `textLayout` rows against the rows copied from each figure.

Citations are "PDF physical page / printed page".

| Edition | Source file | Active when |
|---|---|---|
| APP-6(B) | `APP-6(B).pdf` | letter SIDC, standard `APP6`, scheme S |
| MIL-STD-2525D Change 1 | `MIL-STD-2525D-Change1.pdf` | numeric version 10-12, standard `2525` |
| MIL-STD-2525E Change 1 | `MIL-STD-2525E-Change1.pdf` | numeric version 13-16, standard `2525` |
| APP-06 Edition E Version 2 | `APP-06 EDE V2 E.pdf` | numeric version 13-16, standard `APP6` |

Sets without a figure keep upstream's rows and every field: 00 Unknown, 25 Control Measures, 45-47 METOC and, in edition E, 50-54 SIGINT. APP-6(D) (version 10-12, standard `APP6`) keeps its own profile.

## What the profiles change

The upstream renderer has one row plan for all numeric land symbols and joins shared fields with `/`. Until 2026-11-08 the fork's renderer also drew the changes below. Now they hold only in the profiles: the Studio checks fields and codes against them, and the library draws upstream's rows, frames and bars.

| Finding | Editions | Profile |
|---|---|---|
| Fields in one cell were joined with `/` | all four | One space. APP-6(B) 0213.b PDF 38/2-16 requires it. The others say only "the most critical amplifier" should be used and give no rule, so they follow 2525C and APP-6(D) |
| AE and AF were swapped on equipment | 2525D, 2525E | V/AD/AE on the left, H/AF on the right (Figures D-5, E-4). APP-6(E) really has the reverse, V/AD/AF and H/AE (Figure 3-9) |
| AQ and AR were not drawn on land equipment | 2525D | W/AR and G/AQ (Figure D-5) |
| Quantity C drew above the frame on all classes | 2525E | With T on the left: C/T (Figures E-3, E-4), C/AE on installations (Figure E-5), the fourth left row on activities (Figure I-2). B/C above the frame only on air and space (Figures D-3, C-2) |
| Air, space and sea had the 2525D rows | 2525E | Left W; AR; AD and right AS; T/Y; V/AF; P/X/Z; G/H/J on air and space. Six right rows on sea surface and subsurface (Figures G-2, H-3) |
| AS was missing on sea, air and space | 2525E, APP-6(E) | Own row in 2525E, shared with T in APP-6(E) (T/AS) |
| P appeared on space | 2525D, APP-6(E) | Space has T; V; Z/X; G/H (Figures B-3, 6-2) |
| Activities used the land unit rows | all numeric | W; Y and AS; G; H; J in 2525D. See the class tables for E |
| Cyberspace used the equipment rows, so F was lost | 2525D, 2525E, APP-6(E) | F/AS on the first right row, T/V or V and T on the left (Figures L-2, K-2, 9-2) |
| Mine warfare took amplifiers | 2525E | None. 5.3.7 PDF 38/21: "Mine Warfare (MIW) symbols do not use amplifiers" |
| Land units drew the condition bar | 2525D | No AL (Table VII PDF 40/24, Figure D-4). 2525E and APP-6(E) do have it (Figures E-3, 3-3) |
| Status C, D, X and F drew a condition bar | APP-6(B) | Table B-I PDF 104/B-2 has status A and P only |
| An engagement bar and speed leader were accepted | APP-6(B) | Table I has no AO or AJ |
| Versions 14, 15 and 16 were unknown | edition E | Table A-1 PDF 76/59 and PDF 747/713. 14 is APP-06(E)(1), 15 is 2525E(1), 16 is APP-06(E)(2) |
| The Studio wrote version 13 for APP-6E | APP-6(E) | 16. Version 13 is MIL-STD-2525E |
| Contexts 3-8 had no meaning | edition E | Restricted target and no-strike contexts keep their frame context. The marks of APP-6(E) Figures 1-6 and 1-7 PDF 92/58 are no longer drawn |
| AT and AY had no option | APP-6(E) | Profile fields `installationCapacity` and `networkIdentifier`. The library does not draw them |
| E descriptor drew twice when other text was set | APP-6(B), 2525C | Once in the profile rows: in the E row when there is other text, by the frame when there is none. The library draws it as upstream does |

## Field positions

Rows are top to bottom. A `/` in the source is a cell shared by several fields. These are the profiles' `textLayout` rows; the library does not draw them for these editions.

### MIL-STD-2525D Change 1

| Class (sets) | Left | Right | Top / inner | Source |
|---|---|---|---|---|
| Air (01, 02) | none | T; P; V; Z/X; G/H | AO | Figure C-3 PDF 167/151 |
| Space (05, 06) | none | T; V; Z/X; G/H | AO | Figure B-3 PDF 153/137 |
| Land unit, civilian (10, 11) | W; X/Y; T; Z | F/AS; G; H; M; J/K/P | AO; AA inside | Figure D-4 PDF 190/174 |
| Land equipment (15) | W/AR; X/Y; V/AD/AE; T; Z | G/AQ; H/AF; J/L/N/P | AO; C | Figure D-5 PDF 251/235 |
| Land installation (20) | W; X/Y; T | G; H; J/K/P | AO | Figure D-6 PDF 296/280 |
| Sea surface (30) | AQ/AR | T; V; P; G/H; Y/Z | AO | Figure E-2 PDF 326/310 |
| Subsurface, mines (35, 36) | AR | T; V; X; G; H | AO | Figure F-3 PDF 352/336 |
| Activities (40) | W; Y | AS; G; H; J | none | Figure G-2 PDF 378/362 |
| Cyberspace (60) | W; Y; T/V | F/AS; G; H; M; K/L | AO | Figure L-2 PDF 721/705 |
| SIGINT (50-54) | W; Y; V/AD/AE; T | R2; G; H/AF; M; J/L | none | Table VII column SI, no figure (policy) |

### MIL-STD-2525E Change 1

| Class (sets) | Left | Right | Top / inner / bottom | Source |
|---|---|---|---|---|
| Air, space (01, 02, 05, 06) | W; AR; AD | AS; T/Y; V/AF; P/X/Z; G/H/J | AO; B/C | Figures D-3 PDF 192/175, C-2 PDF 176/159 |
| Land unit, civilian (10, 11) | W; X/Y; V/AD/AE; C/T; Z | F/AS; G/AQ; H/AF; M; J/K/L/P | AO; AA inside; AW below | Figure E-3 PDF 212/195 |
| Land equipment (15) | W; X/Y; V/AD/AE; C/T; Z | AS; G/AQ; H/AF; J/K/L/P | AO | Figure E-4 PDF 266/249 |
| Land installation (20) | W; X/Y; C/AE; T | AS; G/AQ; H; M; J/K/P | AA inside | Figure E-5 PDF 300/283 |
| Dismounted (27) | W; X/Y; V/AF; T; Z | AS; G; H; M; J/K/P | C below | Figure F-2 PDF 329/312 |
| Sea surface (30) | AQ/AR | AS; T; V; P; G/H; Y/Z | AO | Figure G-2 PDF 346/329 |
| Subsurface (35) | AR; X | AS; T; V; P; G/H; Y/Z | AO | Figure H-3 PDF 368/351 |
| Mine warfare (36) | none | none | none | 5.3.7 PDF 38/21 |
| Activities (40) | W; Y; empty; C | AS; T; G; H; J | none | Figure I-2 PDF 390/373 |
| Cyberspace (60) | W; Y; V; T | F/AS; G; H; M; K/L | AO | Figure K-2 PDF 432/415 |

### APP-06 Edition E Version 2

| Class (sets) | Left | Right | Top / inner / bottom | Source |
|---|---|---|---|---|
| Air (01, 02) | none | T/AS; P; V; Z/X; G/H | AO | Figure 2-2 PDF 119/85 |
| Space (05, 06) | none | T/AS; V; Z/X; G/H | AO | Figure 6-2 PDF 389/355 |
| Land unit, civilian (10, 11) | AR/W; X/Y; V/AD/AE; T; Z | F/AS; G; H/AF; M; J/K/P | AO; C; AA inside; AW below | Figure 3-3 PDF 147/113 |
| Land equipment (15) | W; X/Y; V/AD/AF; T; Z | AS; G; H/AE; M; J/K/L/N/P | AO; C | Figure 3-9 PDF 219/185 |
| Land installation (20) | W; X/Y; AX; T | AS; G; H/AE; M; J/K/AT | none | Figure 3-13 PDF 265/231 |
| Dismounted (27) | W; X/Y; V/AF; T; Z | AS; G; H; M; J/K/P | C below | Figure 4-3 PDF 296/262 |
| Sea surface (30) | AQ/AR | T/AS; V; P; G/H; Y/Z | AO | Figure 5-3 PDF 324/290 |
| Subsurface, mines (35, 36) | AR | T/AS; V; P/X; G/H; Y/Z | AO | Figure 5-6 PDF 355/321 |
| Activities (40) | W; Y; T | AS; G; H; empty; J | none | Figure 7-2 PDF 403/369 |
| Cyberspace unit (60) | AR/W; Y; V/AD/AE; T; AY | F/AS; G; H/AF; M; K/L/P | AO; C; AA inside; AW below | Figure 9-2 PDF 713/679 |
| Cyberspace non-unit (64) | W; X/Y; V/AD/AF; T; Z | AS; G; H/AE; M; J/K/L/N/P | AO; C | Figure 9-3 PDF 714/680 |

### APP-6(B)

Figure 5 PDF 33/2-11 serves all classes: left W; X/Y; V; T; Z, right E/F; G; H; M; J/K/L/N/P, B/C/D above and AA inside. Table I PDF 30-32/2-8..2-10 decides which fields a class has.

- **Units:** F, G, H, J, K, M, P, T, W, X, Y, Z, AA.
- **Equipment:** C, G, H, J, L, N, P, T, V, W, X, Y, Z.
- **Installations:** G, H, J, K, P, T, W, X, Y, Z.

E is the Joker or Faker letter, from SIDC position 2. Unlike 2525C, Z applies to installations and X stops at 6 characters.

## Errors and warnings

Numeric SIDCs with versions 10–16 select an edition profile. The library draws
any other version as upstream does and `isValid()` stays true. The Studio check
(`studio/edition-check.js`) makes such a symbol invalid, with a position 1–2 error
in `details.sidcErrors`, so the absence of a profile never implies validity.

In the profiles, edition E contexts 5 and 6 are exercise contexts with a Joker or
Faker identity. The library resolves their identity as upstream does. APP-6(E)'s AS field accepts
exactly three alphanumeric characters (Table 1-5 PDF 87/53); the geographical entity
code list is outside that publication's scope. This differs from the three-letter
country rule used by the MIL profiles.

`details.modifierErrors` is for a wrong SIDC and for a field the symbol does not take. Those make the Studio check false, and the Studio shows Check code / modifiers. For these editions `isValid()` alone does not see them.

`details.fieldWarnings` lists text values that break a length, list or format rule, as `{ key, message }`. The text is still drawn and the symbol stays valid, and the Studio shows the message under the field. All seven editions work this way. A rule that ties text to the code stays an error: APP-6D F above division, 2525C W O/O without status A.

## Decisions where the sources disagree

| ID | Sources | Decision |
|---|---|---|
| HQ, task force, dummy | 2525D A.5.4.5.1 PDF 70/54, 2525E A.5.3.5.1 PDF 80/63, APP-6(E) A.9 item 2 PDF 753/719 against Tables VII, VI, 1-5 | The annex defines all eight codes for each dimension, so they are valid and drawn on every class. A class table or figure without that field adds a note, not an error. APP-6(B) reads the same way from the note of Table B-II PDF 105/B-3. An installation in APP-6(B) or 2525C keeps H in position 11, so the Studio does not set HQ or task force on it |
| Figure over table | 2525D 5.3.7 PDF 37/21 | Amplifier descriptions "vary by dimension and are detailed within the respective appendices", so the figure and table of the class win over Table VII. Table VII gives activities T, K, P and others that Table G-II and Figure G-2 do not, and they are not offered. Table D-III lists V and L for land units, Figure D-4 and Table VII do not, and they are not offered |
| D-INST | 2525D Table VII, Figure D-6 | Table VII gives installations AJ and no Q. The figure shows neither, and the renderer starts AJ from Q, so neither is offered |
| Echelon on installations | 2525D 5.3.7.1 PDF 42/26 against Table VII | Accepted with a note, as in APP-6(D) |
| Echelon on air and space | 2525E Table VI PDF 39/22 against Figures D-3, C-2 and Tables D-II, C-II | Accepted with a note |
| AJ without Q | 2525E, APP-6(E) | Air, space and sea have AJ and no Q, but the renderer needs a heading to draw AJ. A heading is accepted, and a note is shown when it has no speed leader |
| E-N | 2525E Table VI PDF 40/23 against Figure E-4 | N has no cell in the figure. It keeps the 2525D place after L, hostile identities only, with a note |
| E-Y | 2525E Table VI PDF 44/27 against Table E-II PDF 214/197 | The table says {3,16}, but its own example has 22 characters. The limit is 22 |
| E-AR | 2525E Table VI PDF 47/30 against Figure E-3 | AR is listed for set 10 with no cell. It joins W, as in 2525D Figure D-5 and APP-6(E) Figure 3-3, with a note |
| E-AW | 2525E Table VI PDF 47/30 against Figure E-3 | AW is listed for set 10 with no cell. It is drawn below the frame, in the bottom field of Figure 13, with a note |
| E-AX | 2525E Table VI PDF 47/30 against Figure E-5 | AX is listed for set 20 with no cell. It joins C/AE, the row AX has in APP-6(E) Figure 3-13, with a note |
| E-AA | 2525E Figure E-5 against Table VI PDF 45/28 | The figure draws A/AA on installations. Accepted with a note |
| E-C27 | 2525E Table VI PDF 39/22 against Figure F-2 | C is listed for set 27 with no cell. It stays below the frame, as in APP-6(E) Figure 4-3, with a note |
| F length | 2525E Table VI, APP-6(E) Table 1-5 | Both say one character and describe (+). The one-character form is listed and the bracket form accepted. 2525D uses the bracket form (3 characters) |
| AO stage | APP-6(E) Table 1-5 PDF 83/49 | MT there, M<T in 2525D, 2525E and APP-6(D). Each edition takes its own form, and APP-6(E) takes both |
| L in APP-6(E) | Table 1-5 PDF 69/35 | "for equipment", with no hostile limit, unlike 2525 |
| Figure against set list | APP-6(E) Table 1-5 | Figures draw AE on Land Unit and installations, K on installations, T on activities and Y on subsurface, though the Table 1-5 set lists omit them. Accepted with a note |
| Mobility | 2525E Table VI lists set 10, APP-6(E) sets 10, 15, 20, 27, 64 | The class figures decide. Sets with no R cell are accepted with a note |
| Exercise letters | APP-6(B) Table B-I against the Studio | G, W, D, L and M are not in Table B-I. The Studio has offered them since the identity work, so they stay as a note, not an error |
| B on equipment | APP-6(B) Table I PDF 30/2-8 | The row prints 10, 2 and G for units, equipment and installations. An echelon is not rejected on any of them |
| UCAWA- on two rows | APP-6(B) code table PDF 113/B-11, symbol page PDF 178 | The table prints UCAWA- for wheeled airborne and wheeled amphibious armour. The symbol page gives amphibious UCAWW-, as 2525C does, and the Studio catalog uses it |
| UCRLL-- | APP-6(B) code table PDF 117, symbol page PDF 192 | Seven function characters in a six-character field. The Studio catalog reads UCRL--, as APP-6A does |
| One code on several rows | APP-6(B) code table, 2525C | Both pages of APP-6(B) print the same code for rows such as UCEC-- and UCDS--, and 2525C repeats codes between warfighting and emergency management. Each row keeps its own Studio card and they draw alike |
| Version digit | 2525D A.5.4.1 PDF 67/51 | "shall be populated with code 10": the Studio keeps 10 for 2525D and 13 for 2525E. Their Change 1 codes are read as well |
| Version digit of an applied SIDC | 2525E Table A-I, APP-06(E)(2) Table A-1 | The code decides the Studio view: 11, 13 and 15 are 2525, 12, 14 and 16 are APP-6. 10 stays in the current family, since both D editions use it |
| Frame shape A | 2525E Change 1 Table A-LX PDF 158/141, change 23-043-DS | A is Sea Surface and 4 is Land Equipment. The library drew no frame for A, and it now draws the sea surface frame |
| Leader individual | 2525E Table A-VIII PDF 80-81/63-64, APP-06(E)(2) Table A-8 PDF 753-754/719-720 | Code 71 sits with mobility in the Studio, because the amplifier takes one code. The control is named Leadership where the symbol takes nothing else |
| US only | APP-6(D) Table A-2 PDF 718/A-4, APP-06(E)(2) Table A-2 PDF 748/714 | Note 1 covers contexts 1 and 2, and 5 to 8 in APP-6(E). Note 2 covers Joker and Faker. The Studio labels show it |

## Limits

- Icons and sector modifiers were not audited image by image. Only amplifier placement, fields and SIDC digits were checked.
- The library draws these editions with upstream's rows, not the profile rows above.
- S2/BA offset lines, AH, AI and AK need map data the library does not take. The Studio lists them as gaps.
- Set 64 has no frame or icon in the library. The profile lists its fields, but the symbol does not render until that work is done.
- SIGINT placement in 2525D is product policy: no figure exists.
- 2525E set 60 lists AE and AP in Table K-II with no cell, so they are not offered.
- The studio catalogue for APP-6E is still the compatibility catalogue.
- APP-06(E)(2) reserves positions 23-27 (A.14 PDF 757/723), so it has no frame shape. The library reads position 23 for all of edition E, and the Studio still offers the override in its APP-6E view.
