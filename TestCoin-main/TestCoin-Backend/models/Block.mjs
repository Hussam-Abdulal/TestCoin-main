import mongoose from 'mongoose';
import { generateHash } from '../utils/cipherHash.mjs';

const blockSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true,
  },
  previousHash: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  nonce: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: Number,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
});

blockSchema.methods.calculateHash = function () {
  return generateHash(
    this.index,
    this.previousHash,
    this.timestamp,
    JSON.stringify(this.data),
    this.nonce,
    this.difficulty
  );
};

blockSchema.pre('validate', function (next) {
  if (!this.hash) {
    this.hash = this.calculateHash();
  }
  next();
});

export default mongoose.model('Block', blockSchema);
