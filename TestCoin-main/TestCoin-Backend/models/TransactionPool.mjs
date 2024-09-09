import Transaction from './Transaction.mjs';

export default class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  setTransaction(transaction) {
    this.transactionMap[transaction._id] = transaction;
  }

  existingTransaction({ inputAddress }) {
    return Object.values(this.transactionMap).find(
      (transaction) => transaction.inputMap.address === inputAddress
    );
  }

  validTransactions() {
    return Object.values(this.transactionMap).filter((transaction) =>
      Transaction.validateTransaction(transaction)
    );
  }

  clear() {
    this.transactionMap = {};
  }

  clearBlockchainTransactions({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (this.transactionMap[transaction._id]) {
          delete this.transactionMap[transaction._id];
        }
      }
    }
  }

  getTransactionList() {
    return Object.values(this.transactionMap);
  }
}
