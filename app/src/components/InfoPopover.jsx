// The (i) button beside a section title and the notes it opens (info-popover.js).
import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { InfoIcon } from "./Icons.jsx";
import { useText } from "../i18n.js";
import { media } from "../theme.js";
import { hoverDelays } from "../../../studio/info-popover.js";

export default function InfoPopover({ id, title, children }) {
  const text = useText();
  const [anchor, setAnchor] = useState(null);
  // A mouse pointer resting on the button opens the box, and it closes once the pointer
  // leaves the button and the box. A click, tap or key keeps it open until it is closed.
  const [hovered, setHovered] = useState(false);
  const timer = useRef(0);
  const paper = useRef(null);
  const open = Boolean(anchor);
  const later = (action, delay) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(action, delay);
  };
  const close = () => {
    clearTimeout(timer.current);
    setAnchor(null);
    setHovered(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  // Scrolling the page closes the box; scrolling inside it does not. Escape closes it
  // also while the focus stayed on the page, as it does after the pointer opened it.
  useEffect(() => {
    if (!open) return undefined;
    const scroll = (event) => {
      if (!paper.current?.contains(event.target)) close();
    };
    const key = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("scroll", scroll, true);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("scroll", scroll, true);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  const mouse = (event) => event.pointerType === "mouse";
  const enter = (event) => {
    if (!mouse(event)) return;
    clearTimeout(timer.current);
    if (open) return;
    const button = event.currentTarget;
    later(() => {
      setHovered(true);
      setAnchor(button);
    }, hoverDelays.open);
  };
  const leave = (event) => {
    if (!mouse(event)) return;
    if (!open) clearTimeout(timer.current);
    else if (hovered) later(close, hoverDelays.close);
  };
  const name = title.toLowerCase();
  return (
    <>
      <IconButton
        size="small"
        aria-label={text("info.about", { title: name })}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onPointerEnter={enter}
        onPointerLeave={leave}
        onClick={(event) => {
          clearTimeout(timer.current);
          // A click on a box the pointer opened keeps it open.
          if (open && !hovered) close();
          else {
            setHovered(false);
            setAnchor(event.currentTarget);
          }
        }}
        className="info-button"
        sx={{
          color: "text.secondary",
          p: 0.5,
          // A finger needs a bigger target: the small round button takes the taps around it.
          [media.touch]: { minHeight: 44, position: "relative", "&::after": { content: '""', position: "absolute", inset: "-11px" } }
        }}
      >
        <InfoIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        disableScrollLock
        // Opened by the pointer, the box leaves the page usable around it and the focus where it is.
        disableAutoFocus={hovered}
        disableEnforceFocus={hovered}
        disableRestoreFocus={hovered}
        sx={hovered ? { pointerEvents: "none" } : undefined}
        slotProps={{
          paper: {
            ref: paper,
            role: "note",
            "aria-labelledby": `${id}Title`,
            onPointerEnter: (event) => mouse(event) && clearTimeout(timer.current),
            onPointerLeave: leave,
            sx: { maxWidth: 360, p: 1.5, border: 1, borderColor: "divider", boxShadow: 3, pointerEvents: "auto" }
          }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
          <Typography component="strong" id={`${id}Title`} sx={{ fontWeight: 700, fontSize: 14 }}>
            {title}
          </Typography>
          <IconButton size="small" aria-label={text("info.close", { title: name })} onClick={close}>
            ×
          </IconButton>
        </Box>
        <Box sx={{ display: "grid", gap: 1, fontSize: 13, color: "text.secondary", "& p": { m: 0 } }}>{children}</Box>
      </Popover>
    </>
  );
}
