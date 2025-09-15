import React, { useRef, useState } from "react";

export default function Stopwatch({ onStatsUpdate }) {
  const [display, setDisplay] = useState("00:00:0");
  const [running, setRunning] = useState(false);
  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const timerRef = useRef(null);

  function fmt(ms) {
    const total = Math.floor(ms);
    const secs = Math.floor(total/1000);
    const m = String(Math.floor(secs/60)).padStart(2,'0');
    const s = String(secs%60).padStart(2,'0');
    const d = Math.floor((total%1000)/100);
    return `${m}:${s}.${d}`;
  }

  function start() {
    if (running) return;
    startRef.current = Date.now();
    timerRef.current = setInterval(()=> {
      const now = Date.now();
      const diff = elapsedRef.current + (now - startRef.current);
      setDisplay(fmt(diff));
    }, 100);
    setRunning(true);
  }

  function stop() {
    if (!running) return;
    clearInterval(timerRef.current);
    elapsedRef.current += Date.now() - startRef.current;
    setRunning(false);
    // update dashboard minutes
    const mins = Math.floor(elapsedRef.current / 60000);
    const state = JSON.parse(localStorage.getItem("productivity")) || { focusMinutes:0, pomodoros:0, alarmsDismissed:0, stopwatchMinutes:0 };
    state.stopwatchMinutes = (state.stopwatchMinutes || 0) + mins;
    localStorage.setItem("productivity", JSON.stringify(state));
    if (onStatsUpdate) onStatsUpdate(state);
  }

  function reset() {
    clearInterval(timerRef.current);
    elapsedRef.current = 0;
    setDisplay("00:00:0");
    setRunning(false);
  }

  return (
    <div>
      <h3>Stopwatch</h3>
      <div style={{fontSize:26,fontWeight:700}}>{display}</div>
      <div style={{display:'flex', gap:8, marginTop:8}}>
        <button className="button" onClick={start} disabled={running}>Start</button>
        <button className="button" onClick={stop} disabled={!running}>Stop</button>
        <button className="button" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
