# Change Log

This is the release history for milsymbol. Update the next unreleased version
alongside code changes, using Added, Changed, Deprecated, Removed, Fixed, and
Security sections as needed.

Published entries include all 23 public [GitHub releases](https://github.com/spatialillusions/milsymbol/releases),
verified on 2026-10-27. Dates below are UTC publication dates from GitHub metadata.
Historical wording is retained; duplicate version headings and empty template
categories are omitted. See [Development resources](dev/README.md) for the
publication workflow and GitHub/npm version inventory.

## Unreleased

### Added

- Studio: the country list shows each flag beside its name, with the code it writes in the current standard. Letters typed in the open list spell a name, with or without accents.
- Studio: the icon modifier and sector lists of the numeric standards draw each modifier alone on the current frame, beside its name and code. Frame shape override draws each shape for the current identity.
- Studio: a dark theme. It follows the system until Display > Editor sets one.
- Studio: Preview background draws the symbol on a light, dark or map ground. Exports stay transparent.
- Studio: the editor keeps its draft on this device and restores it on reload. Reset can be undone until the next edit.

### Changed

- Studio: More style options has three groups, Colors, Text and Outline. An Editor card holds what only the editor shows.
- Studio: text is at least 12 pixels, and the interface uses the system font. Symbols keep Arial, the library's own setting.
- Studio: two columns reach down to 900 pixels wide, so a 1024 screen shows the controls without scrolling.
- Studio: on a narrow screen the SIDC and Copy stay in the preview card, and the preview shrinks while a text field is in use. Touch targets are 44 pixels high.
- Studio: Friend, Hostile, Neutral and Unknown come first, and More identities holds the other choices.
- Studio: position numbers and publication notes sit behind an information button beside each heading. The reason a control is off stays on the page, next to the control.
- Studio: Code details starts closed.
- Studio: the theme colors are written once with `light-dark()`, which needs Chrome 123, Firefox 120 or Safari 17.5. The information buttons already need Firefox 125.
- Library: every edition except APP-6A draws exactly as upstream milsymbol 3.0.5 again. Fields in one cell are joined with `/`, and text rows, condition bars, Joker/Faker frames and `isValid()` follow upstream. `docs/upstream-parity-removals.md` lists each change, its commit and how to restore it; the tag `archive/before-upstream-parity` keeps the earlier state.
- Library: outside APP-6A, `isValid(true)` no longer carries the edition profiles' `modifierErrors`, `fieldWarnings` or `notes`.
- Studio: the APP-6(B), MIL-STD-2525C, APP-6(D), MIL-STD-2525D/E and APP-6(E) profiles moved to `studio/profiles/`. The Rendered badge combines `isValid()` with the profile's check, and a numeric version other than 10–16 is not valid there.
- Studio: an edition D code is drawn from its first 20 digits, versions 15 and 16 are drawn as 13 and 14, and edition E contexts 3–8 are drawn in their reality, exercise or simulation frame. The SIDC box keeps the full code.
- Studio: Field positions boxes sit where milsymbol draws each field. A filled field that milsymbol does not draw for the symbol says so under it, and in APP-6(E) the identity note says that milsymbol does not draw the restricted target and no-strike marks.

### Removed

- Library: `ms.setStandard("2525C")` and the style `standard: "2525C"`. Use `"2525"`; the Studio checks 2525C rules itself.
- Library: the options `installationCapacity` (AT) and `networkIdentifier` (AY), and the restricted target and no-strike marks of edition E contexts 3–8.
- Library: the named ESM exports of `index.js` (`import { Symbol } from "milsymbol"`). Use the default export. `index.d.ts` still declares them, as upstream's does.
- Library: the fork's fixes to `ms._scale`, the Canvas `globalAlpha` reset, the octagon anchor on headquarters symbols, Joker/Faker in exercise contexts 5 and 6, unknown versions and edition D tails. They are listed as upstream candidates.

### Fixed

- Studio: a fault in a SIDC is named once, in one sentence, where it read three times after "Applied".
- Studio: Edition-specific modifiers stays out of the letter-based editions unless the symbol class has a note for it.
- Studio: at 768 pixels the `/` of the palette no longer lies over Standard, and the attribution no longer sits between the code and the tabs.
- Studio: the pictures in an echelon or mobility list draw to one scale, with the frame on the line of the text. A tall amplifier shrank its own frame, so on a Hostile frame the size changed from row to row, and the frame sat below the text.
- Studio: Modifier color starts on red, not the black the modifiers already have, so ticking it shows a change. The echelon and mobility pictures follow it, and a note says when the symbol has no modifier to color.
- Studio: the search in APP-6A, APP-6B and 2525C finds words of ten letters or more, such as reconnaissance and air defense, and SIDCs printed with `*`. They were read as a SIDC and found nothing.
- Studio: rows that share a code open as themselves, with their own name and a note that they draw alike (APP-6B Engineer Combat Bridging, 2525C Hospital). They opened the first row of the code.
- Studio: APP-6B Reconnaissance Light writes `UCRL--`, not a 16-character SIDC, and Armour, Wheeled Amphibious writes `UCAWW-`, the code of its symbol page.
- 2525E: frame shape `A` draws the Sea Surface frame of Change 1 Table A-LX. It drew no frame.
- Studio: Frame shape lists Sea surface, and the SIDC box takes `A` in position 23 of an edition E code. Code 4 is now named Land equipment, as in the table.
- Studio: 2525E and APP-6E offer Leader individual (code 71) on dismounted individuals. A code the picker has no row for shows once, where 71 read `SIDC: 7171`.
- Studio: a SIDC of the other family says so and names the standards that take it, where it asked for more characters. A short numeric code in a letter-based standard is no longer read as a letter SIDC.
- Studio: the version digits choose the standard, with a note. 16 in the 2525E view moves to APP-6E and 13 in the APP-6E view moves to 2525E.
- Studio: APP-6E marks its exercise and simulation contexts as US only, and APP-6D and APP-6E mark Joker and Faker, as Table A-2 does.
- Studio: Copy gives the code as drawn and as file names carry it, with `-` in an empty user field. The box still shows `*` there.
- Studio: the Preview grid choice is kept in this browser, as the Editor card says.
- Studio: a visit that changes nothing saves no draft, and a reload says a draft was restored only when there was one to restore.
- Studio: the country note names the code's encoding once.
- Studio: the tab bar has no stray scrollbar on a phone, and More identities and the status chips reach the 44 pixel touch height.

## 3.0.5-v5 - 2026-11-04

### Changed

- Text that breaks an edition's length, list or format rule no longer makes a symbol invalid. It is reported in `details.fieldWarnings`, and the Studio shows it under the field. A wrong code stays an error. This applies to all seven editions.

### Fixed

- Studio: the AE example is `15`; `15 MIN` broke the rule of the E editions.

## 3.0.5-v4 - 2026-11-04

### Changed

- Studio: the country flag sits where the Unit Generator puts it, beside the frame, and the two text rows next to it move right. Field positions shows it there too.
- Studio: the PNG size moved from the button to its tooltip.

## 3.0.5-v3 - 2026-11-04

### Fixed

- Headquarters, task force and feint/dummy codes are no longer errors off land units in APP-6(B), 2525C, 2525D, 2525E, APP-6(D) and APP-6(E). The annexes define them for every dimension; a class table without the field adds a note.
- Studio: the country flag is no longer covered by the boxes in Field positions.

## 3.0.5-v2 - 2026-11-04

### Changed

- Studio: on a phone the preview stays on top, the settings come right after it, and the code breakdown folds into Code details.
- Studio: the symbol draws before the flag artwork loads, and the page runs the minified bundle.
- Studio: export names carry the standard and the SIDC, and the PNG button shows the output size.
- Studio: small help text is darker and larger, to meet the WCAG AA contrast of 4.5:1.
- Studio: APP-6E shows a Compatibility view badge.

## 3.0.5-v1 - 2026-11-04

Based on milsymbol 3.0.5. Fork versions are the upstream version plus `-vN`: `-v2`, `-v3` and so on, back to `-v1` on the next upstream release. This replaces the fork's earlier number, 3.1.0.

### Added

- Modifier profiles for APP-6(B), MIL-STD-2525D Change 1, MIL-STD-2525E Change 1 and APP-06 Edition E Version 2. See `docs/edition-modifiers.md`.
- Options `installationCapacity` (AT) and `networkIdentifier` (AY) for APP-6(E).
- SIDC versions 14, 15 and 16 are read as edition E.
- APP-6(E) restricted target and no-strike marks for contexts 3-8.
- Merged milsymbol 3.0.5, including the `modifierColor` style option. The Studio offers it as Modifier color under More style options.

### Changed

- Text amplifiers follow each edition's placement figure, and shared fields are joined with one space instead of `/`. A field the edition does not give the symbol class is no longer drawn.
- Studio APP-6E codes use version 16, the APP-06(E)(2) code of Table A-1.

### Fixed

- 2525D and 2525E equipment had AE and AF swapped, and 2525D equipment dropped AQ and AR.
- 2525D land units no longer draw an operational condition bar; APP-6(B) symbols no longer draw one.
- The 2525C and APP-6(B) E descriptor no longer draws twice when other text is set.

## 3.1.0 (fork number before 3.0.5-v1)

### Added

- APP-6A (October 1998) point-symbol profile: `ms.setStandard("APP6A")` or `standard: "APP6A"`, with Annex B code validation through `isValid()`. See `docs/app6a.md`.
- Military Symbol Studio, a browser editor built on the library (`studio/`, published on GitHub Pages).
- APP-6A supply classes I-IX, which earlier extraction and validation dropped because their function IDs contain digits.

### Fixed

- APP-6A glyphs whose shape differed from Annex D: NBC lines, mortuary, maintenance recovery, ordnance missile, equipment manufacture, mine, claymore and airport.
- Unframed APP-6A less-than-lethal mine, claymore and armoured vehicle icons were clipped by their bounding box.

## 3.0.5 - 2026-10-27

### Added

- Add the `modifierColor` style option to control modifier decorator colors
  independently of frame and icon colors, including HQ staffs, task force brackets,
  feint/dummy indicators, and echelon indicators.
- Support `cssClass` on SVG drawing instructions, add the
  `milsymbol-textfields` class to standard text fields, and allow custom
  label classes. Add CSS classes for HQ, task force, installation, feint/dummy,
  and echelon modifiers.
- Extend TypeScript definitions with `addIconParts`, `IconPartsFunction`,
  `Symbol.drawInstructions`, and `outline`. Include `modifierColor`,
  support `infoOutlineWidth: false`, and declare text drawing instructions'
  `text` property. Correct `addIconParts`' return type for chaining.

### Changed

- Read the version from `package.json` when building the bundle, replacing
  the hardcoded runtime version.
- Move echelon geometry definitions into a separate data module to simplify
  maintenance.

### Fixed

- Restore direct source imports by providing a version fallback when the build-time
  `__version__` constant is unavailable. Verify the source version matches
  `package.json` in the test suite.
- Correct the suspect frame color's CSS syntax so unfilled MIL-STD-2525E suspect
  symbols and their labels render with the intended color on canvas.
- Stop `getColors` from mutating caller-provided `colorMode`,
  `frameColor`, and `iconColor` objects, so shared palettes can safely
  be reused across symbols. Resolve modifier frame colors without relying on
  palette mutation.

### Security

- Refresh compatible development dependency versions and the lockfile to address
  known security advisories, including requiring Rollup 4.59.0 or later for its
  path-traversal fix.
- Replace the unused general-purpose glob/copy dependency chain with a tested
  helper for the three documentation standard files. Keep the Rollup replacement
  plugin in development dependencies rather than runtime dependencies.

## 3.0.4 - 2026-03-10

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/v3.0.4)

### Added

Stack extension is now part of milsymbol thanks to a sponsorship by Austrian Armed Forces.

### Security

A possible XSS vulnerability in the SVG output has been fixed by parsing all user provided input before we create the SVG string.

## 3.0.3 - 2025-07-29

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/v3.0.3)

### Fixed

- Updated TypeScript definitions.
- Minor change in canvas output where some symbols were clipped.
- Fixed number in space modifier 2 after clarification from SSMC

## 3.0.2 - 2025-04-11

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/v3.0.2)

### Changed

- Updated TypeScript definitions.

### Fixed

- Control measure points did not get all labels set correctly, that should be fixed now.

## 3.0.1 - 2025-03-17

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/v3.0.1)

### Changed

- Changed baseline property in SVG to resolve Firefox issue
-  String widths are now in a separate file

## 3.0.0 - 2025-02-08

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/v3.0.0)

### Added

- Support for MIL-STD-2525E and STANAG APP6 E

### Changed

- Icons will now as far as possible be based on MIL-STD-2525E / FM 1-02.2 look and feel

- Minor changes for readability on multiple icons

- ColorModes now includes a property "Suspect" for the new colors introduced in 2525E

- When calling ms.ColorMode you should now include a suspect color if you use 2525E `ms.ColorMode(civilian, friend, hostile, neutral, unknown, suspect)`

- uniqueDesignation will now be rendered with a smaller font on most control measure points

## 2.2.0 - 2023-03-15

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/v2.2.0)

- Fixed #280 that broke in the last release.
- Added support for the option fillColor that makes it possible to fill a symbol with any color in a simple way.

## 2.1.0 - 2023-03-05

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/v2.1.0)

### Changed

Since MIL-STD-2525D never was released, we reverted a lot of things in the cyberspace appendix.

Also updated to use the NMP packages stanag-app6 and mil-std-2525 instead of the old milstd.

And a bunch of minor fixes.

## 2.0.0 - 2019-04-25

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/v2.0.0)

### Added

- Added support for Engagement Bars

- Use the option engagementBar to set the bar text
- Use the option engagementType to define "TARGET", "NON-TARGET", or "EXPIRED" as type

- Added support for the field country as specified in APP-6 D
- Added support for the field installationComposition as specified in APP-6 D
- Added possiblity to control more color on symbol level
- Support for speed leaders
- Support for text background color using infoBackground and infoBackgroundFrame options

### Changed

- `symbol.getProperties()` is removed and `symbol.getMetadata()` should be used instead.

- ms.getHqStafLength changed to ms.getHqStaffLength, fixed spelling

- ms.setHqStafLength changed to ms.setHqStaffLength, fixed spelling

- Thanks to @okwolf we moved from webpack to rollup for development

- Where there are multiple text fields in the same position, they are now joined
  by a / instead of a space

- Changed location of feint/dummy indicator to be more similar to images in
  standard documents

- Make it possible to set infoColor to a Color Mode

### Removed

- `symbol.getProperties()` is removed (use `symbol.getMetadata()` instead)

- `ms.setAutoSVG` has now been removed.

### Fixed

- Fields commonIdentifier (AF) and equipmentTeardownTime (AE) had swiched
  places, now corrected

- The condition bar is now drawn below the headquartersElement field

- Some natural events in 2525C was framed even if they shouldn't be

### Security

- Prevented XSS issue where malicious code could be inserted into text fields of SVG symbols, all < and > are now encoded to prevent this.

## 1.3.3 - 2017-11-14

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/1.3.3)

### Changed

- Updated and moved the unit generator from dev to examples.

### Fixed

- The option infoColor was not set when used, this is now fixed, again.
- The option hqStafLength was not set when used, this is now fixed.
- Fill opacity affected outline opacity as well in canvas output.

## 1.3.2 - 2017-11-13

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/1.3.2)

### Fixed

- Following symbols were drawn as fixed wing instead of rotary wing
  - WAR.SOFUNT.AVN.ROT.ATK
  - WAR.SOFUNT.AVN.ROT.UTY
  - WAR.SOFUNT.AVN.ROT.UTY.LIT
  - WAR.SOFUNT.AVN.ROT.UTY.MDM
  - WAR.SOFUNT.AVN.ROT.UTY.HVY

- The option infoColor was not set when used, this is now fixed.

## 1.3.1 - 2017-10-17

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/1.3.1)

### Fixed

- Fixed canvas output in Microsoft Edge 14

## 1.3.0 - 2017-08-21

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/1.3.0)

### Added

- symbol.getOptions(*includeStyle*) will return the options that are set on the symbol.

- symbol.getStyle() will return the style options that are set on the symbol.

- Added files for intellisense when used in Visual Studio Code

### Changed

- Options and Style are now stored in separate Objects on the symbol for better structure.

- ms.Symbol and setOptions can now take any number of arguments from 0 to n.

### Fixed

- ArcGIS example had to be updated because of change of how Options and Style are stored.

- monoColor was initialized as `false` instead of an empty string, this is now corrected and makes the correct status modifiers to be used by default.

- 10031000001104000000 was drawn with an icon IW instead of IO (Since it is IW in 2525C, but that is now fiexed.)

- Fixed the size of the sensor icon used in 2525D

## 1.2.1 - 2017-06-12

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/1.2.1)

### Fixed

- Altitude/Depth was sometimes not labeled on 2525D symbols

- Typo in Changelog

## 1.2.0 - 2017-06-11

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/1.2.0)

### Added

- Added build-amd, to build an AMD only module you can now run `npm run build-amd`

### Changed

- isValid(option) can now take an bolean input that makes it return a validaton object with extended information about the vadility.

- isValid now validates the mobility modifier as well as the symbol icon.

- Updated ENERGY FACITILIES INFRASTRUCTURE to better representation of the standard.

### Removed

- Removed all methods that was deprecated in milsymbol 1.0.0

### Fixed

- The quantiy field would be cut if the content was wider than the symbol, this is now fixed so that the symbol size adopts to to width of the quantity field.

- Fixed Land Unit M1 10 command and control that was displayed in as a Y instead of C2.

- Some modifiers on Signals Intelligence symbols in 2525C was incorrect

## 1.1.0 - 2017-04-16

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/1.1.0)

I would like to thank @okwolf that has contributed with unit tests and some code reorganization.

### Added

- It is now possible to use `sidc` or `SIDC` in an options object.

- It is now possible to initiate a symbol with just an options object `ms.Symbol({options})`.

- ms.Symbol().isValid() now returns a boolean representing if it was possible to find the symbol icon for the provided SIDC.

- The source code for the unit generator is now provided in the dev folder.

- Added 2525B symbols that are missing in 2525C, so now we have full support for 2525B as well.

- Initial unit tests added to the repository.

### Fixed

- Fix for that tactical points with labels with large font sizes might draw too narrow so that part of the label can't be seen.

- Fix for that units with invalid icon part in the SIDC did not get the upside down question mark when canvas output was used.

- G-F-PTS--- TACGRP.FSUPP.PNT.TGT.PTGT and G-C-FSTP-- 2.X.2.3.1.1.1 POINT/SINGLE TARGET now uses altitudeDepth instead of additionalInformation1 to display the target altitude.

- Made sure that tactical points that dosen't have labels in the specifications don't get labels even if they are set.

## 1.0.0 - 2017-03-03

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/1.0.0)

- Milsymbol is now split into several modules and built with [webpack](https://webpack.github.io/), this makes the code easier to maintain.

- Avoid getting and setting properties directly, use methods for this when they are available, in the future properties might change names.

### Added

- colorMode property can now be set to a string representing the name of a registered color mode.

- symbol.getSize() returns an object with the width and height of the symbol.

- symbol.getAnchor() returns an object with the x and y offset of the symbol.

- symbol.getOctagonAnchor() returns an object with the x and y offset of the octagon center.

- bbox.merge(another-bbox), use this instead of MS.bboxMax for merging bounding boxes.

- Milsymbol can now be used as a AMD/CommonJS/etc... module, by requiering `milsymbol`, the global `var` is called ms.

- ms.getVersion() that returns the version as a string.

- ms.addSIDCicons(sidcFunction, type) for adding sidc functions.

- ms.addLabelOverrides(labelFunction, type) for adding label functions.

- ms.addSymbolPart(part) should be used instead of MS.addMarkerParts(part)

- ms.getSymbolParts() should be used instead of MS.getMarkerParts()

- ms.setSymbolParts(parts) should be used instead of MS.setMarkerParts(parts)

- ms.BBox() should be used instead of MS.bbox(). (Since it is a class...)

- ms.ColorMode() should be used instead of MS.colorMode(). (Since it is a class...)

- ms.Symbol() should be used instead of MS.symbol(). (Since it is a class...)

- Tactical points is now part of */dist/milsymbol.js*, no need to include any extra files.

- Tactical points now supports APP6-B ANNEX E.

- Symbols with an invalid icon in the SIDC will now be rendered with an upside down ?. (According to MIL-STD-2525D)

### Changed

- **Global variable is now `ms` instead of `MS`.**

- Feint/Dummy indicator drawn as specified in MIL-STD-2525D change 1.


### Deprecated

- Avoid setting properties directly, use setOptions(options) instead.

- Do not use .XML anymore, use asSVG() instead, **if needed set `ms.autoSVG = true`**. ms.autoSVG will be removed in a future version.

- getMarker(), it's not needed anymore, symbols are automatically updated when options are updated using setOptions().

- MS.bboxMax(), use bbox.merge() instead.

- MS.addLetterSIDCicons(), use ms.addSIDCicons() instead.

- MS.addNumberSIDCicons(), use ms.addSIDCicons() instead.

- MS.addLetterLabelOverrides(), use ms.addLabelOverrides() instead.

- MS.addNumberLabelOverrides(), use ms.addLabelOverrides() instead.

- MS.buildingBlock() return an object instead.

- MS.addMarkerParts(part) use ms.addSymbolPart(part) instead.

- MS.getMarkerParts() use ms.getSymbolParts() instead.

- MS.setMarkerParts(parts) use ms.setSymbolParts(parts) instead.

- MS.bbox() use ms.BBox() instead. (Since it is a class...)

- MS.colorMode() use ms.ColorMode() instead. (Since it is a class...)

- MS.symbol() use ms.Symbol instead. (Since it is a class...)

### Removed

- MS.rotate() has been removed, use json drawInstruction instead.

- MS.scale() has been removed, use json drawInstruction instead.

- MS.translate() has been removed, use json drawInstruction instead.

### Fixed

- Fixed a bug that prevented specialHeadquarters to be drawn on Canvas output.

## 0.6.0 - 2016-12-25

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/0.6.0)

### Added
- Support for outlines on symbols using properties `outlineColor` and `outlineWidth`.
- toDataURL() that returns a base 64 encoding of the SVG symbol. (See deprication of _asImage()_)
- Possibility to Add/Update existing SIDC.
- Possibility to Add/Update the icon parts that constructs the icons.
- Support for tactical point symbols in MIL-STD-2525C.

### Deprecated
- _asImage()_ since it returns a data url and not an image.

## 0.5.6 - 2016-05-14

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/0.5.6)

Several minor updates and minor changes to symbols that had some errors in them.
- asCanvas() is now also supported in Internet Explorer 11, this makes it simpler to integrate with Open Layers 3 and Cesium
- Added back the possibility to create effects with SVG filters in custom extensions

## 0.5.5 - 2016-01-30

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/0.5.5)

All symbol geometries has been remade to decrease code size and to make it possible to have native canvas output.
- Native Canvas output
- Reduced code size

## 0.5.1 - 2015-07-24

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/0.5.1)

This is just a maintenance release, no code in milsymbol has changed, but some errors in the documentation has been fixed.

## 0.5.0 - 2015-07-20

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/0.5.0)

- Much faster
- New API
- Support point symbols from MIL-STD-2525D
- New examples

## 0.4.5 - 2014-11-23

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/0.4.5)

### New in this release:
- Now supports MIL-STD-2525C Emergency Management Symbols
- Speeeeed, the code now runs 3-5 times faster when you are creating a lot of symbols. (1000 random symbols can be created in less than 1 second, my test record is 0.25 seconds on a modern iMac running Safari.)
- Added an example showing generation of 1000 random symbols.

## 0.4.4 - 2014-10-28

[GitHub release](https://github.com/spatialillusions/milsymbol/releases/tag/v0.4.4)

Initial release when code moved to GitHub, same as on homepage.
