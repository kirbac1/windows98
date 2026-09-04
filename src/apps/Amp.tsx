import { useCallback, useEffect, useRef, useState } from "react";
import { Audio98 } from "../audio/engine";
import { EQ_FREQS, TRACKS, fmt, trackLen } from "../audio/tracks";
import type { PlaylistItem } from "../audio/tracks";

/** Nostalgia Amp.
 *
 *  The visualizer and the readout share one requestAnimationFrame loop:
 *  the canvas is redrawn every frame, the React state behind the time
 *  display only ten times a second, because re-rendering the tree at 60fps
 *  to move two digits is how you make a player stutter. */
export function AmpApp() {
  const [list, setList] = useState<PlaylistItem[]>(() =>
    TRACKS.map((t) => ({ kind: "synth" as const, name: t.name, artist: t.artist, dur: trackLen(t), kbps: t.kbps })),
  );
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({ cur: 0, len: trackLen(TRACKS[0]), frac: 0 });
  const [vol, setVol] = useState(70);
  const [bal, setBal] = useState(0);
  const [eqOn, setEqOn] = useState(true);
  const [showEq, setShowEq] = useState(true);
  const [showPl, setShowPl] = useState(true);
  const [eqv, setEqv] = useState<number[]>(() => EQ_FREQS.map(() => 0));

  const listRef = useRef(list);
  const idxRef = useRef(idx);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const file = useRef<HTMLInputElement | null>(null);
  listRef.current = list;
  idxRef.current = idx;

  const start = useCallback((i: number) => {
    const l = listRef.current;
    if (!l[i]) return;
    Audio98.play(i, l);
    setIdx(i);
    setPlaying(true);
  }, []);

  useEffect(() => {
    Audio98.onNext = () => start((idxRef.current + 1) % listRef.current.length);
    return () => {
      Audio98.onNext = null;
    };
  }, [start]);
  useEffect(() => Audio98.volume(vol / 100), [vol]);
  useEffect(() => Audio98.balance(bal / 100), [bal]);
  useEffect(() => {
    eqv.forEach((v, i) => Audio98.eq(i, eqOn ? v : 0));
  }, [eqv, eqOn]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const peaks = new Array(19).fill(0);
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const c = canvas.current;
      const g = c?.getContext("2d");
      if (c && g) {
        const W = c.width;
        const H = c.height;
        g.fillStyle = "#000";
        g.fillRect(0, 0, W, H);
        const bars = 19;
        const a = Audio98.analyser();
        const data = a ? new Uint8Array(a.frequencyBinCount) : null;
        if (a && data && playing) a.getByteFrequencyData(data);
        for (let i = 0; i < bars; i++) {
          let v = 0;
          if (data && playing) {
            const s = Math.floor((i * (data.length * 0.62)) / bars);
            v = data[s] / 255;
          }
          peaks[i] = Math.max(v, peaks[i] - 0.035);
          const h = Math.max(1, Math.round(v * (H - 2)));
          for (let y = 0; y < h; y += 2) {
            const f = y / (H - 2);
            g.fillStyle = f > 0.72 ? "#d8f000" : f > 0.42 ? "#7bf000" : "#26f000";
            g.fillRect(i * 4, H - 1 - y, 3, 2);
          }
          const py = Math.round(peaks[i] * (H - 2));
          g.fillStyle = "#8a9a8a";
          g.fillRect(i * 4, H - 2 - py, 3, 1);
        }
      }
      if (t - last > 100) {
        last = t;
        const p = Audio98.position(listRef.current);
        if (p.len) setPos(p);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const item = list[idx] ?? list[0];
  const title = idx + 1 + ". " + item.artist + " - " + item.name;

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files ?? []);
    if (!fs.length) return;
    const added: PlaylistItem[] = fs.map((f) => ({
      kind: "file",
      name: f.name.replace(/\.[^.]+$/, ""),
      artist: "Local file",
      dur: 0,
      url: URL.createObjectURL(f),
      kbps: "--",
    }));
    added.forEach((a) => {
      const probe = new Audio();
      probe.preload = "metadata";
      probe.src = a.url as string;
      probe.onloadedmetadata = () =>
        setList((l) => l.map((x) => (x.url === a.url ? { ...x, dur: probe.duration || 0 } : x)));
    });
    setList((l) => [...l, ...added]);
    e.target.value = "";
  };
  const total = list.reduce((a, b) => a + (b.dur || 0), 0);

  return (
    <div className="amp scroll">
      <div className="amp-main">
        <div className="amp-top">
          <div className="amp-lcd">
            <div className={"amp-time" + (playing ? "" : " blink")}>{fmt(pos.cur)}</div>
          </div>
          <canvas ref={canvas} className="vis" width="76" height="30" aria-hidden="true" />
          <div className="amp-title">
            <div className={"marq" + (playing ? " run" : "")}>{title}</div>
          </div>
        </div>
        <div className="amp-meta">
          <span>
            <b>{item.kbps}</b> kbps
          </span>
          <span>
            <b>44</b> khz
          </span>
          <span>
            <b>{item.kind === "synth" ? "SYNTH" : "FILE"}</b>
          </span>
          <span style={{ marginLeft: "auto" }}>{playing ? "▶ PLAYING" : "■ STOPPED"}</span>
        </div>
        <div className="amp-sliders">
          <span className="amp-lbl">VOL {vol}</span>
          <input
            className="amp-sl"
            type="range"
            min="0"
            max="100"
            value={vol}
            onChange={(e) => setVol(+e.target.value)}
            aria-label="Volume"
            style={{ width: 80 }}
          />
          <span className="amp-lbl">BAL</span>
          <input
            className="amp-sl"
            type="range"
            min="-100"
            max="100"
            value={bal}
            onChange={(e) => setBal(+e.target.value)}
            aria-label="Balance"
            style={{ width: 60 }}
          />
          <span className="amp-lbl" style={{ marginLeft: "auto" }}>
            {fmt(pos.len)}
          </span>
        </div>
        <div className="amp-sliders">
          <input
            className="amp-sl seek"
            type="range"
            min="0"
            max="1000"
            value={Math.round(pos.frac * 1000)}
            onChange={(e) => Audio98.seek(+e.target.value / 1000, listRef.current)}
            aria-label="Seek"
          />
        </div>
        <div className="amp-buttons">
          <button className="abtn" title="Previous" onClick={() => start((idx - 1 + list.length) % list.length)}>
            <svg width="12" height="9" viewBox="0 0 12 9" aria-hidden="true">
              <path d="M11 0v9L4 4.5zM4 0v9L0 4.5z" fill="currentColor" />
            </svg>
          </button>
          <button className="abtn wide" title="Play" onClick={() => start(idx)}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M0 0v10l9-5z" fill="currentColor" />
            </svg>
          </button>
          <button
            className="abtn"
            title="Pause"
            onClick={() => {
              Audio98.pause();
              setPlaying(false);
            }}
          >
            <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden="true">
              <rect x="0" y="0" width="3" height="10" fill="currentColor" />
              <rect x="6" y="0" width="3" height="10" fill="currentColor" />
            </svg>
          </button>
          <button
            className="abtn"
            title="Stop"
            onClick={() => {
              Audio98.stop();
              setPlaying(false);
              setPos((p) => ({ ...p, cur: 0, frac: 0 }));
            }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
              <rect width="9" height="9" fill="currentColor" />
            </svg>
          </button>
          <button className="abtn" title="Next" onClick={() => start((idx + 1) % list.length)}>
            <svg width="12" height="9" viewBox="0 0 12 9" aria-hidden="true">
              <path d="M1 0v9l7-4.5zM8 0v9l4-4.5z" fill="currentColor" />
            </svg>
          </button>
          <button className="abtn wide" title="Open file" onClick={() => file.current?.click()}>
            <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true">
              <path d="M6 0l4 4H2z" fill="currentColor" />
              <rect x="1" y="7" width="10" height="3" fill="currentColor" />
            </svg>
          </button>
          <input ref={file} type="file" accept="audio/*" multiple onChange={onFiles} style={{ display: "none" }} />
          <button className={"abtn tog" + (showEq ? " on" : "")} onClick={() => setShowEq((v) => !v)} title="Equalizer">
            EQ
          </button>
          <button
            className={"abtn tog" + (showPl ? " on" : "")}
            style={{ marginLeft: 0 }}
            onClick={() => setShowPl((v) => !v)}
            title="Playlist"
          >
            PL
          </button>
        </div>
      </div>

      {showEq && (
        <div className="amp-eq">
          <div className="eqband" style={{ gap: 6 }}>
            <button className="plbtn" style={{ color: eqOn ? "#26f000" : "#0d5c00" }} onClick={() => setEqOn((v) => !v)}>
              ON
            </button>
            <button className="plbtn" onClick={() => setEqv(EQ_FREQS.map(() => 0))}>
              FLAT
            </button>
          </div>
          {EQ_FREQS.map((f, i) => (
            <div className="eqband" key={f}>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eqv[i]}
                aria-label={f + " hertz"}
                onChange={(e) => setEqv((v) => v.map((x, j) => (j === i ? +e.target.value : x)))}
              />
              <em>{f >= 1000 ? f / 1000 + "k" : f}</em>
            </div>
          ))}
        </div>
      )}

      {showPl && (
        <div className="amp-pl">
          <div className="amp-pl-list scroll">
            {list.map((t, i) => (
              <div
                key={i}
                className={"plrow" + (i === idx ? " cur" : "") + (i === pick ? " pick" : "")}
                onClick={() => setPick(i)}
                onDoubleClick={() => start(i)}
              >
                <span className="n">{i + 1}.</span>
                <span>
                  {t.artist} - {t.name}
                </span>
                <span className="d">{t.dur ? fmt(t.dur) : "--:--"}</span>
              </div>
            ))}
          </div>
          <div className="amp-pl-bar">
            <button className="plbtn" onClick={() => file.current?.click()}>
              ADD
            </button>
            <button
              className="plbtn"
              onClick={() => {
                if (list.length > 1 && list[pick]?.kind === "file") {
                  setList((l) => l.filter((_, i) => i !== pick));
                  setPick(0);
                }
              }}
            >
              REM
            </button>
            <button className="plbtn" onClick={() => start(pick)}>
              PLAY
            </button>
            <span className="pltot">
              {list.length} tracks / {fmt(total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
