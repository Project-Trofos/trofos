import trofosApiSlice from '.';
import { OAuth2Payload, RegisterUser } from './types';

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
  userId: number;
  oldUserPassword: string;
  newUserPassword: string;
};

export type UpdateUserInfo = {
  userId: number;
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
    updateUserInfo: builder.mutation<void, UpdateUserInfo>({
      query: (updateUserInfo) => ({
        url: '/account/updateUser',
        method: 'POST',
        body: {
          userId: updateUserInfo.userId,
          displayName: updateUserInfo.displayName,
        },
        credentials: 'include',
        invalidatesTags: ['UserInfo'],
      }),
    }),
    oauth2Login: builder.mutation<void, OAuth2Payload>({
      query: (oauthInfo) => ({
        url: '/account/login/oauth2',
        method: 'POST',
        body: oauthInfo,
        credentials: 'include',
      }),
    }),
    register: builder.mutation<void, RegisterUser>({
      query: (user) => ({
        url: '/account/register',
        method: 'POST',
        body: user,
      }),
    }),
    generateSAMLRequest: builder.mutation<{ redirectUrl: string }, void>({
      query: () => ({
        url: '/account/generateSAMLReq/student',
        method: 'POST',
        credentials: 'include',
      }),
    }),
    generateSAMLRequestStaff: builder.mutation<{ redirectUrl: string }, void>({
      query: () => ({
        url: '/account/generateSAMLReq/staff',
        method: 'POST',
        credentials: 'include',
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetUserInfoQuery,
  useChangePasswordMutation,
  useUpdateUserInfoMutation,
  useOauth2LoginMutation,
  useRegisterMutation,
  useGenerateSAMLRequestMutation,
  useGenerateSAMLRequestStaffMutation,
} = extendedApi;
