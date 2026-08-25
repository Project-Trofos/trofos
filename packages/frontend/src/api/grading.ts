import trofosApiSlice from '.';
import { ProjectGrade, ProjectGradeStatus } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourseGrading: builder.query<ProjectGrade[], number>({
      query: (courseId) => ({
        url: `course/${courseId}/grading`,
        credentials: 'include',
      }),
      providesTags: (result, error, courseId) => [
        ...(result ? result.map(({ id }) => ({ type: 'Grading' as const, id })) : []),
        { type: 'Grading' as const, id: courseId },
      ],
    }),

    updateGrading: builder.mutation<
      ProjectGrade,
      {
        courseId: number;
        projectId: number;
        assignedTaId?: number | null;
        marks?: number;
        comments?: string;
        status?: ProjectGradeStatus;
      }
    >({
      query: ({ courseId, projectId, ...payload }) => ({
        url: `course/${courseId}/grading/${projectId}`,
        method: 'PUT',
        body: payload,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Grading', id: courseId }],
    }),

    publishCourseGrading: builder.mutation<void, { courseId: number }>({
      query: ({ courseId }) => ({
        url: `course/${courseId}/grading/publish`,
        method: 'POST',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Grading', id: courseId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCourseGradingQuery, useUpdateGradingMutation, usePublishCourseGradingMutation } = extendedApi;
