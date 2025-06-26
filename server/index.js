import express from 'express';
import cors from 'cors';
import path from 'path';
import gradesRouter from './routes/grades.js';
import authRouter from './routes/auth.js';
import socialRouter from './routes/social.js';
import { initializeDatabase } from './config/database.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
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
});