#!/bin/bash
# SmartSolar Local Development Script (Linux/Mac)
# This script runs all services locally without Docker

echo "🚀 Starting SmartSolar Application (Local Mode)"
echo "================================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python: $PYTHON_VERSION"
else
    echo "❌ Python not found. Please install Python 3.11+"
    exit 1
fi

# Check MongoDB
echo ""
echo "🔍 Checking MongoDB..."
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is installed but not running"
        echo "   Start it with: sudo systemctl start mongod"
        echo "   Or: mongod --dbpath /path/to/data"
    fi
else
    echo "⚠️  MongoDB not found. Please install MongoDB"
    echo "   Ubuntu/Debian: sudo apt-get install mongodb"
    echo "   Mac: brew install mongodb-community"
fi

# Check Redis
echo ""
echo "🔍 Checking Redis..."
if command -v redis-server &> /dev/null; then
    if pgrep -x "redis-server" > /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is installed but not running"
        echo "   Start it with: sudo systemctl start redis"
        echo "   Or: redis-server"
    fi
else
    echo "⚠️  Redis not found. Please install Redis"
    echo "   Ubuntu/Debian: sudo apt-get install redis-server"
    echo "   Mac: brew install redis"
fi

echo ""
echo "📦 Setting up environment files..."

# Setup server .env
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo "✅ Created server/.env from .env.example"
else
    echo "✅ server/.env already exists"
fi

# Setup ai-service .env
if [ ! -f "ai-service/.env" ]; then
    cp ai-service/.env.example ai-service/.env
    echo "✅ Created ai-service/.env from .env.example"
else
    echo "✅ ai-service/.env already exists"
fi

echo ""
echo "📥 Installing dependencies..."

# Install server dependencies
echo "Installing server dependencies..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Server dependencies installed"
else
    echo "✅ Server dependencies already installed"
fi
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Client dependencies installed"
else
    echo "✅ Client dependencies already installed"
fi
cd ..

# Install AI service dependencies
echo "Installing AI service dependencies..."
cd ai-service
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "✅ Created Python virtual environment"
fi
source .venv/bin/activate
pip install -r requirements.txt
echo "✅ AI service dependencies installed"
cd ..

echo ""
echo "🚀 Starting services..."
echo ""
echo "Services will start in separate terminal windows:"
echo "  • Server:    http://localhost:5000"
echo "  • AI Service: http://localhost:8000"
echo "  • Client:    http://localhost:3000"
echo ""
echo "Press Ctrl+C in each terminal to stop the services"
echo ""

# Function to start service in new terminal
start_service() {
    local dir=$1
    local cmd=$2
    local name=$3
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell app \"Terminal\" to do script \"cd '$PWD/$dir' && $cmd\""
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        gnome-terminal -- bash -c "cd '$PWD/$dir' && $cmd; exec bash" 2>/dev/null || \
        xterm -e "cd '$PWD/$dir' && $cmd" 2>/dev/null || \
        echo "Please run manually: cd $dir && $cmd"
    fi
}

# Start Server
echo "Starting Server..."
start_service "server" "npm run dev" "Server"

# Wait a bit
sleep 2

# Start AI Service
echo "Starting AI Service..."
start_service "ai-service" "source .venv/bin/activate && uvicorn main:app --reload --port 8000" "AI Service"

# Wait a bit
sleep 2

# Start Client
echo "Starting Client..."
start_service "client" "npm run dev" "Client"

echo ""
echo "✅ All services started!"
echo ""
echo "📝 Next steps:"
echo "  1. Wait for all services to finish starting"
echo "  2. Seed the database (optional): cd server && npm run seed"
echo "  3. Open http://localhost:3000 in your browser"
echo ""
echo "Demo credentials:"
echo "  Email:    demo@smartsolar.com"
echo "  Password: demo123456"
echo ""
