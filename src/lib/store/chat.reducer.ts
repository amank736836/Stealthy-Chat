"use client";
import { NEW_MESSAGE_ALERT } from "@/app/constants/events";
import { useGetOrSaveFromStorage } from "@/hooks/hook";
import { createSlice } from "@reduxjs/toolkit";

export interface NewMessageAlert {
  chatId: string;
  count: number;
}

interface ChatState {
  notificationCount: number;
  newMessagesAlert: NewMessageAlert[];
}

const initialState: ChatState = {
  notificationCount: 0,
  newMessagesAlert: useGetOrSaveFromStorage({
    key: NEW_MESSAGE_ALERT,
    value: [],
    get: true,
  }) || [
    {
      chatId: "",
      count: 0,
    },
  ],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    incrementNotificationCount: (state) => {
      state.notificationCount += 1;
    },
    resetNotificationCount: (state) => {
      state.notificationCount = 0;
    },
    setNewMessagesAlert: (state, action) => {
      const { chatId } = action.payload;

      const newMessagesAlert: NewMessageAlert | undefined =
        state.newMessagesAlert.find(
          (alert: NewMessageAlert) => alert.chatId === chatId
        );
      if (newMessagesAlert) {
        newMessagesAlert.count += 1;
      } else {
        state.newMessagesAlert.push({
          chatId,
          count: 1,
        });
      }
    },
    removeNewMessagesAlert: (state, action) => {
      const chatId = action.payload;
      state.newMessagesAlert = state.newMessagesAlert.filter(
        (alert: NewMessageAlert) => alert.chatId !== chatId
      );
    },
  },
});

export default chatSlice;

export const {
  incrementNotificationCount,
  resetNotificationCount,
  setNewMessagesAlert,
  removeNewMessagesAlert,
} = chatSlice.actions;
