import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import passport from './config/passport.js';
import gradesRouter from './routes/grades.js';
import authRouter from './routes/auth.js';
import socialRouter from './routes/social.js';
import { initializeDatabase } from './config/database.js';

const app = express();
const PORT = 3001;
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  process.exit(1);
}

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'umn-discover-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/images', express.static(path.join(process.cwd(), 'images')));

initializeDatabase();

app.use('/api/grades', gradesRouter);
app.use('/api/auth', authRouter);
app.use('/api/social', socialRouter);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server connected successfully!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Google OAuth configured successfully');
});