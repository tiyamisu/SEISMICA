# SEISMICA
### Complete Project Documentation

> **Author:** Tiyasha Sarkar
> **Version:** 3.0.0
> **Stack:** Node.js · Express · React · Leaflet · Recharts · Canvas API
> **Domain:** Disaster Response · Route Optimization · Geospatial Visualization · Algorithm Design

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Complete System Architecture](#4-complete-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [How Earthquake Data Is Obtained](#6-how-earthquake-data-is-obtained)
7. [Drone Reconnaissance Concept](#7-drone-reconnaissance-concept)
8. [Travelling Salesperson Problem](#8-travelling-salesperson-problem)
9. [Route Optimization Workflow](#9-route-optimization-workflow)
10. [Mission Battery Simulation](#10-mission-battery-simulation)
11. [Interactive Dashboard Components](#11-interactive-dashboard-components)
12. [Key Features](#12-key-features)
13. [Performance Optimizations](#13-performance-optimizations)
14. [Future Enhancements](#14-future-enhancements)
15. [Conclusion](#15-conclusion)

---

## 1. Project Overview

### What Is SEISMICA?

**SEISMICA** is a full-stack, real-time earthquake monitoring and autonomous drone route optimization platform. It fetches live seismic event data from the United States Geological Survey (USGS) global earthquake feed, applies classical combinatorial optimization algorithms to compute the most efficient drone reconnaissance path across all detected earthquake sites, and presents the results through an enterprise-grade command-center dashboard.

The name **SEISMICA** derives from *seismic* — relating to earthquakes — reflecting both the domain (earthquake science) and the application's purpose (operationalizing seismic intelligence for rapid response).

### Why Was SEISMICA Built?

SEISMICA was built to bridge two fields that rarely intersect in educational and applied software:

1. **Geospatial Data Science** — making real-world USGS earthquake telemetry accessible and visual
2. **Combinatorial Optimization** — applying the Travelling Salesperson Problem (TSP) to a real, data-driven scenario

Most TSP demonstrations use toy examples with made-up city coordinates. SEISMICA uses *live earthquake coordinates* from across the globe, making the problem concrete, dynamic, and immediately relatable.

### The Real-World Problem It Solves

Every day, hundreds of earthquakes occur worldwide. The USGS records and publishes these events in near real-time. When a major seismic event cluster occurs — multiple significant earthquakes in a short time window — emergency management agencies need **rapid situational awareness**:

- Which areas were hardest hit?
- What infrastructure is affected?
- Where should first responders be deployed?

Sending human teams to every location immediately is logistically impossible. **Autonomous reconnaissance drones** are the fastest, safest, and most cost-effective first-response tool for gathering intelligence across multiple sites.

SEISMICA answers a critical operational question:

> *Given N earthquake locations, what is the shortest possible path for a drone to survey all of them, minimizing time, battery consumption, and total flight distance?*

### Why Earthquake Reconnaissance Matters

- The first 72 hours after a major earthquake are critical for survival — the "golden window" for rescue operations
- Rapid aerial imagery can locate trapped survivors, blocked roads, collapsed buildings, and gas leaks before ground teams arrive
- Unmanned aerial systems (UAS) eliminate risk to human reconnaissance personnel
- An optimized flight path means faster coverage, longer battery life, and more missions per charge

---

## 2. Problem Statement

### The Challenge of Multi-Location Seismic Response

Imagine a scenario: a major tectonic event triggers **15 significant earthquakes** (magnitude ≥ 4.5) across a wide region within a 24-hour period. Each location needs to be surveyed by a reconnaissance drone. The drone:

- Has a **finite battery capacity** (e.g., 100 Wh)
- Has a **maximum operational range** (e.g., 2,000 km before requiring a recharge)
- Must **visit every affected location** to gather intelligence
- Should **return to its base** after completing the survey

### Why Random Order Is Catastrophically Inefficient

If the drone visits earthquake sites in the order they were recorded (by time), the resulting flight path will likely zigzag across the map — covering the same geographic area multiple times and wasting enormous amounts of energy.

**Example — Random vs Optimized:**

```
Random path (15 sites):    ~18,400 km total distance
Nearest Neighbour path:    ~12,200 km total distance
2-Opt Optimized path:      ~10,800 km total distance

Energy savings: ~41% compared to random order
```

A 41% reduction in flight distance translates directly to:
- **41% less battery consumption** → more missions per charge
- **41% less flight time** → faster intelligence delivery
- **41% lower mission cost** → more economical operations

### The Optimization Challenge

The fundamental question SEISMICA solves is a variant of the **Travelling Salesperson Problem**:

> *Find the shortest closed-loop tour that visits every earthquake site exactly once and returns to the origin.*

This is provably one of the hardest problems in computer science (NP-hard), meaning there is no known algorithm that can find the guaranteed optimal solution in polynomial time for large inputs. SEISMICA implements **two well-established approximation algorithms** — Nearest Neighbour (for an initial tour) and 2-Opt (for local optimization) — to find a near-optimal solution rapidly, in real-time.

---

## 3. Project Objectives

### Primary Objectives

1. **Live Data Integration**
   Fetch real earthquake data from the USGS GeoJSON API with support for multiple timeframes: last 24 hours, 48 hours, 7 days, and 30 days.

2. **Geospatial Visualization**
   Render all detected earthquake events as interactive markers on a global tactical map, color-coded and sized by magnitude.

3. **Route Optimization**
   Compute an efficient drone reconnaissance path across all filtered earthquake sites using the Nearest Neighbour heuristic followed by 2-Opt local search optimization.

4. **Algorithm Comparison**
   Side-by-side comparison of the Nearest Neighbour (pre-optimization) route against the 2-Opt optimized route, showing distance saved, execution time for each algorithm phase, and optimization percentage.

5. **Mission Feasibility Simulation**
   Simulate drone battery consumption based on configurable parameters (battery capacity in Wh, maximum range in km, cruise speed in km/h, energy consumption in Wh/km) and determine whether the computed mission is feasible or results in a failure state.

6. **Real-Time Intelligence Feed**
   Generate a terminal-style live alert feed from the routed earthquake data, categorizing each event by severity level (ALERT / WARNING / CRITICAL).

7. **Telemetry Dashboard**
   Present all mission metrics — total route distance, NN distance, 2-Opt distance, execution times, battery drain, optimization percentage — through animated metric cards.

8. **Historical Seismic Frequency Analysis**
   Visualize the historical distribution of earthquake magnitudes using an interactive bar chart histogram, helping contextualize current events against baseline seismic activity.

### Secondary Objectives

9. Present a professional, enterprise-grade command-center interface suitable for academic, professional, and public demonstration
10. Demonstrate the practical application of computer science theory (graph theory, NP-hard optimization) in a real disaster-response context
11. Maintain a clean, modular codebase suitable for extension and academic review

---

## 4. Complete System Architecture

### High-Level Overview

SEISMICA follows a classic **client-server architecture** with a clear separation between data acquisition and optimization (backend) and visualization and interaction (frontend).

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SEISMICA SYSTEM                              │
│                                                                       │
│  ┌──────────────┐    ┌───────────────────┐    ┌──────────────────┐  │
│  │  USGS API    │───▶│  Express Backend  │───▶│  React Frontend  │  │
│  │  (External)  │    │  (Node.js :5000)  │    │  (:3000)         │  │
│  └──────────────┘    └───────────────────┘    └──────────────────┘  │
│                                                                       │
│  Data Flow:                                                           │
│  USGS GeoJSON → Parsing → Filtering → TSP Engine → JSON Response     │
│                                        ↓                              │
│                               Leaflet Map + Charts + Dashboard        │
└─────────────────────────────────────────────────────────────────────┘
```

### Backend Layer (`/backend/server.js`)

The backend is a single-file Express.js API server responsible for:

| Responsibility | Implementation |
|---|---|
| Fetching USGS data | Axios HTTP client with 15-second timeout |
| Parsing GeoJSON | Custom `parseFeatures()` function |
| Timeframe filtering | Time-window cutoff applied to raw feature timestamps |
| TSP solving | `nearestNeighbour()` + `twoOpt()` functions |
| Distance matrix | Symmetric N×N matrix using Haversine formula |
| Metrics calculation | Execution time (nanosecond precision via `process.hrtime.bigint()`) |
| Response formatting | Clean JSON with typed fields |

**API Endpoints:**

```
GET /api/route?minMag=<n>&timeframe=<24h|48h|7d|30d>
GET /api/stats?timeframe=<24h|48h|7d|30d>
GET /api/history?timeframe=<7d|30d>
GET /health
```

### Optimization Engine (TSP Service, embedded in backend)

The TSP solver is a self-contained module within `server.js`:

1. **`buildMatrix(points)`** — Constructs a symmetric N×N distance matrix using the Haversine great-circle formula. Uses `Float64Array` rows for memory efficiency.

2. **`nearestNeighbour(matrix)`** — Greedy tour construction starting from index 0. At each step, moves to the unvisited node with smallest distance. Returns a closed-loop tour array.

3. **`twoOpt(tour, matrix)`** — Local search that iteratively reverses sub-segments of the tour to eliminate crossing edges. Continues until no improving swap can be found (local optimum).

4. **`tourLength(tour, matrix)`** — Sums all edge weights in a closed-loop tour.

5. **`solveTSP(points)`** — Orchestrates the full pipeline, independently timing each algorithm phase with nanosecond precision.

### Frontend Layer (`/frontend/src/`)

The frontend is a React single-page application structured around a CSS Grid layout:

```
┌──────────────────────────────────────────────────┐
│                   HEADER (topbar)                 │
├──────────────┬──────────────────┬────────────────┤
│    LEFT      │                  │    RIGHT        │
│   PANEL      │  TACTICAL MAP    │    PANEL        │
│  (260px)     │   (flex: 1)      │  (300px)        │
├──────────────┴──────────────────┴────────────────┤
│              SEISMIC WAVEFORM (footer)            │
└──────────────────────────────────────────────────┘
```

**Component Tree:**
```
App.js (root shell)
├── Header.js
├── ControlMatrix.js (left panel)
├── TacticalMap.js (center)
│   ├── MapFit (auto-bounds)
│   ├── QuakeMarker × N
│   └── DroneMarker
└── Right Panel (stacked)
    ├── AlgorithmProgress.js
    ├── TelemetryPanel (inline, recharts)
    ├── AlgorithmComparison.js
    ├── BatterySimulation.js
    ├── MissionAnalysis.js
    ├── WaypointManifest.js
    └── AlertFeed.js
    └── Waveform.js (footer)
```

### Custom Hooks (State Management)

| Hook | Purpose |
|---|---|
| `useMission` | Dispatch state machine with 5-step animated pipeline progress |
| `useStats` | Auto-fetches global stats on mount, refreshes every 60 seconds |
| `useAlertFeed` | Generates staggered alert entries from route data |

### Data Flow — End to End

```
User clicks "DISPATCH DRONE"
       │
       ▼
useMission.dispatch(minMag, timeframe)
       │
       ▼
api.route(minMag, timeframe)  →  GET /api/route
       │
       ▼
Backend fetches USGS GeoJSON (Axios)
       │
       ▼
parseFeatures() — extracts id, mag, place, lat, lon, depth, time
       │
       ▼
Filter: magnitude ≥ minMag AND within timeframe window
Sort: descending magnitude, take top 40
       │
       ▼
solveTSP(filteredPoints)
  ├── buildMatrix()       — O(N²) distance matrix
  ├── nearestNeighbour()  — O(N²) greedy tour
  └── twoOpt()            — O(N² × iterations) local search
       │
       ▼
JSON response: { route, totalDistanceKm, nnDistanceKm,
                 optimisationEfficiency, nnExecutionMs,
                 twoOptExecutionMs, executionTimeMs }
       │
       ▼
React state update → TacticalMap renders markers + polyline
                   → AlgorithmProgress animates steps
                   → TelemetryPanel displays metrics
                   → AlertFeed populates with staggered entries
                   → BatterySimulation computes feasibility
                   → MissionAnalysis generates narrative
```

---

## 5. Technology Stack

### Backend Technologies

#### Node.js
**Role:** JavaScript runtime environment for the server.
**Why chosen:** Non-blocking I/O model is ideal for handling concurrent HTTP requests to the USGS API and serving multiple frontend clients simultaneously. Eliminates the need for a separate language between frontend and backend, reducing cognitive overhead.

#### Express.js
**Role:** Minimal web application framework; defines HTTP endpoints.
**Why chosen:** Lightweight, battle-tested, requires zero configuration for a simple REST API. Its middleware architecture allows CORS and JSON parsing to be added in two lines.

#### Axios
**Role:** HTTP client for fetching USGS GeoJSON data.
**Why chosen:** Offers timeout configuration, cleaner error handling than the native `fetch` API in Node.js, and automatic JSON parsing. The 15-second timeout prevents the server from hanging if USGS is slow to respond.

### Frontend Technologies

#### React
**Role:** Component-based UI framework.
**Why chosen:** React's component model is a natural fit for a complex dashboard with many independent, stateful elements. Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, custom hooks) enable clean separation of data-fetching, state management, and rendering logic.

#### React-Leaflet
**Role:** Interactive geographic map rendering.
**Why chosen:** Leaflet is the industry standard for lightweight, mobile-friendly interactive maps. React-Leaflet provides declarative React wrappers so markers, polylines, and tooltips can be expressed as JSX components rather than imperative Leaflet API calls.

#### Recharts
**Role:** Magnitude frequency histogram visualization.
**Why chosen:** Built on D3.js internals but with a fully declarative React API. `ResponsiveContainer` ensures the chart fills its parent without manual resize logic. Custom tooltips can be rendered as React components.

#### HTML5 Canvas API (native)
**Role:** Seismic waveform animation in the footer.
**Why chosen:** No library overhead for a custom drawing loop. `requestAnimationFrame` ensures 60fps rendering synchronized with the browser's paint cycle. Canvas outperforms SVG for per-frame animated line drawing with many points.

#### CSS Custom Properties (Design System)
**Role:** Centralized design tokens for the entire application.
**Why chosen:** CSS variables (`--accent`, `--bg-panel`, `--font-display`, etc.) defined in `:root` allow every component to share a consistent visual language without a CSS-in-JS library. Changes to one variable instantly propagate across the entire UI.

#### JetBrains Mono + Orbitron (Google Fonts)
**Role:** Typography.
**Why chosen:**
- **Orbitron** — geometric, futuristic display font used for headings, titles, and labels. Evokes a military/aerospace command-center aesthetic.
- **JetBrains Mono** — monospaced coding font with high legibility at small sizes. Ideal for data values, coordinates, timestamps, and the terminal-style alert feed.

---

## 6. How Earthquake Data Is Obtained

### The USGS Earthquake Hazards Program

The United States Geological Survey (USGS) operates the **National Earthquake Information Center (NEIC)**, which continuously monitors seismic activity worldwide using a global network of seismograph stations. USGS publishes earthquake data in real-time through a public REST API — no API key required.

### GeoJSON Format

The USGS API returns data in **GeoJSON** format — a standardized JSON structure designed for encoding geographic data. Each earthquake is a GeoJSON "Feature" with:

```json
{
  "type": "Feature",
  "id": "us7000pqrs",
  "properties": {
    "mag": 5.7,
    "place": "15 km NW of Gaziantep, Turkey",
    "time": 1717748400000,
    "depth": 12.4
  },
  "geometry": {
    "type": "Point",
    "coordinates": [37.1234, 36.9876, 12.4]
                  // [longitude, latitude, depth_km]
  }
}
```

### Feed URLs Used by SEISMICA

| Timeframe | USGS URL |
|---|---|
| 24 hours | `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson` |
| 48 hours / 7 days | `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson` |
| 30 days | `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson` |

### Properties Extracted Per Earthquake

| Field | Source | Description |
|---|---|---|
| `id` | `feature.id` | Unique USGS event identifier (e.g., `us7000abc`) |
| `magnitude` | `properties.mag` | Richter/moment magnitude scale value |
| `place` | `properties.place` | Human-readable location description |
| `time` | `properties.time` | Unix epoch timestamp in milliseconds |
| `latitude` | `geometry.coordinates[1]` | Epicentre latitude in decimal degrees |
| `longitude` | `geometry.coordinates[0]` | Epicentre longitude in decimal degrees |
| `depth` | `geometry.coordinates[2]` | Hypocentre depth in kilometres |

### Parsing and Filtering Workflow

```
Raw GeoJSON (may contain 500–10,000 features)
       │
       ▼
parseFeatures(features, sinceMs)
  ├── Reject entries with null/NaN magnitude
  ├── Reject entries with invalid coordinates
  └── Reject entries outside the timeframe window
       │
       ▼
Filter: magnitude ≥ user-selected minMag
       │
       ▼
Sort: descending magnitude (highest first)
       │
       ▼
Limit: top 40 results (computational budget for TSP)
       │
       ▼
TSP Solver Input: N clean coordinate objects
```

---

## 7. Drone Reconnaissance Concept

### Why Drones?

Traditional earthquake response begins with ground teams, but ground teams face critical limitations:
- **Road damage** — collapsed roads, bridges, and tunnels may block access entirely
- **Aftershock risk** — entering a damaged zone is dangerous before structural assessments
- **Speed** — ground vehicles travel at 30–80 km/h; reconnaissance drones travel at 80–200 km/h
- **Coverage** — a single drone can survey dozens of sites in the time a ground team reaches one

Autonomous reconnaissance drones represent the **first layer of disaster intelligence** — providing imagery, thermal scans, and area assessments within minutes of deployment, enabling human decision-makers to prioritize resources correctly.

### A Realistic Deployment Scenario

> **Scenario:** A 6.1-magnitude earthquake strikes a mountainous region. Within 24 hours, USGS records 12 additional aftershocks between magnitude 4.0 and 5.5, spread across a 400 km radius.

**Without SEISMICA:**
An emergency coordinator manually identifies the locations on a map, estimates distances, and routes the drone by intuition. The drone follows a suboptimal path, using 73% of its battery to cover the same sites that an optimized route could cover using only 48%.

**With SEISMICA:**
1. The coordinator opens the dashboard
2. Sets minimum magnitude filter to 4.0
3. Clicks "Dispatch Drone"
4. Within 2 seconds, SEISMICA presents an optimized 12-waypoint route with total distance, estimated battery consumption, ETA, and a visual flight path on the tactical map
5. The coordinator reviews the mission analysis ("MISSION FEASIBLE — Battery usage: 48%") and approves the deployment

### What the Drone Does at Each Waypoint

At each earthquake epicentre (waypoint), the drone performs:

| Task | Purpose |
|---|---|
| Aerial photography | Document structural damage to buildings, bridges, and roads |
| Thermal imaging | Locate survivors buried under rubble |
| Damage assessment | Estimate extent of destruction for resource allocation |
| Infrastructure check | Identify broken gas lines, downed power lines, blocked roads |
| Zone classification | Mark areas as safe, hazardous, or inaccessible for ground teams |
| Data relay | Transmit imagery and sensor data to the emergency coordination center in real-time |

### Why Minimizing Travel Distance Is Mission-Critical

| Parameter | Impact |
|---|---|
| Battery capacity | Every kilometer flown draws power; range exhaustion means mission abandonment mid-survey |
| Time to coverage | Minutes matter — a 40% shorter route means intelligence reaches coordinators 40% faster |
| Mission cost | Each flight hour costs fuel/electricity; optimization directly reduces operational cost |
| Fleet efficiency | A shorter route frees the drone sooner for a second mission in the same window |

Consider: at a cruise speed of 120 km/h, the difference between an 18,000 km random route and an 11,000 km optimized route is **58 minutes of flight time** — and in disaster response, 58 minutes can be the difference between life and death for trapped survivors.

---

## 8. Travelling Salesperson Problem

### What Is the Travelling Salesperson Problem?

The **Travelling Salesperson Problem (TSP)** is one of the most famous and intensively studied problems in mathematics and computer science.

**The classic formulation:**
> *A salesperson must visit N cities exactly once and return to the starting city. What is the shortest possible route?*

This deceptively simple question has occupied mathematicians, computer scientists, and operations researchers for over a century. It appears in logistics, circuit board manufacturing, DNA sequencing, telescope scheduling, and — as demonstrated by SEISMICA — disaster response drone routing.

### Why Is TSP Famous?

TSP is famous for three reasons:

1. **It is everywhere.** Almost any real-world routing problem can be formulated as a TSP variant.
2. **It is easy to understand.** Anyone can grasp the question in 10 seconds.
3. **It is brutally hard to solve optimally.** The number of possible routes for N cities is `(N-1)! / 2`. For 20 cities, that is 60,822,550,204,416,000 possible routes — far beyond exhaustive search.

### Computational Complexity

| Cities (N) | Possible routes | Time to enumerate (at 10⁹ routes/sec) |
|---|---|---|
| 5 | 12 | < 1 microsecond |
| 10 | 181,440 | < 1 millisecond |
| 15 | 43,589,145,600 | ~44 seconds |
| 20 | 60,822,550,204,416,000 | ~1,929 years |
| 40 | ≈ 10⁴⁶ | longer than the age of the universe |

SEISMICA routes up to **40 earthquake locations** — making brute-force enumeration physically impossible. This is precisely why approximation algorithms are essential.

### TSP Applied to SEISMICA

**Mapping the problem:**
- Each earthquake epicentre = one "city"
- Distance between epicentres = great-circle distance (Haversine formula)
- Goal = shortest closed-loop drone flight path visiting all N epicentres exactly once

**Example with 15 earthquake locations:**

```
Quake 1:  [35.2°N, 32.8°E]  — Cyprus region, M 4.8
Quake 2:  [38.7°N, 43.1°E]  — Turkey, M 5.1
Quake 3:  [-8.4°S, 115.2°E] — Bali, Indonesia, M 4.9
Quake 4:  [61.0°N, 150.1°W] — Alaska, M 5.3
...
Quake 15: [33.4°N, 70.8°E]  — Afghanistan, M 4.7
```

**Random route distance:** ~24,800 km (visits locations in recording order)
**Nearest Neighbour route:** ~16,200 km (greedy nearest-first construction)
**2-Opt optimized route:** ~14,600 km (locally optimal after edge-swap refinement)
**Improvement over random:** ~41%

---

### Algorithm 1: Nearest Neighbour Heuristic

The **Nearest Neighbour** algorithm is a greedy constructive heuristic. It builds a tour by always moving to the closest unvisited location.

**Step-by-step:**

```
STEP 1: Start at earthquake location #0 (arbitrary starting point)
        Current tour: [0]
        Unvisited:    [1, 2, 3, ..., N-1]

STEP 2: Find the nearest unvisited location to the current position
        distance(0 → 1) = 1,240 km
        distance(0 → 2) = 8,900 km
        distance(0 → 3) = 2,100 km
        ...
        Nearest = location 1 (1,240 km)

STEP 3: Move to location 1, mark it visited
        Current tour: [0, 1]
        Unvisited:    [2, 3, ..., N-1]

STEP 4: Repeat from STEP 2 until all locations visited
        ...

STEP 5: Return to starting location (#0) to close the loop
        Final tour: [0, 1, 4, 7, 3, 12, 8, 2, 9, 5, 11, 6, 13, 10, 14, 0]
```

**Complexity:** O(N²) — for N locations, we scan all remaining locations at each of N steps.

**Performance:** Typically produces tours 20–25% longer than optimal. Fast and deterministic.

**Visual metaphor:**
```
Before: scattered points with no structure
        •           •
           •    •
        •       •
           •

After Nearest Neighbour:
        •───────────•
        │           │
        •───•    •──•
        │       │
        •───────•
        (looping path, some inefficiencies remain)
```

---

### Algorithm 2: 2-Opt Optimization

**2-Opt** is a local search improvement algorithm. It takes the Nearest Neighbour tour and iteratively improves it by removing two edges and reconnecting them in the opposite orientation.

**Intuition — Why edges cross:**
After Nearest Neighbour construction, the tour often contains **crossing edges** — the path crosses itself on the map. Any crossing can be untangled, and the untangled path is always shorter.

```
Crossing (INEFFICIENT):          Uncrossed (EFFICIENT):

    A────────────C               A────────B
     \          /         →       |        |
      \        /                  |        |
       B──────D                  D────────C

Distance: AB + CD > AC + BD      Always true by triangle inequality
```

**Step-by-step:**

```
STEP 1: Take the current tour T = [0, 1, 4, 7, 3, 12, 8, 2, 9, ...]
        improved = true

STEP 2: While improved = true:
          improved = false
          For every pair of edges (i, j) where j > i+1:
            a = T[i-1],  b = T[i]
            c = T[j],    d = T[j+1]

            If distance(a→c) + distance(b→d) < distance(a→b) + distance(c→d):
              # Swap improves the tour — reverse the segment between i and j
              reverse T[i..j]
              improved = true  # restart scanning from the beginning

STEP 3: When no improving swap is found, the tour is 2-opt locally optimal
```

**Complexity:** O(N² × number of improving iterations). For typical inputs, this converges quickly.

**Effect on SEISMICA routes:** Typically reduces Nearest Neighbour distance by a further 5–18%, depending on geographic distribution of earthquakes.

### Why Both Algorithms Are Used Together

| Property | Nearest Neighbour alone | 2-Opt alone | NN + 2-Opt |
|---|---|---|---|
| Route quality | Moderate (greedy) | N/A (needs initial tour) | High |
| Execution time | Very fast | Depends on starting tour | Fast + moderate |
| Crossing edges | Many | Eliminated | Eliminated |
| Practicality | Good starting point | Requires a tour to improve | Best combination |

The two algorithms are **complementary**: Nearest Neighbour provides a reasonable starting structure in O(N²) time; 2-Opt refines that structure by eliminating crossings. Together they produce routes that are typically within 5–10% of the true optimum — more than sufficient for operational drone routing.

---

## 9. Route Optimization Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                  ROUTE OPTIMIZATION PIPELINE                         │
│                                                                       │
│  [1] EARTHQUAKE DATA                                                  │
│      USGS GeoJSON → all_day / all_week / all_month feed              │
│             │                                                         │
│             ▼                                                         │
│  [2] COORDINATE EXTRACTION                                            │
│      Extract: id, magnitude, place, latitude, longitude, depth, time  │
│             │                                                         │
│             ▼                                                         │
│  [3] MAGNITUDE FILTERING                                              │
│      Keep only events where magnitude ≥ minMag threshold             │
│      Apply timeframe window (24h / 48h / 7d / 30d)                  │
│             │                                                         │
│             ▼                                                         │
│  [4] RANKING & CAPPING                                                │
│      Sort by magnitude descending → take top 40                       │
│             │                                                         │
│             ▼                                                         │
│  [5] DISTANCE MATRIX CONSTRUCTION                                     │
│      Build N×N symmetric matrix using Haversine formula               │
│      d(i,j) = 2R × arcsin(√(sin²(Δlat/2) + cos(lat₁)cos(lat₂)sin²(Δlon/2)))
│             │                                                         │
│             ▼                                                         │
│  [6] NEAREST NEIGHBOUR (NN) TOUR                                      │
│      Greedy construction: always move to nearest unvisited            │
│      Result: initial closed-loop tour + NN distance                   │
│             │                                                         │
│             ▼                                                         │
│  [7] 2-OPT REFINEMENT                                                 │
│      Iterative edge-swap until no improvement possible                │
│      Result: optimized tour + 2-Opt distance                          │
│             │                                                         │
│             ▼                                                         │
│  [8] METRICS GENERATION                                               │
│      optimisationEfficiency = (nnDist - optDist) / nnDist × 100%    │
│      nnExecutionMs, twoOptExecutionMs, executionTimeMs               │
│             │                                                         │
│             ▼                                                         │
│  [9] BATTERY ESTIMATION (Frontend)                                    │
│      energyUsed = totalDistKm × whPerKm                              │
│      batteryUsedPct = energyUsed / capacityWh × 100                 │
│      feasible = distKm ≤ maxRangeKm AND batteryUsedPct < 100        │
│             │                                                         │
│             ▼                                                         │
│  [10] ROUTE VISUALIZATION                                             │
│       CircleMarkers (magnitude-colored) + dual-layer Polyline        │
│       Drone marker animates along waypoints at 900ms intervals       │
│       Route turns red if mission infeasible (battery/range exceeded) │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Mission Battery Simulation

### Overview

SEISMICA includes a configurable battery simulation module that determines whether the computed drone route is operationally feasible given the drone's physical constraints.

### Configurable Parameters

| Parameter | Default | Description |
|---|---|---|
| Battery Capacity | 100 Wh | Total energy available in the drone's battery |
| Maximum Range | 2,000 km | Maximum distance the drone can fly before requiring recharge |
| Cruise Speed | 120 km/h | Average horizontal flight speed |
| Consumption Rate | 0.05 Wh/km | Energy consumed per kilometer flown |

### Calculation Formulas

```
energyUsed     = totalDistanceKm × whPerKm
batteryUsedPct = (energyUsed / capacityWh) × 100
remainingPct   = 100 − batteryUsedPct
etaHours       = totalDistanceKm / speedKmh
etaMinutes     = etaHours × 60

feasible = (totalDistanceKm ≤ maxRangeKm) AND (batteryUsedPct < 100)
```

### Mission Outcome States

**MISSION FEASIBLE ✓**
- Route distance is within the maximum range
- Battery consumption is below 100%
- SVG arc gauge shown in green (>60% remaining), amber (30–60%), or red (<30%)

**MISSION FAILURE ✗**
- Route distance exceeds maximum range, OR
- Battery would be depleted before all waypoints are visited
- Alert card with flashing red border appears
- Polyline on the tactical map turns red to visually indicate the failure

### Design Rationale

The battery simulation adds critical operational realism. Without it, SEISMICA would simply compute the shortest route — but a drone cannot fly an infinite route. By surfacing the feasibility constraint in real-time, the system helps an operator immediately understand whether their selected magnitude threshold and timeframe produce a mission that is actually executable with their drone hardware.

---

## 11. Interactive Dashboard Components

### Header

**Purpose:** Persistent top bar providing at-a-glance global seismic intelligence and a live UTC mission clock.

**Contents:**
- **SEISMICA logo** — SVG seismic heartbeat waveform inside a pulsing coral circle, with three concentric animated rings replicating a seismograph visual identity
- **Title** — "SEISMICA" in Orbitron 900 weight with cyan glow effect
- **Live stats row** — Active Quakes (refreshed every 60 seconds), Average Magnitude, Maximum Magnitude, current Timeframe — all sourced from `/api/stats`
- **UTC clock** — Ticks every second; always shows Coordinated Universal Time regardless of the user's local timezone (critical for international emergency coordination)
- **Scanline overlay** — Subtle horizontal scanline texture for command-center aesthetic

---

### Control Matrix (Left Panel)

**Purpose:** Mission configuration and dispatch interface.

**Controls:**
- **Minimum Magnitude Slider** — Range 1.0–7.0, step 0.1. Filters which earthquakes are included in the route. Higher values = fewer, more significant events.
- **Timeframe Selector** — Four buttons: 24H / 48H / 7D / 30D. Controls which USGS feed is queried and refreshes both stats and history data.
- **Drone Parameters** — Four configurable inputs: Battery Capacity (Wh), Max Range (km), Cruise Speed (km/h), Consumption (Wh/km). These feed the battery simulation in real-time.
- **Magnitude Scale Legend** — Color-coded reference: MAJOR (≥6.0, red), STRONG (5–5.9, orange), MODERATE (4–4.9, amber), MINOR (<4.0, green)
- **DISPATCH DRONE button** — Triggers the full mission pipeline. Shows animated loading state during computation. Displays waypoint count when a route is active.

---

### Tactical Map (Center Panel)

**Purpose:** Real-time geospatial visualization of all routed earthquake sites and the computed drone flight path.

**Features:**
- **Dark cartographic tiles** — Dark Matter base map with English-language labels
- **Earthquake markers (CircleMarker)** — Size proportional to magnitude; color-coded by severity. Dual-layer rendering (outer pulse ring + inner filled circle)
- **Hover tooltips** — On-hover panels showing: Location name, Magnitude, Waypoint index, Latitude, Longitude, Depth (km), Timestamp
- **Route polyline** — Dual-layer rendering: thick transparent glow layer (weight 10, opacity 12%) + thin dashed core layer (weight 1.8, opacity 92%). Turns red when battery infeasible.
- **Drone marker** — Gold circle (⬡) animating along waypoints at 900ms intervals, with permanent "✈ WPT N" tooltip
- **Auto-fit bounds** — Map automatically zooms and pans to encompass all route waypoints after dispatch
- **Overlay badges** — Bottom-center status badge ("✈ ROUTE OPTIMISED · N WAYPOINTS" or "⚠ ROUTE EXCEEDS RANGE") and top-left data source label
- **Zoom controls** — Positioned at bottom-left, styled with dark background and cyan accent

---

### Algorithm Progress Panel

**Purpose:** Visually communicates the 5-step optimization pipeline in real-time as the dispatch is running.

**5 Pipeline Steps:**
1. 📡 Fetching Seismic Data
2. 🗺️ Generating Initial Route (NN)
3. ⚙️ Running 2-Opt Optimization
4. 📊 Calculating Mission Metrics
5. ✅ Mission Ready

**Visual feedback:** Each step transitions through states (pending → active with blinking indicator → completed with green checkmark). An overall progress bar fills from 0% to 100%. The panel slides in on dispatch and collapses after mission completion.

---

### Data Telemetry Panel (Right Panel — Top)

**Purpose:** Six animated metric cards displaying the core mission statistics post-dispatch.

**Metrics displayed:**
- **Total Distance** — 2-Opt optimized route distance in km
- **NN Distance** — Pre-optimization Nearest Neighbour distance for comparison
- **Optimisation** — Percentage distance reduction achieved by 2-Opt
- **Exec Time** — Total backend processing time (fetch + TSP solve)
- **NN Time** — Isolated Nearest Neighbour execution time in milliseconds
- **2-Opt Time** — Isolated 2-Opt execution time in milliseconds

**Magnitude Frequency Histogram** — Recharts `BarChart` showing the distribution of earthquake magnitudes across the current timeframe, color-coded by magnitude band. Sourced from `/api/history`.

---

### Algorithm Comparison Panel

**Purpose:** Side-by-side quantitative comparison of the two algorithm outputs.

**Layout:** Two columns (Nearest Neighbour | 2-Opt Optimized), each showing distance (km) and execution time (ms). Center column shows: Distance Saved, Gain %, 2-Opt computational overhead. Optimization progress bar fills proportionally to the efficiency percentage.

**Why this matters:** This panel is the academic core of SEISMICA — it makes the TSP optimization tangible and measurable. A user can see in concrete numbers exactly how much better 2-Opt performed compared to the greedy heuristic.

---

### Battery Simulation Panel

**Purpose:** Drone feasibility assessment with visual SVG arc gauge.

**Contents:**
- Circular SVG arc gauge showing battery consumption percentage (color changes green→amber→red as usage increases)
- Four status rows: STATUS (FEASIBLE / FAILURE), BATTERY USED %, REMAINING %, ETA in minutes
- Failure state triggers: flashing red alert card explaining whether the failure is range-exceeded or energy-exceeded

---

### Mission Analysis Panel

**Purpose:** Auto-generated natural-language summary of the completed mission.

**Example output:**
> "18 seismic events detected across active timeframe. 2-Opt reduced total route distance by 12.4%. Avg magnitude M4.82, peak M6.1, 2 major events (M≥6.0). Estimated battery usage: 43.2%. Algorithm resolved in 184.3 ms. Mission classified as SUCCESS."

**Quick Stats Grid:** Four compact metric tiles — Waypoints, Distance, Efficiency, Status.

---

### Alert Feed (Mission Intelligence Feed)

**Purpose:** Terminal-style scrolling log of all routed earthquake events, populated with a staggered delay after each dispatch (120ms per entry) to simulate a live intelligence feed.

**Entry format:**
```
HH:MM:SS  [CRITICAL]  M6.1  15 km NW of Gaziantep, Turkey
HH:MM:SS  [WARNING]   M5.4  Banda Sea
HH:MM:SS  [ALERT]     M4.8  Crete, Greece
```

Level color coding: CRITICAL (red, ≥6.0), WARNING (amber, 5.0–5.9), ALERT (cyan, <5.0). Maximum 80 entries retained (oldest dropped on overflow). Previous mission entries persist and new ones are prepended.

---

### Waypoint Manifest

**Purpose:** Scrollable ordered list of all waypoints in the optimized route sequence.

**Per entry:** Index number (padded), magnitude color dot, place name, magnitude value, drone position indicator (✈ gold highlight when drone is at that waypoint).

---

### Seismic Waveform Footer

**Purpose:** Ambient data visualization at the bottom of the dashboard.

**Implementation:** HTML5 Canvas with `requestAnimationFrame`. Renders a multi-frequency sine wave with random noise overlay. When a mission is active, the amplitude increases proportionally to the number of active earthquake waypoints and the line color shifts to red. Device pixel ratio scaling ensures crisp rendering on HiDPI/Retina displays.

---

## 12. Key Features

| Feature | Description |
|---|---|
| **Live USGS Integration** | Real earthquake data, refreshed on every dispatch |
| **Multi-Timeframe Support** | 24h / 48h / 7d / 30d with appropriate USGS feed selection |
| **TSP Route Optimization** | NN heuristic + 2-Opt local search, producing near-optimal routes |
| **Nanosecond Timing** | Each algorithm phase independently timed with `process.hrtime.bigint()` |
| **Battery Simulation** | Configurable drone parameters; live feasibility assessment |
| **Mission Failure States** | Polyline turns red, alert card displayed, mission classified FAILURE |
| **Animated Progress Pipeline** | 5-step visual pipeline showing algorithm execution state |
| **Algorithm Comparison** | Side-by-side NN vs 2-Opt metrics with delta bar |
| **Auto-generated Narrative** | Natural-language mission summary dynamically generated from results |
| **Live Alert Feed** | Staggered terminal-style event feed from routed earthquakes |
| **Drone Animation** | Gold marker traverses waypoints in route order at 900ms intervals |
| **Auto-bounds Map Fitting** | Map automatically zooms to fit all route waypoints after dispatch |
| **English-only Map Labels** | Dark tactical tiles with English labels worldwide |
| **Seismic Waveform Footer** | Canvas-animated waveform that responds to mission state |
| **60-second Stats Auto-refresh** | Header stats updated automatically without user action |
| **Hover Tooltips** | Detailed per-earthquake popups (magnitude, depth, timestamp, coordinates) |
| **Modular Architecture** | 11 components, 3 hooks, centralized API service, shared utility modules |
| **Responsive Design System** | CSS custom properties with 8 keyframe animations and utility classes |

---

## 13. Performance Optimizations

### Backend Optimizations

- **`Float64Array` distance matrix** — Typed arrays avoid JavaScript object overhead in the inner TSP loop. For N=40, the matrix is 40×40 = 1,600 entries; accessing typed array memory is 3–5× faster than object property lookups.

- **`process.hrtime.bigint()`** — Nanosecond-precision timing without the overhead or precision loss of `Date.now()`. Independent timing of NN and 2-Opt phases avoids any cross-contamination of measurements.

- **Axis: 15-second timeout** — Prevents the server from hanging on slow USGS responses. Returns HTTP 504 with a meaningful error message.

- **Early-exit edge cases** — Routes with 0 or 1 earthquakes return immediately without invoking the TSP solver.

- **Top-40 cap** — Limits TSP input to 40 points maximum. 2-Opt on 40 nodes runs in approximately 1–50ms. On 100 nodes it would take 10–1,000ms; on 200 nodes, minutes. The cap ensures real-time response.

### Frontend Optimizations

- **`React.memo()`** — All 9 sub-components wrapped with `memo()` to prevent re-renders when parent state changes don't affect their props (e.g., alert feed entries changing should not re-render the map).

- **`useMemo()`** — Battery feasibility (`routeFailed`) and waveform intensity are memoized — only recomputed when the relevant state changes.

- **`useCallback()`** — The `dispatch` handler and alert feed population function are wrapped in `useCallback` to maintain referential stability across renders.

- **Canvas vs SVG for Waveform** — At 60fps with 800+ data points per frame, Canvas outperforms SVG by 5–10×. Canvas is immediate-mode (draw each frame fresh) versus SVG's retained-mode (maintains a DOM tree of elements).

- **Device pixel ratio scaling** — Canvas is scaled by `window.devicePixelRatio` and then CSS-scaled back down, producing sharp lines on Retina/HiDPI displays.

- **Staggered alert population** — `useAlertFeed.populateFromRoute()` uses `setTimeout` with 120ms delays between entries. This prevents a single synchronous burst of 40 `setState` calls that would cause 40 consecutive re-renders, instead distributing them over 4.8 seconds.

- **Leaflet `useMap()` hook** — `MapFit` uses the Leaflet map instance directly via `useMap()`, calling `fitBounds()` imperatively. This is significantly cheaper than re-rendering the entire MapContainer.

---

## 14. Future Enhancements

### Algorithm Enhancements

| Enhancement | Description |
|---|---|
| **Genetic Algorithm (GA)** | Population-based global search; better escape from local optima than 2-Opt |
| **Lin-Kernighan Heuristic** | State-of-the-art TSP approximation; typically within 1–2% of optimal |
| **Or-Opt** | Move-based local search (complement to 2-Opt); faster convergence |
| **Christofides Algorithm** | Provably within 1.5× optimal for metric TSP instances |
| **Simulated Annealing** | Probabilistic acceptance of worse solutions; escapes 2-Opt local minima |

### Multi-Drone Coordination

Extend from a single-drone TSP to a **Vehicle Routing Problem (VRP)** with a fleet:
- Divide earthquake waypoints across multiple drones
- Enforce per-drone range and battery constraints
- Minimize total mission completion time (makespan)
- Visualize multiple simultaneous flight paths with distinct colors

### Real-Time Features

| Feature | Description |
|---|---|
| **WebSocket push** | Push new earthquakes from the backend as they are detected (vs polling) |
| **Live route re-optimization** | Automatically re-dispatch if a new significant earthquake is detected mid-mission |
| **Historical replay** | Replay any past seismic sequence with time-scrubbing controls |
| **Earthquake prediction overlay** | Integrate aftershock probability models from USGS ShakeAlert |

### AI & Machine Learning Integration

- **Priority scoring** — Neural network trained on historical earthquake damage data to weight waypoints by predicted impact severity, not just magnitude
- **Optimal base placement** — ML model recommends drone base deployment location to minimize average first-response time to historically active zones
- **Aftershock prediction** — Integrate ETAS (Epidemic Type Aftershock Sequence) model to predict probable aftershock locations and pre-plan routes

### Satellite Imagery Integration

- Pull post-earthquake satellite imagery from APIs (e.g., Sentinel Hub, Planet Labs) and display at each waypoint on the map
- Automatic change detection between pre- and post-earthquake imagery using computer vision

### Export & Reporting

- Export mission plan as PDF briefing document
- Export optimized route as GPX/KML file for direct upload to drone autopilot software
- REST API for third-party emergency management system integration

---

## 15. Conclusion

SEISMICA demonstrates that classical computer science theory — specifically the Travelling Salesperson Problem and its approximation algorithms — has immediate, practical, and life-saving applications in the domain of disaster response.

### What SEISMICA Achieves

**Technically:** A production-quality full-stack application that combines real geospatial data, graph-theoretic optimization, and modern web visualization into a coherent, functional platform — built entirely without third-party optimization libraries, demonstrating deep algorithmic understanding.

**Practically:** A decision-support tool that transforms raw seismic telemetry into an actionable drone mission plan in under two seconds — with battery feasibility assessment, algorithm transparency, and mission intelligence all presented in a single command-center interface.

**Academically:** A working proof-of-concept that TSP approximation algorithms (Nearest Neighbour + 2-Opt) produce meaningful real-world efficiency gains — typically 35–50% route distance reduction compared to unoptimized traversal — when applied to live geographic data.

### Key Takeaways

- **Optimization saves lives** — A 40% shorter drone reconnaissance route means faster intelligence, more missions per battery charge, and earlier resource deployment to the most critical locations
- **Data visualization matters** — Raw earthquake coordinates become actionable intelligence when presented through an intuitive, interactive geographic interface
- **Algorithm design is engineering** — The Haversine distance matrix, Nearest Neighbour heuristic, and 2-Opt local search are the engineering backbone that make SEISMICA useful, not just decorative

### Final Remark

SEISMICA is not a toy. The USGS data is real. The Haversine distances are accurate to ±0.5% of true great-circle distance. The TSP routes represent genuinely efficient drone paths. And the battery simulation reflects real operational constraints that drone operators face every day.

Every time a new earthquake cluster is detected somewhere on Earth, SEISMICA can generate an optimized response route in under two seconds. That is the power of combining real-world data with sound algorithmic design.

---

*SEISMICA — "When the earth moves, we optimize the response."*

---

**Repository:** [https://github.com/tiyamisu/SEISMICA](https://github.com/tiyamisu/SEISMICA)
**License:** MIT
**Author:** Tiyasha Sarkar
