import axios from 'axios';
import { store } from '@/store/store';
import { logout } from '@/store/userSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token from Redux store
api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.user?.token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor - handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      store.dispatch(logout());
      localStorage.removeItem('persist:root'); // Clear persisted state
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const logoutUser = () => {
  store.dispatch(logout());
  localStorage.removeItem('persist:root');
  api.defaults.headers.Authorization = null;
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token invalid - logout
      logoutUser();
      throw new Error('Session expired');
    }
    throw error;
  }
};

export const validateToken = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data; // Returns { user: { id, fullName, email, role } }
  } catch (error) {
    // Token invalid/expired - let caller handle logout
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Token invalid');
    }
    throw error;
  }
};