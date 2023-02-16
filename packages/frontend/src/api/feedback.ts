import trofosApiSlice from '.';
import { Feedback } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeedbacks: builder.query<Feedback[], void>({
      query: () => ({
        url: 'feedback/',
        credentials: 'include',
      }),
      providesTags: ['Feedback'],
    }),
    createFeedback: builder.mutation<Omit<Feedback, 'user'>, Pick<Feedback, 'sprint_id' | 'content'>>({
      query: ({ sprint_id, content }) => ({
        url: 'feedback/',
        method: 'POST',
        body: {
          sprintId: sprint_id,
          content,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Feedback'],
    }),
    updateFeedback: builder.mutation<Feedback, Pick<Feedback, 'id' | 'content'>>({
      query: ({ content, id }) => ({
        url: `feedback/${id}`,
        method: 'PUT',
        body: {
          content,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Feedback'],
    }),
    deleteFeedback: builder.mutation<Feedback, Pick<Feedback, 'id'>>({
      query: ({ id }) => ({
        url: `feedback/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Feedback'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFeedbacksQuery, useCreateFeedbackMutation, useUpdateFeedbackMutation, useDeleteFeedbackMutation } =
  extendedApi;
