import trofosApiSlice from '.';

export type UserLoginInfo = {
  userEmail: string,
  userPassword: string
};

export type UserInfo = {
  userEmail: string,
  userRole: number,
  userId: number
};

export type ChangePassword = {
  userId : number | undefined,
  oldUserPassword : string,
  newUserPassword: string,
}

// Auth APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation<void, UserLoginInfo>({
      query: (userLoginInfo) => ({
        url: '/account/login',
        method: 'POST',
        body : {
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
      invalidatesTags : ['UserInfo'],
    }),
    getUserInfo: builder.query<UserInfo, void>({
      query: () => ({
        url: '/account/userInfo',
        credentials: 'include',
      }),
      providesTags: ['UserInfo'],
    }),
    changePassword : builder.mutation<void, ChangePassword>({
      query: (changePassword) => ({
        url: '/account/changePassword',
        method: 'POST',
        body : {
          userId : changePassword.userId,
          oldUserPassword : changePassword.oldUserPassword,
          newUserPassword : changePassword.newUserPassword
        },
        credentials: 'include'
      })
    })
  }),
});

export const { 
  useLoginUserMutation, 
  useLogoutUserMutation,
  useGetUserInfoQuery,
  useChangePasswordMutation
} = extendedApi;