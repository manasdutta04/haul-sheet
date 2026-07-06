import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── SVG Truck Logo ───────────────────────────────────────────────────────── */
function TruckLogo({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Cab */}
      <rect x="2" y="14" width="20" height="16" rx="2" fill="#1a1a2e" />
      {/* Windshield */}
      <rect x="4" y="16" width="10" height="7" rx="1" fill="#76a8ff" opacity="0.9" />
      {/* Trailer */}
      <rect x="22" y="10" width="16" height="20" rx="2" fill="#0f1420" stroke="rgba(255,191,61,0.4)" strokeWidth="1" />
      {/* Trailer stripes */}
      <rect x="24" y="13" width="12" height="1.5" rx="0.75" fill="rgba(255,191,61,0.5)" />
      <rect x="24" y="17" width="12" height="1.5" rx="0.75" fill="rgba(255,191,61,0.3)" />
      <rect x="24" y="21" width="12" height="1.5" rx="0.75" fill="rgba(255,191,61,0.3)" />
      {/* Hitch */}
      <rect x="20" y="22" width="4" height="2" fill="#2a2a3e" />
      {/* Front wheel */}
      <circle cx="8" cy="32" r="4" fill="#0a0a14" />
      <circle cx="8" cy="32" r="2.2" fill="#2a2a3e" />
      <circle cx="8" cy="32" r="0.8" fill="#ffbf3d" />
      {/* Rear cab wheel */}
      <circle cx="18" cy="32" r="4" fill="#0a0a14" />
      <circle cx="18" cy="32" r="2.2" fill="#2a2a3e" />
      <circle cx="18" cy="32" r="0.8" fill="#ffbf3d" />
      {/* Trailer wheel */}
      <circle cx="30" cy="32" r="4" fill="#0a0a14" />
      <circle cx="30" cy="32" r="2.2" fill="#2a2a3e" />
      <circle cx="30" cy="32" r="0.8" fill="#ffbf3d" />
      {/* Headlight */}
      <rect x="2" y="20" width="2" height="3" rx="0.5" fill="#ffbf3d" opacity="0.9" />
    </svg>
  );
}

/* ─── Large Truck Logo (for sidenav box & footer icon) ─────────────────────── */
function TruckLogoLarge({ className = "" }) {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="14" width="20" height="16" rx="2" fill="#1a1a2e" />
      <rect x="4" y="16" width="10" height="7" rx="1" fill="#76a8ff" opacity="0.9" />
      <rect x="22" y="10" width="16" height="20" rx="2" fill="#0f1420" stroke="rgba(255,191,61,0.4)" strokeWidth="1" />
      <rect x="24" y="13" width="12" height="1.5" rx="0.75" fill="rgba(255,191,61,0.5)" />
      <rect x="24" y="17" width="12" height="1.5" rx="0.75" fill="rgba(255,191,61,0.3)" />
      <rect x="24" y="21" width="12" height="1.5" rx="0.75" fill="rgba(255,191,61,0.3)" />
      <rect x="20" y="22" width="4" height="2" fill="#2a2a3e" />
      <circle cx="8" cy="32" r="4" fill="#0a0a14" />
      <circle cx="8" cy="32" r="2.2" fill="#2a2a3e" />
      <circle cx="8" cy="32" r="0.8" fill="#ffbf3d" />
      <circle cx="18" cy="32" r="4" fill="#0a0a14" />
      <circle cx="18" cy="32" r="2.2" fill="#2a2a3e" />
      <circle cx="18" cy="32" r="0.8" fill="#ffbf3d" />
      <circle cx="30" cy="32" r="4" fill="#0a0a14" />
      <circle cx="30" cy="32" r="2.2" fill="#2a2a3e" />
      <circle cx="30" cy="32" r="0.8" fill="#ffbf3d" />
      <rect x="2" y="20" width="2" height="3" rx="0.5" fill="#ffbf3d" opacity="0.9" />
    </svg>
  );
}

/* ─── Utility: Active section tracking ────────────────────────────────────── */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0] || "");
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);
  return [active, setActive];
}

const NAV_SECTIONS = ["hero", "features", "faq"];

/* ─── Feature card previews ───────────────────────────────────────────────── */
function RouteSheetPreview() {
  const rows = [
    { city: "Chicago, IL", miles: "284 mi", status: "Pickup" },
    { city: "St. Louis, MO", miles: "567 mi", status: "Fuel" },
    { city: "Oklahoma City", miles: "840 mi", status: "Rest" },
    { city: "Amarillo, TX", miles: "1,108 mi", status: "Fuel" },
  ];
  return (
    <div className="lp-fp lp-fp-route">
      <div className="lp-fp-row">
        <div className="lp-fp-cell lp-fp-cell-head">City</div>
        <div className="lp-fp-cell lp-fp-cell-head">Miles</div>
        <div className="lp-fp-cell lp-fp-cell-head">Type</div>
      </div>
      {rows.map((r, i) => (
        <div key={r.city} className="lp-fp-row" style={{ opacity: 1, transitionDelay: `${i * 80}ms` }}>
          <div className="lp-fp-cell">{r.city}</div>
          <div className="lp-fp-cell" style={{ color: "rgba(10,10,10,0.6)" }}>{r.miles}</div>
          <div className="lp-fp-cell lp-fp-cell-green">{r.status}</div>
        </div>
      ))}
    </div>
  );
}

function ELDLogPreview() {
  return (
    <div className="lp-fp" style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: "0.5rem" }}>
      <div style={{ fontSize: "0.5625rem", color: "rgba(10,10,10,0.45)", display: "flex", alignItems: "center", gap: 4 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Day 1 Log · 24 hrs
      </div>
      <div className="lp-fp-eld-grid">
        <div className="lp-fp-eld-labels">
          {["Off Duty", "Sleeper", "Driving", "On Duty"].map((l) => (
            <div key={l} className="lp-fp-eld-label">{l}</div>
          ))}
        </div>
        <div className="lp-fp-eld-chart">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="lp-fp-eld-row">
              <div className={`lp-fp-eld-bar lp-fp-eld-bar-${row}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapPreview() {
  return (
    <div className="lp-fp-map">
      <div className="lp-fp-map-grid" />
      <div className="lp-fp-map-dot lp-fp-map-dot-a" />
      <div className="lp-fp-map-dot lp-fp-map-dot-b" />
      <div className="lp-fp-map-line" />
    </div>
  );
}

function HoursGaugePreview() {
  return (
    <div className="lp-fp lp-fp-gauge">
      {[
        { label: "Drive Time", used: "7.5 hrs", fill: "lp-fp-gauge-fill-1" },
        { label: "On-Duty", used: "9.0 hrs", fill: "lp-fp-gauge-fill-2" },
        { label: "70-hr cycle", used: "42 hrs", fill: "lp-fp-gauge-fill-3" },
      ].map((g) => (
        <div key={g.label} className="lp-fp-gauge-row">
          <div className="lp-fp-gauge-label-row">
            <span>{g.label}</span>
            <span>{g.used}</span>
          </div>
          <div className="lp-fp-gauge-track">
            <div className={`lp-fp-gauge-fill ${g.fill}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StopsPreview() {
  const stops = [
    { dot: "#ffbf3d", name: "Chicago, IL", tag: "Origin" },
    { dot: "#76a8ff", name: "Rest Area · I-44", tag: "30-min break" },
    { dot: "#4fd0a0", name: "Pilot Travel Ctr", tag: "Fuel stop" },
    { dot: "#ff6d5f", name: "Los Angeles, CA", tag: "Delivery" },
  ];
  return (
    <div className="lp-fp lp-fp-stops">
      {stops.map((s) => (
        <div key={s.name} className="lp-fp-stop-row">
          <div className="lp-fp-stop-dot" style={{ background: s.dot }} />
          <div className="lp-fp-stop-name">{s.name}</div>
          <div className="lp-fp-stop-tag">{s.tag}</div>
        </div>
      ))}
    </div>
  );
}

function SummaryPreview() {
  const cells = [
    { val: "1,812", label: "Miles" },
    { val: "28.4", label: "Drive hrs" },
    { val: "3", label: "Log sheets" },
    { val: "34", label: "Total hrs" },
  ];
  return (
    <div className="lp-fp lp-fp-summary">
      {cells.map((c) => (
        <div key={c.label} className="lp-fp-summary-cell">
          <div className="lp-fp-summary-val">{c.val}</div>
          <div className="lp-fp-summary-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Features data ────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    title: "Plan any haul, coast to coast",
    description: "Enter origin, pickup, and drop-off. Get a full route with every required stop under 49 CFR Part 395.",
    Preview: RouteSheetPreview,
    cta: "Try a route",
  },
  {
    title: "Auto-drawn ELD log sheets",
    description: "Driving, on-duty, sleeper, off-duty — drawn on the same 24-hr grid an inspector checks.",
    Preview: ELDLogPreview,
    cta: "See a log",
  },
  {
    title: "Live route on interactive map",
    description: "Every stop, fuel point, and rest area pinned on a Leaflet map with full route polylines.",
    Preview: MapPreview,
    cta: "View map",
  },
  {
    title: "Hours-of-service gauges",
    description: "Real-time drive, on-duty, and 70-hr/8-day cycle tracking so you never overshoot a limit.",
    Preview: HoursGaugePreview,
    cta: "Check limits",
  },
  {
    title: "Every stop, scheduled & labeled",
    description: "Fuel stops every 1,000 mi, mandatory 30-min breaks, and 10-hr rest windows — all auto-placed.",
    Preview: StopsPreview,
    cta: "See stops",
  },
  {
    title: "One-glance trip summary",
    description: "Total miles, driving hours, number of log sheets, and elapsed time — front and center.",
    Preview: SummaryPreview,
    cta: "Run a trip",
  },
];

/* ─── FAQ data ─────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "What is Haul Sheet?",
    a: "Haul Sheet is a trip planning tool for commercial truck drivers. Enter your origin, pickup, drop-off, and current cycle hours — Haul Sheet routes the trip, calculates every required break and rest period under FMCSA Hours of Service rules, and draws the daily ELD log sheets automatically.",
  },
  {
    q: "Which HOS rules does Haul Sheet follow?",
    a: "Haul Sheet follows the FMCSA 49 CFR Part 395 property-carrying driver rules: 11-hr driving limit, 14-hr on-duty window, 30-minute break requirement after 8 hrs of driving, and the 70-hr/8-day cycle.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. Haul Sheet is free to use with no account required. Just fill in your trip details and hit Plan Trip. Your trip data stays in your browser session.",
  },
  {
    q: "Is this a certified compliance record?",
    a: "No. Haul Sheet is a planning aid, not a certified ELD or official compliance record. Always verify your logs with your fleet's certified ELD device and consult FMCSA guidelines for regulatory requirements.",
  },
];

/* ─── Marquee items ────────────────────────────────────────────────────────── */
const MARQUEE = [
  "Plan the haul",
  "Draw the log",
  "49 CFR Part 395",
  "11-hr driving limit",
  "70-hr/8-day cycle",
  "FMCSA compliant",
  "HOS planning",
  "ELD log sheets",
  "Route optimization",
];

/* ─── Side Nav ─────────────────────────────────────────────────────────────── */
function SideNav({ active }) {
  const links = [
    { id: "hero", label: "Product" },
    { id: "features", label: "Features" },
    { id: "faq", label: "FAQ" },
  ];

  function scrollTo(e, id) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div className="lp-sidenav">
      <a href="#hero" className="lp-sidenav-logo" onClick={(e) => scrollTo(e, "hero")} aria-label="Back to top">
        <TruckLogoLarge />
      </a>
      <nav aria-label="Page sections">
        <ul className="lp-sidenav-nav">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={(e) => scrollTo(e, l.id)}
                className={`lp-sidenav-link${active === l.id ? " active" : ""}`}
                aria-current={active === l.id ? "true" : undefined}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/* ─── Hero visual (pixel-map-style box) ───────────────────────────────────── */
function HeroVisual() {
  return (
    <div className="lp-hero-visual" aria-hidden="true" role="presentation">
      <div className="lp-hero-visual-inner">
        <div className="lp-hero-visual-map">
          <div className="lp-fp-map-grid" />
          {/* SVG route line */}
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            viewBox="0 0 300 280"
            fill="none"
          >
            <path
              d="M60 60 C 80 100, 180 160, 240 220"
              stroke="rgba(118,168,255,0.55)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <circle cx="60" cy="60" r="4" fill="#ffbf3d" />
            <circle cx="240" cy="220" r="4" fill="#4fd0a0" />
            {/* Intermediate dots */}
            <circle cx="110" cy="110" r="3" fill="rgba(255,191,61,0.6)" />
            <circle cx="165" cy="155" r="3" fill="rgba(255,191,61,0.6)" />
            <circle cx="200" cy="185" r="3" fill="rgba(255,191,61,0.6)" />
          </svg>
          {/* Labels */}
          <div style={{
            position: "absolute", top: "14%", left: "14%",
            fontSize: "0.5rem", color: "#ffbf3d", fontFamily: "monospace",
            textTransform: "uppercase", letterSpacing: "0.06em"
          }}>Chicago</div>
          <div style={{
            position: "absolute", bottom: "14%", right: "10%",
            fontSize: "0.5rem", color: "#4fd0a0", fontFamily: "monospace",
            textTransform: "uppercase", letterSpacing: "0.06em"
          }}>Los Angeles</div>
        </div>
        <div className="lp-hero-visual-label">1,812 mi · 3 log sheets</div>
      </div>
    </div>
  );
}

/* ─── Band 1 (Route Planner) ─────────────────────────────────────────────── */
function BandRoutePlanner() {
  return (
    <section id="route-planner" className="lp-band" style={{ scrollMarginTop: "5rem" }}>
      <div className="lp-band-header">
        <h2 className="lp-band-h2">Enter a city.<br />Get the whole plan.</h2>
        <p className="lp-band-desc">
          One form. Haul Sheet routes the trip, works out every break, fuel stop, and rest period — then draws the log sheets.
        </p>
      </div>
      <div className="lp-band-image-wrap">
        <div className="lp-band-bg-road" />
        <div className="lp-band-pixels" />
        <div className="lp-band-stars" />
        <div className="lp-band-road" />
        <div className="lp-band-road-line" />
        <div className="lp-band-mountains" />
        {/* Glass prompt card */}
        <div className="lp-glass-card" style={{ justifyContent: "center" }}>
          <div className="lp-prompt-bar">
            <span className="lp-prompt-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <span className="lp-prompt-text">
              Chicago → Los Angeles · 42 hrs already used
            </span>
            <button className="lp-prompt-send" aria-label="Plan trip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Band 2 (Compliance) ────────────────────────────────────────────────── */
function BandCompliance() {
  return (
    <section id="compliance" className="lp-band" style={{ scrollMarginTop: "5rem" }}>
      <div className="lp-band-header">
        <h2 className="lp-band-h2">From a single trip to a finished log sheet</h2>
        <p className="lp-band-desc">
          Complete the trip form. Haul Sheet writes the HOS-compliant schedule. Your log is ready for inspection.
        </p>
      </div>
      <div className="lp-band-image-wrap">
        <div className="lp-band-bg-sunset" />
        <div className="lp-band-pixels" />
        <div className="lp-band-stars" />
        <div className="lp-band-poppies" />
        {/* Glass compliance card */}
        <div className="lp-glass-card">
          <div className="lp-glass-card-inner">
            <div className="lp-fp-workflow-title" style={{ fontFamily: "inherit", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>
              Trip · Chicago → Los Angeles
            </div>
            <div className="lp-fp-workflow-chips">
              {["Pickup: 1 hr", "Fuel stops ×3", "30-min break", "10-hr rest"].map((chip) => (
                <span key={chip} className="lp-fp-workflow-chip">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg> {chip}
                </span>
              ))}
            </div>
            <div className="lp-fp-workflow-status">
              <div className="lp-fp-workflow-check">✓</div>
              <span style={{ fontSize: "0.8125rem" }}>
                Log sheet generated <span style={{ color: "rgba(10,10,10,0.45)" }}>· Completed</span>
              </span>
            </div>
            <div className="lp-fp-workflow-note">
              <span className="lp-fp-workflow-note-chip">
                <span className="lp-fp-workflow-dot" />
                HOS-compliant
              </span>
            </div>
            <div style={{
              marginTop: "0.75rem",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(10,10,10,0.08)",
              padding: "0.75rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Day 1 — ELD Log Sheet</span>
                <span style={{ background: "rgba(255,191,61,0.3)", borderRadius: 6, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 500 }}>Property</span>
              </div>
              <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "rgba(10,10,10,0.60)", lineHeight: 1.5 }}>
                11 hrs driving · 14 hrs on-duty window · 30-min break at hour 8 · 10-hr mandatory rest.
              </p>
              <div style={{ marginTop: "0.375rem", fontSize: "0.6875rem", color: "rgba(10,10,10,0.40)" }}>
                Compliant with 49 CFR Part 395
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Grid ─────────────────────────────────────────────────────────── */
function FeatureGrid() {
  return (
    <div className="lp-features-grid">
      {FEATURES.map(({ title, description, Preview, cta }) => (
        <article key={title} className="lp-feature-card">
          <div className="lp-feature-preview">
            <Preview />
          </div>
          <div className="lp-feature-body">
            <h3 className="lp-feature-title">{title}</h3>
            <p className="lp-feature-desc">{description}</p>
            <div className="lp-feature-cta">
              <span>{cta}</span>
              <span className="lp-feature-cta-icon">✓</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ─── FAQ Section ──────────────────────────────────────────────────────────── */
function FaqSection() {
  return (
    <section id="faq" className="lp-faq">
      <div className="lp-faq-header">
        <p className="lp-faq-eyebrow">Questions</p>
        <h2 className="lp-faq-h2">Frequently asked questions</h2>
      </div>
      <dl className="lp-faq-list">
        {FAQS.map((item) => (
          <div key={item.q} className="lp-faq-item">
            <dt className="lp-faq-q">{item.q}</dt>
            <dd className="lp-faq-a">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ─── Footer ───────────────────────────────────────────────────────────────── */
function Footer({ onGetStarted }) {
  const marqueeDouble = [...MARQUEE, ...MARQUEE];
  const linkColumns = [
    {
      title: "Tools",
      links: [
        { label: "Trip Planner", href: "/dash" },
        { label: "ELD Log Generator", href: "/dash" },
        { label: "HOS Tracker", href: "/dash" },
        { label: "Route Optimizer", href: "/dash" },
      ],
    },
    {
      title: "Compliance",
      links: [
        { label: "FMCSA 49 CFR Part 395", href: "https://www.fmcsa.dot.gov/regulations/hours-service", external: true },
        { label: "11-Hour Driving Rule", href: "#faq" },
        { label: "14-Hour On-Duty Limit", href: "#faq" },
        { label: "70-Hour / 8-Day Cycle", href: "#faq" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Documentation", href: "#faq" },
        { label: "Privacy Policy", href: "#faq" },
        { label: "Terms of Service", href: "#faq" },
        { label: "Report an Issue", href: "#faq" },
      ],
    },
  ];

  return (
    <footer className="lp-footer">
      {/* Marquee */}
      <div className="lp-marquee-strip">
        <div className="lp-marquee-track">
          {marqueeDouble.map((item, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: "3rem" }}>
              {item}
              <span className="lp-marquee-sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="lp-footer-body">
        {/* CTA block */}
        <div className="lp-footer-cta">
          <div>
            <p className="lp-footer-eyebrow">Get started</p>
            <h2 className="lp-footer-h2">
              Plan your next<br />haul today.
            </h2>
            <p className="lp-footer-sub">
              Calculate HOS limits, plot optimal routes, and pre-plan your daily logs on our interactive map.
            </p>
          </div>
          <div className="lp-footer-btn-row">
            <button className="lp-footer-btn-primary" onClick={onGetStarted} id="footer-get-started-btn">
              Get Started
              <span className="lp-arrow">↗</span>
            </button>
            <a href="#faq" className="lp-footer-btn-outline">Learn more</a>
          </div>
        </div>

        {/* Link columns */}
        <div className="lp-footer-links">
          <div className="lp-footer-brand-col">
            <p className="lp-footer-brand-name">Haul Sheet</p>
            <p className="lp-footer-brand-tagline">Compliant HOS planning & route logs for commercial operators.</p>
          </div>
          {linkColumns.map((col) => (
            <div key={col.title}>
              <p className="lp-footer-col-title">{col.title}</p>
              <ul className="lp-footer-col-links">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="lp-footer-col-link">
                        {link.label} ↗
                      </a>
                    ) : (
                      <a href={link.href} className="lp-footer-col-link">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Giant wordmark */}
        <div className="lp-footer-wordmark" aria-hidden="true" style={{ padding: "2rem 0", textAlign: "center" }}>
          <p className="lp-footer-wordmark-text" style={{ margin: 0 }}>Haul Sheet</p>
        </div>

        {/* Bottom bar */}
        <div className="lp-footer-bottom">
          <p className="lp-footer-copy">© 2026 Haul Sheet. All rights reserved.</p>
          <a href="#hero" className="lp-footer-top-btn" aria-label="Back to top">↑</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Landing Page ────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();

  function handleGetStarted() {
    navigate("/dash");
  }

  function scrollTo(e, id) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div className="landing-root" id="top">
      <a className="lp-skip-link" href="#main-content">Skip to content</a>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="lp-header">
        <div className="lp-header-inner">
          <a href="#top" className="lp-brand" onClick={(e) => scrollTo(e, "hero")}>
            Haul Sheet
          </a>
          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link" onClick={(e) => scrollTo(e, "features")}>Features</a>
            <a href="#faq" className="lp-nav-link" onClick={(e) => scrollTo(e, "faq")}>FAQ</a>
            <button className="lp-btn-primary" onClick={handleGetStarted} id="header-get-started-btn">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="lp-layout">
        <div id="main-content">
          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <section id="hero" className="lp-hero">
            <div>
              <p className="lp-hero-eyebrow">FMCSA · 49 CFR Part 395</p>
              <h1 className="lp-hero-h1">
                Plan the haul.<br />Draw the log.
              </h1>
              <p className="lp-hero-desc">
                Enter your current location, pickup, drop-off, and hours already used in your 70-hour/8-day cycle. Haul Sheet routes the trip, works out every required break, fuel stop, and rest period — and draws the daily log sheets for you.
              </p>
              <div className="lp-hero-cta-row">
                <button
                  className="lp-hero-btn-primary"
                  onClick={handleGetStarted}
                  id="hero-get-started-btn"
                >
                  Get Started →
                </button>
                <a href="#features" className="lp-hero-btn-secondary" onClick={(e) => scrollTo(e, "features")}>
                  ▷ See all features
                </a>
              </div>
            </div>
            <HeroVisual />
          </section>

          {/* ── Band 1: Route Planner ────────────────────────────────────── */}
          <BandRoutePlanner />

          {/* ── Feature Grid ─────────────────────────────────────────────── */}
          <section id="features" className="lp-features-section">
            <div className="lp-features-header">
              <h2 className="lp-features-h2">Everything Haul Sheet can do</h2>
              <p className="lp-features-desc">
                Each one starts from three cities and your hours used. None of it needs watching.
              </p>
            </div>
            <FeatureGrid />
          </section>

          {/* ── Band 2: Compliance ───────────────────────────────────────── */}
          <BandCompliance />

          {/* ── Caption ──────────────────────────────────────────────────── */}
          <p className="lp-caption">
            The best route plan is the one you stop having to think about.
          </p>

          {/* ── FAQ ──────────────────────────────────────────────────────── */}
          <FaqSection />
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <Footer onGetStarted={handleGetStarted} />
    </div>
  );
}
