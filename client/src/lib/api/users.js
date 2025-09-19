// lib/api/users.js
import { api } from "./auth";

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

// Promote user to admin
export const promoteUserToAdmin = async (id) => {
  try {
    const response = await api.put(`/api/users/${id}/promote`);
    return response.data;
  } catch (error) {
    console.error('Failed to promote user:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
};