// src/store/app.slice.js
import { createSlice } from "@reduxjs/toolkit";

// Utility function to get and set in localStorage
const loadFromLocalStorage = (key) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Could not load from localStorage", error);
    return undefined;
  }
};

const saveToLocalStorage = (key, state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (error) {
    console.error("Could not save to localStorage", error);
  }
};

// Define initial state, loading persisted data if it exists
const initialState = {
  selectedGroup: loadFromLocalStorage("selectedGroup") || "",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
      saveToLocalStorage("selectedGroup", state.selectedGroup);
    },
  },
});

// Export actions
export const { setSelectedGroup } = appSlice.actions;

// Export the reducer to be included in the store
export default appSlice.reducer;
