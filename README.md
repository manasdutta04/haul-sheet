# Haul Sheet — Trip & ELD Log Planner

A full-stack app that takes a trip's **current location, pickup, drop-off, and current
70-hour/8-day cycle hours used**, plans a legal route under 49 CFR Part 395 (property-carrying
driver, no adverse driving conditions exception), and draws the resulting **daily driver's
log sheets** — the same 4-row grid (Off Duty / Sleeper Berth / Driving / On Duty Not Driving)
used on the paper FMCSA log.

**Stack:** Django + Django REST Framework (backend) · React + Vite + Leaflet (frontend)
**Maps/routing:** OpenStreetMap Nominatim (geocoding) + OSRM (routing) — both free, no API key.

---

## 1. What it does

1. You submit current location, pickup, drop-off, and hours already used in your cycle.
2. The backend geocodes all three places, gets a driving route (distance + duration for each
   leg) from the free OSRM demo server, then runs a rules engine
   (`backend/trips/services/hos_planner.py`) that simulates the whole trip minute-by-minute,
   inserting:
   - a **30-minute break** after 8 cumulative hours of driving,
   - a **fuel stop** (30 min) every 1,000 miles,
   - **1 hour** each for pickup and drop-off,
   - a **10-hour off-duty reset** whenever the 11-hour driving limit or 14-hour on-duty
     window is hit,
   - a **34-hour restart** if the rolling 70-hour/8-day limit is reached.
3. The simulation output is split into calendar days and returned as structured JSON.
4. The frontend draws each day as an SVG log-sheet grid, plots the route + stops on a Leaflet
   map, and lists the stop-by-stop itinerary.

This is a planning aid to demonstrate the logic, not a certified legal compliance tool —
see the in-app footer disclaimer.

---

## 2. Project layout

```
trip-eld-planner/
├── backend/                  # Django + DRF API
│   ├── config/                # settings, urls, wsgi/asgi
│   └── trips/
│       ├── services/
│       │   ├── geocode.py     # Nominatim geocoding
│       │   ├── routing.py     # OSRM routing
│       │   └── hos_planner.py # the HOS/ELD rules engine (core logic)
│       ├── views.py           # POST /api/plan-trip/
│       ├── serializers.py
│       └── tests.py           # unit tests for the rules engine
└── frontend/                  # React + Vite
    └── src/
        ├── App.jsx
        ├── api.js
        └── components/
            ├── TripForm.jsx
            ├── RouteMap.jsx
            ├── StopsList.jsx
            └── LogSheet.jsx    # the drawn ELD grid (SVG)
```

---

## 3. Run it locally

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                    # edit if needed
python manage.py test trips                              # run the rules-engine unit tests
python manage.py runserver 0.0.0.0:8000
```
The API is now at `http://localhost:8000/api/plan-trip/`.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env                                     # VITE_API_BASE_URL=http://localhost:8000
npm run dev
```
Open `http://localhost:5173`.

---

## 4. Deploying (free tiers)

Vercel doesn't run long-lived Django processes, so this app deploys the **frontend to Vercel**
and the **backend to Render** (both free).

### 4.1 Backend → Render
1. Push this repo to GitHub.
2. On [render.com](https://render.com) → **New +** → **Web Service** → connect the repo,
   root directory `backend`.
3. Settings:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn config.wsgi --log-file -`
   - **Environment variables:**
     - `DJANGO_SECRET_KEY` — any random string
     - `DJANGO_DEBUG` — `False`
     - `DJANGO_ALLOWED_HOSTS` — `your-app.onrender.com`
     - `CORS_ALLOWED_ORIGINS` — your Vercel URL, e.g. `https://your-app.vercel.app`
4. Deploy. Note the resulting URL, e.g. `https://haul-sheet-api.onrender.com`.

*(Render's free tier can be used the same way on Railway or Fly.io if preferred — the
`Procfile` and `requirements.txt` work as-is.)*

### 4.2 Frontend → Vercel
1. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo,
   root directory `frontend`.
2. Framework preset: **Vite**.
3. Environment variable: `VITE_API_BASE_URL` = your Render URL from step 4.1
   (e.g. `https://haul-sheet-api.onrender.com`).
4. Deploy.

Once both are live, open the Vercel URL — the app will call the Render API for trip planning.

---

## 5. API

`POST /api/plan-trip/`

```json
{
  "current_location": "Denver, CO",
  "pickup_location": "Kansas City, MO",
  "dropoff_location": "Chicago, IL",
  "current_cycle_used": 12,
  "start_datetime": "2025-01-01T06:00:00"   // optional, defaults to now
}
```

Returns route geometry + markers, a stop-by-stop itinerary (`stops`), and `daily_logs`
(one entry per calendar day with drawable segments and duty-status totals). See
`trips/views.py` for the full response shape.

---

## 6. Notes & assumptions

- Rules implemented: 11-hr driving limit, 14-hr on-duty window, 30-min break after 8 hrs
  driving, 10-hr off-duty reset, 70-hr/8-day cycle with 34-hr restart. Adverse driving
  conditions and sleeper-berth splitting are **not** modeled, per the assessment's stated
  assumptions.
- Fuel stops are assumed to take 30 minutes and occur every 1,000 miles.
- Pickup and drop-off are each fixed at 1 hour of on-duty (not driving) time.
- Speeds/durations for each leg come directly from OSRM's routing estimate; the simulator
  treats each leg's average speed as constant when deciding where a 1,000-mile fuel-stop
  boundary falls within that leg.
- Times are treated as naive "driver local time" (no timezone conversion) to keep the log
  sheets simple, matching how a paper RODS is filled out relative to the home terminal's time.
