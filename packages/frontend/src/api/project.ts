import trofosApiSlice from '.';
import {
  BacklogStatusData,
  Project,
  ProjectData,
  ProjectGitLink,
  ProjectGitLinkData,
  ProjectUserSettings,
} from './types';

// Project management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllProjects: builder.query<ProjectData[], void>({
      query: () => ({
        url: 'project/',
        credentials: 'include',
      }),
      providesTags: (result, error, arg) =>
        result ? [...result.map(({ id }) => ({ type: 'Project' as const, id })), 'Project'] : ['Project'],
    }),

    getProject: builder.query<ProjectData, Pick<Project, 'id'>>({
      query: ({ id }) => ({
        url: `project/${id}`,
        credentials: 'include',
      }),
      providesTags: (result, error, arg) => [{ type: 'Project', id: arg.id }],
    }),

    // Adding a project will invalidate all projects
    addProject: builder.mutation<Project, Partial<Project> & Pick<Project, 'pname'>>({
      query: (project) => ({
        url: 'project/',
        method: 'POST',
        body: {
          projectName: project.pname,
          projectKey: project.pkey,
          isPublic: project.public,
          description: project.description,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Project'],
    }),

    // Updating a project will invalidate that project
    updateProject: builder.mutation<
      Project,
      Partial<Pick<Project, 'description' | 'pname' | 'public'>> & Pick<Project, 'id'>
    >({
      query: (project) => ({
        url: `project/${project.id}`,
        method: 'PUT',
        body: {
          projectName: project.pname,
          isPublic: project.public,
          description: project.description,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Project', id: arg.id }, 'Course'],
    }),

    // Removing a project will invalidate that project
    removeProject: builder.mutation<Project, Pick<Project, 'id'>>({
      query: (project) => ({
        url: `project/${project.id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Project', id: arg.id }, 'Course'],
    }),

    // Adding a user in a project will invalidate that project
    addProjectUser: builder.mutation<Project, Pick<Project, 'id'> & { userId: number }>({
      query: (param) => ({
        url: `project/${param.id}/user`,
        method: 'POST',
        body: {
          userId: param.userId,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Project', id: arg.id }, 'Course', { type: 'ProjectRoles', id : arg.id}],
    }),

    // Removing a user in a project will invalidate that project
    removeProjectUser: builder.mutation<Project, Pick<Project, 'id'> & { userId: number }>({
      query: (param) => ({
        url: `project/${param.id}/user`,
        method: 'DELETE',
        body: {
          userId: param.userId,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Project', id: arg.id }, 'Course'],
    }),

    // Backlog status APIs
    getBacklogStatus: builder.query<BacklogStatusData[], Pick<Project, 'id'>>({
      query: ({ id }) => ({
        url: `project/${id}/backlogStatus`,
        credentials: 'include',
      }),
      providesTags: (result, error, arg) => [{ type: 'Project', id: arg.id }],
    }),

    createBacklogStatus: builder.mutation<BacklogStatusData, { projectId: number; name: string }>({
      query: (param) => ({
        url: `project/${param.projectId}/backlogStatus`,
        method: 'POST',
        body: {
          name: param.name,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Project', id: arg.projectId }],
    }),

    updateBacklogStatus: builder.mutation<
      BacklogStatusData,
      { projectId: number; currentName: string; updatedName: string }
    >({
      query: (param) => ({
        url: `project/${param.projectId}/backlogStatus`,
        method: 'PUT',
        body: {
          currentName: param.currentName,
          updatedName: param.updatedName,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Project', id: arg.projectId }],
    }),

    updateBacklogStatusOrder: builder.mutation<
      BacklogStatusData[],
      { projectId: number; updatedStatuses: Omit<BacklogStatusData, 'project_id'>[] }
    >({
      query: (param) => ({
        url: `project/${param.projectId}/backlogStatus`,
        method: 'PUT',
        body: {
          updatedStatuses: param.updatedStatuses,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Project', id: arg.projectId }],
    }),

    deleteBacklogStatus: builder.mutation<BacklogStatusData, { projectId: number; name: string }>({
      query: (param) => ({
        url: `project/${param.projectId}/backlogStatus`,
        method: 'DELETE',
        body: {
          name: param.name,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Project', id: arg.projectId }],
    }),

    // Project Git link API
    getGitUrl: builder.query<ProjectGitLink, Pick<Project, 'id'>>({
      query: ({ id }) => ({
        url: `project/${id}/gitLink`,
        credentials: 'include',
      }),
      providesTags: (result, error, arg) => [{ type: 'Project', id: arg.id }],
    }),

    addGitUrl: builder.mutation<ProjectGitLink, ProjectGitLinkData>({
      query: (param) => ({
        url: `project/${param.projectId}/gitLink`,
        method: 'POST',
        body: {
          repoLink: param.repoLink,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Project', id: arg.projectId }],
    }),

    updateGitUrl: builder.mutation<ProjectGitLink, ProjectGitLinkData>({
      query: (param) => ({
        url: `project/${param.projectId}/gitLink`,
        method: 'PUT',
        body: {
          repoLink: param.repoLink,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Project', id: arg.projectId }],
    }),

    deleteGitUrl: builder.mutation<ProjectGitLink, Pick<Project, 'id'>>({
      query: ({ id }) => ({
        url: `project/${id}/gitLink`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Project', id: arg.id }],
    }),

    getUserSettings: builder.query<ProjectUserSettings, Pick<Project, 'id'>>({
      query: ({ id }) => ({
        url: `project/${id}/user/settings`,
        credentials: 'include',
      }),
      providesTags: (result, error, arg) => [{ type: 'ProjectUserSettings', id: arg.id }],
    }),

    updateUserSettings: builder.mutation<
      ProjectUserSettings,
      { projectId: number; updatedSettings: Partial<ProjectUserSettings> }
    >({
      query: ({ projectId, updatedSettings }) => ({
        url: `project/${projectId}/user/settings`,
        method: 'PUT',
        body: {
          updatedSettings,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'ProjectUserSettings', id: arg.projectId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddProjectMutation,
  useGetAllProjectsQuery,
  useGetProjectQuery,
  useUpdateProjectMutation,
  useRemoveProjectMutation,
  useAddProjectUserMutation,
  useRemoveProjectUserMutation,
  useGetBacklogStatusQuery,
  useCreateBacklogStatusMutation,
  useUpdateBacklogStatusMutation,
  useUpdateBacklogStatusOrderMutation,
  useDeleteBacklogStatusMutation,
  useGetGitUrlQuery,
  useAddGitUrlMutation,
  useUpdateGitUrlMutation,
  useDeleteGitUrlMutation,
  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation,
} = extendedApi;
