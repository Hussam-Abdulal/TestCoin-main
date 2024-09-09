import jwt from 'jsonwebtoken';
import User from '../models/User.mjs';
import Wallet from '../models/Wallet.mjs';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized to access this route' });
  }
};

export const fetchUserAndInitializeWallet = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    req.user = user;
    req.wallet = new Wallet(user);
    next();
  } catch (error) {
    throw new Error('Error initializing wallet:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
