import trofosApiSlice from '.';
import { BacklogFormFields } from '../helpers/BacklogModal.types';

export type Backlog = {
  backlog_id: number;
  summary: string;
  type: 'story' | 'task' | 'bug';
  priority: 'very_high' | 'high' | 'medium' | 'low' | 'very_low' | null;
  reporter_id: number;
  assignee_id: number | null;
  sprint_id: number | null;
  points: number | null;
  description: string | null;
  project_id: number;
  status: 'todo' | 'in_progress' | 'done';
};

type BacklogUpdatePayload = {
  projectId: number;
  backlogId: number;
  fieldToUpdate: Partial<Backlog>;
};

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBacklogs: builder.query<Backlog[], number>({
      query: (projectId) => ({
        url: `backlog/listBacklogs/${projectId}`,
        credentials: 'include',
      }),
      providesTags: ['Backlog'],
    }),
    getUnassignedBacklogs: builder.query<Backlog[], number>({
      query: (projectId) => ({
        url: `backlog/listUnassignedBacklogs/${projectId}`,
        credentials: 'include',
      }),
      providesTags: ['Backlog'],
    }),
    getBacklog: builder.query<Backlog, { projectId: number; backlogId: number }>({
      query: ({ projectId, backlogId }) => ({
        url: `backlog/getBacklog/${projectId}/${backlogId}`,
        credentials: 'include',
      }),
      providesTags: ['Backlog'],
    }),
    addBacklog: builder.mutation<Backlog, BacklogFormFields>({
      query: (backlog) => ({
        url: 'backlog/newBacklog/',
        method: 'POST',
        body: backlog,
        credentials: 'include',
      }),
      invalidatesTags: ['Backlog', 'Sprint'],
    }),
    updateBacklog: builder.mutation<Backlog, BacklogUpdatePayload>({
      query: (backlogToUpdate) => ({
        url: 'backlog/updateBacklog/',
        method: 'PUT',
        body: backlogToUpdate,
        credentials: 'include',
      }),
      invalidatesTags: ['Backlog', 'Sprint'],
    }),
    deleteBacklog: builder.mutation<Backlog, { projectId: number; backlogId: number }>({
      query: ({ projectId, backlogId }) => ({
        url: `backlog/deleteBacklog/${projectId}/${backlogId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Backlog', 'Sprint'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBacklogsQuery,
  useGetUnassignedBacklogsQuery,
  useGetBacklogQuery,
  useAddBacklogMutation,
  useUpdateBacklogMutation,
  useDeleteBacklogMutation,
} = extendedApi;
