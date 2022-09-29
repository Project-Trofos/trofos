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
    getAllCourses: builder.query<Course[], void>({
      query: () => ({
        url :'course/',
        credentials: 'include',
      }),
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
          courseId: course.id,
          courseYear: course.year,
          courseSem: course.sem,
          courseName: course.cname,
          isPublic: course.public,
          description: course.description,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Course'],
    }),

    // Removing a course will invalidate that course and all projects
    removeCourse: builder.mutation<Course, Pick<Course, 'id' | 'year' | 'sem'>>({
      query: (param) => ({
        url: `course/${param.year}/${param.sem}/${param.id}`,
        method: 'DELETE',
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
      }),
      invalidatesTags: ['Course', 'Project'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddCourseMutation,
  useGetAllCoursesQuery,
  useGetCourseQuery,
  useRemoveCourseMutation,
  useAddProjectAndCourseMutation,
  useRemoveProjectFromCourseMutation,
  useAddProjectToCourseMutation,
} = extendedApi;

// Filter courses by current and past
export const useCurrentAndPastCourses = () => {
  const coursesData = useGetAllCoursesQuery();

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
