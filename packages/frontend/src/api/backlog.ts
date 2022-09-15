import trofosApiSlice from '.';
import { BacklogFormFields } from '../components/modals/types/BacklogModal.types';

export type Backlog = {
  id: number;
  summary: string;
  type: 'story' | 'task' | 'bug';
  priority: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  reporter_id: number;
  assignee_id: number;
  sprint_id: number;
  points: number;
  description: string;
  project_id: number;
};

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBacklogs: builder.query<Backlog[], number>({
      query: (projectId) => ({
        url: `backlog/listBacklogs/${projectId}`,
      }),
      providesTags: ['Backlog'],
    }),
    addBacklog: builder.mutation<Backlog, BacklogFormFields>({
      query: (backlog) => ({
        url: 'backlog/newBacklog/',
        method: 'POST',
        body: backlog,
      }),
      invalidatesTags: ['Backlog'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetBacklogsQuery, useAddBacklogMutation } = extendedApi;
