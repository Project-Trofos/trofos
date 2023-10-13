import { createSlice } from '@reduxjs/toolkit';

let isDarkTheme = localStorage.getItem('isDarkTheme');
if (isDarkTheme === null) {
  localStorage.setItem('isDarkTheme', 'false');
  isDarkTheme = 'false';
}

export const themeSlice = createSlice({
  name: 'counter',
  initialState: {
    isDarkTheme: isDarkTheme === 'true' ? true : false,
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDarkTheme = !state.isDarkTheme;
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
