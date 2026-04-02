import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const lifeAtRndGalleryApi = createApi({
  reducerPath: 'lifeAtRndGalleryApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/lifeAtRndGallery' }),
  tagTypes: ['LifeAtRndGallery'],
  endpoints: (builder) => ({
    getAllGalleryItems: builder.query({
      query: () => '/getAll',
      providesTags: ['LifeAtRndGallery'],
    }),
    getGalleryById: builder.query({
      query: (id) => ({
        url: '/getById',
        params: { id },
      }),
      providesTags: ['LifeAtRndGallery'],
    }),
    getGalleryByCategoryId: builder.query({
      query: (categoryId) => ({
        url: '/getByCategory',
        params: { category_id: categoryId },
      }),
      providesTags: ['LifeAtRndGallery'],
    }),
    createGalleryItem: builder.mutation({
      query: (formData) => ({
        url: '/add',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['LifeAtRndGallery'],
    }),
    updateGalleryItem: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/update?id=${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['LifeAtRndGallery'],
    }),
    deleteGalleryItem: builder.mutation({
      query: (id) => ({
        url: '/delete',
        method: 'DELETE',
        params: { id },
      }),
      invalidatesTags: ['LifeAtRndGallery'],
    }),
  }),
});

export const {
  useGetAllGalleryItemsQuery,
  useGetGalleryByIdQuery,
  useGetGalleryByCategoryIdQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
} = lifeAtRndGalleryApi;
