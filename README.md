# 🐣 HatchPro — Hatchery Management Dashboard

A complete, production-ready hatchery management system built with React + Vite + Tailwind CSS. All data is stored in browser localStorage — no backend, no database, no authentication required.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production

```bash
npm run build
```

Output is in the `dist/` folder.

### 4. Preview production build locally

```bash
npm run preview
```

---

## 🌐 Deploy to Netlify

### Option A — Netlify CLI (recommended)

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### Option B — Netlify Dashboard (drag & drop)

1. Run `npm run build`
2. Go to [app.netlify.com](https://app.netlify.com)
3. Drag and drop the `dist/` folder onto the Netlify dashboard
4. Done — your site is live!

### Option C — Connect GitHub repo

1. Push this project to a GitHub repository
2. Log in to [app.netlify.com](https://app.netlify.com)
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect your GitHub repo
5. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **Deploy site**

The `netlify.toml` file in this project already configures all settings automatically.

---

## 📁 Project Structure

```
hatchpro/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx        # Sticky top header with capacity badge
│   │   ├── Sidebar.jsx       # Fixed navigation sidebar
│   │   └── UI.jsx            # Reusable UI components
│   ├── context/
│   │   └── AppContext.jsx    # Global state + localStorage sync
│   ├── pages/
│   │   ├── Dashboard.jsx     # Overview cards and stats
│   │   ├── AddBatch.jsx      # Add new batch form
│   │   ├── ActiveBatches.jsx # Table of all batches
│   │   ├── Incubation.jsx    # Incubation stage management
│   │   ├── Candling.jsx      # Candling records + fertility rate
│   │   ├── Hatching.jsx      # Hatching records + hatch rate
│   │   ├── Completed.jsx     # Archive of completed batches
│   │   ├── CapacityMonitor.jsx # Crate map + forecast + feasibility
│   │   ├── ProductionBoard.jsx # Kanban drag-and-drop board
│   │   ├── Reports.jsx       # Charts and analytics
│   │   └── Settings.jsx      # Config + data export/import
│   ├── utils/
│   │   └── storage.js        # localStorage service
│   ├── App.jsx               # Router + layout
│   ├── index.css             # Global styles
│   └── main.jsx              # React entry point
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── netlify.toml
└── package.json
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dashboard** | Live stat cards, capacity utilization, recent activity |
| **Add Batch** | Form with capacity validation, bird type selection |
| **Active Batches** | Searchable/filterable table with edit & delete |
| **Incubation** | Cards with progress bar showing days elapsed |
| **Candling** | Record fertile/rejected eggs, calculates fertility % |
| **Hatching** | Record chicks hatched, calculates hatch rate % |
| **Completed** | Archived batches with search and filter |
| **Capacity Monitor** | 6×6 visual crate map + 30-day forecast chart + feasibility checker |
| **Production Board** | Drag-and-drop Kanban across 4 stages |
| **Reports** | Pie charts, bar charts, line charts, top performers |
| **Settings** | Configure capacity/incubation days + export/import/clear data |

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary | `#2E7D32` |
| Secondary | `#F9A825` |
| Background | `#F8FAF5` |
| Success | `#4CAF50` |
| Warning | `#FF9800` |
| Danger | `#D32F2F` |
| Font | DM Sans + Space Grotesk |

---

## 🧱 Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool
- **Tailwind CSS** — Utility CSS
- **React Router v6** — Client-side routing
- **Recharts** — Charts and data visualizations
- **React Toastify** — Toast notifications
- **React Icons** — Icon library
- **Day.js** — Date utilities
- **localStorage** — Persistent data storage (no backend)

---

## 💾 Data Storage

All data is stored in `localStorage` under these keys:

| Key | Contents |
|---|---|
| `hatchpro_batches` | Array of all batch objects |
| `hatchpro_settings` | Hatchery configuration |

Use **Settings → Export Backup** to download a JSON backup of all your data.
Use **Settings → Import Backup** to restore from a JSON file.

---

## 🐔 Business Logic

### Capacity Rules
- **Total Capacity** = configurable (default 36 crates)
- **Occupied** = sum of crates for Incubation + Candling + Hatching batches
- **Available** = Total − Occupied
- Completed batches **do not** occupy capacity

### Stage Flow
```
Incubation → Candling → Hatching → Completed
```

### Calculations
- **Fertility Rate** = (Fertile Eggs ÷ Total Eggs) × 100
- **Hatch Rate** = (Chicks Hatched ÷ Fertile Eggs) × 100
