import express from 'express';
import cors from 'cors';
import gradesRouter from './routes/grades.js';
import authRouter from './routes/auth.js';
import { initializeDatabase } from './config/database.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.use('/api/grades', gradesRouter);
app.use('/api/auth', authRouter);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server connected successfully!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});