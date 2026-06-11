import trofosApiSlice from '.';
import { UserGuideQueryResponse, UserGuideRecommendation } from './types';
import type { ParseWorkItemResponse, WorkItemContext, WorkItemType } from '../helpers/aiItemCreation.types';

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
    parseWorkItem: builder.mutation<
      ParseWorkItemResponse,
      { itemType: WorkItemType; message: string; projectId: number; context?: WorkItemContext }
    >({
      query: (body) => ({
        url: 'ai/parseWorkItem',
        method: 'POST',
        credentials: 'include',
        body,
      }),
    }),
  }),
});

export const {
  useAnswerUserGuideQueryMutation,
  useRecommendUserGuideSectionsMutation,
  useParseWorkItemMutation,
} = extendedApi;
