import trofosApiSlice from '.';
import { UserGuideQueryResponse } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    answerUserGuideQuery: builder.query<UserGuideQueryResponse, String>({
      query: (query) => ({
        url: `ai/userGuideQuery`,
        credentials: 'include',
        method: 'POST',
        body: { query },
      })
    })
  })
});

export const { useLazyAnswerUserGuideQueryQuery } = extendedApi;
