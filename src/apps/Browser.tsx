import { useState } from "react";
import type { ReactElement } from "react";

const HOME = "http://www.nostalgia98.com/";

/** The only page on this internet. Everything else gets the 1998 error. */
function HomePage({ go }: { go: (u: string) => void }): ReactElement {
  return (
    <div className="geo">
      <div className="sky">
        <h1>~ * ~ MY HOME PAGE ~ * ~</h1>
        <div className="blink">UNDER CONSTRUCTION — PLEASE SIGN MY GUESTBOOK!</div>
      </div>
      <div className="marqrow">
        <span>★ Welcome to my corner of the World Wide Web! Best viewed in 800x600 with a 56k modem ★</span>
      </div>
      <div className="body">
        <p>
          <b>Hi there!</b> You are visitor number <span className="counter">00013370</span>
        </p>
        <hr />
        <p>
          This page is served from a machine that does not exist, over a connection that was never dialled. Everything
          on the desktop behind this window is drawn from scratch: the bevels are box-shadows, the icons are SVG
          rectangles, and the music is generated one oscillator at a time.
        </p>
        <p>
          <b>My favourite links:</b>
        </p>
        <ul>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); go("http://www.midi-archive.com/"); }}>
              My MIDI collection (37 files)
            </a>
          </li>
          <li>
            <a href="#" onClick={(e) => e.preventDefault()}>Webring: The Teal Desktop Alliance</a>
          </li>
          <li>
            <a href="#" onClick={(e) => e.preventDefault()}>How to defragment your hard drive</a>
          </li>
        </ul>
        <hr />
        <p style={{ fontSize: 12, color: "#555" }}>Last updated: 04.09.1998 · This page is Y2K compliant.</p>
      </div>
    </div>
  );
}

export function BrowserApp() {
  const [hist, setHist] = useState<string[]>([HOME]);
  const [hi, setHi] = useState(0);
  const [addr, setAddr] = useState(HOME);
  const [loading, setLoading] = useState(false);
  const url = hist[hi];

  const go = (u: string) => {
    setLoading(true);
    setTimeout(() => {
      setHist((h) => [...h.slice(0, hi + 1), u]);
      setHi((i) => i + 1);
      setAddr(u);
      setLoading(false);
    }, 420);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="menubar">
        <button>File</button>
        <button>Edit</button>
        <button>View</button>
        <button>Favorites</button>
      </div>
      <div className="ie-bar">
        <button className="btn sm" disabled={hi === 0} onClick={() => { setHi((i) => i - 1); setAddr(hist[hi - 1]); }}>
          ← Back
        </button>
        <button
          className="btn sm"
          disabled={hi >= hist.length - 1}
          onClick={() => { setHi((i) => i + 1); setAddr(hist[hi + 1]); }}
        >
          Forward →
        </button>
        <button className="btn sm" onClick={() => go(HOME)}>Home</button>
        <button className="btn sm" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 350); }}>
          Refresh
        </button>
      </div>
      <div className="ie-bar" style={{ paddingTop: 0 }}>
        <span>Address</span>
        <form style={{ flex: 1, display: "flex" }} onSubmit={(e) => { e.preventDefault(); go(addr); }}>
          <input className="field" style={{ flex: 1 }} value={addr} onChange={(e) => setAddr(e.target.value)} aria-label="Address" />
        </form>
        <button className="btn sm" onClick={() => go(addr)}>Go</button>
      </div>
      <div className="ie-page scroll" style={{ margin: "2px 0" }}>
        {loading ? (
          <div style={{ padding: 24, fontSize: 13 }}>
            Opening page… <span style={{ opacity: 0.6 }}>(connected at 49.3 kbps)</span>
          </div>
        ) : url === HOME ? (
          <HomePage go={go} />
        ) : (
          <div style={{ padding: "22px 26px", fontSize: 13, lineHeight: 1.6, maxWidth: "60ch" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 19 }}>The page cannot be displayed</h2>
            <p>
              The page you are looking for is currently unavailable. The Web site might be experiencing technical
              difficulties, or you may need to adjust your browser settings.
            </p>
            <p style={{ color: "#555" }}>Cannot find server or DNS Error · Nostalgia Explorer</p>
            <p>
              Try <a href="#" onClick={(e) => { e.preventDefault(); go(HOME); }}>the home page</a> instead.
            </p>
          </div>
        )}
      </div>
      <div className="statusbar">
        <div>{loading ? "Opening page…" : "Done"}</div>
        <div>Internet zone</div>
      </div>
    </div>
  );
}
