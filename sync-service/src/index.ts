import express from 'express';
import { config, validateConfig } from './config.js';
import { router } from './routes.js';
import { logger } from './logger.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Mount sync routes
app.use('/sync', router);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'Sync Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/sync/health',
      mappings: '/sync/mappings',
      run: 'POST /sync/run',
      runBatch: 'POST /sync/run-batch',
    },
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Validate configuration
const configValidation = validateConfig();
if (!configValidation.valid) {
  logger.error('Configuration validation failed', {
    errors: configValidation.errors,
  });
  console.error('❌ Configuration errors:');
  configValidation.errors.forEach(err => console.error(`  - ${err}`));
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Start server
const PORT = config.sync.port;

app.listen(PORT, () => {
  logger.info('Sync service started', { port: PORT });
  console.log(`\n🚀 Sync Service running on http://localhost:${PORT}`);
  console.log(`📊 Mode: ${config.sync.mode}`);
  console.log(`📦 Batch size: ${config.sync.batchSize}`);
  console.log(`\nEndpoints:`);
  console.log(`  - Health: GET http://localhost:${PORT}/sync/health`);
  console.log(`  - Mappings: GET http://localhost:${PORT}/sync/mappings`);
  console.log(`  - Run sync: POST http://localhost:${PORT}/sync/run`);
  console.log(`\nUse x-sync-secret header for authentication\n`);
});

export default app;
