import Snackbar from "@mui/material/Snackbar";
import { useEditor } from "../hooks.js";

// The store hides the toast after 1.8 s, as studio/app.js does.
export default function Toast() {
  const { ui } = useEditor();
  return (
    <Snackbar
      key={ui.toast.id}
      open={ui.toast.open}
      message={ui.toast.message}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      slotProps={{ content: { role: "status", "aria-live": "polite" } }}
    />
  );
}
