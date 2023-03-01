import prisma from '../models/prismaClient';
import { FACULTY_ROLE_ID, STUDENT_ROLE_ID } from '../helpers/constants';

async function patchMigration() {
  await prisma.usersOnRolesOnCourses.createMany();
}

patchMigration();
