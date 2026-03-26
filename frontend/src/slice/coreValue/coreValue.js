import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const coreValueApi = createApi({
  reducerPath: 'coreValueApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/coreValue' }),
  tagTypes: ['CoreValue'],
  endpoints: (builder) => ({
    // Get all coreValues
    getAllCoreValues: builder.query({
      query: () => '/getAll',
      providesTags: ['CoreValue'],
    }),

    // Get coreValue by ID
    getCoreValueById: builder.query({
      query: (id) => ({
        url: '/get',
        params: { id },
      }),
      providesTags: ['CoreValue'],
    }),

    // Get coreValue by pageSlug
    getCoreValueByPageSlug: builder.query({
      query: (pageSlug) => ({
        url: '/getByPageSlug',
        params: { pageSlug },
      }),
      providesTags: ['CoreValue'],
    }),
    // Create new coreValue
    createCoreValue: builder.mutation({
      query: (coreValueData) => ({
        url: '/add',
        method: 'POST',
        body: coreValueData,
      }),
      invalidatesTags: ['CoreValue'],
    }),

    // Update coreValue
    updateCoreValue: builder.mutation({
      query: ({id,coreValueData}) => ({
        url: `/update?id=${id}`,
        method: 'PUT',
        body: coreValueData,
      }),
      invalidatesTags: ['CoreValue'],
    }),

    // Delete coreValue
    deleteCoreValue: builder.mutation({
      query: (id) => ({
        url: '/delete',
        method: 'DELETE',
        params: { id },
      }),
      invalidatesTags: ['CoreValue'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetAllCoreValuesQuery,
  useGetCoreValueByIdQuery,
  useGetCoreValueByPageSlugQuery,
  useCreateCoreValueMutation,
  useUpdateCoreValueMutation,
  useDeleteCoreValueMutation,
} = coreValueApi;
