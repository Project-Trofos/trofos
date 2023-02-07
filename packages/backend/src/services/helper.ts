import { Prisma } from '@prisma/client';

export const INCLUDE_USERS_ID_EMAIL_COURSEROLE = {
  users: {
    select: {
      user: {
        select: {
          user_id: true,
          user_email: true,
          user_display_name: true,
          courseRoles: true,
        },
      },
    },
  },
};

export const INCLUDE_USERS_MILESTONES_ANNOUNCEMENTS = {
  users: {
    select: {
      user: {
        select: {
          user_id: true,
          user_email: true,
          user_display_name: true,
          courseRoles: true,
        },
      },
    },
  },
  milestones: true,
  announcements: {
    orderBy: {
      created_at: Prisma.SortOrder.desc,
    },
  },
};
