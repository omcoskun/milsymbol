# Studio scale and density implementation plan

> **For agentic workers:** Use superpowers:executing-plans for this small, inline UI adjustment.

**Goal:** Make the editor comfortable at 100% browser zoom on laptops and full-screen monitors without losing legibility on phones.

**Architecture:** Keep the existing CSS grid and SVG renderer. Bound the workspace and preview independently of monitor size; use compact but readable visual choices. Keep rendering/export options separate from preview scaling.

**Tech Stack:** HTML, CSS, vanilla JavaScript, existing Node/tead tests.

**Spec:** The user's November 8 request and the preceding visual review in this chat. The user delegated design decisions and authorized implementation.

## Constraints and decisions

- Preserve the existing uncommitted changes and work in the user's current checkout; do not commit or move their work.
- Preserve symbol semantics, SIDC handling and export dimensions.
- Keep the 14px base font and touch targets; avoid global CSS zoom or shrinking all content.
- Prefer bounded preview height and smaller card whitespace over reverting the new visual designation controls or adding density settings.
- Keep SVG aspect ratios and fit long labels/large symbols into the preview.

## Review focus

- 320px phones: identity glyphs and header text must remain inside their controls.
- 1280×720 laptop: basic APP-6A echelon/country controls should be reachable without the previous excess scrolling.
- 1920/2560 monitors: preview must not grow to fill the entire viewport height.
- Different editions, long text, large symbol size and HQ staff: no clipping or export-size changes due to viewport resizing.
- Light/dark themes, keyboard navigation, tablet layouts and zoom-like narrow viewports: controls remain legible and reachable.

## Task 1: Scale and responsive layout

- [x] Reproduce baseline: 320px identity glyphs exceed available width; preview grows to 601px/961px on tall monitors; country button ends at y=814 on 1280×720.
- [x] Bound workspace to 1840px, preview column to 440px and preview height to 360px; reduce automatic symbol enlargement cap to 1.5.
- [x] Tighten identity/designation cards, section gaps and dark-theme glyph backgrounds while preserving useful detail.
- [x] Fix narrow-phone glyph sizing and header wrapping; explain preview fitting beside the output-size control.
- [x] Rebuild Studio and repeat browser geometry checks plus screenshots at phone, tablet, laptop and large desktop widths.

## Task 2: Verify and review

- [x] Exercise all seven standards, Symbol/Amplifiers/Display, palette, pickers, long labels, size extremes, keyboard use and themes.
- [x] Run npm run lint, npm test, npm run test:node and npm run studio:build; inspect failures rather than hiding them.
- [x] Obtain a fresh review of the final diff; fix actionable regressions.
- [x] Save representative screenshots and summarize actual coverage and remaining limits.

## Verification notes

Visual CSS adjustments are verified against rendered geometry and screenshots rather than brittle tests that assert CSS source strings. Existing behavior tests cover the renderer and exports.


## Results

- Browser checks: 320×740, 375×667, 380×800, 381×800, 390×844, 460×820, 768×1024, 844×390, 900×600, 901×600, 1024×768, 1280×720, 1440×900, 1920×1080 and 2560×1440. No horizontal page overflow, overlapping preview actions, identity glyph overflow, Context/title overlap or clipped SIDC after resizing in the final modern-standard pass.
- All seven standards rendered at desktop size. This is representative coverage, not every symbol × standard × viewport combination or a cross-browser certification.
- APP-6A echelon button ends at y=701 on 1280×720; preview height is capped at 360px on both large-monitor sizes.
- Long amplifier text, 500px HQ staff, symbol-size endpoints (55/170), narrow-screen field-list fallback, light/system-dark themes, keyboard tabs/picker and palette search exercised.
- Additional issues found during verification: Context/title collision on a 320px modern editor, SIDC textarea height not recalculated when resized (39px available vs 60px required), and overlapping mobile download actions with a persistent scrollbar. Reproduced before fixing; repeated checks passed after wrapping the header, adding width-driven textarea fitting and hiding redundant download icons on narrow phones.
- Designation cards retain their container layout on medium-width phones instead of being forced into three tall single-column cards. Boundary checks at widths 440, 460, 1240, 1250, 1260 and 1280 passed.
- npm run lint: passed. npm test: 25,011 passing. npm run test:node: 23 passed. npm run studio:build: passed. git diff --check: passed. Browser warning/error log: empty.
- Fresh read-only review found no actionable defects in the scale changes and confirmed preview CSS does not affect export data. Subsequent narrow-screen fixes verified in the browser and the final checks above.
- Screenshots and geometry results saved under the chat visualization directory. Development server remains on http://127.0.0.1:4173 for user inspection. Work left uncommitted.
