import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isAdmin = user.role === 'admin';
      state.loading = false;
      state.error = null;
    },
    
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      state.error = null;
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.loading = false;
      state.error = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Fixed rehydration logic - correctly merge persisted state and derive fields
userSlice.reducer.rehydrate = (state, action) => {
  const persistedState = action.payload?.user; // Access persisted slice at state.user
  if (persistedState) {
    return {
      ...state, // Keep initialState base
      ...persistedState, // Merge ALL persisted properties (user, token, etc.)
      // Re-derive fields based on merged state
      isAuthenticated: !!persistedState.token, // Check if token exists
      isAdmin: persistedState.user?.role === 'admin', // Single 'user', not double
    };
  }
  return state;
};

export const selectUser = (state) => state.user.user;
export const selectToken = (state) => state.user.token;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectIsAdmin = (state) => state.user.isAdmin;
export const selectLoading = (state) => state.user.loading;
export const selectError = (state) => state.user.error;

export const { 
  setUser, 
  updateUser, 
  setLoading, 
  setError, 
  logout, 
  clearError 
} = userSlice.actions;

export default userSlice.reducer;