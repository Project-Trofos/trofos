import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
const trofosApiSlice = createApi({
  reducerPath: 'trofosApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NODE_ENV === 'test' ? 'http://localhost:3001/api' : '/api',
    prepareHeaders: (headers) => {
      headers.set('Cache-control', 'no-cache');
      return headers;
    },
  }),
  tagTypes: [
    'Project',
    'UserInfo',
    'Course',
    'Backlog',
    'BacklogHistory',
    'User',
    'Sprint',
    'ActionsOnRoles',
    'CourseRoles',
    'ProjectRoles',
    'Settings',
    'StandUpHeader',
    'StandUp',
    'Retrospective',
    'ProjectUserSettings',
    'Feedback',
  ],
  endpoints: () => ({}),
});

// Define a service using a base URL and expected endpoints
export const nusmodsApiSlice = createApi({
  reducerPath: 'nusmodsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.nusmods.com/v2/2022-2023' }),
  endpoints: () => ({}),
});

export default trofosApiSlice;
