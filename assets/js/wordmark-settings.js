/* Editable motion settings. No compilation or animation library is required.
   Durations are milliseconds; arc values use the SVG's 1000-units-per-em space.
   Higher tempo = faster. Lower damping = more spring overshoot.
   Keep dots.damping >= 0.55 to retain gentle, readable motion. */
window.AK_WORDMARK_SETTINGS = {
  tempo: 1,
  restShape: "smiley",
  intro: {
    cycles: 1,
    onReveal: true,
    oncePerSession: false,
    storageKey: "ak-wordmark-intro-v1",
  },
  idle: { enabled: true, minMs: 15000, maxMs: 15000 },
  dots: {
    damping: 0.7,
    frequency: 10,
    lagMs: [70, 155],
    arcUnits: [18, 26],
  },
  // Shorter moves are a little quicker; each arrival has time to settle.
  sequence: [
    { shape: "original", bodyMs: 1100, dotsMs: 1700, holdMs: 500 },
    { shape: "smiley", bodyMs: 1200, dotsMs: 1800, holdMs: 750 },
    { shape: "wide", bodyMs: 900, dotsMs: 1450, holdMs: 900 },
    { shape: "smiley", bodyMs: 1050, dotsMs: 1650, holdMs: 1100 },
  ],
};

// The large homepage logo has a longer introduction and a quieter idle rhythm.
window.AK_WORDMARK_HERO_SETTINGS = {
  intro: { cycles: 2, maxCycles: 3 },
  idle: { minMs: 30000, maxMs: 45000 },
};
