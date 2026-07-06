import React, { useState } from "react";
import TripForm from "./components/TripForm.jsx";
import RouteMap from "./components/RouteMap.jsx";
import StopsList from "./components/StopsList.jsx";
import LogSheet from "./components/LogSheet.jsx";
import { planTrip } from "./api.js";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(payload) {
    setLoading(true);
    setError(null);
    try {
      const data = await planTrip(payload);
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <TripForm onSubmit={handleSubmit} loading={loading} error={error} />

      <main className="main">
        {!result && (
          <div className="main-empty">
            <h1>Plan the haul. Draw the log.</h1>
            <p>
              Enter your current location, pickup, drop-off, and hours already used in your
              70-hour/8-day cycle. Haul Sheet routes the trip, works out every required break,
              fuel stop, and rest period under 49 CFR Part 395, and draws the daily log sheets
              for you — the same grid an inspector would check.
            </p>
          </div>
        )}

        {result && (
          <>
            <div className="summary-strip">
              <div className="summary-cell">
                <div className="value">{result.summary.total_distance_miles}</div>
                <div className="label">Miles</div>
              </div>
              <div className="summary-cell">
                <div className="value">{result.summary.total_driving_hours}</div>
                <div className="label">Driving hrs</div>
              </div>
              <div className="summary-cell">
                <div className="value">{result.summary.num_days}</div>
                <div className="label">Log sheet{result.summary.num_days === 1 ? "" : "s"}</div>
              </div>
              <div className="summary-cell">
                <div className="value">{Math.round(result.summary.total_trip_duration_hours)}</div>
                <div className="label">Total hrs elapsed</div>
              </div>
            </div>

            <div className="section-title">
              Route
              <div className="rule" />
            </div>
            <RouteMap route={result.route} stops={result.stops} />

            <div className="section-title">
              Stops &amp; rest schedule
              <div className="rule" />
            </div>
            <StopsList stops={result.stops} />

            <div className="section-title">
              Daily log sheets
              <div className="rule" />
            </div>
            {result.daily_logs.map((day, i) => (
              <LogSheet day={day} index={i} key={day.date} />
            ))}

            <footer className="credits">
              Route data © OpenStreetMap contributors, via OSRM. Planning assumptions:
              property-carrying driver, 70-hr/8-day cycle, no adverse driving conditions,
              fuel stop every 1,000 mi, 1 hr each for pickup and drop-off. This tool is a
              planning aid, not a certified compliance record.
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
