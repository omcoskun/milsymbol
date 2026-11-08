// Studio regression tests for the modifier review of 340088b (3 November
// 2026): F3 the APP-6D L/N identity restriction in the editor, F4 Now (UTC)
// per class. Only the Studio changed; the library profiles are used as they
// are. Expected values come from the publications the profiles cite.
import { app6dProfile } from "../studio/profiles/app6d.js";
import { std2525cProfile } from "../studio/profiles/std2525c.js";
import { app6aProfile } from "../src/modifierprofiles/app6a.js";
import {
  profileFieldStates,
  formatDtg,
  dtgForField
} from "../studio/editor-helpers.js";
import {
  textModifiers,
  collectTextModifiers
} from "../studio/modifier-fields.js";
import { carryWarnings } from "../studio/profile-controls.js";

const byKey = (states) =>
  Object.fromEntries(states.map((state) => [state.key, state]));

// ------------------------------------------------------------------- F3
// APP-6D L and N are for hostile equipment (Table 3-16 PDF 163/3-83): the
// profile's unavailableReason() and validator allow identities 5 and 6 only.
// The editor follows them: no editing, no option sent to the renderer.
const f3 = {};
const equipment = (identity) => "100" + identity + "1500001101000000";
const typed = { signatureEquipment: "!", hostile: "ENY" };
const sentKeys = (states) =>
  states.filter((state) => state.available).map((state) => state.key);
["0", "1", "2", "3", "4", "5", "6"].forEach((identity) => {
  const sidc = equipment(identity);
  const hostile = identity === "5" || identity === "6";
  const list = profileFieldStates(textModifiers, app6dProfile, sidc);
  const states = byKey(list);
  const sent = collectTextModifiers(typed, sentKeys(list));
  f3[`identity ${identity}: L and N`] = [
    {
      editable: [states.signatureEquipment.available, states.hostile.available],
      reason: [states.signatureEquipment.reason, states.hostile.reason],
      field: [states.signatureEquipment.field, states.hostile.field],
      validator: [
        app6dProfile.validate(sidc, { signatureEquipment: "!" }).valid,
        app6dProfile.validate(sidc, { hostile: "ENY" }).valid
      ],
      sent: [sent.signatureEquipment, sent.hostile]
    },
    {
      editable: [hostile, hostile],
      reason: hostile
        ? ["", ""]
        : ["hostile equipment only", "hostile equipment only"],
      field: ["L", "N"],
      validator: [hostile, hostile],
      sent: hostile ? ["!", "ENY"] : ["", ""]
    }
  ];
});
// Every APP-6D class and identity: a field is editable exactly when the
// profile gives no reason against it (a field's own unresolved note aside).
const disagreements = [];
["00", "01", "02", "05", "10", "15", "20", "30", "35", "36"].forEach((set) =>
  ["0", "1", "2", "3", "4", "5", "6"].forEach((identity) => {
    const sidc = "100" + identity + set + "00000000000000";
    profileFieldStates(textModifiers, app6dProfile, sidc).forEach((state) => {
      const reason = app6dProfile.unavailableReason(state.key, sidc);
      const agrees = state.available
        ? reason === "" || reason === state.unresolved
        : reason !== "";
      if (!agrees) disagreements.push(sidc + " " + state.key);
    });
  })
);
f3["field state and unavailableReason agree"] = [disagreements, []];
f3["an unresolved field stays editable with its note"] = [
  (() => {
    const sidc = "10031000001211000000";
    const unresolved = profileFieldStates(textModifiers, app6dProfile, sidc)
      .filter((state) => state.unresolved && !state.nonBlocking)
      .map((state) => state.available);
    return unresolved.every(Boolean);
  })(),
  true
];
// Hostile -> Friend -> Hostile: the typed text is kept, marked inactive with
// the reason and not sent to the renderer, then used again.
const editorPass = (sidc) => {
  const states = profileFieldStates(textModifiers, app6dProfile, sidc);
  const sent = collectTextModifiers(typed, sentKeys(states));
  return {
    sent: [sent.signatureEquipment, sent.hostile],
    warnings: carryWarnings({ states, values: typed, origins: {} }).map(
      (warning) => warning.kind + " " + warning.key + ": " + warning.message
    )
  };
};
const inactive = (key) =>
  "inactive " +
  key +
  ": hostile equipment only. The text is kept but not drawn.";
f3["hostile, then friend, then hostile again"] = [
  [
    editorPass(equipment("6")),
    editorPass(equipment("3")),
    editorPass(equipment("6"))
  ],
  [
    { sent: ["!", "ENY"], warnings: [] },
    {
      sent: ["", ""],
      warnings: [inactive("signatureEquipment"), inactive("hostile")]
    },
    { sent: ["!", "ENY"], warnings: [] }
  ]
];

// ------------------------------------------------------------------- F4
// The Now value passes the validator of the class it was made for: APP-6D
// Land Unit W1 has a four-digit year (Table 3-2 PDF 87/3-7), equipment and
// installations two (Tables 3-16/3-22); APP-6A and 2525C keep DDHHMMZMONYY.
const f4 = {};
const now = new Date(Date.UTC(2026, 10, 3, 9, 30));
const dtgCases = [
  ["APP-6D land unit", app6dProfile, "10031000001211000000", "030930ZNOV2026"],
  [
    "APP-6D land equipment",
    app6dProfile,
    "10031500001101000000",
    "030930ZNOV26"
  ],
  [
    "APP-6D land installation",
    app6dProfile,
    "10032000001100000000",
    "030930ZNOV26"
  ],
  ["2525C unit", std2525cProfile, "SFGPUCI--------", "030930ZNOV26"],
  ["2525C equipment", std2525cProfile, "SFGPEWM--------", "030930ZNOV26"],
  ["2525C installation", std2525cProfile, "SFGPIB---------", "030930ZNOV26"],
  ["APP-6A unit", app6aProfile, "SFGPUCI--------", "030930ZNOV26"],
  ["APP-6A equipment", app6aProfile, "SFGPEVATM------", "030930ZNOV26"],
  ["APP-6A installation", app6aProfile, "SFGPIB----H----", "030930ZNOV26"]
];
dtgCases.forEach(([label, profile, sidc, expected]) => {
  const field = byKey(profileFieldStates(textModifiers, profile, sidc)).dtg;
  const value = dtgForField(now, field);
  f4[label + ": Now passes the class validator"] = [
    {
      value,
      available: field.available,
      fits: !field.maxLength || value.length <= field.maxLength,
      valid: profile.validate(sidc, { dtg: value }).valid
    },
    {
      value: expected,
      available: true,
      fits: true,
      valid: profile.validate(sidc, {}).valid
    }
  ];
});
// Every APP-6D class that defines W.
const dtgFailures = [];
["01", "02", "05", "10", "15", "20", "30", "35", "36"].forEach((set) => {
  const sidc = "1003" + set + "00000000000000";
  const field = byKey(
    profileFieldStates(textModifiers, app6dProfile, sidc)
  ).dtg;
  if (!field.available) return;
  const value = dtgForField(now, field);
  if (!app6dProfile.validate(sidc, { dtg: value }).valid)
    dtgFailures.push(set + " " + value);
});
f4["every APP-6D class with W accepts its Now value"] = [dtgFailures, []];
f4["two-digit year stays the default format"] = [
  [formatDtg(now), formatDtg(now, { fourDigitYear: true })],
  ["030930ZNOV26", "030930ZNOV2026"]
];

export default {
  "F3 APP-6D L/N follow the identity in the editor": f3,
  "F4 Now (UTC) follows the class DTG format": f4
};
