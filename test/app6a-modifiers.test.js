// APP-6A (1998) S-scheme modifier, identity and Table B-II checks.
// Expected values come from the publication: Table I-II (PDF 21-23 / printed
// 15-17), Table III (PDF 25-27 / 19-21), Figure 2a (PDF 28 / 22), 506.2 (PDF
// 32-33 / 26-27), Table B-II (PDF 75-77 / 69-71). Not from current output.
import { ms, app6a } from "../index.mjs";
import { joinFields } from "../src/modifierprofiles/common.js";
import { drawExtents, viewBoxOf, intersects, outside } from "./draw-extents.js";
import {
  app6aProfile,
  getApp6aFields,
  app6aTextFields
} from "../src/modifierprofiles/app6a.js";

ms.reset();
ms.addIcons(app6a);
ms.setStandard("APP6A");

function flat(x) {
  return Array.isArray(x)
    ? x.reduce((all, item) => all.concat(flat(item)), [])
    : x ? [x].concat(flat(x.draw || [])) : [];
}
const parts = (symbol) => flat(symbol.drawInstructions);
const texts = (symbol) => parts(symbol).filter((p) => p.type === "text" && !p.icon);
const frame = (symbol) => parts(symbol).filter((p) => (p.type === "path" || p.type === "circle") && !p.icon)[0];
const geometry = (p) => JSON.stringify([p.d, p.cx, p.cy, p.r]);
const make = (sidc, options) => new ms.Symbol(sidc, options || {});
// Accepted: valid, and no text rule warns. A broken text rule alone leaves the
// symbol valid (test/field-warnings.test.js).
const valid = (sidc, options) => {
  const symbol = make(sidc, options);
  return symbol.isValid() && !symbol.isValid(true).fieldWarnings.length;
};

const result = {};
const section = (name) => (result[name] = result[name] || {});

// ---------------------------------------------------------------- identity
const light = {
  P: "rgb(255,255,128)", U: "rgb(255,255,128)", A: "rgb(128,224,255)", F: "rgb(128,224,255)",
  N: "rgb(170,255,170)", S: "rgb(255,128,128)", H: "rgb(255,128,128)", J: "rgb(255,128,128)", K: "rgb(255,128,128)"
};
const marker = { P: "?", A: "?", S: "?", J: "J", K: "K" };
const bases = {
  "land unit": (i, s) => `S${i}G${s}UCI-----`,
  "land equipment": (i, s) => `S${i}G${s}EWAL-----`,
  "sea surface": (i, s) => `S${i}S${s}CLCC-----`,
  air: (i, s) => `S${i}A${s}MF------`,
  subsurface: (i, s) => `S${i}U${s}SS------`
};
const identity = section("Table I identity, colour, frame, mark and Table II status");
for (const [name, build] of Object.entries(bases)) {
  const frames = {};
  for (const id of "PUAFNSHJK") {
    for (const status of "PA") {
      const symbol = make(build(id, status).padEnd(15, "-"));
      const key = `${name} ${id}${status}`;
      frames[id] = frames[id] || geometry(frame(symbol));
      identity[`${key} valid`] = [symbol.isValid(), true];
      identity[`${key} fill`] = [frame(symbol).fill, light[id]];
      const marks = texts(symbol).map((t) => t.text);
      identity[`${key} exactly one mark`] = [marks, marker[id] ? [marker[id]] : []];
      identity[`${key} dashed iff planned`] = [!!symbol.metadata.notpresent, status === "A"];
      identity[`${key} dashed outline drawn iff planned`] = [
        parts(symbol).some((p) => p.strokedasharray && !p.icon), status === "A"
      ];
      if (id === "P") {
        // Pending: the ? is inside the frame, centred (Table I).
        const mark = texts(symbol)[0];
        identity[`${key} ? inside the frame`] = [[mark.x, mark.textanchor], [100, "middle"]];
      }
      if (id === "A" || id === "S" || id === "J" || id === "K") {
        const mark = texts(symbol)[0];
        identity[`${key} mark in field E`] = [
          [mark.textanchor, mark.x > symbol.metadata.baseGeometry.bbox.x2],
          ["start", true]
        ];
      }
    }
  }
  identity[`${name} P frame = U frame`] = [frames.P, frames.U];
  identity[`${name} A frame = F frame`] = [frames.A, frames.F];
  identity[`${name} S frame = H frame`] = [frames.S, frames.H];
  identity[`${name} J frame = friend frame, not hostile`] = [[frames.J === frames.F, frames.J === frames.H], [true, false]];
  identity[`${name} K frame = friend frame, not hostile`] = [[frames.K === frames.F, frames.K === frames.H], [true, false]];
  identity[`${name} F frame differs from U, N and H`] = [new Set([frames.U, frames.F, frames.N, frames.H]).size, 4];
}
// Pending is not planned: P with status P has a solid frame; U planned is dashed with no mark.
identity["pending present: solid, with ?"] = [[make("SPGPUCI--------").metadata.notpresent, texts(make("SPGPUCI--------")).length], ["", 1]];
identity["unknown planned: dashed, no mark"] = [[!!make("SUGAUCI--------").metadata.notpresent, texts(make("SUGAUCI--------")).length], [true, 0]];
// Unframed symbols cannot show planned status; the icon is not dashed instead.
const unframedPlanned = make("SFGAUCI--------", { frame: false });
identity["unframed planned: no dash anywhere"] = [parts(unframedPlanned).some((p) => p.strokedasharray), false];
identity["unframed planned: note records the limit"] = [unframedPlanned.isValid(true).notes.some((n) => /planned status cannot be shown/.test(n)), true];
identity["unframed A still shows field E"] = [texts(make("SAGPUCI--------", { frame: false })).map((t) => t.text), ["?"]];
// O: no frame defined; no guess, a diagnostic.
const none = make("SOGPUCI--------");
identity["O is not valid"] = [none.isValid(), false];
identity["O has an identity diagnostic"] = [none.isValid(true).identityErrors.length, 1];
identity["O does not become Unknown or Friend"] = [none.metadata.affiliation, "none"];
identity["O draws no frame"] = [parts(none).filter((p) => p.type === "path").length, 0];
identity["unsupported dimension draws no frame"] = [make("SFXPUCI--------").isValid(), false];
// Policy: 503.1a allows field E or the frame for pending, assumed friend and suspect.
identity["policy field: pending ? in field E once"] = [texts(make("SPGPUCI--------", { uncertaintyMarker: "field" })).map((t) => [t.text, t.textanchor]), [["?", "start"]]];
identity["policy frame: assumed friend ? inside once"] = [texts(make("SAGPUCI--------", { uncertaintyMarker: "frame" })).map((t) => [t.text, t.x, t.textanchor]), [["?", 100, "middle"]]];
identity["policy frame: joker stays in field E"] = [texts(make("SJGPUCI--------", { uncertaintyMarker: "frame" })).map((t) => t.textanchor), ["start"]];
identity["info fields off: field E mark is still drawn once"] = [texts(make("SSGPUCI--------", { infoFields: false })).map((t) => t.text), ["?"]];

// ------------------------------------------------------------- Table III
const limits = {
  unit: ["SFGPUCI--------", { F: 3, G: 20, H: 20, J: 2, K: 5, M: 21, P: 5, T: 21, W: 14, X: 6, Y: 19, Z: 8, AA: 9 }],
  equipment: ["SHGPEWAL-------", { C: 9, G: 20, H: 20, J: 2, L: 1, N: 3, P: 5, T: 21, V: 24, W: 14, X: 6, Y: 19, Z: 8 }],
  installation: ["SFGPI-----H----", { G: 20, H: 20, J: 2, K: 5, P: 5, T: 21, W: 14, X: 6, Y: 19, Z: 8 }]
};
const table = section("Table III applicability and lengths");
for (const [kind, [sidc, expected]] of Object.entries(limits)) {
  const fields = app6aProfile.fields(sidc).filter((f) => f.kind !== "graphic");
  table[`${kind} field set and lengths`] = [
    Object.fromEntries(fields.map((f) => [f.field, f.maxLength])),
    expected
  ];
  table[`${kind} class`] = [app6aProfile.symbolClass(sidc), kind];
  for (const entry of app6aTextFields) {
    const max = expected[entry.field];
    const free = ["evaluationRating", "reinforcedReduced", "signatureEquipment", "hostile"].indexOf(entry.key) < 0;
    const options = (value) => ({ [entry.key]: value });
    table[`${kind} ${entry.field} empty`] = [valid(sidc, options("")), true];
    if (!max) {
      if (free) table[`${kind} ${entry.field} not applicable`] = [valid(sidc, options("A")), false];
      continue;
    }
    if (free) {
      table[`${kind} ${entry.field} max`] = [valid(sidc, options("A".repeat(max))), true];
      table[`${kind} ${entry.field} one character`] = [valid(sidc, options("A")), true];
      table[`${kind} ${entry.field} max+1`] = [valid(sidc, options("A".repeat(max + 1))), false];
    }
  }
}
table["Z is 8 for installations too"] = [[valid("SFGPI-----H----", { speed: "12345678" }), valid("SFGPI-----H----", { speed: "123456789" })], [true, false]];
table["B size indicator is never a text option"] = [app6aProfile.fields("SFGPEWAL-------").some((f) => f.field === "B" && f.kind !== "graphic"), false];
table["length counts code points (Turkish letters, emoji)"] = [
  [valid("SFGPUCI--------", { uniqueDesignation: "İĞŞÜÖÇ".repeat(3) + "ı" }), valid("SFGPUCI--------", { iffSif: "😀".repeat(5) }), valid("SFGPUCI--------", { iffSif: "😀".repeat(6) })],
  [true, true, false]
];
table["C quantity: equipment only"] = [[valid("SFGPEWAL-------", { quantity: "12" }), valid("SFGPUCI--------", { quantity: "12" }), valid("SFGPI-----H----", { quantity: "12" })], [true, false, false]];
table["K: unit and installation, not equipment"] = [[valid("SFGPUCI--------", { combatEffectiveness: "FULL" }), valid("SFGPI-----H----", { combatEffectiveness: "FULL" }), valid("SFGPEWAL-------", { combatEffectiveness: "FULL" })], [true, true, false]];
table["M, F, AA: unit only"] = [
  [["higherFormation", "II"], ["reinforcedReduced", "(+)"], ["specialHeadquarters", "NATO"]].map(([key, value]) => [valid("SFGPUCI--------", { [key]: value }), valid("SFGPEWAL-------", { [key]: value }), valid("SFGPI-----H----", { [key]: value })].join()),
  ["true,false,false", "true,false,false", "true,false,false"]
];
table["V: equipment only"] = [[valid("SFGPEWAL-------", { type: "TANK" }), valid("SFGPUCI--------", { type: "TANK" }), valid("SFGPI-----H----", { type: "TANK" })], [true, false, false]];
for (const key of ["country", "headquartersElement", "installationComposition", "engagementBar", "platformType", "equipmentTeardownTime", "commonIdentifier", "guardedUnit", "specialDesignator", "sigint", "auxiliaryEquipmentIndicator"]) {
  table[`later-edition field ${key} is rejected`] = [valid("SFGPEWAL-------", { [key]: "X" }), false];
}
table["later-edition engagement bar is not drawn"] = [parts(make("SFGPEWAL-------", { engagementBar: "R:ENG" })).some((p) => p.text === "R:ENG"), false];
table["later-edition country text is not drawn"] = [texts(make("SFGPEWAL-------", { country: "TUR" })).length, 0];

// -------------------------------------------------------------- enumerations
const enums = section("Enumerated and literal fields");
enums["F accepts (+) (-) (±)"] = [["(+)", "(-)", "(±)"].map((v) => valid("SFGPUCI--------", { reinforcedReduced: v })), [true, true, true]];
enums["F rejects other literals"] = [["+", "(+/-)", "(--)", "(+) "].map((v) => valid("SFGPUCI--------", { reinforcedReduced: v })), [false, false, false, false]];
let pairs = 0;
let accepted = 0;
for (const reliability of "ABCDEF") for (const credibility of "123456") {
  pairs++;
  if (valid("SFGPUCI--------", { evaluationRating: reliability + credibility })) accepted++;
}
enums["J accepts all 36 reliability/credibility pairs"] = [[pairs, accepted], [36, 36]];
enums["J rejects G1 A7 A0 a1 A 12 1A"] = [["G1", "A7", "A0", "a1", "A", "12", "1A"].map((v) => valid("SFGPUCI--------", { evaluationRating: v })), [false, false, false, false, false, false, false]];
enums["J choices listed once each"] = [app6aProfile.fields("SFGPUCI--------").filter((f) => f.field === "J")[0].choices.length, 36];
enums["L accepts ! only"] = [[valid("SHGPEWAL-------", { signatureEquipment: "!" }), valid("SHGPEWAL-------", { signatureEquipment: "!!" }), valid("SHGPEWAL-------", { signatureEquipment: "X" })], [true, false, false]];
enums["N accepts ENY only"] = [[valid("SHGPEWAL-------", { hostile: "ENY" }), valid("SHGPEWAL-------", { hostile: "eny" }), valid("SHGPEWAL-------", { hostile: "ENEMY" })], [true, false, false]];
for (const id of "PUAFNSHJK") {
  enums[`L only for identity H (${id})`] = [valid(`S${id}GPEWAL-------`, { signatureEquipment: "!" }), id === "H"];
  enums[`N ENY on equipment of any identity (${id})`] = [valid(`S${id}GPEWAL-------`, { hostile: "ENY" }), true];
  enums[`N and L never apply to units (${id})`] = [[valid(`S${id}GPUCI--------`, { hostile: "ENY" }), valid(`S${id}GPUCI--------`, { signatureEquipment: "!" })], [false, false]];
  enums[`N and L never apply to installations (${id})`] = [[valid(`S${id}GPI-----H----`, { hostile: "ENY" }), valid(`S${id}GPI-----H----`, { signatureEquipment: "!" })], [false, false]];
}
const enyFriend = make("SFGPEWAL-------", { hostile: "ENY" });
enums["N=ENY does not change the identity or frame"] = [[frame(enyFriend).fill, enyFriend.metadata.affiliation, enyFriend.isValid(true).notes.length], ["rgb(128,224,255)", "Friend", 1]];
enums["identity H alone draws no ENY"] = [texts(make("SHGPEWAL-------")).length, 0];
enums["Studio shape: N for friendly equipment, L only for H"] = [
  [getApp6aFields("SFGPEWAL-------").some((f) => f.key === "hostile"), getApp6aFields("SFGPEWAL-------").some((f) => f.key === "signatureEquipment"), getApp6aFields("SHGPEWAL-------").some((f) => f.key === "signatureEquipment")],
  [true, false, true]
];
enums["unavailable reason names the restriction"] = [[app6aProfile.unavailableReason("signatureEquipment", "SFGPEWAL-------"), app6aProfile.unavailableReason("quantity", "SFGPUCI--------"), app6aProfile.unavailableReason("country", "SFGPUCI--------"), app6aProfile.unavailableReason("type", "SFGPEWAL-------")], ["Hostile identity (H) only", "equipment only", "Not an APP-6A Table III field", ""]];

// ------------------------------------------------- Figure 2a text layout
const layout = section("Figure 2a layout (rows, single space, collapse, alignment)");
const rowY = (symbol, row) => 100 + (row - 2.5) * symbol.style.infoSize;
const byRow = (symbol) => {
  const out = {};
  for (const t of texts(symbol)) out[`${t.textanchor === "end" ? "L" : "R"}${Math.round((t.y - 100) / symbol.style.infoSize + 2.5)}`] = t.text;
  return out;
};
const full = make("SAGPUCI--------", {
  dtg: "021435ZNOV26", altitudeDepth: "100", location: "3N 4E", uniqueDesignation: "T1", speed: "9",
  reinforcedReduced: "(+)", staffComments: "G1", additionalInformation: "H1", higherFormation: "M1",
  evaluationRating: "B2", combatEffectiveness: "85", iffSif: "1"
});
layout["unit rows"] = [byRow(full), { L1: "021435ZNOV26", L2: "100 3N 4E", L4: "T1", L5: "9", R1: "? (+)", R2: "G1", R3: "H1", R4: "M1", R5: "B2 85 1" }];
layout["unit alignment: left text right-justified, right text left-justified"] = [
  [...new Set(texts(full).map((t) => t.textanchor + ":" + t.x))].sort(), ["end:5", "start:195"]
];
layout["unit row baselines"] = [texts(full).filter((t) => t.text === "T1")[0].y, rowY(full, 4)];
layout["unit is valid"] = [full.isValid(), true];
const eq = make("SHGPEWAL-------", { type: "TANK", uniqueDesignation: "T9", speed: "30", evaluationRating: "C3", signatureEquipment: "!", hostile: "ENY", iffSif: "12" });
layout["equipment rows V T Z and J L N P"] = [byRow(eq), { L3: "TANK", L4: "T9", L5: "30", R5: "C3 ! ENY 12" }];
const collapse = (options, expected, sidc) => [byRow(make(sidc || "SHGPEWAL-------", options)), expected];
layout["X alone"] = collapse({ altitudeDepth: "100" }, { L2: "100" });
layout["Y alone collapses X's slot"] = collapse({ location: "3N 4E" }, { L2: "3N 4E" });
layout["X then Y with one space"] = collapse({ location: "3N 4E", altitudeDepth: "100" }, { L2: "100 3N 4E" });
layout["L alone"] = collapse({ signatureEquipment: "!" }, { R5: "!" });
layout["N and P"] = collapse({ hostile: "ENY", iffSif: "77" }, { R5: "ENY 77" });
layout["J and P skip K L N"] = collapse({ evaluationRating: "A1", iffSif: "9" }, { R5: "A1 9" });
layout["E alone"] = collapse({}, { R1: "?" }, "SSGPEWAL-------");
layout["E before F, one space"] = collapse({ reinforcedReduced: "(-)" }, { R1: "? (-)" }, "SAGPUCI--------");
layout["F alone for a friend"] = collapse({ reinforcedReduced: "(±)" }, { R1: "(±)" }, "SFGPUCI--------");
layout["no double or edge spaces in any joined row"] = [Object.values(byRow(full)).concat(Object.values(byRow(eq))).some((s) => /  |^ | $/.test(s)), false];
layout["quantity C above the frame, centred"] = [
  (() => { const s = make("SFGPEWAL-------", { quantity: "12" }); const t = texts(s)[0]; return [t.text, t.x, t.textanchor, t.y === s.metadata.baseGeometry.bbox.y1 - 10]; })(),
  ["12", 100, "middle", true]
];
layout["AA inside the frame, centred"] = [(() => { const t = texts(make("SFGPUCI--------", { specialHeadquarters: "USCINCPAC" }))[0]; return [t.text, t.x, t.textanchor]; })(), ["USCINCPAC", 100, "middle"]];
layout["class-illegal text is not drawn"] = [texts(make("SFGPUCI--------", { quantity: "12", type: "TANK" })).length, 0];
layout["profile layout rows (unit)"] = [app6aProfile.textLayout("SAGPUCI--------"), {
  left: [[], ["dtg"], ["altitudeDepth", "location"], [], ["uniqueDesignation"], ["speed"]],
  right: [[], ["affiliationMarker", "reinforcedReduced"], ["staffComments"], ["additionalInformation"], ["higherFormation"], ["evaluationRating", "combatEffectiveness", "iffSif"]],
  separator: " ", top: [], inner: ["specialHeadquarters"], bottom: []
}];
layout["profile layout: L only for hostile equipment"] = [[app6aProfile.textLayout("SHGPEWAL-------").right[5].indexOf("signatureEquipment") > -1, app6aProfile.textLayout("SFGPEWAL-------").right[5].indexOf("signatureEquipment") > -1], [true, false]];
layout["G-scheme keeps the legacy layout"] = [app6aProfile.textLayout("GFCPPC--------"), null];
const svgSymbol = make("SAGPUCI--------", { reinforcedReduced: "(+)", dtg: "1", location: "L" });
layout["SVG draws every text instruction once"] = [(svgSymbol.asSVG().match(/<text/g) || []).length, parts(svgSymbol).filter((p) => p.type === "text").length];

// ------------------------------------------------------------- Table B-II
const sizes = section("Table B-II size/mobility");
const bits = { "-": [0, 0, 0], A: [1, 0, 0], B: [1, 1, 0], C: [1, 0, 1], D: [1, 1, 1], E: [0, 1, 0], F: [0, 0, 1], G: [0, 1, 1] };
const count = (symbol, cssClass) => parts(symbol).filter((p) => String(p.cssClass || "").indexOf(cssClass) > -1).length;
const single = (code) => make(`SFGPUCI---${code}---`);
const hq1 = count(single("A-"), "headquarters");
const tf1 = count(single("E-"), "taskforce");
const fd1 = count(single("F-"), "feintdummy");
const echelonNames = ["Team/Crew", "Squad", "Section", "Platoon/detachment", "Company/battery/troop", "Battalion/squadron", "Regiment/group", "Brigade", "Division", "Corps/MEF", "Army", "Army Group/front", "Region/Theater"];
for (const first of Object.keys(bits)) {
  for (const second of "-ABCDEFGHIJKLM") {
    const code = first + second;
    const symbol = make(`SFGPUCI---${code}---`);
    const [hq, tf, fd] = bits[first];
    sizes[`${code} valid unit`] = [symbol.isValid(), true];
    sizes[`${code} HQ/TF/FD bits`] = [[symbol.metadata.headquarters, symbol.metadata.taskForce, symbol.metadata.feintDummy].map(Number), [hq, tf, fd]];
    sizes[`${code} echelon`] = [symbol.metadata.echelon, second === "-" ? "" : echelonNames["ABCDEFGHIJKLM".indexOf(second)]];
    sizes[`${code} glyphs drawn once`] = [[count(symbol, "headquarters"), count(symbol, "taskforce"), count(symbol, "feintdummy"), count(symbol, "echelon")], [hq * hq1, tf * tf1, fd * fd1, count(single("-" + second), "echelon")]];
  }
}
sizes["-N command echelon is not APP-6A"] = [[valid("SFGPUCI----N---"), make("SFGPUCI----N---").metadata.echelon], [false, ""]];
const installation = make("SFGPI-----H----");
sizes["H- installation"] = [[installation.isValid(), installation.metadata.installation, installation.metadata.echelon], [true, true, ""]];
const feintInstallation = make("SFGPI-----HB---");
sizes["HB is feint/dummy installation, not squad"] = [[feintInstallation.isValid(), feintInstallation.metadata.feintDummy, feintInstallation.metadata.echelon], [true, true, ""]];
sizes["installations need H"] = [[valid("SFGPI-----A----"), valid("SFGPI-----HA---"), valid("SFGPI-----BF---")], [false, false, false]];
sizes["unit cannot be H or M"] = [[valid("SFGPUCI---H----"), valid("SFGPUCI---MO---")], [false, false]];
const mobilityNames = { O: "Wheeled limited cross country", P: "Wheeled cross country", Q: "Tracked", R: "Wheeled and tracked combination", S: "Towed", T: "Rail", U: "Over snow (prime mover)", V: "Sled", W: "Pack animals", X: "Barge", Y: "Amphibious" };
for (const [code, name] of Object.entries(mobilityNames)) {
  const symbol = make(`SFGPEWAL--M${code}---`);
  sizes[`M${code} equipment mobility`] = [[symbol.isValid(), symbol.metadata.mobility], [true, name]];
}
const heading = make("SFGPEWAL--M----");
sizes["M- heading: valid, no mobility graphic, noted"] = [[heading.isValid(), heading.metadata.mobility, heading.isValid(true).notes.length], [true, "", 1]];
sizes["no NS/NL, MN, MZ, K- on S symbols"] = [["NS", "NL", "MN", "MZ", "MA", "K-"].map((code) => valid(`SFGPEWAL--${code}---`)), [false, false, false, false, false, false]];
sizes["equipment: echelon and TF are not allowed"] = [[valid("SFGPEWAL---B---"), valid("SFGPEWAL--E----"), valid("SFGPEWAL--B----")], [false, false, false]];
const offset = make("SFGPEWAL--A----");
sizes["equipment A- is a location offset, units are headquarters"] = [[offset.isValid(), offset.metadata.headquarters, offset.metadata.locationOffset, single("A-").metadata.locationOffset], [true, true, true, false]];
sizes["equipment may carry feint/dummy (Table III AB)"] = [valid("SFGPEWAL--F----"), true];
sizes["HQ + TF + FD + echelon together, no duplicate glyphs"] = [(() => { const s = make("SFGPUCI---DI---"); return [count(s, "headquarters"), count(s, "taskforce"), count(s, "feintdummy"), s.isValid()]; })(), [hq1, tf1, fd1, true]];

// ------------------------------------------- bounding box and row placement
// HQ staff / location offset (S), direction arrow (Q), echelon (B), task force
// (D), feint/dummy (AB) and mobility (R) together with a full set of text rows.
// Q (505.1a, PDF 30 / 24; Figure 2a, PDF 28 / 22): land symbols get a bent arrow
// from the bottom centre of the frame (also with a staff, Figure 2a shows S and
// Q ground together); every other symbol an arrow from the centre. The headquarters
// staff is one frame height long (Annex C.4.1c, PDF 124 / 118). AO is not an
// APP-6A S field and is not drawn.
const placement = section("Bounding box and row placement (S, Q, B, D, AB, R with text)");
const rowText = { dtg: "021435ZNOV26", altitudeDepth: "100", location: "3N 4E", uniqueDesignation: "T1", speed: "9", reinforcedReduced: "(+)", staffComments: "G1", additionalInformation: "H1", higherFormation: "M1", evaluationRating: "B2", combatEffectiveness: "85", iffSif: "1", specialHeadquarters: "USCINCPAC" };
const equipmentRowText = { dtg: "021435ZNOV26", altitudeDepth: "100", location: "3N 4E", uniqueDesignation: "T1", speed: "9", type: "TANK", quantity: "12", staffComments: "G1", additionalInformation: "H1", evaluationRating: "B2", iffSif: "1", hostile: "ENY", signatureEquipment: "!" };
const combos = [];
for (const first of "-ABCD") for (const second of "-AFIM") combos.push(["unit", `SAGPUCI---${first}${second}---`, rowText]);
combos.push(["pending unit", "SPGPUCI---DM---", rowText]);
for (const code of ["A-", "C-", "--", "MO", "MQ", "MS", "MY"]) combos.push(["equipment", `SHGPEWAL--${code}---`, equipmentRowText]);
const installationRowText = Object.assign({}, rowText);
for (const key of ["reinforcedReduced", "higherFormation", "specialHeadquarters"]) delete installationRowText[key];
for (const code of ["H-", "HB"]) combos.push(["installation", `SFGPI-----${code}---`, installationRowText]);
combos.push(["air", "SHAPMF---------", equipmentRowText], ["sea surface", "SHSPCL---------", equipmentRowText], ["subsurface", "SHUPSS--------", equipmentRowText]);
const directions = [undefined, 0, 45, 90, 135, 180, 225, 270, 315];
const round = (n) => Math.round(n * 1000) / 1000;
// Echelon and task force glyphs are wider than the frame and may reach into the
// first text rows (not source-defined, see docs); the arrow crosses the frame by design.
const widerThanFrame = (e) => /echelon|taskforce/.test(e.part.cssClass || "");
for (const [kind, sidc, text] of combos) {
  for (const direction of directions) {
    const name = `${kind} ${sidc} direction ${direction}`;
    const symbol = make(sidc, direction === undefined ? text : Object.assign({}, text, { direction }));
    const view = viewBoxOf(symbol.asSVG());
    const all = drawExtents(symbol.drawInstructions, symbol.style.strokeWidth);
    const frameBox = symbol.metadata.baseGeometry.bbox;
    const rows = all.filter((e) => e.kind === "text" && !e.part.icon && e.part.textanchor !== "middle");
    const label = (e) => e.part.text || String(e.part.d).slice(0, 30);
    placement[`${name}: valid`] = [symbol.isValid(), true];
    placement[`${name}: SVG viewBox contains every drawn part`] = [all.filter((e) => outside(e.outer, view)).map(label), []];
    placement[`${name}: viewBox is the symbol bbox plus the stroke width`] = [[view.x1, view.y1, view.x2, view.y2].map(round), [symbol.bbox.x1 - 4, symbol.bbox.y1 - 4, symbol.bbox.x2 + 4, symbol.bbox.y2 + 4].map(round)];
    placement[`${name}: text rows do not overlap the frame`] = [rows.filter((e) => intersects(e.box, frameBox)).map(label), []];
    placement[`${name}: left rows end and right rows start outside the frame`] = [rows.every((e) => (e.part.textanchor === "end" ? e.part.x <= frameBox.x1 : e.part.x >= frameBox.x2)), true];
    placement[`${name}: text rows clear of staff, feint/dummy and installation bar`] = [
      rows.filter((r) => all.some((g) => g.kind !== "text" && /headquarters|feintdummy|installation/.test(g.part.cssClass || "") && intersects(r.box, g.box))).map(label),
      []
    ];
    if (direction === undefined) {
      placement[`${name}: text rows clear of every other graphic (mobility, frame)`] = [
        rows.filter((r) => all.some((g) => g.kind !== "text" && !g.part.icon && !widerThanFrame(g) && intersects(r.box, g.box))).map(label),
        []
      ];
    }
    const arrowGroups = parts(symbol).filter((p) => p.type === "translate" || p.type === "rotate");
    if (direction !== undefined) {
      const land = kind === "unit" || kind === "pending unit" || kind === "equipment" || kind === "installation";
      const stem = parts(symbol).filter((p) => p.type === "path" && p.d === `M 100,${frameBox.y2}l0,100`);
      placement[`${name}: land arrow starts at the bottom centre of the frame, others at the centre`] = [
        land ? [stem.length, arrowGroups.some((g) => g.type === "translate" && g.x === 0 && g.y === frameBox.y2)] : [stem.length, arrowGroups.some((g) => g.type === "translate")],
        land ? [1, true] : [0, false]
      ];
    }
    const staffed = /^S.G.[UE].{5}(A|B|C|D)/.test(sidc);
    const staff = parts(symbol).filter((p) => /headquarters/.test(p.cssClass || ""));
    if (staffed) {
      const staffBox = all.filter((e) => /headquarters/.test(e.part.cssClass || ""))[0].box;
      placement[`${name}: staff is on the left edge and one frame height below the frame`] = [[staff.length, staffBox.x1, staffBox.x2, staffBox.y1 >= frameBox.y1, staffBox.y2 - frameBox.y2], [1, frameBox.x1, frameBox.x1, true, 100]];
    }
  }
}
const withBar = make("SAGPUCI---AF---", Object.assign({ engagementBar: "A:BBB-CC", direction: 90 }, rowText));
const withoutBar = make("SAGPUCI---AF---", Object.assign({ direction: 90 }, rowText));
const coordinates = (symbol) => [symbol.bbox.x1, symbol.bbox.y1, symbol.bbox.x2, symbol.bbox.y2];
placement["engagement bar AO is not drawn and does not enlarge the symbol"] = [[parts(withBar).some((p) => p.text === "A:BBB-CC"), coordinates(withBar)], [false, coordinates(withoutBar)]];
const legacyHq = make("SAGPUCI---A----", { standard: "APP6", direction: 90 });
const legacyFrame = legacyHq.metadata.baseGeometry.bbox;
placement["APP-6B keeps the arrow at the end of the staff (unchanged)"] = [parts(legacyHq).filter((p) => p.type === "translate").map((p) => [p.x, p.y]), [[legacyFrame.x1 - 100, legacyFrame.y2 - (100 - ms._hqStaffLength)]]];

// ------------------------------------------------- whitespace-only text
// A whitespace-only value is empty: no row, no reserved separator, not
// "present" for validation. Non-blank text is never trimmed (common.js).
const blankSection = section("Whitespace-only text is empty");
const textKeys = ["quantity", "reinforcedReduced", "staffComments", "additionalInformation", "evaluationRating", "combatEffectiveness", "signatureEquipment", "higherFormation", "hostile", "iffSif", "sigint", "uniqueDesignation", "type", "dtg", "altitudeDepth", "location", "speed", "specialHeadquarters", "country", "platformType", "equipmentTeardownTime", "commonIdentifier", "auxiliaryEquipmentIndicator", "headquartersElement", "installationComposition", "engagementBar", "engagementType", "guardedUnit", "specialDesignator"];
const blanks = ["   ", "\t", " \n ", "\u00a0", "\u3000 "];
const allBlank = (blank) => Object.fromEntries(textKeys.map((key) => [key, blank]));
blankSection["joinFields drops whitespace-only values and their separators"] = [
  [joinFields({ a: "  ", b: "x" }, ["a", "b"]), joinFields({ a: "x", b: " \t ", c: "y" }, ["a", "b", "c"]), joinFields({ a: "x", b: "\u00a0" }, ["a", "b"]), joinFields({ a: " ", b: "\n" }, ["a", "b"])],
  ["x", "x y", "x", ""]
];
blankSection["joinFields keeps non-blank values untrimmed"] = [joinFields({ a: " x ", b: "y" }, ["a", "b"]), " x  y"];
for (const sidc of ["SFGPUCI--------", "SHGPEWAL-------", "SFGPI-----H----", "SPGPUCI--------", "SAGPUCI--------", "SJGPUCI--------", "SFGAUCI--------", "GFCPPC--------"]) {
  blanks.forEach((blank, i) => {
    const name = `blank ${i} on ${sidc}`;
    const blanked = make(sidc, allBlank(blank));
    const plain = make(sidc);
    blankSection[`${name}: renders exactly like no text`] = [blanked.asSVG(), plain.asSVG()];
    blankSection[`${name}: same bounding box`] = [[blanked.bbox.x1, blanked.bbox.x2, blanked.bbox.y1, blanked.bbox.y2], [plain.bbox.x1, plain.bbox.x2, plain.bbox.y1, plain.bbox.y2]];
    blankSection[`${name}: no validation error`] = [blanked.isValid(true).modifierErrors, plain.isValid(true).modifierErrors];
    blankSection[`${name}: as valid as without text`] = [blanked.isValid(), plain.isValid()];
  });
}
blankSection["blank is not present: inapplicable fields on a unit"] = [valid("SFGPUCI--------", { quantity: " ", type: " ", hostile: " ", signatureEquipment: "\t" }), true];
blankSection["blank is not present: out-of-range choices"] = [valid("SFGPUCI--------", { evaluationRating: " ", reinforcedReduced: " " }), true];
blankSection["blank is not present: later-edition fields"] = [valid("SFGPEWAL-------", { country: " ", headquartersElement: "  ", engagementBar: "   ", sigint: " " }), true];
blankSection["blank L on friendly equipment is not an identity error"] = [valid("SFGPEWAL-------", { signatureEquipment: " " }), true];
blankSection["blank on a G point: J, L, N and Q are not present"] = [make("GFCPPC--------", { evaluationRating: " ", signatureEquipment: " ", hostile: " ", direction: " " }).isValid(true).modifierErrors, []];
blankSection["real J, L, N still fail on a G point (control)"] = [make("GFCPPC--------", { evaluationRating: "G9", signatureEquipment: "?", hostile: "X" }).isValid(true).modifierErrors.some((e) => /^J:/.test(e)) && true, true];
blankSection["real text next to a blank is still checked"] = [[valid("SFGPUCI--------", { quantity: "5", staffComments: " " }), valid("SFGPUCI--------", { staffComments: "A".repeat(21) + " " })], [false, false]];
blankSection["whitespace plus text counts as text (length includes spaces)"] = [valid("SFGPUCI--------", { staffComments: " ".repeat(10) + "A".repeat(11) }), false];
const textsOf = (sidc, options) => texts(make(sidc, options)).map((t) => t.text);
blankSection["blank X leaves no leading space before Y"] = [textsOf("SFGPUCI--------", { altitudeDepth: "   ", location: "3N 4E" }), ["3N 4E"]];
blankSection["blank Y leaves no trailing space after X"] = [textsOf("SFGPUCI--------", { altitudeDepth: "100", location: "\t" }), ["100"]];
blankSection["blank K does not split J and P"] = [textsOf("SFGPUCI--------", { evaluationRating: "B2", combatEffectiveness: "  ", iffSif: "7" }), ["B2 7"]];
blankSection["blank J K L N leaves P alone"] = [textsOf("SHGPEWAL-------", { evaluationRating: " ", signatureEquipment: " ", hostile: " ", iffSif: "12" }), ["12"]];
blankSection["blank F: E marker is drawn alone, without a trailing space"] = [textsOf("SAGPUCI--------", { reinforcedReduced: "  " }), ["?"]];
blankSection["blank F: joker J alone"] = [textsOf("SJGPUCI--------", { reinforcedReduced: " " }), ["J"]];
blankSection["blank F: pending ? stays inside the frame, once"] = [make("SPGPUCI--------", { reinforcedReduced: " " }).asSVG(), make("SPGPUCI--------").asSVG()];
blankSection["blank quantity C: no top text, no extra height"] = [[textsOf("SFGPEWAL-------", { quantity: "  " }), make("SFGPEWAL-------", { quantity: "  " }).bbox.y1], [[], make("SFGPEWAL-------").bbox.y1]];
blankSection["blank AA: no inner text, no extra width"] = [[textsOf("SFGPUCI--------", { specialHeadquarters: "          " }), make("SFGPUCI--------", { specialHeadquarters: "          " }).bbox.x2], [[], make("SFGPUCI--------").bbox.x2]];
blankSection["blank direction Q draws no arrow"] = [make("SFGPUCI--------", { direction: " " }).asSVG(), make("SFGPUCI--------").asSVG()];
blankSection["non-blank text keeps its spaces"] = [textsOf("SFGPUCI--------", { staffComments: " G1 " }), [" G1 "]];
blankSection["the caller's options object is not modified"] = (() => {
  const given = { quantity: "  ", staffComments: " " };
  make("SFGPEWAL-------", given);
  return [given, { quantity: "  ", staffComments: " " }];
})();

// ----------------------------------------------------------- compatibility
const compat = section("Library exports and G-scheme");
compat["table entries keep their shape"] = [Object.keys(app6aTextFields[0]).indexOf("limits") > -1 && app6aTextFields[0].key === "quantity", true];
compat["G point rules unchanged"] = [getApp6aFields("GFCPPC--------").map((f) => f.field).join(""), "HWY"];
compat["profile id"] = [app6aProfile.id, "app6a"];
compat["validation keeps standard and modifierErrors"] = [Object.keys(make("SFGPUCI--------").isValid(true)).filter((k) => ["standard", "modifierErrors"].indexOf(k) > -1), ["modifierErrors", "standard"]];
compat["APP-6B rendering does not use the APP-6A E/F row"] = [new ms.Symbol("SAGPUCI--------", { standard: "APP6", reinforcedReduced: "(+)" }).asSVG().indexOf("? (+)") < 0, true];
compat["APP-6B symbol has no APP-6A metadata"] = [(({ app6a, validation }) => [app6a, validation])(new ms.Symbol("SAGPUCI--------", { standard: "APP6" }).metadata), [false, undefined]];

export default { "APP-6A S-scheme modifiers": result };
