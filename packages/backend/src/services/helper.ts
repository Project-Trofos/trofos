import { Prisma } from '@prisma/client';

// NOTE: Cannot be used for courses
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

// NOTE: Can only be used for courses
export const INCLUDE_USERS_MILESTONES_ANNOUNCEMENTS = {
  courseRoles: {
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
