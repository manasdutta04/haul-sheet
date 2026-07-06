# Haul Sheet

Haul Sheet is a full-stack trip planner for the Full Stack Developer ELD assessment. It takes a driver's current location, pickup, drop-off, and current 70-hour cycle usage, then returns a routed trip plan with required fuel stops, rest breaks, and official-style daily log sheets.

Live app: `https://gethaulsheet.vercel.app`  
Backend API: `https://haul-sheet.onrender.com`

## Highlights

- Django REST API with a dedicated Hours of Service planning engine.
- React/Vite frontend with a polished planning workflow and generated report UI.
- Free map and routing stack using OpenStreetMap, Nominatim, OSRM, and Leaflet.
- Route map with markers for origin, pickup, drop-off, fuel stops, breaks, rests, and restarts.
- Daily driver's log sheets drawn on an official-style 24-hour duty grid.
- Multiple log sheets for multi-day trips.
- Print/PDF export for log sheets.
- Clear assumptions based on the assessment prompt.

## Assessment Coverage

### Inputs

- Current location
- Pickup location
- Drop-off location
- Current cycle used, in hours

### Outputs

- Map showing route and stop/rest information
- Stop-by-stop itinerary
- Daily ELD log sheets filled from the simulated schedule
- Printable/PDF-friendly output

### Assumptions Implemented

- Property-carrying driver
- 70-hour / 8-day cycle
- No adverse driving conditions
- 11-hour driving limit
- 14-hour on-duty window
- 30-minute break after 8 hours of driving
- 10-hour off-duty reset
- 34-hour restart when the 70-hour cycle is exhausted
- Fuel stop at least once every 1,000 miles
- 1 hour for pickup and 1 hour for drop-off

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Leaflet |
| Backend | Django, Django REST Framework |
| Routing | OSRM public demo server |
| Geocoding | OpenStreetMap Nominatim |
| Deployment | Vercel frontend, Render backend |

## Project Structure

```text
trip-eld-planner/
|-- backend/
|   |-- config/
|   |   |-- settings.py
|   |   `-- urls.py
|   |-- trips/
|   |   |-- services/
|   |   |   |-- geocode.py
|   |   |   |-- routing.py
|   |   |   `-- hos_planner.py
|   |   |-- views.py
|   |   |-- serializers.py
|   |   `-- tests.py
|   |-- manage.py
|   |-- Procfile
|   `-- requirements.txt
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |   |-- TripForm.jsx
|   |   |   |-- RouteMap.jsx
|   |   |   |-- StopsList.jsx
|   |   |   `-- LogSheet.jsx
|   |   |-- App.jsx
|   |   |-- LandingPage.jsx
|   |   `-- api.js
|   |-- vercel.json
|   `-- package.json
|-- render.yaml
`-- README.md
```

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py test
python manage.py runserver 0.0.0.0:8000
```

The API runs at:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/api/health/
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at:

```text
http://localhost:5173
```

For local development, the frontend defaults to:

```text
http://localhost:8000
```

You can override it with:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## API

### `POST /api/plan-trip/`

Request:

```json
{
  "current_location": "Denver, CO",
  "pickup_location": "Salt Lake City, UT",
  "dropoff_location": "St. Louis, MO",
  "current_cycle_used": 12,
  "start_datetime": "2026-07-06T08:00:00"
}
```

`start_datetime` is optional. If omitted, the backend uses the current server time as the trip start.

Response includes:

- route geometry
- map markers
- trip summary
- generated stops
- daily logs
- raw simulation events

## How The Planner Works

1. Geocode current, pickup, and drop-off locations with Nominatim.
2. Request a driving route from OSRM.
3. Split the route into current-to-pickup and pickup-to-drop-off legs.
4. Simulate HOS rules using `backend/trips/services/hos_planner.py`.
5. Insert fuel stops, breaks, rest periods, pickup, and drop-off events.
6. Split events by calendar day.
7. Return structured data for the map, itinerary, and daily log sheets.

## Testing

Backend:

```bash
cd backend
..\backend\.venv\Scripts\python.exe manage.py test
```

Frontend:

```bash
cd frontend
npm run build
```

Current verification:

- Django tests pass.
- Vite production build passes.
- Render health endpoint works when deployed with the documented environment variables.
- Vercel frontend works when `VITE_API_BASE_URL` points to the Render backend.


## License

MIT License. See [LICENSE](LICENSE).
