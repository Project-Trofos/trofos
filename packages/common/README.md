TROFOS common package, if different services have coupling, like redis keys/ channels

Modifying this:

1. `npm login` according to credentials in TROFOS playbook

2. `npm publish --access public`

The main application backend's prisma client is automatically generated when this package is installed in another package. It can then be accessed from the installing package's node modules as per normal

Since there is another prisma schema for the vector db, the prisma client for pgvector it is generated into a different directory and can be import with:

```javascript
import { PrismaClient } from '@trofos-nus/common/src/generated/pgvector_client';
```