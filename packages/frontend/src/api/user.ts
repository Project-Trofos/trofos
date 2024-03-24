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
    removeUser: builder.mutation<User, Pick<User, 'user_id'>>({
      query: (user) => ({
        url: `user/${user.user_id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      // TODO: BINGSEN after testing this works, change this invalidation tag to specific users only,
      // refer to project.ts
      invalidatesTags: (result, error, arg) => ['User'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUsersQuery, useCreateUserMutation, useRemoveUserMutation } = extendedApi;
