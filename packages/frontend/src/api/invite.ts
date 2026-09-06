import trofosApiSlice from '.';
import { Invite, InviteMetadata, ProcessInviteResponse } from './types';

// Invite management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrGetProjectInviteLink: builder.mutation<Invite, { projectId: number; destEmail?: string }>({
      query: ({ projectId, destEmail }) => ({
        url: `invite/project/${projectId}`,
        method: 'POST',
        body: destEmail === undefined ? undefined : { destEmail },
        credentials: 'include',
      }),
      invalidatesTags: ['Invite'],
    }),
    getProjectInviteLink: builder.query<Invite | null, number>({
      query: (projectId: number) => ({
        url: `invite/project/${projectId}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['Invite'],
    }),
    processProjectInvitation: builder.mutation<ProcessInviteResponse, string>({
      query: (token) => ({
        url: `invite/${token}`,
        method: 'POST',
        credentials: 'include',
      }),
    }),
    getInfoFromInvite: builder.query<InviteMetadata, string>({
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
  useCreateOrGetProjectInviteLinkMutation,
  useGetProjectInviteLinkQuery,
  useProcessProjectInvitationMutation,
  useLazyGetInfoFromInviteQuery,
} = extendedApi;
