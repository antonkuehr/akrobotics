/* Load after wordmark-shapes.js, wordmark-settings.js and wordmark-motion.js. */
(() => {
  const start = () => {
    if (!window.AKWordmark) return;
    document.querySelectorAll("svg[data-ak-wordmark]").forEach((svg) => {
      // The hero gets its own intro count so it never consumes the navbar intro.
      const options = svg.classList.contains("hero-logo")
        ? {
            settings: {
              intro: {
                storageKey: `${window.AK_WORDMARK_SETTINGS.intro.storageKey}-hero`,
              },
            },
          }
        : {};
      window.AKWordmark.create(svg, options);
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else start();
})();
