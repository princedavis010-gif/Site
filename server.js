const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* =========================
   DEMO DATABASE
========================= */

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
    odds: {
      home: 1.75,
      draw: 3.60,
      away: 4.20
    }
  },
  {
    id: 2,
    league: "Premier League",
    home: "Liverpool",
    away: "Everton",
    time: "20:00",
    odds: {
      home: 1.45,
      draw: 4.50,
      away: 6.50
    }
  },
  {
    id: 3,
    league: "La Liga",
    home: "Barcelona",
    away: "Valencia",
    time: "21:00",
    odds: {
      home: 1.35,
      draw: 5.00,
      away: 7.00
    }
  }
];

const casinoGames = [
  {
    id: 1,
    name: "Lucky Spin",
    type: "Wheel",
    status: "DEMO"
  },
  {
    id: 2,
    name: "Lucky Dice",
    type: "Dice",
    status: "DEMO"
  },
  {
    id: 3,
    name: "Lucky Crash",
    type: "Crash",
    status: "DEMO"
  }
];

/* =========================
   HELPERS
========================= */

function getUserFromToken(req) {
  const token = req.headers.authorization;

  if (!token) return null;

  const id = Number(token.replace("Bearer ", ""));

  return users.find(user => user.id === id) || null;
}

function requireLogin(req, res, next) {
  const user = getUserFromToken(req);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Please login first."
    });
  }

  req.user = user;
  next();
}

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Lucky9Bet</title>

<style>

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  background: #090909;
  color: white;
  padding-bottom: 80px;
}

header {
  background: #111;
  padding: 18px;
  text-align: center;
  border-bottom: 1px solid #292929;
}

.logo {
  color: #f5c542;
  font-size: 26px;
  font-weight: bold;
}

.demo {
  background: #163b21;
  color: #7cff91;
  display: inline-block;
  margin-top: 8px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.container {
  padding: 15px;
}

.hero {
  background: linear-gradient(135deg, #171717, #0b2414);
  border: 1px solid #2c2c2c;
  border-radius: 16px;
  padding: 22px;
  margin-bottom: 18px;
}

.hero h1 {
  color: #f5c542;
  margin-bottom: 8px;
}

.hero p {
  color: #ccc;
}

.card {
  background: #141414;
  border: 1px solid #282828;
  border-radius: 14px;
  padding: 15px;
  margin-bottom: 12px;
}

.card h3 {
  margin-bottom: 8px;
}

.league {
  color: #f5c542;
  font-size: 13px;
  margin-bottom: 10px;
}

.match {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.team {
  flex: 1;
}

.odds {
  display: flex;
  gap: 6px;
}

.odd {
  background: #202020;
  color: #7cff91;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
}

button {
  border: none;
  border-radius: 9px;
  padding: 11px 15px;
  cursor: pointer;
  font-weight: bold;
}

.gold {
  background: #f5c542;
  color: #000;
}

.green {
  background: #1d7a39;
  color: white;
}

.dark {
  background: #292929;
  color: white;
}

input {
  width: 100%;
  padding: 13px;
  margin: 7px 0;
  background: #202020;
  color: white;
  border: 1px solid #333;
  border-radius: 9px;
}

.balance {
  font-size: 32px;
  color: #7cff91;
  font-weight: bold;
  margin: 10px 0;
}

.bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #111;
  border-top: 1px solid #292929;
  display: flex;
  justify-content: space-around;
  padding: 10px 5px;
  z-index: 10;
}

.bottom button {
  background: transparent;
  color: #aaa;
  font-size: 12px;
}

.bottom button.active {
  color: #f5c542;
}

.section {
  display: none;
}

.section.active {
  display: block;
}

.message {
  margin: 10px 0;
  padding: 10px;
  border-radius: 8px;
  background: #202020;
}

</style>
</head>

<body>

<header>
  <div class="logo">LUCKY9BET</div>
  <div class="demo">DEMO MODE</div>
</header>

<div class="container">

<!-- HOME -->

<section id="home" class="section active">

<div class="hero">
  <h1>Welcome to Lucky9Bet</h1>
  <p>Sports betting and casino-style entertainment.</p>
  <br>
  <button class="gold" onclick="showSection('sports')">
    Start Betting
  </button>
</div>

<div class="card">
  <h3>🔥 Popular</h3>
  <p>Check today's football matches and demo odds.</p>
</div>

<div class="card">
  <h3>🎰 Casino</h3>
  <p>Try our demo casino games.</p>
</div>

</section>


<!-- SPORTS -->

<section id="sports" class="section">

<h2>⚽ Sports</h2>
<br>

<div id="matches"></div>

</section>


<!-- CASINO -->

<section id="casino" class="section">

<h2>🎰 Casino</h2>
<br>

<div id="games"></div>

</section>


<!-- WALLET -->

<section id="wallet" class="section">

<h2>💰 Wallet</h2>
<br>

<div class="card">

<p>Your balance</p>

<div id="balance" class="balance">
₦0
</div>

<button class="gold" onclick="deposit()">
Demo Deposit
</button>

<button class="green" onclick="withdraw()">
Withdraw
</button>

</div>

<div class="card">
<h3>Transactions</h3>
<div id="transactions"></div>
</div>

</section>


<!-- ACCOUNT -->

<section id="account" class="section">

<h2>👤 Account</h2>
<br>

<div id="accountContent"></div>

</section>


<!-- AUTH -->

<section id="auth" class="section">

<h2>🔐 Account</h2>
<br>

<div class="card">

<h3>Register</h3>

<input id="regName" placeholder="Full name">

<input id="regEmail" placeholder="Email">

<input id="regPassword" type="password" placeholder="Password">

<button class="gold" onclick="register()">
Create Account
</button>

</div>


<div class="card">

<h3>Login</h3>

<input id="loginEmail" placeholder="Email">

<input id="loginPassword" type="password" placeholder="Password">

<button class="green" onclick="login()">
Login
</button>

</div>

<div id="authMessage"></div>

</section>

</div>


<!-- BOTTOM NAV -->

<div class="bottom">

<button onclick="showSection('home')">
🏠<br>Home
</button>

<button onclick="showSection('sports')">
⚽<br>Sports
</button>

<button onclick="showSection('casino')">
🎰<br>Casino
</button>

<button onclick="showSection('wallet')">
💰<br>Wallet
</button>

<button onclick="showSection('account')">
👤<br>Account
</button>

</div>


<script>

let token = localStorage.getItem("lucky9bet_token");


function showSection(section) {

  document.querySelectorAll(".section")
    .forEach(el => el.classList.remove("active"));

  document.getElementById(section)
    .classList.add("active");

  if (section === "sports") loadSports();

  if (section === "casino") loadCasino();

  if (section === "wallet") loadWallet();

  if (section === "account") loadAccount();
}


/* =========================
   REGISTER
========================= */

async function register() {

  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const response = await fetch("/api/register", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      name,
      email,
      password
    })

  });

  const data = await response.json();

  document.getElementById("authMessage").innerHTML =
    data.message;

  if (data.success) {

    token = data.token;

    localStorage.setItem(
      "lucky9bet_token",
      token
    );

    alert("Account created!");

    showSection("account");
  }
}


/* =========================
   LOGIN
========================= */

async function login() {

  const email =
    document.getElementById("loginEmail").value;

  const password =
    document.getElementById("loginPassword").value;

  const response = await fetch("/api/login", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      email,
      password
    })

  });

  const data = await response.json();

  document.getElementById("authMessage").innerHTML =
    data.message;

  if (data.success) {

    token = data.token;

    localStorage.setItem(
      "lucky9bet_token",
      token
    );

    alert("Login successful!");

    showSection("account");
  }
}


/* =========================
   SPORTS
========================= */

async function loadSports() {

  const response =
    await fetch("/api/sports");

  const data =
    await response.json();

  const container =
    document.getElementById("matches");

  container.innerHTML = "";

  data.matches.forEach(match => {

    container.innerHTML += `

      <div class="card">

        <div class="league">
          ${match.league}
        </div>

        <div class="match">

          <div class="team">
            <strong>${match.home}</strong>
            <br>
            vs
            <br>
            <strong>${match.away}</strong>
            <br>
            <small>${match.time}</small>
          </div>

          <div class="odds">

            <button class="odd"
              onclick="placeBet(${match.id}, 'home')">
              1
              <br>
              ${match.odds.home}
            </button>

            <button class="odd"
              onclick="placeBet(${match.id}, 'draw')">
              X
              <br>
              ${match.odds.draw}
            </button>

            <button class="odd"
              onclick="placeBet(${match.id}, 'away')">
              2
              <br>
              ${match.odds.away}
            </button>

          </div>

        </div>

      </div>
    `;
  });
}


/* =========================
   BET
========================= */

async function placeBet(matchId, selection) {

  if (!token) {

    alert("Please login first.");

    showSection("auth");

    return;
  }

  const stake =
    prompt("Enter stake amount:");

  if (!stake) return;

  const response =
    await fetch("/api/bet", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },

      body: JSON.stringify({
        matchId,
        selection,
        stake: Number(stake)
      })

    });

  const data =
    await response.json();

  alert(data.message);

  loadWallet();
}


/* =========================
   CASINO
========================= */

async function loadCasino() {

  const response =
    await fetch("/api/casino");

  const data =
    await response.json();

  const container =
    document.getElementById("games");

  container.innerHTML = "";

  data.games.forEach(game => {

    container.innerHTML += `

      <div class="card">

        <h3>🎰 ${game.name}</h3>

        <p>${game.type}</p>

        <br>

        <button class="gold"
          onclick="playCasino('${game.name}')">
          Play Demo
        </button>

      </div>

    `;
  });
}


function playCasino(game) {

  alert(
    game +
    " is currently DEMO only."
  );
}


/* =========================
   WALLET
========================= */

async function loadWallet() {

  if (!token) {

    document.getElementById("balance")
      .innerText = "₦0";

    return;
  }

  const response =
    await fetch("/api/wallet", {

      headers: {
        "Authorization": "Bearer " + token
      }

    });

  const data =
    await response.json();

  if (!data.success) return;

  document.getElementById("balance")
    .innerText =
    "₦" + data.balance.toLocaleString();

  loadTransactions();
}


async function deposit() {

  if (!token) {

    alert("Login first.");

    showSection("auth");

    return;
  }

  const amount =
    prompt("Enter DEMO deposit amount:");

  if (!amount) return;

  const response =
    await fetch("/api/deposit", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },

      body: JSON.stringify({
        amount: Number(amount)
      })

    });

  const data =
    await response.json();

  alert(data.message);

  loadWallet();
}


async function withdraw() {

  if (!token) {

    alert("Login first.");

    showSection("auth");

    return;
  }

  const amount =
    prompt("Enter withdrawal amount:");

  if (!amount) return;

  const response =
    await fetch("/api/withdraw", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },

      body: JSON.stringify({
        amount: Number(amount)
      })

    });

  const data =
    await response.json();

  alert(data.message);

  loadWallet();
}


async function loadTransactions() {

  const response =
    await fetch("/api/transactions", {

      headers: {
        "Authorization": "Bearer " + token
      }

    });

  const data =
    await response.json();

  const container =
    document.getElementById("transactions");

  container.innerHTML = "";

  data.transactions.forEach(tx => {

    container.innerHTML += `

      <div style="padding:8px 0;border-bottom:1px solid #333">

        ${tx.type}
        -
        ₦${tx.amount.toLocaleString()}

        <br>

        <small>${tx.status}</small>

      </div>

    `;

  });
}


/* =========================
   ACCOUNT
========================= */

async function loadAccount() {

  const container =
    document.getElementById("accountContent");

  if (!token) {

    container.innerHTML = `

      <div class="card">

        <p>You are not logged in.</p>

        <br>

        <button class="gold"
          onclick="showSection('auth')">
          Login / Register
        </button>

      </div>

    `;

    return;
  }

  const response =
    await fetch("/api/me", {

      headers: {
        "Authorization": "Bearer " + token
      }

    });

  const data =
    await response.json();

  if (!data.success) return;

  container.innerHTML = `

    <div class="card">

      <h3>${data.user.name}</h3>

      <p>${data.user.email}</p>

      <br>

      <button class="dark"
        onclick="logout()">
        Logout
      </button>

    </div>

  `;
}


function logout() {

  localStorage.removeItem(
    "lucky9bet_token"
  );

  token = null;

  alert("Logged out.");

  showSection("home");
}


/* =========================
   START
========================= */

loadSports();

</script>

</body>
</html>
  `);
});


/* =========================
   REGISTER API
========================= */

app.post("/api/register", (req, res) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {

    return res.json({
      success: false,
      message: "All fields are required."
    });

  }

  const existing =
    users.find(
      user => user.email === email
    );

  if (existing) {

    return res.json({
      success: false,
      message: "Email already registered."
    });

  }

  const user = {

    id: users.length + 1,

    name,

    email,

    password

  };

  users.push(user);

  wallets[user.id] = 0;

  res.json({

    success: true,

    message: "Account created.",

    token: String(user.id)

  });

});


/* =========================
   LOGIN API
========================= */

app.post("/api/login", (req, res) => {

  const { email, password } = req.body;

  const user =
    users.find(
      user =>
        user.email === email &&
        user.password === password
    );

  if (!user) {

    return res.json({

      success: false,

      message: "Invalid email or password."

    });

  }

  res.json({

    success: true,

    message: "Login successful.",

    token: String(user.id)

  });

});


/* =========================
   CURRENT USER
========================= */

app.get("/api/me", requireLogin, (req, res) => {

  res.json({

    success: true,

    user: {

      id: req.user.id,

      name: req.user.name,

      email: req.user.email

    }

  });

});


/* =========================
   WALLET
========================= */

app.get("/api/wallet", requireLogin, (req, res) => {

  res.json({

    success: true,

    balance: wallets[req.user.id] || 0

  });

});


/* =========================
   TRANSACTIONS
========================= */

app.get(
  "/api/transactions",
  requireLogin,
  (req, res) => {

    const userTransactions =
      transactions.filter(
        tx => tx.userId === req.user.id
      );

    res.json({

      success: true,

      transactions: userTransactions

    });

  }
);


/* =========================
   DEMO DEPOSIT
========================= */

app.post(
  "/api/deposit",
  requireLogin,
  (req, res) => {

    const amount =
      Number(req.body.amount);

    if (!amount || amount <= 0) {

      return res.json({

        success: false,

        message: "Invalid amount."

      });

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

      message:
        "Demo deposit successful. This is not real money.",

      balance:
        wallets[req.user.id]

    });

  }
);


/* =========================
   DEMO WITHDRAWAL
========================= */

app.post(
  "/api/withdraw",
  requireLogin,
  (req, res) => {

    const amount =
      Number(req.body.amount);

    if (!amount || amount <= 0) {

      return res.json({

        success: false,

        message: "Invalid amount."

      });

    }

    if (wallets[req.user.id] < amount) {

      return res.json({

        success: false,

        message: "Insufficient balance."

      });

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

      message:
        "Demo withdrawal submitted.",

      balance:
        wallets[req.user.id]

    });

  }
);


/* =========================
   SPORTS
========================= */

app.get("/api/sports", (req, res) => {

  res.json({

    success: true,

    matches

  });

});


/* =========================
   CASINO
========================= */

app.get("/api/casino", (req, res) => {

  res.json({

    success: true,

    games: casinoGames

  });

});


/* =========================
   PLACE BET
========================= */

app.post("/api/bet", requireLogin, (req, res) => {

  const {
    matchId,
    selection,
    stake
  } = req.body;

  const amount = Number(stake);

  const match =
    matches.find(
      m => m.id === Number(matchId)
    );

  if (!match) {

    return res.json({

      success: false,

      message: "Match not found."

    });

  }

  if (!["home", "draw", "away"].includes(selection)) {

    return res.json({

      success: false,

      message: "Invalid selection."

    });

  }

  if (!amount || amount <= 0) {

    return res.json({

      success: false,

      message: "Invalid stake."

    });

  }

  if (wallets[req.user.id] < amount) {

    return res.json({

      success: false,

      message: "Insufficient balance."

    });

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

  const potentialWin =
    amount * odds;

  bets.push({

    id: bets.length + 1,

    userId: req.user.id,

    matchId: match.id,

    selection,

    stake: amount,

    odds,

    potentialWin,

    status: "OPEN",

    date: new Date().
