import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Login user
export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;
  
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const payload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        
        // Send response
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify token
export const verifyToken = async (req, res) => {
  try {
    // User already attached to req in auth middleware
    const user = req.user;
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create initial admin user if none exists
export const createInitialAdmin = async () => {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds
  let currentRetry = 0;

  const attemptCreation = async () => {
    try {
      // Check if we have a valid connection first
      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB connection not ready');
      }

      console.log('Checking for existing admin user...');
      const adminExists = await User.findOne({ isAdmin: true });
      
      if (!adminExists) {
        console.log('No admin found, creating initial admin user...');
        const initialAdmin = new User({
          email: 'admin@example.com',
          password: 'admin123',
          isAdmin: true
        });
        
        await initialAdmin.save();
        console.log('Initial admin user created successfully');
      } else {
        console.log('Admin user already exists');
      }
      return true;
    } catch (error) {
      console.error(`Attempt ${currentRetry + 1}/${maxRetries} failed:`, error.message);
      return false;
    }
  };

  const retry = async () => {
    while (currentRetry < maxRetries) {
      const success = await attemptCreation();
      if (success) return;

      currentRetry++;
      if (currentRetry < maxRetries) {
        console.log(`Retrying in ${retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    if (currentRetry >= maxRetries) {
      console.error('Failed to create initial admin after maximum retry attempts');
    }
  };

  // Start the retry process
  await retry();
};

// Don't automatically call createInitialAdmin here
// Instead, export it to be called after MongoDB connection is established
export const initializeAdmin = () => {
  mongoose.connection.once('connected', () => {
    console.log('MongoDB connected, attempting to create initial admin...');
    createInitialAdmin();
  });
};