const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../models/User');
require('dotenv').config();

// Deposit endpoint
router.post('/', async (req, res) => {
  const { email, transaction_id, amount } = req.body;
  const secretKey = process.env.FLW_SECRET_KEY;

  try {
    // Verify payment with Flutterwave
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
    const response = await axios.get(verifyUrl, {
      headers: { Authorization: `Bearer ${secretKey}` }
    });

    if (response.data.status === 'success' && response.data.data.status === 'successful') {
      // Update user balance
      const user = await User.findOneAndUpdate(
        { email },
        { $inc: { balance: amount } },
        { new: true, upsert: true }
      );
      return res.json({ success: true, balance: user.balance });
    } else {
      return res.status(400).json({ success: false, message: 'Payment not verified.' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Get balance endpoint
router.get('/balance', async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ balance: 0 });
    return res.json({ balance: user.balance });
  } catch (err) {
    return res.status(500).json({ balance: 0 });
  }
});

module.exports = router;
