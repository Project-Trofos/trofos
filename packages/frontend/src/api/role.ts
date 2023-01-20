/* eslint-disable import/prefer-default-export */
import trofosApiSlice from '.';
import { ActionsOnRoles, ActionOnRole, UpdateUserRole, Role } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles : builder.query<Role[], void>({
      query: () => ({
        url: '/role/',
        credentials: 'include',
      }),
    }),
    getActionsOnRoles: builder.query<ActionsOnRoles[], void>({
      query: () => ({
        url: '/role/actionsOnRoles',
        credentials: 'include',
      }),
      providesTags: ['ActionsOnRoles'],
    }),
    addActionToRole: builder.mutation<void, ActionOnRole>({
      query: (actionOnRole) => ({
        url: '/role/actionsOnRoles',
        credentials: 'include',
        method: 'POST',
        body: {
          roleId: actionOnRole.id,
          action: actionOnRole.action,
        },
      }),
      invalidatesTags: ['ActionsOnRoles'],
    }),
    removeActionFromRole: builder.mutation<void, ActionOnRole>({
      query: (actionOnRole) => ({
        url: '/role/actionsOnRoles',
        credentials: 'include',
        method: 'DELETE',
        body: {
          roleId: actionOnRole.id,
          action: actionOnRole.action,
        },
      }),
      invalidatesTags: ['ActionsOnRoles'],
    }),
    getActions: builder.query<string[], void>({
      query: () => ({
        url: '/role/actions',
        credentials: 'include',
      }),
    }),
    updateUserRole: builder.mutation<void, UpdateUserRole>({
      query: (userRole) => ({
        url: 'role/userRole',
        credentials: 'include',
        method: 'POST',
        body: {
          userEmail : userRole.userEmail,
          newRoleId : userRole.newRoleId,
        }
      }),
      invalidatesTags: ['User'], 
    })
  }),
  overrideExisting: false,
});

export const {
  useGetActionsOnRolesQuery,
  useGetRolesQuery,
  useGetActionsQuery,
  useAddActionToRoleMutation,
  useRemoveActionFromRoleMutation,
  useUpdateUserRoleMutation,
} = extendedApi;
