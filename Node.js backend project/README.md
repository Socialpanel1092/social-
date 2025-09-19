# Social Media Boost Panel Backend

## Features
- Node.js Express backend
- MongoDB for user balances
- REST API for deposit and balance
- Flutterwave payment integration (webhook placeholder)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up MongoDB and update `.env` with your connection string and Flutterwave secret key.
3. Start the server:
   ```bash
   node index.js
   ```

## API Endpoints
- `GET /api/balance/:email` — Get user balance
- `POST /api/deposit` — Deposit funds (after payment confirmation)
- `POST /api/flutterwave-webhook` — Payment confirmation webhook

## Frontend Integration
Connect your HTML frontend via API calls to deposit and fetch balance.

## Notes
- Replace webhook logic with actual Flutterwave verification.
- Secure endpoints and add authentication for production use.
