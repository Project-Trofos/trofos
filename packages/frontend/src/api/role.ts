/* eslint-disable import/prefer-default-export */
import trofosApiSlice from '.';
import {
  ActionsOnRoles,
  ActionOnRole,
  UserCourseRoleRequest,
  Role,
  UserOnRolesOnCourse,
  UpdateUserRolePayload,
} from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<Role[], void>({
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
    getCourseUserRoles: builder.query<UserOnRolesOnCourse[], number>({
      query: (id) => ({
        url: `role/courseUserRoles/${id}`,
        credentials: 'include',
      }),
      providesTags: (result, error, id) => [{ type: 'CourseRoles', id }],
    }),
    getProjectUserRoles: builder.query<UserOnRolesOnCourse[], number>({
      query: (id) => ({
        url: `role/projectUserRoles/${id}`,
        credentials: 'include',
      }),
      providesTags: (result, error, id) => [{ type: 'ProjectRoles', id }],
    }),
    updateCourseUserRole: builder.mutation<void, UserCourseRoleRequest>({
      query: (userCourseRole) => ({
        url: `role/courseUserRoles/${userCourseRole.id}`,
        method: 'POST',
        body: {
          userEmail: userCourseRole.userEmail,
          userRole: userCourseRole.userRole,
          userId: userCourseRole.userId,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'CourseRoles', id }],
    }),
    updateProjectUserRole: builder.mutation<void, UserCourseRoleRequest>({
      query: (userCourseRole) => ({
        url: `role/projectUserRoles/${userCourseRole.id}`,
        method: 'POST',
        body: {
          userEmail: userCourseRole.userEmail,
          userRole: userCourseRole.userRole,
          userId: userCourseRole.userId,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ProjectRoles', id }],
    }),
    updateUserRole: builder.mutation<void, UpdateUserRolePayload>({
      query: (userRole) => ({
        url: 'role/userRole',
        credentials: 'include',
        method: 'POST',
        body: {
          userEmail: userRole.userEmail,
          newRoleId: userRole.newRoleId,
        },
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetActionsOnRolesQuery,
  useGetRolesQuery,
  useGetActionsQuery,
  useAddActionToRoleMutation,
  useRemoveActionFromRoleMutation,
  useGetCourseUserRolesQuery,
  useGetProjectUserRolesQuery,
  useUpdateCourseUserRoleMutation,
  useUpdateProjectUserRoleMutation,
  useUpdateUserRoleMutation,
} = extendedApi;
