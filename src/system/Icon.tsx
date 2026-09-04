import type { IconName } from "./types";

/** Every icon on this desktop is drawn here. The original shipped as .ico
 *  resources; these are the same 32x32 grids expressed as SVG rectangles,
 *  which keeps the whole machine free of binary assets. */
export function Ico({ n, s = 32 }: { n: IconName | string; s?: number }) {

    const p = {width:s,height:s,viewBox:"0 0 32 32",shapeRendering:"crispEdges",xmlns:"http://www.w3.org/2000/svg",style:{flex:"0 0 auto"}};
  switch(n){
    case "computer": return (<svg {...p}>
      <rect x="3" y="4" width="26" height="19" fill="#000"/>
      <rect x="4" y="5" width="24" height="17" fill="#c0c7c8"/>
      <rect x="6" y="7" width="20" height="13" fill="#000080"/>
      <rect x="7" y="8" width="18" height="4" fill="#1084d0"/>
      <rect x="8" y="14" width="9" height="1" fill="#26f000"/><rect x="8" y="16" width="13" height="1" fill="#26f000"/>
      <rect x="13" y="23" width="6" height="3" fill="#808080"/>
      <rect x="5" y="26" width="22" height="4" fill="#000"/><rect x="6" y="27" width="20" height="2" fill="#c0c7c8"/>
      <rect x="4" y="5" width="24" height="1" fill="#fff"/><rect x="4" y="5" width="1" height="17" fill="#fff"/>
    </svg>);
    case "recycle": return (<svg {...p}>
      <path d="M7 9h18l-2 20H9z" fill="#9aa6ab"/><path d="M7 9h18l-2 20H9z" fill="none" stroke="#000"/>
      <ellipse cx="16" cy="9" rx="9" ry="3" fill="#c3ced2" stroke="#000"/>
      <path d="M16 12l3 5h-6z" fill="#00a000"/><path d="M12 22l5-2v4z" fill="#00a000"/><path d="M20 22l-5-2v4z" fill="#00c000"/>
      <rect x="11" y="14" width="1" height="12" fill="#7f898d"/><rect x="20" y="14" width="1" height="12" fill="#7f898d"/>
    </svg>);
    case "amp": return (<svg {...p}>
      <rect x="3" y="6" width="26" height="20" fill="#000"/><rect x="4" y="7" width="24" height="18" fill="#2b2b33"/>
      <rect x="5" y="8" width="22" height="7" fill="#0b0f0b"/>
      <path d="M19 9l-8 9h5l-2 6 8-9h-5z" fill="#26f000"/>
      <rect x="5" y="17" width="14" height="2" fill="#39404c"/><rect x="5" y="21" width="22" height="2" fill="#39404c"/>
      <rect x="21" y="16" width="6" height="4" fill="#0b0f0b"/><rect x="22" y="17" width="1" height="2" fill="#26f000"/><rect x="24" y="17" width="1" height="2" fill="#26f000"/>
    </svg>);
    case "mine": return (<svg {...p}>
      <rect x="15" y="4" width="2" height="24" fill="#000"/><rect x="4" y="15" width="24" height="2" fill="#000"/>
      <path d="M8 8l16 16M24 8L8 24" stroke="#000" strokeWidth="2"/>
      <circle cx="16" cy="16" r="8" fill="#000"/><circle cx="13" cy="13" r="2" fill="#fff"/>
    </svg>);
    case "cards": return (<svg {...p}>
      <rect x="4" y="7" width="15" height="20" rx="2" fill="#1a3d8f" stroke="#000"/>
      <rect x="6" y="9" width="11" height="16" fill="#2f5fc0"/>
      <rect x="13" y="5" width="15" height="20" rx="2" fill="#fff" stroke="#000"/>
      <path d="M20.5 20c-3-2.5-5-4-5-6a2.4 2.4 0 014.8-.8A2.4 2.4 0 0125 14c0 2-2 3.5-4.5 6z" fill="#d40000"/>
    </svg>);
    case "notepad": return (<svg {...p}>
      <rect x="6" y="3" width="20" height="26" fill="#000"/><rect x="7" y="4" width="18" height="24" fill="#fff"/>
      <rect x="7" y="4" width="18" height="4" fill="#000080"/>
      <rect x="9" y="11" width="14" height="1" fill="#808080"/><rect x="9" y="14" width="14" height="1" fill="#808080"/>
      <rect x="9" y="17" width="14" height="1" fill="#808080"/><rect x="9" y="20" width="9" height="1" fill="#808080"/>
    </svg>);
    case "paint": return (<svg {...p}>
      <path d="M16 4C9 4 4 9 4 15s5 10 9 10c2 0 2-1 2-2s-1-2 0-3 4 0 6-1c3-1 5-3 5-6 0-5-5-9-10-9z" fill="#e8e0cf" stroke="#000"/>
      <circle cx="10" cy="11" r="2" fill="#ff0000"/><circle cx="16" cy="9" r="2" fill="#0000ff"/>
      <circle cx="21" cy="13" r="2" fill="#ffcc00"/><circle cx="10" cy="18" r="2" fill="#00a000"/>
      <rect x="22" y="18" width="3" height="11" fill="#a06a2c" stroke="#000"/><rect x="22" y="17" width="3" height="3" fill="#808080"/>
    </svg>);
    case "ie": return (<svg {...p}>
      <circle cx="16" cy="16" r="11" fill="#1a5fb4"/><circle cx="16" cy="16" r="11" fill="none" stroke="#0a3d80"/>
      <ellipse cx="16" cy="16" rx="4.5" ry="11" fill="none" stroke="#9ecbff"/>
      <path d="M5 16h22M7 10h18M7 22h18" stroke="#9ecbff" fill="none"/>
      <path d="M3 22c6 5 20 6 26 1 2-2-1-3-3-2-6 3-14 3-19 0-2-1-5 0-4 1z" fill="#f5c400" stroke="#a88400"/>
    </svg>);
    case "folder": return (<svg {...p}>
      <path d="M3 8h9l2 3h15v16H3z" fill="#000"/><path d="M4 9h8l2 3h13v14H4z" fill="#ffcc44"/>
      <path d="M4 14h21v12H4z" fill="#ffd75a"/><path d="M4 9h8l2 3H4z" fill="#ffe08a"/>
    </svg>);
    case "file": return (<svg {...p}>
      <path d="M7 3h13l6 6v20H7z" fill="#000"/><path d="M8 4h11l6 6v18H8z" fill="#fff"/>
      <path d="M19 4l6 6h-6z" fill="#c0c7c8" stroke="#000"/>
      <rect x="11" y="14" width="11" height="1" fill="#808080"/><rect x="11" y="17" width="11" height="1" fill="#808080"/><rect x="11" y="20" width="7" height="1" fill="#808080"/>
    </svg>);
    case "drive": return (<svg {...p}>
      <rect x="3" y="10" width="26" height="13" fill="#000"/><rect x="4" y="11" width="24" height="11" fill="#c0c7c8"/>
      <rect x="4" y="11" width="24" height="1" fill="#fff"/><rect x="6" y="14" width="14" height="5" fill="#9aa6ab"/>
      <circle cx="24" cy="19" r="1.5" fill="#26f000"/>
    </svg>);
    case "display": return (<svg {...p}>
      <rect x="3" y="5" width="26" height="19" fill="#000"/><rect x="4" y="6" width="24" height="17" fill="#c0c7c8"/>
      <rect x="6" y="8" width="20" height="13" fill="#008080"/>
      <rect x="12" y="24" width="8" height="3" fill="#808080"/><rect x="8" y="27" width="16" height="2" fill="#c0c7c8" stroke="#000"/>
    </svg>);
    case "power": return (<svg {...p}>
      <circle cx="16" cy="17" r="10" fill="none" stroke="#c02020" strokeWidth="3"/>
      <rect x="14.5" y="3" width="3" height="13" fill="#c02020"/>
      <rect x="6" y="6" width="20" height="5" fill="#c0c7c8"/>
    </svg>);
    case "run": return (<svg {...p}>
      <rect x="4" y="7" width="24" height="18" fill="#000"/><rect x="5" y="8" width="22" height="16" fill="#fff"/>
      <rect x="5" y="8" width="22" height="4" fill="#000080"/>
      <path d="M9 16l4 3-4 3z" fill="#000080"/><rect x="15" y="18" width="8" height="1" fill="#000"/>
    </svg>);
    case "info": return (<svg {...p}>
      <circle cx="16" cy="16" r="12" fill="#000080"/><circle cx="16" cy="16" r="10" fill="#1084d0"/>
      <rect x="14" y="9" width="4" height="4" fill="#fff"/><rect x="14" y="15" width="4" height="9" fill="#fff"/>
    </svg>);
    case "flag": return (<svg {...p} viewBox="0 0 32 32">
      <path d="M4 8l11-3v10L4 18z" fill="#f24040"/><path d="M17 4.5l12-3.5v11l-12 3z" fill="#39c552"/>
      <path d="M4 20l11-2v10L4 30z" fill="#39a5f2"/><path d="M17 17.5l12-2.5v11l-12 3z" fill="#f2c93a"/>
    </svg>);
    default: return <svg {...p}><rect x="6" y="6" width="20" height="20" fill="#c0c7c8" stroke="#000"/></svg>;
  }
}
