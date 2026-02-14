# SmartSolar Local Development Script (Windows PowerShell)
# This script runs all services locally without Docker

Write-Host "🚀 Starting SmartSolar Application (Local Mode)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 20+" -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host ""
Write-Host "🔍 Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoStatus = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    if ($mongoStatus -and $mongoStatus.Status -eq 'Running') {
        Write-Host "✅ MongoDB service is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB service not found or not running" -ForegroundColor Yellow
        Write-Host "   Please ensure MongoDB is installed and running on localhost:27017" -ForegroundColor Yellow
        Write-Host "   Or install MongoDB: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check MongoDB status. Please ensure it's running on localhost:27017" -ForegroundColor Yellow
}

# Check Redis
Write-Host ""
Write-Host "🔍 Checking Redis..." -ForegroundColor Yellow
try {
    $redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
    if ($redisTest.TcpTestSucceeded) {
        Write-Host "✅ Redis is running on localhost:6379" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Redis not found on localhost:6379" -ForegroundColor Yellow
        Write-Host "   Please install Redis for Windows:" -ForegroundColor Yellow
        Write-Host "   Option 1: Use WSL2: wsl --install" -ForegroundColor Yellow
        Write-Host "   Option 2: Download: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Yellow
        Write-Host "   Option 3: Use Docker: docker run -d -p 6379:6379 redis:7-alpine" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check Redis. Please ensure it's running on localhost:6379" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Setting up environment files..." -ForegroundColor Yellow

# Setup server .env
if (-not (Test-Path "server\.env")) {
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "✅ Created server/.env from .env.example" -ForegroundColor Green
} else {
    Write-Host "✅ server/.env already exists" -ForegroundColor Green
}

# Setup ai-service .env
if (-not (Test-Path "ai-service\.env")) {
    Copy-Item "ai-service\.env.example" "ai-service\.env"
    Write-Host "✅ Created ai-service/.env from .env.example" -ForegroundColor Green
} else {
    Write-Host "✅ ai-service/.env already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow

# Install server dependencies
Write-Host "Installing server dependencies..." -ForegroundColor Cyan
Set-Location server
if (-not (Test-Path "node_modules")) {
    npm install
    Write-Host "✅ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Server dependencies already installed" -ForegroundColor Green
}
Set-Location ..

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Cyan
Set-Location client
if (-not (Test-Path "node_modules")) {
    npm install
    Write-Host "✅ Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Client dependencies already installed" -ForegroundColor Green
}
Set-Location ..

# Install AI service dependencies
Write-Host "Installing AI service dependencies..." -ForegroundColor Cyan
Set-Location ai-service
if (-not (Test-Path ".venv")) {
    python -m venv .venv
    Write-Host "✅ Created Python virtual environment" -ForegroundColor Green
}
& ".\.venv\Scripts\Activate.ps1"
pip install -r requirements.txt
Write-Host "✅ AI service dependencies installed" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Services will start in separate windows:" -ForegroundColor Cyan
Write-Host "  • Server:    http://localhost:5000" -ForegroundColor White
Write-Host "  • AI Service: http://localhost:8000" -ForegroundColor White
Write-Host "  • Client:    http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the services" -ForegroundColor Yellow
Write-Host ""

# Start Server
Write-Host "Starting Server..." -ForegroundColor Cyan
$serverPath = Join-Path $PWD "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; npm run dev"

# Wait a bit
Start-Sleep -Seconds 2

# Start AI Service
Write-Host "Starting AI Service..." -ForegroundColor Cyan
$aiServicePath = Join-Path $PWD "ai-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$aiServicePath'; .\.venv\Scripts\Activate.ps1; uvicorn main:app --reload --port 8000"

# Wait a bit
Start-Sleep -Seconds 2

# Start Client
Write-Host "Starting Client..." -ForegroundColor Cyan
$clientPath = Join-Path $PWD "client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; npm run dev"

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Wait for all services to finish starting" -ForegroundColor White
Write-Host "  2. Seed the database (optional): cd server && npm run seed" -ForegroundColor White
Write-Host "  3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Demo credentials:" -ForegroundColor Cyan
Write-Host "  Email:    demo@smartsolar.com" -ForegroundColor White
Write-Host "  Password: demo123456" -ForegroundColor White
Write-Host ""
