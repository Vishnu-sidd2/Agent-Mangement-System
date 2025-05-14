import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agents.js';
import listRoutes from './routes/lists.js';
import dashboardRoutes from './routes/dashboard.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeAdmin } from './controllers/authController.js';

dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    try {
      console.log(`Attempting to connect to MongoDB (attempt ${currentRetry + 1}/${maxRetries})...`);
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agent-management',
 {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      });
      console.log('Connected to MongoDB successfully');
      
      // Initialize admin user after successful connection
      initializeAdmin();
      return;
    } catch (error) {
      currentRetry++;
      console.error(`MongoDB connection failed (attempt ${currentRetry}/${maxRetries}):`, error.message);
      
      if (currentRetry === maxRetries) {
        console.error('Failed to connect to MongoDB after maximum retry attempts');
        process.exit(1);
      }
      
      console.log(`Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});