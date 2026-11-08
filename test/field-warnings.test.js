// A text value that breaks an edition's format warns and leaves the symbol valid;
// a wrong code stays an error. The Studio's own examples must not warn.
import { ms, app6a } from "../index.mjs";
import { app6aProfile } from "../src/modifierprofiles/app6a.js";
import { app6bProfile } from "../studio/profiles/app6b.js";
import { app6dProfile } from "../studio/profiles/app6d.js";
import { app6eProfile } from "../studio/profiles/app6e.js";
import { std2525cProfile } from "../studio/profiles/std2525c.js";
import { std2525dProfile } from "../studio/profiles/std2525d.js";
import { std2525eProfile } from "../studio/profiles/std2525e.js";
import { fieldGuide } from "../studio/field-guide.js";
import { textModifiers } from "../studio/modifier-fields.js";

ms.reset();
ms.addIcons(app6a);

// [edition, standard, profile, land unit SIDC, a code wrong for that edition]
const editions = [
  ["app6a", "APP6A", app6aProfile, "SFGPUCI--------", "SFGCUCI--------"],
  ["app6b", "APP6", app6bProfile, "SFGPUCI--------", "SFGCUCI--------"],
  ["2525c", "2525C", std2525cProfile, "SFGPUCI--------", "SFGCUCI--------"],
  [
    "app6d",
    "APP6",
    app6dProfile,
    "10031000001211000000",
    "10031030001211000000"
  ],
  [
    "2525d",
    "2525",
    std2525dProfile,
    "10031000001211000000",
    "10031030001211000000"
  ],
  [
    "2525e",
    "2525",
    std2525eProfile,
    "13031000001211000000",
    "13031080001211000000"
  ],
  [
    "app6e",
    "APP6",
    app6eProfile,
    "16031000001211000000",
    "16031080001211000000"
  ]
];

const bad = { evaluationRating: "G7", uniqueDesignation: "X".repeat(40) };
const result = {};
// APP-6(D) sets no length for T.
const warned = (id) =>
  id === "app6d"
    ? ["evaluationRating"]
    : ["evaluationRating", "uniqueDesignation"];
for (const [id, standard, profile, sidc, wrong] of editions) {
  if (id !== "app6a") {
    // The library draws these editions as upstream; the profile checks them.
    const checked = profile.validate(sidc, { ...bad });
    result[`${id}: broken text leaves the code valid`] = [checked.valid, true];
    result[`${id}: it warns by field`] = [
      checked.details.fieldWarnings.map((item) => item.key).sort(),
      warned(id)
    ];
    result[`${id}: no warning means no error list entry`] = [
      checked.details.modifierErrors,
      []
    ];
    result[`${id}: a wrong code is still invalid`] = [
      profile.validate(wrong, {}).valid,
      false
    ];
    continue;
  }
  const symbol = new ms.Symbol(sidc, { ...bad, standard });
  const details = symbol.isValid(true);
  result[`${id}: broken text leaves the symbol valid`] = [
    symbol.isValid(),
    true
  ];
  result[`${id}: the text is still drawn`] = [
    symbol.asSVG().includes("G7"),
    true
  ];
  result[`${id}: it warns by field`] = [
    details.fieldWarnings.map((item) => item.key).sort(),
    warned(id)
  ];
  result[`${id}: no warning means no error list entry`] = [
    details.modifierErrors,
    []
  ];
  result[`${id}: a wrong code is still invalid`] = [
    new ms.Symbol(wrong, { standard }).isValid(),
    false
  ];
}

// Hostile samples, so hostile-only fields are open too.
const classes = {
  app6a: ["SHGPUCI--------", "SHGPEWM--------", "SHGPIB---H-----"],
  app6b: [
    "SHGPUCI--------",
    "SHGPEWM--------",
    "SHGPIB---H-----",
    "SHSPCLCC-------"
  ],
  "2525c": [
    "SHGPUCI--------",
    "SHGPEWM--------",
    "SHGPIB---H-----",
    "SHSPCLCC-------"
  ]
};
const numeric = (version, sets) =>
  sets.map((set) => `${version}06${set}0000110000000 0`.replace(" ", ""));
const sets = [
  "01",
  "02",
  "05",
  "06",
  "10",
  "11",
  "15",
  "20",
  "27",
  "30",
  "35",
  "36",
  "40",
  "50",
  "60",
  "64"
];
classes.app6d = numeric("10", sets);
classes["2525d"] = numeric("10", sets);
classes["2525e"] = numeric("13", sets);
classes.app6e = numeric("16", sets);

const failing = [];
for (const [id, , profile] of editions) {
  for (const sidc of classes[id]) {
    const fields = profile.fields(sidc) || [];
    for (const definition of fields) {
      const field = textModifiers.find((item) => item.key === definition.key);
      if (!field || definition.parts || definition.supported === false)
        continue;
      // The value the Studio shows as the example, as app.js picks it.
      const listed =
        field.key !== "evaluationRating" &&
        (definition.examples || definition.choices || [])[0];
      const value = listed
        ? String(Array.isArray(listed) ? listed[0] : listed)
        : fieldGuide(id, profile.symbolClass(sidc), field).example;
      if (!value || field.key === "evaluationRating") continue;
      const warnings = profile.validate(sidc, { [field.key]: value }).details
        .fieldWarnings;
      if (warnings.length)
        failing.push(
          `${id} ${profile.symbolClass(sidc)} ${definition.field} "${value}"`
        );
    }
  }
}
result["every example the Studio shows passes its own rule"] = [
  [...new Set(failing)],
  []
];

export default { "Text rules warn, codes stay errors": result };
