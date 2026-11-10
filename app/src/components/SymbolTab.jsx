// The Symbol tab: identity, status, designation, echelon / mobility, country
// and the edition's own modifiers. Chips and pickers are front ends for the
// store's selects (studio/index.html, #panel-symbol).
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import GlyphPicker from "./GlyphPicker.jsx";
import Svg from "./Svg.jsx";
import { CardSection, FieldCode, Note, infoContent } from "./Section.jsx";
import { useEditor, useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { media, tokens } from "../theme.js";

const chipStates = {
  "&[aria-pressed='true']": { borderColor: tokens.blue, bgcolor: tokens.softBlue, color: tokens.blueDark },
  "&.invalid": { borderStyle: "dashed", borderColor: tokens.danger, bgcolor: tokens.dangerBg, color: tokens.danger },
  "&.Mui-disabled": { opacity: 0.6 },
  "&.Mui-focusVisible": { outline: `2px solid ${tokens.focus}`, outlineOffset: 1 },
  "& .chip-glyph svg": { display: "block", width: "100%", height: "100%" }
};

function Chip({ chip, status, onChoose }) {
  const text = useText();
  return (
    <ButtonBase
      aria-pressed={chip.pressed}
      title={chip.flag || undefined}
      disabled={chip.disabled}
      className={chip.flag ? "invalid" : undefined}
      onClick={() => onChoose(chip.value)}
      sx={{
        display: "flex",
        flexDirection: status ? "row" : "column",
        alignItems: "center",
        justifyContent: status ? "flex-start" : "center",
        gap: status ? 1.25 : 0.75,
        minHeight: status ? 54 : 96,
        px: status ? 1.25 : 0.75,
        py: status ? 0.75 : 1,
        border: `1.5px solid ${tokens.lineStrong}`,
        borderRadius: 2.5,
        bgcolor: tokens.panel,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.2,
        textAlign: status ? "left" : "center",
        containerType: status ? undefined : "inline-size",
        ...chipStates
      }}
    >
      <Svg
        className="chip-glyph"
        svg={chip.glyph}
        aria-hidden="true"
        sx={status ? { flex: "none", width: 56, height: 40, p: "3px" } : { flex: "none", width: "clamp(76px, 40cqi - 10px, 112px)", aspectRatio: "76 / 54", p: "3px" }}
      />
      <Box component="span" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
        {chip.label}
      </Box>
      {chip.flag ? (
        <Box component="small" sx={{ fontSize: 12, fontWeight: 600 }}>
          {text("symbol.notValidHere")}
        </Box>
      ) : null}
    </ButtonBase>
  );
}

const ChipGrid = ({ chips, status = false, onChoose }) => (
  <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: status ? "repeat(auto-fill, minmax(180px, 1fr))" : "repeat(4, minmax(0, 1fr))" }}>
    {chips.map((chip) => (
      <Chip key={chip.value} chip={chip} status={status} onChoose={onChoose} />
    ))}
  </Box>
);

// A small select beside a label, as .inline-select.
export function InlineSelect({ id, label, value, options, onChange, describedBy, sx }) {
  return (
    <Box component="label" htmlFor={id} sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", fontSize: 12, ...sx }}>
      <span>{label}</span>
      <TextField
        select
        id={id}
        size="small"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        slotProps={{ select: { "aria-describedby": describedBy }, htmlInput: { id } }}
        sx={{ maxWidth: 220, "& .MuiSelect-select": { py: 0.5, fontSize: 13 } }}
      >
        {options.map((item) => (
          <MenuItem key={item.value} value={item.value} title={item.title} disabled={item.disabled}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

function DesignationToggle({ id, label }) {
  const store = useStore();
  const { controls, disabled, view } = useEditor();
  const off = Boolean(disabled[id]);
  return (
    <Box
      component="label"
      title={view.flagTitles[id] || undefined}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.75,
        minHeight: 96,
        px: 0.75,
        py: 1,
        border: `1.5px solid ${controls[id] && !off ? tokens.blue : off ? tokens.line : tokens.lineStrong}`,
        borderRadius: 2.5,
        bgcolor: off ? tokens.surfaceSoft : controls[id] ? tokens.softBlue : tokens.panel,
        color: off ? tokens.disabled : controls[id] ? tokens.blueDark : "text.primary",
        cursor: off ? "not-allowed" : "pointer",
        fontSize: 14,
        fontWeight: 500,
        containerType: "inline-size",
        "&:focus-within": { outline: `2px solid ${tokens.focus}`, outlineOffset: 1 },
        "@container designation (max-width: 379px)": { flexDirection: "row", justifyContent: "flex-start", gap: 1.25, minHeight: 58, px: 1.25, py: "3px" }
      }}
    >
      <Svg
        aria-hidden="true"
        svg={view.designationGlyphs?.[id]}
        sx={{
          flex: "none",
          width: "clamp(64px, 43cqi + 6px, 96px)",
          aspectRatio: "64 / 58",
          p: "3px",
          opacity: off ? 0.45 : 1,
          "& svg": { display: "block", width: "100%", height: "100%" },
          "@container designation (max-width: 379px)": { width: 52, height: 52 }
        }}
      />
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.625, minWidth: 0, lineHeight: 1.25 }}>
        <input
          id={id}
          type="checkbox"
          checked={controls[id]}
          disabled={off}
          onChange={(event) => store.setFlag(id, event.target.checked)}
          style={{ margin: 0, accentColor: tokens.blue }}
        />
        <span>{label}</span>
      </Box>
    </Box>
  );
}

const fieldLabel = { display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0, fontSize: 14, fontWeight: 500 };

export default function SymbolTab() {
  const store = useStore();
  const text = useText();
  const { controls, disabled, lists, view } = useEditor();
  const pickers = view.pickers || {};
  const uncertaintyNote = view.uncertainty.hidden ? "" : view.uncertainty.note;
  return (
    <>
      <CardSection
        title={text("symbol.identityTitle")}
        titleId="identityTitle"
        infoId="identityInfo"
        info={infoContent("", view.identityNote, uncertaintyNote)}
        aside={
          view.contextHidden ? null : (
            <InlineSelect id="context" label={text("symbol.context")} value={controls.context} options={lists.context} onChange={(value) => store.setContext(value)} />
          )
        }
      >
        <Box role="group" aria-labelledby="identityTitle">
          <ChipGrid chips={view.chips.primary} onChoose={(value) => store.chooseIdentity(value)} />
          {!view.chips.moreHidden ? (
            <Box component="details" sx={{ mt: 1.5, "& > summary": { py: 0.5, cursor: "pointer", color: "text.secondary", fontSize: 14, [media.touch]: { py: "13px" } }, "&[open] > summary": { mb: 1.5 } }}>
              <summary>
                {text("symbol.moreIdentities")}{" "}
                <Box component="span" sx={{ color: tokens.blueDark, fontWeight: 600 }}>
                  {view.chips.moreSelection}
                </Box>
              </summary>
              <ChipGrid chips={view.chips.secondary} onChoose={(value) => store.chooseIdentity(value)} />
            </Box>
          ) : null}
        </Box>
        <Note text={view.identityReason} />
        <Note text={view.identityAdjust} warn role="status" />
        {!view.uncertainty.hidden ? (
          <InlineSelect
            id="uncertaintyMarker"
            label={text("symbol.uncertainty")}
            value={controls.uncertaintyMarker}
            options={lists.uncertaintyMarker}
            onChange={(value) => store.setControl("uncertaintyMarker", value)}
          />
        ) : null}
      </CardSection>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2.5 }}>
        <CardSection divided title={text("symbol.statusTitle")} titleId="statusTitle" infoId="statusInfo" info={infoContent(view.statusMeta, view.statusNote)}>
          <Box role="group" aria-labelledby="statusTitle">
            <ChipGrid chips={view.chips.status} status onChoose={(value) => store.chooseStatus(value)} />
          </Box>
          <Note text={view.statusAdjust} warn role="status" />
        </CardSection>

        <CardSection
          divided
          title={text("symbol.designationTitle")}
          infoId="designationInfo"
          info={infoContent(view.designationMeta, view.designationNote)}
          sx={{ containerType: "inline-size", containerName: "designation" }}
        >
          <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "repeat(3, minmax(0, 1fr))", "@container designation (max-width: 379px)": { gridTemplateColumns: "minmax(0, 1fr)" } }}>
            <DesignationToggle id="hq" label={view.hqLabel} />
            <DesignationToggle id="taskForce" label={text("symbol.taskForce")} />
            <DesignationToggle id="feintDummy" label={text("symbol.feintDummy")} />
          </Box>
          {!view.hqStaffRow.hidden ? (
            <Box component="label" title={view.hqStaffRow.title} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, fontSize: 14 }}>
              <span>
                {view.hqStaffLabel} <FieldCode>{text("symbol.hqStaffCode")}</FieldCode>
              </span>
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                <Box
                  component="input"
                  id="hqStaffLength"
                  type="number"
                  min={0}
                  max={500}
                  placeholder="0"
                  disabled={disabled.hqStaffLength}
                  value={controls.hqStaffLength}
                  onChange={(event) => store.setControl("hqStaffLength", event.target.value)}
                  sx={{ width: 90, minHeight: 34, px: 1, border: `1px solid ${tokens.lineStrong}`, borderRadius: 1.5, font: "inherit" }}
                />
                <span aria-hidden="true">{text("symbol.px")}</span>
              </Box>
            </Box>
          ) : null}
          <Note text={view.designationReason} />
        </CardSection>

        <CardSection divided title={text("symbol.amplifierTitle")} infoId="amplifierInfo" info={infoContent(view.amplifierMeta, view.amplifierNote)}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            aria-label={text("symbol.amplifierTypeAria")}
            value={view.amplifierModes.find((mode) => mode.active)?.mode || null}
            onChange={(event, mode) => mode && store.setAmplifierMode(mode)}
            sx={{
              p: "3px",
              gap: "3px",
              borderRadius: 2,
              bgcolor: tokens.surfaceMuted,
              "& .MuiToggleButton-root": { border: 0, borderRadius: "6px !important", minHeight: 30, py: 0.375, color: "text.secondary", fontSize: 14 },
              "& .Mui-selected": { bgcolor: `${tokens.panel} !important`, color: "text.primary !important", boxShadow: "0 1px 2px #20364a1f" }
            }}
          >
            {view.amplifierModes.map((mode) => (
              <ToggleButton key={mode.mode} value={mode.mode} disabled={mode.disabled}>
                {mode.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Box sx={fieldLabel}>
            <span id="amplifierLabel">{view.amplifierLabel}</span>
            <GlyphPicker idPrefix="amplifier" labelledBy="amplifierLabel" picker={pickers.amplifier} tall onChange={(value) => store.setAmplifierValue(value)} />
          </Box>
          <Note text={view.amplifierReason} />
          <Note text={view.amplifierAdjust} warn role="status" />
        </CardSection>

        <CardSection divided title={text("symbol.countryTitle")} titleId="countryHeading" infoId="countryInfo" info={infoContent(view.countryMeta, view.countryFlagNote)}>
          <GlyphPicker idPrefix="country" labelledBy="countryHeading" picker={pickers.country} onChange={(value) => store.setCountryFlag(value)} />
        </CardSection>
      </Box>

      {!view.editionSectionHidden ? (
        <CardSection divided title={text("symbol.editionTitle")} infoId="editionInfo" info={infoContent(view.editionMeta, view.modifierNoteHidden ? "" : view.modifierNote)}>
          {!view.symbolModifiersHidden ? (
            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(auto-fit, minmax(240px, 1fr))" } }}>
              {[1, 2].map((type) => (
                <Box key={type} sx={fieldLabel}>
                  <span id={`modifier${type}Label`}>{view.modifierLabels?.[`modifier${type}`] || `Icon modifier ${type}`}</span>
                  <GlyphPicker idPrefix={`modifier${type}`} labelledBy={`modifier${type}Label`} picker={pickers[`modifier${type}`]} onChange={(value) => store.setModifier(type, value)} />
                </Box>
              ))}
              {!view.frameShapeHidden ? (
                <Box sx={fieldLabel}>
                  <span id="frameShapeLabel">{text("symbol.frameShape")}</span>
                  <GlyphPicker idPrefix="frameShape" labelledBy="frameShapeLabel" picker={pickers.frameShape} onChange={(value) => store.setFrameShape(value)} />
                </Box>
              ) : null}
            </Box>
          ) : null}
          {!view.legacyNoteHidden ? (
            <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: "text.secondary" }}>{view.legacyNote}</Typography>
          ) : null}
        </CardSection>
      ) : null}
    </>
  );
}
