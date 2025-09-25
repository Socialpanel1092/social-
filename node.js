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

app.post('/api/verify-payment', express.json(), async (req, res) => {
  const { transaction_id, email } = req.body;
  try {
    const verify = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`
        }
      }
    );
    if (verify.data.status === "success" && verify.data.data.status === "successful") {
      let users = [];
      if (fs.existsSync(USERS_FILE)) {
        users = JSON.parse(fs.readFileSync(USERS_FILE));
      }
      const user = users.find(u => u.email === email);
      if (user) {
        user.balance = (user.balance || 0) + verify.data.data.amount;
        fs.writeFileSync(USERS_FILE, JSON.stringify(users));
        return res.json({ success: true });
      }
    }
    res.json({ success: false });
  } catch (err) {
    res.json({ success: false });
  }
});

// ...existing code...
const whatsappNumber = "2348163328640"; // Replace with your WhatsApp number

app.post('/api/place-order', express.json(), (req, res) => {
  const { email, category, service, price, link } = req.body;
  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }
  const user = users.find(u => u.email === email);
  if (!user) return res.json({ success: false, message: "User not found." });
  if ((user.balance || 0) < price) return res.json({ success: false, message: "Insufficient balance." });

  user.balance -= price;
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));

  // Save order
  let orders = [];
  if (fs.existsSync(ORDERS_FILE)) {
    orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  }
  const order = {
    email, category, service, price, link,
    date: new Date().toISOString(),
    receipt: `Paid ₦${price} for ${service} (${category})`
  };
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders));

  // WhatsApp notification
  const whatsappMsg = encodeURIComponent(
    `New Order:\nCategory: ${category}\nService: ${service}\nLink: ${link}\nPrice: ₦${price}\nUser: ${email}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  res.json({ success: true, message: "Order placed! Receipt saved.", whatsappUrl });
});

if (data.success && data.whatsappUrl) {
  window.open(data.whatsappUrl, '_blank');
}