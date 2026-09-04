import { useEffect, useRef } from "react";

export interface MenuItem {
  label?: string;
  key?: string;
  sep?: boolean;
  disabled?: boolean;
  go?: () => void;
}

/** A dropdown that closes when you click anywhere else — the behaviour is
 *  the same whether it hangs off a menu bar, the Start button, or a
 *  right-click on the desktop. */
export function Menu({ items, x, y, onClose }: { items: MenuItem[]; x: number; y: number; onClose: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const h = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("pointerdown", h, true);
    return () => window.removeEventListener("pointerdown", h, true);
  }, [onClose]);
  return (
    <div className="menupop" ref={ref} style={{ left: x, top: y }}>
      {items.map((it, i) =>
        it.sep ? (
          <hr key={i} />
        ) : (
          <button
            key={i}
            disabled={it.disabled}
            onClick={() => {
              onClose();
              it.go?.();
            }}
          >
            <span>{it.label}</span>
            {it.key && <span className="k">{it.key}</span>}
          </button>
        ),
      )}
    </div>
  );
}
