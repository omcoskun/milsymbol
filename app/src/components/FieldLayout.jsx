// Field positions: a box for each text field around the symbol, where
// milsymbol draws it (studio/app.js, #fieldLayout). The boxes and the list
// hold one value per field: both write through the store.
import { forwardRef, useRef, useState } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { FieldCode } from "./Section.jsx";
import { ClockIcon } from "./Icons.jsx";
import { textModifiers } from "../editor/store.js";
import { useEditor, useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { tokens } from "../theme.js";

const stageColors = { light: "#f7f9fb", dark: "#1c2530", map: "#e7e3d4" };
const fieldOf = (key) => textModifiers.find((item) => item.key === key);
const visuallyHidden = { position: "absolute", width: "1px", height: "1px", p: 0, m: "-1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };

// .layout-box and its states (studio/styles.css).
const boxStyles = {
  "& .layout-box": {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    width: "var(--w)",
    height: 30,
    p: "0 4px 0 8px",
    border: `1px solid ${tokens.lineStrong}`,
    borderRadius: "8px",
    bgcolor: tokens.panel,
    cursor: "text",
    transition: "border-color 0.12s",
    "&:hover": { borderColor: tokens.lineStronger },
    "&.filled": { borderColor: tokens.blueLine, bgcolor: tokens.surfaceFaint },
    "&:focus-within": { borderColor: tokens.blue, outline: `2px solid ${tokens.focus}`, outlineOffset: 2 },
    "&.problem": { borderColor: "#d24b42" },
    "&.problem:focus-within": { outlineColor: "#d24b42" },
    "&.inside": { transform: "translate(-50%, -50%)" },
    "&.inside:not(:focus-within)": {
      width: "auto",
      maxWidth: "var(--w)",
      height: 24,
      p: "0 8px",
      borderRadius: "12px",
      bgcolor: "color-mix(in srgb, #fff 92%, transparent)",
      cursor: "pointer",
      "&:hover": { borderColor: tokens.blue },
      "& > :is(input, select, .layout-open, .layout-now)": { width: 0, flex: "0 0 0", p: 0, opacity: 0 },
      "& .layout-shown": { display: "block", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: tokens.text, fontSize: 12, fontWeight: 500 }
    },
    "&.compact:not(:focus-within)": { gap: 0, borderStyle: "dashed", borderColor: tokens.lineStronger, "& .layout-code": { color: tokens.muted } }
  },
  "& .layout-shown": { display: "none" },
  "& .layout-code": { flex: "none", fontSize: 12, fontWeight: 600, color: tokens.muted },
  "& .layout-box.filled .layout-code, & .layout-box:focus-within .layout-code": { color: tokens.blueDark },
  "& .layout-box input, & .layout-box select, & .layout-open": {
    flex: 1,
    minWidth: 0,
    width: "auto",
    height: 28,
    p: "0 4px 0 0",
    border: 0,
    borderRadius: 0,
    bgcolor: "transparent",
    color: tokens.text,
    font: "inherit",
    fontSize: 12,
    fontWeight: 500,
    textOverflow: "ellipsis",
    "&:focus-visible": { outline: "none" }
  },
  "& .layout-box input::placeholder": { color: tokens.muted, fontWeight: 400 },
  "& .layout-box input:focus::placeholder": { color: tokens.disabled },
  "& .layout-box input::-webkit-calendar-picker-indicator": { display: "none !important" },
  "& .layout-box select": { appearance: "auto", cursor: "pointer" },
  "& .layout-box:not(.filled) select, & .layout-box:not(.filled) .layout-open": { color: tokens.muted, fontWeight: 400 },
  "& .layout-open": { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px", overflow: "hidden", whiteSpace: "nowrap", textAlign: "left", cursor: "pointer" },
  "& .layout-open-text": { overflow: "hidden", textOverflow: "ellipsis" },
  "& .layout-open svg": { flex: "none", width: 12, height: 12, fill: "none", stroke: tokens.blue, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
  "& .layout-now": { display: "grid", placeItems: "center", flex: "none", width: 22, height: 22, borderRadius: "4px", color: tokens.muted, "&:hover": { bgcolor: tokens.softBlue, color: tokens.blue }, "& svg": { fontSize: 15 } }
};

const LayoutControl = forwardRef(function LayoutControl({ box, name, about }, ref) {
  const store = useStore();
  const text = useText();
  const { controls, lists, view } = useEditor();
  const field = fieldOf(box.key);
  const value = controls[field.id];
  const described = `layout-about-${box.key}`;
  if (box.kind === "open")
    return (
      <ButtonBase className="layout-open" aria-describedby={described} aria-label={text("text.layoutOpens", { name, value: value || text("text.notSet") })} onClick={() => store.openField(box.key)}>
        <span className="layout-open-text">{value || box.placeholder}</span>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m6 4 4 4-4 4" />
        </svg>
      </ButtonBase>
    );
  if (box.kind === "select")
    return (
      <select ref={ref} aria-label={name} aria-describedby={described} value={value} onChange={(event) => store.setTextField(box.key, event.target.value)}>
        {(lists[field.id] || []).map((item) => (
          <option key={item.value} value={item.value}>
            {item.value || box.placeholder}
          </option>
        ))}
      </select>
    );
  const info = view.textFields[box.key];
  return (
    <input
      ref={ref}
      autoComplete="off"
      aria-label={name}
      aria-describedby={described}
      placeholder={box.placeholder}
      maxLength={info.maxLength > 0 ? info.maxLength : undefined}
      list={info.datalist ? `${field.id}-choices` : undefined}
      value={value}
      onChange={(event) => store.setTextField(box.key, event.target.value)}
      title={about}
    />
  );
});

function LayoutBox({ box, onHover, onFocusBox }) {
  const store = useStore();
  const text = useText();
  const { controls, state } = useEditor();
  const control = useRef(null);
  const field = fieldOf(box.key);
  const value = controls[field.id];
  const warnings = store.fieldWarnings(box.key);
  const about = store.fieldHelp(box.key) || field.description;
  const name = `${box.field} ${box.label}`;
  const classes = [
    "layout-box",
    value && "filled",
    warnings.length && "problem",
    box.key === state.focusField && "focused",
    box.inside && "inside",
    box.inside && !value && "compact"
  ].filter(Boolean);
  return (
    <label
      className={classes.join(" ")}
      data-layout-key={box.key}
      style={{ left: box.left, top: box.top, "--w": `${box.width}px` }}
      onMouseEnter={() => onHover(box.key)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => {
        onFocusBox(box.key);
        store.setFocusField(box.key);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onFocusBox(null);
      }}
    >
      <span className="layout-code">{box.field}</span>
      <span className="layout-shown" aria-hidden="true">
        {value}
      </span>
      <Box component="span" id={`layout-about-${box.key}`} sx={visuallyHidden}>
        {about}
      </Box>
      <LayoutControl ref={control} box={box} name={name} about={about} />
      {box.key === "dtg" ? (
        <ButtonBase
          className="layout-now"
          title={text("text.layoutNowTitle")}
          aria-label={text("text.layoutNowAria")}
          onClick={() => {
            store.fillDtgNow();
            control.current?.focus();
          }}
        >
          <ClockIcon />
        </ButtonBase>
      ) : null}
    </label>
  );
}

export default function FieldLayout({ layout }) {
  const store = useStore();
  const text = useText();
  const { controls, ui } = useEditor();
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const shown = layout.boxes.find((box) => box.key === hovered) || layout.boxes.find((box) => box.key === focused);
  let help;
  if (!shown) {
    help = layout.boxes.length ? (
      <>
        <Box component="span" sx={{ color: "text.primary" }}>
          {text("text.layoutHelpTitle")}
        </Box>
        <span>{text("text.layoutHelpText")}</span>
      </>
    ) : (
      <Box component="span" sx={{ color: "text.primary" }}>
        {text("text.layoutHelpNone")}
      </Box>
    );
  } else {
    const field = fieldOf(shown.key);
    const editing = shown.key === focused;
    const info = store.getSnapshot().view.textFields[shown.key];
    const value = controls[field.id];
    const warnings = editing ? store.fieldWarnings(shown.key) : [];
    const about = shown.parts ? text("text.builtFromLists", { description: field.description }) : store.fieldHelp(shown.key) || field.description;
    help = (
      <>
        <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0, color: "text.primary", whiteSpace: "nowrap" }}>
          <FieldCode>{shown.field}</FieldCode>
          <strong style={{ fontWeight: 600 }}>{shown.label}</strong>
          {editing && info.maxLength > 0 && !field.choices ? (
            <Box component="span" sx={{ ml: 1.25, fontFamily: tokens.mono, color: "text.secondary" }}>
              {value.length} / {info.maxLength}
            </Box>
          ) : null}
        </Box>
        {warnings.length ? (
          <Box component="span" sx={{ color: tokens.danger }}>
            {warnings.join(" ")}
          </Box>
        ) : (
          <span>{about}</span>
        )}
      </>
    );
  }
  return (
    <Box component="section" aria-label={text("text.positionsAria")} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "center", px: 2, py: 3.5, border: `1px solid ${tokens.lineSoft}`, borderRadius: 3, bgcolor: stageColors[ui.preview] || stageColors.light }}>
        <Box sx={{ position: "relative", flex: "none", ...boxStyles }} style={{ width: layout.width, height: layout.height, zoom: layout.zoom }}>
          <Box
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: layout.symbol.svg }}
            sx={{ position: "absolute", pointerEvents: "none", "& svg": { display: "block", width: "100%", height: "100%" } }}
            style={{ left: layout.symbol.left, top: layout.symbol.top, width: layout.symbol.width, height: layout.symbol.height }}
          />
          {layout.boxes.map((box) => (
            <LayoutBox key={`${box.key}|${box.kind}`} box={box} onHover={setHovered} onFocusBox={setFocused} />
          ))}
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", height: 42, color: "text.secondary", fontSize: 12, lineHeight: "19px", "& > span": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }}>
        {help}
      </Box>
      {layout.undrawn.length ? (
        <Box component="details" sx={{ fontSize: 12, "& summary": { width: "fit-content", color: "text.secondary", fontWeight: 500, cursor: "pointer", "&:hover": { color: tokens.blue } } }}>
          <summary>{text("text.notDrawn", { count: layout.undrawn.length })}</summary>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 1.75, rowGap: 0.75, mt: 1, color: "text.secondary" }}>
            {layout.undrawn.map((item) => (
              <span key={item.key}>
                <FieldCode sx={{ mr: 0.625 }}>{item.field}</FieldCode>
                {item.label}
              </span>
            ))}
            <span>
              {[
                layout.undrawn.some((item) => !item.graphic) ? text("text.notDrawnText") : "",
                layout.undrawn.some((item) => item.graphic) ? text("text.notDrawnGraphics") : ""
              ]
                .filter(Boolean)
                .join(" ")}{" "}
              <ButtonBase onClick={() => store.setTextView("list")} sx={{ font: "inherit", color: tokens.blue, textDecoration: "underline", verticalAlign: "baseline" }}>
                {text("text.setInList")}
              </ButtonBase>
            </span>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
