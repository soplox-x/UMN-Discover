import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './database.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'umn-discover-secret-key';

const validateUMNEmail = (email) => {
  const umnEmailPattern = /^[a-zA-Z0-9._%+-]+@(umn\.edu|tc\.umn\.edu|d\.umn\.edu|r\.umn\.edu|c\.umn\.edu|m\.umn\.edu|crk\.umn\.edu|morris\.umn\.edu|duluth\.umn\.edu|rochester\.umn\.edu)$/i;
  return umnEmailPattern.test(email);
};

const extractUsername = (email) => {
  return email.split('@')[0];
};

const useMockAccount = process.env.ACCOUNT === 'false';

if (!useMockAccount) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth environment variables are required: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      if (!validateUMNEmail(email)) {
        return done(null, false, { 
          message: 'Only University of Minnesota email addresses are allowed' 
        });
      }
      let result = await pool.query(
        'SELECT id, email, username, google_id, display_name, avatar_url FROM users WHERE email = $1 OR google_id = $2',
        [email, profile.id]
      );

      let user;

      if (result.rows.length > 0) {
        user = result.rows[0];
        if (!user.google_id) {
          await pool.query(
            'UPDATE users SET google_id = $1, display_name = $2, avatar_url = $3 WHERE id = $4',
            [profile.id, profile.displayName, profile.photos[0]?.value || null, user.id]
          );
          user.google_id = profile.id;
          user.display_name = profile.displayName;
          user.avatar_url = profile.photos[0]?.value || null;
        }
      } else {
        const username = extractUsername(email);
        let finalUsername = username;
        let counter = 1;
        while (true) {
          const usernameCheck = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [finalUsername]
          );

          if (usernameCheck.rows.length === 0) break;
          finalUsername = `${username}${counter}`;
          counter++;
        }
        const insertResult = await pool.query(
          'INSERT INTO users (email, username, google_id, display_name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, username, google_id, display_name, avatar_url',
          [
            email,
            finalUsername,
            profile.id,
            profile.displayName,
            profile.photos[0]?.value || null
          ]
        );

        user = insertResult.rows[0];
      }

      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return done(null, { user, token });
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
}

passport.serializeUser((data, done) => {
  done(null, data);
});

passport.deserializeUser((data, done) => {
  done(null, data);
});

export default passport;