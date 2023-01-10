import _ from 'lodash';
import trofosApiSlice from '.';
import { extendedApi as sprintApi } from './sprint';
import type { BacklogFormFields } from '../helpers/BacklogModal.types';
import type { Backlog, BacklogUpdatePayload } from './types';

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
      async onQueryStarted({ backlogId, projectId, ...patch }, { dispatch, queryFulfilled }) {
        // update from drag and drop on sprint page
        if (patch.srcSprintId !== undefined && patch.fieldToUpdate.sprint_id !== undefined) {
          let backlogToMove: Backlog;
          let patchUnassignedBacklogResult;
          let patchSprintsResult;

          // moving backlog from unassigned sprint to a sprint
          if (patch.srcSprintId === null) {
            // find and remove backlog from 'getUnassignedBacklogs' API
            patchUnassignedBacklogResult = dispatch(
              extendedApi.util.updateQueryData('getUnassignedBacklogs', projectId, (draft) => {
                const backlogIndex = draft.findIndex((b) => b.backlog_id === backlogId);
                backlogToMove = _.cloneDeep<Backlog>(draft.splice(backlogIndex, 1)[0]);
              }),
            );
            // add backlog to the relevant sprint's backlog array in the 'getSprints' API
            patchSprintsResult = dispatch(
              sprintApi.util.updateQueryData('getSprints', projectId, (draft) => {
                const sprintIndex = draft.findIndex((s) => s.id === patch.fieldToUpdate.sprint_id);
                draft[sprintIndex].backlogs.push(backlogToMove);
              }),
            );
            // moving backlog from a sprint to unassigned sprint
          } else if (patch.fieldToUpdate.sprint_id === null) {
            // find and remove the backlog from the relevant sprint's backlog array in the 'getSprints' API
            patchSprintsResult = dispatch(
              sprintApi.util.updateQueryData('getSprints', projectId, (draft) => {
                const sprintIndex = draft.findIndex((s) => s.id === patch.srcSprintId);
                const backlogIndex = draft[sprintIndex].backlogs.findIndex((b) => b.backlog_id === backlogId);
                backlogToMove = _.cloneDeep<Backlog>(draft[sprintIndex].backlogs.splice(backlogIndex, 1)[0]);
              }),
            );
            // add backlog to the 'getUnassignedBacklogs' API
            patchUnassignedBacklogResult = dispatch(
              extendedApi.util.updateQueryData('getUnassignedBacklogs', projectId, (draft) => {
                draft.push(backlogToMove);
              }),
            );
            // moving backlog between sprints
          } else {
            // find and move backlog from the source sprint to the destination sprint in the 'getSprints' API
            patchSprintsResult = dispatch(
              sprintApi.util.updateQueryData('getSprints', projectId, (draft) => {
                const srcSprintIndex = draft.findIndex((s) => s.id === patch.srcSprintId);
                const destSprintIndex = draft.findIndex((s) => s.id === patch.fieldToUpdate.sprint_id);
                const backlogIndex = draft[srcSprintIndex].backlogs.findIndex((b) => b.backlog_id === backlogId);
                backlogToMove = _.cloneDeep<Backlog>(draft[srcSprintIndex].backlogs.splice(backlogIndex, 1)[0]);
                draft[destSprintIndex].backlogs.push(backlogToMove);
              }),
            );
          }

          try {
            await queryFulfilled;
          } catch {
            if (patchUnassignedBacklogResult) patchUnassignedBacklogResult.undo();
            if (patchSprintsResult) patchSprintsResult.undo();
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
