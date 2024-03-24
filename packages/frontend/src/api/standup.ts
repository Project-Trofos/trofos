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
        url: `standUp/${project_id}`,
        credentials: 'include',
      }),
      providesTags: ['StandUpHeader'],
    }),
    addStandUp: builder.mutation<StandUpHeader, Omit<StandUpHeader, 'id'>>({
      query: (standUp) => ({
        url: 'standUp/createStandUp/',
        method: 'POST',
        body: standUp,
        credentials: 'include',
      }),
      invalidatesTags: ['StandUpHeader'],
    }),
    updateStandUp: builder.mutation<StandUpHeader, StandUpHeader>({
      query: (standUpToUpdate) => ({
        url: 'standUp/updateStandUp/',
        method: 'PUT',
        body: standUpToUpdate,
        credentials: 'include',
      }),
      invalidatesTags: ['StandUpHeader'],
    }),
    deleteStandUp: builder.mutation<void, Pick<StandUp, 'id' | 'project_id'>>({
      query: ({ id }) => ({
        url: `standUp/deleteStandUp/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'StandUp', id: arg.id }, 'StandUpHeader'],
    }),
    addStandUpNote: builder.mutation<StandUpNote, StandUpNoteFormFields>({
      query: (standUpNote) => ({
        url: 'standUp/createNote',
        method: 'POST',
        body: standUpNote,
        credentials: 'include',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'StandUp', id: arg.stand_up_id }],
    }),
    getStandUps: builder.query<StandUp[], Pick<StandUp, 'project_id'>>({
      query: ({ project_id }) => ({
        url: `standUp/getAllNotes/${project_id}`,
        credentials: 'include',
      }),
      providesTags: (result, _error, _arg) =>
        result ? [...result.map(({ id }) => ({ type: 'StandUp' as const, id })), 'StandUp'] : ['StandUp'],
    }),
    getStandUp: builder.query<StandUp, Pick<StandUp, 'id'>>({
      query: ({ id }) => ({
        url: `standUp/getNotes/${id}`,
        credentials: 'include',
      }),
      providesTags: (_result, _error, arg) => [{ type: 'StandUp', id: arg.id }],
    }),
    updateStandUpNote: builder.mutation<StandUpNote, StandUpNote>({
      query: (standUpNoteToUpdate) => ({
        url: 'standUp/updateStandUpNote/',
        method: 'PUT',
        body: standUpNoteToUpdate,
        credentials: 'include',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'StandUp', id: arg.stand_up_id }],
    }),
    deleteStandUpNote: builder.mutation<void, Pick<StandUpNote, 'id' | 'stand_up_id'>>({
      query: ({ id }) => ({
        url: `standUp/deleteStandUpNote/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'StandUp', id: arg.stand_up_id }],
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
