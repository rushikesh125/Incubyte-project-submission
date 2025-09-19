import { api } from "./auth";

// Create a new transaction
export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/api/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Failed to create transaction:', error);
    throw error;
  }
};
// Get user transactions
export const getUserTransactions = async () => {
  try {
    const response = await api.get('/api/transactions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
};

export const getAllTransactions = async () => {
  try {
    const response = await api.get('/api/transactions/all');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all transactions:', error);
    throw error;
  }
};