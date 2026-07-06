import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TripForm from "./components/TripForm.jsx";
import RouteMap from "./components/RouteMap.jsx";
import StopsList from "./components/StopsList.jsx";
import LogSheet from "./components/LogSheet.jsx";
import { planTrip } from "./api.js";

export default function App() {
  const navigate = useNavigate();
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
    <div className="app-shell-page">
      <header className="dash-header">
        <button className="dash-brand" type="button" onClick={() => navigate("/")}>
          Haul Sheet
        </button>
      </header>

      <div className="app-shell">
        <TripForm onSubmit={handleSubmit} loading={loading} error={error} />

        <main className="main">
          {!result && (
            <div className="main-empty">
              <div className="workspace-board" aria-label="Trip planning workspace">
                <div className="workspace-topline">
                  <span>Route workspace</span>
                  <span>Waiting for trip details</span>
                </div>

                <div className="route-canvas" aria-hidden="true">
                  <svg viewBox="0 0 760 300" role="presentation">
                    <path className="canvas-road-soft" d="M58 220 C172 80 282 88 382 158 S588 274 704 82" />
                    <path className="canvas-road" d="M58 220 C172 80 282 88 382 158 S588 274 704 82" />
                    <circle className="canvas-pin canvas-pin-a" cx="58" cy="220" r="9" />
                    <circle className="canvas-pin canvas-pin-b" cx="382" cy="158" r="9" />
                    <circle className="canvas-pin canvas-pin-c" cx="704" cy="82" r="9" />
                  </svg>
                  <div className="route-canvas-label route-canvas-label-a">Current</div>
                  <div className="route-canvas-label route-canvas-label-b">Pickup</div>
                  <div className="route-canvas-label route-canvas-label-c">Drop-off</div>
                </div>

                <div className="workspace-grid">
                  <section className="workspace-card">
                    <div className="workspace-card-title">Schedule preview</div>
                    <div className="schedule-lines">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </section>
                  <section className="workspace-card">
                    <div className="workspace-card-title">Log sheet preview</div>
                    <div className="mini-log-grid">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </section>
                  <section className="workspace-card workspace-card-accent">
                    <div className="workspace-card-title">Next step</div>
                    <p>Fill the route fields to generate stops, map, and daily logs.</p>
                  </section>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="result-report">
              

              <div className="summary-strip">
                <div className="summary-cell summary-cell-primary">
                  <div className="value">{result.summary.total_distance_miles}</div>
                  <div className="label">Miles</div>
                </div>
                <div className="summary-cell">
                  <div className="value">{result.summary.total_driving_hours}</div>
                  <div className="label">Driving hrs</div>
                </div>
                <div className="summary-cell">
                  <div className="value">{Math.round(result.summary.total_trip_duration_hours)}</div>
                  <div className="label">Total hrs elapsed</div>
                </div>
                <div className="summary-cell">
                  <div className="value">{result.summary.num_days}</div>
                  <div className="label">Log sheet{result.summary.num_days === 1 ? "" : "s"}</div>
                </div>
              </div>

              <div className="result-grid">
                <section className="result-panel result-panel-map">
                  <div className="section-title">
                    Route
                    <div className="rule" />
                  </div>
                  <RouteMap route={result.route} stops={result.stops} />
                </section>

                <section className="result-panel result-panel-stops">
                  <div className="section-title">
                    Stops &amp; rest schedule
                    <div className="rule" />
                  </div>
                  <StopsList stops={result.stops} />
                </section>
              </div>

              <section className="result-panel result-panel-logs">
                <div className="section-title">
                  Daily log sheets
                  <div className="rule" />
                </div>
                {result.daily_logs.map((day, i) => (
                  <LogSheet day={day} index={i} key={day.date} />
                ))}
              </section>

              <footer className="credits">
                Route data &copy; OpenStreetMap contributors, via OSRM. Planning assumptions:
                property-carrying driver, 70-hr/8-day cycle, no adverse driving conditions,
                fuel stop every 1,000 mi, 1 hr each for pickup and drop-off. This tool is a
                planning aid, not a certified compliance record.
              </footer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
