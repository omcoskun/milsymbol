// The Display tab: what is drawn, size and colours, and the editor's own
// preview choices (studio/index.html, #panel-style).
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CardSection, Note } from "./Section.jsx";
import { previewBackgrounds } from "../editor/constants.js";
import { useEditor, useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { media, tokens } from "../theme.js";

const checkTile = (checked) => ({
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  minHeight: 40,
  [media.touch]: { minHeight: 44 },
  pr: 1.5,
  pl: 0.5,
  border: `1.5px solid ${checked ? tokens.blue : tokens.lineStrong}`,
  borderRadius: 2,
  bgcolor: checked ? tokens.softBlue : tokens.panel,
  color: checked ? tokens.blueDark : "text.primary",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  "&:focus-within": { outline: `2px solid ${tokens.focus}`, outlineOffset: 2 }
});

function Check({ id, label, checked, onChange, title }) {
  return (
    <Box component="label" title={title} sx={checkTile(checked)}>
      <Checkbox id={id} size="small" checked={checked} onChange={(event) => onChange(event.target.checked)} sx={{ p: 0.75 }} />
      {label}
    </Box>
  );
}

function Range({ id, label, output, value, min, max, step = 1, onChange, describedBy }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, fontSize: 14, fontWeight: 500 }}>
      <Box component="label" htmlFor={id} sx={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <Box component="output" htmlFor={id} sx={{ fontFamily: tokens.mono }}>
          {output}
        </Box>
      </Box>
      <Slider
        size="small"
        value={Number(value)}
        min={min}
        max={max}
        step={step}
        onChange={(event, next) => onChange(String(next))}
        slotProps={{ input: { id, "aria-describedby": describedBy } }}
      />
    </Box>
  );
}

function Select({ id, label, value, options, onChange }) {
  return (
    <TextField select size="small" id={id} label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((item) => (
        <MenuItem key={item.value} value={item.value}>
          {item.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

function ColorField({ id, label, toggle, aria, title }) {
  const store = useStore();
  const { controls } = useEditor();
  return (
    <Box title={title} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, minHeight: 42, pl: toggle ? 0.5 : 1.25, pr: 1.25, border: 1, borderColor: "divider", borderRadius: 2, fontSize: 14, fontWeight: 500 }}>
      {toggle ? (
        <Box component="label" sx={{ display: "flex", alignItems: "center", gap: 0.25, cursor: "pointer" }}>
          <Checkbox id={toggle} size="small" checked={controls[toggle]} onChange={(event) => store.setControl(toggle, event.target.checked)} sx={{ p: 0.75 }} />
          {label}
        </Box>
      ) : (
        <span>{label}</span>
      )}
      <Box
        component="input"
        id={id}
        type="color"
        aria-label={aria}
        value={controls[id]}
        onChange={(event) => store.setStyleValue(id, event.target.value)}
        sx={{ width: 44, height: 28, p: 0, border: `1px solid ${tokens.lineStrong}`, borderRadius: 1, bgcolor: "transparent", cursor: "pointer" }}
      />
    </Box>
  );
}

const groupTitle = (title) => (
  <Typography component="h4" sx={{ m: 0, color: "text.secondary", fontSize: 13, fontWeight: 600 }}>
    {title}
  </Typography>
);

export default function DisplayTab() {
  const store = useStore();
  const text = useText();
  const { controls, lists, view } = useEditor();
  const set = (id) => (value) => store.setControl(id, value);
  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2.5 }}>
        <CardSection title={text("display.display")}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 132px), 1fr))", gap: 1 }}>
            {[
              ["fill", "display.fill"],
              ["frame", "display.frame"],
              ["icon", "display.icon"],
              ["infoFields", "display.textLabels"],
              ["showFlag", "display.countryFlag"]
            ].map(([id, label]) => (
              <Check key={id} id={id} label={text(label)} checked={controls[id]} onChange={set(id)} />
            ))}
            <Check id="outlineToggle" label={text("display.outline")} title={text("display.outlineTitle")} checked={controls.outlineToggle} onChange={(on) => store.setOutline(on)} />
          </Box>
          <Note text={text("display.displayNote")} />
        </CardSection>

        <CardSection title={text("display.style")} sx={{ borderTop: { xs: 1, sm: 0 }, borderColor: "divider", pt: { xs: 2, sm: 0 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: "14px 16px" }}>
            <Range id="symbolSize" label={text("display.symbolSize")} output={`${controls.symbolSize}%`} value={controls.symbolSize} min={55} max={170} onChange={set("symbolSize")} describedBy="symbolSizeNote" />
            <Range id="strokeWidth" label={text("display.strokeWidth")} output={controls.strokeWidth} value={controls.strokeWidth} min={1} max={8} step={0.5} onChange={set("strokeWidth")} />
            <Select id="colorMode" label={text("display.colorPalette")} value={controls.colorMode} options={lists.colorMode} onChange={set("colorMode")} />
            {!view.stackHidden ? <Select id="stack" label={text("display.symbolStack")} value={controls.stack} options={lists.stack} onChange={set("stack")} /> : null}
          </Box>
          <Note id="symbolSizeNote" text={text("display.sizeNote")} />
        </CardSection>
      </Box>

      <CardSection divided title={text("display.editor")}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "12px 16px", alignItems: "end" }}>
          <Select
            id="previewBackground"
            label={text("display.previewBackground")}
            value={controls.previewBackground}
            options={previewBackgrounds.map(([value, label]) => ({ value, label }))}
            onChange={(value) => store.setEditorChoice("preview", value)}
          />
          <Check id="gridToggle" label={text("display.previewGrid")} checked={controls.gridToggle} onChange={(on) => store.setEditorChoice("grid", on)} />
        </Box>
        <Note text={text("display.editorNote")} />
      </CardSection>

      <Box
        component="details"
        sx={{ borderTop: 1, borderColor: "divider", pt: 2, "& > summary": { width: "fit-content", color: "text.secondary", fontSize: 14, fontWeight: 600, cursor: "pointer", "&:hover": { color: tokens.blue } }, "&[open] > summary": { mb: 1.5 } }}
      >
        <summary>{text("display.moreStyle")}</summary>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "16px 20px", alignItems: "start" }}>
          <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 1.25, minWidth: 0 }}>
            {groupTitle(text("display.colors"))}
            <ColorField id="fillColor" toggle="fillColorOn" label={text("display.customFill")} aria={text("display.fillColorAria")} />
            <ColorField id="monoColor" toggle="monoColorOn" label={text("display.monochrome")} aria={text("display.monoColorAria")} />
            <ColorField id="modifierColor" toggle="modifierColorOn" label={text("display.modifierColor")} aria={text("display.modifierColorAria")} title={text("display.modifierColorTitle")} />
            {view.modifierColorUnused ? <Note warn role="status" text={text("display.modifierColorNote")} /> : null}
            <Range id="fillOpacity" label={text("display.fillOpacity")} output={`${controls.fillOpacity}%`} value={controls.fillOpacity} min={10} max={100} step={5} onChange={(value) => store.setStyleValue("fillOpacity", value)} />
          </Box>
          <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 1.25, minWidth: 0 }}>
            {groupTitle(text("display.text"))}
            <ColorField id="infoColor" toggle="infoColorOn" label={text("display.textColor")} aria={text("display.textColor")} />
            <ColorField id="infoBackground" toggle="infoBackgroundOn" label={text("display.textBackground")} aria={text("display.textBackgroundAria")} />
            <Range id="infoSize" label={text("display.textSize")} output={controls.infoSize} value={controls.infoSize} min={20} max={80} step={2} onChange={(value) => store.setStyleValue("infoSize", value)} />
          </Box>
          <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 1.25, minWidth: 0 }}>
            {groupTitle(text("display.outlineGroup"))}
            <Range id="outlineWidth" label={text("display.outlineWidth")} output={controls.outlineWidth} value={controls.outlineWidth} min={1} max={20} onChange={(value) => store.setStyleValue("outlineWidth", value)} />
            <ColorField id="outlineColor" label={text("display.outlineColor")} aria={text("display.outlineColor")} />
          </Box>
        </Box>
        <Box sx={{ mt: 1.5 }}>
          <Note text={text("display.moreNote")} />
        </Box>
      </Box>
    </>
  );
}
