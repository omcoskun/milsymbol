import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useEditor, useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { tokens } from "../theme.js";

// Help paragraphs are lists of text and { kbd } parts in lang.json.
const Kbd = ({ children }) => (
  <Box component="kbd" sx={{ px: 0.6, py: 0.1, border: `1px solid ${tokens.lineStrong}`, borderRadius: 1, fontFamily: tokens.mono, fontSize: 12, bgcolor: tokens.surfaceSoft }}>
    {children}
  </Box>
);

export default function HelpDialog() {
  const store = useStore();
  const text = useText();
  const { ui } = useEditor();
  const paragraphs = text("help.paragraphs");
  return (
    <Dialog open={ui.helpOpen} onClose={() => store.setHelpOpen(false)} maxWidth="sm" fullWidth aria-labelledby="helpTitle">
      <IconButton aria-label={text("help.close")} onClick={() => store.setHelpOpen(false)} sx={{ position: "absolute", top: 8, right: 8 }}>
        ×
      </IconButton>
      <DialogTitle id="helpTitle" sx={{ pr: 6 }}>
        {text("help.title")}
      </DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 1.5 }}>
        {(Array.isArray(paragraphs) ? paragraphs : []).map((parts, index) => (
          <Typography key={index} sx={{ lineHeight: 1.55 }}>
            {parts.map((part, at) => (typeof part === "string" ? part : <Kbd key={at}>{part.kbd}</Kbd>))}
          </Typography>
        ))}
      </DialogContent>
    </Dialog>
  );
}
