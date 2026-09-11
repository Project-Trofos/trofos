Common utilities and Prisma clients shared across TROFOS services. This includes
* Main Prisma client for the backend database
* Additional Prisma client for the vector DB (pgvector)
* Shared TypeScript types, constants, and helper functions

### Installation

Ensure `.env` with DATABASE_URL and AI_DATABASE_URL for all packages which installs this. This is needed for postinstall.

```bash
pnpm add @trofos-nus/common@latest
```

### Usage

```javascript
import { PrismaClient } from '@prisma/client';
import { PrismaClient as VectorClient } from '@trofos-nus/common/src/generated/pgvector_client';
```

### Publishing a New Version

1. Run `pnpm run prisma-generate`. This ensures that all generated Prisma clients are up to date.
2. Run `pnpm run build`. This compiles the relevant files to `dist/`
3. Run `cp dist/src/* dist/`.
4. Bump the package version in `package.json`.
5. Run `npm publish --dry-run` to simulate a publish and verify that the relevant files are included in the bundle.
6. Run `npm login` using the credentials in TROFOS playbook.
7. Run `npm publish --access public`.

Install the latest version using
```bash
pnpm add @trofos-nus/common@latest
```

### Updating Dependent Services

```bash
pnpm -r update @trofos-nus/common@latest
```

Note that this `prisma generate` should run automatically upon postinstall, generating the newest models.

### Adding Migrations

1. Follow normal Prisma procedures, e.g. create `.env` with the database URLs specified above.
2. Run the migration.
```bash
pnpm exec dotenv -e .env -- pnpm exec prisma migrate dev --create-only
```
3. Publish the new version and update dependent services.