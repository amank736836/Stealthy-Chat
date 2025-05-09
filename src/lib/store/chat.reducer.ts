import { createSlice } from "@reduxjs/toolkit";
import { NEW_MESSAGE_ALERT } from "@/app/constants/events";
import { getOrSaveFromStorage } from "../features";

interface NewMessageAlert {
  chatId: string;
  count: number;
}

const initialState = {
  notificationCount: 0,
  newMessagesAlert: getOrSaveFromStorage({
    key: NEW_MESSAGE_ALERT,
    get: true,
    value: [],
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

      const newMessagesAlert: NewMessageAlert | undefined = state.newMessagesAlert.find(
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
