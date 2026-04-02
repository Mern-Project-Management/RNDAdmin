import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const lifeAtRndCategoryApi = createApi({
  reducerPath: 'lifeAtRndCategoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/lifeAtRndCategory' }),
  tagTypes: ['LifeAtRndCategory'],
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: () => '/getAll',
      providesTags: ['LifeAtRndCategory'],
    }),
    getCategoryById: builder.query({
      query: (id) => ({
        url: '/getById',
        params: { id },
      }),
      providesTags: ['LifeAtRndCategory'],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: '/add',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LifeAtRndCategory'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update?id=${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LifeAtRndCategory'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: '/delete',
        method: 'DELETE',
        params: { id },
      }),
      invalidatesTags: ['LifeAtRndCategory'],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = lifeAtRndCategoryApi;
