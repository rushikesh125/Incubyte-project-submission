import { api } from "./auth";

// Add sweet with image URL
export const createSweet = async (sweetData) => {
  try {
    const response = await api.post('/api/sweets', sweetData);
    return response.data;
  } catch (error) {
    console.error('Failed to create sweet:', error);
    throw error;
  }
};

// Update existing sweet
export const updateSweet = async (id, sweetData) => {
  try {
    const response = await api.put(`/api/sweets/${id}`, sweetData);
    return response.data;
  } catch (error) {
    console.error('Failed to update sweet:', error);
    throw error;
  }
};