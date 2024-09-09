import express from 'express';
import {
  getBlockchain,
  mineBlock,
} from '../controllers/blockchain-controller.mjs';
import { protect } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.get('/', getBlockchain);
router.post('/mine', protect, mineBlock);

export default router;
