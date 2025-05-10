import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./auth.reducer";
import miscSlice from "./misc.reducer";
import chatSlice from "./chat.reducer";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [authSlice.name]: authSlice.reducer,
      [miscSlice.name]: miscSlice.reducer,
      [chatSlice.name]: chatSlice.reducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
