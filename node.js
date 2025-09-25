// ...existing code...

const fs = require('fs');
const USERS_FILE = 'users.json';

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { email, password, name } = req.body;
  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  users.push({ email, password, name });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));
  res.json({ success: true });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ success: true, name: user.name });
});

// Flutterwave Virtual Account endpoint
app.post('/api/flutterwave-virtual-account', async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    const response = await axios.post(
      'https://api.flutterwave.com/v3/virtual-account-numbers',
      {
        email,
        is_permanent: true,
        tx_ref: 'va-' + Date.now(),
        narration: 'Wallet Funding',
        amount: 0,
        currency: 'NGN',
        type: 'wallet',
        name,
        phone_number: phone
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
    res.status(500).json({ error: 'Failed to create virtual account', details: err.message });
  }
});

// ...existing code...