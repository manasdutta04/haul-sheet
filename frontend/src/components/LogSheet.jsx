import React from "react";

const ROW_ORDER = ["OFF_DUTY", "SLEEPER_BERTH", "DRIVING", "ON_DUTY_NOT_DRIVING"];
const ROW_LABELS = {
  OFF_DUTY: "1. Off Duty",
  SLEEPER_BERTH: "2. Sleeper Berth",
  DRIVING: "3. Driving",
  ON_DUTY_NOT_DRIVING: "4. On Duty (Not Driving)",
};
const ROW_COLORS = {
  OFF_DUTY: "var(--off-duty)",
  SLEEPER_BERTH: "var(--sleeper)",
  DRIVING: "var(--driving)",
  ON_DUTY_NOT_DRIVING: "var(--on-duty)",
};

const LEFT_MARGIN = 118;
const GRID_WIDTH = 720;
const TOTALS_WIDTH = 56;
const ROW_HEIGHT = 32;
const HEADER_HEIGHT = 34;
const REMARKS_HEIGHT = 74;
const HOURS = 24;
const PX_PER_HOUR = GRID_WIDTH / HOURS;

function xForHour(h) {
  return LEFT_MARGIN + h * PX_PER_HOUR;
}

function yForRow(idx) {
  return HEADER_HEIGHT + idx * ROW_HEIGHT;
}

function hourLabel(h) {
  if (h === 0 || h === 24) return "Mid- night";
  if (h === 12) return "Noon";
  const twelveHr = h > 12 ? h - 12 : h;
  return String(twelveHr);
}

function fmtHours(value = 0) {
  return Number(value || 0).toFixed(2);
}

function splitDate(date) {
  const [year = "", month = "", day = ""] = String(date || "").split("-");
  return { year, month, day };
}

function fieldValue(value) {
  return value || "Not provided";
}

function endpointForDay({ trip, index, day }) {
  const firstRemark = day.remarks?.[0]?.text;
  const lastRemark = day.remarks?.[day.remarks.length - 1]?.text;
  const isFirst = index === 0;
  const isLast = index === (trip.totalDays || 1) - 1;

  return {
    from: isFirst ? trip.current : firstRemark || "En route",
    to: isLast ? trip.dropoff : lastRemark || trip.dropoff || "En route",
  };
}

export default function LogSheet({ day, index, trip = {} }) {
  const gridHeight = ROW_HEIGHT * ROW_ORDER.length;
  const remarksY = HEADER_HEIGHT + gridHeight + 24;
  const svgHeight = remarksY + REMARKS_HEIGHT;
  const svgWidth = LEFT_MARGIN + GRID_WIDTH + TOTALS_WIDTH + 18;
  const totalsX = LEFT_MARGIN + GRID_WIDTH + 12;
  const { year, month, day: dayOfMonth } = splitDate(day.date);
  const dailyMiles = Math.round(day.total_miles ?? day.segments.reduce((sum, seg) => sum + (seg.miles || 0), 0));
  const endpoints = endpointForDay({ trip, index, day });

  return (
    <article className="log-sheet official-log-sheet">
      <div className="official-log-top">
        <div>
          <h3>Driver's Daily Log</h3>
          <div className="official-log-date">
            <span>{month || "mm"}</span>
            <small>month</small>
            <span>{dayOfMonth || "dd"}</span>
            <small>day</small>
            <span>{year || "yyyy"}</span>
            <small>year</small>
          </div>
        </div>
        <div className="official-log-origin">
          <strong>Original</strong> - File at home terminal.
          <br />
          <strong>Duplicate</strong> - Driver retains in possession for 8 days.
        </div>
      </div>

      <div className="official-log-fields">
        <label>
          <span>From</span>
          <b>{fieldValue(endpoints.from)}</b>
        </label>
        <label>
          <span>To</span>
          <b>{fieldValue(endpoints.to)}</b>
        </label>
        <label>
          <span>Total Miles Driving Today</span>
          <b>{dailyMiles}</b>
        </label>
        <label>
          <span>Name of Carrier or Carriers</span>
          <b>Haul Sheet Planning Record</b>
        </label>
        <label>
          <span>Truck/Tractor and Trailer Numbers or License Plate(s)</span>
          <b>Not provided</b>
        </label>
        <label>
          <span>Main Office Address</span>
          <b>Not provided</b>
        </label>
        <label>
          <span>Home Terminal Address</span>
          <b>Not provided</b>
        </label>
        <label>
          <span>Trip Route</span>
          <b>{fieldValue(trip.current)} - {fieldValue(trip.pickup)} - {fieldValue(trip.dropoff)}</b>
        </label>
      </div>

      <div className="official-log-grid-wrap">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" role="img" aria-label={`Daily log grid for ${day.date}`}>
          <rect x={LEFT_MARGIN} y={HEADER_HEIGHT - 22} width={GRID_WIDTH} height={22} fill="#0a0a0a" />
          {Array.from({ length: HOURS + 1 }).map((_, h) => (
            <text key={`hl-${h}`} x={xForHour(h)} y={HEADER_HEIGHT - 7} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="#ffffff">
              {hourLabel(h)}
            </text>
          ))}
          <text x={totalsX + 20} y={HEADER_HEIGHT - 12} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="#0a0a0a">
            Total
          </text>

          {Array.from({ length: HOURS + 1 }).map((_, h) => (
            <line
              key={`v-${h}`}
              x1={xForHour(h)}
              x2={xForHour(h)}
              y1={HEADER_HEIGHT}
              y2={HEADER_HEIGHT + gridHeight}
              stroke={h % 6 === 0 ? "rgba(10,10,10,0.38)" : "rgba(10,10,10,0.18)"}
              strokeWidth={h % 6 === 0 ? 1.2 : 0.7}
            />
          ))}
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
                stroke="rgba(10,10,10,0.12)"
                strokeWidth={0.45}
              />
            );
          })}

          {ROW_ORDER.map((status, idx) => (
            <g key={status}>
              <line x1={LEFT_MARGIN} x2={LEFT_MARGIN + GRID_WIDTH} y1={yForRow(idx)} y2={yForRow(idx)} stroke="#0a0a0a" strokeWidth={1} />
              <text x={LEFT_MARGIN - 10} y={yForRow(idx) + ROW_HEIGHT / 2 + 4} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="#0a0a0a">
                {ROW_LABELS[status]}
              </text>
              <line x1={totalsX} x2={totalsX + 36} y1={yForRow(idx) + ROW_HEIGHT / 2} y2={yForRow(idx) + ROW_HEIGHT / 2} stroke="#0a0a0a" strokeWidth={0.8} />
              <text x={totalsX + 18} y={yForRow(idx) + ROW_HEIGHT / 2 - 3} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="rgba(10,10,10,0.62)">
                {fmtHours(day.totals[status])}
              </text>
            </g>
          ))}
          <line x1={LEFT_MARGIN} x2={LEFT_MARGIN + GRID_WIDTH} y1={yForRow(ROW_ORDER.length)} y2={yForRow(ROW_ORDER.length)} stroke="#0a0a0a" strokeWidth={1} />

          {day.segments.map((seg, i) => {
            const rowIdx = ROW_ORDER.indexOf(seg.status);
            const y = yForRow(rowIdx) + ROW_HEIGHT / 2;
            const x1 = xForHour(seg.start_hour);
            const x2 = xForHour(seg.end_hour);
            const prev = day.segments[i - 1];
            const connectors = [];
            if (prev) {
              const prevRowIdx = ROW_ORDER.indexOf(prev.status);
              const prevY = yForRow(prevRowIdx) + ROW_HEIGHT / 2;
              connectors.push(<line key={`conn-${i}`} x1={x1} x2={x1} y1={prevY} y2={y} stroke="#0a0a0a" strokeWidth={2} />);
            }
            return (
              <g key={i}>
                {connectors}
                <line x1={x1} x2={x2} y1={y} y2={y} stroke={ROW_COLORS[seg.status]} strokeWidth={4} strokeLinecap="round" />
              </g>
            );
          })}

          <text x={6} y={remarksY + 14} fontSize="11" fontFamily="var(--font-mono)" fontWeight="700" fill="#0a0a0a">
            Remarks
          </text>
          <rect x={LEFT_MARGIN} y={remarksY} width={GRID_WIDTH} height={REMARKS_HEIGHT - 8} fill="#ffffff" stroke="#0a0a0a" strokeWidth={1} />
          {day.remarks.slice(0, 5).map((r, i) => {
            const x = xForHour(r.hour);
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={remarksY} y2={remarksY + 10} stroke="#0a0a0a" strokeWidth={0.8} />
                <text x={x + 4} y={remarksY + 18 + i * 10} fontSize="8.5" fontFamily="var(--font-mono)" fill="rgba(10,10,10,0.72)">
                  {r.text}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="official-log-footer">
        <div>
          <strong>Recap</strong>
          <span>70-hour / 8-day property-carrying cycle</span>
        </div>
        <div>
          <strong>Total Hours</strong>
          <span>{fmtHours(Object.values(day.totals).reduce((a, b) => a + b, 0))}</span>
        </div>
        <div>
          <strong>Driver Signature</strong>
          <i />
        </div>
      </div>
    </article>
  );
}
