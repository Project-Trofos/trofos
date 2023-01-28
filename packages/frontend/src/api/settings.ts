import trofosApiSlice from '.';
import { Settings } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<Settings, void>({
      query: () => ({
        url: 'settings/',
        credentials: 'include',
      }),
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<void, Settings>({
      query: (settings) => ({
        url: 'settings/',
        method: 'POST',
        body: {
          settings,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = extendedApi;
