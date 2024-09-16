import trofosApiSlice from '.';
import { UserApiKey } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserApiKey: builder.query<UserApiKey, void>({
      query: () => ({
        url: 'api-key/me',
        credentials: 'include',
      }),
      providesTags: ['UserApiKey'],
    }),
    generateUserApiKey: builder.mutation<UserApiKey, void>({
      query: () => ({
        url: 'api-key/generate',
        method: 'POST',
        credentials: 'include',
      }),
      invalidatesTags: ['UserApiKey'],
    }),
  }),
});

export const { useGetUserApiKeyQuery, useGenerateUserApiKeyMutation } = extendedApi;
