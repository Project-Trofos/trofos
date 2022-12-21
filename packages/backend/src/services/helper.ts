export const INCLUDE_USERS_ID_EMAIL = {
  users: {
    select: {
      user: {
        select: {
          user_id: true,
          user_email: true,
        },
      },
    },
  },
};

export const INCLUDE_USERS_ID_EMAIL_AND_MILESTONES = {
  users: {
    select: {
      user: {
        select: {
          user_id: true,
          user_email: true,
        },
      },
    },
  },
  milestones: true,
};
