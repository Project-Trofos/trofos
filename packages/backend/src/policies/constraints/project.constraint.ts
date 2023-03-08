import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility, accessibleBy } from '@casl/prisma';
import { STUDENT_ROLE_ID } from '../../helpers/constants';
import prisma from '../../models/prismaClient';
import { AppAbility } from '../policyTypes';

function projectPolicyConstraint(userId: number, isUserAdmin: boolean) {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

  /*
        A user can only manage (CRUD) a project if:
        1) They are part of that project
        2) They have access to the course the project is part of
        3) They are the admin
    */

  if (isUserAdmin) {
    can('manage', 'Project');
  } else {
    // Handles the case where we are checking a list of projects
    can('manage', 'Project', {
      users: {
        some: {
          user_id: userId,
        },
      },
    });

    can('manage', 'Project', {
      course: {
        courseRoles : {
          some : {
            user_id : userId, // User must be part of the course and not be a student
            role_id : {
              not : STUDENT_ROLE_ID
            }
          }
        }
      },
    });
  }

  return build();
}

async function canManageProject(userId: number, projectId: number, isUserAdmin: boolean): Promise<boolean> {
  if (isUserAdmin) return true;

  // Returns at most one project
  const projects = await prisma.project.findMany({
    where: {
      AND: [
        accessibleBy(projectPolicyConstraint(userId, isUserAdmin)).Project,
        {
          id: projectId,
        },
      ],
    },
  });

  return projects.length === 1;
}

export default {
  projectPolicyConstraint,
  canManageProject,
};
