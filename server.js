const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

/* ========================= DEMO DATABASE ========================= */
const users = [];
const wallets = {};
const bets = [];
const transactions = [];

const matches = [
  {
    id: 1,
    league: "Premier League",
    home: "Arsenal",
    away: "Chelsea",
    time: "18:00",
    odds: { home: 1.75, draw: 3.60, away: 4.20 }
  },
  {
    id: 2,
    league: "Premier League",
    home: "Liverpool",
    away: "Everton",
    time: "20:00",
    odds: { home: 1.45, draw: 4.50, away: 6.50 }
  },
  {
    id: 3,
    league: "La Liga",
    home: "Barcelona",
    away: "Valencia",
    time: "21:00",
    odds: { home: 1.35, draw: 5.00, away: 7.00 }
  }
];

const casinoGames = [
  { id: 1, name: "Lucky Spin", type: "Wheel", status: "DEMO" },
  { id: 2, name: "Lucky Dice", type: "Dice", status: "DEMO" },
  { id: 3, name: "Lucky Crash", type: "Crash", status: "DEMO" }
];

/* ========================= HELPERS ========================= */
function getUserFromToken(req) {
  const token = req.headers.authorization;
  if (!token) return null;
  const id = Number(token.replace("Bearer ", ""));
  return users.find(user => user.id === id) || null;
}

function requireLogin(req, res, next) {
  const user = getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: "Please login first." });
  }
  req.user = user;
  next();
}

/* ========================= HOME ========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ========================= REGISTER API ========================= */
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required." });
  }

  const existing = users.find(user => user.email === email);
  if (existing) {
    return res.json({ success: false, message: "Email already registered." });
  }

  const user = { id: users.length + 1, name, email, password };
  users.push(user);
  wallets[user.id] = 0;

  res.json({ success: true, message: "Account created.", token: String(user.id) });
});

/* ========================= LOGIN API ========================= */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    user => user.email === email && user.password === password
  );

  if (!user) {
    return res.json({ success: false, message: "Invalid email or password." });
  }

  res.json({ success: true, message: "Login successful.", token: String(user.id) });
});

/* ========================= CURRENT USER ========================= */
app.get("/api/me", requireLogin, (req, res) => {
  res.json({
    success: true,
    user: { id: req.user.id, name: req.user.name, email: req.user.email }
  });
});

/* ========================= WALLET ========================= */
app.get("/api/wallet", requireLogin, (req, res) => {
  res.json({ success: true, balance: wallets[req.user.id] || 0 });
});

/* ========================= TRANSACTIONS ========================= */
app.get("/api/transactions", requireLogin, (req, res) => {
  const userTransactions = transactions.filter(
    tx => tx.userId === req.user.id
  );
  res.json({ success: true, transactions: userTransactions });
});

/* ========================= DEMO DEPOSIT ========================= */
app.post("/api/deposit", requireLogin, (req, res) => {
  const amount = Number(req.body.amount);

  if (!amount || amount <= 0) {
    return res.json({ success: false, message: "Invalid amount." });
  }

  wallets[req.user.id] += amount;

  transactions.push({
    id: transactions.length + 1,
    userId: req.user.id,
    type: "DEMO DEPOSIT",
    amount,
    status: "COMPLETED",
    date: new Date().toISOString()
  });

  res.json({
    success: true,
    message: "Demo deposit successful. This is not real money.",
    balance: wallets[req.user.id]
  });
});

/* ========================= DEMO WITHDRAWAL ========================= */
app.post("/api/withdraw", requireLogin, (req, res) => {
  const amount = Number(req.body.amount);

  if (!amount || amount <= 0) {
    return res.json({ success: false, message: "Invalid amount." });
  }

  if (wallets[req.user.id] < amount) {
    return res.json({ success: false, message: "Insufficient balance." });
  }

  wallets[req.user.id] -= amount;

  transactions.push({
    id: transactions.length + 1,
    userId: req.user.id,
    type: "DEMO WITHDRAWAL",
    amount,
    status: "PENDING",
    date: new Date().toISOString()
  });

  res.json({
    success: true,
    message: "Demo withdrawal submitted.",
    balance: wallets[req.user.id]
  });
});

/* ========================= SPORTS ========================= */
app.get("/api/sports", (req, res) => {
  res.json({ success: true, matches });
});

/* ========================= CASINO ========================= */
app.get("/api/casino", (req, res) => {
  res.json({ success: true, games: casinoGames });
});

/* ========================= PLACE BET ========================= */
app.post("/api/bet", requireLogin, (req, res) => {
  const { matchId, selection, stake } = req.body;
  const amount = Number(stake);

  const match = matches.find(m => m.id === Number(matchId));

  if (!match) {
    return res.json({ success: false, message: "Match not found." });
  }

  if (!["home", "draw", "away"].includes(selection)) {
    return res.json({ success: false, message: "Invalid selection." });
  }

  if (!amount || amount <= 0) {
    return res.json({ success: false, message: "Invalid stake." });
  }

  if (wallets[req.user.id] < amount) {
    return res.json({ success: false, message: "Insufficient balance." });
  }

  let odds;
  if (selection === "home") {
    odds = match.odds.home;
  }
  if (selection === "draw") {
    odds = match.odds.draw;
  }
  if (selection === "away") {
    odds = match.odds.away;
  }

  wallets[req.user.id] -= amount;

  const potentialWin = amount * odds;

  bets.push({
    id: bets.length + 1,
    userId: req.user.id,
    matchId: match.id,
    selection,
    stake: amount,
    odds,
    potentialWin,
    status: "OPEN",
    date: new Date().toISOString()
  });

  res.json({
    success: true,
    message: "Bet placed successfully.",
    balance: wallets[req.user.id],
    bet: bets[bets.length - 1]
  });
});

/* ========================= START SERVER ========================= */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
