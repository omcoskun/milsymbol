import {
  ms,
  app6a,
  app6b,
  std2525b,
  std2525c,
  app6d,
  std2525d,
  std2525e,
  lettersea,
  lettersubsurface,
  letterstd2525bextra,
  letteremergencymanagementsymbols
} from "../index.mjs";
import { getApp6aFields, app6aCodes } from "../src/lettersidc/metadata.js";
import { app6aCatalog } from "../studio/app6a-catalog.js";

ms.reset();
ms.addIcons(app6a);
ms.setStandard("APP6A");

const result = {
  "APP6A has its own bundle": [app6a === app6b, false],
  "APP6A does not register the 2525B extra provider": [
    app6a.includes(letterstd2525bextra),
    false
  ],
  "catalog count": [app6aCatalog.length, 907],
  "unique catalog IDs": [new Set(app6aCatalog.map((row) => row.id)).size, 907],
  "code set matches catalog": [
    JSON.stringify([...app6aCodes]),
    JSON.stringify(app6aCatalog.map((row) => row.id))
  ]
};
function iconParts(symbol) {
  function visit(parts) {
    return parts.flatMap(part => Array.isArray(part)
      ? visit(part)
      : part ? [part, ...visit(part.draw || [])] : []);
  }
  return visit(symbol.drawInstructions).filter(part => part.icon);
}
function iconLabels(symbol) {
  return iconParts(symbol).filter(part => part.type === "text").map(part => part.text);
}

// Independently read from APP-6A Annex D illustrations, PDF pp. 138–145.
// Alternate profiles deliberately use their own, later role abbreviations.
const airRoles = [
  ["MFL---", ["L"], ["V"]],
  ["MFRW--", ["W"], ["AEW"]],
  ["MFRZ--", ["Z"], ["ESM"]],
  ["MFRX--", ["X"], ["R", "P"]],
  ["MFPN--", ["N"], ["ASUW"]],
  ["MFY---", ["Y"], ["COM"]],
  ["MFH---", ["H"], ["PRO"]],
  ["MFD---", ["D"], ["ACP"]],
  ["MFS---", ["S"], ["ASW"]],
  ["MFM---", ["M"], ["SOF"]],
  ["MHS---", ["S"], ["ASW"]],
  ["MHH---", ["H"], ["CSAR"]],
  ["MHM---", ["M"], ["SOF"]],
  ["MHD---", ["D"], ["ACP"]]
];
for (const [code, expected, later] of airRoles) {
  for (const affiliation of ["U", "F", "N", "H"]) {
    for (const status of ["P", "A"]) {
      for (const frame of [true, false]) {
        const sidc = `S${affiliation}A${status}${code}-----`;
        // Interleaved construction also catches cross-edition icon cache leaks.
        for (const [standard, labels] of [["APP6A", expected], ["APP6", later], ["APP6A", expected]]) {
          const symbol = new ms.Symbol(sidc, { standard, frame });
          result[`Annex D labels ${sidc}/${standard}/${frame}`] = [iconLabels(symbol), labels];
        }
      }
    }
  }
}
for (const [sidc, labels] of [
  ["SFGPUCVRUC-----", ["Y"]],
  ["SFGPUCVV-------", ["VSTOL"]],
  ["SFGPUCRV-------", ["CAV"]],
  ["SFGPUCRX-------", ["LRS"]],
  ["SFGPUUACRS-----", ["RS"]],
  ["SFGPUUI--------", ["IW"]],
  ["SFFPSNU--------", ["UDT"]],
  ["SFFPAF---------", ["SOF"]],
  ["SFFPAH---------", ["SOF"]]
]) {
  result[`Annex D ground/SOF label ${sidc}`] = [iconLabels(new ms.Symbol(sidc)), labels];
}
for (const affiliation of ["U", "F", "N", "H"]) {
  const color = { U: "rgb(255,255,128)", F: "rgb(128,224,255)", N: "rgb(170,255,170)", H: "rgb(255,128,128)" }[affiliation];
  const nav = iconParts(new ms.Symbol(`S${affiliation}SPZN---------`));
  result[`navigation affiliation stroke ${affiliation}`] = [nav.some(p => p.type === "path" && p.stroke === color), true];
  const bottom = iconParts(new ms.Symbol(`S${affiliation}UPNB---------`));
  result[`bottom return is not empty ${affiliation}`] = [bottom.some(p => p.type === "path" && p.fill === "black"), true];
  for (const code of ["G-----", "GT----", "GG----", "GU----"]) {
    const parts = iconParts(new ms.Symbol(`S${affiliation}SP${code}-----`));
    result[`navy group filled center ${affiliation}/${code}`] = [parts.some(p => p.type === "path" && p.fill === "black" && p.stroke === false), true];
    result[`navy group label below center ${affiliation}/${code}`] = [parts.filter(p => p.type === "text").every(p => p.y === 140), true];
  }
  for (const code of ["WM----", "WMS---", "WMAA--", "WMU---"]) {
    const parts = iconParts(new ms.Symbol(`S${affiliation}AP${code}-----`));
    result[`missile yellow fill ${affiliation}/${code}`] = [parts.some(p => p.type === "path" && p.fill === "rgb(255,255,128)"), true];
  }
}
for (const affiliation of ["U", "F", "N", "H"]) {
  for (const frame of [true, false]) {
    for (const standard of ["APP6A", "APP6", "2525", "APP6A"]) {
      const symbol = new ms.Symbol(`S${affiliation}APWMU--------`, {
        standard,
        frame
      });
      const labels = iconParts(symbol)
        .filter(part => part.type === "text")
        .map(part => [part.text, part.x, part.y]);
      result[`subsurface missile label ${standard}/${affiliation}/${frame}`] = [
        labels,
        standard === "APP6A"
          ? [["SUS", 100, 100]]
          : [["S", 68, 85], ["U", 68, 115], ["S", 132, 100]]
      ];
    }
  }
}
result["APP6A land-mine triangle points down"] = [
  iconParts(new ms.Symbol("SFGPEXM--------")).some(p => p.d === "m 135,70 -70,0 35,70 z"), true
];
result["later APP6 land-mine triangle unchanged"] = [
  iconParts(new ms.Symbol("SFGPEXM--------", { standard: "APP6" })).some(p => p.d === "m 65,130 70,0 -35,-70 z"), true
];
for (const standard of ["APP6A", "APP6", "2525"]) {
  const legacy = standard === "APP6A";
  const civilian = iconParts(new ms.Symbol("SFGPEVC--------", { standard })).find(p => p.text === "CIV");
  if (legacy) {
    result["Annex D civilian vehicle solid text"] = [civilian.fill === "black" && civilian.stroke === false, true];
  } else if (standard === "APP6") {
    result["later NATO civilian vehicle hollow text retained"] = [civilian.fill, false];
  }
  const artillery = iconParts(new ms.Symbol("SFGPUCF--------", { standard })).find(p => p.type === "circle");
  result[`artillery size ${standard}`] = [artillery.r, legacy ? 10 : 15];
  const mortar = iconParts(new ms.Symbol("SFGPUCFM-------", { standard }));
  result[`mortar circle position ${standard}`] = [mortar.find(p => p.type === "circle").cy, legacy ? 140 : 115];
  result[`mortar solid arrowhead ${standard}`] = [mortar.some(p => p.d === "M100,54 96,64 104,64 Z"), legacy];
  const launcher = iconParts(new ms.Symbol("SFGPEWMS-------", { standard }));
  result[`surface missile launcher open base ${standard}`] = [launcher.some(p => p.d === "m 85,140 30,0"), !legacy];
  const adGun = iconParts(new ms.Symbol("SFGPEWA--------", { standard }));
  result[`air defense gun later arrow ${standard}`] = [adGun.some(p => p.d === "M 85,75 100,60 115,75"), standard === "APP6"];
  const mi = iconParts(new ms.Symbol("SFGPUUMS-------", { standard }));
  if (legacy) {
    result["SIGINT MI below antenna"] = [mi.find(p => p.text === "MI").y, 132];
    result["SIGINT no radio circle"] = [mi.some(p => p.d && p.d.includes("5.9")), false];
  }
  for (const code of ["UUMRX-", "UUMMO-", "UUMO--", "UUMT--"]) {
    const texts = iconParts(new ms.Symbol(`SFGP${code}-----`, { standard })).filter(p => p.type === "text");
    result[`MI stack position ${standard}/${code}`] = [texts.find(p => p.text === "MI").y, legacy ? 132 : 103];
  }
}
for (const row of app6aCatalog) {
  for (const affiliation of row.affiliation ? [row.affiliation] : ["F", "H", "N", "U"]) {
    for (const status of row.status ? [row.status] : ["P", "A"]) {
      const sidc =
        row.id[0] +
        affiliation +
        row.id[2] +
        status +
        row.id.slice(4) +
        row.modifier.replace(/\*/g, "-") +
        "---";
      const symbol = new ms.Symbol(sidc);
      const svg = symbol.asSVG();
      const size = symbol.getSize();
      result[sidc] = [
        symbol.isValid() &&
          !/NaN|undefined|null/.test(svg) &&
          size.width > 0 &&
          size.height > 0,
        true
      ];
    }
  }
}
for (const modifier of [
  "--",
  "AD",
  "BD",
  "CD",
  "DD",
  "ED",
  "FD",
  "GD",
  "-M",
  "MO",
  "MP",
  "MQ",
  "MR",
  "MS",
  "MT",
  "MU",
  "MV",
  "MW",
  "MX",
  "MY"
]) {
  result[`modifier ${modifier}`] = [
    new ms.Symbol(`SFGP${modifier[0] === "M" ? "E-----" : "UCI---"}${modifier}---`).isValid(),
    true
  ];
}
ms.addIcons(std2525e);
for (const sidc of [
  "SFGCUCI--------",
  "SFGPUCI----N---",
  "SFGPUCI---NS---",
  "GFCPOXRD-------",
  "SFGPI----------",
  "SFGPUCI--------EXTRA",
  "130310000012110000000000000000",
  "SFGPUCVUTP-----"
]) {
  result[`reject ${sidc}`] = [new ms.Symbol(sidc).isValid(), false];
}
for (const affiliation of ["U", "F", "N", "H"]) {
  const expected = { U: "rgb(255,255,128)", F: "rgb(128,224,255)", N: "rgb(170,255,170)", H: "rgb(255,128,128)" }[affiliation];
  for (const frame of [true, false]) {
    const symbol = new ms.Symbol(`S${affiliation}SPXMC--------`, { frame });
    const parts = symbol.drawInstructions.flat(Infinity);
    result[`cargo fill ${affiliation}/${frame}`] = [parts.some(p=>p.icon && p.fill === (frame ? "white" : expected)), true];
    result[`cargo label ${affiliation}/${frame}`] = [parts.some(p=>p.icon && p.text === "CA"), true];
  }
}
const cargoParts = iconParts(new ms.Symbol("SFSPXMC--------", { frame: false }));
result["APP6A merchant hull follows the shallower Annex D silhouette"] = [
  cargoParts.some(part => part.type === "path" && part.d === "m 80,94 0,-25 40,0 0,25 25,0 -15,36 -60,0 -15,-36 z"),
  true
];
result["APP6A merchant label sits within the hull"] = [
  cargoParts.filter(part => part.type === "text" && part.text === "CA").map(part => [part.y, part.fontsize]),
  [[107, 24]]
];
// In unframed symbols colour is the sole indicator of affiliation (APP-6A
// para. 2 and Table V); Annex D draws the icons in these identity colours.
const identityColour = {
  U: "rgb(255, 255, 0)",
  F: "rgb(0, 255, 255)",
  N: "rgb(0, 255, 0)",
  H: "rgb(255, 0, 0)"
};
for (const [affiliation, outline] of Object.entries(identityColour)) {
  for (const frame of [true, false]) {
    for (const functionId of ["EVUL--", "EVUS--"]) {
      const parts = iconParts(new ms.Symbol(`S${affiliation}GP${functionId}-----`, { frame }));
      result[`APP6A ${functionId} equipment outline ${affiliation}/${frame}`] = [
        parts.filter(part => part.type === "path" || part.type === "circle").every(part => part.stroke === (frame ? "black" : outline) && part.strokewidth === 1.5),
        true
      ];
    }
  }
}
function iconColours(symbol) {
  const colours = iconParts(symbol)
    .filter(part => part.icon)
    .flatMap(part => [part.stroke, part.fill])
    .filter(colour => colour && colour !== "none");
  return [...new Set(colours)].sort();
}
for (const [affiliation, colour] of Object.entries(identityColour)) {
  const light = { U: "rgb(255,255,128)", F: "rgb(128,224,255)", N: "rgb(170,255,170)", H: "rgb(255,128,128)" }[affiliation];
  for (const code of ["EWAL--", "EVATH-", "ES----", "EXMC--", "EVUB--"]) {
    const sidc = `S${affiliation}GP${code}-----`;
    result[`APP6A unframed ${code} icon in identity colour ${affiliation}`] = [
      iconColours(new ms.Symbol(sidc, { frame: false })),
      [colour]
    ];
    result[`APP6A framed ${code} icon stays black ${affiliation}`] = [
      iconColours(new ms.Symbol(sidc, { frame: true })),
      ["black"]
    ];
  }
  result[`APP6A unframed sea combatant in identity colour ${affiliation}`] = [
    iconColours(new ms.Symbol(`S${affiliation}SPCLCC-----`, { frame: false })),
    [colour]
  ];
  // Annex D fills these shapes with the identity colour and keeps black lines.
  for (const sidc of [`S${affiliation}SPXMC-----`, `S${affiliation}UPWDM-----`]) {
    result[`APP6A unframed ${sidc} keeps black lines`] = [
      iconColours(new ms.Symbol(sidc, { frame: false })),
      ["black", light].sort()
    ];
  }
  // Annex D draws bottom returns, wrecks, marine life and anomalies black.
  for (const code of ["NB----", "NBR---", "NBW---", "NM----", "NA----"]) {
    result[`APP6A unframed ${code} stays black ${affiliation}`] = [
      iconColours(new ms.Symbol(`S${affiliation}UP${code}-----`, { frame: false })),
      ["black"]
    ];
  }
  for (const standard of ["APP6", "2525"]) {
    result[`${standard} unframed equipment icon stays black ${affiliation}`] = [
      iconColours(new ms.Symbol(`S${affiliation}GPEWAL-----`, { standard, frame: false })),
      ["black"]
    ];
  }
}
result["APP6A tactical graphic stays black"] = [
  iconColours(new ms.Symbol("GFTPGD---------")),
  ["black"]
];
result["APP6A unframed icon follows monoColor"] = [
  iconColours(new ms.Symbol("SFGPEVUL-------", { frame: false, monoColor: "rgb(10,20,30)" })),
  ["rgb(10,20,30)"]
];
result["APP6A unframed icon honours a custom iconColor"] = [
  iconColours(new ms.Symbol("SFGPEWAL-------", {
    frame: false,
    iconColor: new ms.ColorMode("black", "rgb(1,2,3)", "black", "black", "black", "black")
  })),
  ["rgb(1,2,3)"]
];
const civilianPatrol = new ms.Symbol("SFSPXL---------").asSVG();
const civilianAirText = new ms.Symbol("SFAPC----------").drawInstructions.flat(Infinity).find(p=>p && p.icon && p.text === "CIV");
result["APP6A CIV uses solid lettering"] = [civilianAirText.fill, "black"];
result["APP6A CIV has no hollow outline"] = [civilianAirText.stroke, false];
ms.addIcons(letteremergencymanagementsymbols);
result["EMS cannot replace APP6A coast guard icon"] = [new ms.Symbol("SFSPXL---------").asSVG(), civilianPatrol];
for (const [sidc, options, valid] of [
  ["SFGPUCI--------", {higherFormation:"1 DIV", reinforcedReduced:"(+)"}, true],
  ["SFGPUCI--------", {quantity:"3"}, false],
  ["SFSPXMC--------", {higherFormation:"1 DIV"}, false],
  ["SHGPE----------", {signatureEquipment:"!",hostile:"ENY"}, true],
  ["SFGPE----------", {signatureEquipment:"!"}, false],
  ["SFGPUCI--------", {evaluationRating:"F6"}, true],
  ["SFGPUCI--------", {evaluationRating:"G7"}, false],
  ["SFGPUCI--------", {staffComments:"123456789012345678901"}, false],
  ["SFGPUCI--------", {platformType:"modern"}, false],
  ["GFCPCP--------", {higherFormation:"1 DIV"}, false],
  ["GFCPCP--------", {direction:90}, false],
  ["SFGPUCI---MO---", {}, false],
  ["SFSPXMC---ED---", {}, false],
  ["GHCPBWE--------", {quantity:"100",type:"BOMB"}, true],
  ["GFCPBWE--------", {}, false],
  ["SFSPXMC--------", {uniqueDesignation:"A".repeat(22)}, false]
]) result[`Table III ${sidc} ${JSON.stringify(options)}`] = [new ms.Symbol(sidc,options).isValid() && !new ms.Symbol(sidc,options).isValid(true).fieldWarnings.length, valid];
result["nuclear B field"] = [getApp6aFields("GHCPBWE--------").find(f=>f.key === "quantity").field, "B"];
result["ordinary point only H W Y"] = [getApp6aFields("GFCPPC--------").map(f=>f.field).join(""), "HWY"];
result["short core accepted"] = [new ms.Symbol("SFGPUCI---").isValid(), true];
result["installation flag"] = [
  new ms.Symbol("SFGPI-----H----").metadata.installation,
  true
];
result["feint installation flag"] = [
  new ms.Symbol("SFGPI-----HB---").metadata.feintDummy,
  true
];
result["extended profile failure"] = [
  new ms.Symbol("GFCPOXRD-------").isValid(true).standard,
  false
];
// Status C is outside APP-6A and outside APP-6(B) Table B-I; P is valid in APP-6(B).
result["explicit APP6 override"] = [
  new ms.Symbol("SFGPUCI--------", { standard: "APP6" }).metadata.app6a,
  false
];
result["explicit 2525 override"] = [
  new ms.Symbol("SFGCUCI--------", { standard: "2525" }).metadata.STD2525,
  true
];
ms.setStandard("2525");
result["global profile cleared"] = [
  new ms.Symbol("SFGCUCI--------").isValid(),
  true
];
result["explicit APP6A override"] = [
  new ms.Symbol("SFGCUCI--------", { standard: "APP6A" }).isValid(),
  false
];
result["NATO style override"] = [
  new ms.Symbol("SFGPUCI--------", { standard: "APP6A" }).metadata.STD2525,
  false
];
ms.setStandard("APP6");
result["APP6 clears edition"] = [
  new ms.Symbol("SFGPUCI--------").metadata.app6a,
  false
];
ms.setStandard("APP6A");
ms.reset();
result["reset clears edition"] = [ms._standardEdition, ""];
ms.addIcons(lettersea);
ms.setStandard("APP6A");
result["APP6A uses normally registered sea module"] = [new ms.Symbol("SFSPXMC--------").isValid(), true];
result["APP6A does not secretly load unregistered air modules"] = [new ms.Symbol("SFAPMF---------").isValid(), false];
for (const code of ["S-----", "SP----", "SA----", "NN----", "NNR---"]) {
  result[`sea module alone supplies APP6A station ${code}`] = [
    new ms.Symbol(`SFSP${code}-----`).isValid(),
    true
  ];
}
ms.reset();
ms.addIcons(lettersubsurface);
ms.setStandard("APP6A");
for (const code of ["SS----", "SSA---"]) {
  result[`subsurface module alone supplies APP6A station ${code}`] = [
    new ms.Symbol(`SFUP${code}-----`).isValid(),
    true
  ];
}
const updated = new ms.Symbol("SFUPSS---------");
updated.setOptions({ higherFormation: "1 DIV" });
result["setOptions recomputes modifier validation"] = [updated.isValid(), false];
updated.setOptions({ higherFormation: "" });
result["clearing a modifier restores validity"] = [updated.isValid(), true];
updated.setOptions({ standard: "APP6" });
result["changing edition removes APP6A validation"] = [
  updated.metadata.validation,
  undefined
];

// Capture both the public validation contract and SVG output. Registering any
// other standard, in either order, must not alter the independent APP-6A bundle.
function captureApp6a(bundles) {
  ms.reset();
  for (const bundle of bundles) ms.addIcons(bundle);
  const snapshots = [];
  for (const row of app6aCatalog) {
    for (const affiliation of ["U", "F", "N", "H"]) {
      for (const status of ["P", "A"]) {
        for (const frame of [true, false]) {
          const sidc =
            row.id[0] +
            affiliation +
            row.id[2] +
            status +
            row.id.slice(4) +
            row.modifier.replace(/\*/g, "-") +
            "---";
          const symbol = new ms.Symbol(sidc, { standard: "APP6A", frame });
          snapshots.push(
            JSON.stringify([
              symbol.asSVG(),
              symbol.isValid(),
              symbol.isValid(true)
            ])
          );
        }
      }
    }
  }
  return snapshots;
}
const standalone = captureApp6a([app6a]);
result["independent bundle comparison cases"] = [standalone.length, 14512];
const bundles = [app6a, app6b, std2525b, std2525c, app6d, std2525d, std2525e];
for (const [order, registered] of [
  ["normal", bundles],
  ["reverse", [...bundles].reverse()]
]) {
  const mixed = captureApp6a(registered);
  result[`APP6A unchanged by ${order} mixed registration`] = [
    mixed.filter((value, index) => value !== standalone[index]).length,
    0
  ];
}
ms.reset();
ms.addIcons(std2525e);
result["numeric APP6A fails without a letter provider"] = [
  new ms.Symbol("130310000012110000000000000000", {
    standard: "APP6A"
  }).isValid(),
  false
];
result["numeric provider does not attach letter validation"] = [
  new ms.Symbol("130310000012110000000000000000", { standard: "2525" }).metadata
    .validation,
  undefined
];
ms.reset();

export default { "APP-6A point profile": result };
