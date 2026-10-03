# Shelfwise – Inventory System

A simple inventory manager with a polished React UI and a small FastAPI backend.

**Stack:** React + TypeScript (Vite) · FastAPI · SQLAlchemy · SQLite

## Features
- Dashboard with product count, units on hand, stock value and items to reorder
- Search, category chips and stock-status filter
- Visual stock bars with a reorder-point marker
- Quick +/− stock adjustment right in the table
- Add / edit products in a slide-in drawer, delete with confirmation
- Sample data seeded on first run, SKU uniqueness and validation handled by the API

## Run locally

**Backend** (http://localhost:8000, docs at /docs)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend** (http://localhost:5173)
```bash
cd frontend
npm install
npm run dev
```

If your API runs elsewhere, copy `frontend/.env.example` to `frontend/.env` and change `VITE_API_URL`.

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/products` | List products |
| POST | `/products` | Create a product |
| PUT | `/products/{id}` | Update a product |
| PATCH | `/products/{id}/stock` | Adjust quantity by `delta` |
| DELETE | `/products/{id}` | Delete a product |
| GET | `/stats` | Dashboard totals |

## Project structure
```
frontend/   React + TypeScript app (src/types.ts, api.ts, components: StatsBar, Toolbar, ProductTable, ProductDrawer)
backend/    FastAPI app (app/main.py, models.py, schemas.py, seed.py)
```
