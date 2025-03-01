import { createSlice, PayloadAction } from '@reduxjs/toolkit';

let isDarkTheme = localStorage.getItem('isDarkTheme');
if (isDarkTheme === null) {
  localStorage.setItem('isDarkTheme', 'false');
  isDarkTheme = 'false';
}

const storedSeenSprintData = localStorage.getItem('seen_retrospective_insights');
const seenSprints: Record<string, boolean> = storedSeenSprintData ? JSON.parse(storedSeenSprintData) : {};

export const themeSlice = createSlice({
  name: 'localSettings',
  initialState: {
    isDarkTheme: isDarkTheme === 'true' ? true : false,
    seenRetrospectiveInsights: seenSprints as Record<string, boolean>,
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDarkTheme = !state.isDarkTheme;
    },
    markSprintAsSeen: (state, action: PayloadAction<string>) => {
      const sprintId = action.payload;
      const updatedSeenSprints = { ...state.seenRetrospectiveInsights, [sprintId]: true };
      state.seenRetrospectiveInsights = updatedSeenSprints;      
    },
  },
});

export const { toggleTheme, markSprintAsSeen } = themeSlice.actions;

export const selectSeenRetrospectiveInsights = (state: { localSettings: { seenRetrospectiveInsights: Record<string, boolean> } }) => 
  state.localSettings.seenRetrospectiveInsights;

export default themeSlice.reducer;
