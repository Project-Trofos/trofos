import { createSlice } from '@reduxjs/toolkit';

export const themeSlice = createSlice({
  name: 'counter',
  initialState: {
    isDarkTheme: true,
  },
  reducers: {
    toggle: (state) => {
      state.isDarkTheme = !state.isDarkTheme;
    },
  },
});

export const { toggle } = themeSlice.actions;

export default themeSlice.reducer;
