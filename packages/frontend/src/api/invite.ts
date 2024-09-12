import trofosApiSlice from '.';

// Invite management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendProjectInvitation: builder.mutation<
      void,
      { projectId: number; senderName: string; senderEmail: string; destEmail: string; isRegister: boolean }
    >({
      query: ({ projectId, senderName, senderEmail, destEmail, isRegister }) => ({
        url: `invite/project/${projectId}`,
        method: 'POST',
        body: {
          senderName,
          senderEmail,
          destEmail,
          isRegister,
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
  }),
  overrideExisting: false,
});

export const { useSendProjectInvitationMutation, useProcessProjectInvitationMutation } = extendedApi;
