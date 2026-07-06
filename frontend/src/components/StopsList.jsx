import React from "react";

const ICONS = {
  pickup: { glyph: "P", color: "#2f9e6e" },
  dropoff: { glyph: "D", color: "#e15a4d" },
  fuel: { glyph: "F", color: "#4c8bf5" },
  break: { glyph: "B", color: "#8b6cf0" },
  rest: { glyph: "Z", color: "#8b6cf0" },
  restart: { glyph: "R", color: "#f2b705" },
};

function fmt(dtString) {
  const d = new Date(dtString);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StopsList({ stops }) {
  return (
    <div className="stops-list">
      {stops.map((s, i) => {
        const icon = ICONS[s.kind] || { glyph: "•", color: "#8b94a3" };
        return (
          <div className="stop-row" key={i}>
            <div className="stop-icon" style={{ background: icon.color }}>
              {icon.glyph}
            </div>
            <div>
              <div className="stop-title">{s.label}</div>
              {s.location && <div className="stop-sub">{s.location}</div>}
            </div>
            <div className="stop-time">
              {fmt(s.start)}
              <br />
              {s.duration_hours}h
            </div>
          </div>
        );
      })}
    </div>
  );
}
