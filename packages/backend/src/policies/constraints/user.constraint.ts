import { AbilityBuilder } from '@casl/ability';
import { accessibleBy, createPrismaAbility } from '@casl/prisma';
import prisma from '../../models/prismaClient';
import { AppAbility } from '../policyTypes';

function userPolicyConstraint(userId: number, isUserAdmin: boolean) {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

  /*
        A user can only manage (CRUD) a user if:
        1) It is their own account
        2) They are the admin
    */
  if (isUserAdmin) {
    can('manage', 'User');
  } else {
    can('manage', 'User', {
      user_id: userId,
    });
  }

  return build();
}

async function canManageUser(userId: number, isUserAdmin: boolean): Promise<boolean> {
  if (isUserAdmin) return true;

  // Returns at most one user
  const users = await prisma.user.findMany({
    where: {
      AND: [
        accessibleBy(userPolicyConstraint(userId, isUserAdmin)).User,
        {
          user_id: userId,
        },
      ],
    },
  });

  return users.length === 1;
}

export default {
  userPolicyConstraint,
  canManageUser,
};
