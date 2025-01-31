# TROFOS

TROFOS, is intended to be the academic counterpart of Jira, equipping students with a tool that mirrors Jira's capabilities to develop a grasp of agile methodologies, aligning with industry practices.

## Contributor guide

Looking to report a bug or request for a feature? Checkout our Wiki's [contributing page](https://github.com/Project-Trofos/trofos/wiki/Contributing)

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

   2. Do `pnpm run prisma-generate-dev` in `./packages/hocus_pocus_server`

### Start Production Local Instance (Production configs for testing)

At project root:

1. `pnpm run start-prod`
2. If running the local postgres container **for the first time**, populate the postgres docker volume with data using:
   1. `pnpm run seed`

### Start Production local instance with docker

1. Ensure database has been seeded and set up

2. Create a `.env.docker`:

```
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=trofos
DATABASE_URL="postgresql://admin:admin@postgres:5432/trofos?schema=public"
TELEGRAM_TOKEN=<TOKEN>

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
NODE_ENV=
EMAIL_SERVICE=
AWS_SES_FROM_EMAIL=

BACKEND_URL="http://backend:3003"

OPENAI_API_KEY=<api key>
AI_DATABASE_URL="postgresql://admin:admin@postgres:5432/pgvector?schema=public"


```

At project root:

3. `docker compose -f .\docker-compose-production.yml --env-file ./.env.docker up`
