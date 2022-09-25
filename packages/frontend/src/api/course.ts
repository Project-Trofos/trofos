import trofosApiSlice from '.';
import { PickRename } from '../helpers/types';
import { Project } from './project';

export type Course = {
  id: string;
  cname: string;
  description: string | null;
  public: boolean,
  created_at: string,
};

// Project management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCourses: builder.query<Course[], void>({
      query: () => ({
        url :'course/',
        credentials: 'include',
      }),
      providesTags: ['Course'],
    }),
    addCourse: builder.mutation<Course, Partial<Course> & Pick<Course, 'cname'>>({
      query: (course) => ({
        url: 'course/',
        method: 'POST',
        body: {
          id: course.id,
          name: course.cname,
          isPublic: course.public,
          description: course.description,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Course'],
    }),
    removeCourse: builder.mutation<Course, Pick<Course, 'id'>>({
      query: (param) => ({
        url: `course/${param.id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Course', 'Project'],
    }),
    addProjectToCourse: builder.mutation<Course, PickRename<Course, 'id', 'courseId'> & PickRename<Project, 'id', 'projectId'>>({
      query: (param) => ({
        url: `course/${param.courseId}/project`,
        body: {
          projectId: param.projectId,
        },
        method: 'POST',
        credentials: 'include',
      }),
      invalidatesTags: ['Course', 'Project'],
    }),
    removeProjectFromCourse: builder.mutation<Course, PickRename<Course, 'id', 'courseId'> & PickRename<Project, 'id', 'projectId'>>({
      query: (param) => ({
        url: `course/${param.courseId}/project`,
        body: {
          projectId: param.projectId,
        },
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Course', 'Project'],
    }),
    addProjectAndCourse: builder.mutation<Project, {
      courseId?: string;
      courseName?: string;
      projectName: string;
      projectKey?: string;
      isCoursePublic?: boolean;
      isProjectPublic?: boolean;
      projectDescription?: string;
    }>({
      query: (body) => ({
        url: 'course/project',
        method: 'POST',
        body,
        credentials: 'include',
      }),
      invalidatesTags: ['Project', 'Course'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useAddCourseMutation, 
  useGetAllCoursesQuery, 
  useRemoveCourseMutation, 
  useAddProjectAndCourseMutation, 
  useRemoveProjectFromCourseMutation, 
  useAddProjectToCourseMutation, 
} = extendedApi;