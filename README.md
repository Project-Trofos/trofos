# TROFOS

### Connect a project to the GitHub App

All signed-in **project members** can currently connect, replace, or disconnect
their project's repository. No new project administrator role is introduced yet.
GitHub authorisation is separate from TROFOS login, and the repository must be
accessible to both the authorising GitHub user and this App.

In addition to the App ID, private-key path, and webhook secret below, configure
the backend environment (local: `packages/backend/.env.development.local`):

```dotenv
GITHUB_APP_CLIENT_ID=your_app_client_id
GITHUB_APP_CLIENT_SECRET=your_app_client_secret
GITHUB_APP_SLUG=your-app-url-slug
GITHUB_APP_CALLBACK_URL=http://localhost:3000/api/github-connect/callback
FRONTEND_BASE_URL=http://localhost:3000
```

Register that exact callback URL in the GitHub App's user authorisation settings.
For deployment use the public HTTPS TROFOS origin for both URL settings. The App
webhook URL remains `/api/github`. Callback requests must reach the same browser
origin as TROFOS login so its session cookie is available. For local testing, the
webhook can still use ngrok while OAuth returns through the localhost frontend proxy.
The App needs Pull requests read access and Pull request events. Installation and
repository removal events disable saved connections; reconnect after restoring access.
No setup callback is required: installation opens in a separate tab. Leave automatic
OAuth during installation disabled; start authorisation with Connect GitHub in TROFOS.

In **Project settings → GitHub Linkage**, click **Connect GitHub**, authorise the
App, choose a repository, and save. If no repository appears, use **Install App /
grant repository access**, complete installation (or request organisation approval),
return to TROFOS, and click **Refresh**. Authorise again if the ten-minute window
expires. The UI displays the connection and provides a confirmed Disconnect action.
Disconnecting removes this project's mapping; it does not uninstall the App.

Connections store stable installation/repository IDs. Existing manual URL links
continue to work until replaced. Opening a PR with `[123]` in its title moves story
123 to In progress; merging moves it to Done. App connections only accept events
matching their installation and repository IDs.

OAuth state is single-use, session-bound and uses PKCE. Temporary user tokens stay
in backend memory, are discarded on save, and expire from the connection flow after
ten minutes. This initial implementation requires **one backend process**; restarts
require reauthorisation. Before running multiple replicas, move this temporary store
to a shared expiring store. No user tokens are saved to the database or sent to the UI.

Apply `20261019000000_github_app_connections` and regenerate Prisma clients before
running the updated backend. Production currently generates from the published
`@trofos-nus/common` package: publish the updated schema/migration and update that
dependency before deployment. The migration only adds nullable identity fields and
an `active` field defaulting to true; it preserves existing links. To roll back,
first restore the prior backend, then drop those four new columns if desired (this
discards App identity metadata but retains the repository URL).

### GitHub App API authentication

The backend also supports a standalone operator command to verify App authentication
and list repositories for its installations. This diagnostic command does not
connect installations to TROFOS projects or authorise individual TROFOS users.

Store the App RSA private key outside the repository and add these settings to
`packages/backend/.env.development.local`:

```dotenv
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY_PATH=C:/Users/your-user/.trofos-secrets/trofos-app.pem
```

Use an absolute path accessible to the backend process. Do not commit the PEM file
or credentials. The App ID and private key are separate from the webhook secret.
From the repository root, run:

```sh
pnpm --filter backend github-app:verify
```

The command lists all App installations, skips suspended ones, obtains short-lived
metadata-only installation tokens, and lists accessible repository names and IDs.
It does not modify repositories, stories, installations, or database records.
Tokens stay in memory and are never printed. Repository names may be private, so
do not share the output publicly. No active installations or an API failure causes
a nonzero exit code. HTTP 401 usually means an incorrect App ID/key or system clock;
HTTP 403 can indicate suspended access or a GitHub API limit. Missing or unreadable
key files produce a configuration error. Existing webhook processing does not
require these new settings and is unchanged.

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
Delivery IDs are diagnostic only: persistent deduplication and event ordering are
not implemented. New App connections verify user access when saved and route events
by installation/repository IDs. Legacy repository URL mappings do not verify
repository ownership. Project-prefix handling is unchanged.

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
