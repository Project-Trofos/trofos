import { createSlice } from '@reduxjs/toolkit';

export const themeSlice = createSlice({
  name: 'counter',
  initialState: {
    isDarkTheme: true,
  },
  reducers: {
    toggleTheme: (state) => {       
      state.isDarkTheme = !state.isDarkTheme;
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
