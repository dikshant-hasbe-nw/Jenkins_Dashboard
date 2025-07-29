import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { redisClient } from './utils/redis';
import { prisma } from './utils/database';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import routes
import authRoutes from './routes/auth';
import jenkinsRoutes from './routes/jenkins';
import dashboardRoutes from './routes/dashboard';
import analyticsRoutes from './routes/analytics';
import webhooksRoutes from './routes/webhooks';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'),
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(limiter);

// Session configuration
app.use(session({
  secret: process.env['SESSION_SECRET'] || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env['NODE_ENV'] === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jenkins', jenkinsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhooksRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  await redisClient.quit();
  process.exit(0);
});

const PORT = process.env['PORT'] || 3001;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
});

export { app, io }; 