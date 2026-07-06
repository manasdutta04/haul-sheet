import React, { useState } from "react";

const PLACE_SUGGESTIONS = [
  "Denver, CO",
  "Aurora, CO",
  "Kansas City, MO",
  "Chicago, IL",
  "St. Louis, MO",
  "Omaha, NE",
  "Dallas, TX",
  "Houston, TX",
  "Phoenix, AZ",
  "Los Angeles, CA",
  "Seattle, WA",
  "Salt Lake City, UT",
  "Atlanta, GA",
  "Nashville, TN",
  "Indianapolis, IN",
  "Memphis, TN",
  "Charlotte, NC",
  "Raleigh, NC",
  "Albuquerque, NM",
  "Birmingham, AL",
];

const DEFAULTS = {
  current_location: "",
  pickup_location: "",
  dropoff_location: "",
  current_cycle_used: "",
};

export default function TripForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState(DEFAULTS);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      current_location: form.current_location.trim(),
      pickup_location: form.pickup_location.trim(),
      dropoff_location: form.dropoff_location.trim(),
      current_cycle_used: Number(form.current_cycle_used || 0),
    });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-glow" aria-hidden="true" />
      <div className="brand">
        <svg className="brand-mark" viewBox="0 0 34 34" fill="none">
          <rect width="34" height="34" rx="7" fill="#f2b705" />
          <path d="M6 22V12h9l4 4v6H6Z" stroke="#16130a" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12" cy="23" r="2.2" fill="#16130a" />
          <circle cx="22" cy="23" r="2.2" fill="#16130a" />
          <path d="M15 12v-3h5l3 5" stroke="#16130a" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        <div>
          <div className="brand-title">Haul&nbsp;Sheet</div>
          <div className="brand-subtitle">TRIP &amp; ELD LOG PLANNER</div>
        </div>
      </div>

      <div className="sidebar-note">
        Build with city names, ZIPs, airports, or landmarks. Pick a suggestion in pickup and drop-off to keep geocoding clean.
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <datalist id="place-suggestions">
          {PLACE_SUGGESTIONS.map((place) => (
            <option key={place} value={place} />
          ))}
        </datalist>

        <div className="field-group">
          <label htmlFor="current_location">Current location</label>
          <input
            id="current_location"
            type="text"
            list="place-suggestions"
            placeholder="e.g. Denver, CO"
            value={form.current_location}
            onChange={update("current_location")}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="pickup_location">Pickup location</label>
          <input
            id="pickup_location"
            type="text"
            list="place-suggestions"
            placeholder="Start typing a place name"
            value={form.pickup_location}
            onChange={update("pickup_location")}
            required
          />
          <span className="hint">Use a clear place name here. Choose a suggestion if the browser offers one.</span>
        </div>

        <div className="field-group">
          <label htmlFor="dropoff_location">Drop-off location</label>
          <input
            id="dropoff_location"
            type="text"
            list="place-suggestions"
            placeholder="Start typing a place name"
            value={form.dropoff_location}
            onChange={update("dropoff_location")}
            required
          />
          <span className="hint">If multiple matches appear, pick the most specific place name you see.</span>
        </div>

        <div className="field-group">
          <label htmlFor="cycle">Current cycle used (hrs)</label>
          <input
            id="cycle"
            type="number"
            min="0"
            max="70"
            step="0.5"
            placeholder="0–70"
            value={form.current_cycle_used}
            onChange={update("current_cycle_used")}
            required
          />
          <span className="hint">Hours already on-duty in the rolling 70-hr / 8-day cycle.</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? "Plotting route…" : "Plan trip"}
        </button>
      </form>

      <div className="assumptions">
        <strong>Assumptions:</strong> property-carrying driver, 70&#8211;hr/8&#8209;day cycle,
        no adverse driving conditions, fuel stop every 1,000 mi, 1 hr each for pickup &amp; drop-off.
      </div>
    </aside>
  );
}
