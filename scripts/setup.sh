#!/bin/bash
set -e

echo "Setting up Oryntal Estate CRM..."

npm install

cp -n .env.example .env 2>/dev/null || true

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your Supabase credentials"
echo "  2. Run 'npm run db:migrate' to apply database migrations"
echo "  3. Run 'npm run dev' to start all services"
echo ""
