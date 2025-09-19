// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage for web
import userReducer from './userSlice';
import cartReducer from './cartSlice'; // Import cart slice

// Persist config for user slice
const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['user', 'isAuthenticated', 'isAdmin', 'loading', 'error', 'token'],
};

// Persist config for cart slice
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items', 'totalQuantity', 'totalPrice'], // Only persist these fields
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// Configure store
export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    cart: persistedCartReducer, // Add cart reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor for use in Provider
export const persistor = persistStore(store);