const INCLUDE_USERS_ID_EMAIL = {
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

export default INCLUDE_USERS_ID_EMAIL;
