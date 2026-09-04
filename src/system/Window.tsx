import { useCallback } from "react";
import type { ReactNode, PointerEvent as RPointerEvent } from "react";
import { Ico } from "./Icon";
import type { Sys, WindowState } from "./types";

/** A window: dragged by its title bar, resized from the grip, raised on
 *  any click inside it. Pointer events are captured on window rather than
 *  on the element so a fast drag cannot outrun the cursor. */
export function Win({
  w,
  active,
  sys,
  children,
}: {
  w: WindowState;
  active: boolean;
  sys: Sys;
  children: ReactNode;
}) {
  const drag = useCallback(
    (e: RPointerEvent<HTMLElement>, mode: "move" | "size") => {
      if (e.button !== 0) return;
      e.preventDefault();
      sys.focus(w.id);
      if (w.max) return;
      const sx = e.clientX;
      const sy = e.clientY;
      const o = { x: w.x, y: w.y, w: w.w, h: w.h };
      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - sx;
        const dy = ev.clientY - sy;
        if (mode === "move")
          sys.update(w.id, {
            x: Math.min(window.innerWidth - 60, Math.max(-w.w + 90, o.x + dx)),
            y: Math.min(window.innerHeight - 56, Math.max(0, o.y + dy)),
          });
        else
          sys.update(w.id, {
            w: Math.max(w.minW, o.w + dx),
            h: Math.max(w.minH, o.h + dy),
          });
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [w, sys],
  );

  if (w.min) return null;
  const st = w.max
    ? { left: 0, top: 0, width: "100%", height: "100%", zIndex: w.z }
    : { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z };

  return (
    <div className={"win" + (active ? "" : " blur")} style={st} onPointerDown={() => sys.focus(w.id)}>
      <div className="titlebar" onPointerDown={(e) => drag(e, "move")} onDoubleClick={() => sys.max(w.id)}>
        <Ico n={w.icon} s={13} />
        <div className="t">{w.title}</div>
        <button
          className="tbtn"
          title="Minimize"
          onClick={(e) => {
            e.stopPropagation();
            sys.min(w.id);
          }}
        >
          <svg width="7" height="7" viewBox="0 0 7 7" aria-hidden="true">
            <rect x="0" y="5" width="6" height="2" fill="#000" />
          </svg>
        </button>
        <button
          className="tbtn"
          title="Maximize"
          onClick={(e) => {
            e.stopPropagation();
            sys.max(w.id);
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="0" y="0" width="8" height="8" fill="none" stroke="#000" />
            <rect x="0" y="0" width="8" height="2" fill="#000" />
          </svg>
        </button>
        <button
          className="tbtn close"
          title="Close"
          onClick={(e) => {
            e.stopPropagation();
            sys.close(w.id);
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
            <path d="M1 1l6 6M7 1L1 7" stroke="#000" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
      <div className="winbody">{children}</div>
      {!w.max && w.resizable && <div className="grip" onPointerDown={(e) => drag(e, "size")} />}
    </div>
  );
}
