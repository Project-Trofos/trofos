import trofosApiSlice from '.';

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
      query: () => 'course/',
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
      }),
      invalidatesTags: ['Course'],
    }),
    removeCourse: builder.mutation<Course, Pick<Course, 'id'>>({
      query: (course) => ({
        url: `course/${course.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course', 'Project'],
    }),
    addProjectAndCourse: builder.mutation<Course, {
      courseId?: string;
      courseName?: string;
      projectName: string;
      projectKey?: string;
      projectIsPublic?: boolean;
      projectDescription?: string;
    }>({
      query: (course) => ({
        url: 'course/project',
        method: 'POST',
        body: { ...course },
      }),
      invalidatesTags: ['Project', 'Course'],
    }),
  }),
  overrideExisting: false,
});

export const { useAddCourseMutation, useGetAllCoursesQuery, useRemoveCourseMutation, useAddProjectAndCourseMutation } = extendedApi;