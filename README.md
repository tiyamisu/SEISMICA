# SEISMICA

<div align="center">

![SEISMICA Banner](https://img.shields.io/badge/SEISMICA-v2.0-00f2fe?style=for-the-badge&logo=globe&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)
![USGS](https://img.shields.io/badge/Data-USGS%20Live%20Feed-ff4d6d?style=for-the-badge)

**A real-time earthquake monitoring and autonomous drone-routing Command Center powered by live USGS seismic data and advanced TSP optimisation algorithms.**

[Live Demo](#) · [Report Bug](https://github.com/tiyamisu/SEISMICA/issues) · [Request Feature](https://github.com/tiyamisu/SEISMICA/issues)

</div>

---

## 📡 Project Overview

**SEISMICA** is a full-stack emergency-response platform that ingests live earthquake data from the USGS GeoJSON feeds, calculates the optimal reconnaissance flight path across all active seismic events using a two-stage TSP solver (Nearest-Neighbour heuristic → 2-Opt local search), and renders the results on an interactive dark-themed command-center dashboard.

The dashboard provides real-time telemetry, a 7-day historical magnitude histogram, an animated drone traversal, and a live seismic waveform — all designed to look and feel like an enterprise emergency-operations platform.

---

## ✨ Features

| Category | Feature |
|---|---|
| 🌍 **Live Data** | Ingests USGS GeoJSON feeds (all_day & all_week) on every request — no database needed |
| 🧠 **TSP Solver** | Two-stage pipeline: Nearest-Neighbour greedy heuristic + 2-Opt local search |
| 📊 **Efficiency Metrics** | Reports distance saved vs NN-only baseline as an "Optimisation Efficiency %" |
| 🗺️ **Interactive Map** | CartoDB Dark Matter Leaflet map with magnitude-scaled, colour-coded CircleMarkers |
| ✈️ **Drone Animation** | Animated drone marker traverses the optimised route waypoint by waypoint |
| 📈 **Histogram** | Recharts bar chart showing 7-day earthquake frequency binned by magnitude |
| 🎛️ **Command Center UI** | CSS Grid dashboard — top bar, control matrix, telemetry panel, waveform footer |
| 🌊 **Seismic Waveform** | Canvas `requestAnimationFrame` animation that reacts to active quake intensity |
| 🔒 **Robust API** | Typed JSON responses, edge-case handling (0 / 1 quake), timeout & HTTP error mapping |

---

## 🛠️ Tech Stack

### Backend
| Package | Purpose |
|---|---|
| **Node.js 18+** | Runtime |
| **Express 5** | HTTP server & routing |
| **Axios** | USGS GeoJSON feed fetching |
| **CORS** | Cross-origin request handling |

### Frontend
| Package | Purpose |
|---|---|
| **React 19** | UI framework |
| **react-leaflet 5** | Interactive map components |
| **Leaflet 1.9** | Underlying map engine |
| **Recharts 3** | SVG charting (magnitude histogram) |
| **Canvas API** | Seismic waveform animation |
| **CSS Grid** | Dashboard layout |
| **Orbitron** | Tactical monospace font (Google Fonts) |

### External Data
| Source | Endpoint |
|---|---|
| **USGS GeoJSON Feed** | `all_day.geojson` — live 24-hour events |
| **USGS GeoJSON Feed** | `all_week.geojson` — 7-day historical data |

---

## 🏗️ Architecture

```
SEISMICA/
├── backend/                    # Express API server
│   ├── server.js               # All routes + TSP service
│   └── package.json
│
└── frontend/                   # React SPA
    ├── public/
    │   └── index.html          # Shell HTML with meta/font links
    └── src/
        ├── index.js            # React entry point
        ├── index.css           # Global reset + Leaflet overrides
        └── App.js              # Entire dashboard (components + styles)
```

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/route?minMag={n}` | TSP-optimised flight path for quakes ≥ minMag |
| `GET` | `/api/stats` | Real-time global stats (count, avg/max/min magnitude) |
| `GET` | `/api/history` | 7-day magnitude histogram bins |
| `GET` | `/health` | Server health check |

### TSP Algorithm Pipeline

```
USGS Feed → Parse GeoJSON → Filter by minMag → Sort (top 40)
    ↓
Build N×N Haversine Distance Matrix
    ↓
Nearest-Neighbour Heuristic  (O(n²) greedy tour)
    ↓
2-Opt Local Search           (iterative swap until local optimum)
    ↓
Return: optimised route + NN baseline + efficiency %
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- Internet connection (live USGS data)

### 1. Clone the repository
```bash
git clone https://github.com/tiyamisu/SEISMICA.git
cd SEISMICA
```

### 2. Backend setup
```bash
cd backend
npm install
```

Copy the environment example file:
```bash
cp .env.example .env
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

---

## ▶️ Usage

### Start the backend (Terminal 1)
```bash
cd backend
npm start
# Server running on http://localhost:5000
```

### Start the frontend (Terminal 2)
```bash
cd frontend
npm start
# App running on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

### Using the Dashboard

1. **Adjust the Magnitude Slider** in the left Control Matrix (range 1.0 – 7.0)
2. **Click "DISPATCH DRONE"** — the backend fetches live USGS data and solves the TSP route
3. **Watch the map** populate with colour-coded earthquake markers and the cyan optimised flight path
4. **Monitor telemetry** in the right panel: distance saved, exec time, battery estimate, and the waypoint manifest
5. **The histogram** auto-loads on startup showing the past 7 days of seismic activity

---

## 🔌 API Reference

### `GET /api/route?minMag=4.5`
```json
{
  "route": [
    { "id": "us7000abc", "magnitude": 5.2, "place": "Southern Alaska", "latitude": 60.1, "longitude": -152.3, "depth": 10.0, "time": 1749000000000 }
  ],
  "totalDistanceKm": 48250.34,
  "nnDistanceKm": 51300.12,
  "optimisationEfficiency": 5.95,
  "executionTimeMs": 18.4
}
```

### `GET /api/stats`
```json
{
  "totalQuakes": 312,
  "avgMagnitude": 1.84,
  "maxMagnitude": 5.2,
  "minMagnitude": 0.1,
  "timestamp": "2026-06-07T07:00:00.000Z"
}
```

### `GET /api/history`
```json
{
  "bins": [
    { "range": "0-1", "count": 450 },
    { "range": "1-2", "count": 1200 }
  ],
  "totalEvents": 2800,
  "dateRange": { "from": "2026-05-31T...", "to": "2026-06-07T..." }
}
```

---


## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 👩‍💻 Author

**Tiyasha Sarkar**
- GitHub: [@tiyamisu](https://github.com/tiyamisu)
- Repository: [SEISMICA](https://github.com/tiyamisu/SEISMICA)

---

<div align="center">
  <sub>Built with ❤️ for earthquake monitoring and autonomous routing research.</sub>
</div>
