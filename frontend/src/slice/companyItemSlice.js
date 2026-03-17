import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const companyItemApi = createApi({
    reducerPath: 'companyItemApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['CompanyItem'],
    endpoints: (builder) => ({
        // Get all company items
        getAllCompanyItems: builder.query({
            query: () => ({
                url: '/companyItem/getAll',
                method: 'GET'
            }),
            providesTags: ['CompanyItem']
        }),

        // Get company item by ID
        getCompanyItemById: builder.query({
            query: (id) => ({
                url: `/companyItem/get?id=${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'CompanyItem', id }]
        }),

        // Create new company item
        createCompanyItem: builder.mutation({
            query: (newItem) => ({
                url: '/companyItem/add',
                method: 'POST',
                body: newItem
            }),
            invalidatesTags: ['CompanyItem']
        }),

        // Update company item
        updateCompanyItem: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/companyItem/update?id=${id}`,
                method: 'PUT',
                body: formData
            }),
            invalidatesTags: ['CompanyItem']
        }),

        // Delete company item
        deleteCompanyItem: builder.mutation({
            query: (id) => ({
                url: `/companyItem/delete?id=${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['CompanyItem']
        })
    })
});

export const {
    useGetAllCompanyItemsQuery,
    useGetCompanyItemByIdQuery,
    useCreateCompanyItemMutation,
    useUpdateCompanyItemMutation,
    useDeleteCompanyItemMutation
} = companyItemApi;

export default companyItemApi;
