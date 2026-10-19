/* Editable motion settings. No compilation or animation library is required.
   Durations are milliseconds; arc values use the SVG's 1000-units-per-em space.
   Higher tempo = faster. Synchronized steps share bodyMs and easing for all parts.
   Dot spring, lag and arc settings apply only to unsynchronized steps. */
window.AK_WORDMARK_SETTINGS = {
  // Keep a full navbar cycle within its ten-second interval.
  tempo: 1.1,
  restShape: "original",
  intro: {
    cycles: 1,
    delayMs: 900, // Pause after the logo becomes fully visible, on reload or scroll.
    onReveal: true,
    oncePerSession: false,
    storageKey: "ak-wordmark-intro-v1",
  },
  idle: { enabled: true, minMs: 10000, maxMs: 10000 },
  dots: {
    damping: 0.7,
    frequency: 10,
    lagMs: [70, 155],
    arcUnits: [18, 26],
    // A shallow inward bow keeps the dots clear of each other on the return.
    returnInwardUnits: [25, 25],
  },
  // Switch off the wink and handshake while keeping the synchronized curved motion.
  experiments: {
    enabled: true,
    wink: {
      enabled: true,
      eye: "rightDot",
      beforeMs: 450, // Let the smiley settle before blinking.
      durationMs: 300,
      afterMs: 850, // Read the reopened eye before moving outwards.
      closedScale: 0.08,
    },
    handshake: {
      enabled: true,
      durationMs: 1300, // One up, down, centre gesture; no bounce or repetition.
      amplitudeUnits: 50, // A subtle shake; only the central hands move.
      downwardScale: 0.5, // Half the downward reach, with the same gesture timing.
    },
  },
  // Start and rest on the normal ü; flow through smiley and handshake before
  // returning directly to normal. All parts move together without stagger or bounce.
  // A synchronized step uses bodyMs for both stems and dots; keep dotsMs matching.
  // "smoother" also gives the upward return zero acceleration at both ends.
  sequence: [
    {
      shape: "smiley",
      bodyMs: 1450,
      dotsMs: 1450,
      holdMs: 1600,
      synchronized: true,
      easing: "smooth",
    },
    {
      shape: "wide",
      bodyMs: 1150,
      dotsMs: 1150,
      holdMs: 1600,
      synchronized: true,
      easing: "smooth",
    },
    {
      shape: "original",
      bodyMs: 1950,
      dotsMs: 1950,
      holdMs: 1100,
      synchronized: true,
      easing: "smoother",
    },
  ],
};

// The large homepage logo has a longer introduction and a quieter idle rhythm.
window.AK_WORDMARK_HERO_SETTINGS = {
  tempo: 1,
  intro: { cycles: 2, revealCycles: 1 },
  idle: { cycles: 2, minMs: 30000, maxMs: 45000 },
};
