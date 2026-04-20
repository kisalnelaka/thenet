#!/bin/bash

# TheNet - Universal Linux/macOS Setup Script
# ------------------------------------------

echo "🌐 Starting TheNet Setup..."

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js could not be found. Please install it from https://nodejs.org/"
    exit
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Check if build exists
if [ ! -d "dist" ]; then
    echo "🏗️ Building frontend..."
    npm run build
fi

# Detect Local IP
IP_ADDR=$(hostname -I | awk '{print $1}')
if [ -z "$IP_ADDR" ]; then
    IP_ADDR=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1 | awk '{print $2}')
fi

echo "✅ Setup Complete!"
echo "🚀 To start the server, run: node server.js"
echo "💻 On other devices, connect to: http://$IP_ADDR:3000"
