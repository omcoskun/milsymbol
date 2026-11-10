// The (i) button beside a section title and the notes it opens (info-popover.js).
import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { InfoIcon } from "./Icons.jsx";
import { useText } from "../i18n.js";
import { media } from "../theme.js";

export default function InfoPopover({ id, title, children }) {
  const text = useText();
  const [anchor, setAnchor] = useState(null);
  const paper = useRef(null);
  const open = Boolean(anchor);
  // Scrolling the page closes the box; scrolling inside it does not.
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!paper.current?.contains(event.target)) setAnchor(null);
    };
    document.addEventListener("scroll", close, true);
    return () => document.removeEventListener("scroll", close, true);
  }, [open]);
  const name = title.toLowerCase();
  return (
    <>
      <IconButton
        size="small"
        aria-label={text("info.about", { title: name })}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={(event) => setAnchor(open ? null : event.currentTarget)}
        className="info-button"
        sx={{
          color: "text.secondary",
          p: 0.5,
          // A finger needs a bigger target: the small round button takes the taps around it.
          [media.touch]: { position: "relative", "&::after": { content: '""', position: "absolute", inset: "-11px" } }
        }}
      >
        <InfoIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        disableScrollLock
        slotProps={{ paper: { ref: paper, role: "note", "aria-labelledby": `${id}Title`, sx: { maxWidth: 360, p: 1.5, border: 1, borderColor: "divider", boxShadow: 3 } } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
          <Typography component="strong" id={`${id}Title`} sx={{ fontWeight: 700, fontSize: 14 }}>
            {title}
          </Typography>
          <IconButton size="small" aria-label={text("info.close", { title: name })} onClick={() => setAnchor(null)}>
            ×
          </IconButton>
        </Box>
        <Box sx={{ display: "grid", gap: 1, fontSize: 13, color: "text.secondary", "& p": { m: 0 } }}>{children}</Box>
      </Popover>
    </>
  );
}
