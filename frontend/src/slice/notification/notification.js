import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/notification' }),
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    getTodayNotifications: builder.query({
      query: () => '/getToday',
      providesTags: ['Notifications'],
    }),
    markAsRead: builder.mutation({
      query: ({ id, type }) => ({
        url: '/markAsRead',
        method: 'PUT',
        body: { id, type },
      }),
      invalidatesTags: ['Notifications'],
    }),
    deleteNotification: builder.mutation({
      query: ({ id, type }) => ({
        url: '/delete',
        method: 'POST',
        body: { id, type },
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetTodayNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
