import { Router, Request, Response } from 'express';
import { SyncController } from './syncController.js';
import { config, getMapping } from './config.js';
import { logger } from './logger.js';

export const router = Router();
const syncController = new SyncController();

/**
 * Authentication middleware
 */
function authenticateSync(req: Request, res: Response, next: Function) {
  const token = req.headers['x-sync-secret'];
  
  if (!token || token !== config.sync.secret) {
    logger.warn('Unauthorized sync request', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing x-sync-secret header',
    });
  }
  
  next();
}

/**
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'sync-service',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get available mappings
 */
router.get('/mappings', authenticateSync, (_req: Request, res: Response) => {
  res.json({
    success: true,
    mappings: config.mappings.map(m => ({
      name: m.name,
      method: m.method,
      adminEndpoint: m.adminEndpoint,
      userEndpoint: m.userEndpoint,
      requiresTransform: m.requiresTransform,
    })),
  });
});

/**
 * Get specific mapping details
 */
router.get('/mappings/:name', authenticateSync, (req: Request, res: Response) => {
  const mapping = getMapping(req.params.name);
  
  if (!mapping) {
    return res.status(404).json({
      success: false,
      error: `Mapping '${req.params.name}' not found`,
    });
  }
  
  res.json({
    success: true,
    mapping,
  });
});

/**
 * Run synchronization
 */
router.post('/run', authenticateSync, async (req: Request, res: Response) => {
  try {
    const { mappingName, mode, limit, page } = req.body;
    
    if (!mappingName) {
      return res.status(400).json({
        success: false,
        error: 'mappingName is required',
      });
    }
    
    const mapping = getMapping(mappingName);
    if (!mapping) {
      return res.status(404).json({
        success: false,
        error: `Mapping '${mappingName}' not found`,
      });
    }
    
    logger.info('Sync request received', {
      mappingName,
      mode: mode || config.sync.mode,
      limit,
      page,
      ip: req.ip,
    });
    
    const result = await syncController.runBatchSync(mappingName, {
      mode: mode || config.sync.mode,
      limit,
      page,
    });
    
    res.json({
      success: result.success,
      result,
    });
  } catch (error: any) {
    logger.error('Sync request failed', {
      error: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Run multiple mappings in sequence
 */
router.post('/run-batch', authenticateSync, async (req: Request, res: Response) => {
  try {
    const { mappings, mode, limit } = req.body;
    
    if (!Array.isArray(mappings) || mappings.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'mappings array is required',
      });
    }
    
    logger.info('Batch sync request received', {
      mappings,
      mode: mode || config.sync.mode,
      limit,
      ip: req.ip,
    });
    
    const results = [];
    
    for (const mappingName of mappings) {
      const mapping = getMapping(mappingName);
      
      if (!mapping) {
        results.push({
          mappingName,
          success: false,
          error: `Mapping '${mappingName}' not found`,
        });
        continue;
      }
      
      const result = await syncController.runBatchSync(mappingName, {
        mode: mode || config.sync.mode,
        limit,
      });
      
      results.push({
        mappingName,
        ...result,
      });
    }
    
    const allSuccess = results.every(r => r.success);
    
    res.json({
      success: allSuccess,
      results,
    });
  } catch (error: any) {
    logger.error('Batch sync request failed', {
      error: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
