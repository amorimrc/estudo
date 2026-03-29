const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { findOrCreateUser } = require('../db/queries');

const router = express.Router();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const user = findOrCreateUser({
        google_id: profile.id,
        name: profile.displayName,
        avatar_url: profile.photos?.[0]?.value ?? null,
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  }));
}

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).send('Login com Google não configurado. Adicione GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env');
  }
  passport.authenticate('google', { scope: ['profile'], session: false })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/?error=auth' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, name: req.user.name, avatar: req.user.avatar_url },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`/?token=${token}`);
  }
);

router.post('/logout', (_req, res) => {
  res.json({ ok: true });
});

module.exports = router;
