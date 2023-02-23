import trofosApiSlice from '.';
import { Feedback } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeedbacks: builder.query<Feedback[], void>({
      query: () => ({
        url: 'feedback/',
        credentials: 'include',
      }),
      providesTags: (result, error, arg) =>
        result ? [...result.map(({ id }) => ({ type: 'Feedback' as const, id })), 'Feedback'] : ['Feedback'],
    }),
    getFeedbacksBySprintId: builder.query<Feedback[], { sprintId: number; projectId: number }>({
      query: ({ sprintId, projectId }) => ({
        url: `project/${projectId}/feedback/sprint/${sprintId}`,
        credentials: 'include',
      }),
      providesTags: (result, error, arg) =>
        result ? [...result.map(({ id }) => ({ type: 'Feedback' as const, id })), 'Feedback'] : ['Feedback'],
    }),
    createFeedback: builder.mutation<
      Omit<Feedback, 'user'>,
      Pick<Feedback, 'sprint_id' | 'content'> & { projectId: number }
    >({
      query: ({ sprint_id, content, projectId }) => ({
        url: `project/${projectId}/feedback`,
        method: 'POST',
        body: {
          sprintId: sprint_id,
          content,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Feedback'],
    }),
    updateFeedback: builder.mutation<Feedback, Pick<Feedback, 'id' | 'content'> & { projectId: number }>({
      query: ({ content, id, projectId }) => ({
        url: `project/${projectId}/feedback/${id}`,
        method: 'PUT',
        body: {
          content,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Feedback', id: arg.id }],
    }),
    deleteFeedback: builder.mutation<Feedback, Pick<Feedback, 'id'> & { projectId: number }>({
      query: ({ id, projectId }) => ({
        url: `project/${projectId}/feedback/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Feedback'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeedbacksQuery,
  useGetFeedbacksBySprintIdQuery,
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
} = extendedApi;
