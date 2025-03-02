import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import trofosApiSlice, { nusmodsApiSlice } from '../api';
import localSettingsSlice, { toggleTheme, markSprintAsSeen } from './localSettingsSlice';

const darkThemeMiddleware = createListenerMiddleware();
darkThemeMiddleware.startListening({
  actionCreator: toggleTheme,
  effect: (_, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const isDarkTheme = state.localSettingsSlice.isDarkTheme;
    localStorage.setItem('isDarkTheme', isDarkTheme ? 'true' : 'false');
  },
});

const markSprintAsSeenMiddleware = createListenerMiddleware();
markSprintAsSeenMiddleware.startListening({
  actionCreator: markSprintAsSeen,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const sprintId = action.payload;
    const updatedSeenSprints = { ...state.localSettingsSlice.seenRetrospectiveInsights, [sprintId]: true };
    localStorage.setItem('seen_retrospective_insights', JSON.stringify(updatedSeenSprints));  },
});

const store = configureStore({
  reducer: {
    [trofosApiSlice.reducerPath]: trofosApiSlice.reducer,
    [nusmodsApiSlice.reducerPath]: nusmodsApiSlice.reducer,
    localSettingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(trofosApiSlice.middleware)
      .concat(nusmodsApiSlice.middleware)
      .prepend(darkThemeMiddleware.middleware)
      .prepend(markSprintAsSeenMiddleware.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
