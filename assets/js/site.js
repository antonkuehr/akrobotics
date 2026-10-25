"use strict";
document.documentElement.classList.add("js");

// Inclusive calendar months, with ongoing periods refreshed on each visit.
const durationToday = new Date();
for (const label of document.querySelectorAll("[data-duration-start]")) {
  const [year, month] = label.dataset.durationStart.split("-").map(Number);
  const ongoingMonths = Math.max(
    0,
    (durationToday.getFullYear() - year) * 12 +
      durationToday.getMonth() +
      1 -
      month +
      1,
  );
  const total =
    ongoingMonths + Number(label.dataset.durationCompletedMonths || 0);
  if (total < 1) continue;
  const years = Math.floor(total / 12);
  const months = total % 12;
  label.textContent =
    [
      years ? `${years} ${years === 1 ? "yr" : "yrs"}` : "",
      months ? `${months} ${months === 1 ? "mo" : "mos"}` : "",
    ]
      .filter(Boolean)
      .join(" ") + (label.dataset.durationCompletedMonths ? " total" : "");
}

const menuButton = document.querySelector(".menu-button");
const navigation = document.getElementById("site-nav");
function setMenu(open) {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.innerHTML = open
    ? 'Close <span aria-hidden="true">−</span>'
    : 'Menu <span aria-hidden="true">＋</span>';
  navigation.classList.toggle("open", open);
}
menuButton?.addEventListener("click", () =>
  setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
);
navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton?.getAttribute("aria-expanded") === "true"
  ) {
    setMenu(false);
    menuButton.focus();
  }
});
// Measure intrinsic desktop widths so font loading and zoom cannot wrap the links.
const header = navigation?.closest(".header-inner");
const skinDate = document.querySelector(".skin-project-date");
function updateResponsiveLayout() {
  if (header && navigation) {
    const probe = navigation.cloneNode(true);
    probe.removeAttribute("id");
    probe.className = "nav-fit-probe";
    probe.setAttribute("aria-hidden", "true");
    probe.inert = true;
    document.body.append(probe);
    const requiredWidth =
      probe.getBoundingClientRect().width +
      header.querySelector(".wordmark").getBoundingClientRect().width +
      28;
    probe.remove();
    const mobile =
      window.matchMedia("(max-width: 800px)").matches ||
      requiredWidth > header.clientWidth;
    if (mobile !== header.classList.contains("nav-mobile")) setMenu(false);
    header.classList.toggle("nav-mobile", mobile);
  }
  if (skinDate) {
    const probe = skinDate.cloneNode(true);
    probe.classList.remove("date-compact");
    probe.classList.add("date-fit-probe");
    probe.style.whiteSpace = "nowrap";
    probe.setAttribute("aria-hidden", "true");
    skinDate.parentElement.append(probe);
    const compact =
      probe.getBoundingClientRect().width > skinDate.parentElement.clientWidth;
    probe.remove();
    skinDate.classList.toggle("date-compact", compact);
  }
}
updateResponsiveLayout();
window.addEventListener("resize", updateResponsiveLayout);
document.fonts?.ready.then(updateResponsiveLayout);
if ("ResizeObserver" in window) {
  let layoutFrame;
  const layoutObserver = new ResizeObserver(() => {
    if (layoutFrame != null) return;
    layoutFrame = requestAnimationFrame(() => {
      layoutFrame = null;
      updateResponsiveLayout();
    });
  });
  if (header) layoutObserver.observe(header);
  if (skinDate) layoutObserver.observe(skinDate.parentElement);
}

// Follow the actual button row, including font loading and responsive wrapping.
const heroCopy = document.querySelector(".hero-copy");
const heroGrid = heroCopy?.closest(".hero-grid");
const heroActions = heroCopy?.querySelector(".actions");
const heroButtons = heroActions
  ? [...heroActions.querySelectorAll(".button")]
  : [];
const exploreButton = heroActions?.querySelector('a[href="#portfolio"]');
if (heroCopy && exploreButton && heroButtons.length) {
  function updateHeroTextWidth() {
    // Centre the visible group, without leaving an empty strip beside the buttons.
    if (heroGrid) {
      const gap = parseFloat(getComputedStyle(heroActions).columnGap) || 0;
      const rowWidth = `${Math.ceil(
        heroButtons.reduce(
          (sum, button) => sum + button.getBoundingClientRect().width,
          0,
        ) +
          gap * (heroButtons.length - 1),
      )}px`;
      if (heroGrid.style.getPropertyValue("--hero-copy-width") !== rowWidth)
        heroGrid.style.setProperty("--hero-copy-width", rowWidth);
    }
    const first = heroButtons[0].getBoundingClientRect();
    const explore = exploreButton.getBoundingClientRect();
    const sameRow = explore.top < first.bottom && explore.bottom > first.top;
    const width = sameRow
      ? `${Math.min(heroCopy.clientWidth, explore.right - heroCopy.getBoundingClientRect().left)}px`
      : "100%";
    if (heroCopy.style.getPropertyValue("--hero-text-width") !== width)
      heroCopy.style.setProperty("--hero-text-width", width);
    // Match the desktop circle to the text block; mobile keeps its CSS size.
    if (heroGrid) {
      const size = `${Math.min(340, heroCopy.getBoundingClientRect().height)}px`;
      if (heroGrid.style.getPropertyValue("--hero-portrait-size") !== size)
        heroGrid.style.setProperty("--hero-portrait-size", size);
    }
  }
  updateHeroTextWidth();
  document.fonts?.ready.then(updateHeroTextWidth);
  if ("ResizeObserver" in window) {
    let heroTextFrame;
    const heroTextObserver = new ResizeObserver(() => {
      if (heroTextFrame != null) return;
      heroTextFrame = requestAnimationFrame(() => {
        heroTextFrame = null;
        updateHeroTextWidth();
      });
    });
    heroTextObserver.observe(heroCopy);
    heroTextObserver.observe(heroActions);
    heroButtons.forEach((button) => heroTextObserver.observe(button));
  } else window.addEventListener("resize", updateHeroTextWidth);
}

// Carry the homepage name into the navbar using one SVG at every screen size.
const heroName = document.getElementById("hero-name");
const wordmark = document.querySelector(".wordmark");
const stickyHeader = document.querySelector(".site-header");
const headerInner = stickyHeader?.querySelector(".header-inner");
const headerScroll = stickyHeader?.querySelector(".header-scroll");
if (heroName && wordmark && stickyHeader) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const heroLogo = heroName.querySelector(".hero-logo");
  const navLogo = wordmark.querySelector(".wordmark-logo");
  let logoFrame;
  let logoGeometry;
  function setLogoHidden(hidden) {
    // An expanded mobile menu must stay usable even if it moves the hero into view.
    if (hidden && menuButton?.getAttribute("aria-expanded") === "true") return;
    stickyHeader.classList.toggle("is-hero-hidden", hidden);
    if (headerInner.inert !== hidden) headerInner.inert = hidden;
    if (headerScroll && headerScroll.inert !== !hidden)
      headerScroll.inert = !hidden;
  }
  function measureHeroName() {
    // Measure only on a real layout change, never during scrolling or a toolbar
    // height change. Keep the heading's original space when its SVG becomes fixed.
    heroName.classList.remove("is-name-travelling");
    heroName.style.removeProperty("height");
    for (const property of ["width", "transform"])
      heroLogo.style.removeProperty(property);
    const source = heroLogo.getBoundingClientRect();
    const heading = heroName.getBoundingClientRect();
    const target = navLogo.getBoundingClientRect();
    const headerTop = stickyHeader.getBoundingClientRect().top;
    const rowHeight = parseFloat(getComputedStyle(headerInner).minHeight);
    const targetTop = headerTop + (rowHeight - target.height) / 2;
    const startScroll = source.top + window.scrollY - targetTop;
    const aboutTitle = document.querySelector(".about-title");
    const endScroll = aboutTitle
      ? aboutTitle.getBoundingClientRect().top + window.scrollY - rowHeight
      : startScroll + 150;
    logoGeometry = {
      viewportWidth: window.innerWidth,
      sourceTop: source.top + window.scrollY,
      sourceLeft: source.left,
      sourceWidth: source.width,
      targetLeft: target.left,
      targetTop,
      targetScale: target.width / source.width,
      // On desktop, settle as the About me heading reaches the navbar.
      scrollDistance:
        window.innerWidth > 800 ? Math.max(150, endScroll - startScroll) : 150,
    };
    heroName.style.height = `${heading.height}px`;
    heroLogo.style.width = `${source.width}px`;
  }
  function updateHeroName() {
    logoFrame = null;
    if (!logoGeometry || logoGeometry.viewportWidth !== window.innerWidth)
      measureHeroName();
    const g = logoGeometry;
    // Negative elastic overscroll must not move the docking threshold.
    const distance = Math.max(0, window.scrollY) - g.sourceTop + g.targetTop;
    const progress = reducedMotion.matches
      ? 1
      : Math.max(0, Math.min(1, distance / g.scrollDistance));
    const docked = distance >= 0;
    heroName.classList.toggle("is-name-travelling", docked);
    stickyHeader.classList.toggle("is-name-travelling", docked);
    const sliding = docked && progress < 1;
    stickyHeader.classList.toggle("is-name-sliding", sliding);
    // Full navigation would overlap the name while it crosses the desktop header.
    navigation.inert = sliding && !headerInner.classList.contains("nav-mobile");
    if (docked) {
      const x = g.sourceLeft + (g.targetLeft - g.sourceLeft) * progress;
      const scale = 1 + (g.targetScale - 1) * progress;
      // A single SVG stays on a fixed compositor layer, including after docking.
      // Only its transform changes; there is no width reflow or second-logo swap.
      heroLogo.style.transform = `translate3d(${x}px, ${g.targetTop}px, 0) scale(${scale})`;
    } else heroLogo.style.removeProperty("transform");
    setLogoHidden(!docked);
    const location = !docked ? "hero" : sliding ? "sliding" : "navbar";
    if (heroLogo.dataset.akLocation !== location) {
      heroLogo.dataset.akLocation = location;
      heroLogo.dispatchEvent(
        new CustomEvent("akwordmarklocationchange", { detail: { location } }),
      );
    }
  }
  function scheduleHeroName() {
    if (logoFrame == null) logoFrame = requestAnimationFrame(updateHeroName);
  }
  scheduleHeroName();
  window.addEventListener("scroll", scheduleHeroName, { passive: true });
  window.addEventListener("resize", scheduleHeroName);
  reducedMotion.addEventListener("change", scheduleHeroName);
  document.fonts?.ready.then(() => {
    logoGeometry = null;
    scheduleHeroName();
  });
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      logoGeometry = null;
      scheduleHeroName();
    }).observe(heroGrid);
  }
}

const sectionLinks = Array.from(
  document.querySelectorAll('#site-nav a[href^="#"]'),
);
if ("IntersectionObserver" in window && sectionLinks.length) {
  const sections = sectionLinks
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter(Boolean);
  const pageEnd = document.createElement("div");
  pageEnd.style.height = "1px";
  pageEnd.setAttribute("aria-hidden", "true");
  document.body.append(pageEnd);
  let sectionObserver;
  let activationLine = window.innerHeight / 2;
  let atBottom = false;

  function setActive(id) {
    sectionLinks.forEach((link) => {
      const active = link.hash === "#" + id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function updateActiveSection() {
    const current = atBottom
      ? sections.at(-1)
      : sections.findLast(
          (section) =>
            section.getBoundingClientRect().top <= activationLine + 1,
        );
    setActive(current?.id);
  }

  function observeSections() {
    // Track the section at the viewport centre, below the sticky header.
    // This also follows intermediate sections during native fragment scrolling.
    const viewportHeight = Math.max(2, window.innerHeight);
    activationLine = Math.min(
      viewportHeight - 1,
      Math.max(
        viewportHeight / 2,
        (stickyHeader?.getBoundingClientRect().height || 0) + 1,
      ),
    );
    sectionObserver?.disconnect();
    sectionObserver = new IntersectionObserver(updateActiveSection, {
      rootMargin: `${-activationLine}px 0px ${-(viewportHeight - activationLine - 1)}px 0px`,
      threshold: 0,
    });
    sections.forEach((section) => sectionObserver.observe(section));
    updateActiveSection();
  }
  const bottomObserver = new IntersectionObserver(
    (entries) => {
      atBottom = entries[0].isIntersecting;
      updateActiveSection();
    },
    { threshold: 1 },
  );
  bottomObserver.observe(pageEnd);
  observeSections();
  window.addEventListener("resize", observeSections);
  if ("ResizeObserver" in window) {
    const sectionLayoutObserver = new ResizeObserver(observeSections);
    sectionLayoutObserver.observe(stickyHeader);
  }
}

// Native disclosures remain functional without JavaScript. Animate height in Safari
// as well as browsers without support for CSS details-content transitions.
for (const details of document.querySelectorAll("details")) {
  const summary = details.querySelector(":scope > summary");
  const listContent = details.classList.contains("cv-more")
    ? details.querySelector(".cv-earlier")
    : null;
  if (listContent) listContent.tabIndex = -1;
  let animation;
  let intendedOpen = details.open;
  function toggle(open, restoreFocus = false) {
    intendedOpen = open;
    const start = details.getBoundingClientRect().height;
    animation?.cancel();
    // Measure the actual closed row: previews and list openers reappear when
    // closed, and the row's borders also contribute to its final height.
    details.open = false;
    const closedHeight = details.getBoundingClientRect().height;
    details.open = true;
    const end = open ? details.getBoundingClientRect().height : closedHeight;
    if (open && listContent) listContent.focus({ preventScroll: true });
    if (!open && listContent && details.getBoundingClientRect().top < 85) {
      details.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    }
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !details.animate
    ) {
      details.open = open;
      details.style.overflow = "";
      animation = undefined;
      if (restoreFocus) summary.focus({ preventScroll: true });
      return;
    }
    details.style.overflow = "hidden";
    animation = details.animate(
      [{ height: `${start}px` }, { height: `${end}px` }],
      {
        duration: 360,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );
    animation.onfinish = () => {
      details.open = open;
      details.style.overflow = "";
      animation = undefined;
      if (restoreFocus) summary.focus({ preventScroll: true });
    };
  }
  summary.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    event.preventDefault();
    toggle(animation ? !intendedOpen : !details.open);
  });
  details
    .querySelector(".cv-close")
    ?.addEventListener("click", () => toggle(false, true));
}
