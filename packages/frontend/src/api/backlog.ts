import trofosApiSlice from '.';
import { extendedApi as sprintApi } from './sprint';
import type { BacklogFormFields } from '../helpers/BacklogModal.types';
import type { Backlog, BacklogHistory, BacklogUpdatePayload, Epic } from './types';
import { EpicFormFields } from '../helpers/EpicModal.types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBacklogs: builder.query<Backlog[], void>({
      query: () => ({
        url: `backlog/listBacklogs`,
        credentials: 'include',
      }),
      providesTags: ['Backlog'],
    }),
    getBacklogsByProjectId: builder.query<Backlog[], number>({
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
      invalidatesTags: (result, error, arg) => [
        'Backlog',
        'Sprint',
        'BacklogHistory',
        { type: 'Retrospective', id: `${arg.retrospective?.sprint_id}-${arg.retrospective?.type}` },
      ],
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
              sprintApi.util.updateQueryData('getSprintsByProjectId', projectId, (draft) => {
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
              sprintApi.util.updateQueryData('getSprintsByProjectId', projectId, (draft) => {
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
              sprintApi.util.updateQueryData('getSprintsByProjectId', projectId, (draft) => {
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
          const getActiveSprintPatch = dispatch(
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

          // Update getSprintByProjectId as well so that non-active sprints are also optimistically updated
          const getSprintByProjectIdPatch = dispatch(
            sprintApi.util.updateQueryData('getSprintsByProjectId', projectId, (draft) => {
              // The sprint in question
              const sprint = draft.sprints.find((s) => s.id === patch.srcSprintId);
              const updatedDraft = {
                sprints: [
                  // Other sprints
                  ...draft.sprints.filter((s) => s.id !== patch.srcSprintId),

                  // The updated sprint
                  {
                    ...sprint,
                    backlogs: sprint?.backlogs.map((b) => {
                      if (b.project_id === projectId && b.backlog_id === backlogId) {
                        // Updated backlog information
                        return {
                          ...b,
                          ...patch.fieldToUpdate,
                        };
                      }
                      return b;
                    }),
                  },
                ],
                unassignedBacklogs: draft.unassignedBacklogs,
              };
              Object.assign(draft, updatedDraft);
            }),
          );

          try {
            await queryFulfilled;
          } catch {
            getActiveSprintPatch.undo();
            getSprintByProjectIdPatch.undo();
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
      invalidatesTags: ['Backlog', 'Sprint', 'BacklogHistory', 'Issue'],
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
    getBacklogHistory: builder.query<BacklogHistory[], void>({
      query: () => ({
        url: `backlog/getHistory`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['BacklogHistory'],
    }),
    addEpic: builder.mutation<Epic, { epic: EpicFormFields }>({
      query: ({ epic }) => ({
        url: 'epic/newEpic',
        method: 'POST',
        body: epic,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Epic', id: `project-${arg.epic.projectId}` },
        { type: 'Backlog', id: `epic-${result?.epic_id}` },
      ],
    }),
    getEpicsByProjectId: builder.query<Epic[], { projectId: number }>({
      query: ({ projectId }) => ({
        url: `epic/project/${projectId}`,
        credentials: 'include',
      }),
      providesTags: (result, error, arg) => [{ type: 'Epic', id: `project-${arg.projectId}` }],
    }),
    getBacklogsByEpicId: builder.query<Backlog[], { epicId: number }>({
      query: ({ epicId }) => ({
        url: `epic/backlogs/${epicId}`,
        credentials: 'include',
      }),
      providesTags: (result, error, arg) => [{ type: 'Backlog', id: `epic-${arg.epicId}` }],
    }),
    addBacklogToEpic: builder.mutation<Backlog, { projectId: number; backlogId: number; epicId: number }>({
      query: ({ projectId, backlogId, epicId }) => ({
        url: 'epic/addBacklog',
        method: 'POST',
        body: { projectId, backlogId, epicId },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Epic', id: `project-${arg.projectId}` },
        { type: 'Backlog', id: `epic-${arg.epicId}` },
        'Sprint',
      ],
    }),
    removeBacklogFromEpic: builder.mutation<Backlog, { projectId: number; backlogId: number; epicId: number }>({
      query: ({ projectId, backlogId, epicId }) => ({
        url: 'epic/removeBacklog',
        method: 'POST',
        body: { projectId, backlogId, epicId },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Epic', id: `project-${arg.projectId}` },
        { type: 'Backlog', id: `epic-${arg.epicId}` },
        'Sprint',
      ],
    }),
    deleteEpic: builder.mutation<Epic, { epicId: number; projectId: number }>({
      query: ({ epicId, projectId }) => ({
        url: `epic/${epicId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [
        result ? { type: 'Epic', id: `project-${arg.projectId}` } : 'Epic',
        { type: 'Backlog', id: `epic-${arg.epicId}` },
        'Sprint',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBacklogsQuery,
  useGetBacklogsByProjectIdQuery,
  useGetBacklogQuery,
  useAddBacklogMutation,
  useUpdateBacklogMutation,
  useDeleteBacklogMutation,
  useGetBacklogHistoryQuery,
  useGetProjectBacklogHistoryQuery,
  useGetSprintBacklogHistoryQuery,
  useAddEpicMutation,
  useGetEpicsByProjectIdQuery,
  useGetBacklogsByEpicIdQuery,
  useAddBacklogToEpicMutation,
  useRemoveBacklogFromEpicMutation,
  useDeleteEpicMutation,
} = extendedApi;
