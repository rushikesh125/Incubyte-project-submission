import express from 'express';
import { registerController, loginController, registerAdmin } from '../controllers/auth.js';

const AuthRouter = express.Router();

AuthRouter.post('/register', registerController);
AuthRouter.post('/login', loginController);
AuthRouter.post('/register-admin', registerAdmin);

export default AuthRouter;