import trofosApiSlice from '.';
import { Comment, CommentFieldsType } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<Comment[], { projectId: number; backlogId: number }>({
      query: ({ projectId, backlogId }) => ({
        url: `backlog/listComments/${projectId}/${backlogId}`,
        credentials: 'include',
      }),
      providesTags: ['Backlog'],
    }),
    createComment: builder.mutation<Comment, CommentFieldsType>({
      query: ({ projectId, backlogId, commenterId, content }) => ({
        url: 'backlog/createComment/',
        method: 'POST',
        body: {
          projectId,
          backlogId,
          commenterId,
          content,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Backlog'],
    }),
    updateComment: builder.mutation<Comment, { commentId: number; updatedComment: string }>({
      query: ({ commentId, updatedComment }) => ({
        url: 'backlog/updateComment/',
        method: 'PUT',
        body: {
          commentId,
          updatedComment,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Backlog'],
    }),
    deleteComment: builder.mutation<Comment, { commentId: number }>({
      query: ({ commentId }) => ({
        url: `backlog/deleteComment/${commentId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Backlog'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCommentsQuery, useCreateCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } =
  extendedApi;
