// Outside APP-6A the fork must draw and validate every point symbol exactly as
// the milsymbol release it is based on (docs/upstream-parity-removals.md).
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { ms2525b, ms2525c, ms2525d } from "mil-std-2525";
import { app6b, app6d } from "stanag-app6";
import { ms2525e } from "milstandard-e";
import upstream from "milsymbol-upstream";
import fork from "../index.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const TEXT = {
  quantity: "200",
  reinforcedReduced: "+",
  staffComments: "STAFF",
  additionalInformation: "ADDINFO",
  evaluationRating: "A1",
  combatEffectiveness: "CE",
  signatureEquipment: "!",
  higherFormation: "HIGHER",
  hostile: "ENY",
  iffSif: "IFF",
  direction: "45",
  sigint: "M",
  uniqueDesignation: "UNIQUE",
  type: "TYPE",
  dtg: "301200ZNOV26",
  altitudeDepth: "100FT",
  location: "LOCATION",
  speed: "10KPH",
  specialHeadquarters: "SHQ",
  country: "USA",
  platformType: "ELNOT",
  equipmentTeardownTime: "5",
  commonIdentifier: "COMMON",
  auxiliaryEquipmentIndicator: "AUX",
  headquartersElement: "TOC",
  installationComposition: "COMP",
  engagementBar: "B:2-1",
  guardedUnit: "BG",
  specialDesignator: "SD"
};
const COUNTRY = { country: "USA" };

// Point symbols of a letter table: [label, sidc, options] for every case.
function letterCases(table) {
  const cases = [];
  for (const group of Object.values(table)) {
    for (const entry of Object.values(group)) {
      if (!entry || !Array.isArray(entry.mainIcon)) continue;
      for (const icon of entry.mainIcon) {
        if (icon.remarks == "N/A") continue;
        const sidc = (affiliation, status = "P", modifier = "--") =>
          (
            icon.codingscheme +
            affiliation +
            icon.battledimension +
            status +
            icon.functionid +
            modifier +
            "---"
          ).slice(0, 15);
        for (const affiliation of "FHNUPASGWDLMJK")
          cases.push(["identity " + affiliation, sidc(affiliation), {}]);
        for (const status of "ACDXF")
          cases.push(["status " + status, sidc("F", status), {}]);
        for (const modifier of ["D-", "-E", "MO"])
          cases.push(["modifier " + modifier, sidc("F", "P", modifier), {}]);
        cases.push(["text", sidc("F"), TEXT]);
        cases.push(["text", sidc("H"), TEXT]);
        cases.push(["country", sidc("F"), COUNTRY]);
      }
    }
  }
  return cases;
}

// Point symbols of a number table, built from version and edition.
function numberCases(table, version) {
  const editionE = Number(version) >= 13;
  const cases = [];
  for (const set of Object.values(table)) {
    if (!set || !Array.isArray(set.mainIcon) || !set.symbolset) continue;
    for (const icon of set.mainIcon) {
      if (
        icon["Geometric Rendering"] &&
        icon["Geometric Rendering"] != "Point"
      )
        continue;
      if (!/^\d{6}$/.test(icon.Code || "")) continue;
      const sidc = ({
        context = "0",
        identity = "3",
        status = "0",
        hq = "0",
        amplifier = "00"
      } = {}) =>
        version +
        context +
        identity +
        set.symbolset +
        status +
        hq +
        amplifier +
        icon.Code +
        "0000";
      for (const code of ["01", "03", "04", "05", "06", "13", "15", "16", "23", "26"])
        cases.push([
          "identity " + code,
          sidc({ context: code[0], identity: code[1] }),
          {}
        ]);
      if (editionE)
        for (const context of "345678")
          cases.push([
            "context " + context,
            sidc({ context, identity: "6" }),
            {}
          ]);
      for (const status of "2345")
        cases.push(["status " + status, sidc({ status }), {}]);
      cases.push(["hq 7", sidc({ hq: "7" }), {}]);
      for (const amplifier of ["15", "31"])
        cases.push(["amplifier " + amplifier, sidc({ amplifier }), {}]);
      cases.push(["text", sidc(), TEXT]);
      cases.push(["text", sidc({ identity: "6" }), TEXT]);
      cases.push(["country", sidc(), COUNTRY]);
    }
  }
  return cases;
}

function snapshot(ms, standard, sidc, options) {
  ms.setStandard(standard);
  const symbol = new ms.Symbol(sidc, { ...options });
  return {
    svg: symbol.asSVG(),
    valid: symbol.isValid(),
    details: JSON.stringify(symbol.isValid(true)),
    anchor: JSON.stringify(symbol.getAnchor()),
    octagon: JSON.stringify(symbol.getOctagonAnchor())
  };
}

function differences(standard, cases) {
  const found = [];
  for (const [label, sidc, options] of cases) {
    const a = snapshot(upstream, standard, sidc, options);
    const b = snapshot(fork, standard, sidc, options);
    const keys = Object.keys(a).filter((key) => a[key] !== b[key]);
    if (keys.length) found.push(`${sidc} [${label}] ${keys.join(",")}`);
  }
  return found;
}

const editions = [
  ["2525B", "2525", () => letterCases(ms2525b)],
  ["2525C", "2525", () => letterCases(ms2525c)],
  ["APP-6B", "APP6", () => letterCases(app6b)],
  ["2525D", "2525", () => numberCases(ms2525d, "10")],
  ["APP-6D", "APP6", () => numberCases(app6d, "10")],
  ["2525E", "2525", () => numberCases(ms2525e, "13")],
  ["APP-6E", "APP6", () => numberCases(ms2525e, "13")]
];

for (const [edition, standard, cases] of editions) {
  test(edition, () => {
    const found = differences(standard, cases());
    assert.deepEqual(
      found.slice(0, 20),
      [],
      `${edition}: ${found.length} cases differ from milsymbol ${upstream.getVersion()}`
    );
  });
}

// Canvas output is a sequence of context calls; record them through a Proxy.
function recorder() {
  const calls = [];
  const state = { globalAlpha: 1 };
  const ctx = new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      return (...args) => calls.push([key, ...args]);
    },
    set(target, key, value) {
      calls.push(["=", key, value]);
      target[key] = value;
      return true;
    }
  });
  return { ctx, calls };
}

test("canvas draw calls match upstream", async () => {
  globalThis.Path2D ||= class Path2D {
    constructor(d) {
      this.d = d;
    }
  };
  const upstreamDir = path.dirname(
    require.resolve("milsymbol-upstream/package.json")
  );
  const upstreamDraw = (
    await import(
      pathToFileURL(upstreamDir + "/src/ms/symbol/canvasdraw.js").href
    )
  ).default;
  const forkDraw = (await import("../src/ms/symbol/canvasdraw.js")).default;
  const draw = (ms, canvasDraw, standard, sidc) => {
    ms.setStandard(standard);
    const symbol = new ms.Symbol(sidc, { fillOpacity: 0.5 });
    const { ctx, calls } = recorder();
    canvasDraw.call(symbol, ctx, symbol.drawInstructions);
    return JSON.stringify(calls);
  };
  const found = [];
  for (const [edition, standard, cases] of editions) {
    const first = cases()
      .filter(([label]) => label === "identity F" || label === "identity 03")
      .slice(0, 50)
      .map(([, sidc]) => sidc);
    const extra = standard === "2525" && edition !== "2525B"
      ? ["SFGPES---------", "10031000001701000000", "10031500001301000000", "10031500002202000000"]
      : [];
    for (const sidc of [...first, ...extra])
      if (
        draw(upstream, upstreamDraw, standard, sidc) !==
        draw(fork, forkDraw, standard, sidc)
      )
        found.push(`${edition} ${sidc}`);
  }
  assert.deepEqual(found.slice(0, 20), [], `${found.length} symbols draw differently`);
});

test("upstream alias matches the fork base", () => {
  const base = require("milsymbol-upstream/package.json").version;
  assert.equal(base, pkg.version.replace(/-v\d+$/, ""));
});
