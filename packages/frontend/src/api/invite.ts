import trofosApiSlice from '.';

// Invite management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendProjectInvitation: builder.mutation<
      void,
      { projectId: number; senderName: string; senderEmail: string; destEmail: string }
    >({
      query: ({ projectId, senderName, senderEmail, destEmail }) => ({
        url: `invite/project/${projectId}`,
        method: 'POST',
        body: {
          senderName,
          senderEmail,
          destEmail,
        },
        credentials: 'include',
      }),
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

export const { useSendProjectInvitationMutation, useProcessProjectInvitationMutation, useGetInfoFromInviteMutation } =
  extendedApi;
