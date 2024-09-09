import { blockchain, miner, transactionPool } from '../server.mjs';
import PubNubService from '../pubnubServer.mjs';
import Block from '../models/Block.mjs';
import User from '../models/User.mjs';

export const getBlockchain = async (req, res) => {
  try {
    const blocks = await Block.find().sort({ index: 1 });
    res.status(200).json({
      success: true,
      data: blocks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const mineBlock = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet');

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (!user.wallet) {
      return res
        .status(400)
        .json({ success: false, message: 'User does not have a wallet' });
    }

    const { success, block, message } = await miner.mineTransactions(user);

    if (success) {
      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

      PubNubService.publishToChannel('BLOCKCHAIN', block);
      res.status(201).json({
        success: true,
        data: block,
      });
    } else {
      res.status(400).json({
        success: false,
        message,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
