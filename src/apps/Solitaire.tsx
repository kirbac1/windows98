import { useCallback, useMemo, useRef, useState } from "react";
import { Ico } from "../system/Icon";
import {
  RANKS,
  RED,
  SUITS,
  autoFinish,
  canFound,
  canTab,
  clone,
  dealGame,
  drawFromStock,
  isWon,
  validRun,
} from "../game/solitaire";
import type { Card as CardT } from "../game/solitaire";

type Zone = "w" | "f" | "t";
interface Sel {
  z: Zone;
  p: number;
  i: number;
}

function Card({
  c,
  style,
  sel,
  ghost,
  onClick,
  onDouble,
  onDown,
}: {
  c: CardT;
  style: React.CSSProperties;
  sel?: boolean;
  ghost?: boolean;
  onClick?: React.MouseEventHandler;
  onDouble?: React.MouseEventHandler;
  onDown?: React.PointerEventHandler;
}) {
  if (!c.up)
    return <div className="card back stackpos" style={style} onClick={onClick} onPointerDown={onDown} />;
  return (
    <div
      className={"card stackpos " + (RED[c.s] ? "red" : "blk") + (sel ? " pick" : "") + (ghost ? " ghost" : "")}
      style={style}
      onClick={onClick}
      onDoubleClick={onDouble}
      onPointerDown={onDown}
    >
      <div>
        {RANKS[c.r]}
        {SUITS[c.s]}
      </div>
      <div className="pip">{SUITS[c.s]}</div>
    </div>
  );
}

/** What the pointer picked up but has not yet committed to dragging. */
interface Pending {
  from: Sel;
  cards: CardT[];
  sx: number;
  sy: number;
  ox: number;
  oy: number;
}
interface Drag extends Pending {
  x: number;
  y: number;
}

/** Klondike. Cards can be dragged the way they always were, and a plain
 *  click still picks a card up and puts it down — which is the kinder
 *  option on a trackpad. */
export function SolApp() {
  const [g, setG] = useState(dealGame);
  const [sel, setSel] = useState<Sel | null>(null);
  const [moves, setMoves] = useState(0);
  const [drag, setDrag] = useState<Drag | null>(null);
  const pending = useRef<Pending | null>(null);
  const dragged = useRef(false);
  const won = isWon(g);

  const selCards = useMemo<CardT[]>(() => {
    if (!sel) return [];
    if (sel.z === "w") return g.waste.slice(-1);
    if (sel.z === "f") return g.found[sel.p].slice(-1);
    return g.tab[sel.p].slice(sel.i);
  }, [sel, g]);

  /** Apply a move. Used by both the click path and the drag path. */
  const applyMove = (from: Sel, cs: CardT[], z: "t" | "f", p: number): boolean => {
    if (!cs.length) return false;
    const ng = clone(g);
    const removeFrom = () => {
      if (from.z === "w") ng.waste.pop();
      else if (from.z === "f") ng.found[from.p].pop();
      else {
        ng.tab[from.p] = ng.tab[from.p].slice(0, from.i);
        const t = ng.tab[from.p];
        if (t.length && !t[t.length - 1].up) t[t.length - 1].up = true;
      }
    };
    if (z === "t") {
      if (!validRun(cs) || !canTab(cs[0], g.tab[p])) return false;
      if (from.z === "t" && from.p === p) return false;
      removeFrom();
      ng.tab[p] = [...ng.tab[p], ...cs.map((c) => ({ ...c }))];
    } else {
      if (cs.length !== 1 || !canFound(cs[0], g.found[p], p)) return false;
      removeFrom();
      ng.found[p] = [...ng.found[p], { ...cs[0] }];
    }
    setG(ng);
    setSel(null);
    setMoves((m) => m + 1);
    return true;
  };

  const drop = (z: "t" | "f", p: number): boolean => {
    if (!sel || !selCards.length) return false;
    const cs = selCards;
    return applyMove(sel, cs, z, p);
  };

  const sendHome = (z: "w" | "t", p = 0, i = 0) => {
    const c = z === "w" ? g.waste[g.waste.length - 1] : g.tab[p][i];
    if (!c || !c.up) return;
    if (z === "t" && i !== g.tab[p].length - 1) return;
    if (!canFound(c, g.found[c.s], c.s)) return;
    const ng = clone(g);
    if (z === "w") ng.waste.pop();
    else {
      ng.tab[p].pop();
      const t = ng.tab[p];
      if (t.length && !t[t.length - 1].up) t[t.length - 1].up = true;
    }
    ng.found[c.s] = [...ng.found[c.s], { ...c }];
    setG(ng);
    setSel(null);
    setMoves((m) => m + 1);
  };

  /** Where the pointer let go. The drag layer is pointer-events:none, so
   *  elementFromPoint reports the pile underneath rather than the cards
   *  being carried. */
  const dropTargetAt = (x: number, y: number): { z: "t" | "f"; p: number } | null => {
    const el = document.elementFromPoint(x, y);
    const holder = el && (el as HTMLElement).closest<HTMLElement>("[data-drop]");
    const spec = holder?.dataset.drop;
    if (!spec) return null;
    const [z, p] = spec.split(":");
    return z === "t" || z === "f" ? { z, p: Number(p) } : null;
  };

  const startDrag = useCallback(
    (e: React.PointerEvent, from: Sel, cards: CardT[]) => {
      if (e.button !== 0 || !cards.length || !cards[0].up || !validRun(cards)) return;
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      pending.current = { from, cards, sx: e.clientX, sy: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top };
      dragged.current = false;

      const move = (ev: PointerEvent) => {
        const pd = pending.current;
        if (!pd) return;
        // A few pixels of slop, so a slightly shaky click is still a click.
        if (!dragged.current && Math.hypot(ev.clientX - pd.sx, ev.clientY - pd.sy) < 5) return;
        dragged.current = true;
        setDrag({ ...pd, x: ev.clientX, y: ev.clientY });
      };
      const up = (ev: PointerEvent) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        const pd = pending.current;
        pending.current = null;
        setDrag(null);
        if (!pd || !dragged.current) return;
        const target = dropTargetAt(ev.clientX, ev.clientY);
        if (target) applyMove(pd.from, pd.cards, target.z, target.p);
        // Swallow the click that follows a drag, so it cannot also select.
        setTimeout(() => (dragged.current = false), 0);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    // applyMove closes over the current game; re-created each render is fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [g],
  );

  const clickCard = (z: Zone, p: number, i: number) => {
    if (dragged.current) return;
    if (sel && drop(z === "f" ? "f" : "t", p)) return;
    if (z === "t") {
      const c = g.tab[p][i];
      if (!c.up) {
        if (i === g.tab[p].length - 1) {
          const ng = clone(g);
          ng.tab[p][i].up = true;
          setG(ng);
        }
        return;
      }
      if (!validRun(g.tab[p].slice(i))) return;
      setSel(sel && sel.z === "t" && sel.p === p && sel.i === i ? null : { z: "t", p, i });
    } else if (z === "w") {
      setSel(sel && sel.z === "w" ? null : { z: "w", p: 0, i: 0 });
    } else if (g.found[p].length) {
      setSel(sel && sel.z === "f" && sel.p === p ? null : { z: "f", p, i: 0 });
    }
  };

  const isSel = (z: Zone, p = 0, i = 0) =>
    !!sel && sel.z === z && (z === "w" || sel.p === p) && (z !== "t" || i >= sel.i);

  /** A card that is currently in the air is hidden where it came from. */
  const isGhost = (z: Zone, p = 0, i = 0) =>
    !!drag && drag.from.z === z && (z === "w" || drag.from.p === p) && (z !== "t" || i >= drag.from.i);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="sol-bar">
        <button
          className="btn sm"
          onClick={() => {
            setG(dealGame());
            setSel(null);
            setMoves(0);
          }}
        >
          Deal
        </button>
        <button
          className="btn sm"
          onClick={() => {
            setG(autoFinish(g));
            setSel(null);
          }}
        >
          Auto-finish
        </button>
        <span style={{ marginLeft: "auto", paddingRight: 6 }}>Moves: {moves}</span>
      </div>
      <div className="sol scroll">
        <div className="sol-top">
          <div
            className="pile"
            onClick={() => {
              setG(drawFromStock(g));
              setSel(null);
              setMoves((m) => m + 1);
            }}
          >
            {g.stock.length ? <div className="card back stackpos" style={{ top: 0 }} /> : <div className="slot">↻</div>}
          </div>
          <div className="pile">
            {g.waste.length ? (
              <Card
                c={g.waste[g.waste.length - 1]}
                style={{ top: 0 }}
                sel={isSel("w")}
                ghost={isGhost("w")}
                onDown={(e) => startDrag(e, { z: "w", p: 0, i: 0 }, g.waste.slice(-1))}
                onClick={() => clickCard("w", 0, 0)}
                onDouble={() => sendHome("w")}
              />
            ) : (
              <div className="slot" />
            )}
          </div>
          <div style={{ width: 24 }} />
          {g.found.map((f, i) => (
            <div
              className="pile"
              key={i}
              data-drop={"f:" + i}
              onClick={() => {
                if (sel) drop("f", i);
              }}
            >
              {f.length ? (
                <Card
                  c={f[f.length - 1]}
                  style={{ top: 0 }}
                  sel={isSel("f", i)}
                  ghost={isGhost("f", i)}
                  onDown={(e) => startDrag(e, { z: "f", p: i, i: 0 }, f.slice(-1))}
                  onClick={() => clickCard("f", i, 0)}
                />
              ) : (
                <div className="slot" style={{ color: RED[i] ? "rgba(255,150,150,.5)" : "rgba(255,255,255,.35)" }}>
                  {SUITS[i]}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="sol-cols">
          {g.tab.map((t, p) => {
            let off = 0;
            const tops = t.map((c) => {
              const v = off;
              off += c.up ? 18 : 7;
              return v;
            });
            return (
              <div
                className="pile"
                key={p}
                data-drop={"t:" + p}
                style={{ minHeight: Math.max(74, off + 74) }}
                onClick={() => {
                  if (sel && !t.length) drop("t", p);
                }}
              >
                {!t.length && <div className="slot" />}
                {t.map((c, i) => (
                  <Card
                    key={c.id}
                    c={c}
                    style={{ top: tops[i] }}
                    sel={isSel("t", p, i)}
                    ghost={isGhost("t", p, i)}
                    onDown={(e) => startDrag(e, { z: "t", p, i }, t.slice(i))}
                    onClick={(e) => {
                      e.stopPropagation();
                      clickCard("t", p, i);
                    }}
                    onDouble={() => sendHome("t", p, i)}
                  />
                ))}
              </div>
            );
          })}
        </div>
        {drag && (
          <div className="dragging" style={{ left: drag.x - drag.ox, top: drag.y - drag.oy }}>
            {drag.cards.map((c, i) => (
              <div
                key={c.id}
                className={"card stackpos " + (RED[c.s] ? "red" : "blk")}
                style={{ top: i * 18 }}
              >
                <div>
                  {RANKS[c.r]}
                  {SUITS[c.s]}
                </div>
                <div className="pip">{SUITS[c.s]}</div>
              </div>
            ))}
          </div>
        )}
        {won && (
          <div className="sol-win">
            <div>
              <Ico n="cards" s={32} />
              <b>You win.</b>
              <span>Cleared in {moves} moves.</span>
              <button
                className="btn"
                onClick={() => {
                  setG(dealGame());
                  setMoves(0);
                }}
              >
                Deal again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
