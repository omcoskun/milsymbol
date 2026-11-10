// The palette of studio/styles.css as an MUI theme.
import { createTheme } from "@mui/material/styles";

export const tokens = {
  text: "#24313d",
  textSoft: "#3d4a57",
  muted: "#5f6b78",
  placeholder: "#6b7885",
  disabled: "#8f9aa6",
  line: "#e1e6eb",
  lineSoft: "#edf0f3",
  lineStrong: "#cfd8e1",
  lineStronger: "#aebdcb",
  blue: "#2868b2",
  blueDark: "#1d4f8a",
  blueLine: "#b9d0ea",
  softBlue: "#eef5fc",
  tagBlue: "#e3eefa",
  focus: "#4283cb",
  bg: "#f4f6f9",
  panel: "#fff",
  surfaceFaint: "#fbfcfd",
  surfaceSoft: "#f6f8fa",
  surfaceMuted: "#eef1f4",
  danger: "#a12a22",
  dangerBg: "#fdecec",
  ok: "#1f6b3a",
  okBg: "#eef8f1",
  warn: "#7a5200",
  warnBg: "#fff8e6",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
};

const font = ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", "sans-serif"].join(",");

// The widths where studio/styles.css changes layout. Vanilla rules use
// max-width (760, 900, 1100, 1240 px), so each MUI step starts one pixel later:
// sm is "wider than 760", md "wider than 900" (preview beside the editor), lg
// "wider than 1100", xl "wider than 1240".
export const breakpoints = { xs: 0, sm: 761, md: 901, lg: 1101, xl: 1241 };

// Vanilla media queries that no MUI step expresses.
export const media = {
  // Narrow and short: the editor's tab bar shows a small preview.
  narrowShort: "@media (max-width: 900px) and (max-height: 599px)",
  // Narrow and tall: the preview card stays at the top while the settings scroll.
  narrowTall: "@media (max-width: 900px) and (min-height: 600px)",
  tiny: "@media (max-width: 380px)",
  // A desktop window shorter than 800 px.
  shortDesktop: "@media (min-width: 901px) and (max-height: 800px)",
  touch: "@media (max-width: 900px), (pointer: coarse)"
};

export const theme = createTheme({
  breakpoints: { values: breakpoints },
  palette: {
    primary: { main: tokens.blue, dark: tokens.blueDark, contrastText: "#fff" },
    error: { main: tokens.danger },
    success: { main: tokens.ok },
    warning: { main: tokens.warn },
    text: { primary: tokens.text, secondary: tokens.muted, disabled: tokens.disabled },
    background: { default: tokens.bg, paper: tokens.panel },
    divider: tokens.line
  },
  typography: {
    fontFamily: font,
    fontSize: 14,
    body1: { fontSize: "0.875rem" },
    body2: { fontSize: "0.8125rem" },
    button: { textTransform: "none", fontWeight: 500 }
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, minHeight: 44 } } },
    MuiToggleButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 500 } } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    // Vanilla dialogs and popovers open and close without animation.
    MuiDialog: { defaultProps: { transitionDuration: 0 } },
    MuiPopover: { defaultProps: { transitionDuration: 0 } },
    MuiAccordion: { defaultProps: { disableGutters: true, elevation: 0 } },
    MuiTooltip: { defaultProps: { enterDelay: 400 } }
  }
});
