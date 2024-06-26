/* eslint-disable import/prefer-default-export */
import trofosApiSlice from '.';
import { User, CreateUserRequest } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({
        url: 'user/',
        credentials: 'include',
      }),
      providesTags: ['User'],
    }),
    createUser: builder.mutation<void, CreateUserRequest>({
      query: (user) => ({
        url: 'user/',
        method: 'POST',
        body: {
          userEmail: user.userEmail,
          newPassword: user.newPassword,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUsersQuery, useCreateUserMutation } = extendedApi;
