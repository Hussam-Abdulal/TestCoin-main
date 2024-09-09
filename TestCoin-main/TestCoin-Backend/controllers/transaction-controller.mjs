import Transaction from '../models/Transaction.mjs';
import Wallet from '../models/Wallet.mjs';
import PubNubService from '../pubnubServer.mjs';
import { blockchain, transactionPool } from '../server.mjs';
import User from '../models/User.mjs';

// @desc    Get all transactions
// @route   GET /api/v1/transactions
// @access  Public
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new transaction
// @route   POST /api/v1/transactions/create
// @access  Private
export const createTransaction = async (req, res) => {
  const { recipient, amount } = req.body;
  const user = await User.findById(req.user.id).select('wallet');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (!user.wallet) {
    return res
      .status(400)
      .json({ success: false, message: 'User does not have a wallet' });
  }

  try {
    const senderWallet = new Wallet(user);

    senderWallet.balance = Wallet.calculateBalance({
      blockchain,
      transactionPool,
      address: senderWallet.publicKey,
    });

    const transaction = senderWallet.createTransaction({
      recipient,
      amount,
      blockchain,
      transactionPool,
    });

    user.wallet.balance = senderWallet.balance - amount;
    await user.save();

    await transaction.save();

    transactionPool.setTransaction(transaction);
    PubNubService.publishToChannel('TRANSACTION', transaction);

    res.status(201).json({
      success: true,
      message: 'Transaction created and added to the transaction pool',
      data: transaction,
    });
  } catch (error) {
    throw new Error(`Error creating transaction: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};
