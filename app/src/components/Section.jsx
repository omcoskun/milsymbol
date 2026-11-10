import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InfoPopover from "./InfoPopover.jsx";
import { tokens } from "../theme.js";

// A section of the editor (.card-section): title, an optional (i) box and a
// control beside them. `divided` draws the line that separates it from the
// section above.
export function CardSection({ title, titleId, info, infoId, aside, children, divided = false, sx, ...props }) {
  return (
    <Box
      component="section"
      sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0, ...(divided ? { borderTop: 1, borderColor: "divider", pt: 2 } : {}), ...sx }}
      {...props}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.25, minHeight: 22 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
          <Typography component="h3" id={titleId} sx={{ fontSize: 15, fontWeight: 700 }}>
            {title}
          </Typography>
          {info ? (
            <InfoPopover id={infoId} title={title}>
              {info}
            </InfoPopover>
          ) : null}
        </Box>
        {aside}
      </Box>
      {children}
    </Box>
  );
}

// The content of an (i) box: the SIDC positions and the notes, or nothing.
export function infoContent(meta, ...notes) {
  const shown = notes.filter(Boolean);
  if (!meta && !shown.length) return null;
  return (
    <>
      {meta ? <Meta text={meta} /> : null}
      {shown.map((note) => (
        <Typography key={note} component="p" sx={{ fontSize: 13, lineHeight: 1.6, color: "text.secondary" }}>
          {note}
        </Typography>
      ))}
    </>
  );
}

// A note under a control; nothing when the store gives no text.
export function Note({ text, warn = false, role, id }) {
  if (!text) return null;
  return (
    <Typography
      id={id}
      role={role}
      sx={{
        fontSize: 13,
        lineHeight: 1.45,
        color: warn ? tokens.warn : "text.secondary",
        ...(warn ? { bgcolor: tokens.warnBg, borderRadius: 1, px: 1, py: 0.5 } : {})
      }}
    >
      {text}
    </Typography>
  );
}

export const Meta = ({ text }) =>
  text ? (
    <Typography component="span" sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.4 }}>
      {text}
    </Typography>
  ) : null;

export const FieldCode = ({ children, sx }) => (
  <Box
    component="span"
    sx={{ display: "inline-grid", placeItems: "center", minWidth: 26, height: 20, px: 0.5, borderRadius: 1, bgcolor: tokens.tagBlue, color: tokens.blueDark, fontSize: 11, fontWeight: 700, fontFamily: tokens.mono, ...sx }}
  >
    {children}
  </Box>
);
