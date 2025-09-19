// routes/users.js
import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middlewares/auth.js';
import { deleteUser, getAllUsers, promoteToAdmin } from '../controllers/user.js';


const usersRouter = express.Router();

// Apply authentication and admin authorization to all routes
usersRouter.use(authenticateToken, authorizeAdmin);

usersRouter.get('/', getAllUsers);
usersRouter.put('/:id/promote', promoteToAdmin);
usersRouter.delete('/:id', deleteUser);

export default usersRouter;