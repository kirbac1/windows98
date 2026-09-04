import { useState } from "react";
import { Ico } from "../system/Icon";
import { FS } from "../data/fs";
import type { FsNode } from "../data/fs";
import type { AppId, AppProps } from "../system/types";

const ROOT: FsNode[] = [FS, { name: "3½ Floppy (A:)", type: "drive", kids: [] }, { name: "Control Panel", type: "cpl" }];

export function ComputerApp({ sys }: AppProps) {
  const [path, setPath] = useState<string[]>([]);
  const [pick, setPick] = useState("");

  const node = path.reduce<FsNode>((n, name) => (n.kids ?? []).find((k) => k.name === name) ?? n, FS);
  const kids = path.length ? (node.kids ?? []) : ROOT;
  const addr = path.length ? "C:\\" + path.slice(1).join("\\") : "My Computer";

  const openItem = (k: FsNode) => {
    if (k.type === "dir" || k.type === "drive") setPath((p) => [...p, k.name]);
    else if (k.type === "txt") sys.open("notepad", { body: k.body }, k.name + " - Notepad");
    else if (k.type === "app" && k.app) sys.open(k.app as AppId);
    else if (k.type === "cpl") sys.open("display");
  };
  const iconFor = (k: FsNode) =>
    k.type === "dir" ? "folder" : k.type === "drive" ? "drive" : k.type === "app" ? "amp" : k.type === "cpl" ? "display" : "file";

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="menubar">
        <button>File</button>
        <button>Edit</button>
        <button>View</button>
        <button onClick={() => sys.open("about")}>Help</button>
      </div>
      <div className="ie-bar groove" style={{ padding: "3px 2px" }}>
        <button className="btn sm" disabled={!path.length} onClick={() => setPath((p) => p.slice(0, -1))}>
          ← Back
        </button>
        <button className="btn sm" disabled={!path.length} onClick={() => setPath([])}>
          Up
        </button>
        <span style={{ padding: "0 4px" }}>Address</span>
        <div className="field" style={{ flex: 1, display: "flex", alignItems: "center", gap: 5 }}>
          <Ico n={path.length ? "folder" : "computer"} s={13} />
          {addr}
        </div>
      </div>
      <div className="listbox scroll" style={{ margin: "2px 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignContent: "flex-start", gap: 4, padding: 8 }}>
          {kids.map((k) => (
            <button
              key={k.name}
              className="dicon"
              style={{ border: 0, background: pick === k.name ? "#000080" : "none" }}
              onClick={() => setPick(k.name)}
              onDoubleClick={() => openItem(k)}
            >
              <Ico n={iconFor(k)} s={32} />
              <span style={{ color: pick === k.name ? "#fff" : "#000", textShadow: "none" }}>{k.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="statusbar">
        <div>{kids.length} object(s)</div>
        <div>Double-click to open</div>
      </div>
    </div>
  );
}
