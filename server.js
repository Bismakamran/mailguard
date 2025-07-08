const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/phishingApp', {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// Password Rule
function isValidPassword(password) {
  const pattern = /^[A-Za-z0-9@#$%&_]{8,}$/;
  return pattern.test(password);
}

// ---------- SIGNUP ----------
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!isValidPassword(password)) {
    return res.status(400).json({ message: "❌ Password must be 8+ chars and contain only A-Z, 0-9, @#$%&_." });
  }

  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "❌ Username already exists." });

    const newUser = new User({ username, password });
    await newUser.save();
    res.json({ message: "✅ Signup successful!" });
  } catch {
    res.status(500).json({ message: "❗ Server error." });
  }
});

// ---------- LOGIN ----------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "❌ Invalid username or password." });
    }

    res.json({ message: "✅ Login successful!" });
  } catch {
    res.status(500).json({ message: "❗ Server error." });
  }
});

// ---------- DETECTION ----------
app.post('/api/detect', (req, res) => {
  const { emailText, url } = req.body;

  if (!emailText && !url) {
    return res.status(400).json({ result: "❌ Please input a URL or Email content." });
  }

  if (url) {
    const pattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/\S*)?$/i;
    const suspicious = ["bit.ly", "tinyurl", "rb.gy", "phish.com", "secure-", "login-", "fakebank.com"];

    if (!pattern.test(url)) {
      return res.json({ result: "❌ Invalid URL format." });
    }

    const isPhishy = suspicious.some(domain => url.toLowerCase().includes(domain));
    return res.json({
      result: isPhishy ? "⚠️ This URL might be a phishing site!" : "✅ This URL seems okay."
    });
  }

  if (emailText) {
    const lower = emailText.toLowerCase();
    let score = 0;

    const patterns = [
      /(verify|reset|confirm|update).*account/,
      /(urgent|immediate|now|action required)/,
      /login.*here/,
      /<form|<input|type=|onclick/,
      /no-reply@|reply-to:|fake@/,
      /(netflix|paypal|bank|microsoft|apple).*(issue|problem)/,
    ];

    patterns.forEach(p => { if (p.test(lower)) score++; });

    let result = "✅ This email looks safe.";
    if (score >= 4) result = "🚨 This email is highly likely to be phishing!";
    else if (score >= 2) result = "⚠️ This email may be suspicious.";

    res.json({ result });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
