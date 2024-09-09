import Transaction from './Transaction.mjs';
import PubNubService from '../pubnubServer.mjs';

export default class Miner {
  constructor({ blockchain, transactionPool }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
  }

  async mineTransactions(user) {
    const validTransactions = this.transactionPool.validTransactions();

    if (validTransactions.length === 0) {
      return { success: false, message: 'No valid transactions to mine' };
    }

    const rewardTransaction = this.createRewardTransaction(user.wallet);
    validTransactions.push(rewardTransaction);

    const block = await this.blockchain.addBlock(validTransactions);

    await block.save();

    PubNubService.publishToChannel('BLOCKCHAIN', block);

    this.transactionPool.clearBlockchainTransactions({
      chain: this.blockchain.chain,
    });

    return { success: true, block };
  }

  createRewardTransaction(wallet) {
    const rewardTransaction = new Transaction({
      sender: 'MINER_REWARD',
      recipient: wallet.publicKey,
      amount: 50,
    });

    return rewardTransaction;
  }
}
