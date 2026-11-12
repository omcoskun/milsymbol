import {
  fieldStates,
  formatDtg,
  evaluationRating,
  sidcParts,
  pushRecent,
  placeholderOptions,
  readTextRows,
  fieldValueChars,
  fitRowWidths,
  layoutFieldBoxes,
  paletteProgress,
  mobilities,
  mobilityModeName,
  amplifierPlacementNote,
  amplifierChoice,
  sharedViewBox,
  withViewBox,
  typeaheadIndex,
  modifierColorUnused,
  modifierChoice,
  centeredGlyphs,
  frameShapeChoice,
  problemReasons,
  gridChoice,
  designationNotes,
  amplifierNotes,
  countryFlagNote,
  searchRank,
  rankSearch,
  withoutRawCode
} from "../studio/editor-helpers.js";
import { patchSidc, probeOffers } from "../studio/profile-controls.js";
import { std2525eProfile } from "../studio/profiles/std2525e.js";
import { app6eProfile } from "../studio/profiles/app6e.js";
import { fieldReference } from "../studio/field-reference.js";
import { textModifiers } from "../studio/modifier-fields.js";
import {
  app6aTextFields,
  app6aSymbolClass,
  getApp6aFields
} from "../src/lettersidc/metadata.js";

const glyph = (viewBox, size = 'width="40" height="30"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" ${size} viewBox="${viewBox}"><path d="M0,0" stroke-width="4"></path></svg>`;
const glyphs = [glyph("21 46 158 108"), glyph("21 6 158 148"), glyph("1 6 198 148"), ""];
const frames = [glyph("21 46 158 108"), glyph("41 26 118 128"), ""];
const countries = ["Tunisia", "Turkmenistan", "Türkiye", "Tuvalu"];

const app6aContext = (sidc) => ({
  available: getApp6aFields(sidc),
  table: app6aTextFields,
  kind: app6aSymbolClass(sidc),
  identity: sidc[1]
});
const byKey = (states) =>
  Object.fromEntries(states.map((state) => [state.key, state]));

const unit = byKey(fieldStates(textModifiers, app6aContext("SFGPUCI--------")));
const equipment = byKey(
  fieldStates(textModifiers, app6aContext("SFGPEVATM------"))
);
const hostileEquipment = byKey(
  fieldStates(textModifiers, app6aContext("SHGPEVATM------"))
);
const modern = fieldStates(textModifiers, null);
const placeholders = placeholderOptions(
  fieldStates(textModifiers, app6aContext("SFGPUCI--------")),
  { uniqueDesignation: "", higherFormation: "23 BDE" }
);

// Field positions: rows of a probe rendering, in symbol units. The "?" row has
// no marker and is not a field row.
const probeRows = readTextRows(
  [
    { x: 5, y: 80, anchor: "end", fontSize: 40, middle: false, content: "[X]/[Y]" },
    { x: 100, y: 103, anchor: "middle", fontSize: 33, middle: true, content: "[AA]" },
    { x: 195, y: 40, anchor: "start", fontSize: 40, middle: false, content: "[F]" },
    { x: 100, y: 20, anchor: "middle", fontSize: 40, middle: false, content: "?" }
  ],
  { "[X]": "altitudeDepth", "[Y]": "location", "[AA]": "specialHeadquarters", "[F]": "reinforcedReduced" }
);
const sideBoxes = layoutFieldBoxes(
  [
    { anchor: "end", x: 100, y: 50, keys: ["altitudeDepth", "location"] },
    { anchor: "start", x: 200, y: 50, keys: ["staffComments"] }
  ],
  { altitudeDepth: 60, location: 80, staffComments: 90 },
  { height: 30, gap: 6 }
);
// AO centred above the frame, too wide for the room between W and F at its
// height: past them is less than a row away, so it moves up there.
const movedBox = layoutFieldBoxes(
  [
    { anchor: "end", x: 40, y: 20, keys: ["dtg"] },
    { anchor: "start", x: 160, y: 20, keys: ["reinforcedReduced"] },
    { anchor: "middle", x: 100, y: 20, keys: ["engagementBar"] }
  ],
  { dtg: 80, reinforcedReduced: 80, engagementBar: 120 },
  { height: 30, gap: 6, center: 100 }
);
// With another side row above, the way out is more than a row: AO narrows.
const narrowedBox = layoutFieldBoxes(
  [
    { anchor: "end", x: 40, y: 20, keys: ["dtg"] },
    { anchor: "start", x: 160, y: 20, keys: ["reinforcedReduced"] },
    { anchor: "end", x: 40, y: -18, keys: ["specialDesignator"] },
    { anchor: "middle", x: 100, y: 20, keys: ["engagementBar"] }
  ],
  { dtg: 80, reinforcedReduced: 80, specialDesignator: 80, engagementBar: 120 },
  { height: 30, gap: 6, center: 100 }
);
// AO and C both centred above the frame: C, nearer the centre, keeps its
// place and AO moves up past it.
const stackedBoxes = layoutFieldBoxes(
  [
    { anchor: "middle", x: 100, y: 20, keys: ["engagementBar"] },
    { anchor: "middle", x: 100, y: 22, keys: ["quantity"] }
  ],
  { engagementBar: 120, quantity: 70 },
  { height: 30, gap: 6, center: 100 }
);
const sideRow = (anchor, keys) => ({ anchor, x: 0, y: 0, keys });
const crowded = [sideRow("end", ["type", "platformType", "commonIdentifier"]), sideRow("start", ["evaluationRating", "combatEffectiveness", "signatureEquipment", "hostile", "iffSif"])];
const crowdedFit = fitRowWidths(
  crowded,
  { type: 100, platformType: 101, commonIdentifier: 114, evaluationRating: 71, combatEffectiveness: 110, signatureEquipment: 107, hostile: 75, iffSif: 75 },
  { room: 752, between: 175 }
);
const rowSpan = (row, widths) => row.keys.reduce((sum, key) => sum + widths[key], 0) + 8 * (row.keys.length - 1);

const offeredMobilities = (profile, base) =>
  probeOffers(
    profile,
    mobilities.filter((item) => item[0] !== ""),
    (item) => patchSidc(base, 8, item[2], "0"),
    base
  )
    .filter((row) => row.offered)
    .map((row) => row.item[0]);

export default {
  "Studio editor helpers": {
    "DTG uses DDHHMMZMONYY in UTC": [
      formatDtg(new Date(Date.UTC(2026, 10, 2, 14, 35))),
      "021435ZNOV26"
    ],
    "evaluation rating joins reliability and credibility": [
      evaluationRating("b", "2"),
      "B2"
    ],
    "evaluation rating rejects an unknown reliability": [
      evaluationRating("G", "2"),
      ""
    ],
    "APP-6A unit: quantity is equipment only": [
      [unit.quantity.available, unit.quantity.reason],
      [false, "Equipment only"]
    ],
    "APP-6A unit: higher formation keeps the publication limit": [
      [unit.higherFormation.available, unit.higherFormation.maxLength],
      [true, 21]
    ],
    "APP-6A unit: platform type is not in APP-6A": [
      unit.platformType.reason,
      "Not in APP-6A"
    ],
    "APP-6A equipment: quantity applies": [
      [equipment.quantity.available, equipment.quantity.maxLength],
      [true, 9]
    ],
    "APP-6A equipment: higher formation is units only": [
      equipment.higherFormation.reason,
      "Units only"
    ],
    "APP-6A friend equipment: signature needs a hostile identity": [
      equipment.signatureEquipment.reason,
      "Hostile (H) only"
    ],
    "APP-6A suspect equipment: signature needs identity H": [
      byKey(fieldStates(textModifiers, app6aContext("SSGPEVATM------")))
        .signatureEquipment.reason,
      "Hostile (H) only"
    ],
    "APP-6A hostile equipment: signature applies": [
      hostileEquipment.signatureEquipment.available,
      true
    ],
    "other standards: every field is available without a limit": [
      modern.every((state) => state.available && state.maxLength === null && !state.reason),
      true
    ],
    "field states follow the form order": [
      modern.map((state) => state.key),
      textModifiers.map((field) => field.key)
    ],
    "letter SIDC parts keep the existing breakdown": [
      sidcParts("SFGPUCI----F---", false).map((part) => [part.label, part.value]),
      [
        ["Scheme", "S"],
        ["Identity", "F"],
        ["Dimension", "G"],
        ["Status", "P"],
        ["Function", "UCI---"],
        ["Modifiers", "-F"],
        ["Country", "--"],
        ["OOB", "-"]
      ]
    ],
    "edition D number SIDC parts include the originator": [
      sidcParts("100310001612110000007920000000", true).map((part) => part.label),
      ["Version", "Identity", "Set", "Amplifier", "Entity", "Modifiers", "Originator country", "Originator set", "National data"]
    ],
    "edition E number SIDC parts include frame shape and country": [
      sidcParts("130310001612110000000030000792", false).map((part) => [part.label, part.value]).slice(6),
      [["Ext.", "00"], ["Frame shape", "3"], ["Other ext.", "0000"], ["Country", "792"]]
    ],
    "recent list moves a symbol to the front once": [
      pushRecent(["a", "b", "c"], "b"),
      ["b", "a", "c"]
    ],
    "recent list keeps at most eight symbols": [
      pushRecent(["1", "2", "3", "4", "5", "6", "7", "8"], "9"),
      ["9", "1", "2", "3", "4", "5", "6", "7"]
    ],
    "placeholders tag empty available fields with their code": [
      [placeholders.options.uniqueDesignation, placeholders.codes["[T]"]],
      ["[T]", "uniqueDesignation"]
    ],
    "placeholders leave filled and unavailable fields alone": [
      ["higherFormation" in placeholders.options, "quantity" in placeholders.options],
      [false, false]
    ],
    "field rows keep their anchor, centre line and field order": [
      probeRows,
      [
        { anchor: "end", x: 5, y: 66, keys: ["altitudeDepth", "location"] },
        { anchor: "middle", x: 100, y: 103, keys: ["specialHeadquarters"] },
        { anchor: "start", x: 195, y: 26, keys: ["reinforcedReduced"] }
      ]
    ],
    "boxes grow away from the anchor, one gap apart": [
      sideBoxes,
      [
        { key: "altitudeDepth", left: -46, top: 35, width: 60, height: 30 },
        { key: "location", left: 20, top: 35, width: 80, height: 30 },
        { key: "staffComments", left: 200, top: 35, width: 90, height: 30 }
      ]
    ],
    "a centred box too wide beside the side rows moves past them": [
      movedBox[2],
      { key: "engagementBar", left: 40, top: -28, width: 120, height: 30 }
    ],
    "a centred box that cannot get past the side rows within a row narrows": [
      narrowedBox[3],
      { key: "engagementBar", left: 46, top: 5, width: 108, height: 30 }
    ],
    "a centred box moves away from a box it meets": [
      stackedBoxes,
      [
        { key: "quantity", left: 65, top: 7, width: 70, height: 30 },
        { key: "engagementBar", left: 40, top: -29, width: 120, height: 30 }
      ]
    ],
    "rows that fit keep their widths": [
      fitRowWidths([sideRow("end", ["dtg"]), sideRow("start", ["staffComments"])], { dtg: 100, staffComments: 100 }, { room: 400, between: 100 }),
      { dtg: 100, staffComments: 100 }
    ],
    "the narrower side keeps its boxes; the wider boxes of the other give up most": [
      fitRowWidths([sideRow("end", ["dtg"]), sideRow("start", ["staffComments", "evaluationRating"])], { dtg: 100, staffComments: 200, evaluationRating: 100 }, { room: 400, between: 100 }),
      { dtg: 100, staffComments: 119, evaluationRating: 72 }
    ],
    "crowded rows on both sides share the room and keep the minimum width": [
      [
        rowSpan(crowded[0], crowdedFit) + rowSpan(crowded[1], crowdedFit) <= 752 - 175,
        Object.values(crowdedFit).every((width) => width >= 48)
      ],
      [true, true]
    ],
    "a crowded row gives up the widest name first and keeps the value room": [
      fitRowWidths(
        [sideRow("end", ["dtg"]), sideRow("start", ["staffComments", "evaluationRating", "combatEffectiveness"])],
        { dtg: 100, staffComments: 140, evaluationRating: 70, combatEffectiveness: 150 },
        { room: 500, between: 100, plain: { dtg: 100, staffComments: 120, evaluationRating: 50, combatEffectiveness: 70 } }
      ),
      { dtg: 100, staffComments: 140, evaluationRating: 70, combatEffectiveness: 70 }
    ],
    "crowded rows on both sides give up names in turn, the wider side first": [
      fitRowWidths(
        [sideRow("end", ["type", "platformType"]), sideRow("start", ["staffComments", "additionalInformation"])],
        { type: 200, platformType: 150, staffComments: 200, additionalInformation: 150 },
        { room: 600, between: 100, plain: { type: 100, platformType: 80, staffComments: 100, additionalInformation: 80 } }
      ),
      { type: 100, platformType: 80, staffComments: 100, additionalInformation: 150 }
    ],
    "with every name given up, a row still too long narrows its values": [
      fitRowWidths(
        [sideRow("end", ["dtg"]), sideRow("start", ["staffComments", "evaluationRating"])],
        { dtg: 100, staffComments: 200, evaluationRating: 100 },
        { room: 400, between: 100, plain: { dtg: 100, staffComments: 180, evaluationRating: 60 } }
      ),
      { dtg: 100, staffComments: 136, evaluationRating: 56 }
    ],
    "rows that cannot fit even at the minimum width give null": [
      fitRowWidths(crowded, { type: 100, platformType: 100, commonIdentifier: 100, evaluationRating: 100, combatEffectiveness: 100, signatureEquipment: 100, hostile: 100, iffSif: 100 }, { room: 500, between: 100 }),
      null
    ],
    "a box makes room for a usual value, never more than the field's limit": [
      [
        fieldValueChars({ key: "uniqueDesignation", maxLength: 21 }),
        fieldValueChars({ key: "uniqueDesignation", maxLength: 6 }),
        fieldValueChars({ key: "somethingNew", maxLength: null })
      ],
      [16, 6, 10]
    ],
    // W and Y formats differ by edition (studio/field-guide.js), so they have
    // no shared code table.
    "code tables cover the rating and engagement fields only": [
      Object.keys(fieldReference).filter(
        (key) => fieldReference[key].rows.length > 0
      ),
      ["evaluationRating", "engagementBar"]
    ],
    "evaluation reference lists six reliability and six credibility codes": [
      fieldReference.evaluationRating.rows.length,
      12
    ],
    "palette status counts loaded symbols while more remain": [
      paletteProgress(40, 1589),
      "Showing 40 of 1,589"
    ],
    "palette status says when every symbol is loaded": [
      paletteProgress(713, 713),
      "All 713 symbols shown"
    ],
    "palette status uses the singular for one symbol": [
      paletteProgress(1, 1),
      "1 symbol shown"
    ],
    "palette status is empty when nothing matches": [
      paletteProgress(0, 0),
      ""
    ]
  },
  "Leader individual": {
    "2525E offers it on a dismounted individual": [
      offeredMobilities(std2525eProfile, "13032700001101010000"),
      ["leader"]
    ],
    "APP-6E offers it with the mobilities": [
      offeredMobilities(app6eProfile, "16032700001101010000").includes("leader"),
      true
    ],
    "a land unit does not take it": [
      offeredMobilities(std2525eProfile, "13031000001211000000").includes("leader"),
      false
    ],
    "it writes code 71": [
      mobilities.find((item) => item[0] === "leader")?.[2],
      "71"
    ],
    "letter SIDCs have no code for it": [
      mobilities.find((item) => item[0] === "leader")?.[3],
      ""
    ]
  },
  "The name of the mobility control": {
    "nothing offered": [mobilityModeName([]), "Mobility"],
    "mobility alone": [mobilityModeName(["tracked"]), "Mobility"],
    "towed arrays alone": [
      mobilityModeName(["shortArray", "longArray"]),
      "Towed array"
    ],
    "mobility and towed arrays": [
      mobilityModeName(["tracked", "shortArray"]),
      "Mobility / towed array"
    ],
    "the leader alone": [mobilityModeName(["leader"]), "Leadership"],
    "mobility and the leader": [
      mobilityModeName(["tracked", "leader"]),
      "Mobility / leadership"
    ]
  },
  "Where the amplifier note says it is drawn": {
    "echelon and mobility": [
      amplifierPlacementNote("Mobility"),
      "Echelon is drawn above the frame; mobility below it."
    ],
    "towed arrays read as mobility": [
      amplifierPlacementNote("Mobility / towed array"),
      "Echelon is drawn above the frame; mobility below it."
    ],
    "the leader alone": [
      amplifierPlacementNote("Leadership"),
      "Leader individual is drawn above the frame."
    ],
    "mobility and the leader": [
      amplifierPlacementNote("Mobility / leadership"),
      "Leader individual is drawn above the frame; mobility below it."
    ]
  },
  "A row of the amplifier picker": {
    "a listed value has its name and code": [
      amplifierChoice({ value: "leader", textContent: "Leader individual", title: "" }, mobilities, true),
      { value: "leader", name: "Leader individual", code: "71", reason: "" }
    ],
    "a letter edition reads the letter code": [
      amplifierChoice({ value: "tracked", textContent: "Tracked", title: "" }, mobilities, false).code,
      "MQ"
    ],
    "an unlisted SIDC value shows its code once": [
      amplifierChoice({ value: "code:72", textContent: "SIDC: 72", title: "" }, mobilities, true),
      { value: "code:72", name: "From SIDC", code: "72", reason: "" }
    ],
    "unspecified has no code": [
      amplifierChoice({ value: "", textContent: "Unspecified", title: "" }, mobilities, true).code,
      ""
    ],
    "a rejected value keeps its reason": [
      amplifierChoice({ value: "tracked", textContent: "Tracked (not valid here)", title: "No mobility here" }, mobilities, true).reason,
      "No mobility here"
    ]
  },
  "list glyphs": {
    "one box takes in every glyph of the list": [
      sharedViewBox(glyphs),
      { x: 1, y: 6, width: 198, height: 148 }
    ],
    "a list with nothing drawn has no box": [sharedViewBox(["", ""]), null],
    "the bare frame stays in the middle, on the line of the text": [
      sharedViewBox(glyphs, glyphs[0]),
      { x: 1, y: 6, width: 198, height: 188 }
    ],
    "an amplifier below the frame centers it too": [
      sharedViewBox([glyph("21 46 158 108"), glyph("21 46 158 148")], glyph("21 46 158 108")),
      { x: 21, y: 6, width: 158, height: 188 }
    ],
    "a frame that failed to draw centers nothing": [
      sharedViewBox(glyphs, ""),
      { x: 1, y: 6, width: 198, height: 148 }
    ],
    "a glyph takes the box of the list": [
      /viewBox="1 6 198 148"/.test(withViewBox(glyphs[0], sharedViewBox(glyphs))),
      true
    ],
    "every glyph of the list ends up the same": [
      new Set(glyphs.slice(0, 3).map((svg) => withViewBox(svg, sharedViewBox(glyphs)))).size,
      1
    ],
    "the size attributes go, so the page sets one size": [
      /\s(?:width|height)=/.test(withViewBox(glyphs[0], sharedViewBox(glyphs)).split(">")[0]),
      false
    ],
    "the drawing keeps its stroke width": [
      withViewBox(glyphs[0], sharedViewBox(glyphs)).includes('stroke-width="4"'),
      true
    ],
    "a glyph that failed to draw stays empty": [withViewBox("", sharedViewBox(glyphs)), ""],
    "no box leaves the glyph alone": [withViewBox(glyphs[0], null), glyphs[0]]
  },
  "frames of different shapes": {
    "each stays in the middle of a box of one size": [
      centeredGlyphs(frames).map((svg) => /viewBox="([^"]*)"/.exec(svg)?.[1]),
      ["21 36 158 128", "21 26 158 128", undefined]
    ],
    "a frame that failed to draw stays empty": [centeredGlyphs(frames)[2], ""],
    "a list with nothing drawn stays empty": [centeredGlyphs(["", ""]), ["", ""]],
    "a row names the shape and its code": [
      frameShapeChoice({ value: "A", textContent: "Sea surface" }),
      { value: "A", name: "Sea surface", code: "A", reason: "" }
    ],
    "a code the list has no row for shows once": [
      frameShapeChoice({ value: "B", textContent: "SIDC: B" }),
      { value: "B", name: "From SIDC", code: "B", reason: "" }
    ]
  },
  "icon modifier rows": {
    "the code goes beside the name": [
      modifierChoice({ value: "set:06", textContent: "06 — Airborne", title: "", disabled: false }),
      { value: "set:06", name: "Airborne", code: "06", reason: "", disabled: false, note: "", group: "" }
    ],
    "a common code keeps its three digits": [
      modifierChoice({ value: "common:106", textContent: "106 — Bridging", title: "", disabled: false }).code,
      "106"
    ],
    "unspecified has no code": [
      modifierChoice({ value: "", textContent: "Unspecified", title: "", disabled: false }).code,
      ""
    ],
    "a row keeps its group": [
      modifierChoice({ value: "set:06", textContent: "06 — Airborne", title: "", disabled: false, parentElement: { label: "Common / Mobility" } }).group,
      "Common / Mobility"
    ],
    "the select around a row is no group": [
      modifierChoice({ value: "", textContent: "Unspecified", title: "", disabled: false, parentElement: {} }).group,
      ""
    ],
    "a row the entity may not use says so once": [
      modifierChoice({ value: "set:06", textContent: "06 — Airborne (not for this entity)", title: "Not for tanks", disabled: true }),
      { value: "set:06", name: "Airborne", code: "06", reason: "Not for tanks", disabled: true, note: "not for this entity", group: "" }
    ],
    "a code from the SIDC stays as it was written": [
      modifierChoice({ value: "set:99", textContent: "SIDC: 99 — reserved for future use", title: "", disabled: false }).name,
      "SIDC: 99 — reserved for future use"
    ]
  },
  "a code the edition does not take": {
    "a code is named once": [
      problemReasons({
        named: [{ text: 'Position 11–12: "XX" is not an echelon or mobility code in this edition.', value: "XX" }],
        errors: ["B-II: XX is not an APP-6A size/mobility code"],
        generic: ["Unknown echelon or mobility code."]
      }),
      ['Position 11–12: "XX" is not an echelon or mobility code in this edition.']
    ],
    "a different error stays": [
      problemReasons({
        named: [{ text: "Position 4 is wrong.", value: "Q" }],
        errors: ["Task force does not apply to this symbol."],
        generic: []
      }),
      ["Position 4 is wrong.", "Task force does not apply to this symbol."]
    ],
    "a code inside a longer word is another code": [
      problemReasons({
        named: [{ text: "Position 11 is wrong.", value: "X" }],
        errors: ["B-II: XX is not a code"],
        generic: []
      }),
      ["Position 11 is wrong.", "B-II: XX is not a code"]
    ],
    "the same error from two places shows once": [
      problemReasons({ named: [], errors: ["Bad code.", "Bad code."], generic: [] }),
      ["Bad code."]
    ],
    "a general reason speaks only when nothing else does": [
      problemReasons({ named: [], errors: [], generic: ["Unknown identity."] }),
      ["Unknown identity."]
    ],
    "a general reason stays out when an error says more": [
      problemReasons({ named: [], errors: ["Bad code."], generic: ["Unknown identity."] }),
      ["Bad code."]
    ]
  },
  "typing in a list": {
    "a letter goes to the next name that starts with it": [
      typeaheadIndex(countries, "t", 0),
      1
    ],
    "the same letter again moves on": [typeaheadIndex(countries, "t", 1), 2],
    "the search wraps round": [typeaheadIndex(countries, "t", 3), 0],
    "more letters keep the row while it still fits": [
      typeaheadIndex(countries, "turk", 1),
      1
    ],
    "an accent is not needed": [typeaheadIndex(countries, "turki", 0), 2],
    "an accent may be typed": [typeaheadIndex(countries, "türki", 0), 2],
    "upper case is the same": [typeaheadIndex(countries, "TUV", 0), 3],
    "nothing that fits stays put": [typeaheadIndex(countries, "x", 2), -1]
  },
  "modifier color": {
    "the color is on and nothing draws it": [
      modifierColorUnused({ on: true, color: "#d32f2f", svg: "<svg></svg>" }),
      true
    ],
    "a modifier draws it": [
      modifierColorUnused({ on: true, color: "#d32f2f", svg: '<svg><path stroke="#d32f2f"/></svg>' }),
      false
    ],
    "the color is off": [
      modifierColorUnused({ on: false, color: "#d32f2f", svg: "<svg></svg>" }),
      false
    ],
    "nothing is drawn at all": [
      modifierColorUnused({ on: true, color: "#d32f2f", svg: "" }),
      false
    ]
  },
  "the preview grid choice": {
    "off is kept": [gridChoice("off"), "off"],
    "nothing saved draws the grid": [gridChoice(null), "on"],
    "anything else draws the grid": [gridChoice("maybe"), "on"]
  },
  "why unit designation controls are off": {
    "a unit with every flag on has nothing to explain": [
      designationNotes({ app6a: true, kind: "unit" }).reason,
      ""
    ],
    "what the flags write stays out of the reason": [
      designationNotes({ app6a: true, kind: "unit" }).about,
      "Writes one combined code to position 11, for example A for headquarters or E for task force."
    ],
    "a numeric edition names position 8": [
      designationNotes({ modern: true }).about,
      "Writes one combined code to position 8 of the SIDC."
    ],
    "an APP-6A installation says why task force is off": [
      designationNotes({ app6a: true, kind: "installation", installation: true }).reason.includes("so task force does not apply"),
      true
    ],
    "another letter edition's installation also names headquarters": [
      designationNotes({ installation: true }).reason,
      "Installations carry the installation modifier (H in position 11), so headquarters and task force do not apply."
    ],
    "a tactical point names every flag it turns off": [
      designationNotes({ app6a: true, kind: "point", tactical: true }).reason,
      "Tactical points take no headquarters, task force or feint flag."
    ],
    "equipment gives task force as the reason": [
      designationNotes({ app6a: true, kind: "equipment" }).reason,
      "Task force applies to units only."
    ],
    "the location offset is explained, not excused": [
      designationNotes({ app6a: true, kind: "equipment" }).about.startsWith("On equipment, S is the location offset indicator"),
      true
    ],
    "mobility turns the staff off on a unit": [
      designationNotes({ app6a: true, kind: "unit", mobility: true }).reason,
      "The mobility code uses positions 11–12, so headquarters and feint / dummy are off. Choose Unspecified to use them."
    ],
    "mobility turns the offset off on equipment": [
      designationNotes({ app6a: true, kind: "equipment", mobility: true }).reason,
      "The mobility code uses positions 11–12, so location offset and feint / dummy are off. Choose Unspecified to use them. Task force applies to units only."
    ],
    "a mobility code turns every flag off in 2525C and APP-6B": [
      designationNotes({ kind: "", mobility: true }).reason,
      "The mobility code uses positions 11–12, so headquarters, task force and feint / dummy are off. Choose Unspecified to use them."
    ],
    "a modern SIDC keeps its flags beside a mobility": [
      designationNotes({ modern: true, mobility: true }).reason,
      ""
    ],
    "a profile's reason names its flag": [
      designationNotes({ modern: true, flagReasons: { taskForce: "not on this symbol set" } }).reason,
      "Task force: not on this symbol set."
    ]
  },
  "why echelon and mobility controls are off": {
    "nothing off, nothing said": [
      amplifierNotes({ disabled: [], placement: "Placement." }).reason,
      ""
    ],
    "placement stays out of the reason": [
      amplifierNotes({ disabled: [], placement: "Placement." }).about,
      "Placement."
    ],
    "an installation takes neither": [
      amplifierNotes({ installation: true, disabled: ["Echelon", "Mobility"], placement: "" }).reason,
      "This symbol takes no echelon or mobility amplifier."
    ],
    "a tactical point takes neither": [
      amplifierNotes({ tactical: true, disabled: [], placement: "" }).reason,
      "This symbol takes no echelon or mobility amplifier."
    ],
    "both modes off without a class rule": [
      amplifierNotes({ disabled: ["Echelon", "Mobility"], edition: "APP-6D", placement: "" }).reason,
      "This symbol takes no echelon or mobility amplifier."
    ],
    "an APP-6A unit": [
      amplifierNotes({ app6a: true, kind: "unit", disabled: ["Mobility"], placement: "" }).reason,
      "Units take an echelon above the frame. Mobility is for equipment."
    ],
    "APP-6A equipment": [
      amplifierNotes({ app6a: true, kind: "equipment", disabled: ["Echelon"], placement: "" }).reason,
      "Equipment takes a mobility amplifier below the frame. Echelon is for units."
    ],
    "an edition's profile leaves one mode out": [
      amplifierNotes({ disabled: ["Mobility"], edition: "MIL-STD-2525C Table IV", placement: "" }).reason,
      "MIL-STD-2525C Table IV offers no mobility amplifier for this symbol."
    ]
  },
  "search results are ranked by how the name fits": {
    "the name itself comes first": [searchRank({ name: "TANK" }, "tank"), 0],
    "then a name that starts with the word": [searchRank({ name: "TANK LIGHT" }, "tank"), 1],
    "then the word inside the name": [searchRank({ name: "MISSILE LAUNCHERS ANTI TANK (AT)" }, "tank"), 2],
    "then a name that starts with the text": [searchRank({ name: "TANKER" }, "tank"), 3],
    "then a word that starts with the text": [searchRank({ name: "OILER/TANKER" }, "tank"), 4],
    "then the text inside a word": [searchRank({ name: "ANTITANK GUN" }, "tank"), 5],
    "a match outside the name is last": [searchRank({ name: "INFANTRY" }, "ground"), 6],
    "accents and case do not matter": [searchRank({ name: "Café" }, "CAFE"), 0],
    "TANK is listed before TANKER, and equal ranks keep their order": [
      rankSearch([{ name: "TANKER" }, { name: "ANTITANK GUN" }, { name: "TANK" }, { name: "TANK LIGHT" }, { name: "TANK MEDIUM" }], "tank").map((icon) => icon.name),
      ["TANK", "TANK LIGHT", "TANK MEDIUM", "TANKER", "ANTITANK GUN"]
    ],
    "no search keeps the list": [rankSearch([{ name: "B" }, { name: "A" }], " ").map((icon) => icon.name), ["B", "A"]]
  },
  "a raw code of an applied SIDC does not follow to another standard": {
    "the echelon code is dropped": [withoutRawCode("code:99"), ""],
    "the status falls back": [withoutRawCode("code:9", "present"), "present"],
    "a listed value stays": [withoutRawCode("battalion"), "battalion"],
    "an empty value stays": [withoutRawCode(""), ""]
  },
  "the country note": {
    "says how to choose a flag": [
      countryFlagNote({ selected: "", code: "", label: "FIPS" }),
      "Select a country or apply a SIDC to select its flag. Included in SVG and PNG exports."
    ],
    "names the code a flag writes": [
      countryFlagNote({ selected: "us", code: "US", label: "FIPS" }),
      "FIPS code: US. Included in SVG and PNG exports."
    ],
    "says when a flag writes no code": [
      countryFlagNote({ selected: "nato", code: "", label: "FIPS" }),
      "Display-only flag: this standard has no country code for it, so the SIDC carries none. Included in SVG and PNG exports."
    ]
  }
};
