# How to Run SEISMICA

Follow these quick commands to spin up the SEISMICA Command Center locally.

## 📋 Prerequisites
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0

---

## ⚡ Setup & Run Commands

### 1. Install Dependencies

You need to install packages for both the backend and frontend.

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Set Up Environment Variables (Backend)

Ensure the default configuration file exists:

```bash
cd ../backend
cp .env.example .env
```

---

### 3. Start the Servers

To run the application, start the backend API server and frontend application server in separate terminal windows or panes:

#### 🖥️ Terminal 1: Start Backend API
```bash
cd backend
npm run dev
```
*The backend server will run on **http://localhost:5000***.

#### 🖥️ Terminal 2: Start Frontend Dashboard
```bash
cd frontend
npm start
```
*The React application will build and automatically open in your default browser at **http://localhost:3000***.

---

### 🕹️ Usage Instructions

1. Adjust the **Magnitude Slider** or **Timeframe buttons** in the Left Control Matrix.
2. Select desired **Drone Parameters**.
3. Click the **DISPATCH DRONE** button.
4. Watch the map populate with the color-synchronized seismic markers and optimized TSP reconnaissance route.
