/* DiscoLoop talk: click-to-advance deck.
 *
 * Every slide is a list of steps.
 *  - HTML slides: each .frag element is one step (revealed in document order). A frag with
 *    data-add="sel:cls;sel:cls" also adds those classes when it is revealed (highlights).
 *  - An .overlay element inside a video slide (e.g. a citation) is shown at the steps listed in
 *    its data-steps ("4", "2-6", "3-"; 0-based step numbers).
 *  - Video slides (data-scenes="SceneA,SceneB"): the Manim scenes were rendered in sections, cut
 *    at every reading pause (see twohop_task/deck_scenes.py). One step = one section; a scene's
 *    closing fade ("out") is chained to the next step, and dropped at the end of the slide.
 *    The first step plays as soon as the slide is entered.
 * Keys: click / → / Space / PageDown = next; ← / PageUp = back; Home / End; F = full screen;
 * H = key hint; S = speaker notes (notes.html in a second window, synced by postMessage; it can
 * also drive the deck); L = light / dark mode (remembered); A = autoplay (the whole deck, steps at
 * AUTO_RATE speed with a short hold in between). The two buttons bottom-right do the same. A click while a segment is playing jumps to the end of the current step.
 * URL hash #<slide>/<step> (1-based slide) jumps straight to that state (used for screenshots).
 * index.html?preview is a passive copy (no input, no hint) that the notes window uses to show
 * what the next click will display.
 */
(() => {
  "use strict";
  const stage = document.getElementById("stage");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const progress = document.getElementById("progress");
  const hint = document.getElementById("hint");
  const DECK = window.DECK || {};
  const PREVIEW = new URLSearchParams(location.search).has("preview");
  let notesWin = null;                   // the speaker-notes window, once it has said hello
  const AUTO_RATE = 1.5;                 // autoplay: video speed,
  const AUTO_HOLD_VIDEO = 700;           // pause after an animation step (ms),
  const AUTO_HOLD_HTML = 1600;           // pause on each html step (ms)
  let auto = false, autoTimer = null;

  // ------------------------------------------------------------------ layout
  function fit() {                       // a 1920x1080 stage, centred and scaled to the window
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
  window.addEventListener("resize", fit);
  fit();

  // ------------------------------------------------------------------ steps per slide
  function videoSteps(scenes) {
    const segs = [];
    for (const sc of scenes) {
      for (const s of DECK[sc] || []) segs.push(Object.assign({ scene: sc }, s));
    }
    while (segs.length && segs[segs.length - 1].name === "out") segs.pop();
    const steps = [];
    let cur = [];
    for (const s of segs) {
      cur.push(s);
      if (s.name === "out" || s.dur < 0.3) continue;      // chain into the next segment
      steps.push(cur);
      cur = [];
    }
    if (cur.length) steps.push(cur);
    return steps;
  }

  const model = slides.map((el) => {
    if (el.classList.contains("video")) {
      const scenes = el.dataset.scenes.split(",").map((s) => s.trim());
      const v0 = document.createElement("video");
      const v1 = document.createElement("video");
      for (const v of [v0, v1]) {
        v.muted = true; v.playsInline = true; v.preload = "auto";
        el.appendChild(v);
      }
      return { el, kind: "video", steps: videoSteps(scenes), vids: [v0, v1], front: 0, queue: [], playing: false };
    }
    return { el, kind: "html", frags: Array.from(el.querySelectorAll(".frag")) };
  });
  const nSteps = (m) => (m.kind === "video" ? m.steps.length : m.frags.length + 1);

  // ------------------------------------------------------------------ html fragments
  function applyAdds(frag, on) {
    const spec = frag.dataset.add;
    if (!spec) return;
    for (const part of spec.split(";")) {
      const [sel, cls] = part.split(":");
      document.querySelectorAll(sel).forEach((t) => t.classList.toggle(cls, on));
    }
  }
  function setFrags(m, count) {           // count = number of revealed fragments
    m.frags.forEach((f, i) => {
      const on = i < count;
      f.classList.toggle("on", on);
      applyAdds(f, on);
    });
  }

  // ------------------------------------------------------------------ video playback
  function showFront(m, i) {
    m.front = i;
    m.vids[i].classList.add("front");
    m.vids[1 - i].classList.remove("front");
  }
  function load(v, src) {
    if (v.dataset.src !== src) { v.src = src; v.dataset.src = src; }
  }
  function playQueue(m) {
    if (!m.queue.length) { m.playing = false; autoSchedule(); return; }
    const seg = m.queue.shift();
    const v = m.vids[1 - m.front];
    load(v, seg.src);
    v.onended = null;
    const start = () => {
      v.currentTime = 0;
      v.playbackRate = auto ? AUTO_RATE : 1;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    };
    v.onplaying = () => { v.onplaying = null; showFront(m, m.vids.indexOf(v)); };
    v.onended = () => playQueue(m);
    m.playing = true;
    if (v.readyState >= 2) start(); else v.addEventListener("loadeddata", start, { once: true });
  }
  function playStep(m, k) {
    m.queue = m.steps[k].slice();
    playQueue(m);
  }
  function showEnd(m, k) {                 // the final frame of step k, no playback
    m.queue = []; m.playing = false;
    const seg = m.steps[k][m.steps[k].length - 1];
    const v = m.vids[1 - m.front];
    for (const x of m.vids) { x.onended = null; x.onplaying = null; x.pause(); }
    load(v, seg.src);
    const seek = () => {
      v.onseeked = () => { v.onseeked = null; showFront(m, m.vids.indexOf(v)); };
      v.currentTime = Math.max(0, v.duration - 0.04);
    };
    if (v.readyState >= 1) seek(); else v.addEventListener("loadedmetadata", seek, { once: true });
  }
  function stopVideo(m) {
    m.queue = []; m.playing = false;
    for (const v of m.vids) { v.onended = null; v.onplaying = null; v.pause(); v.classList.remove("front"); }
  }

  // ------------------------------------------------------------------ navigation
  let cur = 0;       // slide index
  let step = 0;      // html: revealed fragments; video: index of the current step

  function enter(i, atEnd) {
    const prev = model[cur];
    if (prev && prev !== model[i]) {
      prev.el.classList.remove("active");
      if (prev.kind === "video") stopVideo(prev);
    }
    cur = i;
    const m = model[i];
    m.el.classList.add("active");
    if (m.kind === "html") {
      step = atEnd ? m.frags.length : 0;
      setFrags(m, step);
    } else {
      step = atEnd ? m.steps.length - 1 : 0;
      if (atEnd) showEnd(m, step); else playStep(m, 0);
    }
    update();
  }

  function next() {
    const m = model[cur];
    if (m.kind === "video") {
      if (m.playing) { showEnd(m, step); autoSchedule(); return; }   // finish the running step first
      if (step < m.steps.length - 1) { step++; playStep(m, step); update(); return; }
    } else if (step < m.frags.length) {
      step++; setFrags(m, step); update(); return;
    }
    if (cur < model.length - 1) enter(cur + 1, false);
  }

  function prev() {
    const m = model[cur];
    if (m.kind === "video" && step > 0) { step--; showEnd(m, step); update(); return; }
    if (m.kind === "html" && step > 0) { step--; setFrags(m, step); update(); return; }
    if (cur > 0) enter(cur - 1, true);
  }

  function inSteps(spec, k) {             // "4", "2-6", "3-"
    return spec.split(",").some((part) => {
      const [a, b] = part.split("-");
      const lo = parseInt(a, 10);
      const hi = b === undefined ? lo : b === "" ? Infinity : parseInt(b, 10);
      return k >= lo && k <= hi;
    });
  }

  function update() {
    const m = model[cur];
    m.el.querySelectorAll(".overlay").forEach((o) => o.classList.toggle("on", inSteps(o.dataset.steps, step)));
    const frac = (cur + (nSteps(m) > 1 ? step / (nSteps(m) - 1) : 1) * 0.999) / model.length;
    progress.style.width = `${(frac * 100).toFixed(2)}%`;
    history.replaceState(null, "", `#${cur + 1}/${step}`);
    sendState();
    autoSchedule();
  }

  // ------------------------------------------------------------------ autoplay and theme
  function autoSchedule() {
    clearTimeout(autoTimer);
    if (!auto) return;
    const m = model[cur];
    if (m.kind === "video" && m.playing) return;          // the end of the step calls this again
    if (cur === model.length - 1 && step >= nSteps(m) - 1) { setAuto(false); return; }
    autoTimer = setTimeout(() => { if (auto) next(); }, m.kind === "video" ? AUTO_HOLD_VIDEO : AUTO_HOLD_HTML);
  }
  function setAuto(on) {
    auto = on;
    btnAuto.classList.toggle("on", on);
    for (const o of model) if (o.kind === "video") for (const v of o.vids) v.playbackRate = on ? AUTO_RATE : 1;
    if (on && cur === model.length - 1 && step >= nSteps(model[cur]) - 1) enter(0, false);   // at the end: restart
    else autoSchedule();
  }
  function setTheme(light) {
    document.body.classList.toggle("light", light);
    try { localStorage.setItem("discoloop-theme", light ? "light" : "dark"); } catch (e) { /* private mode */ }
  }

  // ------------------------------------------------------------------ speaker notes window
  function sendState() {
    if (!notesWin || notesWin.closed) return;
    const m = model[cur];
    notesWin.postMessage({ type: "deck-state", slide: cur + 1, step, steps: nSteps(m), kind: m.kind,
                           count: model.length, ids: model.map((o) => o.el.dataset.id) }, "*");
  }
  function openNotes() {
    if (notesWin && !notesWin.closed) { notesWin.focus(); return; }   // already open: keep its timer
    const w = window.open("notes.html", "discoloop-notes", "width=1280,height=800");
    if (w) { notesWin = w; w.focus(); }
  }

  function jump(hash) {                      // "#s/k": slide s (1-based) showing its step k
    const mm = /^#(\d+)(?:\/(\d+))?$/.exec(hash || "");
    if (!mm) return false;
    const i = Math.min(model.length - 1, Math.max(0, parseInt(mm[1], 10) - 1));
    const k = mm[2] === undefined ? 0 : parseInt(mm[2], 10);
    const m = model[i];
    for (const o of model) { o.el.classList.remove("active"); if (o.kind === "video") stopVideo(o); }
    cur = i;
    m.el.classList.add("active");
    if (m.kind === "html") { step = Math.min(k, m.frags.length); setFrags(m, step); }
    else { step = Math.min(k, m.steps.length - 1); showEnd(m, step); }
    update();
    return true;
  }

  // ------------------------------------------------------------------ input
  const controls = document.getElementById("controls");
  const btnAuto = document.getElementById("btn-auto");
  const btnTheme = document.getElementById("btn-theme");
  let hideTimer = null;
  function showControls(ms) {
    controls.classList.add("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => controls.classList.remove("show"), ms || 2500);
  }
  if (PREVIEW) {
    controls.style.display = "none";
    window.addEventListener("storage", (e) => {            // follow the deck's light / dark mode
      if (e.key === "discoloop-theme") document.body.classList.toggle("light", e.newValue === "light");
    });
  } else {
    btnTheme.addEventListener("click", () => setTheme(!document.body.classList.contains("light")));
    btnAuto.addEventListener("click", () => setAuto(!auto));
    document.addEventListener("mousemove", () => showControls());
  }

  window.addEventListener("message", (e) => {
    const d = e.data || {};
    if (PREVIEW) {
      if (d.type === "preview-goto") jump(`#${d.slide}/${d.step}`);
      return;
    }
    if (d.type === "notes-hello") { notesWin = e.source; sendState(); }
    else if (d.type === "notes-nav") {
      if (d.dir === "next") next();
      else if (d.dir === "prev") prev();
      else if (d.dir === "first") enter(0, false);
      else if (d.dir === "last") enter(model.length - 1, true);
    }
  });
  if (!PREVIEW) document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": case " ": case "PageDown": case "Enter": e.preventDefault(); next(); break;
      case "ArrowLeft": case "ArrowUp": case "PageUp": case "Backspace": e.preventDefault(); prev(); break;
      case "Home": e.preventDefault(); enter(0, false); break;
      case "End": e.preventDefault(); enter(model.length - 1, true); break;
      case "f": case "F":
        if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen();
        break;
      case "h": case "H": hint.classList.toggle("show"); break;
      case "s": case "S": openNotes(); break;
      case "l": case "L": setTheme(!document.body.classList.contains("light")); break;
      case "a": case "A": setAuto(!auto); break;
      default: break;
    }
  });
  if (!PREVIEW) {
    document.addEventListener("click", (e) => { if (e.button === 0 && !e.target.closest("#controls")) next(); });
    document.addEventListener("contextmenu", (e) => { e.preventDefault(); if (!e.target.closest("#controls")) prev(); });
  }

  // read-only state for automated checks (tests/puppeteer)
  window.__deck = {
    state() {
      const m = model[cur];
      const out = { slide: cur + 1, id: m.el.dataset.id, kind: m.kind, step, steps: nSteps(m) };
      if (m.kind === "video") {
        const v = m.vids[m.front];
        Object.assign(out, { playing: m.playing, src: v.dataset.src || "", t: v.currentTime, dur: v.duration,
                             paused: v.paused, ended: v.ended, frontShown: v.classList.contains("front") });
      }
      return out;
    },
    count: () => model.length,
    auto: () => auto,
  };

  window.addEventListener("hashchange", () => {
    if (location.hash !== `#${cur + 1}/${step}`) jump(location.hash);
  });

  if (!jump(location.hash)) enter(0, false);
  if (!PREVIEW) {
    hint.classList.add("show");
    setTimeout(() => hint.classList.remove("show"), 4000);
    showControls(4000);
  }
})();
