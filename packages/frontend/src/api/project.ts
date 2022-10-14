import trofosApiSlice from '.';
import { Project, ProjectDataTypes } from './types';

// Project management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllProjects: builder.query<Project[], void>({
      query: () => ({
        url: 'project/',
        credentials: 'include',
      }),
      providesTags: (result, error, arg) => [
        'Project',
        ...(result ?? []).map(({ id }): { type: 'Project'; id: number } => ({
          type: 'Project',
          id,
        })),
      ],
    }),

    getProject: builder.query<ProjectDataTypes, Pick<Project, 'id'>>({
      query: ({ id }) => ({
        url: `project/${id}`,
        credentials: 'include',
      }),
      providesTags: (result, error, arg) => [{ type: 'Project', arg }],
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
  }),
  overrideExisting: false,
});

export const {
  useAddProjectMutation,
  useGetAllProjectsQuery,
  useGetProjectQuery,
  useUpdateProjectMutation,
  useRemoveProjectMutation,
} = extendedApi;
