import React from "react";

const ROW_ORDER = ["OFF_DUTY", "SLEEPER_BERTH", "DRIVING", "ON_DUTY_NOT_DRIVING"];
const ROW_LABELS = {
  OFF_DUTY: "Off Duty",
  SLEEPER_BERTH: "Sleeper Berth",
  DRIVING: "Driving",
  ON_DUTY_NOT_DRIVING: "On Duty (Not Driving)",
};
const ROW_COLORS = {
  OFF_DUTY: "var(--off-duty)",
  SLEEPER_BERTH: "var(--sleeper)",
  DRIVING: "var(--driving)",
  ON_DUTY_NOT_DRIVING: "var(--on-duty)",
};

const LEFT_MARGIN = 128;
const GRID_WIDTH = 648; // 27px per hour * 24
const ROW_HEIGHT = 34;
const HEADER_HEIGHT = 22;
const REMARKS_HEIGHT = 46;
const HOURS = 24;
const PX_PER_HOUR = GRID_WIDTH / HOURS;

function xForHour(h) {
  return LEFT_MARGIN + h * PX_PER_HOUR;
}

function yForRow(idx) {
  return HEADER_HEIGHT + idx * ROW_HEIGHT;
}

function hourLabel(h) {
  if (h === 0 || h === 24) return "Mid";
  if (h === 12) return "Noon";
  const twelveHr = h > 12 ? h - 12 : h;
  return String(twelveHr);
}

export default function LogSheet({ day, index }) {
  const gridHeight = ROW_HEIGHT * ROW_ORDER.length;
  const svgHeight = HEADER_HEIGHT + gridHeight + REMARKS_HEIGHT + 10;
  const svgWidth = LEFT_MARGIN + GRID_WIDTH + 90;

  const segments = day.segments;

  return (
    <div className="log-sheet">
      <div className="log-sheet-header">
        <div className="date">{day.date}</div>
        <div className="day-index">Day {index + 1}</div>
      </div>

      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height={svgHeight} role="img" aria-label={`Daily log grid for ${day.date}`}>
        {/* Hour gridlines */}
        {Array.from({ length: HOURS + 1 }).map((_, h) => (
          <line
            key={`v-${h}`}
            x1={xForHour(h)}
            x2={xForHour(h)}
            y1={HEADER_HEIGHT}
            y2={HEADER_HEIGHT + gridHeight}
            stroke={h % 6 === 0 ? "#3a4453" : "#262e38"}
            strokeWidth={h % 6 === 0 ? 1.2 : 0.6}
          />
        ))}
        {/* quarter-hour ticks */}
        {Array.from({ length: HOURS * 4 + 1 }).map((_, q) => {
          if (q % 4 === 0) return null;
          const h = q / 4;
          return (
            <line
              key={`q-${q}`}
              x1={xForHour(h)}
              x2={xForHour(h)}
              y1={HEADER_HEIGHT}
              y2={HEADER_HEIGHT + gridHeight}
              stroke="#1e2530"
              strokeWidth={0.4}
            />
          );
        })}

        {/* Row separators + labels */}
        {ROW_ORDER.map((status, idx) => (
          <g key={status}>
            <line
              x1={LEFT_MARGIN}
              x2={LEFT_MARGIN + GRID_WIDTH}
              y1={yForRow(idx)}
              y2={yForRow(idx)}
              stroke="#2a323d"
              strokeWidth={1}
            />
            <text
              x={LEFT_MARGIN - 10}
              y={yForRow(idx) + ROW_HEIGHT / 2 + 4}
              textAnchor="end"
              fontSize="10.5"
              fontFamily="var(--font-mono)"
              fill="var(--text-muted)"
            >
              {ROW_LABELS[status]}
            </text>
          </g>
        ))}
        <line
          x1={LEFT_MARGIN}
          x2={LEFT_MARGIN + GRID_WIDTH}
          y1={yForRow(ROW_ORDER.length)}
          y2={yForRow(ROW_ORDER.length)}
          stroke="#2a323d"
          strokeWidth={1}
        />

        {/* Hour labels along top */}
        {Array.from({ length: HOURS + 1 }).map((_, h) => (
          <text
            key={`hl-${h}`}
            x={xForHour(h)}
            y={HEADER_HEIGHT - 8}
            textAnchor="middle"
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--text-faint)"
          >
            {hourLabel(h)}
          </text>
        ))}

        {/* Duty status trace: horizontal segments + vertical connectors */}
        {segments.map((seg, i) => {
          const rowIdx = ROW_ORDER.indexOf(seg.status);
          const y = yForRow(rowIdx) + ROW_HEIGHT / 2;
          const x1 = xForHour(seg.start_hour);
          const x2 = xForHour(seg.end_hour);
          const prev = segments[i - 1];
          const connectors = [];
          if (prev) {
            const prevRowIdx = ROW_ORDER.indexOf(prev.status);
            const prevY = yForRow(prevRowIdx) + ROW_HEIGHT / 2;
            connectors.push(
              <line
                key={`conn-${i}`}
                x1={x1}
                x2={x1}
                y1={prevY}
                y2={y}
                stroke={ROW_COLORS[seg.status]}
                strokeWidth={2}
              />
            );
          }
          return (
            <g key={i}>
              {connectors}
              <line x1={x1} x2={x2} y1={y} y2={y} stroke={ROW_COLORS[seg.status]} strokeWidth={3} strokeLinecap="round" />
            </g>
          );
        })}

        {/* Remarks: location tick marks + rotated labels */}
        {day.remarks.map((r, i) => {
          const x = xForHour(r.hour);
          const y0 = HEADER_HEIGHT + gridHeight;
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={y0} y2={y0 + 8} stroke="var(--text-faint)" strokeWidth={0.8} />
              <text
                x={x}
                y={y0 + 12}
                fontSize="8.5"
                fontFamily="var(--font-mono)"
                fill="var(--text-muted)"
                transform={`rotate(35 ${x} ${y0 + 12})`}
              >
                {r.text}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="log-totals">
        {ROW_ORDER.map((status) => (
          <div className="log-total-item" key={status}>
            <span className="swatch" style={{ background: ROW_COLORS[status] }} />
            {ROW_LABELS[status]}: {day.totals[status].toFixed(2)}h
          </div>
        ))}
      </div>
    </div>
  );
}
