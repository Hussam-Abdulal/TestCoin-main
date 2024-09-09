import { createEllipticHash, generateHash } from '../utils/cipherHash.mjs';
import Transaction from './Transaction.mjs';

export default class Wallet {
  constructor(user = null) {
    if (user && user.wallet) {
      this.keyPair = createEllipticHash.keyFromPrivate(
        user.wallet.privateKey,
        'hex'
      );
      this.publicKey = this.keyPair.getPublic().encode('hex');
      this.balance = user.wallet.balance;
    } else {
      this.keyPair = createEllipticHash.genKeyPair();
      this.publicKey = this.keyPair.getPublic().encode('hex');
      this.balance = +process.env.INITIAL_WALLET_BALANCE;
    }
  }

  static calculateBalance({ blockchain, transactionPool, address }) {
    let balance = +process.env.INITIAL_WALLET_BALANCE;
    let hasConductedTransaction = false;

    for (let i = blockchain.chain.length - 1; i > 0; i--) {
      const block = blockchain.chain[i];

      for (let transaction of block.data) {
        if (transaction.inputMap && transaction.inputMap.address === address) {
          hasConductedTransaction = true;
        }

        const addressOutput = transaction.outputMap.get(address);
        if (addressOutput !== undefined) {
          balance = addressOutput;
        }
      }

      if (hasConductedTransaction) {
        break;
      }
    }

    for (let transaction of Object.values(transactionPool.transactionMap)) {
      if (transaction.inputMap && transaction.inputMap.address === address) {
        hasConductedTransaction = true;
      }

      const addressOutput = transaction.outputMap.get(address);
      if (addressOutput !== undefined) {
        balance = addressOutput;
      }
    }

    return balance;
  }

  sign(data) {
    return this.keyPair.sign(generateHash(data)).toDER('hex');
  }

  createTransaction({ recipient, amount, blockchain, transactionPool }) {
    this.balance = Wallet.calculateBalance({
      blockchain,
      transactionPool,
      address: this.publicKey,
    });

    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }

    const transaction = new Transaction({
      sender: this.publicKey,
      recipient,
      amount,
    });

    const outputMap = transaction.createOutputMap(this);
    transaction.outputMap = outputMap;

    transaction.inputMap = transaction.createInputMap({
      senderWallet: this,
      outputMap: transaction.outputMap,
    });

    return transaction;
  }
}
