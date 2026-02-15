import express from 'express';
import matchRoutes from './routes/matches.js';
import http from 'http';
import { attachWebscoketServer } from './ws/server.js';
import { securityMiddleware } from './arcjet.js';

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();

const server = http.createServer(app);

app.use(express.json());

// Root GET route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sportzy API!' });
});

app.use(securityMiddleware())

app.use('/matches', matchRoutes);

const { broadcastMatchCreated } = attachWebscoketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
// Start the server

server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

    console.log(`Server is running on ${baseUrl}`);
    console.log(`WebSocket Server is running on ${baseUrl.replace('http', 'ws')}/ws`);
});