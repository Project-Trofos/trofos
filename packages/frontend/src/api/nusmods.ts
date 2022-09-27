import { nusmodsApiSlice } from '.';

export type Module = {
  moduleCode: string;
  title: string;
  semesters: number[];
};

// Project management APIs
const extendedApi = nusmodsApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllModules: builder.query<Module[], void>({
      query: () => '/moduleList.json',
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllModulesQuery } = extendedApi;
