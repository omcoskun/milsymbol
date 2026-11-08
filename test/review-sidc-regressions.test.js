import { app6eProfile } from "../studio/profiles/app6e.js";
import { std2525eProfile } from "../studio/profiles/std2525e.js";
import { fieldGuide } from "../studio/field-guide.js";
import { identityList, identityLabel, convertIdentity } from "../studio/identities.js";

// The library draws number SIDCs as upstream 3.0.5; the edition profiles that
// the Studio runs decide validity.
const exercises = {};
const studioStandard = { id: "2525e", family: "modern" };
const app6a = { id: "app6a", family: "legacy" };
for (const [version, standard, profile] of [["13", "2525", std2525eProfile], ["16", "APP6", app6eProfile]]) {
  for (const [digit, value] of [["5", "suspect"], ["6", "hostile"]]) {
    for (const context of ["1", "5", "6"]) {
      const sidc = `${version}${context}${digit}1000001211000000`;
      exercises[`${standard} identity ${digit} context ${context}`] = {
        "valid exercise symbol": [profile.validate(sidc, {}).valid, true],
        "Studio labels the resolved exercise identity": [
          identityLabel(identityList(studioStandard).find(entry => entry.value === value), context),
          digit === "5" ? "Joker" : "Faker"
        ],
        "APP-6A conversion retains Joker/Faker": [
          convertIdentity({ value, context }, app6a),
          { value: digit === "5" ? "joker" : "faker", context: "0" }
        ]
      };
    }
  }
}

// APP-6(E) Table 1-5 PDF 87/53: AS is alphanumeric {3,3}; its
// geographical entity code list is outside the publication's scope.
const asField = {};
const warnings = (profile, value) => profile.validate("16031000001211000000", { country: value })
  .details.fieldWarnings.filter(warning => warning.key === "country");
for (const value of ["792", "A1B", "TUR"]) {
  asField[`APP-6E accepts alphanumeric ${value}`] = [warnings(app6eProfile, value), []];
}
for (const value of ["AB", "ABCD", "A!B"]) {
  asField[`APP-6E warns about malformed ${value}`] = [warnings(app6eProfile, value).length > 0, true];
}
asField["MIL-2525E retains its three-letter rule"] = [warnings(std2525eProfile, "792").length > 0, true];
asField["APP-6E help names its own format"] = [
  fieldGuide("app6e", "landUnit", { key: "country", description: "Country text" }).description.includes("alphanumeric"),
  true
];

export default {
  "Review R2 restricted exercise identities": exercises,
  "Review R8 APP-6E geographical entity format": asField
};
