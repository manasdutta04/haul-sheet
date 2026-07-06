# Contributing

Haul Sheet is an assessment project, so changes should stay focused and easy to review.

## Local Setup

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py test
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Before Opening A Pull Request

Run:

```bash
cd backend
python manage.py test
```

```bash
cd frontend
npm run build
```

## Code Style

- Keep HOS rule changes inside `backend/trips/services/hos_planner.py`.
- Keep map behavior inside `frontend/src/components/RouteMap.jsx`.
- Keep official log rendering inside `frontend/src/components/LogSheet.jsx`.
- Prefer clear logic and reviewer-friendly names over clever abstractions.

## Scope

Useful improvements:

- Better HOS test cases
- More robust route error handling
- Cleaner print/PDF output
- Improved accessibility
- Deployment documentation

