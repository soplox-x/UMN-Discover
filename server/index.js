import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import passport from './config/passport.js';
import gradesRouter from './routes/grades.js';
import professorsRouter from './routes/professors.js';
import reviewsRouter from './routes/reviews.js';

// Import the professor data processor to manage its lifecycle
import professorDataProcessor from './utils/professorDataProcessor.js';

const app = express(); 
const PORT = 3001;
const useMockAccount = process.env.ACCOUNT === 'false';

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
app.use('/images', express.static(path.join(process.cwd(), 'images')));

if (useMockAccount) {
  console.log('Mock account enabled!');
  console.log('Database disabled due to mock account mode');
  app.use((req, res, next) => {
    req.user = {
      id: 'mock-user',
      email: 'mock@example.com',
      username: 'mockuser',
      display_name: 'Mock Developer',
      avatar_url: null
    };
    next();
  });
} else {
  const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:');
    missingEnvVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  const { initializeDatabase } = await import('./config/database.js');
  const authRouter = (await import('./routes/auth.js')).default;
  const socialRouter = (await import('./routes/social.js')).default;

  initializeDatabase();

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/api/auth', authRouter);
  app.use('/api/social', socialRouter);
}

app.use('/api/grades', gradesRouter);
app.use('/api/professors', professorsRouter);
app.use('/api/reviews', reviewsRouter);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server connected successfully!' });
});


// --- PROFESSOR DATA LIFECYCLE MANAGEMENT ---
// 1. Immediately load the existing professor list from the file for a fast server start.
professorDataProcessor.initializeFromFile();

// 2. Trigger the first background refresh 10 seconds after the server starts.
//    This fetches the latest professor list without slowing down the initial startup.
setTimeout(() => {
  professorDataProcessor.refreshProfessorList();
}, 10 * 1000); 

// 3. Schedule the background refresh to run automatically every 24 hours.
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;
setInterval(() => {
  professorDataProcessor.refreshProfessorList();
}, TWENTY_FOUR_HOURS_IN_MS);
// --- END OF NEW SECTION ---


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!useMockAccount) {
    console.log('Google OAuth configured successfully');
  }
});