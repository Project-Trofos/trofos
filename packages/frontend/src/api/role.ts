/* eslint-disable import/prefer-default-export */
import trofosApiSlice from '.';
import { ActionsOnRoles, ActionOnRole } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
  overrideExisting: false,
});

export const {
  useGetActionsOnRolesQuery,
  useGetActionsQuery,
  useAddActionToRoleMutation,
  useRemoveActionFromRoleMutation,
} = extendedApi;
