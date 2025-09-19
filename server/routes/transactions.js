import express from "express";
import { createTransaction, getUserTransactions } from "../controllers/transaction.js";
import {authenticateToken} from "../middlewares/auth.js"
const transactionsRouter = express.Router();

transactionsRouter.use(authenticateToken);

transactionsRouter.post('/', createTransaction);
transactionsRouter.get('/', getUserTransactions);

export default transactionsRouter;