import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const policyApi = createApi({
  reducerPath: 'policyApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/policy' }),
  tagTypes: ['Policy'],
  endpoints: (builder) => ({
    // Get all policies (optional filter: policyType)
    getAllPolicies: builder.query({
      query: (params) => ({
        url: '/getAll',
        params,
      }),
      providesTags: ['Policy'],
    }),

    // Get policy by ID
    getPolicyById: builder.query({
      query: (id) => ({
        url: `/getById?id=${id}`,
      }),
      providesTags: ['Policy'],
    }),

    // Create policy
    createPolicy: builder.mutation({
      query: (policyData) => ({
        url: '/add',
        method: 'POST',
        body: policyData,
      }),
      invalidatesTags: ['Policy'],
    }),

    // Update policy
    updatePolicy: builder.mutation({
      query: ({ id, policyData }) => ({
        url: `/update?id=${id}`,
        method: 'PUT',
        body: policyData,
      }),
      invalidatesTags: ['Policy'],
    }),

    // Delete policy
    deletePolicy: builder.mutation({
      query: (id) => ({
        url: '/delete',
        method: 'DELETE',
        params: { id },
      }),
      invalidatesTags: ['Policy'],
    }),
  }),
});

export const {
  useGetAllPoliciesQuery,
  useGetPolicyByIdQuery,
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
  useDeletePolicyMutation,
} = policyApi;

