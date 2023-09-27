## Prerequisites

1. Install pnpm with `npm install -g pnpm`

2. Get .env files from team and add them to the right places.

### Setup project locally

1. `pnpm install`
2. `pnpm run generate`

### Start Development Local Instance (Hot-reload)

At project root:

1. `pnpm run start-dev`
2. If running the local postgres container **for the first time**, populate the postgres docker volume with data using:
   1. `pnpm run migrate:reset`

### Start Production Local Instance (Production configs for testing)

At project root:

1. `pnpm run start-prod`
2. If running the local postgres container **for the first time**, populate the postgres docker volume with data using:
   1. `pnpm run seed`
