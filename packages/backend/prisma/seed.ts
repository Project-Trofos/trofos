import { PrismaClient } from '@prisma/client';
import { createBacklogTableSeed } from './backlog.seed';
import { createBacklogStatusTableSeed } from './backlogStatus.seed';
import { createProjectTableSeed } from './projects.seed';
import { createSprintTableSeed } from './sprint.seed';
import { createUserTableSeed } from './user.seed';
import { createUsersOnProjectsTableSeed } from './usersOnProjects.seed';
import { createUsersOnRolesTableSeed } from './usersOnRoles.seed';
import { createBacklogHistoryTableSeed } from './backlogHistory.seed';
import { createRoleTableSeed } from './role.seed';
import { createActionsOnRolesTableSeed } from './actionsOnRoles.seed';
import { createCourseTableSeed } from './course.seed';
import { createMilestoneTableSeed } from './milestone.seed';
import { createSettingsTableSeed } from './setting.seed';
import { createUsersOnRolesOnCoursesTableSeed } from './usersOnRolesOnCourses.seed';

const prisma = new PrismaClient();

async function main() {
  await createUserTableSeed(prisma);
  await createRoleTableSeed(prisma);
  await createActionsOnRolesTableSeed(prisma);
  await createUsersOnRolesTableSeed(prisma);
  await createSettingsTableSeed(prisma);
  await createCourseTableSeed(prisma);
  await createMilestoneTableSeed(prisma);
  await createProjectTableSeed(prisma);
  await createUsersOnProjectsTableSeed(prisma);
  await createSprintTableSeed(prisma);
  await createBacklogStatusTableSeed(prisma);
  await createBacklogTableSeed(prisma);
  await createBacklogHistoryTableSeed(prisma);
  await createUsersOnRolesOnCoursesTableSeed(prisma);
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
