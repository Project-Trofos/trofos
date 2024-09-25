import trofosApiSlice from '.';

export type StandUpNote = {
  id: number;
  column_id: number;
  stand_up_id: number;
  user_id: number;
  content: string;
};

type StandUpNoteFormFields = Omit<StandUpNote, 'id'>;

export type StandUp = {
  id: number; // PK
  project_id: number;
  date: Date;
  notes: StandUpNote[];
};

export type StandUpHeader = Omit<StandUp, 'notes'>;

export const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStandUpHeadersByProjectId: builder.query<StandUpHeader[], number>({
      query: (project_id) => ({
        url: `project/${project_id}/standUp/`,
        credentials: 'include',
      }),
      providesTags: ['StandUpHeader'],
    }),
    addStandUp: builder.mutation<StandUpHeader, Omit<StandUpHeader, 'id'>>({
      query: (standUp) => ({
        url: `project/${standUp.project_id}/standUp/createStandUp/`,
        method: 'POST',
        body: standUp,
        credentials: 'include',
      }),
      invalidatesTags: ['StandUpHeader'],
    }),
    updateStandUp: builder.mutation<StandUpHeader, StandUpHeader>({
      query: (standUpToUpdate) => ({
        url: `project/${standUpToUpdate.project_id}/standUp/updateStandUp/`,
        method: 'PUT',
        body: standUpToUpdate,
        credentials: 'include',
      }),
      invalidatesTags: ['StandUpHeader'],
    }),
    deleteStandUp: builder.mutation<void, StandUpHeader>({
      query: (standUpHeader) => ({
        url: `project/${standUpHeader.project_id}/standUp/deleteStandUp/${standUpHeader.id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'StandUp', id: arg.id }, 'StandUpHeader'],
    }),
    addStandUpNote: builder.mutation<StandUpNote, {project_id: number, standUpNote: StandUpNoteFormFields}>({
      query: ({project_id, standUpNote}) => ({
        url: `project/${project_id}/standUp/createNote`,
        method: 'POST',
        body: standUpNote,
        credentials: 'include',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'StandUp', id: arg.standUpNote.stand_up_id }],
    }),
    getStandUps: builder.query<StandUp[], Pick<StandUp, 'project_id'>>({
      query: ({ project_id }) => ({
        url: `project/${project_id}/standUp/getAllNotes`,
        credentials: 'include',
      }),
      providesTags: (result, _error, _arg) =>
        result ? [...result.map(({ id }) => ({ type: 'StandUp' as const, id })), 'StandUp'] : ['StandUp'],
    }),
    getStandUp: builder.query<StandUp, {project_id: number, id: Pick<StandUp, 'id'>}>({
      query: ({project_id, id}) => ({
        url: `project/${project_id}/standUp/getNotes/${id.id}`,
        credentials: 'include',
      }),
      providesTags: (_result, _error, arg) => [{ type: 'StandUp', id: arg.id.id }],
    }),
    updateStandUpNote: builder.mutation<StandUpNote, {project_id: number, standUpNoteToUpdate: StandUpNote}>({
      query: ({project_id, standUpNoteToUpdate}) => ({
        url: `project/${project_id}/standUp/updateStandUpNote/`,
        method: 'PUT',
        body: standUpNoteToUpdate,
        credentials: 'include',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'StandUp', id: arg.standUpNoteToUpdate.stand_up_id }],
    }),
    deleteStandUpNote: builder.mutation<void, {project_id: number, id: Pick<StandUpNote, 'id' | 'stand_up_id'>}>({
      query: ({ project_id, id }) => ({
        url: `project/${project_id}/standUp/deleteStandUpNote/${id.id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'StandUp', id: arg.id.stand_up_id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddStandUpMutation,
  useGetStandUpHeadersByProjectIdQuery,
  useUpdateStandUpMutation,
  useDeleteStandUpMutation,
  useAddStandUpNoteMutation,
  useGetStandUpQuery,
  useGetStandUpsQuery,
  useUpdateStandUpNoteMutation,
  useDeleteStandUpNoteMutation,
} = extendedApi;
