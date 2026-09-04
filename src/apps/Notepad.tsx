import { useState } from "react";
import { Menu } from "../system/Menu";
import type { AppProps } from "../system/types";

export function NotepadApp({ sys, win, props }: AppProps) {
  const [text, setText] = useState(props.body ?? "");
  const [wrap, setWrap] = useState(true);
  const [menu, setMenu] = useState<{ k: string; x: number; y: number } | null>(null);

  const openMenu = (k: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMenu(menu?.k === k ? null : { k, x: r.left, y: r.bottom });
  };
  const save = () => {
    try {
      localStorage.setItem("n98:notepad", text);
      sys.dialog("Notepad", "Saved to Untitled.txt on this machine.");
    } catch {
      sys.dialog("Notepad", "Could not save — this browser is blocking local storage.");
    }
  };
  const load = () => {
    try {
      setText(localStorage.getItem("n98:notepad") ?? "");
    } catch {
      /* nothing saved, nothing to load */
    }
  };
  const lines = text ? text.split("\n").length : 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="menubar">
        <button aria-expanded={menu?.k === "f"} onClick={(e) => openMenu("f", e)}>
          File
        </button>
        <button aria-expanded={menu?.k === "e"} onClick={(e) => openMenu("e", e)}>
          Edit
        </button>
        <button aria-expanded={menu?.k === "o"} onClick={(e) => openMenu("o", e)}>
          Format
        </button>
      </div>
      {menu && (
        <Menu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={
            menu.k === "f"
              ? [
                  { label: "New", go: () => setText("") },
                  { label: "Open saved", go: load },
                  { label: "Save", key: "Ctrl+S", go: save },
                  { sep: true },
                  { label: "Exit", go: () => sys.close(win.id) },
                ]
              : menu.k === "e"
                ? [
                    { label: "Undo", disabled: true },
                    { sep: true },
                    { label: "Time/Date", key: "F5", go: () => setText((t) => t + new Date().toLocaleString()) },
                  ]
                : [{ label: (wrap ? "• " : "   ") + "Word Wrap", go: () => setWrap((v) => !v) }]
          }
        />
      )}
      <textarea
        className="field"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "s") {
            e.preventDefault();
            save();
          }
        }}
        spellCheck="false"
        wrap={wrap ? "soft" : "off"}
        aria-label="Document text"
        style={{
          flex: 1,
          minHeight: 0,
          margin: "2px 0",
          fontFamily: "'Lucida Console',Consolas,monospace",
          fontSize: 12,
          whiteSpace: wrap ? "pre-wrap" : "pre",
          overflow: "auto",
        }}
      />
      <div className="statusbar">
        <div>
          {lines} lines, {text.length} characters
        </div>
        <div>Ln 1, Col 1</div>
      </div>
    </div>
  );
}
