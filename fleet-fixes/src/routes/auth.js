const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const config = require('../config');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = await User.create({ email, password });

    // FIXED: role is included in the JWT payload so authorize() middleware works
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'operator' },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // FIXED: same response for missing user and wrong password — prevents user enumeration
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // FIXED: role included in token; uses config.JWT_SECRET not a local fallback
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'operator' },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    res.json({ token, user: user.toJSON() });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
