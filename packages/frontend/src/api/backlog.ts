import trofosApiSlice from '.';
import { extendedApi as sprintApi } from './sprint';
import type { BacklogFormFields } from '../helpers/BacklogModal.types';
import type { Backlog, BacklogHistory, BacklogUpdatePayload } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBacklogs: builder.query<Backlog[], number>({
      query: (projectId) => ({
        url: `backlog/listBacklogs/${projectId}`,
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
      invalidatesTags: ['Backlog', 'Sprint', 'BacklogHistory'],
    }),
    updateBacklog: builder.mutation<Backlog, BacklogUpdatePayload>({
      query: (backlogToUpdate) => ({
        url: 'backlog/updateBacklog/',
        method: 'PUT',
        body: backlogToUpdate,
        credentials: 'include',
      }),
      async onQueryStarted({ backlogId, projectId, ...patch }, { dispatch, queryFulfilled }) {
        // update from drag and drop on sprint page
        if (patch.srcSprintId !== undefined && patch.fieldToUpdate.sprint_id !== undefined) {
          let patchSprintsResult;

          // moving backlog from unassigned sprint to a sprint
          if (patch.srcSprintId === null) {
            // remove backlog from unassignedBacklogs array and add it to the destination sprint's backlog array
            patchSprintsResult = dispatch(
              sprintApi.util.updateQueryData('getSprints', projectId, (draft) => {
                const backlogIndex = draft.unassignedBacklogs.findIndex((b) => b.backlog_id === backlogId);
                const backlogToMove = draft.unassignedBacklogs.splice(backlogIndex, 1)[0];
                const sprintIndex = draft.sprints.findIndex((s) => s.id === patch.fieldToUpdate.sprint_id);
                draft.sprints[sprintIndex].backlogs.push(backlogToMove);
              }),
            );
            // moving backlog from a sprint to unassigned sprint
          } else if (patch.fieldToUpdate.sprint_id === null) {
            // remove backlog from source sprint's backlog array and add it to the unassignedBacklogs array
            patchSprintsResult = dispatch(
              sprintApi.util.updateQueryData('getSprints', projectId, (draft) => {
                const sprintIndex = draft.sprints.findIndex((s) => s.id === patch.srcSprintId);
                const backlogIndex = draft.sprints[sprintIndex].backlogs.findIndex((b) => b.backlog_id === backlogId);
                const backlogToMove = draft.sprints[sprintIndex].backlogs.splice(backlogIndex, 1)[0];
                draft.unassignedBacklogs.push(backlogToMove);
              }),
            );
            // moving backlog between sprints
          } else {
            // find and move backlog from the source sprint to the destination sprint
            patchSprintsResult = dispatch(
              sprintApi.util.updateQueryData('getSprints', projectId, (draft) => {
                const srcSprintIndex = draft.sprints.findIndex((s) => s.id === patch.srcSprintId);
                const destSprintIndex = draft.sprints.findIndex((s) => s.id === patch.fieldToUpdate.sprint_id);
                const backlogIndex = draft.sprints[srcSprintIndex].backlogs.findIndex(
                  (b) => b.backlog_id === backlogId,
                );
                const backlogToMove = draft.sprints[srcSprintIndex].backlogs.splice(backlogIndex, 1)[0];
                draft.sprints[destSprintIndex].backlogs.push(backlogToMove);
              }),
            );
          }

          try {
            await queryFulfilled;
          } catch {
            patchSprintsResult.undo();
          }
          // update from drag and drop on the scrum board
        } else if (patch.fieldToUpdate.assignee_id !== undefined && patch.fieldToUpdate.status !== undefined) {
          const patchResult = dispatch(
            sprintApi.util.updateQueryData('getActiveSprint', projectId, (draft) => {
              const updatedDraft = {
                ...draft,
                backlogs: draft.backlogs.map((b) => {
                  if (b.project_id === projectId && b.backlog_id === backlogId) {
                    return {
                      ...b,
                      ...patch.fieldToUpdate,
                    };
                  }
                  return b;
                }),
              };
              Object.assign(draft, updatedDraft);
            }),
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        }
      },
      invalidatesTags: ['Backlog', 'Sprint', 'BacklogHistory'],
    }),
    deleteBacklog: builder.mutation<Backlog, { projectId: number; backlogId: number }>({
      query: ({ projectId, backlogId }) => ({
        url: `backlog/deleteBacklog/${projectId}/${backlogId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Backlog', 'Sprint', 'BacklogHistory'],
    }),

    // Backlog history related queries
    getSprintBacklogHistory: builder.query<BacklogHistory[], { sprintId: number }>({
      query: ({ sprintId }) => ({
        url: `backlog/getHistory/sprint/${sprintId}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['BacklogHistory'],
    }),
    getProjectBacklogHistory: builder.query<BacklogHistory[], { projectId: number }>({
      query: ({ projectId }) => ({
        url: `backlog/getHistory/project/${projectId}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['BacklogHistory'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBacklogsQuery,
  useGetBacklogQuery,
  useAddBacklogMutation,
  useUpdateBacklogMutation,
  useDeleteBacklogMutation,
  useGetProjectBacklogHistoryQuery,
  useGetSprintBacklogHistoryQuery,
} = extendedApi;
