/* AK Robotics editable SVG wordmark. Plain JavaScript, no build or dependencies.
   Load shapes.js and settings.js before this file. It never modifies site navigation.
   The SVG remains a static smiley if JavaScript is unavailable. */
(() => {
  "use strict";
  const PARTS = ["body", "leftDot", "rightDot"];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const controllers = new WeakMap();
  const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);

  function merge(base, patch) {
    const out = clone(base);
    for (const [key, value] of Object.entries(patch || {})) {
      out[key] =
        value && typeof value === "object" && !Array.isArray(value)
          ? merge(out[key] || {}, value)
          : clone(value);
    }
    return out;
  }
  function path(ops) {
    return ops
      .map(
        (op) =>
          op[0] +
          op
            .slice(1)
            .map((v) => +v.toFixed(7))
            .join(" "),
      )
      .join(" ");
  }
  function compatible(a, b) {
    return (
      a.length === b.length &&
      a.every(
        (op, i) =>
          op[0] === b[i][0] &&
          op.length === b[i].length &&
          b[i].slice(1).every(Number.isFinite),
      )
    );
  }
  function validateShape(value, template) {
    if (
      !value ||
      !PARTS.every(
        (part) =>
          Array.isArray(value[part]) && compatible(template[part], value[part]),
      )
    ) {
      throw new Error(
        "Wordmark shapes must retain matching M/L/C/Z commands for body and both dots.",
      );
    }
  }
  function validateSettings(s, shapes) {
    if (!(Number.isFinite(s.tempo) && s.tempo > 0))
      throw new Error("tempo must be positive");
    if (!shapes[s.restShape]) throw new Error("Unknown resting shape");
    if (!(Number.isInteger(s.intro.cycles) && s.intro.cycles >= 0))
      throw new Error("intro.cycles must be a non-negative integer");
    for (const [name, value] of [
      ["intro.revealCycles", s.intro.revealCycles],
      ["idle.cycles", s.idle.cycles],
    ]) {
      if (value !== undefined && !(Number.isInteger(value) && value >= 1))
        throw new Error(name + " must be a positive integer");
    }
    if (!(s.dots.damping >= 0.55 && s.dots.damping <= 1))
      throw new Error("dots.damping must be between 0.55 and 1");
    if (!(Number.isFinite(s.dots.frequency) && s.dots.frequency > 0))
      throw new Error("dots.frequency must be positive");
    for (const key of ["lagMs", "arcUnits"]) {
      if (!(
        Array.isArray(s.dots[key]) &&
        s.dots[key].length === 2 &&
        s.dots[key].every((v) => Number.isFinite(v) && v >= 0)
      ))
        throw new Error("Invalid dots." + key);
    }
    if (!(
      Number.isFinite(s.idle.minMs) &&
      s.idle.minMs > 0 &&
      s.idle.maxMs >= s.idle.minMs
    ))
      throw new Error("Invalid idle interval");
    if (!Array.isArray(s.sequence) || !s.sequence.length)
      throw new Error("sequence cannot be empty");
    for (const step of s.sequence) {
      if (
        !shapes[step.shape] ||
        ![step.bodyMs, step.dotsMs].every((n) => Number.isFinite(n) && n > 0) ||
        !(Number.isFinite(step.holdMs) && step.holdMs >= 0)
      )
        throw new Error("Invalid animation step");
    }
  }
  function spring(t, damping, frequency) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    function response(u) {
      if (damping >= 0.9999)
        return 1 - (1 + frequency * u) * Math.exp(-frequency * u);
      const q = Math.sqrt(1 - damping * damping);
      return (
        1 -
        Math.exp(-damping * frequency * u) *
          (Math.cos(frequency * q * u) +
            (damping / q) * Math.sin(frequency * q * u))
      );
    }
    return response(t) / response(1);
  }
  function wait(ms, signal) {
    if (signal.aborted) return Promise.resolve(false);
    return new Promise((resolve) => {
      const done = (ok) => {
        clearTimeout(timer);
        signal.removeEventListener("abort", abort);
        resolve(ok);
      };
      const abort = () => done(false);
      const timer = setTimeout(() => done(true), ms);
      signal.addEventListener("abort", abort, { once: true });
    });
  }

  class Wordmark {
    constructor(svg, options = {}) {
      if (!(svg instanceof SVGElement))
        throw new Error("Pass an inline SVG element, not an img.");
      this.svg = svg;
      this.owner =
        options.owner || svg.closest(".wordmark") || svg.parentElement || svg;
      this.shapes = clone(options.shapes || window.AK_WORDMARK_SHAPES);
      if (!this.shapes?.smiley)
        throw new Error("Load wordmark-shapes.js first");
      Object.values(this.shapes).forEach((value) =>
        validateShape(value, this.shapes.smiley),
      );
      this.settings = merge(window.AK_WORDMARK_SETTINGS, options.settings);
      validateSettings(this.settings, this.shapes);
      this.paths = PARTS.map((part) =>
        svg.querySelector('[data-ak-part="' + part + '"]'),
      );
      if (this.paths.some((node) => !node))
        throw new Error(
          "The inline SVG needs body, leftDot and rightDot data-ak-part paths",
        );
      this.auto = options.autoStart !== false;
      this.manualPause = false;
      this.destroyed = false;
      this.busy = false;
      this.completed = 0;
      this.introCycles = this.settings.intro.cycles;
      this.wasVisible = false;
      this.hasAppeared = false;
      this.lastCycleStartedAt = null;
      this.reduced = matchMedia("(prefers-reduced-motion: reduce)");
      this.shape = this.settings.restShape;
      this.current = clone(this.shapes[this.shape]);
      this._readIntro();
      this._draw(this.current);
      this._sync = () => this._visibilityChanged();
      document.addEventListener("visibilitychange", this._sync);
      this.reduced.addEventListener("change", this._sync);
      this.observer = new MutationObserver(this._sync);
      // The homepage hides the header's inner container, not the wordmark itself.
      // Watch that ancestor chain and wait for its fade to finish before playing.
      this.visibilityNodes = [];
      for (let node = this.owner; node; node = node.parentElement) {
        this.visibilityNodes.push(node);
        node.addEventListener("transitionend", this._sync);
        this.observer.observe(node, {
          attributes: true,
          attributeFilter: ["class", "style", "hidden", "aria-hidden", "inert"],
        });
      }
      if ("IntersectionObserver" in window) {
        this.intersection = new IntersectionObserver(this._sync, {
          threshold: [0, 0.01],
        });
        this.intersection.observe(svg);
      }
      controllers.set(svg, this);
      this._sync();
    }
    _readIntro() {
      this.completed = 0;
      if (this.settings.intro.oncePerSession) {
        try {
          const saved = Number(
            sessionStorage.getItem(this.settings.intro.storageKey),
          );
          this.completed = Number.isFinite(saved)
            ? Math.max(0, Math.floor(saved))
            : 0;
        } catch {
          /* Storage unavailable: this document only. */
        }
      }
    }
    _saveIntro() {
      if (this.settings.intro.oncePerSession) {
        try {
          sessionStorage.setItem(
            this.settings.intro.storageKey,
            String(this.completed),
          );
        } catch {
          /* Optional persistence. */
        }
      }
    }
    _visible() {
      if (
        document.hidden ||
        !this.svg.isConnected ||
        this.owner.closest('[hidden], [inert], [aria-hidden="true"]') ||
        this.owner.classList.contains("is-hidden")
      )
        return false;
      for (const node of this.visibilityNodes) {
        const style = getComputedStyle(node);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          +style.opacity < 0.99
        )
          return false;
      }
      const box = this.svg.getBoundingClientRect();
      return (
        box.width > 0 &&
        box.height > 0 &&
        box.bottom > 0 &&
        box.top < innerHeight &&
        box.right > 0 &&
        box.left < innerWidth
      );
    }
    _draw(value) {
      this.current = clone(value);
      PARTS.forEach((part, i) =>
        this.paths[i].setAttribute("d", path(value[part])),
      );
    }
    _emit() {
      this.svg.dispatchEvent(
        new CustomEvent("akwordmarkchange", { detail: this.getState() }),
      );
    }
    _cancel() {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
      this.abort?.abort();
      this.busy = false;
    }
    _begin() {
      this._cancel();
      this.abort = new AbortController();
      this.busy = true;
      return this.abort;
    }
    _rest() {
      this.shape = this.settings.restShape;
      this.target = this.shape;
      this._draw(this.shapes[this.shape]);
      this._emit();
    }
    _visibilityChanged() {
      if (this.destroyed) return;
      const visible = !this.reduced.matches && this._visible();
      const revealed = visible && !this.wasVisible;
      this.wasVisible = visible;
      if (!visible) {
        this._cancel();
        this.lastCycleStartedAt = null;
        this._rest();
      } else {
        if (revealed && this.settings.intro.onReveal) {
          this.completed = 0;
          const { cycles, revealCycles = cycles } = this.settings.intro;
          this.introCycles = this.hasAppeared ? revealCycles : cycles;
          this.hasAppeared = true;
        }
        if (this.auto && !this.manualPause && !this.busy) this._schedule();
      }
    }
    _schedule() {
      if (
        this.destroyed ||
        !this.auto ||
        this.manualPause ||
        this.busy ||
        this.reduced.matches ||
        !this._visible() ||
        this.idleTimer
      )
        return;
      if (this.completed < this.introCycles) {
        this._sequence(this.introCycles - this.completed, true);
      } else if (this.settings.idle.enabled) {
        const { minMs, maxMs } = this.settings.idle;
        const interval = minMs + Math.random() * (maxMs - minMs);
        // Recurring intervals run from cycle start, rather than adding the
        // animation duration to the requested interval.
        const delay =
          this.lastCycleStartedAt === null
            ? interval
            : Math.max(
                0,
                interval - (performance.now() - this.lastCycleStartedAt),
              );
        this.idleTimer = setTimeout(() => {
          this.idleTimer = null;
          if (this._visible() && !this.reduced.matches)
            this._sequence(this.settings.idle.cycles || 1, false);
          else this._sync();
        }, delay);
      }
    }
    _move(name, step, signal) {
      if (signal.aborted) return Promise.resolve(false);
      if (this.reduced.matches) {
        this._draw(this.shapes[name]);
        this.shape = name;
        return Promise.resolve(true);
      }
      const startValue = clone(this.current),
        target = this.shapes[name];
      const tempo = this.settings.tempo,
        dots = clone(this.settings.dots);
      const bodyMs = step.bodyMs / tempo,
        dotsMs = step.dotsMs / tempo;
      const lags = dots.lagMs.map((v) => v / tempo);
      const total = Math.max(bodyMs, dotsMs + Math.max(...lags));
      const start = performance.now();
      this.target = name;
      this.lastDurationMs = total;
      this._emit();
      return new Promise((resolve) => {
        let raf;
        const finish = (ok) => {
          cancelAnimationFrame(raf);
          signal.removeEventListener("abort", abort);
          resolve(ok);
        };
        const abort = () => finish(false);
        signal.addEventListener("abort", abort, { once: true });
        const frame = (now) => {
          if (signal.aborted) return finish(false);
          const elapsed = now - start;
          const value = {};
          PARTS.forEach((part, i) => {
            const t = clamp(
              (elapsed - (i ? lags[i - 1] : 0)) / (i ? dotsMs : bodyMs),
              0,
              1,
            );
            const progress = i
              ? spring(t, dots.damping, dots.frequency)
              : smooth(t);
            // Add a small curved flight, never a scaling/squashing of the balls.
            const arc = i ? Math.sin(Math.PI * t) * dots.arcUnits[i - 1] : 0;
            value[part] = startValue[part].map((op, j) =>
              op.map((v, k) => {
                if (k === 0) return v;
                return (
                  mix(v, target[part][j][k], progress) +
                  (i && k % 2 === 0 ? arc : 0)
                );
              }),
            );
          });
          this._draw(value);
          if (elapsed < total) raf = requestAnimationFrame(frame);
          else {
            this._draw(target);
            this.shape = name;
            this._emit();
            finish(true);
          }
        };
        raf = requestAnimationFrame(frame);
      });
    }
    async _sequence(cycles, automaticIntro) {
      if (this.destroyed || this.reduced.matches || !this._visible()) {
        this._rest();
        return false;
      }
      const command = this._begin(),
        signal = command.signal;
      this.lastCycleStartedAt = automaticIntro ? null : performance.now();
      this._emit();
      for (let round = 0; round < cycles; round++) {
        for (const step of this.settings.sequence) {
          if (!(await this._move(step.shape, step, signal))) return false;
          if (!(await wait(step.holdMs / this.settings.tempo, signal)))
            return false;
        }
        if (automaticIntro) {
          this.completed++;
          this._saveIntro();
        }
      }
      if (signal.aborted || this.abort !== command) return false;
      this.busy = false;
      this._rest();
      this._schedule();
      return true;
    }
    async setShape(name, { animate = true } = {}) {
      if (this.destroyed) return false;
      if (!this.shapes[name])
        throw new Error("Unknown wordmark shape: " + name);
      this.manualPause = true;
      const command = this._begin();
      let ok = true;
      if (animate && this._visible() && !this.reduced.matches) {
        const step =
          this.settings.sequence.find((value) => value.shape === name) ||
          this.settings.sequence[1];
        ok = await this._move(name, step, command.signal);
      } else {
        this._draw(this.shapes[name]);
        this.shape = name;
        this.target = name;
      }
      if (this.abort === command) {
        this.busy = false;
        this._emit();
      }
      return ok;
    }
    playIntro() {
      this.manualPause = true;
      return this._sequence(this.settings.intro.cycles, false);
    }
    playCycle() {
      this.manualPause = true;
      return this._sequence(1, false);
    }
    pause() {
      this.manualPause = true;
      this._cancel();
      this._rest();
    }
    resume() {
      this.manualPause = false;
      this.auto = true;
      this._sync();
    }
    restartIntro() {
      if (this.destroyed) return;
      this._cancel();
      this.completed = 0;
      this.wasVisible = false;
      this.hasAppeared = false;
      this.lastCycleStartedAt = null;
      this.manualPause = false;
      this.auto = true;
      this._rest();
      this._sync();
    }
    setOptions(patch) {
      const next = merge(this.settings, patch);
      validateSettings(next, this.shapes);
      this._cancel();
      this.settings = next;
      this.introCycles = next.intro.cycles;
      this._rest();
      this._sync();
      return this.getState();
    }
    setShapeData(name, value) {
      validateShape(value, this.shapes.smiley);
      this._cancel();
      this.shapes[name] = clone(value);
      this._rest();
      this._sync();
    }
    getState() {
      return {
        shape: this.shape,
        target: this.target,
        busy: this.busy,
        reducedMotion: this.reduced.matches,
        visible: this._visible(),
        paused: this.manualPause,
        completedIntroCycles: this.completed,
        lastDurationMs: this.lastDurationMs || 0,
        settings: clone(this.settings),
      };
    }
    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      this._cancel();
      this._rest();
      document.removeEventListener("visibilitychange", this._sync);
      this.reduced.removeEventListener("change", this._sync);
      this.visibilityNodes.forEach((node) =>
        node.removeEventListener("transitionend", this._sync),
      );
      this.observer.disconnect();
      this.intersection?.disconnect();
      controllers.delete(this.svg);
    }
  }
  window.AKWordmark = {
    create(svg, options) {
      return controllers.get(svg) || new Wordmark(svg, options);
    },
    get(svg) {
      return controllers.get(svg);
    },
    initAll(root = document, options) {
      return [...root.querySelectorAll("svg[data-ak-wordmark]")].map((svg) =>
        this.create(svg, options),
      );
    },
    // Pure helpers are exposed for testing and future editors.
    path,
    spring,
    compatible,
  };
})();
