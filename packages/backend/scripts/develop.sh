#!/bin/bash

# generate new schema
npx dotenv -e .env.development.local -- npx prisma generate

# reset the database
yes | npx dotenv -e .env.development.local -- npx prisma migrate reset --skip-seed
npx dotenv -e .env.development.local -- npx prisma db push
npx dotenv -e .env.development.local -- npx prisma db seed

echo "Development set up completed."
