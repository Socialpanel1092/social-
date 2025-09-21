
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Always return the same account info for funding
app.post('/api/virtual-account', (req, res) => {
  res.json({
    account: {
      accountNumber: "8163328640",
      bankName: "Palmpay Bank",
      accountName: "Oluwayemi Beatrice Kolawole"
    }
  });
});

// Dummy balance endpoint (always returns 0)
app.get('/api/balance', (req, res) => {
  res.json({ balance: 0 });
});

app.listen(PORT, () => {
  console.log(`Funding backend running on http://localhost:${PORT}`);
});
