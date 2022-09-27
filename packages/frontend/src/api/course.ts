import { useMemo } from 'react';
import trofosApiSlice from '.';
import { PickRename } from '../helpers/types';
import { isCurrent } from './currentTime';
import { Project } from './project';

export type Course = {
  id: string;
  year: number;
  sem: number;
  cname: string;
  description: string | null;
  public: boolean;
  created_at: string;
};

// Project management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<Course[], void>({
      query: () => 'course/',
      providesTags: (result, error, arg) => [
        'Course',
        ...(result ?? []).map(({ id, year, sem }): { type: 'Course'; id: string } => ({
          type: 'Course',
          id: `${year}-${sem}-${id}`,
        })),
      ],
    }),

    getCourse: builder.query<Course[], Pick<Course, 'id' | 'year' | 'sem'>>({
      query: ({ year, sem, id }) => `course/${year}/${sem}/${id}`,
      providesTags: (result, error, { id, year, sem }) => [{ type: 'Course', id: `${year}-${sem}-${id}` }],
    }),

    // Adding a course will invalidate all courses
    addCourse: builder.mutation<Course, Partial<Course> & Pick<Course, 'cname'>>({
      query: (course) => ({
        url: 'course/',
        method: 'POST',
        body: {
          id: course.id,
          year: course.year,
          sem: course.sem,
          name: course.cname,
          isPublic: course.public,
          description: course.description,
        },
      }),
      invalidatesTags: ['Course'],
    }),

    // Removing a course will invalidate that course and all projects
    removeCourse: builder.mutation<Course, Pick<Course, 'id' | 'year' | 'sem'>>({
      query: (param) => ({
        url: `course/${param.year}/${param.sem}/${param.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id, year, sem }) => [
        { type: 'Course', id: `${year}-${sem}-${id}` },
        'Project',
      ],
    }),

    // Adding a project to a course will invalidate that course and all projects
    addProjectToCourse: builder.mutation<
      Course,
      PickRename<Course, 'id', 'courseId'> &
        PickRename<Course, 'year', 'courseYear'> &
        PickRename<Course, 'sem', 'courseSem'> &
        PickRename<Project, 'id', 'projectId'>
    >({
      query: (param) => ({
        url: `course/${param.courseYear}/${param.courseSem}/${param.courseId}/project`,
        body: {
          projectId: param.projectId,
        },
        method: 'POST',
      }),
      invalidatesTags: (result, error, { courseId, courseYear, courseSem, projectId }) => [
        { type: 'Course', id: `${courseYear}-${courseSem}-${courseId}` },
        { type: 'Project', id: projectId },
      ],
    }),

    // Removing a project to a course will invalidate that course and that project
    removeProjectFromCourse: builder.mutation<
      Course,
      PickRename<Course, 'id', 'courseId'> &
        PickRename<Course, 'year', 'courseYear'> &
        PickRename<Course, 'sem', 'courseSem'> &
        PickRename<Project, 'id', 'projectId'>
    >({
      query: (param) => ({
        url: `course/${param.courseYear}/${param.courseSem}/${param.courseId}/project`,
        body: {
          projectId: param.projectId,
        },
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { courseId, courseYear, courseSem, projectId }) => [
        { type: 'Course', id: `${courseYear}-${courseSem}-${courseId}` },
        { type: 'Project', id: projectId },
      ],
    }),

    // Removing a project to a course will invalidate all courses and all projects
    addProjectAndCourse: builder.mutation<
      Project,
      {
        courseId?: string;
        courseYear?: number;
        courseSem?: number;
        courseName?: string;
        projectName: string;
        projectKey?: string;
        isCoursePublic?: boolean;
        isProjectPublic?: boolean;
        projectDescription?: string;
      }
    >({
      query: (body) => ({
        url: 'course/project',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course', 'Project'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddCourseMutation,
  useGetCoursesQuery,
  useGetCourseQuery,
  useRemoveCourseMutation,
  useAddProjectAndCourseMutation,
  useRemoveProjectFromCourseMutation,
  useAddProjectToCourseMutation,
} = extendedApi;

// Filter courses by current and past
export const useCurrentAndPastCourses = () => {
  const coursesData = useGetCoursesQuery();

  const filteredCourses = useMemo(() => {
    if (coursesData.isError || coursesData.isLoading) {
      return undefined;
    }
    return {
      pastCourses: (coursesData.data as Course[]).filter((c) => !isCurrent(c.year, c.sem)),
      currentCourses: (coursesData.data as Course[]).filter((c) => isCurrent(c.year, c.sem)),
    };
  }, [coursesData]);

  return { ...coursesData, ...filteredCourses };
};
