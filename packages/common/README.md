TROFOS common package, if different services have coupling, like redis keys/ channels

Modifying this:

1. `npm login` according to credentials in TROFOS playbook

2. `npm publish --access public`

**ENSURE YOU HAVE `.env` WITH DATABASE_URL AND AI_DATABASE_URL FOR ALL PACKAGES WHICH INSTALLS THIS - NEEDED FOR POSTINSTALL**

The main application backend's prisma client is automatically generated when this package is installed in another package. It can then be accessed from the installing package's node modules as per normal

Since there is another prisma schema for the vector db, the prisma client for pgvector it is generated into a different directory and can be import with:

```javascript
import { PrismaClient } from '@trofos-nus/common/src/generated/pgvector_client';
```

To add a migration- follow normal prisma procedures (eg create `.env` with `DATABASE_URL` then run `pnpm exec dotenv -e .env -- pnpm exec prisma migrate dev --create-only`). Once done, publish to npm, and locally do `pnpm -r update @trofos-nus/common@latest` at root. `backend`, `hocus-pocus-server` and `ai-insight-worker` should update to newest common, and after updating `prisma generate` should run automatically, generating newest models.

For executing the migrations, it is done in backend package, using the various scripts in `package.json`