#!/bin/bash

# Script to send the Dec 30 Feature Update Email
echo "🚀 Preparing to send Feature Update Email to mail2shaid@gmail.com..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. Please make sure you are in the project root."
    exit 1
fi

echo "Detailed Steps:"
echo "1. Serving Supabase Function 'send-dec30-update'..."
# Serve the function in the background
supabase functions serve send-dec30-update --no-verify-jwt --env-file .env > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for the server to start
echo "   Waiting for function server to initialize (5 seconds)..."
sleep 5

echo "2. Sending Email via curl..."
# Send the POST request
RESPONSE=$(curl -s -i --location --request POST 'http://localhost:54321/functions/v1/send-dec30-update' \
--header 'Content-Type: application/json' \
--data '{"to": ["mail2shaid@gmail.com"]}')

echo "   Response received."

# Clean up: Kill the background process
echo "3. Cleaning up..."
kill $SERVER_PID

echo ""
echo "✅ Done! Check the output above or your inbox."
echo "---------------------------------------------------"
echo "$RESPONSE"
echo "---------------------------------------------------"
