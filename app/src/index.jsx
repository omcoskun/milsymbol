// Loads config.json, lang.json and the catalog, then starts the editor. Flags
// load afterwards, as in studio/app.js: the editor draws without them.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import ms from "../../index.js";
import { createEditorStore } from "./editor/store.js";
import { ConfigContext, StoreContext } from "./hooks.js";
import { LangContext } from "./i18n.js";
import { theme } from "./theme.js";
import { iwc } from "./env.js";
import App from "./App.jsx";

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: request failed with ${response.status}`);
  return response.json();
}

function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const root = createRoot(document.getElementById("root"));
const render = (children) =>
  root.render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StrictMode>
  );

async function start() {
  document.documentElement.dataset.iwc = iwc;
  let lang = {};
  try {
    const base = await fetchJson("config.json");
    const config = { ...base, ...(base.byIwc?.[iwc] || {}), iwc };
    lang = await fetchJson(config.langUrl || "lang.json");
    const catalog = await fetchJson(config.catalogUrl);
    const store = createEditorStore({ ms, catalog, storage: browserStorage() });
    render(
      <ConfigContext.Provider value={config}>
        <LangContext.Provider value={lang}>
          <StoreContext.Provider value={store}>
            <App />
          </StoreContext.Provider>
        </LangContext.Provider>
      </ConfigContext.Provider>
    );
    fetchJson(config.flagsUrl).then(
      (flags) => store.loadFlags(flags),
      (error) => {
        store.flagsFailed();
        console.error("Unable to load flag artwork", error);
      }
    );
  } catch (error) {
    render(
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {lang.app?.loadFailed || "Unable to load the symbol library."} {error.message}{" "}
          {lang.app?.loadFailedHint || "Run npm run data in app/ to write the catalog."}
        </Alert>
      </Box>
    );
  }
}

start();
