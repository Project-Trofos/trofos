import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
const trofosApiSlice = createApi({
  reducerPath: 'trofosApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001' }),
  tagTypes: ['Project', 'Course'],
  endpoints: () => ({}),
});

export default trofosApiSlice;