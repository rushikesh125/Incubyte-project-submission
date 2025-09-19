import express from "express";
import { createTransaction, getAllTransactions, getUserTransactions } from "../controllers/transaction.js";
import {authenticateToken, authorizeAdmin} from "../middlewares/auth.js"
const transactionsRouter = express.Router();

transactionsRouter.use(authenticateToken);

transactionsRouter.post('/', createTransaction);
transactionsRouter.get('/', getUserTransactions);
transactionsRouter.get('/all', authenticateToken, authorizeAdmin, getAllTransactions);

export default transactionsRouter;