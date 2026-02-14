# SmartSolar — AI-Powered Solar Intelligence Platform

<p align="center">
  <strong>Plan, Finance, and Maintain Rooftop Solar Panels with AI</strong>
</p>

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Nginx Reverse Proxy                   │
│                       (Port 80)                           │
├──────────┬──────────────────┬────────────────────────────┤
│          │                  │                              │
│  Next.js Client   Express API Server   FastAPI AI Service │
│  (Port 3000)      (Port 5000)          (Port 8000)        │
│                         │                    │            │
│                    MongoDB              ML Models          │
│                    Redis                                   │
└──────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, Zustand, Framer Motion, Recharts |
| **Backend API** | Node.js, Express, Mongoose, JWT, Joi, PDFKit |
| **AI Service** | Python, FastAPI, scikit-learn, NumPy, OpenCV |
| **Database** | MongoDB 7.0 |
| **Cache** | Redis 7 |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB (or Docker)
- Redis (or Docker)

### Option 1: Docker (Recommended)

```bash
# Clone and start all services
git clone <repo-url>
cd TeamSavvySIBATHON26
docker-compose up -d

# Access
# Client:     http://localhost:3000
# API:        http://localhost:5000
# AI Service: http://localhost:8000
# MongoDB:    localhost:27017
```

### Option 2: Local Development (Without Docker)

#### Quick Start Script (Recommended)

**Windows (PowerShell):**
```powershell
.\run-local.ps1
```

**Linux/Mac:**
```bash
chmod +x run-local.sh
./run-local.sh
```

#### Manual Setup

**Prerequisites:**
- MongoDB running on `localhost:27017`
- Redis running on `localhost:6379`

**Step 1: Setup Server**
```bash
cd server
cp .env.example .env
npm install
npm run seed    # Seed demo data (optional)
npm run dev     # Starts on :5000
```

**Step 2: Setup AI Service** (in a new terminal)
```bash
cd ai-service
cp .env.example .env
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Step 3: Setup Client** (in a new terminal)
```bash
cd client
npm install
npm run dev     # Starts on :3000
```

### Demo Credentials
```
Email:    demo@smartsolar.com
Password: demo123456
```

---

## 📁 Project Structure

```
TeamSavvySIBATHON26/
├── client/                  # Next.js 14 Frontend
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── login/           # Auth pages
│   │   ├── register/
│   │   └── dashboard/       # Protected dashboard
│   │       ├── page.tsx     # Dashboard home
│   │       ├── design/      # AI Solar Design Studio
│   │       ├── financing/   # Green Financing Marketplace
│   │       ├── maintenance/ # Dust Monitoring
│   │       ├── reports/     # PDF Reports
│   │       └── settings/    # User Settings
│   ├── store/               # Zustand stores
│   └── lib/                 # Utilities, Axios config
│
├── server/                  # Express.js API
│   ├── config/              # DB, Firebase config
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth, validation, rate limiting
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic (ROI, notifications, cron)
│   ├── validators/          # Joi schemas
│   └── utils/               # Error classes, logger, helpers
│
├── ai-service/              # FastAPI AI Microservice
│   ├── routers/             # API endpoints
│   │   ├── roof_analysis    # Roof detection & shadow analysis
│   │   ├── panel_placement  # Optimal panel placement algorithm
│   │   ├── dust_monitoring  # ML-powered dust prediction
│   │   └── rate_prediction  # Electricity rate forecasting
│   ├── services/            # ML model loading & training
│   ├── schemas/             # Pydantic models
│   └── ml_models/           # Trained models (auto-generated)
│
├── nginx/                   # Reverse proxy config
├── docker-compose.yml       # Full stack orchestration
└── README.md
```

---

## 🔑 Key Features

### 🤖 AI Solar Design
- **Roof Detection** — Computer vision identifies roof boundaries and obstructions
- **Panel Placement** — Bin-packing algorithm optimizes layout with inter-row shading
- **Shadow Analysis** — Hour-by-hour solar geometry simulation
- **NASA POWER API** — Real solar irradiance data for any location

### 💰 Green Financing
- **15+ Loan Options** — SBI, HDFC, ICICI, Tata Capital, IREDA, and more
- **ROI Simulator** — NPV, IRR, break-even with 25-year cash flow analysis
- **Subsidy Finder** — PM Surya Ghar Yojana eligibility and calculations
- **EMI Calculator** — Compare monthly payments across providers

### 🧹 Smart Maintenance
- **Dust Prediction** — Gradient Boosting model using weather, AQI, and PM data
- **7-Day Forecast** — Predict efficiency loss for the coming week
- **Cost-Benefit Analysis** — AI determines optimal cleaning schedule vs cost
- **Automated Alerts** — Email notifications when cleaning is needed

### 📊 Analytics Dashboard
- **Real-time Metrics** — Production, savings, efficiency, environmental impact
- **Interactive Charts** — Area, bar, pie charts with Recharts
- **PDF Reports** — Auto-generated monthly performance reports via PDFKit
- **System Health Gauge** — Panel condition monitoring

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Dashboard metrics |
| GET | `/api/dashboard/energy` | Energy production data |
| GET | `/api/dashboard/savings` | Financial savings |
| GET | `/api/dashboard/environment` | Environmental impact |

### Design (AI-powered)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/design/analyze-roof` | AI roof analysis |
| POST | `/api/design/panel-placement` | Optimal panel layout |

### Financing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/financing/options` | List financing options |
| POST | `/api/financing/compare` | Compare loans |
| POST | `/api/financing/simulate-roi` | ROI simulation |
| GET | `/api/financing/subsidies` | Subsidy information |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/maintenance/dust-status` | Current dust level |
| GET | `/api/maintenance/schedule` | Cleaning schedule |
| POST | `/api/maintenance/log-cleaning` | Log cleaning event |

### AI Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/roof-analysis` | AI roof detection |
| POST | `/ai/panel-placement` | Panel placement algorithm |
| GET | `/ai/dust/current/{lat}/{lng}` | Current dust prediction |
| GET | `/ai/dust/forecast/{lat}/{lng}` | 7-day dust forecast |
| POST | `/ai/rate-prediction` | Electricity rate forecast |

---

## 🌍 Environment Variables

See `.env.example` files in `server/` and `ai-service/` directories.

---

## 👥 Team

**Team Savvy** — SIBATHON 2026

---

## 📄 License

This project is for the SIBATHON 2026 hackathon.
