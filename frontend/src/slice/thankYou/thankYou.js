import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const thankYouApi = createApi({
  reducerPath: 'thankYouApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/thank-you' }),
  tagTypes: ['ThankYou'],
  endpoints: (builder) => ({
    getThankYou: builder.query({
      query: () => '/get',
      providesTags: ['ThankYou'],
    }),
    updateThankYou: builder.mutation({
      query: (formData) => ({
        url: '/update',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['ThankYou'],
    }),
  }),
});

export const {
  useGetThankYouQuery,
  useUpdateThankYouMutation,
} = thankYouApi;
