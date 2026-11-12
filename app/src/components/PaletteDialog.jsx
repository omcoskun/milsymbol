// The symbol palette (studio/index.html, #searchPanel): symbol sets, recently
// used symbols and the results, drawn in batches as the list scrolls.
import { memo, useLayoutEffect, useRef } from "react";
import { flushSync } from "react-dom";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import Svg from "./Svg.jsx";
import { ChevronDown, SearchIcon } from "./Icons.jsx";
import { useEditor, useSignal, useStore } from "../hooks.js";
import { useText } from "../i18n.js";
import { tokens } from "../theme.js";

const number = (value) => value.toLocaleString("en-US");
const kbd = { px: 0.6, border: `1px solid ${tokens.lineStrong}`, borderRadius: 1, fontFamily: tokens.mono, fontSize: 12, bgcolor: tokens.panel };

const cardStyles = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 0.75,
  minHeight: 136,
  px: 0.75,
  pt: 1.5,
  pb: 1.25,
  border: `1.5px solid ${tokens.line}`,
  borderRadius: 2,
  bgcolor: tokens.panel,
  textAlign: "center",
  "&:hover, &.Mui-focusVisible": { borderColor: tokens.lineStronger, bgcolor: tokens.surfaceSoft },
  "&.Mui-focusVisible": { outline: `2px solid ${tokens.focus}`, outlineOffset: 1 },
  "&.active": { borderColor: tokens.blue, bgcolor: tokens.softBlue }
};

const SymbolCard = memo(function SymbolCard({ icon, svg, active, inSection }) {
  const store = useStore();
  const text = useText();
  return (
    <ButtonBase
      className={active ? "active" : undefined}
      aria-pressed={active}
      data-symbol-id={icon.id}
      title={icon.categoryOnly ? text("palette.categoryTitle", { name: icon.name }) : icon.name}
      onClick={() => store.chooseSymbol(icon.id)}
      sx={cardStyles}
    >
      <Svg svg={svg} sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 64, px: 0.5, "& svg": { maxWidth: 88, maxHeight: 64 } }} />
      <Box
        component="strong"
        sx={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, overflowWrap: "anywhere", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {icon.name}
        {icon.categoryOnly ? (
          <Box component="span" sx={{ display: "inline-block", ml: 0.5, px: 0.6, py: "1px", border: "1px solid currentColor", borderRadius: 1, fontSize: 12, fontWeight: 500, lineHeight: 1.2, verticalAlign: "middle" }}>
            {text("palette.categoryBadge")}
          </Box>
        ) : null}
      </Box>
      <Box component="small" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1px", maxWidth: "100%", color: "text.secondary", fontSize: 12 }}>
        {inSection ? null : (
          // The set name wraps rather than being cut ("Sea surface track" in a narrow card).
          <Box component="span" className="card-category" sx={{ maxWidth: "100%", overflowWrap: "anywhere", lineHeight: 1.3 }}>
            {icon.category}
          </Box>
        )}
        <Box component="span" sx={{ flex: "none", whiteSpace: "nowrap" }}>
          {icon.code}
        </Box>
      </Box>
    </ButtonBase>
  );
});

function Grid({ icons, selectedId, inSection, label }) {
  const store = useStore();
  return (
    <Box aria-label={label} sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 1.25 }}>
      {icons.map((icon) => (
        <SymbolCard key={icon.id} icon={icon} svg={store.miniSvg(icon)} active={icon.id === selectedId} inSection={inSection} />
      ))}
    </Box>
  );
}

function Results({ palette }) {
  const store = useStore();
  const text = useText();
  if (palette.empty)
    return (
      <Box sx={{ py: 4, textAlign: "center", color: "text.secondary", fontSize: 14 }}>
        {text("palette.empty")}
        <br />
        {text("palette.emptyHint")}
      </Box>
    );
  if (palette.flat) return <Grid icons={palette.flat} selectedId={palette.selectedId} label={text("palette.resultsAria")} />;
  return (
    <Box aria-label={text("palette.resultsAria")} sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
      {palette.grouped.map((section) => {
        const body = (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {section.body.map((part, index) =>
              part.type === "group" ? (
                <Box
                  component="h5"
                  key={`group-${part.branchKey}`}
                  data-key={part.branchKey}
                  sx={{ m: 0, mt: index ? 0.75 : 0, pt: index ? 1 : 0, borderTop: index ? `1px solid ${tokens.lineSoft}` : 0, fontSize: 13, fontWeight: 500, color: "text.primary" }}
                >
                  {part.name}
                </Box>
              ) : (
                <Grid key={`grid-${index}`} icons={part.icons} selectedId={palette.selectedId} inSection />
              )
            )}
          </Box>
        );
        if (!section.name) return <Box key={section.key}>{body}</Box>;
        return (
          <Box
            component="details"
            key={section.key}
            open={section.open}
            data-key={section.branchKey}
            onToggle={(event) => {
              if (event.currentTarget.open !== section.open) store.setSectionOpen(section.key, event.currentTarget.open);
            }}
            sx={{
              borderTop: `1px solid ${tokens.lineSoft}`,
              pt: 1.25,
              "& > summary": { display: "flex", alignItems: "center", gap: 1, cursor: "pointer", listStyle: "none", "&::-webkit-details-marker": { display: "none" } },
              "&[open] > summary": { mb: 1.25 },
              "&:not([open]) > summary .chevron": { transform: "rotate(-90deg)" }
            }}
          >
            <summary>
              <Box component="h4" sx={{ m: 0, fontSize: 14, fontWeight: 600 }}>
                {section.name}
              </Box>
              <Box component="small" sx={{ color: "text.secondary", fontSize: 12 }}>
                {number(section.count)}
              </Box>
              <ChevronDown className="chevron" sx={{ ml: "auto", fontSize: 16, color: "text.secondary", transition: "transform 0.15s" }} />
            </summary>
            {body}
          </Box>
        );
      })}
    </Box>
  );
}

// The dialog's content. It mounts inside the dialog's portal, so its effects
// run once the search box and the list exist.
function PaletteBody({ palette, search }) {
  const store = useStore();
  const text = useText();
  const { state } = useEditor();
  const results = useRef(null);

  // Keep loading while the end of the list is within 400 px of the visible
  // area, so scrolling never reaches a gap and tall windows fill on open.
  const fill = () => {
    const list = results.current;
    if (!list || !store.getSnapshot().palette?.more) return;
    if (list.scrollHeight - list.scrollTop - list.clientHeight < 400) store.loadMore();
  };
  useLayoutEffect(fill);

  useSignal("focusSearch", ({ select }) => {
    search.current?.focus();
    if (select) search.current?.select();
  });
  useSignal("paletteTop", () => {
    results.current.scrollTop = 0;
  });
  useSignal("paletteScrollTo", ({ key }) => {
    const target = [...results.current.querySelectorAll("[data-key]")].find((element) => element.dataset.key === key);
    target?.scrollIntoView({ block: "start" });
  });

  const visibleCards = () => [...results.current.querySelectorAll("[data-symbol-id]")].filter((item) => item.offsetParent !== null);
  // Arrows move between cards; cards in a closed section are skipped. At the
  // last loaded card the next batch loads first.
  function moveCard(card, step) {
    let cards = visibleCards();
    const index = cards.indexOf(card);
    if (index < 0) return;
    if (step > 0 && index === cards.length - 1) {
      let loaded = false;
      flushSync(() => {
        loaded = store.loadMore();
      });
      if (loaded) cards = visibleCards();
    }
    const next = cards[index + step];
    if (next) next.focus();
    else if (step < 0) search.current?.focus();
  }

  return (
    <>
        <Box component="header" sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 1.25, rowGap: 0.5, px: 2, pt: 1.5 }}>
          <Box component="h2" id="searchTitle" sx={{ m: 0, fontSize: 14, fontWeight: 600 }}>
            {text("palette.title")}
          </Box>
          <Box component="span" sx={{ color: "text.secondary", fontSize: 12 }}>
            {text("palette.subtitle")}
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minHeight: 56, px: 1.75, borderBottom: 1, borderColor: "divider", color: tokens.blue }}>
          <SearchIcon sx={{ fontSize: 18 }} />
          <Box
            component="input"
            ref={search}
            id="symbolSearch"
            type="search"
            aria-label={text("palette.searchAria")}
            placeholder={text("palette.searchPlaceholder")}
            autoComplete="off"
            value={state.search}
            onChange={(event) => store.setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                visibleCards()[0]?.focus();
              } else if (event.key === "Enter") {
                event.preventDefault();
                store.chooseFirst();
              }
            }}
            sx={{ flex: 1, minWidth: 0, border: 0, p: 0, fontSize: 16, color: "text.primary", outline: "none", font: "inherit", bgcolor: "transparent", "&::-webkit-search-cancel-button": { display: "none" } }}
            style={{ fontSize: 16 }}
          />
          {state.search ? (
            <ButtonBase aria-label={text("palette.clearAria")} title={text("palette.clearTitle")} onClick={() => store.clearSearch()} sx={{ width: 28, height: 28, borderRadius: 1, fontSize: 20, color: "text.secondary" }}>
              ×
            </ButtonBase>
          ) : null}
          <ButtonBase aria-label={text("palette.closeAria")} onClick={() => store.closeSearch()} sx={{ minHeight: 26, px: 1, border: `1px solid ${tokens.lineStrong}`, borderRadius: 1, fontFamily: tokens.mono, fontSize: 12, color: "text.secondary" }}>
            {text("palette.esc")}
          </ButtonBase>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "230px minmax(0, 1fr)" }, minHeight: 0, flex: 1 }}>
          <Box
            component="nav"
            aria-label={text("palette.setsAria")}
            sx={{
              display: "flex",
              flexDirection: { xs: "row", sm: "column" },
              gap: "2px",
              p: "10px 8px",
              borderRight: { sm: `1px solid ${tokens.lineSoft}` },
              borderBottom: { xs: `1px solid ${tokens.lineSoft}`, sm: 0 },
              bgcolor: tokens.surfaceFaint,
              overflowX: { xs: "auto", sm: "hidden" },
              overflowY: { xs: "hidden", sm: "auto" },
              maxHeight: { sm: "calc(100dvh - 150px)" }
            }}
          >
            {palette.categories.map((category) => {
              const pressed = category.value === palette.category;
              return (
                <ButtonBase
                  key={category.value}
                  aria-pressed={pressed}
                  onClick={() => store.setCategory(category.value)}
                  sx={{
                    flex: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                    minHeight: 34,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 1.5,
                    textAlign: "left",
                    fontSize: 14,
                    whiteSpace: { xs: "nowrap", sm: "normal" },
                    fontWeight: pressed ? 600 : 400,
                    color: pressed ? tokens.blueDark : "text.primary",
                    bgcolor: pressed ? tokens.tagBlue : "transparent",
                    "&:hover": { bgcolor: pressed ? tokens.tagBlue : tokens.surfaceMuted }
                  }}
                >
                  <span>{category.label}</span>
                  <Box component="small" sx={{ color: "text.secondary", fontSize: 12, fontWeight: 400 }}>
                    {number(category.count)}
                  </Box>
                </ButtonBase>
              );
            })}
          </Box>
          <Box
            ref={results}
            id="searchResults"
            onScroll={fill}
            onKeyDown={(event) => {
              const card = event.target.closest?.("[data-symbol-id]");
              if (!card) return;
              if (["ArrowDown", "ArrowRight"].includes(event.key)) {
                event.preventDefault();
                moveCard(card, 1);
              } else if (["ArrowUp", "ArrowLeft"].includes(event.key)) {
                event.preventDefault();
                moveCard(card, -1);
              }
            }}
            sx={{ display: "flex", flexDirection: "column", gap: 1.5, minHeight: 0, maxHeight: "calc(100dvh - 150px)", overflowY: "auto", px: 2, pt: 1.75, pb: 2 }}
          >
            {palette.recent.length ? (
              <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box component="h3" sx={{ m: 0, color: "text.secondary", fontSize: 12, fontWeight: 600 }}>
                  {text("palette.recent")}
                </Box>
                <Grid icons={palette.recent} selectedId={palette.selectedId} />
              </Box>
            ) : null}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box component="h3" sx={{ m: 0, color: "text.secondary", fontSize: 12, fontWeight: 600 }}>
                {palette.heading}
              </Box>
              <Box component="span" role="status" aria-label={text("palette.countAria")} sx={{ fontSize: 12, bgcolor: tokens.surfaceMuted, borderRadius: 1, px: 1, py: 0.25, color: "text.secondary" }}>
                {number(palette.count)}
              </Box>
            </Box>
            <Results palette={palette} />
            {palette.status ? (
              <Box component="p" sx={{ m: 0, alignSelf: "center", color: "text.secondary", fontSize: 12 }}>
                {palette.status}
              </Box>
            ) : null}
          </Box>
        </Box>
        <Box component="footer" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 2.25, rowGap: 1, px: 2, py: 1.25, borderTop: `1px solid ${tokens.lineSoft}`, bgcolor: tokens.surfaceFaint, color: "text.secondary", fontSize: 12 }}>
          <span>
            <Box component="kbd" sx={kbd}>↑</Box> <Box component="kbd" sx={kbd}>↓</Box> {text("palette.move")}
          </span>
          <span>
            <Box component="kbd" sx={kbd}>Enter</Box> {text("palette.select")}
          </span>
          <span>
            <Box component="kbd" sx={kbd}>Esc</Box> {text("palette.clearClose")}
          </span>
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: { sm: "auto" } }}>
            {text("palette.note")}
          </Box>
        </Box>
    </>
  );
}

export default function PaletteDialog() {
  const store = useStore();
  const { state, palette } = useEditor();
  const search = useRef(null);
  // The last palette stays drawn while the dialog closes.
  const last = useRef(palette);
  if (palette) last.current = palette;
  const open = state.searchOpen && Boolean(palette);
  return (
    <Dialog
      open={open}
      onClose={() => store.closeSearch()}
      disableEscapeKeyDown
      disableRestoreFocus
      maxWidth={false}
      aria-labelledby="searchTitle"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        if (document.activeElement === search.current && store.getSnapshot().state.search) store.clearSearch();
        else store.closeSearch();
      }}
      slotProps={{
        backdrop: { sx: { bgcolor: "#17222e4d" } },
        paper: {
          id: "searchPanel",
          sx: {
            position: "absolute",
            top: 10,
            m: 0,
            display: "flex",
            flexDirection: "column",
            lineHeight: "normal",
            width: { xs: "calc(100vw - 24px)", md: "min(1240px, calc(100vw - 48px))" },
            maxWidth: "none",
            maxHeight: "calc(100dvh - 20px)",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 18px 48px #17222e38, 0 2px 8px #17222e1f"
          }
        }
      }}
    >
      {last.current ? <PaletteBody palette={last.current} search={search} /> : null}
    </Dialog>
  );
}
