import trofosApiSlice from '.';
import { Invite } from './types';

// Invite management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendProjectInvitation: builder.mutation<void, { projectId: number; destEmail: string }>({
      query: ({ projectId, destEmail }) => ({
        url: `invite/project/${projectId}`,
        method: 'POST',
        body: {
          destEmail,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Invite'],
    }),
    getInfoFromProjectId: builder.query<Invite[], number>({
      query: (projectId: number) => ({
        url: `invite/project/${projectId}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: (result, error, arg) =>
        result ? [...result.map(({ email }) => ({ type: 'Invite' as const, email })), 'Invite'] : ['Invite'],
    }),
    processProjectInvitation: builder.mutation<void, string>({
      query: (token) => ({
        url: `invite/${token}`,
        method: 'POST',
        credentials: 'include',
      }),
    }),
    getInfoFromInvite: builder.mutation<{ exists: boolean; email: string }, string>({
      query: (token) => ({
        url: `invite/${token}`,
        method: 'GET',
        credentials: 'include',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useSendProjectInvitationMutation,
  useGetInfoFromProjectIdQuery,
  useProcessProjectInvitationMutation,
  useGetInfoFromInviteMutation,
} = extendedApi;
