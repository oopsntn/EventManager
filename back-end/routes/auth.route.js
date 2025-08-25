const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken, checkRole } = require('../middleware/auth');
const passport = require('passport');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);

router.get('/admin', authenticateToken, checkRole(['admin'], (req, res) => {
    res.send('Hello Admin!');
}));

router.get('/organizer', authenticateToken, checkRole(['organizer','admin'], (req,res) => {
    res.send('Hello Organizer!');
}));

router.get('/user', authenticateToken, checkRole(['user', 'organizer', 'admin']), (req,res) => {
    res.send('Hello User!');
});

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/api/auth/google/failure' }),
    authController.googleSuccess
);
module.exports = router;