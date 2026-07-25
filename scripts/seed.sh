#!/bin/bash
set -e

echo "Seeding database..."
npm run db:seed
echo "Seed complete!"
