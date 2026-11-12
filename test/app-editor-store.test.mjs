// The React editor's store (app/src/editor/store.js) without a browser: the
// catalog is built the way the app gets it (scripts/build-studio.mjs --data).
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ms from "../index.js";
import { createEditorStore } from "../app/src/editor/store.js";
import { createDraftStore } from "../studio/draft-store.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let catalog;
let flags;

before(() => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "editor-store-"));
  execFileSync(process.execPath, [path.join(root, "scripts", "build-studio.mjs"), "--data", directory], { stdio: "ignore" });
  catalog = JSON.parse(fs.readFileSync(path.join(directory, "catalog.json"), "utf8"));
  flags = JSON.parse(fs.readFileSync(path.join(directory, "flags.json"), "utf8"));
  fs.rmSync(directory, { recursive: true, force: true });
});

function memoryStorage(entries = []) {
  const values = new Map(entries);
  return {
    values,
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}

const editor = (storage = memoryStorage()) => createEditorStore({ ms, catalog, storage });
const sidcBox = (store) => store.getSnapshot().controls.sidcInput;

test("starts on APP-6A infantry with a valid code", () => {
  const store = editor();
  const { view, state } = store.getSnapshot();
  assert.equal(state.standardId, "app6a");
  assert.equal(view.selectedName, "INFANTRY");
  assert.equal(sidcBox(store), "SFGPUCI---*****");
  assert.equal(view.renderState.text, "Rendered");
});

test("a 2525E code with raw values becomes a 15-character APP-6A code", () => {
  const store = editor();
  store.setStandard("2525e");
  store.setSidcInput("130399999999999999990000000000");
  store.applySidc();
  let snapshot = store.getSnapshot();
  assert.equal(snapshot.state.customSidc, "130399999999999999990000000000");
  assert.equal(snapshot.state.status, "code:9");
  assert.equal(snapshot.state.amplifierValue, "code:99");
  assert.equal(snapshot.view.sidcStatus.kind, "error");

  store.setStandard("app6a");
  snapshot = store.getSnapshot();
  // A numeric status or echelon must not reach a letter SIDC ("99" where one letter goes).
  assert.equal(snapshot.controls.sidcInput.length, 15);
  assert.equal(store.sidc().length, 15);
  assert.equal(snapshot.state.status, "present");
  assert.equal(snapshot.state.amplifierValue, "");
  assert.equal(store.valid(), true);
  assert.equal(snapshot.view.renderState.text, "Rendered");
});

test("Apply reads, completes and rejects SIDCs", () => {
  const store = editor();
  store.setSidcInput("SHGPUCA");
  store.applySidc();
  let snapshot = store.getSnapshot();
  assert.equal(snapshot.state.customSidc, "SHGPUCA---*****".replace(/\*/g, "-"));
  assert.equal(snapshot.state.affiliation, "hostile");
  assert.equal(snapshot.state.sidcDirty, false);
  assert.match(snapshot.view.sidcStatus.text, /^Applied · ARMOUR|^Applied · ARMOR/);
  assert.match(snapshot.view.sidcStatus.text, /Completed as SHGPUCA---\*\*\*\*\*/);

  // A numeric code in a letter-based standard is refused and the symbol stays.
  store.setSidcInput("10031000001211000000");
  store.applySidc();
  snapshot = store.getSnapshot();
  assert.equal(snapshot.view.sidcStatus.kind, "error");
  assert.match(snapshot.view.sidcStatus.text, /numeric SIDC/);
  assert.equal(snapshot.state.customSidc, "SHGPUCA--------");

  // APP-6A takes S-scheme codes only.
  store.setSidcInput("GFGPGPP");
  store.applySidc();
  assert.match(store.getSnapshot().view.sidcStatus.text, /S-scheme/);

  // Esc returns to the current code.
  assert.equal(store.cancelSidcInput(), true);
  assert.equal(sidcBox(store), "SHGPUCA---*****");
});

test("a numeric code switches between the editions it names", () => {
  const store = editor();
  store.setStandard("2525d");
  store.setSidcInput("1303100016121100");
  store.applySidc();
  const snapshot = store.getSnapshot();
  assert.equal(snapshot.state.standardId, "2525e");
  assert.match(snapshot.view.sidcStatus.text, /Standard switched to MIL‑2525E\./);
  assert.equal(snapshot.state.amplifierValue, "battalion");
});

test("changing the standard keeps the identity and picks the edition's infantry", () => {
  const store = editor();
  store.chooseIdentity("hostile");
  store.setStandard("2525d");
  let snapshot = store.getSnapshot();
  assert.equal(snapshot.state.affiliation, "hostile");
  assert.equal(store.sidc().length, 30);
  assert.equal(store.sidc().slice(0, 6), "100610");
  assert.match(snapshot.view.selectedName, /infantry/i);

  store.chooseStatus("damaged");
  store.setStandard("app6a");
  snapshot = store.getSnapshot();
  // APP-6A has Present and Planned only.
  assert.equal(snapshot.state.status, "present");
  assert.equal(snapshot.lists.status.length, 2);
  assert.equal(store.sidc()[1], "H");
});

test("the palette ranks a name before the names that contain it", () => {
  const store = editor();
  store.openSearch();
  store.setSearch("tank");
  const palette = store.getSnapshot().palette;
  assert.equal(palette.flat[0].name, "TANK");
  store.chooseFirst();
  const snapshot = store.getSnapshot();
  assert.equal(snapshot.view.selectedName, "TANK");
  assert.equal(snapshot.state.searchOpen, false);
  assert.equal(snapshot.palette, null);
});

test("drafts keep the format and keys of the vanilla editor", () => {
  const storage = memoryStorage();
  const store = editor(storage);
  store.setStandard("app6b");
  store.chooseIdentity("neutral");
  store.setFlag("hq", true);
  store.setTextField("uniqueDesignation", "1/23 INF");
  store.setControl("symbolSize", "140");
  store.flushDraft();

  const saved = JSON.parse(storage.getItem("symbol-studio:draft"));
  assert.equal(saved.version, 1);
  assert.equal(saved.draft.state.standardId, "app6b");
  assert.equal(saved.draft.controls.uniqueDesignation, "1/23 INF");
  assert.equal(saved.draft.controls.hq, true);
  assert.equal(saved.draft.controls.symbolSize, "140");
  // draft-store.js validDraft() accepts it.
  assert.ok(createDraftStore(storage).load());
  assert.ok([...storage.values.keys()].every((key) => key.startsWith("symbol-studio:")));

  const restored = editor(storage);
  const snapshot = restored.getSnapshot();
  assert.equal(snapshot.state.standardId, "app6b");
  assert.equal(snapshot.state.affiliation, "neutral");
  assert.equal(snapshot.controls.hq, true);
  assert.equal(snapshot.controls.uniqueDesignation, "1/23 INF");
  assert.equal(snapshot.controls.symbolSize, "140");
  assert.equal(restored.sidc(), store.sidc());
  assert.equal(snapshot.ui.toast.message, "Draft restored from this device");
  assert.equal(snapshot.ui.draftStatus, "Saved on this device");
});

test("a restored draft is cleaned up as the vanilla inputs would", () => {
  const storage = memoryStorage();
  const store = editor(storage);
  store.setTextField("uniqueDesignation", "1/23 INF");
  store.flushDraft();
  const saved = JSON.parse(storage.getItem("symbol-studio:draft"));
  Object.assign(saved.draft.controls, {
    symbolSize: "999",
    strokeWidth: "4.3",
    fillOpacity: "abc",
    direction: "-40",
    speedLeader: "12px",
    fillColor: "#ABC",
    uniqueDesignation: "1/23\nINF"
  });
  storage.setItem("symbol-studio:draft", JSON.stringify(saved));
  const { controls } = editor(storage).getSnapshot();
  // What Chrome makes of the same values in studio/index.html's inputs.
  assert.equal(controls.symbolSize, "170");
  assert.equal(controls.strokeWidth, "4.5");
  assert.equal(controls.fillOpacity, "55");
  assert.equal(controls.direction, "-1");
  assert.equal(controls.speedLeader, "");
  assert.equal(controls.fillColor, "#aabbcc");
  assert.equal(controls.uniqueDesignation, "1/23INF");
});

test("a draft the vanilla editor would refuse is ignored", () => {
  const storage = memoryStorage([["symbol-studio:draft", JSON.stringify({ version: 1, draft: { state: { standardId: "app6x" }, controls: {} } })]]);
  const snapshot = editor(storage).getSnapshot();
  assert.equal(snapshot.state.standardId, "app6a");
  assert.equal(snapshot.ui.toast.message, "");
});

test("Reset clears the modifiers and Undo reset brings them back", () => {
  const store = editor();
  store.chooseIdentity("hostile");
  store.setFlag("hq", true);
  store.setTextField("uniqueDesignation", "ALPHA");
  store.setStyleValue("fillColor", "#ff0000");
  const before = store.sidc();

  store.reset();
  let snapshot = store.getSnapshot();
  assert.equal(snapshot.state.affiliation, "friend");
  assert.equal(snapshot.controls.hq, false);
  assert.equal(snapshot.controls.uniqueDesignation, "");
  assert.equal(snapshot.controls.fillColorOn, false);
  assert.equal(snapshot.view.undoReset, true);
  assert.equal(snapshot.ui.toast.message, "Modifiers reset");

  store.undoReset();
  snapshot = store.getSnapshot();
  assert.equal(store.sidc(), before);
  assert.equal(snapshot.controls.uniqueDesignation, "ALPHA");
  assert.equal(snapshot.controls.fillColorOn, true);
  assert.equal(snapshot.view.undoReset, false);
  assert.equal(snapshot.ui.toast.message, "Reset undone");

  // Any edit after a reset ends the undo.
  store.reset();
  store.setTextField("uniqueDesignation", "BRAVO");
  assert.equal(store.getSnapshot().view.undoReset, false);
  store.undoReset();
  assert.equal(store.getSnapshot().controls.uniqueDesignation, "BRAVO");
});

test("text fields follow the edition profile", () => {
  const store = editor();
  const { view, disabled } = store.getSnapshot();
  // APP-6A Table III: T is limited to 21 characters on a unit.
  assert.equal(view.textFields.uniqueDesignation.available, true);
  assert.equal(view.textFields.uniqueDesignation.maxLength, 21);
  assert.match(view.textSummary, /^APP‑6A · \d+ applicable fields$/);
  assert.equal(disabled.stack, true);

  store.setTextField("uniqueDesignation", "1/23 INF");
  store.setFieldQuery("unique");
  assert.match(store.getSnapshot().view.listFilters.status, /^Showing 1 of/);
  store.openField("higherFormation");
  const snapshot = store.getSnapshot();
  assert.equal(snapshot.state.fieldQuery, "");
  assert.equal(snapshot.ui.tab, "text");
  assert.equal(snapshot.state.positions, false);
  assert.equal(snapshot.view.listHelp.code, "M");
});

test("a country flag goes into the SIDC once the flags have loaded", () => {
  const store = editor();
  store.setStandard("2525c");
  store.setCountryFlag("us");
  // Before the flags load the select has no country to choose.
  assert.equal(store.getSnapshot().controls.countryFlag, "");
  store.loadFlags(flags);
  store.setCountryFlag("us");
  assert.equal(store.sidc().slice(12, 14), "US");
  assert.equal(store.getSnapshot().view.pickers.country.value, "us");
});

test("headquarters, task force and feint share position 11 with a letter SIDC's mobility", () => {
  for (const standard of ["2525c", "app6b"]) {
    const store = editor();
    store.setStandard(standard);
    store.setSidcInput("SFAPMFP--------");
    store.applySidc();
    store.setAmplifierMode("mobility");
    // No mobility chosen: position 11 is free and takes the flag.
    store.setFlag("hq", true);
    store.setFlag("taskForce", true);
    assert.equal(store.sidc().slice(10, 12), "B-", standard);
    // A mobility code fills positions 11–12: the flags stay checked but are off, and say why.
    const choice = store.getSnapshot().view.pickers.amplifier.choices.find((item) => item.value && !item.disabled && !item.reason);
    store.setAmplifierValue(choice.value);
    let snapshot = store.getSnapshot();
    assert.match(store.sidc().slice(10, 12), /^[MN][A-Z]$/, standard);
    assert.deepEqual([snapshot.disabled.hq, snapshot.disabled.taskForce, snapshot.disabled.feintDummy], [true, true, true], standard);
    assert.equal(snapshot.controls.hq, true, standard);
    assert.match(snapshot.view.designationReason, /mobility code uses positions 11–12/, standard);
    // Back to Unspecified: the checked flags return to the code.
    store.setAmplifierValue("");
    snapshot = store.getSnapshot();
    assert.equal(snapshot.disabled.hq, false, standard);
    assert.equal(store.sidc().slice(10, 12), "B-", standard);
  }
});

test("a condition bar does not hide the headquarters staff in its switch picture", () => {
  // Where the staff ends, and where the drawing under the frame (the bar) ends.
  const staffEnd = (svg) => Number(/d="M[\d.-]+,[\d.-]+ L[\d.-]+,([\d.-]+)"[^>]*milsymbol-headquarters/.exec(svg)[1]);
  const barBottom = (svg) => {
    const bar = /d="M[\d.-]+,([\d.-]+) l[\d.-]+,0 0,25 /.exec(svg);
    return bar ? Number(bar[1]) + 25 : null;
  };
  const cases = [
    ["2525c", "SFACMFP--------"],
    ["2525c", "SFGCUCI--------"],
    ["2525c", "SHGXUCI--------"],
    ["app6b", "SFGDUCI--------"],
    ["2525d", "10031020001211000000"],
    ["app6d", "10061050001211000000"]
  ];
  for (const [standard, sidc] of cases) {
    const store = editor();
    store.setStandard(standard);
    store.setSidcInput(sidc);
    store.applySidc();
    const glyph = store.getSnapshot().view.designationGlyphs.hq;
    const bottom = barBottom(glyph);
    assert.notEqual(bottom, null, `${standard} ${sidc} draws a condition bar`);
    // The same short staff as on a frame without a bar: 40 units past what hangs under it.
    assert.equal(staffEnd(glyph) - bottom, 40, `${standard} ${sidc}`);
  }
  // Without a bar the staff keeps its 40 units below the frame.
  const store = editor();
  store.setStandard("2525c");
  store.setSidcInput("SFAPMFP--------");
  store.applySidc();
  const glyph = store.getSnapshot().view.designationGlyphs.hq;
  assert.equal(barBottom(glyph), null);
  assert.equal(staffEnd(glyph), 190);
});
