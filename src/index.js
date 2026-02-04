import express from 'express';
import matchRoutes from './routes/matches.js';
const app = express();
const PORT = 8000;

// Use JSON middleware
app.use(express.json());

// Root GET route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sportzy API!' });
});

app.use('/matches', matchRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
});