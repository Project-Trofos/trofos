import trofosApiSlice from '.';
import { UserGuideQueryResponse, UserGuideRecommendation } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    answerUserGuideQuery: builder.query<UserGuideQueryResponse, String>({
      query: (query) => ({
        url: `ai/userGuideQuery`,
        credentials: 'include',
        method: 'POST',
        body: { query },
      }),
    }),
    getUserGuideRecommendations: builder.query<UserGuideRecommendation[], void>({
      query: () => ({
        url: `ai/recommendUserGuide`,
        method: 'POST',
        credentials: 'include',
      }),
    }),
  }),
});

export const { useLazyAnswerUserGuideQueryQuery, useLazyGetUserGuideRecommendationsQuery } = extendedApi;
