import crypto from 'crypto';
import pkg from 'elliptic';

const { ec } = pkg;
export const createEllipticHash = new ec('secp256k1');

export const generateHash = (...args) => {
  const hash = crypto
    .createHash('sha256')
    .update(args.map((arg) => JSON.stringify(arg)).join(''))
    .digest('hex');
  return hash;
};

export const verifySignature = ({ publicKey, data, signature }) => {
  const key = createEllipticHash.keyFromPublic(publicKey, 'hex');
  return key.verify(generateHash(data), signature);
};
