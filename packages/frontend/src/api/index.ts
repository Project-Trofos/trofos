import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Project } from './project/index';

// Define a service using a base URL and expected endpoints
export const trofosApiSlice = createApi({
  reducerPath: 'trofosApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001' }),
  tagTypes: ['Project'],
  endpoints: (builder) => ({

    // Project management APIs
    getAllProjects: builder.query<Project[], void>({
      query: () => 'project/',
      providesTags: ['Project'],
    }),
    addProject: builder.mutation<Project, Partial<Project> & Pick<Project, 'pname'>>({
      query: (project) => ({
        url: 'project/',
        method: 'POST',
        body: {
          name: project.pname,
          key: project.pkey,
          isPublic: project.public,
          description: project.description,
        },
      }),
      invalidatesTags: ['Project'],
    }),
    removeProject: builder.mutation<Project, Pick<Project, 'id'>>({
      query: (project) => ({
        url: `project/${project.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetAllProjectsQuery, useAddProjectMutation, useRemoveProjectMutation } = trofosApiSlice;