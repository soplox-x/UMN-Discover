import express from 'express';
import cors from 'cors';
import gradesRouter from './routes/grades.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/grades', gradesRouter);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server connected successfully!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});