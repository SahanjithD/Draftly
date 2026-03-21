const connectDB = require('./config/db');
require('dotenv').config();
const app = require('./app');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
