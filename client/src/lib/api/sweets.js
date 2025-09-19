// lib/api/sweets.js (updated with getAllSweets)
import { api } from "./auth";

// Get all sweets
export const getAllSweets = async () => {
  try {
    const response = await api.get('/api/sweets');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sweets:', error);
    throw error;
  }
};
export const getSweetById = async (id) => {
  try {
    const response = await api.get(`/api/sweets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sweets:', error);
    throw error;
  }
};



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

// Delete sweet
export const deleteSweet = async (id) => {
  try {
    const response = await api.delete(`/api/sweets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete sweet:', error);
    throw error;
  }
};