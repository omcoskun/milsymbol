// The page of studio/index.html: top bar, preview column, editor, palette,
// help and toast. Global keys: "/" opens the palette.
import { useEffect } from "react";
import Box from "@mui/material/Box";
import GlobalStyles from "@mui/material/GlobalStyles";
import TopBar from "./components/TopBar.jsx";
import PreviewPanel from "./components/PreviewPanel.jsx";
import EditorPanel from "./components/EditorPanel.jsx";
import PaletteDialog from "./components/PaletteDialog.jsx";
import HelpDialog from "./components/HelpDialog.jsx";
import Toast from "./components/Toast.jsx";
import { useEditor, useStore } from "./hooks.js";
import { media } from "./theme.js";

export default function App() {
  const store = useStore();
  const { view } = useEditor();

  useEffect(() => {
    document.title = view.documentTitle;
  }, [view.documentTitle]);

  // A draft is written before the page goes away.
  useEffect(() => {
    const flush = () => store.flushDraft();
    const hidden = () => {
      if (document.visibilityState === "hidden") store.flushDraft();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [store]);

  useEffect(() => {
    const onKey = (event) => {
      const active = document.activeElement;
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(active?.tagName) &&
        !active?.isContentEditable &&
        !store.getSnapshot().ui.helpOpen
      ) {
        event.preventDefault();
        store.openSearch();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [store]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      {/* A finger needs a bigger target than a pointer (studio/styles.css). Field
          positions boxes and the (i) buttons keep their size; MUI's own select
          keeps its size. */}
      <GlobalStyles
        styles={{
          [media.touch]: {
            "button:not(.layout-box *, .info-button), select:not(.layout-box *), input:not([type='checkbox'], [type='radio'], [type='range'], [type='color'], [type='hidden'], .layout-box *, .MuiSelect-nativeInput), textarea": {
              minHeight: 44
            }
          }
        }}
      />
      <TopBar />
      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: 2400,
          mx: "auto",
          display: "grid",
          // Narrow: one column, the preview card first, then the editor, the
          // code and the notes (PreviewPanel and EditorPanel set the order).
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(300px, 34%) minmax(0, 1fr)", lg: "clamp(320px, 28vw, 520px) minmax(0, 1fr)" },
          // Side by side, the editor card reaches the bottom of the preview column.
          alignItems: { xs: "start", md: "stretch" },
          gap: 2,
          px: { xs: 1.5, sm: 2.5 },
          pt: { xs: 1.5, sm: 2 },
          pb: { xs: 3, sm: 3.5, md: 2 },
          // Typing a value on a tall phone: the small preview gives the room to
          // the field and the keyboard.
          [media.narrowTall]: {
            "&:has(#panel-text :is(input, select, textarea):focus)": {
              "& .preview-stage": { height: 72 },
              "& .preview-toolbar, & .compact-code": { display: "none" }
            }
          }
        }}
      >
        <PreviewPanel />
        <EditorPanel />
      </Box>
      <PaletteDialog />
      <HelpDialog />
      <Toast />
    </Box>
  );
}
