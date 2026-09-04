import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ico } from "./system/Icon";
import { Menu } from "./system/Menu";
import { Win } from "./system/Window";
import { chime } from "./system/chime";
import { fit, viewport } from "./system/geometry";
import { ScreenSaver } from "./system/ScreenSaver";
import { wallpaperById } from "./data/wallpapers";
import { APPS, DESK, SUBMENUS } from "./system/registry";
import type { DesktopKey } from "./system/registry";
import { NOTES, README } from "./data/fs";
import type { AppId, LaunchProps, PowerMode, Settings, Sys, WindowState } from "./system/types";

type Power = "on" | "off" | "boot" | "standby" | "crash";

export function App() {
  const [wins, setWins] = useState<WindowState[]>([]);
  const [settings, setSettingsState] = useState<Settings>({ wall: "teal", saver: "starfield", saverWait: 3 });
  const [saverOn, setSaverOn] = useState(false);
  const lastAct = useRef(Date.now());
  const [startOpen, setStartOpen] = useState(false);
  const [sub, setSub] = useState<{ k: string; top: number } | null>(null);
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);
  const [selIcon, setSelIcon] = useState("");
  const [power, setPower] = useState<Power>("on");
  const [now, setNow] = useState(() => new Date());
  const [sized, setSized] = useState(() => typeof window !== "undefined" && window.innerWidth > 0);

  const seq = useRef(1);
  const zc = useRef(10);
  const casc = useRef(0);
  const coarse = useRef(typeof matchMedia === "function" && matchMedia("(pointer:coarse)").matches);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  /* Wait for a viewport with a size before placing anything on it. */
  useEffect(() => {
    if (sized) return;
    const check = () => {
      if (window.innerWidth > 0) setSized(true);
    };
    const raf = requestAnimationFrame(check);
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", check);
    };
  }, [sized]);

  /* Resizing the browser must not strand a window off-screen. */
  useEffect(() => {
    const onResize = () => setWins((ws) => ws.map((w) => ({ ...w, ...fit(w) })));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const open = useCallback((appId: AppId, props?: LaunchProps | null, title?: string | null, at?: { x: number; y: number }) => {
    setWins((ws) => {
      const a = APPS[appId];
      if (!a) return ws;
      if (!a.multi) {
        const ex = ws.find((w) => w.appId === appId);
        if (ex) return ws.map((w) => (w.id === ex.id ? { ...w, min: false, z: ++zc.current } : w));
      }
      const id = seq.current++;
      const n = casc.current++;
      const minW = a.minW ?? 200;
      const minH = a.minH ?? 120;
      // Windows that are not placed explicitly cascade down and to the
      // right, the way a fresh Explorer window always did.
      const placed = fit({
        x: at ? at.x : 46 + (n % 7) * 26,
        y: at ? at.y : 30 + (n % 7) * 24,
        w: a.w, h: a.h, minW, minH,
      });
      return [
        ...ws,
        {
          id, appId, title: title || a.title, icon: a.icon, ...placed,
          z: ++zc.current, min: false, max: false, props: props ?? {},
          resizable: a.resizable !== false, minW, minH,
        },
      ];
    });
  }, []);

  const setSettings = useCallback((patch: Partial<Settings>) => setSettingsState((s) => ({ ...s, ...patch })), []);

  const sys = useMemo<Sys>(
    () => ({
      open,
      settings,
      setSettings,
      dialog: (title: string, msg: string) => open("dialog", { msg }, title),
      close: (id) => setWins((ws) => ws.filter((w) => w.id !== id)),
      min: (id) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, min: true } : w))),
      max: (id) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, max: !w.max, z: ++zc.current } : w))),
      update: (id, patch) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w))),
      focus: (id) =>
        setWins((ws) => {
          const top = ws.reduce((m, w) => (w.min ? m : Math.max(m, w.z)), 0);
          const t = ws.find((w) => w.id === id);
          if (!t || t.z === top) return ws;
          return ws.map((w) => (w.id === id ? { ...w, z: ++zc.current } : w));
        }),
      power: (m: PowerMode) =>
        setPower(m === "restart" ? "boot" : m === "standby" ? "standby" : m === "crash" ? "crash" : "off"),
    }),
    [open, settings, setSettings],
  );

  const launch = useCallback(
    (k: DesktopKey | "notes") => {
      if (k === "readme") open("notepad", { body: README }, "README.TXT - Notepad");
      else if (k === "notes") open("notepad", { body: NOTES }, "NOTES.TXT - Notepad");
      else open(k);
    },
    [open],
  );

  /* First run, and every reboot: a desktop that is already doing something. */
  useEffect(() => {
    if (power !== "on" || !sized) return;
    setWins([]);
    casc.current = 0;
    const { vw } = viewport();
    open("welcome", null, null, { x: Math.round(vw * 0.06), y: 52 });
    open("amp", null, null, { x: vw - 478, y: 34 });
  }, [power, sized, open]);

  /* Screen saver: any input is activity; a minute counter does the rest. */
  useEffect(() => {
    const bump = () => {
      lastAct.current = Date.now();
    };
    const evts = ["pointermove", "pointerdown", "keydown", "wheel"] as const;
    evts.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const t = setInterval(() => {
      if (power !== "on" || settings.saver === "none") return;
      if (Date.now() - lastAct.current > settings.saverWait * 60000) setSaverOn(true);
    }, 1000);
    return () => {
      clearInterval(t);
      evts.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [power, settings.saver, settings.saverWait]);

  /* Ctrl+Alt+Del, and Escape to dismiss whatever menu is open. */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        const tasks = [
          ...wins.filter((w) => w.appId !== "closeprogram").map((w) => ({ id: w.id, label: w.title })),
          { id: -1, label: "Systray" },
          { id: -2, label: "Explorer" },
        ];
        open("closeprogram", { msg: JSON.stringify(tasks) }, "Close Program");
      }
      if (e.key === "Escape") {
        setStartOpen(false);
        setSub(null);
        setCtx(null);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [wins, open]);

  useEffect(() => {
    if (power !== "boot") return;
    const t = setTimeout(() => {
      setPower("on");
      chime();
    }, 2600);
    return () => clearTimeout(t);
  }, [power]);

  if (power === "boot")
    return (
      <div className="bootscreen">
        <div className="bootlogo">
          Nostalgia <em>98</em>
        </div>
        <div className="bootbar">
          <i />
        </div>
        <div className="bootmsg">Starting Nostalgia 98…</div>
      </div>
    );
  if (power === "crash")
    return (
      <div className="bsod" onClick={() => setPower("boot")}>
        <div className="bsod-inner">
          <div className="bsod-title">Nostalgia</div>
          <p>A fatal exception 0E has occurred at 0028:C0011E36. The current application will be terminated.</p>
          <ul>
            <li>Press any key to terminate the current application.</li>
            <li>Press CTRL+ALT+DEL again to restart your computer. You will lose any unsaved information in all applications.</li>
          </ul>
          <p className="bsod-press">Press any key to continue <span className="caret">_</span></p>
        </div>
      </div>
    );
  if (power === "off")
    return (
      <div className="shutscreen">
        <div style={{ display: "flex", flexDirection: "column", gap: 34, alignItems: "center" }}>
          <div className="shuttext">It's now safe to turn off your computer.</div>
          <button className="btn" style={{ minWidth: 120 }} onClick={() => setPower("boot")}>
            Restart
          </button>
        </div>
      </div>
    );
  if (power === "standby")
    return (
      <div className="shutscreen" onClick={() => setPower("on")} style={{ cursor: "pointer" }}>
        <div className="shuttext" style={{ color: "#4a6a8a", fontSize: 26 }}>
          Standing by.
          <br />
          Click anywhere to wake.
        </div>
      </div>
    );

  const visible = wins.filter((w) => !w.min);
  const top = visible.reduce((m, w) => Math.max(m, w.z), 0);
  const closeAll = () => {
    setStartOpen(false);
    setSub(null);
    setCtx(null);
  };

  return (
    <>
      <div
        className="desktop"
        style={{ background: wallpaperById(settings.wall).background }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("icons")) {
            setSelIcon("");
            closeAll();
          }
        }}
        onContextMenu={(e) => {
          if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains("icons")) return;
          e.preventDefault();
          setStartOpen(false);
          setCtx({ x: e.clientX, y: e.clientY });
        }}
      >
        <div className="icons">
          {DESK.map((d) => (
            <button
              key={d.k}
              className={"dicon" + (selIcon === d.k ? " sel" : "")}
              onClick={() => {
                setSelIcon(d.k);
                if (coarse.current) launch(d.k);
              }}
              onDoubleClick={() => launch(d.k)}
            >
              <Ico n={d.icon} s={32} />
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        {wins.map((w) => {
          const A = APPS[w.appId];
          return (
            <Win key={w.id} w={w} active={w.z === top} sys={sys}>
              <A.C sys={sys} win={w} props={w.props} />
            </Win>
          );
        })}
      </div>

      {ctx && (
        <Menu
          x={ctx.x}
          y={ctx.y}
          onClose={() => setCtx(null)}
          items={[
            { label: "Arrange Icons", disabled: true },
            { label: "Refresh", go: () => undefined },
            { sep: true },
            { label: "New Folder", disabled: true },
            { sep: true },
            { label: "Properties", go: () => open("display") },
          ]}
        />
      )}

      {startOpen && (
        <div className="startmenu" onPointerDown={(e) => e.stopPropagation()} onMouseLeave={() => setSub(null)}>
          <div className="startbar">
            <b>
              Nostalgia<i>98</i>
            </b>
          </div>
          <div className="startitems" style={{ position: "relative" }}>
            {[
              ["programs", "Programs", "folder"],
              ["documents", "Documents", "file"],
              ["settings", "Settings", "display"],
            ].map(([k, label, ic]) => (
              <button key={k} className="sitem" onMouseEnter={(e) => setSub({ k, top: e.currentTarget.offsetTop })}>
                <Ico n={ic} s={22} />
                <span>{label}</span>
                <span className="arw">▸</span>
              </button>
            ))}
            <button className="sitem" onMouseEnter={() => setSub(null)} onClick={() => { closeAll(); open("about"); }}>
              <Ico n="info" s={22} />
              Help
            </button>
            <button className="sitem" onMouseEnter={() => setSub(null)} onClick={() => { closeAll(); open("run"); }}>
              <Ico n="run" s={22} />
              Run…
            </button>
            <div className="groove" style={{ height: 2, margin: "3px 2px" }} />
            <button className="sitem" onMouseEnter={() => setSub(null)} onClick={() => { closeAll(); open("shutdown"); }}>
              <Ico n="power" s={22} />
              Shut Down…
            </button>
            {sub && (
              <div className="submenu" style={{ top: sub.top }}>
                {SUBMENUS[sub.k].map((it) => (
                  <button
                    key={it.label}
                    className="sitem"
                    onClick={() => {
                      closeAll();
                      launch(it.k);
                    }}
                  >
                    <Ico n={it.icon} s={18} />
                    {it.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="taskbar">
        <button
          className={"startbtn" + (startOpen ? " on" : "")}
          onClick={() => {
            setStartOpen((v) => !v);
            setSub(null);
            setCtx(null);
          }}
        >
          <Ico n="flag" s={17} />
          Start
        </button>
        <div className="tsplit" />
        <div className="quick">
          <button title="Show Desktop" onClick={() => setWins((ws) => ws.map((w) => ({ ...w, min: true })))}>
            <svg width="15" height="15" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
              <rect x="1" y="2" width="12" height="9" fill="#c0c7c8" stroke="#000" />
              <rect x="1" y="2" width="12" height="2" fill="#000080" />
              <path d="M5 13h9M11 11l3 2-3 2" stroke="#000" fill="none" />
            </svg>
          </button>
          <button title="Nostalgia Explorer" onClick={() => open("ie")}><Ico n="ie" s={15} /></button>
          <button title="Nostalgia Amp" onClick={() => open("amp")}><Ico n="amp" s={15} /></button>
        </div>
        <div className="tsplit" />
        <div className="tasks">
          {wins.map((w) => (
            <button
              key={w.id}
              className={"taskbtn" + (!w.min && w.z === top ? " on" : "")}
              onClick={() => {
                if (w.min) sys.update(w.id, { min: false, z: ++zc.current });
                else if (w.z === top) sys.min(w.id);
                else sys.focus(w.id);
              }}
            >
              <Ico n={w.icon} s={15} />
              <span>{w.title}</span>
            </button>
          ))}
        </div>
        <div className="tray">
          <svg width="15" height="14" viewBox="0 0 16 14" shapeRendering="crispEdges" aria-hidden="true">
            <path d="M2 5h3l4-3v10L5 9H2z" fill="#000" />
            <path d="M11 4c2 2 2 6 0 8" stroke="#000" fill="none" />
          </svg>
          <span className="clock" title={now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" })}>
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {saverOn && (
        <ScreenSaver
          kind={settings.saver}
          onWake={() => {
            lastAct.current = Date.now();
            setSaverOn(false);
          }}
        />
      )}
    </>
  );
}
