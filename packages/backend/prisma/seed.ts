import { PrismaClient } from '@prisma/client';
import { createUserSeed } from './seeds/authentication.seed';
import { setupBacklogSeed } from './seeds/backlog.seed';
import { createCourseSeed } from './seeds/course.seed';
import { createProjectSeed } from './seeds/project.seed';

const prisma = new PrismaClient();

async function main() {
  createUserSeed(prisma);
  await createCourseSeed(prisma);
  await createProjectSeed(prisma);
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
