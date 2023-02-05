import trofosApiSlice from '.';
import type { SprintFormFields, SprintUpdatePayload } from '../helpers/SprintModal.types';
import type { Backlog, Retrospective, RetrospectiveType, RetrospectiveVote, RetrospectiveVoteType } from './types';

export type Sprint = {
  id: number;
  name: string;
  duration: number;
  goals: string;
  start_date: string;
  end_date: string;
  project_id: number;
  status: 'upcoming' | 'current' | 'completed' | 'closed';
  backlogs: Backlog[];
};

export const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSprints: builder.query<{ sprints: Sprint[]; unassignedBacklogs: Backlog[] }, number>({
      query: (projectId) => ({
        url: `sprint/listSprints/${projectId}`,
        credentials: 'include',
      }),
      providesTags: ['Sprint'],
    }),
    getActiveSprint: builder.query<Sprint, number>({
      query: (projectId) => ({
        url: `sprint/listActiveSprint/${projectId}`,
        credentials: 'include',
      }),
      providesTags: ['Sprint'],
    }),
    addSprint: builder.mutation<Sprint, SprintFormFields>({
      query: (sprint) => ({
        url: 'sprint/newSprint/',
        method: 'POST',
        body: sprint,
        credentials: 'include',
      }),
      invalidatesTags: ['Sprint', 'Project'],
    }),
    updateSprint: builder.mutation<Sprint, SprintUpdatePayload>({
      query: (sprintToUpdate) => ({
        url: 'sprint/updateSprint/',
        method: 'PUT',
        body: sprintToUpdate,
        credentials: 'include',
      }),
      invalidatesTags: ['Sprint', 'Project', 'Backlog'],
    }),
    deleteSprint: builder.mutation<Sprint, number>({
      query: (sprintId) => ({
        url: `sprint/deleteSprint/${sprintId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Sprint', 'Project', 'Backlog'],
    }),
    addRetrospective: builder.mutation<Retrospective, { sprintId: number; content: string; type: RetrospectiveType }>({
      query: ({ sprintId, content, type }) => ({
        url: 'sprint/addRetrospective/',
        method: 'POST',
        body: {
          sprintId,
          content,
          type,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Retrospective', id: `${arg.sprintId}-${arg.type}` }],
    }),
    getRetrospectives: builder.query<Retrospective[], { sprintId: number; type?: RetrospectiveType }>({
      query: ({ sprintId, type }) => ({
        url: `sprint/getRetrospectives/${sprintId}/${type || ''}`,
        credentials: 'include',
      }),
      providesTags: (result, error, arg) => [{ type: 'Retrospective', id: `${arg.sprintId}-${arg.type}` }],
    }),
    addRetrospectiveVote: builder.mutation<
      RetrospectiveVote,
      { retroId: number; type: RetrospectiveVoteType; sprintId: number; retroType: RetrospectiveType }
    >({
      query: ({ retroId, type }) => ({
        url: 'sprint/addRetrospectiveVote/',
        method: 'POST',
        body: {
          retroId,
          type,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Retrospective', id: `${arg.sprintId}-${arg.retroType}` }],
    }),
    updateRetrospectiveVote: builder.mutation<
      RetrospectiveVote,
      { retroId: number; type: RetrospectiveVoteType; sprintId: number; retroType: RetrospectiveType }
    >({
      query: ({ retroId, type }) => ({
        url: 'sprint/updateRetrospectiveVote/',
        method: 'PUT',
        body: {
          retroId,
          type,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Retrospective', id: `${arg.sprintId}-${arg.retroType}` }],
    }),
    deleteRetrospectiveVote: builder.mutation<
      RetrospectiveVote,
      { retroId: number; sprintId: number; retroType: RetrospectiveType }
    >({
      query: ({ retroId }) => ({
        url: `sprint/deleteRetrospectiveVote/${retroId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Retrospective', id: `${arg.sprintId}-${arg.retroType}` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSprintsQuery,
  useGetActiveSprintQuery,
  useAddSprintMutation,
  useUpdateSprintMutation,
  useDeleteSprintMutation,
  useAddRetrospectiveMutation,
  useGetRetrospectivesQuery,
  useAddRetrospectiveVoteMutation,
  useUpdateRetrospectiveVoteMutation,
  useDeleteRetrospectiveVoteMutation,
} = extendedApi;
