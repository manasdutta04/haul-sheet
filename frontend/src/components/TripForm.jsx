import React, { useMemo, useState } from "react";

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
  const [activeField, setActiveField] = useState(null);

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setActiveField(field);
    };
  }

  function handleFocus(field) {
    return () => setActiveField(field);
  }

  function handleBlur(field) {
    return (e) => {
      if (e.relatedTarget && e.currentTarget.parentElement?.contains(e.relatedTarget)) {
        return;
      }
      setActiveField((current) => (current === field ? null : current));
    };
  }

  const suggestionsFor = useMemo(() => {
    return Object.fromEntries(
      ["current_location", "pickup_location", "dropoff_location"].map((field) => {
        const value = form[field].trim().toLowerCase();
        const matches = PLACE_SUGGESTIONS.filter((place) => place.toLowerCase().includes(value)).slice(0, 6);
        return [field, value ? matches : PLACE_SUGGESTIONS.slice(0, 6)];
      }),
    );
  }, [form]);

  function acceptSuggestion(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setActiveField(null);
  }

  function renderAutocomplete(field, label, placeholder, hint) {
    const suggestions = suggestionsFor[field] || [];
    const isOpen = activeField === field && form[field].trim().length > 0 && suggestions.length > 0;

    return (
      <div className="field-group autocomplete-group">
        <label htmlFor={field}>{label}</label>
        <div className="autocomplete-shell">
          <input
            id={field}
            type="text"
            placeholder={placeholder}
            value={form[field]}
            onChange={update(field)}
            onFocus={handleFocus(field)}
            onBlur={handleBlur(field)}
            autoComplete="off"
            spellCheck="false"
            required
          />
          {isOpen && (
            <div className="autocomplete-menu" role="listbox" aria-label="Place suggestions">
              {suggestions.map((place) => (
                <button
                  key={place}
                  type="button"
                  className="autocomplete-item"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => acceptSuggestion(field, place)}
                >
                  {place}
                </button>
              ))}
            </div>
          )}
        </div>
        {hint && <span className="hint">{hint}</span>}
      </div>
    );
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
        {renderAutocomplete("current_location", "Current location", "e.g. Denver, CO")}

        {renderAutocomplete(
          "pickup_location",
          "Pickup location",
          "Start typing a place name"
        )}

        {renderAutocomplete(
          "dropoff_location",
          "Drop-off location",
          "Start typing a place name"
        )}

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
