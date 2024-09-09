import { describe, it, expect, beforeEach } from 'vitest';
import Wallet from '../models/Wallet.mjs';
import Transaction from '../models/Transaction.mjs';
import { verifySignature } from '../utils/cipherHash.mjs';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

describe('Transaction', () => {
  let transaction, senderWallet, recipient, amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    senderWallet.balance = +process.env.INITIAL_WALLET_BALANCE; // Set the initial balance
    recipient = 'recipient-address';
    amount = 25;

    transaction = new Transaction({
      sender: senderWallet.publicKey,
      recipient,
      amount,
    });

    transaction.outputMap = transaction.createOutputMap(senderWallet);

    transaction.inputMap = transaction.createInputMap({
      senderWallet,
      outputMap: transaction.outputMap,
    });
  });

  describe('Properties', () => {
    it('should have a property named _id', () => {
      expect(transaction).toHaveProperty('_id');
    });
  });

  describe('OutputMap', () => {
    it('should have a property named outputMap', () => {
      expect(transaction).toHaveProperty('outputMap');
    });

    it("should output the recipient's balance", () => {
      expect(transaction.outputMap.get(recipient)).toEqual(amount);
    });

    it("should display the sender's balance", () => {
      const expectedSenderBalance = senderWallet.balance - amount;
      expect(transaction.outputMap.get(senderWallet.publicKey)).toEqual(
        expectedSenderBalance
      );
    });
  });

  describe('InputMap', () => {
    it('should have a property named inputMap', () => {
      expect(transaction).toHaveProperty('inputMap');
    });

    it('should have a property named timestamp', () => {
      expect(transaction.inputMap).toHaveProperty('timestamp');
    });

    it("should set the amount to the sender's balance", () => {
      expect(transaction.inputMap.amount).toEqual(senderWallet.balance);
    });

    it("should set the address value to the sender's publicKey", () => {
      expect(transaction.inputMap.address).toEqual(senderWallet.publicKey);
    });

    it('should sign the inputMap', () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: Array.from(transaction.outputMap.entries()),
          signature: transaction.inputMap.signature,
        })
      ).toBe(true);
    });
  });

  describe('Validate transaction', () => {
    describe('when the transaction is valid', () => {
      it('should return true', () => {
        expect(Transaction.validateTransaction(transaction)).toBe(true);
      });
    });

    describe('when the transaction is invalid', () => {
      describe('and the transaction outputMap value is invalid', () => {
        it('should return false', () => {
          transaction.outputMap.set(senderWallet.publicKey, 9999999); // Invalid value
          expect(Transaction.validateTransaction(transaction)).toBe(false);
        });
      });

      describe('and the transaction inputMap signature is invalid', () => {
        it('should return false', () => {
          transaction.inputMap.signature = new Wallet().sign('fake data');
          expect(Transaction.validateTransaction(transaction)).toBe(false);
        });
      });
    });
  });

  describe('Create transaction', () => {
    it('should throw an error if amount exceeds balance', () => {
      expect(() => {
        senderWallet.createTransaction({
          recipient,
          amount: 999999,
          blockchain: { chain: [] },
          transactionPool: { transactionMap: {} },
        });
      }).toThrow('Amount exceeds balance');
    });

    it('should create a valid transaction', () => {
      const newTransaction = senderWallet.createTransaction({
        recipient,
        amount: 20,
        blockchain: { chain: [] },
        transactionPool: { transactionMap: {} },
      });

      expect(newTransaction).toHaveProperty('inputMap');
      expect(newTransaction.outputMap.get(recipient)).toEqual(20);
      expect(newTransaction.outputMap.get(senderWallet.publicKey)).toEqual(
        senderWallet.balance - 20
      );
    });
  });
});
