import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Authentication state
  user: null,                    // User object { id, fullName, email, role }
  token: null,                   // JWT token for API calls
  isAuthenticated: false,        // Boolean: logged in or not
  
  // UI state
  loading: false,                // Show loading spinner
  error: null,                   // API error messages
  
  // Role-based access
  isAdmin: false,                // Derived from user.role === 'admin'
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set user credentials (login/register success)
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isAdmin = user.role === 'admin';
      state.loading = false;
      state.error = null;
    },
    
    // Update user info (e.g., profile update)
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      state.error = null;
    },
    
    // Start loading (before API calls)
    setLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null; // Clear error on new request
      }
    },
    
    // Set error message
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Logout/clear user
    removeUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.loading = false;
      state.error = null;
    },
    
    // Clear error only
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Selectors for use in components
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
  removeUser, 
  clearError 
} = userSlice.actions;

export default userSlice.reducer;