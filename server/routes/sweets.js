import express from 'express';
import { 
  getAllSweets, 
  searchSweets, 
  createSweet, 
  updateSweet, 
  deleteSweet 
} from '../controllers/sweets.js';
import { authenticateToken, authorizeAdmin } from '../middlewares/auth.js';

const sweetsRouter = express.Router();

// Apply authentication to all sweets routes
sweetsRouter.use(authenticateToken);

// READ operations (Normal User)
sweetsRouter.get('/', getAllSweets);
sweetsRouter.get('/search', searchSweets);

// Admin-only operations
sweetsRouter.post('/', authorizeAdmin, createSweet);
sweetsRouter.put('/:id', authorizeAdmin, updateSweet);
sweetsRouter.delete('/:id', authorizeAdmin, deleteSweet);

export default sweetsRouter;