import trofosApiSlice from '.';
import { UserGuideQueryResponse } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    answerUserGuideQuery: builder.mutation<
      UserGuideQueryResponse, 
      { query: string; isEnableMemory: boolean }
    >({
      query: ({ query, isEnableMemory }) => ({
        url: `ai/userGuideQuery`,
        credentials: 'include',
        method: 'POST',
        body: { query, isEnableMemory },
      })
    })
  })
});

export const { useAnswerUserGuideQueryMutation  } = extendedApi;
