# 3D Cadastral & ULPIN System
### भारत सरकार — Ministry of Rural Development

> A production-ready 3D geospatial platform for India's **Unique Land Parcel Identification Number (ULPIN)** system, built with React + CesiumJS (frontend) and FastAPI + Shapely (backend).

---

## 🏗️ Project Structure

```
ulpin-3d-cadastral/
├── backend/
│   ├── main.py              ← FastAPI app, ULPIN data, Shapely topology engine
│   └── requirements.txt     ← Python dependencies
│
└── frontend/
    ├── src/
    │   ├── App.jsx           ← Root layout, state management, API fetch
    │   ├── index.css         ← Tailwind + CesiumJS UI overrides
    │   ├── main.jsx          ← React 18 entry point
    │   └── components/
    │       ├── MapComponent.jsx  ← CesiumJS 3D map, parcels, click handler
    │       ├── Sidebar.jsx       ← Property detail panel (slides from right)
    │       └── Toolbar.jsx       ← Floor exploder, X-Ray toggle, parcel list
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API will be live at: **http://localhost:8000**
Interactive docs: **http://localhost:8000/docs**

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

App will be live at: **http://localhost:5173**

---

## 🗺️ Features

### 3D Map (CesiumJS)
| Feature | Details |
|---|---|
| Base map | OpenStreetMap tiles (no Cesium ion token required) |
| 3D Buildings | OSM Buildings via `Cesium.createOsmBuildingsAsync()` |
| Camera | Auto flies to Mathura (77.6737°E, 27.4924°N) at 800m, pitch -45° |
| ULPIN Parcels | 6 extruded polygon entities, color-coded by type |
| Click to select | Left-click → camera orbits entity + sidebar opens |

### Toolbar (Left Panel)
| Widget | Description |
|---|---|
| 🔬 Topology Engine | Real-time Shapely health score badge |
| 🏢 Floor Exploder | Slider (0–50m) separates stacked Vertical Unit floors along Z |
| 🔦 Subsurface X-Ray | Lowers globe opacity to 40%, highlights subsurface parcels in amber |
| 📋 Parcel Registry | Clickable list of all 6 ULPIN parcels |

### Sidebar (Right Panel)
- ULPIN identifier badge
- Property type colour badge
- 3D stats: height, area (m²), volume (m³)
- Owner info, district, land use, registration date
- Z_min / Z_max elevation display
- Action buttons: Certificate, Mutation, Report

---

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/parcels` | GeoJSON FeatureCollection of all 6 ULPIN parcels |
| GET | `/api/topology` | Shapely topology health report (100% Conflict-Free) |
| GET | `/api/parcel/{ulpin}` | Single parcel by ULPIN ID |

### Sample `/api/topology` response
```json
{
  "total_parcels": 6,
  "total_pairs_checked": 15,
  "conflicts_found": 0,
  "health_score": 100.0,
  "status": "CONFLICT-FREE",
  "message": "All parcels are topologically valid — 100% Conflict-Free"
}
```

---

## 🏛️ ULPIN Parcel Dataset (Mathura, UP)

| ULPIN | Owner | Type | Z range |
|---|---|---|---|
| `IN-UP-PAR-SRF-001` | Rajesh Kumar Sharma | Surface | 0m → 12m |
| `IN-UP-PAR-SRF-002` | Priya Devi Agarwal | Surface | 0m → 8m |
| `IN-UP-PAR-APT-F01` | Suresh Chandra Mishra | Vertical Unit (F1) | 0m → 4m |
| `IN-UP-PAR-APT-F02` | Anita Kumari Pandey | Vertical Unit (F2) | 4m → 8m |
| `IN-UP-PAR-APT-F03` | Vijay Singh Yadav | Vertical Unit (F3) | 8m → 12m |
| `IN-UP-PAR-SUB-001` | Mathura Jal Nigam | Subsurface | -8m → -2m |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 3D Rendering | CesiumJS 1.117 (WebGL) |
| Frontend Framework | React 18.3 + Vite 5 |
| Styling | Tailwind CSS 3.4 (custom gov palette) |
| Backend | FastAPI 0.141 + Uvicorn |
| Geometry Engine | Shapely 2.1 |
| Base Map | OpenStreetMap (UrlTemplateImageryProvider) |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Ashoka Navy | `#0b2545` | Headers, sidebar, badges |
| Saffron | `#f16529` | Accents, active states |
| Forest Green | `#138808` | Topology health, success |
| Slate 50 | `#f8fafc` | Page backgrounds |
