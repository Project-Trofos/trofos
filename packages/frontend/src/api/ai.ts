import trofosApiSlice from '.';
import { UserGuideQueryResponse, UserGuideRecommendation } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    answerUserGuideQuery: builder.mutation<UserGuideQueryResponse, { query: string; isEnableMemory: boolean }>({
      query: ({ query, isEnableMemory }) => ({
        url: `ai/userGuideQuery`,
        credentials: 'include',
        method: 'POST',
        body: { query, isEnableMemory },
      }),
    }),
    recommendUserGuideSections: builder.mutation<UserGuideRecommendation[], void>({
      query: () => ({
        url: `ai/recommendUserGuide`,
        method: 'POST',
        credentials: 'include',
      }),
    }),
  }),
});

export const { useAnswerUserGuideQueryMutation, useRecommendUserGuideSectionsMutation } = extendedApi;
