export const INCLUDE_USERS_ID_EMAIL_COURSEROLE = {
  users: {
    select: {
      user: {
        select: {
          user_id: true,
          user_email: true,
          courseRoles: true,
        },
      },
    },
  },
};

export const INCLUDE_USERS_ID_EMAIL_COURSEROLE_AND_MILESTONES = {
  users: {
    select: {
      user: {
        select: {
          user_id: true,
          user_email: true,
          courseRoles: true
        },
      },
    },
  },
  milestones: true,
};
