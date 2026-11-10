// The preview column (studio/index.html, #previewPanel): the symbol, its place
// in the palette, downloads, the SIDC console and the notes under them.
import { Fragment, useLayoutEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import ButtonGroup from "@mui/material/ButtonGroup";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SidcConsole from "./SidcConsole.jsx";
import { FileIcon, PenIcon } from "./Icons.jsx";
import { useConfig, useEditor, useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { media, tokens } from "../theme.js";
import { copyText, download, downloadPng } from "../download.js";

// A larger stage shows a larger symbol: the drawing scales with the stage's
// shorter side over previewBase px, never below its own size (studio/app.js).
const previewBase = 230;
const previewMaxZoom = 1.5;

const stageBackgrounds = {
  light: { bgcolor: "#fbfcfd", backgroundImage: "radial-gradient(#dfe5eb 1px, transparent 1px)", backgroundSize: "14px 14px" },
  dark: { bgcolor: "#1c2530", backgroundImage: "radial-gradient(#3a4653 1px, transparent 1px)", backgroundSize: "14px 14px" },
  map: { bgcolor: "#e7e3d4", backgroundImage: "repeating-radial-gradient(circle at 30% 40%, transparent 0 21px, #cfc9b3 21px 22px)", backgroundSize: "auto" }
};
export const stageBackground = (preview, grid) => ({ ...stageBackgrounds[preview] || stageBackgrounds.light, ...(grid === "off" ? { backgroundImage: "none" } : {}) });

function SymbolStage({ svg, error }) {
  const text = useText();
  const { ui } = useEditor();
  const box = useRef(null);

  useLayoutEffect(() => {
    const fit = () => {
      const node = box.current?.querySelector(":scope > svg");
      if (!node) return;
      const width = Number(node.getAttribute("width"));
      const height = Number(node.getAttribute("height"));
      const room = { width: box.current.clientWidth, height: box.current.clientHeight };
      if (!width || !height || !room.width || !room.height) return;
      const zoom = Math.min(previewMaxZoom, Math.max(1, Math.min(room.width, room.height) / previewBase));
      const scale = Math.min(zoom, room.width / width, room.height / height);
      node.style.width = `${Math.floor(width * scale)}px`;
      node.style.height = `${Math.floor(height * scale)}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box.current);
    return () => observer.disconnect();
  }, [svg]);

  return (
    <Box
      className="preview-stage"
      sx={{
        flex: "none",
        // Narrow windows keep a small stage so the settings start high up.
        height: { xs: 104, sm: 124, md: "clamp(200px, 100dvh - 520px, 460px)" },
        contain: { md: "size" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        p: { xs: "6px", md: 1.5 },
        border: `1px solid ${tokens.lineSoft}`,
        borderRadius: 2,
        ...stageBackground(ui.preview, ui.grid)
      }}
    >
      {svg ? (
        <Box
          ref={box}
          role="img"
          aria-label={text("preview.previewAria")}
          dangerouslySetInnerHTML={{ __html: svg }}
          sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", "& > svg": { maxWidth: "100%", maxHeight: "100%", height: "auto" } }}
        />
      ) : (
        <Box ref={box} sx={{ textAlign: "center", color: tokens.danger, fontSize: 13 }}>
          {text("preview.unableToRender")}
          <br />
          {error}
        </Box>
      )}
    </Box>
  );
}

function SelectedPath() {
  const store = useStore();
  const text = useText();
  const { view } = useEditor();
  const { path } = view;
  if (!path) return null;
  return (
    <Box
      component="p"
      aria-label={text("preview.placeAria")}
      sx={{ m: 0, display: { xs: "none", md: "flex" }, flexWrap: "wrap", alignItems: "baseline", columnGap: 0.5, rowGap: "1px", color: "text.secondary", fontSize: 12, lineHeight: 1.5 }}
    >
      {path.steps.map((step, index) => (
        <Fragment key={`${index}|${step.label}`}>
          {index ? <span aria-hidden="true">›</span> : null}
          {step.branch ? (
            <ButtonBase
              title={text("preview.showInPalette")}
              onClick={() => store.showGroup(step.branch)}
              sx={{ font: "inherit", color: "inherit", textAlign: "left", "&:hover": { color: tokens.blue, textDecoration: "underline" } }}
            >
              {step.label}
            </ButtonBase>
          ) : (
            <span>{step.label}</span>
          )}
        </Fragment>
      ))}
      {path.imported ? (
        <Box component="span" sx={{ ml: 0.5, px: 0.6, borderRadius: 1, bgcolor: tokens.surfaceMuted }}>
          {text("preview.importedTag")}
        </Box>
      ) : null}
    </Box>
  );
}

const pill = (color, bgcolor) => ({ fontSize: 12, lineHeight: "normal", fontWeight: 600, color, bgcolor, borderRadius: 999, px: 1.1, py: 0.25, whiteSpace: "nowrap" });

export default function PreviewPanel() {
  const store = useStore();
  const text = useText();
  const config = useConfig();
  const { controls, view } = useEditor();
  const copy = () => copyText(store.copiedSidc()).then(() => store.toast(text("preview.copied")));
  const linkButton = {
    color: tokens.blueDark,
    fontWeight: 600,
    minWidth: 0,
    px: { xs: 0.5, sm: 1.25 },
    gap: 0.5,
    "& svg": { fontSize: 18 },
    // The format labels already name the downloads; four actions keep one row.
    [media.tiny]: { "& svg": { display: "none" } }
  };
  return (
    <Box
      component="aside"
      id="previewPanel"
      tabIndex={-1}
      aria-label={text("preview.panelAria")}
      sx={{
        position: { md: "sticky" },
        top: { md: 74 },
        alignSelf: "start",
        height: { md: "calc(100dvh - 90px)" },
        overflowY: { md: "auto" },
        overscrollBehavior: "contain",
        // Narrow: the column dissolves, so its cards take their own places in
        // the page (preview 1, editor 2, code 3, notes 4).
        display: { xs: "contents", md: "flex" },
        flexDirection: "column",
        gap: 1.75,
        minWidth: 0,
        outline: "none"
      }}
    >
      <Paper
        variant="outlined"
        component="section"
        className="preview-card"
        sx={{
          order: { xs: 1, md: 0 },
          flex: "none",
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1, md: 1.5 },
          p: { xs: "10px 12px", md: 2 },
          pt: { md: 1.75 },
          borderRadius: 3,
          // The preview stays in view while the settings scroll, where the screen has room.
          [media.narrowTall]: { position: "sticky", top: 0, zIndex: 5, boxShadow: "0 4px 12px rgb(36 49 61 / 12%)" }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.25 }}>
          <Box sx={{ minWidth: 0 }}>
            <SelectedPath />
            <Typography component="h1" sx={{ fontSize: { xs: 15, md: 20 }, fontWeight: 600, letterSpacing: "-0.3px", lineHeight: 1.3, overflowWrap: "anywhere" }}>
              {view.selectedName}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, flexWrap: { xs: "wrap", md: "nowrap" }, justifyContent: "flex-end", alignItems: { xs: "center", md: "flex-end" }, gap: 0.75, flex: "none" }}>
            {view.symbolClass ? <Box component="span" sx={pill(tokens.blueDark, tokens.tagBlue)}>{view.symbolClass}</Box> : null}
            {!view.coverage.hidden ? (
              <Box component="span" title={view.coverage.title} sx={pill(tokens.warn, tokens.warnBg)}>
                {view.coverage.text}
              </Box>
            ) : null}
            <Box
              component="span"
              title={view.renderState.title}
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: 12, lineHeight: "normal", whiteSpace: "nowrap", color: view.renderState.valid ? "text.secondary" : tokens.danger }}
            >
              <Box component="i" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: view.renderState.valid ? "#34a36b" : "#d24b42" }} />
              {view.renderState.text}
            </Box>
          </Box>
        </Box>
        <SymbolStage svg={view.preview.svg} error={view.preview.error} />
        {/* Narrow: the code sits under the symbol; the SIDC console comes after the editor. */}
        <Box
          component="p"
          className="compact-code"
          sx={{ display: { xs: "block", md: "none" }, m: 0, overflow: "hidden", color: tokens.textSoft, fontFamily: tokens.mono, fontSize: 12, lineHeight: "14px", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {controls.sidcInput}
        </Box>
        <Box
          className="preview-toolbar"
          sx={{
            display: { xs: "grid", sm: "flex" },
            gridTemplateColumns: "auto auto minmax(0, 1fr)",
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 }
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            aria-label={text("preview.editTextAria")}
            title={text("preview.editTextTitle")}
            onClick={() => store.openPositions()}
            startIcon={<PenIcon />}
            sx={{ borderColor: tokens.lineStrong, fontWeight: 600 }}
          >
            {text("preview.editText")}
          </Button>
          <Button
            aria-label={text("preview.copyAria")}
            title={text("preview.copyTitle")}
            disabled={view.exportDisabled}
            onClick={copy}
            sx={{ ...linkButton, display: { xs: "inline-flex", md: "none" }, ml: { xs: 0, sm: "auto" } }}
          >
            {text("preview.copy")}
          </Button>
          <ButtonGroup variant="text" role="group" aria-label={text("preview.downloadAria")} sx={{ justifySelf: "end", "& .MuiButton-root": { border: 0 } }}>
            <Button
              aria-label={view.pngLabel}
              title={view.pngTitle}
              disabled={view.exportDisabled}
              onClick={() => downloadPng(store.currentSvg(), store.exportName("png"), () => store.toast(text("preview.pngFailed")))}
              sx={linkButton}
            >
              <FileIcon />
              {text("preview.png")}
            </Button>
            <Button
              aria-label={text("preview.svgAria")}
              title={text("preview.svgTitle")}
              disabled={view.exportDisabled}
              onClick={() => store.currentSvg() && download(store.currentSvg(), store.exportName("svg"), "image/svg+xml")}
              sx={linkButton}
            >
              <FileIcon />
              {text("preview.svg")}
            </Button>
          </ButtonGroup>
        </Box>
      </Paper>

      <SidcConsole onCopy={copy} />

      <Box sx={{ order: { xs: 4, md: 0 }, flex: "none", mt: { md: "auto" }, pb: 0.5, display: "grid", gap: 0.75, px: 0.5, fontSize: 12, color: "text.secondary", "& p": { m: 0 }, [media.touch]: { "& a": { display: "inline-block", py: 0.75 } } }}>
        <p>{view.supportNote}</p>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <span>
            {text("notes.poweredBy")}{" "}
            <Link href={config.milsymbolUrl} target="_blank" rel="noreferrer">
              {text("notes.milsymbol")}
            </Link>
          </span>
          <Link href={config.licensesUrl}>{text("notes.licenses")}</Link>
        </Box>
        <p>{text("notes.independent")}</p>
      </Box>
    </Box>
  );
}
