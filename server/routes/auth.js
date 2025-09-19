import express from 'express';
import { registerController, loginController, registerAdmin, getCurrentUser } from '../controllers/auth.js';
import { authenticateToken } from '../middlewares/auth.js';

const AuthRouter = express.Router();

AuthRouter.post('/register', registerController);
AuthRouter.post('/login', loginController);
AuthRouter.post('/register-admin', registerAdmin);
AuthRouter.get('/me', authenticateToken, getCurrentUser); 

export default AuthRouter;