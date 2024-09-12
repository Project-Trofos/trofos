/* eslint-disable import/prefer-default-export */
import { Action, PrismaClient } from '@prisma/client';
import { ADMIN_ROLE_ID, FACULTY_ROLE_ID, STUDENT_ROLE_ID } from './constants';

async function createActionsOnRolesTableSeed(prisma: PrismaClient) {
  const actionsOnRoles = await prisma.actionsOnRoles.createMany({
    data: [
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.create_course,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.read_course,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.update_course,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.delete_course,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.create_project,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.read_project,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.update_project,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.delete_project,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.create_feedback,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.read_feedback,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.update_feedback,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.delete_feedback,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.read_users,
      },
      {
        role_id: STUDENT_ROLE_ID,
        action: Action.read_course,
      },
      {
        role_id: STUDENT_ROLE_ID,
        action: Action.create_project,
      },
      {
        role_id: STUDENT_ROLE_ID,
        action: Action.read_project,
      },
      {
        role_id: STUDENT_ROLE_ID,
        action: Action.update_project,
      },
      {
        role_id: STUDENT_ROLE_ID,
        action: Action.delete_project,
      },
      {
        role_id: STUDENT_ROLE_ID,
        action: Action.read_feedback,
      },
      {
        role_id: ADMIN_ROLE_ID,
        action: Action.admin,
      },
    ],
  });

  console.log('created actionsOnRoles table seed %s', actionsOnRoles);

  // This is inserted in a migration (to cater for insert to prod db)
  // Putting this here for understandability
  // Also when seed is run on fresh db, this can ignore the conflict made
  // in the migration.sql previously, so it is not included above
  const updateProjectUserRow = await prisma.$executeRaw`
    INSERT INTO "ActionsOnRoles" (role_id, action)
    VALUES
      (${FACULTY_ROLE_ID}, ${Action.update_project_users}::"Action"),
      (${FACULTY_ROLE_ID}, ${Action.create_api_key}::"Action"),
      (${FACULTY_ROLE_ID}, ${Action.read_api_key}::"Action")
    ON CONFLICT (role_id, action) DO NOTHING;`
  console.log('created update project users action %s', updateProjectUserRow);
}

export { createActionsOnRolesTableSeed };
