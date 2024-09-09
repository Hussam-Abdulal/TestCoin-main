import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchTransactions,
  createTransaction,
  mineTransactions,
  fetchBlocks,
} from '../services/testcoinApi';
import '../styles/TransactionPage.css';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const navigate = useNavigate();

  const handleFetchTransactions = async () => {
    setActiveSection('transactions');
    setMessage('');
    setError('');
    try {
      const data = await fetchTransactions();
      if (data.length === 0) {
        setMessage('No transactions to display.');
      } else {
        setTransactions(data);
        setBlocks([]); // Clear blocks if transactions are shown
      }
    } catch (error) {
      setError('Failed to fetch transactions');
    }
  };

  const handleFetchBlocks = async () => {
    setActiveSection('blocks');
    setMessage('');
    setError('');
    try {
      const data = await fetchBlocks();
      if (data.length === 0) {
        setMessage('No blocks to display.');
      } else {
        setBlocks(data);
        setTransactions([]); // Clear transactions if blocks are shown
      }
    } catch (error) {
      setError('Failed to fetch blocks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActiveSection('');
    setMessage('');
    setError('');
    try {
      const newTransaction = await createTransaction({
        recipient,
        amount,
      });
      setTransactions((prevTransactions) => {
        const transactionExists = prevTransactions.some(
          (tx) => tx._id === newTransaction._id
        );
        if (!transactionExists) {
          return [...prevTransactions, newTransaction];
        }
        return prevTransactions;
      });
      setRecipient(''); // Clear the form
      setAmount('');
      setMessage('Transaction created and added to the transaction pool.');
    } catch (error) {
      setError('Failed to create transaction');
    }
  };

  const handleMineTransactions = async () => {
    setActiveSection('');
    setMessage('');
    setError('');
    try {
      const response = await mineTransactions();
      if (response.success) {
        setMessage('Transactions in the transaction pool have been mined.');
        setTransactions([]);
        setBlocks([]);

        await handleFetchTransactions();
        await handleFetchBlocks();
      } else {
        setMessage('No valid transactions to mine.');
      }
    } catch (error) {
      setError('Failed to mine transactions');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="transaction-page-wrapper">
      <div className="transaction-page">
        <h1> Transactions</h1>
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
        <form
          onSubmit={handleSubmit}
          className="transaction-form"
        >
          <label htmlFor="recipient">Recipient</label>
          <input
            id="recipient"
            type="text"
            placeholder="Recipient's Public Key"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            placeholder="Amount to Transfer"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <button type="submit">Create Transaction</button>
        </form>
        <button
          onClick={handleMineTransactions}
          className="mine-button"
        >
          Mine Transactions
        </button>
        <button
          onClick={handleFetchTransactions}
          className="list-button"
        >
          List Transactions
        </button>
        <button
          onClick={handleFetchBlocks}
          className="list-button"
        >
          List Blocks
        </button>
        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}
        {activeSection === 'transactions' && transactions.length > 0 && (
          <ul className="transaction-list">
            {transactions.map((transaction) => (
              <li
                key={transaction._id}
                className="transaction-item"
              >
                <div className="transaction-details">
                  <div className="wallet-address">
                    Sender: {transaction.sender || 'Unknown'}
                  </div>
                  <div className="wallet-address">
                    Recipient: {transaction.recipient}
                  </div>
                </div>
                <div className="amounts">
                  <span className="sent">Sent: {transaction.amount}</span>
                  <span className="remaining">
                    Remaining:{' '}
                    {transaction.inputMap
                      ? transaction.inputMap.amount - transaction.amount
                      : 'N/A'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {activeSection === 'transactions' && transactions.length === 0 && (
          <p>No transactions available.</p>
        )}
        {activeSection === 'blocks' && blocks.length > 0 && (
          <ul className="block-list">
            {blocks.map((block) => (
              <li
                key={block._id}
                className="block-item"
              >
                <div>Index: {block.index}</div>
                <div>Hash: {block.hash}</div>
                <div>Previous Hash: {block.previousHash}</div>
                <div>
                  Timestamp: {new Date(block.timestamp).toLocaleString()}
                </div>
                <div>Nonce: {block.nonce}</div>
                <div>Difficulty: {block.difficulty}</div>
                <div>Data:</div>
                <pre>
                  {JSON.stringify(block.data, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
        {activeSection === 'blocks' && blocks.length === 0 && (
          <p>No blocks available.</p>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
