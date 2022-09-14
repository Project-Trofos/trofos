import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
const trofosApiSlice = createApi({
  reducerPath: 'trofosApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001' }),
  tagTypes: ['Project', 'UserInfo', 'Course', 'Backlog'],
  endpoints: () => ({}),
});

// Define a service using a base URL and expected endpoints
export const nusmodsApiSlice = createApi({
  reducerPath: 'nusmodsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.nusmods.com/v2/2022-2023' }),
  endpoints: () => ({}),
});

export default trofosApiSlice;


