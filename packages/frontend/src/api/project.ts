import trofosApiSlice from '.';

export type Project = {
  id: number;
  pname: string;
  pkey: string | null,
  description: string | null;
  course_id: string | null,
  public: boolean,
  created_at: string,
};

// Project management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllProjects: builder.query<Project[], void>({
      query: () => ({
        url : 'project/',
        credentials: 'include',
      }),
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
        credentials: 'include',
      }),
      invalidatesTags: ['Project'],
    }),
    removeProject: builder.mutation<Project, Pick<Project, 'id'>>({
      query: (project) => ({
        url: `project/${project.id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Project', 'Course'],
    }),

  }),
  overrideExisting: false,
});

export const { useAddProjectMutation, useGetAllProjectsQuery, useRemoveProjectMutation } = extendedApi;