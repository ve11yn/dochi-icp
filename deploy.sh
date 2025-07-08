#!/bin/bash

echo "🚀 Deploying Dochi ICP App..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx not found. Please install dfx first."
    exit 1
fi

# Stop any existing dfx processes
echo "🛑 Stopping existing dfx processes..."
dfx stop

# Start fresh
echo "🆕 Starting fresh dfx replica..."
dfx start --clean --background

# Wait for dfx to be ready
echo "⏳ Waiting for dfx to be ready..."
sleep 5

# Deploy with error handling
echo "📦 Deploying canisters..."
if dfx deploy; then
    echo "✅ Deployment successful!"
else
    echo "⚠️  Deployment had issues, but trying to continue..."
    # Try to deploy frontend only if main deploy fails
    dfx deploy dochi_frontend
fi

# Show the app URL
FRONTEND_ID=$(dfx canister id dochi_frontend)
echo ""
echo "🎉 Your app is ready!"
echo "🔗 Open: http://localhost:4943/?canisterId=$FRONTEND_ID"
echo ""
echo "💡 Use Chrome or Firefox for best compatibility"
echo "🚫 Avoid Safari or privacy browsers like Mullvad"