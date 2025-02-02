// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./app.slice";

const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

export default store;
