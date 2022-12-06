import { PrismaClient } from '@prisma/client';
import { createUserSeed } from './seeds/authentication.seed';
import { setupBacklogSeed } from './seeds/backlog.seed';
import { createCourseSeed } from './seeds/course.seed';
import { createProjectSeed } from './seeds/project.seed';
import { createRoleSeed } from './seeds/roles.seed';
import { createSettingsSeed } from './seeds/settings.seed';

const prisma = new PrismaClient();

async function main() {
  await createSettingsSeed(prisma);
  await createUserSeed(prisma);
  await createRoleSeed(prisma);
  await createCourseSeed(prisma);
  await createProjectSeed(prisma);
  await setupBacklogSeed(prisma);
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
