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
│                    (Redis - Optional)                      │
└──────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, Zustand, Framer Motion, Recharts |
| **Backend API** | Node.js, Express, Mongoose, JWT, Joi, PDFKit |
| **AI Service** | Python, FastAPI, scikit-learn, NumPy, OpenCV |
| **Database** | MongoDB 7.0 |
| **Cache** | Redis 7 (Optional) |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB (running on `localhost:27017`)
- Redis (optional - not required for basic functionality)

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

**Windows (Batch):**
```cmd
run-local.bat
```

**Linux/Mac:**
```bash
chmod +x run-local.sh
./run-local.sh
```

The script will:
- Check prerequisites (Node.js, Python, MongoDB)
- Install all dependencies
- Start all three services in separate windows
- Guide you through the setup

#### Manual Setup

**Prerequisites:**
- MongoDB running on `localhost:27017`
- Redis running on `localhost:6379` (optional)

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
│   │   ├── register/        # Registration (goes straight to dashboard)
│   │   └── dashboard/       # Protected dashboard
│   │       ├── page.tsx     # Dashboard home
│   │       ├── design/     # AI Solar Design Studio
│   │       ├── financing/  # Green Financing Marketplace
│   │       ├── maintenance/# Dust Monitoring & Cleaning
│   │       ├── reports/     # PDF Reports (generate, preview, download, delete)
│   │       └── settings/   # User Settings
│   ├── store/               # Zustand stores
│   │   ├── useAuthStore.ts  # Authentication state
│   │   ├── useLocationStore.ts # Shared location state
│   │   └── useThemeStore.ts # Theme (light/dark) state
│   └── lib/                 # Utilities, Axios config
│
├── server/                  # Express.js API
│   ├── config/              # DB, Firebase config
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, validation, rate limiting
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic (ROI, notifications, cron)
│   ├── validators/          # Joi schemas
│   ├── uploads/            # Generated PDF reports
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
├── run-local.ps1           # Windows PowerShell setup script
├── run-local.sh            # Linux/Mac setup script
├── run-local.bat           # Windows batch setup script
├── LOCAL_SETUP.md          # Detailed local setup guide
└── README.md
```

---

## 🔑 Key Features

### 🤖 AI Solar Design
- **Roof Detection** — Computer vision identifies roof boundaries and obstructions
- **Panel Placement** — Bin-packing algorithm optimizes layout with inter-row shading
- **Shadow Analysis** — Hour-by-hour solar geometry simulation
- **NASA POWER API** — Real solar irradiance data for any location
- **Location Sync** — Shared location state across Design and Maintenance pages

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
- **Location Sync** — Same location used across all maintenance features

### 📊 Analytics Dashboard
- **Real-time Metrics** — Production, savings, efficiency, environmental impact
- **Interactive Charts** — Area, bar, pie charts with Recharts
- **PDF Reports** — Auto-generated monthly, quarterly, and annual performance reports
- **Report Management** — Generate, preview, download, and delete reports
- **System Health Gauge** — Panel condition monitoring

### 🔔 Notifications
- **Smart Notifications** — Contextual tips and alerts
- **Mark as Read** — Manage notification status
- **Persistent Storage** — Notifications saved per user

### 🎨 User Experience
- **Simplified Registration** — Direct to dashboard (no lengthy onboarding)
- **Dark/Light Mode** — Theme toggle in dashboard header
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Smooth Animations** — Framer Motion for polished interactions

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
| POST | `/api/auth/onboarding` | Complete onboarding (optional) |

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
| GET | `/api/maintenance/cleaning-schedule` | Cleaning schedule |
| GET | `/api/maintenance/history` | Cleaning history |
| POST | `/api/maintenance/log-cleaning` | Log cleaning event |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/generate` | Generate PDF report (monthly/quarterly/annual) |
| GET | `/api/reports/list` | List all user reports |
| GET | `/api/reports/:id/preview` | Preview PDF report |
| GET | `/api/reports/:id/download` | Download PDF report |
| DELETE | `/api/reports/:id` | Delete report and file |

### AI Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/roof-analysis` | AI roof detection |
| POST | `/ai/panel-placement` | Panel placement algorithm |
| GET | `/ai/dust/current/{lat}/{lng}` | Current dust prediction |
| GET | `/ai/dust/forecast/{lat}/{lng}` | 7-day dust forecast |
| POST | `/ai/dust/cleaning-schedule` | Optimal cleaning schedule |
| POST | `/ai/rate-prediction` | Electricity rate forecast |

---

## 🌍 Environment Variables

### Server (`server/.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartsolar
REDIS_URL=redis://localhost:6379
AI_SERVICE_URL=http://localhost:8000
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
CLIENT_URL=http://localhost:3000
```

### AI Service (`ai-service/.env`)
```env
PORT=8000
ENV=development
REDIS_URL=redis://localhost:6379/0
MODEL_DIR=./ml_models/saved
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

See `.env.example` files in `server/` and `ai-service/` directories for full configuration.

---

## 🆕 Recent Updates

### v1.1.0 (Latest)
- ✅ Simplified registration flow (direct to dashboard)
- ✅ Location synchronization across Design and Maintenance pages
- ✅ Full reports functionality (generate, preview, download, delete)
- ✅ Notification system with persistent storage
- ✅ Fixed quarterly and annual report date ranges
- ✅ Improved PDF generation (removed encoding issues)
- ✅ Enhanced UI/UX with better error handling

### v1.0.0
- Initial release with core features

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check service status
- Verify connection string in `server/.env`
- If using MongoDB Atlas, update the URI accordingly

### Redis Connection Error
- Redis is optional - the app works without it
- If you want Redis, ensure it's running on `localhost:6379`
- Or use Docker: `docker run -d -p 6379:6379 redis:7-alpine`

### Port Already in Use
- Change ports in `.env` files if 3000, 5000, or 8000 are taken
- Update `CLIENT_URL` and `NEXT_PUBLIC_API_URL` accordingly

### Python Virtual Environment Issues
- Ensure you're using Python 3.11+
- Recreate venv: `rm -rf .venv && python -m venv .venv`
- Activate before installing: `source .venv/bin/activate` (Linux/Mac) or `.venv\Scripts\activate` (Windows)

---

## 📝 Development

### Running Tests
```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test
```

### Code Style
- Frontend: ESLint with Next.js config
- Backend: ESLint with Node.js best practices
- Python: Follow PEP 8

---

## 🤝 Contributing

This project is for the SIBATHON 2026 hackathon by **Team Savvy**.

---

## 📄 License

This project is for the SIBATHON 2026 hackathon.

---

## 👥 Team

**Team Savvy** — SIBATHON 2026

---

## 🙏 Acknowledgments

- NASA POWER API for solar irradiance data
- OpenWeatherMap for weather data
- AQICN for air quality data
- All open-source libraries and frameworks used
