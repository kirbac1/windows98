import { useEffect, useRef } from "react";
import type { SaverKind } from "./types";

/** The screen savers, drawn on one full-screen canvas.
 *
 *  Any input dismisses them, which is the whole interaction model these
 *  ever had. Each one is a few dozen lines of the same maths the
 *  originals used — stars projected from a moving Z, logos scaled by
 *  distance, and a polygon whose corners bounce around the edges. */
export function ScreenSaver({ kind, onWake }: { kind: SaverKind; onWake: () => void }) {
  const cv = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wake = () => onWake();
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [onWake]);

  useEffect(() => {
    const c = cv.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    let raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      c.width = Math.floor(window.innerWidth * dpr);
      c.height = Math.floor(window.innerHeight * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    const W = () => c.width / dpr;
    const H = () => c.height / dpr;

    const stars = Array.from({ length: 260 }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random(),
    }));
    const logos = Array.from({ length: 26 }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random(),
    }));
    const poly = {
      pts: Array.from({ length: 4 }, () => ({
        x: Math.random() * 600,
        y: Math.random() * 400,
        vx: (Math.random() * 2 - 1) * 2.4,
        vy: (Math.random() * 2 - 1) * 2.4,
      })),
      trail: [] as { x: number; y: number }[][],
      hue: 200,
    };

    /** The four-pane flag, drawn small enough to read as a logo. */
    const flag = (x: number, y: number, s: number) => {
      const q = [
        ["#f24040", 0, 0],
        ["#39c552", 1, 0],
        ["#39a5f2", 0, 1],
        ["#f2c93a", 1, 1],
      ] as const;
      for (const [col, cx, cy] of q) {
        g.fillStyle = col;
        g.beginPath();
        g.moveTo(x + cx * s * 0.55 - s * 0.1 * cy, y + cy * s * 0.55 + s * 0.08 * cx);
        g.lineTo(x + cx * s * 0.55 + s * 0.45 - s * 0.1 * cy, y + cy * s * 0.55 - s * 0.06 + s * 0.08 * cx);
        g.lineTo(x + cx * s * 0.55 + s * 0.45 - s * 0.1 * cy, y + cy * s * 0.55 + s * 0.42 + s * 0.08 * cx);
        g.lineTo(x + cx * s * 0.55 - s * 0.1 * cy, y + cy * s * 0.55 + s * 0.48 + s * 0.08 * cx);
        g.closePath();
        g.fill();
      }
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const w = W();
      const h = H();
      const cx = w / 2;
      const cy = h / 2;

      if (kind === "mystify") {
        g.fillStyle = "rgba(0,0,0,.12)";
        g.fillRect(0, 0, w, h);
        for (const p of poly.pts) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          p.x = Math.max(0, Math.min(w, p.x));
          p.y = Math.max(0, Math.min(h, p.y));
        }
        poly.trail.push(poly.pts.map((p) => ({ x: p.x, y: p.y })));
        if (poly.trail.length > 18) poly.trail.shift();
        poly.hue = (poly.hue + 0.6) % 360;
        poly.trail.forEach((snap, i) => {
          g.strokeStyle = `hsl(${(poly.hue + i * 6) % 360} 90% ${30 + (i / poly.trail.length) * 45}%)`;
          g.lineWidth = 2;
          g.beginPath();
          snap.forEach((p, j) => (j ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
          g.closePath();
          g.stroke();
        });
        return;
      }

      g.fillStyle = "#000";
      g.fillRect(0, 0, w, h);
      const field = kind === "flying" ? logos : stars;
      for (const s of field) {
        s.z -= kind === "flying" ? 0.006 : 0.011;
        if (s.z <= 0.02) {
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
          s.z = 1;
        }
        const k = 0.55 / s.z;
        const px = cx + s.x * k * cx;
        const py = cy + s.y * k * cy;
        if (px < -60 || px > w + 60 || py < -60 || py > h + 60) continue;
        if (kind === "flying") {
          flag(px, py, Math.max(4, 26 * (1 - s.z)));
        } else {
          const r = Math.max(0.6, 2.6 * (1 - s.z));
          const shade = Math.round(120 + 135 * (1 - s.z));
          g.fillStyle = `rgb(${shade},${shade},${shade})`;
          g.beginPath();
          g.arc(px, py, r, 0, Math.PI * 2);
          g.fill();
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [kind]);

  return <canvas ref={cv} className="saver" />;
}
