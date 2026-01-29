const User = require('../models/user');
const jwt = require('jsonwebtoken');

const authController = {
    // Register new user
    register: async (req, res) => {
        try {
            const { username, password, email } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({
                    message: 'Username and password are required.'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message: 'Password must be at least 6 characters long.'
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    message: 'Username already exists.'
                });
            }

            // Create new user (password will be hashed by pre-save hook)
            const user = new User({
                username,
                password,
                email
            });

            await user.save();

            res.status(201).json({
                message: 'User registered successfully.',
                user: {
                    UserID: user.UserID,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({
                    message: 'Username and password are required.'
                });
            }

            // Find user
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).json({
                    message: 'Invalid username or password.'
                });
            }

            // Check password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: 'Invalid username or password.'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    UserID: user.UserID,
                    username: user.username
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            res.json({
                message: 'Login successful.',
                token,
                user: {
                    UserID: user.UserID,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get current user info (protected route)
    getCurrentUser: async (req, res) => {
        try {
            const user = await User.findOne({ UserID: req.user.UserID }).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = authController;
