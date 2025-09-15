import React from "react";

export default function VideoModal({ videoSrc, onClose, title }) {
  if (!videoSrc) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{marginTop:0}}>{title || "Motivation"}</h3>
        {/* autoplay=1&mute=1 ensures most browsers will allow autoplay; user can unmute */}
        <iframe
          className="video-iframe"
          src={`${videoSrc}?autoplay=1&rel=0&modestbranding=1&mute=1`}
          allow="autoplay; encrypted-media; picture-in-picture"
          title="Motivation Video"
        />
        <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:12}}>
          <button className="button" onClick={onClose}>Dismiss</button>
          <button className="button" onClick={() => {
            // open video in new tab (user can unmute there)
            window.open(videoSrc.replace('/embed/','/watch?v='), '_blank');
          }}>Open in YouTube</button>
        </div>
      </div>
    </div>
  );
}
