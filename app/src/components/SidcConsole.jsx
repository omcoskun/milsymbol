// The code box under the preview: type or paste, Enter or Apply reads it, Esc
// returns to the current code. Messages say what was applied or refused.
import { useLayoutEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useEditor, useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { media, tokens } from "../theme.js";

const statusColors = {
  ok: { color: tokens.ok, bgcolor: tokens.okBg },
  error: { color: tokens.danger, bgcolor: tokens.dangerBg },
  pending: { color: tokens.warn, bgcolor: tokens.warnBg },
  info: { color: tokens.blueDark, bgcolor: tokens.softBlue }
};

function Disclosure({ summary, children, sx }) {
  return (
    <Box component="details" sx={[{ "& > summary": { cursor: "pointer", color: "text.secondary", fontSize: 13, py: 0.5 }, "&[open] > summary": { mb: 1.25 } }, sx || {}]}>
      <summary>{summary}</summary>
      {children}
    </Box>
  );
}

export default function SidcConsole({ onCopy }) {
  const store = useStore();
  const text = useText();
  const { controls, view } = useEditor();
  const box = useRef(null);
  const caret = useRef(null);
  const status = view.sidcStatus;
  const details = view.profileDetails;

  // Grow with a long code; keep the caret where it was after "_" becomes "-".
  useLayoutEffect(() => {
    const node = box.current;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight + 2}px`;
    if (caret.current && document.activeElement === node) node.setSelectionRange(caret.current[0], caret.current[1]);
    caret.current = null;
  }, [controls.sidcInput]);

  useLayoutEffect(() => {
    const node = box.current;
    let width = 0;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === width) return;
      width = entry.contentRect.width;
      node.style.height = "auto";
      node.style.height = `${node.scrollHeight + 2}px`;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label={text("sidc.aria")}
      className="sidc-console"
      sx={{ order: { xs: 3, md: 0 }, flex: "none", display: "flex", flexDirection: "column", gap: 1.25, p: 2, pt: 1.75, borderRadius: 3, containerType: "inline-size" }}
    >
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography component="label" htmlFor="sidcInput" sx={{ fontSize: 13, fontWeight: 700 }}>
          {text("sidc.label")}
        </Typography>
        <Box component="span" sx={{ fontSize: 12, color: "text.secondary" }}>
          {status.length ? `${status.length}${text("sidc.characters")}` : "—"}
        </Box>
        <Button size="small" color="inherit" disabled={view.exportDisabled} title={text("preview.copyTitle")} onClick={onCopy} sx={{ ml: "auto", minWidth: 0, color: "text.secondary" }}>
          {text("preview.copy")}
        </Button>
      </Box>
      {/* On a phone a 30-digit SIDC keeps one line: Apply goes under the code. */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, "@container (max-width: 365px)": { flexDirection: "column" } }}>
        <Box
          component="textarea"
          ref={box}
          id="sidcInput"
          rows={1}
          spellCheck={false}
          autoComplete="off"
          aria-describedby="sidcStatus"
          value={controls.sidcInput}
          onChange={(event) => {
            if (event.target.value.includes("_")) caret.current = [event.target.selectionStart, event.target.selectionEnd];
            store.setSidcInput(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              store.applySidc();
            } else if (event.key === "Escape" && store.cancelSidcInput()) {
              event.preventDefault();
            }
          }}
          sx={{
            flex: { xs: "none", sm: 1 },
            minWidth: 0,
            minHeight: 40,
            px: "11px",
            py: "9px",
            resize: "none",
            overflow: "hidden",
            fontFamily: tokens.mono,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.4px",
            lineHeight: 1.5,
            wordBreak: "break-all",
            color: "text.primary",
            bgcolor: tokens.panel,
            border: `1px solid ${status.error ? "#c2372f" : status.dirty ? "#e3a008" : tokens.lineStrong}`,
            borderRadius: 1.5,
            "&:focus": { outline: `2px solid ${tokens.focus}`, outlineOffset: 1 },
            "@container (max-width: 365px)": { flex: "none", fontSize: "clamp(12px, calc((100cqi - 26px) / 18.2), 14px)", letterSpacing: 0 }
          }}
        />
        <Button
          variant={status.applyReady ? "contained" : "outlined"}
          onClick={() => store.applySidc()}
          sx={{ minHeight: { xs: 36, sm: 40 }, px: 1.5, fontWeight: 600, ...(status.applyReady ? {} : { borderColor: tokens.blueLine, color: tokens.blueDark }) }}
        >
          {text("sidc.apply")}
        </Button>
      </Box>
      <Box
        component="p"
        id="sidcStatus"
        role="status"
        data-kind={status.kind}
        hidden={status.hidden}
        sx={{ m: 0, fontSize: 12, lineHeight: 1.45, borderRadius: 2, px: 1.1, py: 0.9, color: tokens.textSoft, bgcolor: tokens.surfaceSoft, ...statusColors[status.kind] }}
      >
        {status.text}
      </Box>
      {!details.hidden ? (
        <Box sx={{ display: "grid", gap: 0.5, fontSize: 12, color: "text.secondary" }}>
          {details.issues.length ? (
            <Box component="ul" sx={{ m: 0, pl: 2.25, color: tokens.warn }}>
              {details.issues.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </Box>
          ) : null}
          {details.notes.length ? (
            <Disclosure summary={details.notesSummary}>
              <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                {details.notes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </Box>
            </Disclosure>
          ) : null}
        </Box>
      ) : null}
      <Disclosure
        summary={text("sidc.codeDetails")}
        sx={{ "& > summary": { fontSize: { xs: 12, md: 13 }, fontWeight: { xs: 600, md: 400 }, [media.touch]: { py: "13px" } }, "&[open] > summary": { mb: { xs: 1, md: 1.25 } } }}
      >
        <Box component="dl" aria-label={text("sidc.breakdownAria")} sx={{ m: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "5px" }}>
          {view.segments.map((part) => (
            <Box key={part.key} sx={{ display: "flex", flexDirection: "column", minWidth: 0, borderRadius: 1.5, bgcolor: tokens.surfaceSoft, px: 1.1, pt: 0.6, pb: 0.75, ...(part.wide ? { gridColumn: "1 / -1" } : {}) }}>
              <Box component="dt" sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, color: "text.secondary", fontSize: 12, lineHeight: 1.25 }}>
                {part.label}
                <Box component="code" sx={{ flex: "none", fontFamily: tokens.mono, fontSize: 12, letterSpacing: "0.04em" }}>
                  {part.value}
                </Box>
              </Box>
              <Box component="dd" sx={{ m: 0, mt: 0.25, fontSize: 13, fontWeight: 600, overflowWrap: "anywhere", color: part.meaning ? "text.primary" : "text.secondary" }}>
                {part.meaning || (
                  // A part the standard's tables give no meaning shows a quiet dash.
                  <>
                    <span aria-hidden="true">—</span>
                    <Box component="span" sx={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
                      {text("sidc.noMeaning")}
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Disclosure>
    </Paper>
  );
}
