// store/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart or update quantity if already exists
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      if (existingItem) {
        // Check if adding the new quantity exceeds available stock
        if (existingItem.quantity + newItem.quantity <= newItem.maxQuantity) {
          existingItem.quantity += newItem.quantity;
        } else {
          // Set to maximum available quantity
          existingItem.quantity = newItem.maxQuantity;
        }
      } else {
        // Add new item to cart
        state.items.push({
          id: newItem.id,
          name: newItem.name,
          price: newItem.price,
          posterURL: newItem.posterURL,
          quantity: newItem.quantity,
          maxQuantity: newItem.maxQuantity || newItem.quantity,
        });
      }
      
      // Recalculate totals
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );
    },
    
    // Remove item from cart completely
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      
      // Recalculate totals
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );
    },
    
    // Update quantity of a specific item
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      
      if (existingItem) {
        // Ensure quantity is within valid range
        const validQuantity = Math.max(1, Math.min(quantity, existingItem.maxQuantity));
        existingItem.quantity = validQuantity;
        
        // Recalculate totals
        state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalPrice = state.items.reduce(
          (total, item) => total + (item.price * item.quantity), 
          0
        );
      }
    },
    
    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
  }
});

// Export actions
export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart
} = cartSlice.actions;

// Selector to get cart items
export const selectCartItems = (state) => state.cart.items;

// Selector to get cart totals
export const selectCartTotals = (state) => ({
  totalQuantity: state.cart.totalQuantity,
  totalPrice: state.cart.totalPrice
});

// Selector to get specific item
export const selectCartItemById = (state, id) => 
  state.cart.items.find(item => item.id === id);

// Selector to check if cart is empty
export const selectIsCartEmpty = (state) => state.cart.items.length === 0;

export default cartSlice.reducer;