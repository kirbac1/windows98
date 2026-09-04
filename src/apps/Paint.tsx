import { useEffect, useRef, useState } from "react";

const PALETTE = [
  "#000000","#808080","#800000","#808000","#008000","#008080","#000080","#800080","#808040","#004040","#0080ff","#004080","#8000ff","#804000",
  "#ffffff","#c0c0c0","#ff0000","#ffff00","#00ff00","#00ffff","#0000ff","#ff00ff","#ffff80","#00ff80","#80ffff","#8080ff","#ff0080","#ff8040",
];
type Tool = "pencil" | "brush" | "eraser" | "line" | "rect" | "ellipse";
const TOOLS: [Tool, string][] = [
  ["pencil", "✎"], ["brush", "🖌"], ["eraser", "▨"], ["line", "╱"], ["rect", "▭"], ["ellipse", "◯"],
];

export function PaintApp() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const snap = useRef<ImageData | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState(2);

  useEffect(() => {
    const c = cv.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    g.fillStyle = "#fff";
    g.fillRect(0, 0, c.width, c.height);
  }, []);

  const pt = (e: React.PointerEvent) => {
    const r = (cv.current as HTMLCanvasElement).getBoundingClientRect();
    return { x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = cv.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    e.preventDefault();
    c.setPointerCapture(e.pointerId);
    snap.current = g.getImageData(0, 0, c.width, c.height);
    start.current = pt(e);
    g.lineCap = "round";
    g.lineJoin = "round";
    if (tool === "pencil" || tool === "brush" || tool === "eraser") {
      g.beginPath();
      g.moveTo(start.current.x, start.current.y);
      g.strokeStyle = tool === "eraser" ? bg : color;
      g.lineWidth = tool === "brush" ? size * 4 : tool === "eraser" ? size * 6 : size;
      g.lineTo(start.current.x + 0.01, start.current.y);
      g.stroke();
    }
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const g = cv.current?.getContext("2d");
    if (!g || !start.current) return;
    const p = pt(e);
    if (tool === "pencil" || tool === "brush" || tool === "eraser") {
      g.lineTo(p.x, p.y);
      g.stroke();
      return;
    }
    if (snap.current) g.putImageData(snap.current, 0, 0);
    g.strokeStyle = color;
    g.lineWidth = size;
    g.beginPath();
    if (tool === "line") {
      g.moveTo(start.current.x, start.current.y);
      g.lineTo(p.x, p.y);
    }
    if (tool === "rect") g.rect(start.current.x, start.current.y, p.x - start.current.x, p.y - start.current.y);
    if (tool === "ellipse") {
      const rx = Math.abs(p.x - start.current.x) / 2;
      const ry = Math.abs(p.y - start.current.y) / 2;
      g.ellipse(Math.min(p.x, start.current.x) + rx, Math.min(p.y, start.current.y) + ry, rx, ry, 0, 0, Math.PI * 2);
    }
    g.stroke();
  };
  const up = () => {
    start.current = null;
  };
  const clear = () => {
    const c = cv.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    g.fillStyle = bg;
    g.fillRect(0, 0, c.width, c.height);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="paint">
        <div className="paint-tools">
          {TOOLS.map(([t, glyph]) => (
            <button key={t} className={"ptool" + (tool === t ? " on" : "")} title={t} onClick={() => setTool(t)}>
              {glyph}
            </button>
          ))}
          <button className="ptool" title="Clear canvas" style={{ gridColumn: "span 2", width: "auto" }} onClick={clear}>
            Clear
          </button>
          <div style={{ gridColumn: "span 2", display: "flex", gap: 2, marginTop: 4 }}>
            {[1, 2, 4, 7].map((s) => (
              <button
                key={s}
                className={"ptool" + (size === s ? " on" : "")}
                style={{ width: 24 }}
                onClick={() => setSize(s)}
                aria-label={"Brush size " + s}
              >
                <span style={{ display: "block", width: s + 4, height: s + 2, background: "#000", borderRadius: 9 }} />
              </button>
            ))}
          </div>
        </div>
        <div className="paint-canvaswrap scroll">
          <canvas
            ref={cv}
            width="520"
            height="330"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerLeave={up}
          />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", padding: "0 4px 4px" }}>
        <div className="pal-cur">
          <i style={{ background: color }} />
        </div>
        <div className="pal">
          {PALETTE.map((c) => (
            <button
              key={c}
              style={{ background: c }}
              title={c}
              aria-label={"Colour " + c}
              onClick={() => setColor(c)}
              onContextMenu={(e) => {
                e.preventDefault();
                setBg(c);
              }}
            />
          ))}
        </div>
        <div style={{ marginLeft: "auto", paddingRight: 6, opacity: 0.8 }}>
          Right-click a swatch to set the eraser colour
        </div>
      </div>
    </div>
  );
}
