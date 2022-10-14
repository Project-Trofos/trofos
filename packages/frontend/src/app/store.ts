import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import trofosApiSlice, { nusmodsApiSlice } from '../api';

const store = configureStore({
  reducer: {
    [trofosApiSlice.reducerPath]: trofosApiSlice.reducer,
    [nusmodsApiSlice.reducerPath]: nusmodsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(trofosApiSlice.middleware).concat(nusmodsApiSlice.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
