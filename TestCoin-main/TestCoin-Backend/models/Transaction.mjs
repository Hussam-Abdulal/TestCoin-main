import mongoose from 'mongoose';
import { verifySignature } from '../utils/cipherHash.mjs';

const transactionSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  outputMap: {
    type: Map,
    of: Number,
    required: true,
  },
  inputMap: {
    timestamp: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
  },
});

transactionSchema.methods.createOutputMap = function (senderWallet) {
  const outputMap = new Map();

  // Minska beloppet från avsändarens balans och lägg till transaktionen i outputMap
  const remainingBalance = senderWallet.balance - this.amount;
  outputMap.set(this.recipient, this.amount);
  outputMap.set(this.sender, remainingBalance);

  console.log('--- Creating OutputMap ---');
  console.log(`Recipient: ${this.recipient}, Amount: ${this.amount}`);
  console.log(`Sender: ${this.sender}, Remaining Balance: ${remainingBalance}`);

  return outputMap;
};

transactionSchema.methods.createInputMap = function ({
  senderWallet,
  outputMap,
}) {
  return {
    timestamp: Date.now(),
    amount: senderWallet.balance,
    address: senderWallet.publicKey,
    signature: senderWallet.sign([...outputMap.entries()]),
  };
};

transactionSchema.statics.validateTransaction = function (transaction) {
  const {
    inputMap: { address, amount, signature },
    outputMap,
  } = transaction;

  // Beräkna summan av alla värden i outputMap
  const outputTotal = Array.from(outputMap.values()).reduce(
    (total, value) => total + value,
    0
  );

  console.log('--- Validating Transaction ---');
  console.log(`Address: ${address}`);
  console.log(`Amount expected: ${amount}`);
  console.log(`Total in outputMap: ${outputTotal}`);
  console.log(`outputMap content: ${JSON.stringify(Array.from(outputMap.entries()))}`);

  // Justera valideringen för att ta hänsyn till att transaktionen minskar det ursprungliga beloppet
  if (amount !== outputTotal + transaction.amount) {
    console.error(
      `Invalid transaction from ${address}: amount does not equal output total.`
    );
    return false;
  }

  if (
    !verifySignature({
      publicKey: address,
      data: [...outputMap.entries()],
      signature,
    })
  ) {
    console.error(`Invalid signature from ${address}.`);
    return false;
  }

  return true;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
