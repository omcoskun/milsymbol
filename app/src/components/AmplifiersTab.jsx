// The Amplifiers tab: Field positions or the List, the summary, Clear all and
// the notes about values kept from another symbol or edition.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import FieldLayout from "./FieldLayout.jsx";
import TextList, { UnavailableFields } from "./TextList.jsx";
import { FieldCode } from "./Section.jsx";
import { computeFieldLayout } from "../editor/layout.js";
import { useEditor, useSignal, useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { tokens } from "../theme.js";

// Text width as the boxes draw it: a field name (12 px) or a code (12 px, 600).
let measurer;
function measure(text, code) {
  if (!measurer) {
    measurer = document.createElement("span");
    measurer.setAttribute("aria-hidden", "true");
    Object.assign(measurer.style, { position: "absolute", top: "0", left: "-9999px", visibility: "hidden", whiteSpace: "pre", fontSize: "12px" });
    document.body.append(measurer);
  }
  measurer.style.fontWeight = code ? "600" : "400";
  measurer.textContent = text;
  return measurer.getBoundingClientRect().width;
}

function CarryNotes() {
  const store = useStore();
  const text = useText();
  const { view } = useEditor();
  const rows = view.carryNotes;
  return (
    <Box role="status" aria-live="polite" sx={{ display: rows.length ? "flex" : "none", flexDirection: "column", gap: 0.75, p: 1.25, borderRadius: 2, bgcolor: tokens.warnBg, color: tokens.warn, fontSize: 12 }}>
      {rows.length ? (
        <>
          <Box component="h4" sx={{ m: 0, fontSize: 13, fontWeight: 700 }}>
            {text("text.checkEntries", { count: rows.length })}
          </Box>
          {rows.map((item) => (
            <Box key={`${item.kind}|${item.key}`} data-kind={item.kind} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <FieldCode>{item.field}</FieldCode>
              <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", columnGap: 0.5, "& > span": { flexBasis: "100%" } }}>
                <b>{item.label}</b>
                {item.kind === "dropped" ? null : <q>{item.value}</q>}
                <span>{item.message}</span>
              </Box>
              {item.clearable ? (
                <Button size="small" variant="outlined" onClick={() => store.clearTextField(item.key)} sx={{ minHeight: 28, py: 0.25, borderColor: tokens.lineStrong, color: tokens.blueDark, bgcolor: tokens.panel }}>
                  {text("text.clear")}
                </Button>
              ) : null}
            </Box>
          ))}
        </>
      ) : null}
    </Box>
  );
}

export default function AmplifiersTab({ active }) {
  const store = useStore();
  const text = useText();
  const { state, ui, view } = useEditor();
  const root = useRef(null);
  const section = useRef(null);
  const [room, setRoom] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);

  // The stage's padding and border take 34 px of the panel width.
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      if (root.current.clientWidth) setRoom(root.current.clientWidth - 34);
    });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  const measuring = active && state.positions && room > 0;
  const signature = measuring ? JSON.stringify([view.layout.sidc, state.standardId, room, view.layout.states.map((item) => [item.key, item.field, item.maxLength]), view.layout.options]) : "";
  // Recomputed only when the symbol, its fields or the room change, not on typing.
  const layout = useMemo(() => {
    if (!signature) return null;
    try {
      return computeFieldLayout({ ...view.layout, room, draw: store.drawSymbol, measure, kindOf: store.layoutKind });
    } catch {
      return { fits: false, undrawn: [] };
    }
  }, [signature]);

  useEffect(() => {
    if (layout) store.setLayoutFits(layout.fits);
  }, [layout, store]);

  // Edit text, under the preview: say when the boxes need a wider window, or
  // bring them into view.
  useSignal(
    "showLayout",
    () => {
      if (!ui.layoutFits) store.toast(text("text.positionsNarrow"));
      else if (section.current && section.current.getBoundingClientRect().bottom > window.innerHeight) section.current.scrollIntoView({ block: "nearest" });
    },
    active && Boolean(layout) && layout.fits === ui.layoutFits
  );

  const positionsShown = active && view.positionsShown && layout && layout.fits;
  const viewButtons = { "& .MuiToggleButton-root": { border: 0, borderRadius: "6px !important", minHeight: 30, px: 1.5, py: 0.375, color: "text.secondary", fontSize: 14 }, "& .Mui-selected": { bgcolor: `${tokens.panel} !important`, color: "text.primary !important", boxShadow: "0 1px 2px #20364a1f" } };
  return (
    <Box ref={root} sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.25 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          aria-label={text("text.layoutAria")}
          value={view.positionsShown ? "positions" : "list"}
          onChange={(event, next) => next && store.setTextView(next)}
          sx={{ p: "3px", gap: "3px", borderRadius: 2, bgcolor: tokens.surfaceMuted, ...viewButtons }}
        >
          <ToggleButton value="positions" disabled={view.positionsDisabled} title={view.positionsTitle} aria-pressed={view.positionsShown}>
            {text("text.positions")}
          </ToggleButton>
          <ToggleButton value="list" aria-pressed={!view.positionsShown}>
            {text("text.list")}
          </ToggleButton>
        </ToggleButtonGroup>
        <Box component="p" sx={{ m: 0, flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 0.75, color: tokens.textSoft, fontSize: 12 }}>
          <span>{view.textSummary}</span>
          <IconButton
            size="small"
            aria-expanded={infoOpen}
            aria-controls="textInfo"
            aria-label={text("text.about")}
            title={text("text.about")}
            onClick={() => setInfoOpen(!infoOpen)}
            sx={{ width: 22, height: 22, border: `1px solid ${tokens.lineStrong}`, fontSize: 12, fontWeight: 700, fontStyle: "italic", fontFamily: "Georgia, serif", color: infoOpen ? tokens.blueDark : "text.secondary", bgcolor: infoOpen ? tokens.softBlue : "transparent" }}
          >
            i
          </IconButton>
        </Box>
        <Button variant="outlined" size="small" color="inherit" title={text("text.clearAllTitle")} onClick={() => store.clearText()} sx={{ borderColor: tokens.lineStrong, color: tokens.blueDark }}>
          {text("text.clearAll")}
        </Button>
      </Box>
      {infoOpen ? (
        <Box id="textInfo" sx={{ display: "flex", flexDirection: "column", gap: 0.5, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: tokens.surfaceSoft, color: "text.secondary", fontSize: 12, lineHeight: 1.5, "& p": { m: 0 } }}>
          <p>{view.textApplies}</p>
          {!view.fieldNote.hidden && view.fieldNote.text ? <p>{view.fieldNote.text}</p> : null}
          <p>{text("text.exportsNote")}</p>
        </Box>
      ) : null}
      <CarryNotes />
      <Box ref={section} sx={{ display: positionsShown ? "block" : "none" }}>
        {positionsShown ? <FieldLayout layout={layout} /> : null}
      </Box>
      <TextList hidden={Boolean(positionsShown)} />
      <UnavailableFields />
    </Box>
  );
}
