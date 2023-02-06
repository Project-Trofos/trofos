import trofosApiSlice from '.';

export enum UserRole {
  FACULTY = 1,
  STUDENT = 2,
}

export type UserLoginInfo = {
  userEmail: string;
  userPassword: string;
};

export type UserInfo = {
  userEmail: string;
  userDisplayName: string;
  userRoleActions: string[];
  userId: number;
};

export type ChangePassword = {
  userId: number | undefined;
  oldUserPassword: string;
  newUserPassword: string;
};

export type ChangeDisplayName = {
  userId: number | undefined;
  displayName: string;
};

// Auth APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation<void, UserLoginInfo>({
      query: (userLoginInfo) => ({
        url: '/account/login',
        method: 'POST',
        body: {
          userEmail: userLoginInfo.userEmail,
          userPassword: userLoginInfo.userPassword,
        },
        credentials: 'include',
      }),
    }),
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: '/account/logout',
        method: 'POST',
        credentials: 'include',
      }),
      invalidatesTags: ['UserInfo'],
    }),
    getUserInfo: builder.query<UserInfo, void>({
      query: () => ({
        url: '/account/userInfo',
        credentials: 'include',
      }),
      providesTags: ['UserInfo'],
    }),
    changePassword: builder.mutation<void, ChangePassword>({
      query: (changePassword) => ({
        url: '/account/changePassword',
        method: 'POST',
        body: {
          userId: changePassword.userId,
          oldUserPassword: changePassword.oldUserPassword,
          newUserPassword: changePassword.newUserPassword,
        },
        credentials: 'include',
      }),
    }),
    changeDisplayName: builder.mutation<void, ChangeDisplayName>({
      query: (changeDisplayName) => ({
        url: '/account/changeDisplayName',
        method: 'POST',
        body: {
          userId: changeDisplayName.userId,
          displayName: changeDisplayName.displayName,
        },
        credentials: 'include',
        invalidatesTags: ['UserInfo'],
      }),
    }),

  }),
});

export const { useLoginUserMutation, useLogoutUserMutation, useGetUserInfoQuery, useChangePasswordMutation, useChangeDisplayNameMutation } =
  extendedApi;
