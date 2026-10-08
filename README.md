# TROFOS

### GitHub webhook configuration

Set `GITHUB_WEBHOOK_SECRET` in `packages/backend/.env.development.local` for local
development, or in the environment file used by the deployment Docker Compose
command. Configure the same randomly generated secret under **Webhook secret** in
the existing GitHub App settings. Never commit the secret. The webhook URL remains
`https://<trofos-host>/api/github`; subscribe to **Pull request** events.

The receiver verifies `X-Hub-Signature-256` against the original request bytes before
parsing JSON. Unsigned/invalid signatures return 401; a missing server secret returns
503 (including locally). Requests must be uncompressed JSON and no larger than 1 MB.
Malformed supported events return 400. Signed ping and unsupported events/actions
are acknowledged without changing stories. Opening a PR marks its referenced story
in progress; merging marks it done. The response waits for the database transaction.

Deploy the backend secret and configure the matching App secret before sending
deliveries. In the App's **Advanced / Recent deliveries** view, inspect failed
responses and redeliver after correcting configuration or processing errors.
Backend logs include event type and delivery ID, not payloads or signatures.
Delivery IDs are diagnostic only: persistent deduplication, event ordering, and
installation authorisation are not implemented. Existing repository URL mappings
and project-prefix handling are unchanged; this does not verify ownership of a
project's linked repository.

TROFOS, is intended to be the academic counterpart of Jira, equipping students with a tool that mirrors Jira's capabilities to develop a grasp of agile methodologies, aligning with industry practices.

## Contributor guide

Looking to report a bug or request for a feature? Checkout our Wiki's [contributing page](https://github.com/Project-Trofos/trofos/wiki/Contributing)

## Prerequisites

1. Install pnpm with `npm install -g pnpm`

2. Get .env files from team and add them to the right places.

### Setup project locally

1. In root directory, `pnpm install`
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
