import trofosApiSlice from '.';

export type StandUpNote = {
  // TODO: figure this out
  // project_id: number;
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
};

export const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStandUpsByProjectId: builder.query<StandUp[], number>({
      query: (project_id) => ({
        url: `standUp/${project_id}`,
        credentials: 'include',
      }),
      providesTags: ['StandUp'],
    }),
    addStandUp: builder.mutation<StandUp, Omit<StandUp, 'id'>>({
      query: (standUp) => ({
        url: 'standUp/createStandUp/',
        method: 'POST',
        body: standUp,
        credentials: 'include',
      }),
      invalidatesTags: ['StandUp', 'StandUpNote'],
    }),
    updateStandUp: builder.mutation<StandUp, StandUp>({
      query: (standUpToUpdate) => ({
        url: 'standUp/updateStandUp/',
        method: 'PUT',
        body: standUpToUpdate,
        credentials: 'include',
      }),
      invalidatesTags: ['StandUp', 'StandUpNote'],
    }),
    deleteStandUp: builder.mutation<void, Pick<StandUp, 'id' | 'project_id'>>({
      query: ({ id }) => ({
        url: `standUp/deleteStandUp/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['StandUp', 'StandUpNote'],
    }),
    addStandUpNote: builder.mutation<StandUpNote, StandUpNoteFormFields>({
      query: (standUpNote) => ({
        url: 'standUp/createNote',
        method: 'POST',
        body: standUpNote,
        credentials: 'include',
      }),
      invalidatesTags: ['StandUpNote'],
    }),
    getStandUpNotes: builder.query<StandUpNote[], { stand_up_id: number }>({
      query: ({ stand_up_id }) => ({
        url: `standUp/getNotes/${stand_up_id}`,
        credentials: 'include',
      }),
      providesTags: ['StandUpNote'],
    }),
    updateStandUpNote: builder.mutation<StandUpNote, StandUpNoteFormFields>({
      query: (standUpNoteToUpdate) => ({
        url: 'standUp/updateStandUpNote/',
        method: 'PUT',
        body: standUpNoteToUpdate,
        credentials: 'include',
      }),
      invalidatesTags: ['StandUpNote'],
    }),
    deleteStandUpNote: builder.mutation<void, Pick<StandUpNote, 'id' | 'stand_up_id'>>({
      query: ({ id }) => ({
        url: `standUp/deleteStandUpNote/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['StandUpNote'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddStandUpMutation,
  useGetStandUpsByProjectIdQuery,
  useUpdateStandUpMutation,
  useDeleteStandUpMutation,
  useAddStandUpNoteMutation,
  useGetStandUpNotesQuery,
  useUpdateStandUpNoteMutation,
  useDeleteStandUpNoteMutation,
} = extendedApi;
