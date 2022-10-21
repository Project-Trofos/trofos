import trofosApiSlice from '.';
import type { SprintFormFields, SprintUpdatePayload } from '../helpers/SprintModal.types';
import { Backlog } from './backlog';

export type Sprint = {
  id: number;
  name: string;
  duration: number;
  goals: string;
  start_date: string;
  end_date: string;
  project_id: number;
  status: 'upcoming' | 'current' | 'completed';
  backlogs: Backlog[];
};

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSprints: builder.query<Sprint[], number>({
      query: (projectId) => ({
        url: `sprint/listSprints/${projectId}`,
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
  }),
  overrideExisting: false,
});

export const { useGetSprintsQuery, useAddSprintMutation, useUpdateSprintMutation, useDeleteSprintMutation } =
  extendedApi;
