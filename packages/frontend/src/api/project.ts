import { useMemo } from 'react';
import trofosApiSlice from '.';
import { isCurrent } from './currentTime';

export type Project = {
  id: number;
  pname: string;
  pkey: string | null;
  description: string | null;
  course_id: string | null;
  course_year: number | null;
  course_sem: number | null;
  public: boolean;
  created_at: string;
};

// Project management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllProjects: builder.query<Project[], void>({
      query: () => ({
        url : 'project/',
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

    getProject: builder.query<Project[], Pick<Project, 'id'>>({
      query: (id) => `project/${id}`,
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

export const { useAddProjectMutation, useGetAllProjectsQuery, useGetProjectQuery, useRemoveProjectMutation } =
  extendedApi;

// Filter courses by current and past
export const useCurrentAndPastProjects = () => {
  const projectsData = useGetAllProjectsQuery();

  const filteredProjects = useMemo(() => {
    if (projectsData.isError || projectsData.isLoading) {
      return undefined;
    }
    return {
      pastProjects: (projectsData.data as Project[]).filter((p) => !isCurrent(p.course_year, p.course_sem)),
      currentProjects: (projectsData.data as Project[]).filter((p) => isCurrent(p.course_year, p.course_sem)),
    };
  }, [projectsData]);

  return { ...projectsData, ...filteredProjects };
};
