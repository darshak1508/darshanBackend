const crypto = require('crypto');
const User = require('../models/user');
const { OtpSession } = require('../models');
const { sendOtpEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');

const OTP_EXPIRY_MINUTES = 5;

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

    // Step 1: Login – validate username/password and send OTP to user's email
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    message: 'Username and password are required.'
                });
            }

            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).json({
                    message: 'Invalid username or password.'
                });
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: 'Invalid username or password.'
                });
            }

            const email = user.email?.trim();
            if (!email) {
                return res.status(400).json({
                    message: 'Email is required for login. Please update your profile with an email address.'
                });
            }

            const otp = String(Math.floor(100000 + Math.random() * 900000));
            const sessionId = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

            await OtpSession.create({
                sessionId,
                UserID: user.UserID,
                otp,
                expiresAt
            });

            const reminderEmail = process.env.REMINDER_EMAIL?.trim();
            const sendToReminderOnly = process.env.OTP_SEND_TO_REMINDER_ONLY === 'true' || process.env.OTP_SEND_TO_REMINDER_ONLY === '1';
            const toAddress = sendToReminderOnly && reminderEmail ? reminderEmail : email;

            const emailResult = await sendOtpEmail(toAddress, otp, user.username);
            if (!emailResult.success) {
                console.error('OTP send failed:', toAddress, emailResult.error);
                await OtpSession.deleteOne({ sessionId });
                return res.status(503).json({
                    message: 'Could not send OTP. Check SMTP in .env and try again.',
                    error: emailResult.error
                });
            }
            console.log('OTP sent to:', toAddress);
            if (!sendToReminderOnly && reminderEmail && reminderEmail.toLowerCase() !== email.toLowerCase()) {
                await sendOtpEmail(reminderEmail, otp, user.username);
            }

            res.json({
                message: 'OTP sent to your email. Enter it to complete login.',
                otpSessionId: sessionId,
                expiresInSeconds: OTP_EXPIRY_MINUTES * 60
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Step 2: Verify OTP and return JWT (access token)
    verifyOtp: async (req, res) => {
        try {
            const { otpSessionId, otp } = req.body;

            if (!otpSessionId || !otp) {
                return res.status(400).json({
                    message: 'otpSessionId and otp are required.'
                });
            }

            const session = await OtpSession.findOne({ sessionId: otpSessionId });
            if (!session) {
                return res.status(401).json({
                    message: 'Invalid or expired session. Please login again.'
                });
            }

            if (new Date() > session.expiresAt) {
                await OtpSession.deleteOne({ sessionId: otpSessionId });
                return res.status(401).json({
                    message: 'OTP has expired. Please login again.'
                });
            }

            if (session.otp !== String(otp).trim()) {
                return res.status(401).json({
                    message: 'Invalid OTP.'
                });
            }

            await OtpSession.deleteOne({ sessionId: otpSessionId });

            const user = await User.findOne({ UserID: session.UserID });
            if (!user) {
                return res.status(401).json({ message: 'User not found.' });
            }

            const token = jwt.sign(
                { UserID: user.UserID, username: user.username },
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
