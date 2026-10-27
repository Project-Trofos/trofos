import trofosApiSlice from '.';
import { CourseAutofillResponse, SprintAutofillResponse, UserGuideQueryResponse, UserGuideRecommendation } from './types';

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
    autofillSprint: builder.mutation<SprintAutofillResponse, { text: string }>({
      query: ({ text }) => ({
        url: `ai/sprintAutofill`,
        credentials: 'include',
        method: 'POST',
        body: { text },
      }),
    }),
  }),
});

export const {
  useAnswerUserGuideQueryMutation,
  useRecommendUserGuideSectionsMutation,
  useAutofillCourseMutation,
  useAutofillSprintMutation,
} = extendedApi;
