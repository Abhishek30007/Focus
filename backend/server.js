const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { seedSessions } = require('./utils/seeder');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
  seedSessions();
});

const app = express();

// Latency Reduction: Gzip compression middleware (for payloads > 1kb)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024
}));

// Body parser
app.use(express.json());

// Cookie parser for token handling
app.use(cookieParser());

// Enable CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token']
};
app.use(cors(corsOptions));

// General API rate limiter
app.use('/api', apiLimiter);

// -------------------------------------------------------------
// V1 API Routes (Modular Architecture satisfying strict specs)
// -------------------------------------------------------------
const v1AuthRoutes = require('./routes/v1/authRoutes');
const v1SessionRoutes = require('./routes/v1/sessionRoutes');
const v1MetricsRoutes = require('./routes/v1/metricsRoutes');
const v1TraditionRoutes = require('./routes/v1/traditionRoutes');

app.use('/api/v1/auth', v1AuthRoutes);
app.use('/api/v1/sessions', v1SessionRoutes);
app.use('/api/v1/metrics', v1MetricsRoutes);
app.use('/api/v1/traditions', v1TraditionRoutes);

// -------------------------------------------------------------
// Legacy API Route Bindings (Ensures seamless backward compatibility)
// -------------------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/settings', require('./routes/settings'));

// Root route (health check)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the FocusFlow API',
    version: '1.0.0',
    modules: ['v1/auth', 'v1/sessions', 'v1/metrics', 'v1/traditions', 'gemini-service']
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    if (process.env.NODE_ENV === 'production' && server) {
      server.close(() => process.exit(1));
    }
  });
}

module.exports = app;
