import trofosApiSlice from '.';
import { FeatureFlag } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeatureFlags: builder.query<FeatureFlag[], void>({
      query: () => ({
        url: `/feature-flags`,
        credentials: 'include',
        method: 'GET',
      })
    })
  })
});

export const { useGetFeatureFlagsQuery } = extendedApi;
