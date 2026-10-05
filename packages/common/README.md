TROFOS common package, if different services have coupling, like redis keys/ channels

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

To add a migration- follow normal prisma procedures (eg create `.env` with `DATABASE_URL` then run `pnpm exec dotenv -e .env -- pnpm exec prisma migrate dev --create-only`). Once done, publish to npm, and locally do `pnpm -r update @trofos-nus/common@latest` at root. `backend`, `hocus-pocus-server` and `ai-insight-worker` should update to newest common, and after updating `prisma generate` should run automatically, generating newest models.

For executing the migrations, it is done in backend package, using the various scripts in `package.json`