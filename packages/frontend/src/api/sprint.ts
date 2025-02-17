import trofosApiSlice from '.';
import type { SprintFormFields, SprintUpdatePayload } from '../helpers/SprintModal.types';
import type { Backlog, Retrospective, RetrospectiveType, RetrospectiveVote, RetrospectiveVoteType, SprintInsight } from './types';

export type Sprint = {
  id: number;
  name: string;
  duration: number;
  goals: string | null;
  start_date: string;
  end_date: string;
  project_id: number;
  status: 'upcoming' | 'current' | 'completed' | 'closed';
  backlogs: Backlog[];
};

export type SprintWithBacklogs = { sprints: Sprint[]; unassignedBacklogs: Backlog[] };

export const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSprints: builder.query<Sprint[], void>({
      query: () => ({
        url: `sprint/listSprints`,
        credentials: 'include',
      }),
      providesTags: ['Sprint'],
    }),
    getSprintsByProjectId: builder.query<SprintWithBacklogs, number>({
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
    getSprintNotes: builder.query<{ notes: string }, number>({
      query: (sprintId) => ({
        url: `sprint/notes/${sprintId}`,
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
    deleteSprint: builder.mutation<Sprint, { sprintId: number; projectId: number }>({
      query: ({ sprintId }) => ({
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
    deleteRetrospective: builder.mutation<Retrospective, 
      { retroId: number; sprintId: number; retroType: RetrospectiveType }>({
      query: ({ retroId }) => ({
        url: `sprint/deleteRetrospective/${retroId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Retrospective', id: `${arg.sprintId}-${arg.retroType}` }],
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
    getSprintInsights: builder.query<SprintInsight[], number>({
      query: (sprintId) => ({
        url: `sprint/${sprintId}/insight`,
        credentials: 'include',
      }),
      providesTags: ['SprintInsight'],
    }),
    getSprintInsightGeneratingStatus: builder.query<{isGenerating: boolean}, {sprintId: number, projectId: number}>({
      query: ({
        sprintId,
        projectId,
      }) => ({
        url: `sprint/${sprintId}/insight/status?projectId=${projectId}`,
        credentials: 'include',
      }),
      providesTags: ['SprintInsightStatus'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSprintsQuery,
  useGetSprintsByProjectIdQuery,
  useGetActiveSprintQuery,
  useGetSprintNotesQuery,
  useAddSprintMutation,
  useUpdateSprintMutation,
  useDeleteSprintMutation,
  useAddRetrospectiveMutation,
  useDeleteRetrospectiveMutation,
  useGetRetrospectivesQuery,
  useAddRetrospectiveVoteMutation,
  useUpdateRetrospectiveVoteMutation,
  useDeleteRetrospectiveVoteMutation,
  useGetSprintInsightsQuery,
  useGetSprintInsightGeneratingStatusQuery,
} = extendedApi;
