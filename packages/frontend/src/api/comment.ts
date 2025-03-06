import trofosApiSlice from '.';
import { BacklogComment, BaseComment, CommentFieldsType, IssueComment, IssueCommentFieldsType } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<BacklogComment[], { projectId: number; backlogId: number }>({
      query: ({ projectId, backlogId }) => ({
        url: `backlog/listComments/${projectId}/${backlogId}`,
        credentials: 'include',
      }),
      providesTags: (result, error, { projectId, backlogId }) => [{ type: 'Backlog', id: `${projectId}-${backlogId}` }],
    }),
    getIssueComments: builder.query<IssueComment[], { issueId: number }>({
      query: ({ issueId }) => ({
        url: `issue/listComments/${issueId}`,
        credentials: 'include',
      }),
      providesTags: (result, error, { issueId }) => [{ type: 'Issue', id: issueId }],
    }),
    createComment: builder.mutation<BacklogComment, CommentFieldsType>({
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
      invalidatesTags: (result, error, { projectId, backlogId }) => [
        { type: 'Backlog', id: `${projectId}-${backlogId}` },
      ],
    }),
    createIssueComment: builder.mutation<IssueComment, IssueCommentFieldsType>({
      query: ({ issueId, commenterId, content }) => ({
        url: 'issue/createComment/',
        method: 'POST',
        body: {
          issueId,
          commenterId,
          content,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { issueId }) => [{ type: 'Issue', id: issueId }],
    }),
    updateComment: builder.mutation<BaseComment, { commentId: number; updatedComment: string }>({
      query: ({ commentId, updatedComment }) => ({
        url: 'backlog/updateComment/',
        method: 'PUT',
        body: {
          commentId,
          updatedComment,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Backlog', 'Issue'],
    }),
    deleteComment: builder.mutation<BaseComment, { commentId: number }>({
      query: ({ commentId }) => ({
        url: `backlog/deleteComment/${commentId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Backlog', 'Issue'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCommentsQuery,
  useGetIssueCommentsQuery,
  useCreateCommentMutation,
  useCreateIssueCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = extendedApi;
