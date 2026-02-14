# Local Development Setup Guide (Without Docker)

This guide will help you run SmartSolar locally without Docker.

## Prerequisites

Before running the application, ensure you have:

1. **Node.js 20+** - [Download](https://nodejs.org/)
2. **Python 3.11+** - [Download](https://www.python.org/downloads/)
3. **MongoDB** - Running on `localhost:27017`
4. **Redis** - Running on `localhost:6379`

## Quick Start

### Windows

Run the PowerShell script:
```powershell
.\run-local.ps1
```

Or use the batch file:
```cmd
run-local.bat
```

### Linux/Mac

```bash
chmod +x run-local.sh
./run-local.sh
```

## Manual Setup

If you prefer to set up manually or the script doesn't work:

### 1. Install MongoDB

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

**Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

### 2. Install Redis

**Windows:**
- Option 1: Use WSL2
  ```powershell
  wsl --install
  # Then in WSL: sudo apt-get install redis-server
  ```
- Option 2: Download from: https://github.com/microsoftarchive/redis/releases
- Option 3: Use Docker (minimal): `docker run -d -p 6379:6379 redis:7-alpine`

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Mac:**
```bash
brew install redis
brew services start redis
```

### 3. Setup Environment Variables

The script automatically creates `.env` files from `.env.example`. If you need to do it manually:

```bash
# Server
cp server/.env.example server/.env

# AI Service
cp ai-service/.env.example ai-service/.env
```

**Important:** Update the `.env` files with your actual values:
- MongoDB URI (if using Atlas or different port)
- Redis URL (if using different port)
- API keys (Google Maps, OpenWeatherMap, etc.)

### 4. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

**AI Service:**
```bash
cd ai-service
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
```

### 5. Seed Database (Optional)

```bash
cd server
npm run seed
```

This creates a demo user:
- Email: `demo@smartsolar.com`
- Password: `demo123456`

### 6. Start Services

You need to run each service in a separate terminal:

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```
Server runs on: http://localhost:5000

**Terminal 2 - AI Service:**
```bash
cd ai-service

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

uvicorn main:app --reload --port 8000
```
AI Service runs on: http://localhost:8000

**Terminal 3 - Client:**
```bash
cd client
npm run dev
```
Client runs on: http://localhost:3000

## Verify Installation

1. **MongoDB:** Check if it's running:
   ```bash
   # Windows
   Get-Service MongoDB
   
   # Linux/Mac
   sudo systemctl status mongod
   ```

2. **Redis:** Test connection:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

3. **Server:** Visit http://localhost:5000/api/health

4. **AI Service:** Visit http://localhost:8000/docs (FastAPI docs)

5. **Client:** Visit http://localhost:3000

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check service status
- Check connection string in `server/.env`: `MONGODB_URI=mongodb://localhost:27017/smartsolar`
- If using MongoDB Atlas, update the URI accordingly

### Redis Connection Error
- Ensure Redis is running
- Check Redis URL in `.env` files: `REDIS_URL=redis://localhost:6379`
- Test with: `redis-cli ping`

### Port Already in Use
- Change ports in `.env` files if 3000, 5000, or 8000 are taken
- Update `CLIENT_URL` and `NEXT_PUBLIC_API_URL` accordingly

### Python Virtual Environment Issues
- Ensure you're using Python 3.11+
- Recreate venv: `rm -rf .venv && python -m venv .venv`
- Activate before installing: `source .venv/bin/activate` (Linux/Mac) or `.venv\Scripts\activate` (Windows)

### Node Modules Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Environment Variables Reference

### Server (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `AI_SERVICE_URL` - AI service URL (default: http://localhost:8000)
- `JWT_SECRET` - JWT secret key
- `CLIENT_URL` - Frontend URL for CORS

### AI Service (.env)
- `PORT` - AI service port (default: 8000)
- `REDIS_URL` - Redis connection string
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key (optional)
- `AQICN_API_KEY` - Air Quality API key (optional)

## Next Steps

1. Open http://localhost:3000 in your browser
2. Register a new account or use demo credentials
3. Start exploring the SmartSolar platform!

## Stopping Services

Press `Ctrl+C` in each terminal window to stop the services.
