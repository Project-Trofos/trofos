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
}

export { createActionsOnRolesTableSeed };
