if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/dbConfig');
const { port } = require('./config/appConfig');

// Import routes
const communityRoutes = require('./routes/communityRoutes');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes')
const userRoutes = require('./routes/userRoutes');

const app = express(); 
const FRONT_END_APP = process.env.FRONT_END;

// Middleware
app.use(express.json());
app.use(cors({ origin: FRONT_END_APP, methods: 'GET,POST,PUT,DELETE', allowedHeaders: 'Content-Type,Authorization' }));

// Connect to MongoDB
connectDB();

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Start the server
const PORT = port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
