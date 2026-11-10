// The List view of the Amplifiers tab: filters, the groups of text fields with
// their tools, Q and AJ, the help line and the fields that do not apply
// (studio/index.html, #textList and #unavailableFields).
import { Fragment, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import { FieldCode } from "./Section.jsx";
import { SearchIcon } from "./Icons.jsx";
import { modifierGroups, textModifiers, graphicAmplifiers } from "../editor/store.js";
import { useEditor, useSignal, useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { tokens } from "../theme.js";

const visuallyHidden = { position: "absolute", width: "1px", height: "1px", p: 0, m: "-1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };
const control = {
  flex: 1,
  minWidth: 0,
  minHeight: 36,
  px: 1.1,
  border: `1px solid ${tokens.lineStrong}`,
  borderRadius: 1.5,
  bgcolor: tokens.panel,
  color: "text.primary",
  font: "inherit",
  fontSize: 14,
  "&:focus": { outline: `2px solid ${tokens.focus}`, outlineOffset: 1, borderColor: tokens.blue },
  "&:disabled": { bgcolor: tokens.surfaceSoft, color: tokens.disabled }
};
const tool = { flex: "none", minHeight: 36, px: 1.1, py: 0.25, fontSize: 12, whiteSpace: "nowrap", borderColor: tokens.lineStrong, color: "text.primary" };
const smallLabel = { display: "flex", flexDirection: "column", gap: 0.375, minWidth: 0, fontSize: 12, fontWeight: 500, color: "text.secondary" };

function Options({ list }) {
  return list.map((item) => (
    <option key={item.value} value={item.value} title={item.title} disabled={item.disabled}>
      {item.label}
    </option>
  ));
}

// J: the reliability and credibility scales; a value is written once both are chosen.
function RatingHelper({ id }) {
  const store = useStore();
  const text = useText();
  const { view } = useEditor();
  const [parts, setParts] = useState({ reliability: "", credibility: "" });
  const choose = (part, value) => {
    const next = { ...parts, [part]: value };
    setParts(next);
    store.setRating(next.reliability, next.credibility);
  };
  return (
    <Box id={id} sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 0.75 }}>
      {[
        ["reliability", text("text.reliability")],
        ["credibility", text("text.credibility")]
      ].map(([part, caption]) => (
        <Box component="label" key={part} sx={smallLabel}>
          <span>{caption}</span>
          <Box component="select" data-rating-part={part} value={parts[part]} onChange={(event) => choose(part, event.target.value)} sx={control}>
            <option value="">{text("text.choose")}</option>
            {view.ratingScales[part].map(([code, meaning]) => (
              <option key={code} value={code}>
                {code} — {meaning}
              </option>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// AO "A:BBB-CC" (APP-6D) from three lists, the stage first.
function EngagementBuilder({ ao }) {
  const store = useStore();
  const text = useText();
  const part = (name, caption) => (
    <Box component="label" sx={smallLabel}>
      <span>{caption}</span>
      <Box component="select" data-ao-part={name} value={ao.parts[name].value} disabled={ao.parts[name].disabled} onChange={(event) => store.setEngagementPart(name, event.target.value)} sx={control}>
        <Options list={ao.parts[name].options} />
      </Box>
    </Box>
  );
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 1 }}>
      {part("b", text("text.aoStage"))}
      {part("a", text("text.aoEngaged"))}
      {part("c", text("text.aoWeapon"))}
      <Box component="p" sx={{ gridColumn: "1 / -1", m: 0, fontFamily: tokens.mono, fontSize: 12, color: ao.preview.problem ? tokens.danger : "text.secondary" }}>
        {ao.preview.text}
      </Box>
    </Box>
  );
}

function EngagementReference() {
  const { view } = useEditor();
  const reference = view.engagementReference;
  return (
    <Box component="details" sx={{ fontSize: 12, color: "text.secondary", "& summary": { cursor: "pointer", width: "fit-content" } }}>
      <summary>{reference.title}</summary>
      <Box component="dl" sx={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "2px 10px", my: 1, "& dt": { fontFamily: tokens.mono, fontWeight: 600, color: "text.primary" }, "& dd": { m: 0 } }}>
        {reference.rows.map(([code, meaning]) => (
          <Fragment key={code}>
            <dt>{code}</dt>
            <dd>{meaning}</dd>
          </Fragment>
        ))}
      </Box>
      <p style={{ margin: 0 }}>{reference.note}</p>
    </Box>
  );
}

function TextFieldRow({ field }) {
  const store = useStore();
  const text = useText();
  const { controls, disabled, lists, state, ui, view } = useEditor();
  const [rating, setRating] = useState(false);
  const input = useRef(null);
  const info = view.textFields[field.key];
  const ao = info.ao;
  const composite = Boolean(ao && ao.composite);
  const focused = state.focusField === field.key;
  const type = field.key === "engagementBar" ? textModifiers.find((item) => item.key === "engagementType") : null;
  const typeInfo = type && view.textFields.engagementType;
  const described = `about-${field.id} warn-${field.id}`;
  return (
    <Box
      data-field-wrapper={field.key}
      hidden={info.hidden}
      onFocus={() => store.setFocusField(field.key)}
      sx={{ display: info.hidden ? "none" : "flex", flexDirection: "column", gap: 0.625, minWidth: 0, ...(composite ? { gridColumn: "1 / -1" } : {}) }}
    >
      <Box component="label" htmlFor={field.id} sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0, fontSize: 12, fontWeight: 500 }}>
        <FieldCode>{info.code}</FieldCode>
        <Box component="span" sx={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: focused ? tokens.blueDark : "inherit" }}>
          {info.label}
        </Box>
        <Box component="span" aria-hidden="true" sx={{ flex: "none", fontFamily: tokens.mono, fontWeight: 400, color: info.countFull ? "text.primary" : "text.secondary", visibility: focused || info.filled ? "visible" : "hidden" }}>
          {info.count}
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 0.75, minWidth: 0 }}>
        {field.choices ? (
          <Box component="select" id={field.id} ref={input} aria-describedby={described} value={controls[field.id]} disabled={disabled[field.id]} onChange={(event) => store.setTextField(field.key, event.target.value)} sx={control}>
            <Options list={lists[field.id]} />
          </Box>
        ) : (
          <Box
            component="input"
            id={field.id}
            ref={input}
            hidden={composite}
            autoComplete="off"
            spellCheck={false}
            aria-describedby={described}
            maxLength={info.maxLength > 0 ? info.maxLength : undefined}
            placeholder={info.placeholder}
            list={info.datalist ? `${field.id}-choices` : undefined}
            value={controls[field.id]}
            disabled={disabled[field.id]}
            onChange={(event) => store.setTextField(field.key, event.target.value)}
            sx={{ ...control, display: composite ? "none" : undefined }}
          />
        )}
        {info.datalist ? (
          <datalist id={`${field.id}-choices`}>
            {info.datalist.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </datalist>
        ) : null}
        {field.key === "dtg" ? (
          <Button
            variant="outlined"
            size="small"
            title={text("text.nowTitle")}
            sx={tool}
            onClick={() => {
              store.fillDtgNow();
              input.current?.focus();
            }}
          >
            {text("text.now")}
          </Button>
        ) : null}
        {field.key === "evaluationRating" ? (
          <Button
            variant="outlined"
            size="small"
            aria-expanded={rating}
            aria-controls={`rating-${field.id}`}
            title={text("text.ratingTitle")}
            onClick={() => setRating(!rating)}
            sx={{ ...tool, ...(rating ? { borderColor: tokens.blue, bgcolor: tokens.softBlue, color: tokens.blueDark } : {}) }}
          >
            {text("text.ratingButton")}
          </Button>
        ) : null}
      </Box>
      {field.key === "evaluationRating" && rating ? <RatingHelper key={ui.resetCount} id={`rating-${field.id}`} /> : null}
      {composite ? <EngagementBuilder ao={ao} /> : null}
      {ao && !composite && ao.reference ? <EngagementReference /> : null}
      {type && !typeInfo.hidden ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 12, fontWeight: 500 }}>
          <label htmlFor={type.id}>{text("text.barColour")}</label>
          <Box
            component="select"
            id={type.id}
            aria-describedby={`about-${type.id}`}
            value={controls[type.id]}
            disabled={disabled[type.id]}
            onChange={(event) => store.setTextField("engagementType", event.target.value)}
            sx={{ ...control, flex: "none", minHeight: 32 }}
          >
            <Options list={lists[type.id]} />
          </Box>
          <Box component="span" id={`about-${type.id}`} sx={visuallyHidden}>
            {text("text.barColourAbout")}
          </Box>
        </Box>
      ) : null}
      <Box component="span" id={`about-${field.id}`} sx={visuallyHidden}>
        {info.about}
      </Box>
      <Box
        id={`warn-${field.id}`}
        hidden={!info.warnings.length}
        sx={{ display: info.warnings.length ? "block" : "none", color: tokens.warn, bgcolor: tokens.warnBg, borderRadius: 1.5, px: 0.875, py: 0.5, fontSize: 12, lineHeight: 1.45 }}
      >
        {info.warnings.join(" ")}
      </Box>
    </Box>
  );
}

// Q (direction of movement) and AJ (speed leader): renderer options, not text.
function GraphicRows() {
  const store = useStore();
  const text = useText();
  const { controls, disabled, view } = useEditor();
  const [draft, setDraft] = useState(null);
  const label = (htmlFor, key) => {
    const definition = graphicAmplifiers.find((item) => item.key === key);
    return (
      <Box component="label" htmlFor={htmlFor} sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12, fontWeight: 500 }}>
        <FieldCode>{definition.field}</FieldCode>
        <span>{definition.label}</span>
      </Box>
    );
  };
  const direction = view.graphicFields.direction;
  const speed = view.graphicFields.speedLeader;
  return (
    <>
      <Box data-field-wrapper="direction" hidden={direction.hidden} onFocus={() => store.setFocusField("direction")} sx={{ display: direction.hidden ? "none" : "flex", flexDirection: "column", gap: 0.625, gridColumn: "1 / -1" }}>
        {label("directionNumber", "direction")}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, maxWidth: 460 }}>
          <input
            id="direction"
            type="range"
            min={-1}
            max={360}
            aria-label={text("text.directionAria")}
            aria-describedby="about-direction"
            disabled={disabled.direction}
            value={controls.direction}
            onChange={(event) => store.setControl("direction", event.target.value)}
            style={{ flex: 1, accentColor: tokens.blue }}
          />
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
            <Box
              component="input"
              id="directionNumber"
              type="number"
              min={0}
              max={360}
              step={1}
              placeholder={text("text.off")}
              aria-describedby="about-direction"
              disabled={disabled.directionNumber}
              value={draft ?? view.directionNumber}
              onChange={(event) => {
                setDraft(event.target.value);
                store.setDirectionText(event.target.value);
              }}
              onBlur={() => setDraft(null)}
              sx={{ ...control, flex: "none", width: 84 }}
            />
            <span aria-hidden="true">{text("text.degrees")}</span>
          </Box>
          {!view.directionOffHidden ? (
            <Button variant="outlined" size="small" sx={tool} onClick={() => store.directionOff()}>
              {text("text.off")}
            </Button>
          ) : null}
        </Box>
        <Box component="span" id="about-direction" sx={visuallyHidden}>
          {direction.about}
        </Box>
      </Box>
      <Box data-field-wrapper="speedLeader" hidden={speed.hidden} onFocus={() => store.setFocusField("speedLeader")} sx={{ display: speed.hidden ? "none" : "flex", flexDirection: "column", gap: 0.625 }}>
        {label("speedLeader", "speedLeader")}
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
          <Box
            component="input"
            id="speedLeader"
            type="number"
            min={0}
            max={500}
            aria-describedby="about-speedLeader"
            disabled={disabled.speedLeader}
            value={controls.speedLeader}
            onChange={(event) => store.setControl("speedLeader", event.target.value)}
            sx={{ ...control, flex: "none", width: 100 }}
          />
          <span aria-hidden="true">{text("text.px")}</span>
        </Box>
        <Box component="span" id="about-speedLeader" sx={visuallyHidden}>
          {speed.about}
        </Box>
      </Box>
    </>
  );
}

export default function TextList({ hidden }) {
  const store = useStore();
  const text = useText();
  const { state, view } = useEditor();
  const filter = useRef(null);
  const groups = useRef(null);

  useSignal("focusFieldFilter", () => filter.current?.focus());
  useSignal("focusDirection", () => document.getElementById("directionNumber")?.focus());
  // Open a field: scroll to it and focus it, or the stage list of a composed AO.
  useSignal(
    "focusField",
    ({ key, composite }) => {
      const wrapper = groups.current?.querySelector(`[data-field-wrapper="${key}"]`);
      if (!wrapper) return;
      wrapper.scrollIntoView({ block: "center" });
      const target = composite ? wrapper.querySelector('[data-ao-part="b"]') : wrapper.querySelector("input:not([type=range]), select");
      target?.focus({ preventScroll: true });
    },
    !hidden
  );

  const filters = view.listFilters;
  return (
    <Box sx={{ display: hidden ? "none" : "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
        <Box
          component="label"
          sx={{ flex: "1 1 220px", display: "flex", alignItems: "center", gap: 0.75, minHeight: 34, px: 1.1, border: `1px solid ${tokens.lineStrong}`, borderRadius: 1.5, "&:focus-within": { outline: `2px solid ${tokens.focus}`, outlineOffset: 1 } }}
        >
          <Box component="span" sx={visuallyHidden}>
            {text("text.findField")}
          </Box>
          <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Box
            component="input"
            ref={filter}
            id="fieldFilter"
            type="search"
            placeholder={text("text.findPlaceholder")}
            autoComplete="off"
            spellCheck={false}
            aria-controls="app6aTextFields"
            value={state.fieldQuery}
            onChange={(event) => store.setFieldQuery(event.target.value)}
            sx={{ flex: 1, minWidth: 0, border: 0, outline: "none", font: "inherit", fontSize: 14, bgcolor: "transparent" }}
          />
        </Box>
        <Button
          variant="outlined"
          size="small"
          aria-pressed={filters.filledOnly}
          aria-controls="app6aTextFields"
          onClick={() => store.toggleFilledOnly()}
          sx={{ minHeight: 32, borderColor: filters.filledOnly ? tokens.blue : tokens.lineStrong, bgcolor: filters.filledOnly ? tokens.softBlue : "transparent", color: filters.filledOnly ? tokens.blueDark : "text.primary" }}
        >
          {filters.filledOnlyLabel}
        </Button>
      </Box>
      {filters.status ? (
        <Box component="p" role="status" sx={{ m: 0, color: "text.secondary", fontSize: 12 }}>
          {filters.status}{" "}
          <ButtonBase onClick={() => store.clearFilters()} sx={{ font: "inherit", color: tokens.blue, textDecoration: "underline", verticalAlign: "baseline" }}>
            {text("text.showAll")}
          </ButtonBase>
        </Box>
      ) : null}
      <Box id="app6aTextFields" ref={groups} sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
        {modifierGroups.map((group, index) => (
          <Box
            component="section"
            key={group.label}
            aria-labelledby={`group-${index}`}
            hidden={view.groupHidden[index]}
            sx={{ display: view.groupHidden[index] ? "none" : "flex", flexDirection: "column", gap: 1.25 }}
          >
            <Box component="h4" id={`group-${index}`} sx={{ m: 0, pb: 0.75, borderBottom: `1px solid ${tokens.lineSoft}`, color: "text.secondary", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {group.label}
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))", gap: "12px 14px" }}>
              {group.fields
                .filter((field) => field.key !== "engagementType")
                .map((field) => (
                  <TextFieldRow key={field.key} field={field} />
                ))}
              {group.fields.some((field) => field.key === "speed") ? <GraphicRows /> : null}
            </Box>
          </Box>
        ))}
      </Box>
      <Box
        aria-hidden="true"
        sx={{ position: "sticky", bottom: 8, zIndex: 2, display: "flex", flexDirection: "column", gap: "2px", height: 64, px: 1.5, py: 1, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: tokens.surfaceFaint, color: "text.secondary", fontSize: 12, lineHeight: "18px" }}
      >
        {view.listHelp ? (
          <>
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", color: "text.primary" }}>
              <FieldCode>{view.listHelp.code}</FieldCode>
              <Box component="strong" sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
                {view.listHelp.name}
              </Box>
              {view.listHelp.count ? (
                <Box component="span" sx={{ ml: 1.25, fontFamily: tokens.mono, color: "text.secondary" }}>
                  {view.listHelp.count}
                </Box>
              ) : null}
            </Box>
            <Box component="span" title={view.listHelp.text} sx={{ display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}>
              {view.listHelp.text}
            </Box>
          </>
        ) : (
          <>
            <Box component="span" sx={{ color: "text.primary" }}>
              {text("text.listHelpTitle")}
            </Box>
            <span>{text("text.listHelpText")}</span>
          </>
        )}
      </Box>
    </Box>
  );
}

// Fields of this edition that do not apply to the symbol, and graphics the
// edition defines that this editor cannot set.
export function UnavailableFields() {
  const text = useText();
  const { view } = useEditor();
  const unavailable = view.unavailable;
  if (unavailable.hidden) return null;
  const list = (rows) => (
    <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
      {rows.map((row) => (
        <Box
          component="li"
          key={`${row.field}|${row.label}`}
          title={row.title}
          sx={{ display: "grid", gridTemplateColumns: "34px minmax(0, 0.9fr) minmax(0, 1.4fr)", alignItems: "baseline", gap: "4px 8px", py: 0.5, borderBottom: `1px solid ${tokens.lineSoft}`, color: "text.secondary" }}
        >
          <FieldCode sx={{ color: "text.secondary", bgcolor: tokens.surfaceMuted }}>{row.field}</FieldCode>
          <span>{row.label}</span>
          <span>{row.reason}</span>
        </Box>
      ))}
    </Box>
  );
  const heading = (title) => (
    <Box component="h5" sx={{ m: "4px 0 0", color: "text.secondary", fontSize: 12, fontWeight: 600 }}>
      {title}
    </Box>
  );
  return (
    <Box component="details" sx={{ fontSize: 12, "& summary": { width: "fit-content", color: "text.secondary", fontWeight: 500, cursor: "pointer", "&:hover": { color: tokens.blue } } }}>
      <summary>{unavailable.summary}</summary>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 1 }}>
        {unavailable.notHere.length ? (
          <>
            {heading(unavailable.notHereTitle)}
            {list(unavailable.notHere)}
          </>
        ) : null}
        {unavailable.gaps.length ? (
          <>
            {heading(text("text.gapsTitle"))}
            {list(unavailable.gaps)}
          </>
        ) : null}
      </Box>
    </Box>
  );
}
