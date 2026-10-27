Common utilities and Prisma clients shared across TROFOS services. This includes
* Main Prisma client for the backend database
* Additional Prisma client for the vector DB (pgvector)
* Shared TypeScript types, constants, and helper functions

Publishing a new version (from `packages/common`):

1. `pnpm run prisma-generate` to make sure the generated Prisma clients are up to date
2. `pnpm run build` to compile to `dist/`
3. `cp dist/src/* dist/` (`tsc` emits to `dist/src/`, but `main` points at `dist/index.js`)
4. Bump the version in `package.json`. It must be higher than `npm view @trofos-nus/common version`, not just the version in git
5. `npm publish --dry-run --access public` and check the file list (`dist/index.js`, new migrations)
6. `npm login` according to credentials in TROFOS playbook
7. `npm publish --access public`

**ENSURE YOU HAVE `.env` WITH DATABASE_URL AND AI_DATABASE_URL FOR ALL PACKAGES WHICH INSTALLS THIS - NEEDED FOR POSTINSTALL**

The main application backend's prisma client is automatically generated when this package is installed in another package. It can then be accessed from the installing package's node modules as per normal

Since there is another prisma schema for the vector db, the prisma client for pgvector it is generated into a different directory and can be import with:

```javascript
import { PrismaClient } from '@trofos-nus/common/src/generated/pgvector_client';
```

### Usage

```javascript
import { PrismaClient } from '@prisma/client';
import { PrismaClient as VectorClient } from '@trofos-nus/common/src/generated/pgvector_client';
```

### Publishing a New Version

1. Run `pnpm run prisma-generate`. This ensures that all generated Prisma clients are up to date.
2. Run `pnpm run build`. This compiles the relevant files to `dist/`
3. Run `cp -r dist/src/* dist/`.
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