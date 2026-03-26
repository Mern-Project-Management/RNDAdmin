import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const serviceApi = createApi({
  reducerPath: 'serviceApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/services' }),
  endpoints: (builder) => ({
    getAllServiceCategories: builder.query({
      query: () => '/getall',
    }),
    getActiveServiceCategories: builder.query({
      query: () => '/getactive',
    }),
  }),
});

export const { useGetAllServiceCategoriesQuery, useGetActiveServiceCategoriesQuery } = serviceApi;
