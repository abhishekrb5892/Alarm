import React, { useEffect, useRef, useState } from "react";
import { fetchWeatherByCity, fetchNewsHeadline, fetchExerciseSuggestion } from "../services/api";

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function msUntilNext(hhmm){
  const [hh, mm] = hhmm.split(':').map(Number);
  const now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
  if (target <= now) target.setDate(target.getDate()+1);
  return target - now;
}
function beep(duration = 1600) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.06;
    o.start();
    setTimeout(()=>{ o.stop(); ctx.close(); }, duration);
  } catch(e){}
}

export default function Alarm({ openVideoForToday, onStatsUpdate }) {
  const [alarms, setAlarms] = useState(() => {
    try { return JSON.parse(localStorage.getItem("alarms_v1")) || []; } catch { return []; }
  });
  const [time, setTime] = useState("");
  const [city, setCity] = useState("");
  const timeoutsRef = useRef({});

  useEffect(()=> {
    // schedule existing alarms
    alarms.forEach(scheduleAlarm);
    return () => { Object.values(timeoutsRef.current).forEach(t => clearTimeout(t)); }
    // eslint-disable-next-line
  }, []);

  function save(a){
    localStorage.setItem("alarms_v1", JSON.stringify(a));
  }

  function add() {
    if (!time) return alert("Pick a time");
    const a = { id: uid(), time, city, enabled: true };
    const next = [...alarms, a];
    setAlarms(next); save(next); scheduleAlarm(a);
    setTime(""); setCity("");
  }

  function remove(id){
    const next = alarms.filter(x => x.id !== id);
    setAlarms(next); save(next); rescheduleAll(next);
  }

  function toggleEnable(id){
    const next = alarms.map(x => x.id === id ? {...x, enabled: !x.enabled} : x);
    setAlarms(next); save(next); rescheduleAll(next);
  }

  function scheduleAlarm(al){
    if (timeoutsRef.current[al.id]) { clearTimeout(timeoutsRef.current[al.id]); delete timeoutsRef.current[al.id]; }
    if (!al.enabled) return;
    const ms = msUntilNext(al.time);
    const t = setTimeout(()=> onRing(al), ms);
    timeoutsRef.current[al.id] = t;
  }

  function rescheduleAll(list){
    Object.values(timeoutsRef.current).forEach(t => clearTimeout(t));
    timeoutsRef.current = {};
    list.forEach(scheduleAlarm);
  }

  async function onRing(al) {
    // beep
    beep(2500);
    // fetch weather/news/exercise in parallel
    const [weather, headline, exercise] = await Promise.all([
      al.city ? fetchWeatherByCity(al.city) : Promise.resolve(null),
      fetchNewsHeadline().catch(()=>null),
      fetchExerciseSuggestion().catch(()=>null)
    ]);
    // update stats
    const stats = JSON.parse(localStorage.getItem("productivity")) || { alarmsDismissed:0, focusMinutes:0, pomodoros:0 };
    stats.alarmsDismissed = (stats.alarmsDismissed || 0) + 1;
    localStorage.setItem("productivity", JSON.stringify(stats));
    if (onStatsUpdate) onStatsUpdate(stats);
    // show modal with video and info
    const infoLines = [];
    if (weather) infoLines.push(`Weather: ${weather.temp}°C • ${weather.desc} (${weather.name})`);
    if (headline) infoLines.push(`Headline: ${headline}`);
    if (exercise) infoLines.push(`Try: ${exercise}`);
    alert(`Alarm ${al.time}\n\n${infoLines.join('\n')}\n\nMotivation video will open now.`);
    // open video modal (App will provide function to show modal)
    if (openVideoForToday) openVideoForToday();
    // reschedule for next day (daily alarm)
    scheduleAlarm(al);
  }

  return (
    <div>
      <h3>Alarm</h3>
      <div className="controls">
        <input className="input" type="time" value={time} onChange={e=>setTime(e.target.value)} />
        <input className="input" placeholder="City for weather (optional)" value={city} onChange={e=>setCity(e.target.value)} />
        <button className="button" onClick={add}>Add</button>
      </div>

      <div style={{marginTop:12}}>
        {alarms.length === 0 ? <div className="small">No alarms</div> :
          alarms.map(a => (
            <div key={a.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, marginBottom:8}} className="card-box">
              <div><strong>{a.time}</strong>{a.city ? ` • ${a.city}` : ''}</div>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <label className="small"><input type="checkbox" checked={a.enabled} onChange={()=>toggleEnable(a.id)} /> Enabled</label>
                <button className="button" onClick={()=>remove(a.id)}>Remove</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
