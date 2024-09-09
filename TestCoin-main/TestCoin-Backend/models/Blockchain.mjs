import Block from './Block.mjs';
import TransactionPool from './TransactionPool.mjs';
import { generateHash } from '../utils/cipherHash.mjs';

export default class Blockchain {
  constructor() {
    this.chain = [];
    this.transactionPool = new TransactionPool();
    this.pendingTransactions = [];
  }

  async initialize() {
    const genesisBlock = await this.getOrCreateGenesisBlock();
    this.chain.push(genesisBlock);
  }

  async getOrCreateGenesisBlock() {
    const existingGenesis = await Block.findOne({ index: 0 });
    if (existingGenesis) {
      return existingGenesis;
    }

    const genesisBlockData = {
      index: 0,
      previousHash: '0',
      timestamp: Date.now(),
      data: ['Genesis Block'],
      nonce: 0,
      difficulty: +process.env.DIFFICULTY,
      hash: '',
    };

    genesisBlockData.hash = generateHash(
      genesisBlockData.index,
      genesisBlockData.previousHash,
      genesisBlockData.timestamp,
      JSON.stringify(genesisBlockData.data),
      genesisBlockData.nonce,
      genesisBlockData.difficulty
    );

    const genesisBlock = new Block(genesisBlockData);
    await genesisBlock.save();
    return genesisBlock;
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  proofOfWork(previousHash, data) {
    const latestBlock = this.getLastBlock();
    let difficulty, hash, timestamp;
    let nonce = 1024;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = this.difficultyAdjustment(latestBlock, timestamp);

      hash = generateHash(
        latestBlock.index + 1,
        previousHash,
        timestamp,
        JSON.stringify(data),
        nonce,
        difficulty
      );
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    return { nonce, difficulty, timestamp, hash };
  }

  difficultyAdjustment(latestBlock, timestamp) {
    const MINE_RATE = +process.env.MINE_RATE;
    let { difficulty } = latestBlock;
    const timeTaken = timestamp - latestBlock.timestamp;

    if (difficulty < 1) return 1;

    return timeTaken > MINE_RATE ? difficulty + 1 : difficulty - 1;
  }

  async addBlock(transactions) {
    const lastBlock = this.getLastBlock();
    const { nonce, difficulty, timestamp, hash } = this.proofOfWork(
      lastBlock.hash,
      transactions
    );

    const newBlockData = {
      index: lastBlock.index + 1,
      previousHash: lastBlock.hash,
      timestamp,
      data: transactions,
      nonce,
      difficulty,
      hash,
    };

    const newBlock = new Block(newBlockData);

    const newChain = [...this.chain, newBlock];
    if (!this.validateChain(newChain)) {
      throw new Error('Invalid chain');
    }

    await newBlock.save();
    this.chain.push(newBlock);
    return newBlock;
  }

  async saveTransactions(transactions) {
    const transactionIds = [];
    for (const tx of transactions) {
      const transaction = new Transaction(tx);
      await transaction.save();
      transactionIds.push(transaction._id);
    }
    return transactionIds;
  }

  minePendingTransactions() {
    const validTransactions = this.transactionPool.validTransactions();

    if (validTransactions.length === 0) {
      throw new Error('No valid transactions to mine');
    }

    const rewardTransaction = this.createRewardTransaction();
    validTransactions.push(rewardTransaction);

    const block = this.addBlock(validTransactions);
    this.transactionPool.clear();
    return block;
  }

  addTransaction(transaction) {
    if (!transaction.validateTransaction(transaction)) {
      throw new Error('Invalid transaction');
    }

    this.transactionPool.setTransaction(transaction);
  }

  syncChains(newChain) {
    if (newChain.length < this.chain.length) {
      throw new Error('Received chain is not longer than current chain');
    }

    if (!this.validateChain(newChain)) {
      throw new Error('Received chain is invalid');
    }

    this.chain = newChain;
    this.transactionPool.clearBlockchainTransactions({ chain: newChain });
  }

  validateChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(this.chain[0])) {
      return false;
    }

    for (let i = 1; i < chain.length; i++) {
      const { index, previousHash, timestamp, data, nonce, difficulty, hash } =
        chain[i];
      const actualLastHash = chain[i - 1].hash;

      if (previousHash !== actualLastHash) {
        return false;
      }

      const validatedHash = generateHash(
        index,
        previousHash,
        timestamp,
        JSON.stringify(data),
        nonce,
        difficulty
      );

      if (hash !== validatedHash) {
        return false;
      }
    }

    return true;
  }
}
