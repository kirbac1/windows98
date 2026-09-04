import { useMemo, useState } from "react";
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
  onClick,
  onDouble,
}: {
  c: CardT;
  style: React.CSSProperties;
  sel?: boolean;
  onClick?: React.MouseEventHandler;
  onDouble?: React.MouseEventHandler;
}) {
  if (!c.up) return <div className="card back stackpos" style={style} onClick={onClick} />;
  return (
    <div
      className={"card stackpos " + (RED[c.s] ? "red" : "blk") + (sel ? " pick" : "")}
      style={style}
      onClick={onClick}
      onDoubleClick={onDouble}
    >
      <div>
        {RANKS[c.r]}
        {SUITS[c.s]}
      </div>
      <div className="pip">{SUITS[c.s]}</div>
    </div>
  );
}

/** Klondike, click-to-move: pick a card up, click where it goes.
 *  Drag-and-drop looks authentic but is miserable on a trackpad. */
export function SolApp() {
  const [g, setG] = useState(dealGame);
  const [sel, setSel] = useState<Sel | null>(null);
  const [moves, setMoves] = useState(0);
  const won = isWon(g);

  const selCards = useMemo<CardT[]>(() => {
    if (!sel) return [];
    if (sel.z === "w") return g.waste.slice(-1);
    if (sel.z === "f") return g.found[sel.p].slice(-1);
    return g.tab[sel.p].slice(sel.i);
  }, [sel, g]);

  const drop = (z: "t" | "f", p: number): boolean => {
    if (!sel || !selCards.length) return false;
    const cs = selCards;
    const ng = clone(g);
    const removeSel = () => {
      if (sel.z === "w") ng.waste.pop();
      else if (sel.z === "f") ng.found[sel.p].pop();
      else {
        ng.tab[sel.p] = ng.tab[sel.p].slice(0, sel.i);
        const t = ng.tab[sel.p];
        if (t.length && !t[t.length - 1].up) t[t.length - 1].up = true;
      }
    };
    if (z === "t") {
      if (!validRun(cs) || !canTab(cs[0], g.tab[p])) return false;
      if (sel.z === "t" && sel.p === p) return false;
      removeSel();
      ng.tab[p] = [...ng.tab[p], ...cs.map((c) => ({ ...c }))];
    } else {
      if (cs.length !== 1 || !canFound(cs[0], g.found[p], p)) return false;
      removeSel();
      ng.found[p] = [...ng.found[p], { ...cs[0] }];
    }
    setG(ng);
    setSel(null);
    setMoves((m) => m + 1);
    return true;
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

  const clickCard = (z: Zone, p: number, i: number) => {
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
              onClick={() => {
                if (sel) drop("f", i);
              }}
            >
              {f.length ? (
                <Card c={f[f.length - 1]} style={{ top: 0 }} sel={isSel("f", i)} onClick={() => clickCard("f", i, 0)} />
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
