import trofosApiSlice from '.';

export type StandUpNote = {
  // TODO: figure this out
  // projectId: number;
  standUpId: number;
  columnId: number;
  noteId: number;
  userId: number;
  content: string;
};

type StandUpNoteFormFields = Omit<StandUpNote, 'noteId'>;

export type StandUp = {
  standUpId: number; // PK
  projectId: number;
  date: Date;
};

export const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStandUpsByProjectId: builder.query<StandUp[], number>({
      query: (projectId) => ({
        url: `standUp/${projectId}`,
        credentials: 'include',
      }),
      providesTags: ['StandUp'],
    }),
    addStandUp: builder.mutation<StandUp, Omit<StandUp, 'standUpId'>>({
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
    deleteStandUp: builder.mutation<void, Pick<StandUp, 'standUpId' | 'projectId'>>({
      query: ({ standUpId }) => ({
        url: `standUp/deleteStandUp/${standUpId}`,
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
    getStandUpNotes: builder.query<StandUpNote[], { standUpId: number }>({
      query: ({ standUpId }) => ({
        url: `standUp/getNotes/${standUpId}`,
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
    deleteStandUpNote: builder.mutation<void, { noteId: number; standUpId: number }>({
      query: ({ noteId, standUpId }) => ({
        url: `standUp/deleteStandUpNote/${noteId}`,
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
