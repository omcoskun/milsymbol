// Where an information box opens: under its button, or over it when the space below
// runs out, and always inside the screen.
export function popoverPosition({ anchor, box, width, height, gap = 8, margin = 12 }) {
  const left = Math.max(margin, Math.min(anchor.left, width - box.width - margin));
  const below = anchor.bottom + gap;
  const top = below + box.height <= height - margin ? below : Math.max(margin, anchor.top - box.height - gap);
  return { left, top: Math.max(margin, Math.min(top, height - box.height - margin)) };
}

// How long the pointer rests on an (i) button before its box opens, and how long the
// box waits after the pointer leaves it and its button, so it can cross the gap between.
export const hoverDelays = { open: 120, close: 200 };

// A mouse pointer on the button opens the box, and leaving the button and the box closes
// it. A click on a box the pointer opened keeps it open; touch and keys work as before.
function openOnHover(popover, button) {
  let timer = 0;
  let hovered = false;
  const mouse = (event) => event.pointerType === "mouse";
  const isOpen = () => popover.matches(":popover-open");
  const later = (action, delay) => {
    clearTimeout(timer);
    timer = setTimeout(action, delay);
  };
  const leave = (event) => {
    if (!mouse(event)) return;
    if (!isOpen()) clearTimeout(timer);
    else if (hovered) later(() => popover.hidePopover(), hoverDelays.close);
  };
  button.addEventListener("pointerenter", (event) => {
    if (!mouse(event)) return;
    clearTimeout(timer);
    if (isOpen()) return;
    later(() => {
      hovered = true;
      popover.showPopover();
    }, hoverDelays.open);
  });
  button.addEventListener("pointerleave", leave);
  popover.addEventListener("pointerenter", (event) => {
    if (mouse(event)) clearTimeout(timer);
  });
  popover.addEventListener("pointerleave", leave);
  button.addEventListener("click", (event) => {
    clearTimeout(timer);
    // A cancelled click skips the popovertarget toggle, which would close the box.
    if (hovered && isOpen()) event.preventDefault();
    hovered = false;
  });
  popover.addEventListener("toggle", (event) => {
    if (event.newState === "closed") {
      clearTimeout(timer);
      hovered = false;
    }
  });
}

function anchorTo(popover, button) {
  popover.addEventListener("beforetoggle", (event) => {
    button.setAttribute("aria-expanded", String(event.newState === "open"));
    if (event.newState === "open") requestAnimationFrame(() => place(popover, button));
  });
}

function place(popover, button) {
  const { left, top } = popoverPosition({
    anchor: button.getBoundingClientRect(),
    box: popover.getBoundingClientRect(),
    width: document.documentElement.clientWidth,
    height: window.innerHeight
  });
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

// Each [data-info] element holds the notes of one section. They move into a box built
// from #infoTemplate, so the page keeps its references to them. Native popovers handle
// outside clicks, Escape and keyboard navigation.
export function setupInfoPopovers() {
  const template = document.getElementById("infoTemplate");
  for (const holder of document.querySelectorAll("[data-info]")) {
    const id = `${holder.dataset.info}Info`;
    const title = holder.dataset.infoTitle;
    const parts = template.content.cloneNode(true);
    const button = parts.querySelector(".standard-info-button");
    const popover = parts.querySelector(".info-popover");
    const heading = parts.querySelector("strong");
    const close = parts.querySelector(".info-close");
    button.setAttribute("popovertarget", id);
    button.setAttribute("aria-label", `About ${title.toLowerCase()}`);
    button.setAttribute("aria-expanded", "false");
    popover.id = id;
    popover.setAttribute("aria-labelledby", `${id}Title`);
    heading.id = `${id}Title`;
    heading.textContent = title;
    close.setAttribute("popovertarget", id);
    close.setAttribute("aria-label", `Close ${title.toLowerCase()} information`);
    parts.querySelector(".info-popover-body").append(...holder.childNodes);
    holder.append(parts);
    anchorTo(popover, button);
    openOnHover(popover, button);
  }
  const openBox = () => document.querySelector(".info-popover:popover-open");
  window.addEventListener("resize", () => {
    const popover = openBox();
    if (popover) place(popover, popover.previousElementSibling);
  });
  document.addEventListener("scroll", (event) => {
    const popover = openBox();
    if (popover && !popover.contains(event.target)) popover.hidePopover();
  }, true);
}
