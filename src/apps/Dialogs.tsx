import { useState } from "react";
import { Ico } from "../system/Icon";
import type { AppId, AppProps, PowerMode } from "../system/types";

export const WALLS: [string, string][] = [
  ["wall-teal", "Teal (default)"],
  ["wall-hatch", "Teal, hatched"],
  ["wall-navy", "Midnight"],
  ["wall-slate", "Slate"],
  ["wall-plum", "Plum"],
  ["wall-clouds", "Clouds"],
];

export function DisplayApp({ sys, win }: AppProps) {
  const [pick, setPick] = useState(sys.wall);
  return (
    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 8, flex: 1, minHeight: 0 }}>
      <div style={{ display: "grid", placeItems: "center", padding: "6px 0" }}>
        <div className="raised" style={{ width: 150, height: 112, padding: 6 }}>
          <div className={pick} style={{ width: "100%", height: "100%", position: "relative", boxShadow: "inset 0 0 0 1px #000" }}>
            <div style={{ position: "absolute", left: 4, top: 4, width: 14, height: 11, background: "#c0c7c8", boxShadow: "0 0 0 1px #000" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 8, background: "#c0c7c8", boxShadow: "inset 0 1px 0 #fff" }} />
          </div>
        </div>
      </div>
      <div className="fset" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <span className="lg">Wallpaper</span>
        <div className="listbox scroll">
          {WALLS.map(([k, label]) => (
            <div
              key={k}
              className={"row" + (pick === k ? " sel" : "")}
              onClick={() => setPick(k)}
              onDoubleClick={() => {
                sys.setWall(k);
                sys.close(win.id);
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        <button className="btn" onClick={() => { sys.setWall(pick); sys.close(win.id); }}>OK</button>
        <button className="btn" onClick={() => sys.close(win.id)}>Cancel</button>
        <button className="btn" onClick={() => sys.setWall(pick)}>Apply</button>
      </div>
    </div>
  );
}

export function WelcomeApp({ sys, win }: AppProps) {
  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <div style={{ width: 92, background: "linear-gradient(#1084d0,#000080)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 10px" }}>
        <Ico n="flag" s={44} />
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ fontSize: 17, fontWeight: "bold" }}>Welcome to Nostalgia 98</div>
        <div style={{ lineHeight: 1.55, fontSize: 12 }}>
          A Windows 98 desktop rebuilt in React — real draggable windows, a music player that synthesizes its own
          soundtrack, and the games you used to open when you were supposed to be working.
        </div>
        <div className="fset" style={{ marginTop: 2 }}>
          <span className="lg">Did you know…</span>
          <div style={{ lineHeight: 1.5 }}>
            Every bevel on this screen is a CSS box-shadow, and every icon is hand-drawn SVG. Nothing here is an image
            file.
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
          <button className="btn" onClick={() => sys.open("amp")}>Play music</button>
          <button className="btn" onClick={() => sys.open("mines")}>Minesweeper</button>
          <button className="btn" onClick={() => sys.close(win.id)}>Close</button>
        </div>
      </div>
    </div>
  );
}

export function AboutApp({ sys, win }: AppProps) {
  return (
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Ico n="flag" s={38} />
        <div style={{ lineHeight: 1.5 }}>
          <b style={{ fontSize: 13 }}>Nostalgia 98</b>
          <br />
          Version 4.10.1998 (Build 2222 A)
          <br />
          A tribute build. Not affiliated with Microsoft.
        </div>
      </div>
      <div className="groove" style={{ height: 2 }} />
      <div style={{ lineHeight: 1.6 }}>
        Built with React 18, the Web Audio API, and a lot of one-pixel borders. Music is generated at runtime — square
        lead, triangle bass, filtered noise for drums.
      </div>
      <div className="fset">
        <span className="lg">System</span>
        <div style={{ lineHeight: 1.5 }}>
          Pentium II 350 MHz
          <br />
          64.0 MB RAM
          <br />
          Display: your browser, running at whatever it likes
        </div>
      </div>
      <button className="btn" style={{ alignSelf: "flex-end", marginTop: "auto" }} onClick={() => sys.close(win.id)}>
        OK
      </button>
    </div>
  );
}

export function DialogApp({ sys, win, props }: AppProps) {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Ico n="info" s={32} />
        <div style={{ lineHeight: 1.5, paddingTop: 3 }}>{props.msg}</div>
      </div>
      <button className="btn" style={{ alignSelf: "center", marginTop: "auto" }} onClick={() => sys.close(win.id)}>
        OK
      </button>
    </div>
  );
}

const RUNMAP: Record<string, AppId> = {
  amp: "amp", winamp: "amp", music: "amp",
  mines: "mines", minesweeper: "mines", winmine: "mines",
  sol: "sol", solitaire: "sol",
  notepad: "notepad", paint: "paint", mspaint: "paint",
  explorer: "ie", iexplore: "ie", browser: "ie",
  computer: "computer", display: "display", about: "about",
};

export function RunApp({ sys, win }: AppProps) {
  const [v, setV] = useState("");
  const run = () => {
    const key = v.trim().toLowerCase().replace(/\.exe$/, "");
    const app = RUNMAP[key];
    if (app) {
      sys.close(win.id);
      sys.open(app);
    } else {
      sys.dialog("Run", "Cannot find the file '" + v + "'. Make sure you typed the name correctly, then try again.");
    }
  };
  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", gap: 11 }}>
        <Ico n="run" s={30} />
        <div style={{ lineHeight: 1.45 }}>Type the name of a program and Windows will open it for you.</div>
      </div>
      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
        <span>Open:</span>
        <form style={{ flex: 1, display: "flex" }} onSubmit={(e) => { e.preventDefault(); run(); }}>
          <input
            className="field"
            autoFocus
            style={{ flex: 1 }}
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="winamp"
            aria-label="Program name"
          />
        </form>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: "auto" }}>
        <button className="btn" onClick={run}>OK</button>
        <button className="btn" onClick={() => sys.close(win.id)}>Cancel</button>
      </div>
    </div>
  );
}

export function ShutApp({ sys, win }: AppProps) {
  const [mode, setMode] = useState<PowerMode>("off");
  const options: [PowerMode, string][] = [["off", "Shut down"], ["restart", "Restart"], ["standby", "Stand by"]];
  return (
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12, flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <Ico n="power" s={32} />
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ marginBottom: 2 }}>What do you want the computer to do?</div>
          {options.map(([k, label]) => (
            <label key={k} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="radio" name="shut" checked={mode === k} onChange={() => setMode(k)} />
              {label}
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: "auto" }}>
        <button className="btn" onClick={() => { sys.close(win.id); sys.power(mode); }}>OK</button>
        <button className="btn" onClick={() => sys.close(win.id)}>Cancel</button>
      </div>
    </div>
  );
}

export function RecycleApp() {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="menubar">
        <button>File</button>
        <button>Edit</button>
        <button>View</button>
      </div>
      <div className="listbox scroll" style={{ margin: "2px 0", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", color: "#555", lineHeight: 1.6, padding: 20 }}>
          <Ico n="recycle" s={40} />
          <div style={{ marginTop: 8 }}>The Recycle Bin is empty.</div>
          <div style={{ opacity: 0.75 }}>Nothing has been thrown away since 1998.</div>
        </div>
      </div>
      <div className="statusbar">
        <div>0 object(s)</div>
        <div>0 bytes</div>
      </div>
    </div>
  );
}
