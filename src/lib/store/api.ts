import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${window.location.origin}/api`,
  }),
  tagTypes: ["Chat", "User", "Request"],
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getMyChats: builder.query({
      query: () => ({
        url: "/chat/getMyChats",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Chat"],
    }),
    searchUser: builder.query({
      query: (name) => ({
        url: `/user/searchUser`,
        params: { name },
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["User"],
    }),
    getMyNotifications: builder.query({
      query: () => ({
        url: "/user/getMyNotifications",
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    getChatDetails: builder.query({
      query: ({ chatId, populate = false }) => ({
        url: `/chat/getChatDetails/${chatId}`,
        params: { populate },
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Chat"],
    }),
    getMessages: builder.query({
      query: ({ chatId, page = 1 }) => ({
        url: `/chat/getMessage/${chatId}`,
        params: { page },
        method: "GET",
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    getMyGroups: builder.query({
      query: () => ({
        url: "/chat/group",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Chat"],
    }),
    getAvailableFriends: builder.query({
      query: (chatId) => ({
        url: `/user/getAvailableFriends`,
        params: { chatId },
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Chat"],
    }),
    sendFriendRequest: builder.mutation({
      query: (userId) => ({
        url: `/user/sendFriendRequest`,
        body: { userId },
        method: "PUT",
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    acceptFriendRequest: builder.mutation({
      query: (data) => ({
        url: `/user/acceptFriendRequest`,
        body: data,
        method: "PUT",
        credentials: "include",
      }),
      invalidatesTags: ["Chat", "Request"],
    }),
    sendAttachments: builder.mutation({
      query: (data) => ({
        url: "/chat/sendAttachments",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    newGroup: builder.mutation({
      query: (data) => ({
        url: "/chat/newGroupChat",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Chat"],
    }),
    renameGroup: builder.mutation({
      query: ({ chatId, name }) => ({
        url: `/chat/${chatId}`,
        method: "PUT",
        body: { name },
        credentials: "include",
      }),
      invalidatesTags: ["Chat"],
    }),
    removeMember: builder.mutation({
      query: ({ chatId, memberId }) => ({
        url: `/chat/removeMember`,
        method: "PUT",
        body: { chatId, memberId },
        credentials: "include",
      }),
      invalidatesTags: ["Chat"],
    }),
    addGroupMembers: builder.mutation({
      query: ({ members, chatId }) => ({
        url: `/chat/addGroupMembers`,
        method: "PUT",
        body: { members, chatId },
        credentials: "include",
      }),
      invalidatesTags: ["Chat"],
    }),
    deleteChat: builder.mutation({
      query: (chatId) => ({
        url: `/chat/deleteChat/${chatId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Chat"],
    }),
    leaveGroup: builder.mutation({
      query: (chatId) => ({
        url: `/chat/leaveGroup`,
        method: "DELETE",
        body: { chatId },
        credentials: "include",
      }),
      invalidatesTags: ["Chat"],
    }),
    // getDashboardStats: builder.query({
    //   query: () => ({
    //     url: "/admin/getDashboardStats",
    //     method: "GET",
    //     credentials: "include",
    //   }),
    //   keepUnusedDataFor: 0,
    // }),
    // getUsersDashboardStats: builder.query({
    //   query: () => ({
    //     url: "/admin/getUsersDashboardStats",
    //     method: "GET",
    //     credentials: "include",
    //   }),
    //   keepUnusedDataFor: 0,
    // }),
    // getChatsDashboardStats: builder.query({
    //   query: () => ({
    //     url: "/admin/getChatsDashboardStats",
    //     method: "GET",
    //     credentials: "include",
    //   }),
    //   keepUnusedDataFor: 0,
    //   providesTags: ["Chat"],
    // }),
    // getMessagesDashboardStats: builder.query({
    //   query: () => ({
    //     url: "/admin/getMessagesDashboardStats",
    //     method: "GET",
    //     credentials: "include",
    //   }),
    //   keepUnusedDataFor: 0,
    //   providesTags: ["Chat"],
    // }),
  }),
});

export default api;

export const {
  useGetMyChatsQuery,
  useLazySearchUserQuery,
  useGetMyNotificationsQuery,
  useGetChatDetailsQuery,
  useGetMessagesQuery,
  useGetMyGroupsQuery,
  useGetAvailableFriendsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useSendAttachmentsMutation,
  useNewGroupMutation,
  useRenameGroupMutation,
  useRemoveMemberMutation,
  useAddGroupMembersMutation,
  useDeleteChatMutation,
  useLeaveGroupMutation,
} = api;
