#!/bin/bash

# generate new schema
npx dotenv -e .env.development.local -- npx prisma generate

# reset the database
yes | npx dotenv -e .env.development.local -- npx prisma migrate reset

echo "Development set up completed."
