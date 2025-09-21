const fs = require('fs');
const BALANCE_FILE = 'balance.json';

// Helper to read balance.json
function getBalanceData() {
  if (!fs.existsSync(BALANCE_FILE)) {
    fs.writeFileSync(BALANCE_FILE, JSON.stringify({ balance: 0, transactions: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(BALANCE_FILE));
}

// Helper to write balance.json
function setBalanceData(data) {
  fs.writeFileSync(BALANCE_FILE, JSON.stringify(data, null, 2));
}

// Endpoint to get current balance
app.get('/api/balance', (req, res) => {
  const data = getBalanceData();
  res.json({ balance: data.balance });
});

// Endpoint to get transaction history
app.get('/api/transactions', (req, res) => {
  const data = getBalanceData();
  res.json({ transactions: data.transactions });
});

// Endpoint to deduct from balance for order
app.post('/api/deduct', (req, res) => {
  const { amount, description } = req.body;
  let data = getBalanceData();
  if (amount > data.balance) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  data.balance -= amount;
  data.transactions.push({
    type: 'Order',
    amount: -amount,
    description: description || 'Order submitted',
    date: new Date().toISOString()
  });
  setBalanceData(data);
  res.json({ balance: data.balance });
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5050;

const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY;
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_ENCRYPTION_KEY = process.env.FLW_ENCRYPTION_KEY;

app.use(cors());
app.use(express.json());

// Flutterwave payment endpoint
app.post('/api/flutterwave-pay', async (req, res) => {
  try {
    const { amount, payment_type = 'card' } = req.body;
    // Supported payment types: card, bank_transfer, ussd, etc.
    const response = await axios.post(
      `https://api.flutterwave.com/v3/charges?type=${payment_type}`,
      {
        tx_ref: 'tx-' + Date.now(),
        amount,
        currency: 'NGN',
        redirect_url: 'https://your-frontend-url.com/payment-success',
        payment_type,
        customer: {
          email: '',
          phonenumber: '',
          name: ''
        },
        customizations: {
          title: 'Wallet Funding',
          description: 'Fund your wallet with Flutterwave',
        },
        public_key: FLW_PUBLIC_KEY,
        encryption_key: FLW_ENCRYPTION_KEY
      },
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Flutterwave payment failed', details: err.message });
  }
});

// Flutterwave webhook endpoint for payment verification
app.post('/api/flutterwave-webhook', (req, res) => {
  const event = req.body;
  if (event.event === 'charge.completed' && event.data.status === 'successful') {
    // Update balance and record transaction
    let data = getBalanceData();
    data.balance += Number(event.data.amount);
    data.transactions.push({
      type: 'Deposit',
      amount: Number(event.data.amount),
      description: 'Flutterwave funding',
      date: new Date().toISOString()
    });
    setBalanceData(data);
    console.log(`Wallet funded: ₦${event.data.amount}`);
    res.status(200).send('Webhook received');
  } else {
    res.status(200).send('Ignored');
  }
});

app.listen(PORT, () => {
  console.log(`Funding backend running on http://localhost:${PORT}`);
});
