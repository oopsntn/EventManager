const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Kiểm tra user đã tồn tại chưa
        let user = await User.findOne({ 
            $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value }
            ]
        });

        if (user) {
            // Nếu user tồn tại nhưng chưa có googleId, cập nhật
            if (!user.googleId) {
                user.googleId = profile.id;
                user.is_verified = true; // Google account đã verified
                await user.save();
            }
            return done(null, user);
        }

        // Tạo user mới
        user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            role: 'user',
            is_verified: true, // Google account đã verified
            password: 'google_oauth' // Placeholder password
        });

        await user.save();
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
