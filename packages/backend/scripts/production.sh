#!/bin/bash

# generate new schema
npx dotenv -e .env.production.local -- npx prisma generate

# apply migrations to db
yes | npx dotenv -e .env.production.local -- npx prisma migrate deploy

echo "Production set up completed."