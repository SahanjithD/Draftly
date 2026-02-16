const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet()); // Set security headers
app.use(mongoSanitize()); // Prevent NoSQL injection

// Body Parser Middleware
app.use(express.json());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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
