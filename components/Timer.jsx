import React, { useRef, useState } from "react";
import { fetchExerciseSuggestion } from "../services/api";

export default function Timer({ openVideoForToday, onStatsUpdate }) {
  const [minutes, setMinutes] = useState(5);
  const [display, setDisplay] = useState("00:00");
  const timerRef = useRef(null);
  const remainingRef = useRef(0);

  const [pomCount, setPomCount] = useState(() => {
    const s = JSON.parse(localStorage.getItem("productivity")) || { pomodoros:0 };
    return s.pomodoros || 0;
  });

  function formatMs(ms) {
    const total = Math.max(0, Math.floor(ms/1000));
    const m = String(Math.floor(total / 60)).padStart(2,'0');
    const s = String(total % 60).padStart(2,'0');
    return `${m}:${s}`;
  }

  function startCountdown(ms) {
    clearInterval(timerRef.current);
    remainingRef.current = ms;
    setDisplay(formatMs(ms));
    timerRef.current = setInterval(async () => {
      remainingRef.current -= 1000;
      setDisplay(formatMs(remainingRef.current));
      if (remainingRef.current <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        // finish actions
        const mins = Math.round(ms / 60000);
        const state = JSON.parse(localStorage.getItem("productivity")) || { focusMinutes:0, pomodoros:0, alarmsDismissed:0 };
        state.focusMinutes = (state.focusMinutes || 0) + mins;
        localStorage.setItem("productivity", JSON.stringify(state));
        if (onStatsUpdate) onStatsUpdate(state);
        const exercise = await fetchExerciseSuggestion();
        alert(`Timer done!\nTry: ${exercise}\nMotivation video will open now.`);
        if (openVideoForToday) openVideoForToday();
      }
    }, 1000);
  }

  function startTimerNow() {
    if (!minutes || minutes <= 0) return alert("Enter minutes > 0");
    startCountdown(minutes * 60 * 1000);
  }
  function stopTimer() {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  // Pomodoro
  async function startPomodoro() {
    // cycle logic: focus 25 -> break 5 (long break 15 after 4 sessions)
    let focusMs = 25 * 60 * 1000;
    // start first focus
    await runPomodoroCycle(false, focusMs);
  }

  async function runPomodoroCycle(isBreak, ms) {
    startCountdown(ms);
    // wait until timerRef null (finish) -> but we can't "await" setInterval, so rely on onFinish via startCountdown
    // Simpler: start a dedicated countdown for Pomodoro that triggers break/focus transitions:
    clearInterval(timerRef.current);
    remainingRef.current = ms;
    timerRef.current = setInterval(async () => {
      remainingRef.current -= 1000;
      setDisplay(formatMs(remainingRef.current));
      if (remainingRef.current <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        if (!isBreak) {
          // focus finished
          const state = JSON.parse(localStorage.getItem("productivity")) || { focusMinutes:0, pomodoros:0, alarmsDismissed:0 };
          state.focusMinutes = (state.focusMinutes || 0) + 25;
          state.pomodoros = (state.pomodoros || 0) + 1;
          localStorage.setItem("productivity", JSON.stringify(state));
          setPomCount(state.pomodoros);
          if (onStatsUpdate) onStatsUpdate(state);
          const exercise = await fetchExerciseSuggestion();
          alert(`🍅 Focus done!\nTry: ${exercise}\nStarting break. Motivation video will open.`);
          if (openVideoForToday) openVideoForToday();
          // start break
          const nextBreak = (state.pomodoros % 4 === 0) ? 15 * 60 * 1000 : 5 * 60 * 1000;
          runPomodoroCycle(true, nextBreak);
        } else {
          // break finished -> start next focus automatically
          alert("Break finished! Back to focus!");
          runPomodoroCycle(false, 25 * 60 * 1000);
        }
      }
    }, 1000);
  }

  return (
    <div>
      <h3>Timer / Pomodoro</h3>
      <div className="controls" style={{marginBottom:12}}>
        <input className="input" type="number" value={minutes} onChange={e=>setMinutes(Number(e.target.value))} />
        <button className="button" onClick={startTimerNow}>Start</button>
        <button className="button" onClick={stopTimer}>Stop</button>
        <button className="button" onClick={startPomodoro}>Start Pomodoro</button>
      </div>
      <div style={{fontSize:26,fontWeight:700}}>{display}</div>
      <div style={{marginTop:8}} className="small">Pomodoros completed: {pomCount}</div>
    </div>
  );
}
