const express = require('express');
const app = express();
const cors = require('cors');
const bookRoutes = require('./routes/books');
const authRoutes = require('./routes/auth');

// 🔧 Middlewares généraux
app.use(cors());
app.use(express.json()); // ← doit être placé AVANT les routes
app.use('/images', express.static('images'));

// 📚 Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// ✅ Route test
app.get('/', (req, res) => {
  res.send('Serveur backend opérationnel 🎉');
});

module.exports = app;
