import { EQ_FREQS, TRACKS, mtof, stepDur, trackSteps, trackLen } from "./tracks";
import type { PlaylistItem } from "./tracks";

/** The player's audio path.
 *
 *      voices ──▶ 10-band EQ ──▶ pan ──▶ master ──▶ analyser ──▶ out
 *
 *  Both sources feed the same bus: the step sequencer below, and an
 *  <audio> element for files the user opens. That is what lets the
 *  equalizer and the spectrum analyzer work on your own MP3s and on the
 *  built-in chiptunes without knowing the difference.
 *
 *  Everything is guarded: with no Web Audio available (jsdom, an old
 *  browser, an autoplay-locked context) every call becomes a no-op
 *  rather than throwing.
 */

type Ctor = typeof AudioContext;
const getCtor = (): Ctor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
};

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let eq: BiquadFilterNode[] = [];
let pan: StereoPannerNode | GainNode | null = null;
let master: GainNode | null = null;
let ana: AnalyserNode | null = null;
let noise: AudioBuffer | null = null;
let el: HTMLAudioElement | null = null;
let elSrc: MediaElementAudioSourceNode | null = null;

let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let nextT = 0;
let cur: { i: number; kind: PlaylistItem["kind"] } | null = null;
let playing = false;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());

function init(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = getCtor();
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    return null;
  }
  bus = ctx.createGain();
  eq = EQ_FREQS.map((f, i) => {
    const b = ctx!.createBiquadFilter();
    b.type = i === 0 ? "lowshelf" : i === EQ_FREQS.length - 1 ? "highshelf" : "peaking";
    b.frequency.value = f;
    b.Q.value = 1.1;
    b.gain.value = 0;
    return b;
  });
  pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
  master = ctx.createGain();
  master.gain.value = 0.7;
  ana = ctx.createAnalyser();
  ana.fftSize = 128;
  ana.smoothingTimeConstant = 0.72;

  let node: AudioNode = bus;
  eq.forEach((f) => {
    node.connect(f);
    node = f;
  });
  node.connect(pan);
  pan.connect(master);
  master.connect(ana);
  ana.connect(ctx.destination);

  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  el = new Audio();
  el.addEventListener("ended", () => api.onNext?.());
  return ctx;
}

function env(g: GainNode, t: number, peak: number, dec: number) {
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dec);
}
function lead(t: number, m: number) {
  if (!ctx || !bus) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.value = mtof(m);
  env(g, t, 0.17, 0.19);
  o.connect(g);
  g.connect(bus);
  o.start(t);
  o.stop(t + 0.22);
}
function bassVoice(t: number, m: number) {
  if (!ctx || !bus) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = mtof(m);
  env(g, t, 0.34, 0.24);
  o.connect(g);
  g.connect(bus);
  o.start(t);
  o.stop(t + 0.27);
}
function drum(t: number, c: string) {
  if (!ctx || !bus || !noise) return;
  if (c === "k") {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
    env(g, t, 0.5, 0.15);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + 0.17);
    return;
  }
  const s = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  s.buffer = noise;
  f.type = "highpass";
  f.frequency.value = c === "s" ? 1400 : 7000;
  env(g, t, c === "s" ? 0.22 : 0.1, c === "s" ? 0.13 : 0.045);
  s.connect(f);
  f.connect(g);
  g.connect(bus);
  s.start(t);
  s.stop(t + 0.16);
}

/** Lookahead scheduler: wake every 25ms, schedule anything falling due in
 *  the next 120ms. setInterval alone is far too jittery for music. */
function schedule() {
  if (!ctx || !cur) return;
  const t = TRACKS[cur.i];
  if (!t) return;
  const sd = stepDur(t);
  const total = trackSteps(t);
  while (nextT < ctx.currentTime + 0.12) {
    const b = Math.floor(step / 16) % 4;
    const s = step % 16;
    if (t.lead[b][s]) lead(nextT, t.lead[b][s]);
    if (t.bass[b][s]) bassVoice(nextT, t.bass[b][s]);
    const dc = t.drums[b][s];
    if (dc && dc !== ".") drum(nextT, dc);
    nextT += sd;
    step++;
    if (step >= total) {
      stopSeq();
      api.onNext?.();
      return;
    }
  }
  emit();
}
function stopSeq() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export interface Position {
  cur: number;
  len: number;
  frac: number;
}

export const api = {
  onNext: null as (() => void) | null,

  subscribe(f: () => void) {
    listeners.add(f);
    return () => listeners.delete(f);
  },
  analyser: (): AnalyserNode | null => ana,
  get playing() {
    return playing;
  },

  play(i: number, list: PlaylistItem[]) {
    if (!init() || !ctx) return;
    void ctx.resume();
    const item = list[i];
    if (!item) return;
    if (!cur || cur.i !== i || cur.kind !== item.kind) {
      stopSeq();
      el?.pause();
      step = 0;
      cur = { i, kind: item.kind };
    }
    if (item.kind === "synth") {
      el?.pause();
      nextT = ctx.currentTime + 0.06;
      stopSeq();
      timer = setInterval(schedule, 25);
    } else if (el) {
      if (!elSrc && bus) {
        elSrc = ctx.createMediaElementSource(el);
        elSrc.connect(bus);
      }
      if (item.url && el.src !== item.url) el.src = item.url;
      void el.play().catch(() => {});
    }
    playing = true;
    emit();
  },

  pause() {
    if (!ctx) return;
    if (cur?.kind === "file") el?.pause();
    else stopSeq();
    playing = false;
    emit();
  },

  stop() {
    if (!ctx) return;
    stopSeq();
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    step = 0;
    playing = false;
    emit();
  },

  seek(frac: number, list: PlaylistItem[]) {
    if (!ctx || !cur) return;
    const item = list[cur.i];
    if (!item) return;
    if (item.kind === "synth") {
      const t = TRACKS[cur.i];
      step = Math.floor(frac * trackSteps(t));
      if (playing) nextT = ctx.currentTime + 0.03;
    } else if (el?.duration) {
      el.currentTime = frac * el.duration;
    }
    emit();
  },

  position(list: PlaylistItem[]): Position {
    const none = { cur: 0, len: 0, frac: 0 };
    if (!cur) return none;
    const item = list[cur.i];
    if (!item) return none;
    if (item.kind === "synth") {
      const t = TRACKS[cur.i];
      const len = trackLen(t);
      const c = step * stepDur(t);
      return { cur: c, len, frac: len ? c / len : 0 };
    }
    const len = el && el.duration && isFinite(el.duration) ? el.duration : 0;
    const c = el ? el.currentTime : 0;
    return { cur: c, len, frac: len ? c / len : 0 };
  },

  volume(v: number) {
    if (!init() || !master) return;
    master.gain.value = v;
  },
  balance(v: number) {
    if (!init() || !pan) return;
    if ("pan" in pan) pan.pan.value = v;
  },
  eq(i: number, v: number) {
    if (!init() || !eq[i]) return;
    eq[i].gain.value = v;
  },
};

export const Audio98 = api;
