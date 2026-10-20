/* Load after wordmark-shapes.js, wordmark-settings.js and wordmark-motion.js. */
(() => {
  const start = () => {
    if (!window.AKWordmark) return;
    const movingLogo = document.querySelector("#hero-name .hero-logo");
    document.querySelectorAll("svg[data-ak-wordmark]").forEach((svg) => {
      const options = svg.classList.contains("hero-logo")
        ? {
            settings: window.AK_WORDMARK_HERO_SETTINGS,
            autoStart: false,
            preserveCycleOnScroll: true,
          }
        : { autoStart: !movingLogo };
      window.AKWordmark.create(svg, options);
    });
    if (movingLogo) {
      const controller = window.AKWordmark.get(movingLogo);
      let location;
      let playbackLocation;
      let pendingIntro;
      let arrivalTimer;
      let lastHeroCycleEndedAt;
      let observedCycleEnd;
      let syncQueued = false;
      let heroHasAppeared = false;
      const startPendingIntro = () => {
        clearTimeout(arrivalTimer);
        arrivalTimer = null;
        if (!pendingIntro || location === "sliding") return;
        if (controller.getState().busy) return;
        const remaining =
          location === "navbar" && lastHeroCycleEndedAt !== undefined
            ? Math.max(0, 5000 - (performance.now() - lastHeroCycleEndedAt))
            : 0;
        if (remaining > 0) {
          arrivalTimer = setTimeout(startPendingIntro, remaining);
          return;
        }
        pendingIntro = false;
        playbackLocation = location;
        controller.pause();
        controller.setOptions(
          location === "hero"
            ? {
                ...window.AK_WORDMARK_HERO_SETTINGS,
                intro: {
                  ...window.AK_WORDMARK_HERO_SETTINGS.intro,
                  cycles: heroHasAppeared ? 1 : 2,
                },
              }
            : {
                ...window.AK_WORDMARK_SETTINGS,
                // Arrival and the five-second hero cooldown already provide the pause.
                intro: { ...window.AK_WORDMARK_SETTINGS.intro, delayMs: 0 },
              },
        );
        if (location === "hero") heroHasAppeared = true;
        controller.restartIntro();
      };
      movingLogo.addEventListener("akwordmarkchange", (event) => {
        const endedAt = event.detail.lastCycleEndedAt;
        if (endedAt !== null && endedAt !== observedCycleEnd) {
          observedCycleEnd = endedAt;
          if (playbackLocation === "hero") lastHeroCycleEndedAt = endedAt;
        }
        // The controller emits synchronously while finishing a sequence. Wait
        // until that sequence has unwound before changing its settings.
        if (!syncQueued) {
          syncQueued = true;
          queueMicrotask(() => {
            syncQueued = false;
            startPendingIntro();
          });
        }
      });
      const followLocation = () => {
        const next = movingLogo.dataset.akLocation || "hero";
        if (location === next) return;
        location = next;
        pendingIntro = next !== "sliding";
        // Preserve an in-progress hero cycle. Returning to the hero starts its
        // own replay immediately, even if a navbar cycle was still running.
        if (next === "hero" && playbackLocation === "navbar")
          controller.pause();
        else controller.finishCurrentCycle();
        startPendingIntro();
      };
      movingLogo.addEventListener("akwordmarklocationchange", followLocation);
      followLocation();
    }
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
          // The homepage controller restarts when the slide returns to the hero.
          if (movingLogo) return;
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
