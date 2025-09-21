const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());

// Replace with your Monnify credentials
const MONNIFY_API_KEY = 'MK_TEST_BA2XMKDY98';
const MONNIFY_SECRET_KEY = '7RMM6CMDGUZK83HX2RTQ15H3TDH1VZ9S';
const MONNIFY_CONTRACT_CODE = '3448279701';

// Get Monnify authentication token
async function getMonnifyToken() {
  const response = await axios.post(
    'https://api.monnify.com/api/v1/auth/login',
    {},
    {
      auth: {
        username: MONNIFY_API_KEY,
        password: MONNIFY_SECRET_KEY
      }
    }
  );
  return response.data.responseBody.accessToken;
}

// Create virtual account
app.post('/api/virtual-account', async (req, res) => {
  try {
    const { email, name, surname, number } = req.body;
    const accessToken = await getMonnifyToken();

    const accountRes = await axios.post(
      'https://api.monnify.com/api/v2/bank-transfer/reserved-accounts',
      {
        accountReference: email + Date.now(),
        accountName: `${name} ${surname}`,
        customerEmail: email,
        customerName: `${name} ${surname}`,
        contractCode: 3448279701,
        customerBvn: '', // Optional
        customerPhoneNumber: number,
        preferredBanks: ['035'], // Example: Wema Bank
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const account = accountRes.data.responseBody.accounts[0];
    res.json({
      account: {
        accountNumber: account.accountNumber,
        bankName: account.bankName,
        accountName: account.accountName
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create virtual account', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Funding backend running on http://localhost:${PORT}`);
});
