import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { createApiRouter } from './routes/api';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// API Router with Socket.IO instance
app.use('/api', createApiRouter(io));

import path from 'path';
import fs from 'fs';

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', system: 'Kanchivaram Cafe Operating System API', timestamp: new Date() });
});

// Serve frontend static assets from dist
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Socket.IO event listeners
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

import { ensureDatabaseInitialized } from './initDb';

const PORT = process.env.PORT || 5000;

ensureDatabaseInitialized().finally(() => {
  server.listen(PORT, () => {
    console.log(`⚡ Kanchivaram Cafe Backend Server running on http://localhost:${PORT}`);
  });
});
