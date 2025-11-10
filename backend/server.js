const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// CORS Middleware (simple version - for production, configure allowed origins)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Connect to MongoDB
connectDB();

// Routes
console.log('Loading routes...');
app.use('/api/auth', require('./routes/authRoutes'));
console.log('✅ Auth routes loaded');
app.use('/api/posts', require('./routes/postRoutes'));
console.log('✅ Post routes loaded');
app.use('/api/users', require('./routes/userRoutes'));
console.log('✅ User routes loaded');
app.use('/api/stats', require('./routes/statsRoutes'));
console.log('✅ Stats routes loaded');

// Define a simple route
app.get('/', (req, res) => {
  res.send('Api is running');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
