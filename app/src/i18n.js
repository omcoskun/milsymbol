// Fixed texts of the components, from lang.json. The editor's own messages
// (notes, problems, field help) come from the store and stay in English.
import { createContext, useContext } from "react";

export const LangContext = createContext({});

const lookup = (lang, key) => key.split(".").reduce((value, part) => (value == null ? value : value[part]), lang);

// text("palette.title"), text("info.about", { title: "Status" }).
export function useText() {
  const lang = useContext(LangContext);
  return (key, values) => {
    const found = lookup(lang, key);
    if (typeof found !== "string") return found ?? key;
    return values ? found.replace(/\{(\w+)\}/g, (whole, name) => (name in values ? String(values[name]) : whole)) : found;
  };
}
