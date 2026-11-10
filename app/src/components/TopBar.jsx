import { useEffect, useRef } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import { BrandMark, PaletteIcon } from "./Icons.jsx";
import { useConfig, useEditor, useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { media, tokens } from "../theme.js";

export default function TopBar() {
  const store = useStore();
  const config = useConfig();
  const text = useText();
  const { state, view } = useEditor();
  const launcher = useRef(null);
  const wasOpen = useRef(state.searchOpen);
  // Closing the palette returns to its launcher, as studio/app.js does.
  useEffect(() => {
    if (wasOpen.current && !state.searchOpen) launcher.current?.focus();
    wasOpen.current = state.searchOpen;
  }, [state.searchOpen]);
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ position: { xs: "static", md: "sticky" }, zIndex: 20, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
    >
      {/* The grid of studio/styles.css .topbar: brand, launcher, actions. Narrow,
          the launcher takes a row of its own; on a very small phone the actions do too. */}
      <Toolbar
        disableGutters
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr) auto", md: "auto minmax(0, 1fr) auto" },
          alignItems: "center",
          gap: { xs: "10px", md: "20px" },
          minHeight: { xs: 58 },
          p: { xs: "10px 14px", md: "8px 20px" },
          [media.tiny]: { gridTemplateColumns: "minmax(0, 1fr)" }
        }}
      >
        <Link
          href="./"
          underline="none"
          color="inherit"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.75, sm: 1.25 },
            minWidth: { xs: 0, sm: "auto" },
            fontWeight: 600,
            fontSize: { xs: 14, sm: 15 },
            lineHeight: { xs: 1.2, sm: "inherit" },
            whiteSpace: { xs: "normal", sm: "nowrap" },
            "& svg": { flex: "none" }
          }}
        >
          <BrandMark />
          <Box component="span">{text("app.title")}</Box>
        </Link>
        <ButtonBase
          ref={launcher}
          id="searchLauncher"
          aria-haspopup="dialog"
          aria-controls="searchPanel"
          aria-expanded={state.searchOpen}
          onClick={() => store.openSearch()}
          sx={{
            gridColumn: { xs: "1 / -1", md: "auto" },
            gridRow: { xs: 2, md: "auto" },
            [media.tiny]: { gridRow: 3 },
            justifySelf: "center",
            width: "100%",
            maxWidth: 560,
            minWidth: 0,
            minHeight: 40,
            justifyContent: "flex-start",
            gap: 1.25,
            px: 1.5,
            border: `1px solid ${tokens.lineStrong}`,
            borderRadius: 1.5,
            bgcolor: tokens.surfaceSoft,
            color: "text.secondary",
            "&:hover": { borderColor: tokens.lineStronger, bgcolor: tokens.surfaceMuted }
          }}
        >
          <PaletteIcon sx={{ flex: "none", fontSize: 17, color: tokens.blue }} />
          <Box component="strong" sx={{ flex: "none", color: "text.primary", fontWeight: 600, whiteSpace: "nowrap" }}>
            {text("app.launcherTitle")}
          </Box>
          <Box component="span" sx={{ flex: 1, minWidth: 0, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {text("app.launcherHint")}
          </Box>
          <Box component="kbd" sx={{ px: 0.75, border: `1px solid ${tokens.lineStrong}`, borderRadius: 1, fontSize: 12, fontFamily: tokens.mono, bgcolor: tokens.panel }}>
            {text("app.launcherKey")}
          </Box>
        </ButtonBase>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: { xs: 0.75, sm: 1.75 }, [media.tiny]: { justifyContent: "space-between" } }}>
          <TextField
            select
            size="small"
            label={text("app.standard")}
            value={state.standardId}
            onChange={(event) => store.setStandard(event.target.value)}
            slotProps={{ htmlInput: { "aria-label": text("app.standardAria") } }}
            sx={{ minWidth: 130 }}
          >
            {view.standards.map((standard) => (
              <MenuItem key={standard.id} value={standard.id}>
                {standard.label}
              </MenuItem>
            ))}
          </TextField>
          <Link href={config.sourceUrl} target="_blank" rel="noreferrer" sx={{ display: { xs: "none", sm: "inline" }, fontSize: 14, whiteSpace: "nowrap" }}>
            {text("app.sourceCode")}
          </Link>
          <Button variant="outlined" color="inherit" size="small" onClick={() => store.setHelpOpen(true)} sx={{ borderColor: tokens.lineStrong }}>
            {text("app.help")}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
