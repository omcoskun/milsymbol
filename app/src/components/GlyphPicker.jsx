// A list with a picture beside each choice (studio/glyph-picker.js). The store
// gives the rows ({ value, name, code, reason, group, disabled, note }) and the
// glyph of each value; this component only opens, moves and chooses.
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Paper from "@mui/material/Paper";
import { typeaheadIndex } from "../../../studio/editor-helpers.js";
import Svg, { FlagImage } from "./Svg.jsx";
import { ChevronDown } from "./Icons.jsx";
import { useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { tokens } from "../theme.js";

// Letters typed within this many milliseconds spell one name.
const typingPause = 700;

const glyphBox = (tall) => ({
  flex: "none",
  display: "grid",
  placeItems: "center",
  width: tall ? 44 : 40,
  height: tall ? 34 : 28,
  "& svg": { display: "block", width: "100%", height: "100%" },
  "& .flag-image": { display: "block", width: 32, height: 24, objectFit: "cover", border: `1px solid ${tokens.lineStrong}` },
  "& .flag-empty": { display: "block", width: 32, height: 24, border: `1px dashed ${tokens.lineStrong}` }
});

export default function GlyphPicker({ idPrefix, labelledBy, describedBy, picker, onChange, tall = false }) {
  const store = useStore();
  const text = useText();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);
  const typed = useRef({ text: "", at: 0 });
  const root = useRef(null);
  const button = useRef(null);
  const list = useRef(null);
  const rows = picker?.choices || [];
  const value = picker?.value ?? "";
  const disabled = !picker || picker.disabled;
  const choice = rows.find((item) => item.value === value) || picker?.fallback || rows[0] || { value: "", name: "" };

  const glyph = (item) =>
    picker?.flags ? <FlagImage code={item} svg={store.flagSvg(item)} /> : <Svg svg={picker?.glyph ? picker.glyph(item) : ""} />;

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  // Open upwards when the list would run past the bottom of the window.
  useLayoutEffect(() => {
    if (!open) return;
    const box = button.current.getBoundingClientRect();
    const below = window.innerHeight - box.bottom;
    setUp(below < Math.min(list.current.scrollHeight, 380) + 12 && box.top > below);
    list.current.focus({ preventScroll: true });
  }, [open]);

  useLayoutEffect(() => {
    if (open) list.current?.querySelector(`#${idPrefix}${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, idPrefix]);

  // A click outside the picker closes it.
  useEffect(() => {
    if (!open) return undefined;
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  function show() {
    if (disabled) return;
    setActive(Math.max(0, rows.findIndex((item) => item.value === value)));
    setOpen(true);
  }

  function close(refocus = false) {
    setOpen(false);
    if (refocus) button.current?.focus();
  }

  function choose(index) {
    const item = rows[index];
    if (!item || item.disabled) return;
    close(true);
    if (item.value !== value) onChange(item.value);
  }

  const move = (index) => {
    if (rows.length) setActive((index + rows.length) % rows.length);
  };

  // One letter again and again walks through the names that start with it.
  function typeahead(key) {
    const now = Date.now();
    typed.current.text = now - typed.current.at < typingPause ? typed.current.text + key : key;
    typed.current.at = now;
    const query = new Set(typed.current.text).size === 1 ? key : typed.current.text;
    const index = typeaheadIndex(rows.map((item) => item.name), query, active);
    if (index >= 0) move(index);
  }

  function onListKey(event) {
    const moves = { ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: rows.length - 1, PageDown: active + 5, PageUp: active - 5 };
    // A space inside a name ("New Zealand") belongs to the name.
    const spelling = event.key === " " && Date.now() - typed.current.at < typingPause;
    if (event.key in moves) {
      event.preventDefault();
      const target = moves[event.key];
      move(event.key.startsWith("Page") ? Math.min(Math.max(target, 0), rows.length - 1) : target);
    } else if (event.key === "Enter" || (event.key === " " && !spelling)) {
      event.preventDefault();
      choose(active);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if (event.key === "Tab") {
      close();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      typeahead(event.key);
    }
  }

  const row = (item, note) => (
    <>
      <Box component="span" className="glyph" aria-hidden="true" sx={glyphBox(tall)}>
        {glyph(item.value)}
      </Box>
      <Box component="span" sx={{ flex: 1, minWidth: 0, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.name}
        {note ? (
          <Box component="small" sx={{ ml: 0.75, fontSize: 11, fontWeight: 600, color: tokens.danger }}>
            {note}
          </Box>
        ) : null}
      </Box>
      {item.code ? (
        <Box component="code" sx={{ flex: "none", fontFamily: tokens.mono, fontSize: 12, color: "text.secondary" }}>
          {item.code}
        </Box>
      ) : null}
    </>
  );

  let group = "";
  return (
    <Box ref={root} sx={{ position: "relative" }}>
      <ButtonBase
        ref={button}
        id={`${idPrefix}Button`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${idPrefix}List`}
        aria-labelledby={labelledBy ? `${labelledBy} ${idPrefix}Button` : undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        title={choice.reason || ""}
        onClick={() => (open ? close(true) : show())}
        onKeyDown={(event) => {
          if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
          event.preventDefault();
          show();
        }}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 1,
          minHeight: tall ? 46 : 40,
          px: 1,
          border: `1px ${choice.reason ? "dashed" : "solid"} ${choice.reason ? tokens.danger : tokens.lineStrong}`,
          borderRadius: 1.5,
          bgcolor: choice.reason ? tokens.dangerBg : tokens.panel,
          color: choice.reason ? tokens.danger : "text.primary",
          fontSize: 14,
          fontWeight: 500,
          "&:hover": { borderColor: tokens.lineStronger },
          "&.Mui-focusVisible": { outline: `2px solid ${tokens.focus}`, outlineOffset: 1 },
          "&.Mui-disabled": { opacity: 0.55 }
        }}
      >
        {row(choice)}
        <ChevronDown sx={{ fontSize: 18, color: "text.secondary" }} />
      </ButtonBase>
      {open ? (
        <Paper
          ref={list}
          id={`${idPrefix}List`}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelledBy}
          aria-activedescendant={`${idPrefix}${active}`}
          onKeyDown={onListKey}
          onBlur={(event) => {
            if (!root.current?.contains(event.relatedTarget)) close();
          }}
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            zIndex: 20,
            ...(up ? { bottom: "calc(100% + 4px)" } : { top: "calc(100% + 4px)" }),
            maxHeight: 380,
            overflowY: "auto",
            p: 0.5,
            border: `1px solid ${tokens.lineStrong}`,
            borderRadius: 1.5,
            boxShadow: "0 12px 32px rgba(36, 49, 61, 0.16)",
            outline: "none"
          }}
        >
          {rows.map((item, index) => {
            const heading = item.group && item.group !== group ? item.group : "";
            group = item.group || "";
            const note = item.note || (item.reason ? text("symbol.notValidHere") : "");
            return (
              <Fragment key={`${item.value}|${index}`}>
                {heading ? (
                  <Box role="presentation" sx={{ px: 1, pt: 1, pb: 0.5, fontSize: 11, fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.4 }}>
                    {heading}
                  </Box>
                ) : null}
                <Box
                  role="option"
                  id={`${idPrefix}${index}`}
                  aria-selected={item.value === value}
                  aria-disabled={item.disabled ? true : undefined}
                  title={item.reason || undefined}
                  onClick={() => choose(index)}
                  onPointerMove={() => index !== active && setActive(index)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minHeight: tall ? 42 : 36,
                    px: 1,
                    borderRadius: 1,
                    cursor: item.disabled ? "default" : "pointer",
                    fontSize: 14,
                    color: item.disabled ? tokens.disabled : item.reason ? tokens.danger : "text.primary",
                    bgcolor: index === active ? tokens.surfaceMuted : item.value === value ? tokens.softBlue : "transparent",
                    fontWeight: item.value === value ? 600 : 400
                  }}
                >
                  {row(item, note)}
                </Box>
              </Fragment>
            );
          })}
        </Paper>
      ) : null}
    </Box>
  );
}
