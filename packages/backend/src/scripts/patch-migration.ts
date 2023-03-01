import prisma from '../models/prismaClient';

async function patchMigration() {
  await prisma.usersOnRolesOnCourses.createMany();
}

patchMigration();
