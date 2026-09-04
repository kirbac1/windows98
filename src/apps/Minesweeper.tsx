import { useCallback, useEffect, useState } from "react";
import { Menu } from "../system/Menu";
import { LEVELS, dig, flagsUsed, makeBoard, plant } from "../game/minesweeper";
import type { Cell, Status } from "../game/minesweeper";
import type { AppProps } from "../system/types";

export function MinesApp({ sys, win }: AppProps) {
  const [lvl, setLvl] = useState("Beginner");
  const L = LEVELS[lvl];
  const [b, setB] = useState<Cell[]>(() => makeBoard(L.w, L.h));
  const [status, setStatus] = useState<Status>("idle");
  const [time, setTime] = useState(0);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const reset = useCallback((k: string) => {
    const l = LEVELS[k];
    setB(makeBoard(l.w, l.h));
    setStatus("idle");
    setTime(0);
    setLvl(k);
  }, []);

  useEffect(() => {
    if (status !== "run") return;
    const t = setInterval(() => setTime((v) => Math.min(999, v + 1)), 1000);
    return () => clearInterval(t);
  }, [status]);

  const onDig = (i: number) => {
    if (status === "won" || status === "lost") return;
    const board = status === "idle" ? plant(L, i) : b;
    const r = dig(board, i, L);
    setB(r.board);
    setStatus(r.status);
  };
  const onFlag = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    if (status === "won" || status === "lost" || b[i].open) return;
    setB(b.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
    if (status === "idle") setStatus("run");
  };

  const face = status === "lost" ? "😵" : status === "won" ? "😎" : "🙂";
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="menubar">
        <button
          aria-expanded={!!menu}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setMenu(menu ? null : { x: r.left, y: r.bottom });
          }}
        >
          Game
        </button>
        <button onClick={() => sys.open("about")}>Help</button>
      </div>
      {menu && (
        <Menu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            { label: "New", key: "F2", go: () => reset(lvl) },
            { sep: true },
            ...Object.keys(LEVELS).map((k) => ({ label: (k === lvl ? "• " : "   ") + k, go: () => reset(k) })),
            { sep: true },
            { label: "Exit", go: () => sys.close(win.id) },
          ]}
        />
      )}
      <div className="ms scroll" style={{ flex: 1, minHeight: 0 }}>
        <div className="ms-head" style={{ maxWidth: L.w * 16 + 12 }}>
          <div className="ms-lcd">{String(Math.max(-99, L.m - flagsUsed(b))).padStart(3, "0")}</div>
          <button className="ms-face" onClick={() => reset(lvl)} title="New game">
            {face}
          </button>
          <div className="ms-lcd">{String(time).padStart(3, "0")}</div>
        </div>
        <div
          className="ms-grid"
          style={{ gridTemplateColumns: "repeat(" + L.w + ",16px)" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {b.map((c, i) => (
            <button
              key={i}
              className={
                "cell" + (c.open ? " open" : "") + (c.boom ? " boom" : "") + (c.open && !c.mine && c.n ? " c" + c.n : "")
              }
              onClick={() => onDig(i)}
              onContextMenu={(e) => onFlag(e, i)}
              aria-label={"cell " + ((i % L.w) + 1) + " " + (Math.floor(i / L.w) + 1)}
            >
              {c.flag ? "🚩" : c.open ? (c.mine ? "💣" : c.n || "") : ""}
            </button>
          ))}
        </div>
        <div style={{ opacity: 0.8, paddingTop: 2 }}>Left-click to dig · right-click to flag</div>
      </div>
    </div>
  );
}
