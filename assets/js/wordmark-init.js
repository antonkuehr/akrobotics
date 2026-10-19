/* Load after wordmark-shapes.js, wordmark-settings.js and wordmark-motion.js. */
(() => {
  const start = () => {
    if (!window.AKWordmark) return;
    document.querySelectorAll("svg[data-ak-wordmark]").forEach((svg) => {
      const options = svg.classList.contains("hero-logo")
        ? { settings: window.AK_WORDMARK_HERO_SETTINGS }
        : {};
      window.AKWordmark.create(svg, options);
    });
    document
      .querySelector(".site-header a.wordmark")
      ?.addEventListener("click", (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const home = new URL(event.currentTarget.href);
        // Removing #about-me, etc. is same-document navigation, not a page reload.
        // Reset both intros while keeping the native home-link and scroll behaviour.
        if (
          home.origin === location.origin &&
          home.pathname === location.pathname &&
          home.search === location.search
        ) {
          window.AKWordmark.initAll(document).forEach((logo) =>
            logo.restartIntro(),
          );
        }
      });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else start();
})();
