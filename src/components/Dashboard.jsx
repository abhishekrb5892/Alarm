import React from "react";

export default function Dashboard({ stats }) {
  const s = stats || { alarmsDismissed:0, focusMinutes:0, pomodoros:0, stopwatchMinutes:0 };
  return (
    <div>
      <h3>Productivity Dashboard</h3>
      <div style={{display:'grid', gap:8, marginTop:8}}>
        <div className="card-box">
          <div className="stat">{s.focusMinutes}</div>
          <div className="stat-label">Focus minutes (total)</div>
        </div>
        <div className="card-box">
          <div className="stat">{s.alarmsDismissed}</div>
          <div className="stat-label">Alarms dismissed</div>
        </div>
        <div className="card-box">
          <div className="stat">{s.pomodoros}</div>
          <div className="stat-label">Pomodoro cycles</div>
        </div>
        <div className="card-box">
          <div className="stat">{Math.floor((s.stopwatchMinutes||0))}</div>
          <div className="stat-label">Stopwatch minutes</div>
        </div>
      </div>
    </div>
  );
}
