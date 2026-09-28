import trofosApiSlice from '.';
import { CourseAutofillResponse, UserGuideQueryResponse, UserGuideRecommendation } from './types';

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
    autofillCourse: builder.mutation<CourseAutofillResponse, { text: string }>({
      query: ({ text }) => ({
        url: `ai/courseAutofill`,
        credentials: 'include',
        method: 'POST',
        body: { text },
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

export const { useAnswerUserGuideQueryMutation, useRecommendUserGuideSectionsMutation, useAutofillCourseMutation } =
  extendedApi;
