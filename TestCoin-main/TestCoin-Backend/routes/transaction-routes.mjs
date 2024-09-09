import express from 'express';
import {
  getTransactions,
  createTransaction,
} from '../controllers/transaction-controller.mjs';
import { protect } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.route('/').get(getTransactions);
router.route('/create').post(protect, createTransaction);

export default router;
