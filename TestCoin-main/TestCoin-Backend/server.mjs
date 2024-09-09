import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cors from 'cors';
import connectDB from './config/mongoDb.mjs';
import Blockchain from './models/Blockchain.mjs';
import blockchainRouter from './routes/blockchain-routes.mjs';
import authRouter from './routes/auth-routes.mjs';
import transactionRouter from './routes/transaction-routes.mjs';
import TransactionPool from './models/TransactionPool.mjs';
import Miner from './models/Miner.mjs';
import PubNubService from './pubnubServer.mjs';
import { fetchUserAndInitializeWallet } from './middleware/authMiddleware.mjs';

dotenv.config({ path: './config/config.env' });

connectDB();

const blockchain = new Blockchain();
await blockchain.initialize();

const transactionPool = new TransactionPool();

const miner = new Miner({
  blockchain,
  transactionPool,
});

PubNubService.subscribeToChannel('BLOCKCHAIN');
PubNubService.subscribeToChannel('TRANSACTION');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(xss());
app.use(rateLimit({ windowsMs: 15 * 60 * 1000, limit: 100 }));
app.use(cors());
app.use(hpp());

const PORT = +process.env.PORT || 5010;
const PRIMARY_NODE = `http://localhost:${PORT}`;

let nodePort =
  process.env.DYNAMIC_NODE_PORT === 'true'
    ? PORT + Math.floor(Math.random() * 1000)
    : PORT;

app.use('/api/v1/TestCoin/blockchain', blockchainRouter);
app.use('/api/v1/TestCoin/auth', authRouter);
app.use(
  '/api/v1/TestCoin/transactions',
  fetchUserAndInitializeWallet,
  transactionRouter
);

const syncBlockchain = async () => {
  if (process.env.DYNAMIC_NODE_PORT === 'true') {
    try {
      const response = await fetch(`${PRIMARY_NODE}/api/v1/TestCoin/blockchain`);
      const data = await response.json();
      if (data) {
        blockchain.syncChains(data.data);
        console.log('Blockchain synchronized with primary node');
      } else {
        throw new Error('Failed to synchronize blockchain');
      }
    } catch (error) {
      throw new Error('Error synchronizing blockchain:', error.message);
    }
  }
};

app.listen(nodePort, async () => {
  console.log(
    `Server is running on port: ${nodePort} in ${process.env.NODE_ENV} mode`
      .bgGreen
  );
  await syncBlockchain();
});

export { blockchain, transactionPool, miner };
