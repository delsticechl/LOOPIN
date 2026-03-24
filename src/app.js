const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes'); 
const friendshipRoutes = require('./routes/friendshipRoutes'); 
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/friends', friendshipRoutes); 
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/signup.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/home.html'));
});
app.get('/ranking', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/ranking.html'));
});

app.get('/friends', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/friends.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/adminhome.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📱 Open http://localhost:${PORT} in your browser`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Starting server without database...');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} (No DB)`);
    });
  });
