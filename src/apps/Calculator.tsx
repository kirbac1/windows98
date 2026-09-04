import { useState } from "react";

type Op = "+" | "-" | "*" | "/" | null;

/** Defined out here on purpose: a component declared inside the render
 *  gets a new identity every keystroke, and React would tear down and
 *  rebuild the whole keypad each time you press a digit. */
function K({ label, on, cls }: { label: string; on: () => void; cls?: string }) {
  return (
    <button className={"calckey" + (cls ? " " + cls : "")} onClick={on}>
      {label}
    </button>
  );
}

/** Calculator, standard view. Immediate execution, the way the desk
 *  calculator it imitates worked: each operator resolves the pending one
 *  rather than waiting for precedence. */
export function CalcApp() {
  const [display, setDisplay] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [fresh, setFresh] = useState(true);
  const [mem, setMem] = useState(0);
  const [err, setErr] = useState(false);

  const shown = err ? "Cannot divide by zero" : display;
  const num = () => parseFloat(display) || 0;
  const show = (v: number) => {
    if (!isFinite(v)) {
      setErr(true);
      setDisplay("0");
      return;
    }
    setDisplay(String(Number(v.toPrecision(12))));
  };

  const digit = (d: string) => {
    if (err) reset();
    if (fresh) {
      setDisplay(d === "." ? "0." : d);
      setFresh(false);
      return;
    }
    if (d === "." && display.includes(".")) return;
    setDisplay(display.length > 15 ? display : display + d);
  };
  const resolve = (): number => {
    if (acc === null || !op) return num();
    const b = num();
    switch (op) {
      case "+": return acc + b;
      case "-": return acc - b;
      case "*": return acc * b;
      case "/": return b === 0 ? NaN : acc / b;
    }
    return b;
  };
  const setOperator = (next: Op) => {
    if (err) return;
    const v = resolve();
    if (!isFinite(v)) { setErr(true); setAcc(null); setOp(null); return; }
    show(v);
    setAcc(v);
    setOp(next);
    setFresh(true);
  };
  const equals = () => {
    if (err) return;
    const v = resolve();
    if (!isFinite(v)) { setErr(true); setAcc(null); setOp(null); return; }
    show(v);
    setAcc(null);
    setOp(null);
    setFresh(true);
  };
  const reset = () => { setDisplay("0"); setAcc(null); setOp(null); setFresh(true); setErr(false); };
  const unary = (f: (n: number) => number) => { if (!err) { show(f(num())); setFresh(true); } };

  return (
    <div className="calc">
      <div className="calc-display">{shown}</div>
      <div className="calc-row">
        <span className="calc-mem">{mem ? "M" : ""}</span>
        <button className="calckey wide red" onClick={() => setDisplay(display.length > 1 ? display.slice(0, -1) : "0")}>Backspace</button>
        <button className="calckey wide red" onClick={() => { setDisplay("0"); setFresh(true); setErr(false); }}>CE</button>
        <button className="calckey wide red" onClick={reset}>C</button>
      </div>
      <div className="calc-grid">
        <K label="MC" cls="red" on={() => setMem(0)} />
        <K label="7" on={() => digit("7")} /><K label="8" on={() => digit("8")} /><K label="9" on={() => digit("9")} />
        <K label="/" cls="red" on={() => setOperator("/")} />
        <K label="sqrt" cls="blue" on={() => unary(Math.sqrt)} />

        <K label="MR" cls="red" on={() => { setDisplay(String(mem)); setFresh(true); }} />
        <K label="4" on={() => digit("4")} /><K label="5" on={() => digit("5")} /><K label="6" on={() => digit("6")} />
        <K label="*" cls="red" on={() => setOperator("*")} />
        <K label="%" cls="blue" on={() => unary((n) => (acc ?? 0) * n / 100)} />

        <K label="MS" cls="red" on={() => setMem(num())} />
        <K label="1" on={() => digit("1")} /><K label="2" on={() => digit("2")} /><K label="3" on={() => digit("3")} />
        <K label="-" cls="red" on={() => setOperator("-")} />
        <K label="1/x" cls="blue" on={() => unary((n) => (n === 0 ? NaN : 1 / n))} />

        <K label="M+" cls="red" on={() => setMem(mem + num())} />
        <K label="0" on={() => digit("0")} />
        <K label="+/-" on={() => setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display)} />
        <K label="." on={() => digit(".")} />
        <K label="+" cls="red" on={() => setOperator("+")} />
        <K label="=" cls="blue" on={equals} />
      </div>
    </div>
  );
}
