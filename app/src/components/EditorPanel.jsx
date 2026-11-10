// The editor card (studio/index.html, .editor-panel): draft status, Reset, the
// three tabs. Every tab stays mounted, as the vanilla panels do.
import { useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import SymbolTab from "./SymbolTab.jsx";
import AmplifiersTab from "./AmplifiersTab.jsx";
import DisplayTab from "./DisplayTab.jsx";
import { useEditor, useSignal, useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { media, tokens } from "../theme.js";

const panels = [
  ["symbol", "editor.tabSymbol", SymbolTab],
  ["text", "editor.tabText", AmplifiersTab],
  ["style", "editor.tabStyle", DisplayTab]
];

export default function EditorPanel() {
  const store = useStore();
  const text = useText();
  const { ui, view } = useEditor();
  const panel = useRef(null);
  const scroll = useRef(null);
  const reset = useRef(null);

  // A section switch returns the form to its top.
  useSignal("tabTop", () => {
    if (panel.current.getBoundingClientRect().top < 0) panel.current.scrollIntoView({ block: "start" });
  });
  useSignal("editorTop", () => {
    scroll.current.scrollTop = 0;
  });
  useSignal("focusReset", () => reset.current?.focus());

  const quiet = { minHeight: 28, py: 0.4, px: 1, color: tokens.blueDark, fontSize: 12 };
  return (
    <Paper ref={panel} variant="outlined" component="section" aria-label={text("editor.aria")} sx={{ order: { xs: 2, md: 0 }, minWidth: 0, borderRadius: 3, scrollMarginTop: 74 }}>
      <Box
        sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", columnGap: 1.5, rowGap: 0.75, minHeight: 38, px: { xs: 1.5, sm: 2.5 }, py: 0.75, borderBottom: `1px solid ${tokens.lineSoft}`, color: "text.secondary", fontSize: 12 }}
      >
        <span role="status">{ui.draftStatus}</span>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {view.undoReset ? (
            <Button size="small" variant="outlined" onClick={() => store.undoReset()} sx={{ ...quiet, borderColor: tokens.lineStrong }}>
              {text("editor.undoReset")}
            </Button>
          ) : null}
          <Button ref={reset} size="small" variant="outlined" aria-label={text("editor.resetAria")} onClick={() => store.reset()} sx={{ ...quiet, borderColor: tokens.lineStrong }}>
            {text("editor.reset")}
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, whiteSpace: "pre" }}>
              {text("editor.resetWord")}
            </Box>
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          minHeight: 50,
          px: { xs: 1, sm: 2 },
          borderBottom: 1,
          borderColor: "divider",
          [media.shortDesktop]: { minHeight: 44, "& .MuiTabs-root, & .MuiTab-root": { minHeight: "44px !important" } }
        }}
      >
        <Tabs
          value={ui.tab}
          onChange={(event, value) => store.setTab(value)}
          aria-label={text("editor.tabsAria")}
          variant="scrollable"
          scrollButtons={false}
          sx={{ minHeight: 50, "& .MuiTab-root": { minHeight: 50, px: { xs: "9px", sm: 1.5 }, fontSize: 15, color: "text.secondary" }, "& .Mui-selected": { color: `${tokens.blueDark} !important` } }}
        >
          {panels.map(([id, label]) => (
            <Tab
              key={id}
              value={id}
              id={`tab-${id}`}
              aria-controls={`panel-${id}`}
              label={
                <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.875 }}>
                  {text(label)}
                  {id === "text" && view.filledBadge ? (
                    <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: tokens.blueDark, bgcolor: tokens.tagBlue, borderRadius: 999, px: 0.875, py: "1px" }}>
                      {view.filledBadge}
                    </Box>
                  ) : null}
                </Box>
              }
            />
          ))}
        </Tabs>
        <Box component="span" sx={{ ml: "auto", mr: 0.5, display: { xs: "none", xl: "inline" }, fontSize: 12, color: "text.secondary" }}>
          {text("editor.hint")}
        </Box>
        {/* A short phone keeps the symbol in sight: a small copy that leads to the preview. */}
        <Box
          component="a"
          href="#previewPanel"
          aria-label={text("editor.compactPreviewAria")}
          title={text("editor.compactPreviewAria")}
          onClick={(event) => {
            event.preventDefault();
            document.querySelector(".preview-card")?.scrollIntoView({ block: "start" });
          }}
          dangerouslySetInnerHTML={{ __html: view.preview.svg || "" }}
          sx={{
            display: "none",
            [media.narrowShort]: { display: "flex", alignItems: "center", justifyContent: "center", flex: "none", width: 64, height: 44, ml: { xs: 1, sm: "auto" }, "& svg": { maxWidth: 64, maxHeight: 40, height: "auto" } }
          }}
        />
      </Box>
      <Box ref={scroll} sx={{ px: { xs: 1.5, sm: 2.5 }, pt: { xs: 1.75, sm: 2.25 }, pb: { xs: 2.25, sm: 2.75 }, [media.shortDesktop]: { pt: 1.75, pb: 2 } }}>
        {panels.map(([id, , Panel]) => (
          <Box
            key={id}
            id={`panel-${id}`}
            role="tabpanel"
            aria-labelledby={`tab-${id}`}
            hidden={ui.tab !== id}
            sx={{ display: ui.tab === id ? "flex" : "none", flexDirection: "column", gap: 2 }}
          >
            <Panel active={ui.tab === id} />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
