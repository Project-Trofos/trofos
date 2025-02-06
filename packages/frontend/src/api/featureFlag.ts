import trofosApiSlice from '.';
import { FeatureFlag } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeatureFlags: builder.query<FeatureFlag[], void>({
      query: () => ({
        url: `/feature-flags`,
        credentials: 'include',
        method: 'GET',
      }),
      providesTags: ['FeatureFlag'],
    }),
    toggleFeatureFlag: builder.mutation<FeatureFlag, { featureName: string, active: boolean }>({
      query: ({ featureName, active }) => ({
        url: `/feature-flags/toggle`,
        credentials: 'include',
        method: 'POST',
        body: { featureName, active },
      }),
      invalidatesTags: ['FeatureFlag'],
    }),
  })
});

export const {
  useGetFeatureFlagsQuery,
  useToggleFeatureFlagMutation,
} = extendedApi;
