#!/bin/bash
set -e

ENV_FILE=".env"

# 1. Check for secrets file
if [ -f "secrets.csv" ]; then
  CONFIG_FILE="secrets.csv"
  MODE="csv"
  echo "Using secrets.csv for configuration."
else
  echo "Error: Configuration file not found."
  echo "To get started, do one of the following:"
  echo "  1. cp secrets.example.csv secrets.csv"
  echo "Then edit the file with your settings and re-run this script."
  exit 1
fi

# 2. Read values from config
read_config() {
  local key="$1"
  if [ "$MODE" = "csv" ]; then
    grep "^${key}," "$CONFIG_FILE" | head -1 | cut -d',' -f2- | xargs
  else
    grep -E "^${key}=" "$CONFIG_FILE" | head -1 | cut -d'=' -f2- | xargs
  fi
}

POSTGRES_USER=$(read_config "POSTGRES_USER")
POSTGRES_PASSWORD=$(read_config "POSTGRES_PASSWORD")
POSTGRES_DB=$(read_config "POSTGRES_DB")

# Ports
FRONTEND_PORT=$(read_config "FRONTEND_PORT")
BACKEND_PORT=$(read_config "BACKEND_PORT")
API_GATEWAY_PORT=$(read_config "API_GATEWAY_PORT")
HOCUS_POCUS_PORT=$(read_config "HOCUS_POCUS_PORT")
DB_PORT=$(read_config "DB_PORT")
REDIS_PORT=$(read_config "REDIS_PORT")

# URLs
FRONTEND_BASE_URL=$(read_config "FRONTEND_BASE_URL")
BACKEND_URL=$(read_config "BACKEND_URL")
DATABASE_URL=$(read_config "DATABASE_URL")
AI_DATABASE_URL=$(read_config "AI_DATABASE_URL")
REDIS_URL=$(read_config "REDIS_URL")

ENABLE_NUS_SSO=$(read_config "ENABLE_NUS_SSO")

# 1a. Choose Login Mode
echo ""
echo "How should users log in?"
echo "  1) NUS SSO"
echo "  2) Non-NUS SSO"
read -p "Choose [1 or 2]: " LOGIN_CHOICE

if [ "$LOGIN_CHOICE" = "2" ]; then
  ENABLE_NUS_SSO="false"
  echo "Setting login mode to: Non-NUS SSO"
else
  ENABLE_NUS_SSO="true"
  echo "Setting login mode to: NUS SSO"
fi

OPENAI_API_KEY=$(read_config "OPENAI_API_KEY")
TELEGRAM_TOKEN=$(read_config "TELEGRAM_TOKEN")
EMAIL_KEY=$(read_config "EMAIL_KEY")
AWS_SES_FROM_EMAIL=$(read_config "AWS_SES_FROM_EMAIL")

# Validate required database fields
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
  echo "Error: Missing required database configuration (POSTGRES_USER, POSTGRES_PASSWORD, or POSTGRES_DB) in $CONFIG_FILE"
  exit 1
fi

# Port Defaults
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${BACKEND_PORT:-3003}
API_GATEWAY_PORT=${API_GATEWAY_PORT:-3001}
HOCUS_POCUS_PORT=${HOCUS_POCUS_PORT:-3002}
DB_PORT=${DB_PORT:-5432}
REDIS_PORT=${REDIS_PORT:-6379}

# Auto-generate URLs if not provided in CSV
FRONTEND_BASE_URL=${FRONTEND_BASE_URL:-"http://localhost:${FRONTEND_PORT}"}
BACKEND_URL=${BACKEND_URL:-"http://backend:3003"}
DATABASE_URL=${DATABASE_URL:-"postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"}
AI_DATABASE_URL=${AI_DATABASE_URL:-"postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/pgvector?schema=public"}
REDIS_URL=${REDIS_URL:-"redis://redis:6379"}

# Normalize ENABLE_NUS_SSO to true/false
if [ "$ENABLE_NUS_SSO" = "yes" ] || [ "$ENABLE_NUS_SSO" = "true" ]; then
  ENABLE_NUS_SSO="true"
else
  ENABLE_NUS_SSO="false"
fi

# 3. Generate root .env from config values
cat > "$ENV_FILE" <<EOF
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB}

FRONTEND_PORT=${FRONTEND_PORT}
BACKEND_PORT=${BACKEND_PORT}
API_GATEWAY_PORT=${API_GATEWAY_PORT}
HOCUS_POCUS_PORT=${HOCUS_POCUS_PORT}
DB_PORT=${DB_PORT}
REDIS_PORT=${REDIS_PORT}

DATABASE_URL=${DATABASE_URL}
AI_DATABASE_URL=${AI_DATABASE_URL}

FRONTEND_BASE_URL=${FRONTEND_BASE_URL}
BACKEND_URL=${BACKEND_URL}
REDIS_URL=${REDIS_URL}

ENABLE_NUS_SSO=${ENABLE_NUS_SSO}

NODE_ENV=production

TELEGRAM_TOKEN=${TELEGRAM_TOKEN}
OPENAI_API_KEY=${OPENAI_API_KEY}
EMAIL_KEY=${EMAIL_KEY}
AWS_SES_FROM_EMAIL=${AWS_SES_FROM_EMAIL}
SP_PRIVATE_KEY_BASE64=
EOF

# Copy root .env to .env.production.local and .env.docker for repo/docker compatibility
cp .env .env.production.local
cp .env .env.docker

echo "Generated root $ENV_FILE, .env.production.local, and .env.docker"

# 3a. Generate .env files for packages
echo "Generating package-specific .env files..."

create_pkg_envs() {
  local dir="$1"
  local prod_content="$2"
  local dev_content="$3"
  echo "$prod_content" > "${dir}/.env"
  echo "$prod_content" > "${dir}/.env.production.local"
  echo "$dev_content" > "${dir}/.env.development.local"
  echo "  - Created .env files in ${dir}"
}

BACKEND_PROD="POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB}
DATABASE_URL=${DATABASE_URL}
AI_DATABASE_URL=${AI_DATABASE_URL}
TELEGRAM_TOKEN=${TELEGRAM_TOKEN}
FRONTEND_BASE_URL=${FRONTEND_BASE_URL}
OPENAI_API_KEY=${OPENAI_API_KEY}
ENABLE_NUS_SSO=${ENABLE_NUS_SSO}
NODE_ENV=production"
BACKEND_DEV=$(echo "${BACKEND_PROD}" | sed "s/@postgres:5432/@localhost:${DB_PORT}/g")
create_pkg_envs "packages/backend" "${BACKEND_PROD}" "${BACKEND_DEV}"

AI_PROD="DATABASE_URL=${AI_DATABASE_URL}
OPENAI_API_KEY=${OPENAI_API_KEY}
REDIS_URL=${REDIS_URL}"
AI_DEV=$(echo "${AI_PROD}" | sed "s/@postgres:5432/@localhost:${DB_PORT}/g" | sed "s/redis:6379/localhost:${REDIS_PORT}/g")
create_pkg_envs "packages/ai_insight_worker" "${AI_PROD}" "${AI_DEV}"

HP_PROD="DATABASE_URL=${DATABASE_URL}
BACKEND_URL=${BACKEND_URL}"
HP_DEV=$(echo "${HP_PROD}" | sed "s/@postgres:5432/@localhost:${DB_PORT}/g" | sed "s/http:\/\/backend:3003/http:\/\/localhost:${BACKEND_PORT}/g")
create_pkg_envs "packages/hocus_pocus_server" "${HP_PROD}" "${HP_DEV}"

echo "All environment files generated."

# 4. Deployment choice
echo ""
echo "Setup complete! How would you like to proceed?"
echo "  1) Start Production (Docker containers for everything)"
echo "  2) Development Mode (Run code locally, only DB in Docker)"
read -p "Choose [1 or 2]: " CHOICE

cleanup_containers() {
  echo "Cleaning up any existing Trofos containers..."
  docker compose -f docker-compose-production.yml down --remove-orphans || true
  docker compose -f docker-compose-development.yml down --remove-orphans || true
}

if [ "$CHOICE" = "1" ]; then
  cleanup_containers
  echo "Starting services in Production mode..."
  docker compose -f docker-compose-production.yml --env-file .env.docker up --build -d
  
  echo "Waiting for backend to be ready (30s)..."
  sleep 30
  
  echo "Ensuring production database is seeded..."
  # If it fails, it's likely because data already exists. We ignore the error to allow startup to continue.
  docker exec trofos-backend-production pnpm run prisma-seed-dev || echo "Note: Seeding skipped (database may already be populated)."
  
  echo ""
  echo "Trofos is starting up at http://localhost:${FRONTEND_PORT}"
  
  if [ "$ENABLE_NUS_SSO" = "false" ]; then
    echo ""
    echo "----------------------------------------------------------------"
    echo "NO-SSO DEPLOYMENT FIX:"
    echo "Login with: testadmin@test.com / testPassword"
    echo "----------------------------------------------------------------"
  fi
else
  cleanup_containers
  echo "Starting Database and Redis..."
  docker compose -f docker-compose-development.yml up -d
  
  echo "Running pnpm install..."
  pnpm install
  
  echo "Generating prisma clients..."
  pnpm run generate
  
  echo "Seeding data..."
  pnpm run migrate:reset

  if [ "$ENABLE_NUS_SSO" = "false" ]; then
    echo ""
    echo "----------------------------------------------------------------"
    echo "NO-SSO DEPLOYMENT FIX:"
    echo "Login with: testadmin@test.com / testPassword"
    echo "----------------------------------------------------------------"
  fi

  echo "Starting development mode..."
  pnpm run start-dev
fi
