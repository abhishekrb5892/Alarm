import React, { useEffect, useState } from "react";
import Alarm from "./components/Alarm";
import Timer from "./components/Timer";
import Stopwatch from "./components/Stopwatch";
import Dashboard from "./components/Dashboard";
import VideoModal from "./components/VideoModal";
import "./index.css";

// choose one YouTube embed per weekday (Sunday=0 .. Saturday=6)
const weeklyVideos = {
  0: "https://www.youtube.com/embed/ZXsQAXx_ao0", // Sunday
  1: "https://www.youtube.com/embed/2Lz0VOltZKA", // Monday
  2: "https://www.youtube.com/embed/fLeJJPxua3E", // Tuesday
  3: "https://www.youtube.com/embed/wnHW6o8WMas", // Wednesday
  4: "https://www.youtube.com/embed/hbkZrOU1Zag", // Thursday
  5: "https://www.youtube.com/embed/IdTMDpizis8", // Friday
  6: "https://www.youtube.com/embed/MYtjpIwamos"  // Saturday
};

export default function App() {
  const [tab, setTab] = useState("alarm");
  const [modalVideo, setModalVideo] = useState(null);
  const [stats, setStats] = useState(() => JSON.parse(localStorage.getItem("productivity")) || {
    alarmsDismissed:0, focusMinutes:0, pomodoros:0, stopwatchMinutes:0
  });

  useEffect(()=> {
    // keep stats synced with localStorage changes by other components
    const id = setInterval(()=> {
      const s = JSON.parse(localStorage.getItem("productivity")) || {};
      setStats(s);
    }, 800);
    return ()=> clearInterval(id);
  }, []);

  function openVideoForToday(){
    const today = new Date().getDay();
    setModalVideo(weeklyVideos[today]);
  }
  function closeModal(){ setModalVideo(null); }

  function handleStatsUpdate(newStats){
    setStats(newStats);
    localStorage.setItem("productivity", JSON.stringify(newStats));
  }

  return (
    <div className="container">
      <div className="header">
        <h1>⏰🕒 Alarm + Timer + Stopwatch Remix</h1>
        <div className="small">Tip: click anywhere to allow audio/autoplay in some browsers</div>
      </div>

      <div className="app-card grid">
        <div>
          <div className="tabs" style={{marginBottom:12}}>
            <div className={`tab ${tab==='alarm'?'active':''}`} onClick={()=>setTab('alarm')}>Alarm</div>
            <div className={`tab ${tab==='timer'?'active':''}`} onClick={()=>setTab('timer')}>Timer</div>
            <div className={`tab ${tab==='stopwatch'?'active':''}`} onClick={()=>setTab('stopwatch')}>Stopwatch</div>
            <div className={`tab ${tab==='dashboard'?'active':''}`} onClick={()=>setTab('dashboard')}>Dashboard</div>
          </div>

          <div style={{minHeight:320}}>
            {tab === 'alarm' && <Alarm openVideoForToday={openVideoForToday} onStatsUpdate={handleStatsUpdate} />}
            {tab === 'timer' && <Timer openVideoForToday={openVideoForToday} onStatsUpdate={handleStatsUpdate} />}
            {tab === 'stopwatch' && <Stopwatch onStatsUpdate={handleStatsUpdate} />}
            {tab === 'dashboard' && <Dashboard stats={stats} />}
          </div>
        </div>

        <aside className="card-box">
          <h3>🎥 Today's Motivation</h3>
          <iframe className="video-iframe" src={weeklyVideos[new Date().getDay()]} title="Today's Motivation" allow="autoplay; encrypted-media; picture-in-picture"></iframe>
          <div style={{marginTop:12}}>
            <div className="small">Daily rotation: a different motivational video each weekday.</div>
          </div>
        </aside>
      </div>
      { modalVideo && <VideoModal videoSrc={modalVideo} onClose={closeModal} title="Morning Motivation" /> }
    </div>
  );
}
