import { PrismaClient } from '@prisma/client';
import { createUserSeed } from './seeds/authentication.seed';
import { setupBacklogSeed } from './seeds/backlog.seed';
const prisma = new PrismaClient();

async function main() {
  createUserSeed(prisma);
  setupBacklogSeed(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
