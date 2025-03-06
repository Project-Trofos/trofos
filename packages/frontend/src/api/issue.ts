import trofosApiSlice from '.';
import { BacklogFromIssuePayload, Issue } from './types';

// Issue management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch a single issue by ID
    getIssue: builder.query<Issue, number>({
      query: (issueId) => ({
        url: `issue/${issueId}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: (result, error, id) => (result ? [{ type: 'Issue', id }] : ['Issue']),
    }),

    // Create a new issue
    createIssue: builder.mutation<Issue, FormData>({
      query: (newIssue) => ({
        url: `issue`,
        method: 'POST',
        body: newIssue,
        credentials: 'include',
      }),
      invalidatesTags: ['Issue'],
    }),

    // Update an existing issue
    updateIssue: builder.mutation<Issue, { issueId: number; fieldToUpdate: Partial<Issue> }>({
      query: ({ issueId, fieldToUpdate }) => ({
        url: `issue/${issueId}`,
        method: 'PUT',
        body: fieldToUpdate,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { issueId }) => [{ type: 'Issue', id: issueId }],
    }),

    // Delete an issue
    deleteIssue: builder.mutation<void, number>({
      query: (issueId) => ({
        url: `issue/${issueId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Issue'],
    }),

    // Create a backlog from an issue
    createBacklog: builder.mutation<void, BacklogFromIssuePayload>({
      query: ({ issueId, ...backlogPayload }) => ({
        url: `issue/${issueId}/backlog`,
        method: 'POST',
        body: backlogPayload,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { issueId }) => [{ type: 'Issue', id: issueId }, 'Backlog', 'Issue'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetIssueQuery,
  useCreateIssueMutation,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
  useCreateBacklogMutation,
} = extendedApi;
