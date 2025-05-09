import { createSlice } from "@reduxjs/toolkit";
import { adminLogin, adminLogout, getAdmin } from "./thunk.store";

const initialState = {
  user: null,
  isAdmin: false,
  loader: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userExists: (state, action) => {
      state.user = action.payload;
      state.loader = false;
    },
    userNotExists: (state) => {
      state.user = null;
      state.loader = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isAdmin = true;
        state.loader = false;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loader = false;
      })
      .addCase(getAdmin.fulfilled, (state, action) => {
        if (action.payload.admin) {
          state.isAdmin = true;
        }
        state.loader = false;
      })
      .addCase(getAdmin.rejected, (state, action) => {
        state.loader = false;
      })
      .addCase(adminLogout.fulfilled, (state, action) => {
        state.isAdmin = false;
        state.loader = false;
      })
      .addCase(adminLogout.rejected, (state, action) => {
        state.loader = false;
      });
  },
});

export default authSlice;

export const { userExists, userNotExists } = authSlice.actions;
