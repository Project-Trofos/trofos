import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import trofosApiSlice, { nusmodsApiSlice } from '../api';
import themeSlice, { toggleTheme } from './themeSlice';

const store = configureStore({
  reducer: {
    [trofosApiSlice.reducerPath]: trofosApiSlice.reducer,
    [nusmodsApiSlice.reducerPath]: nusmodsApiSlice.reducer,
    themeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(trofosApiSlice.middleware).concat(nusmodsApiSlice.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// update isDarkTheme on change
store.subscribe(() => {
  localStorage.setItem('isDarkTheme', store.getState().themeSlice.isDarkTheme ? 'true' : 'false');
});

export default store;
