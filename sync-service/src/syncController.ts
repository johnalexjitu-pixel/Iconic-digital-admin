import { AxiosInstance } from 'axios';
import { randomUUID } from 'crypto';
import { config, EndpointMapping } from './config.js';
import { createHttpClient, makeRequestWithRetry } from './http-client.js';
import { logger, logSyncAction, SyncLogEntry } from './logger.js';
import { transformData } from './transformers/index.js';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    page?: number;
    total?: number;
    hasMore?: boolean;
    nextCursor?: string;
  };
}

export interface FetchOptions {
  page?: number;
  limit?: number;
  cursor?: string;
  params?: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  processedCount: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  errors: Array<{
    resourceId?: string;
    error: string;
  }>;
  dryRun: boolean;
  actions?: Array<{
    action: string;
    resourceId: string;
    payload: any;
  }>;
}

export class SyncController {
  private adminClient: AxiosInstance;
  private userClient: AxiosInstance;

  constructor() {
    this.adminClient = createHttpClient(
      config.admin.base,
      config.admin.headers
    );
    this.userClient = createHttpClient(
      config.user.base,
      config.user.headers
    );
  }

  /**
   * Fetch data from admin API with pagination support
   */
  async fetchFromAdmin<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<PaginatedResponse<T>> {
    const { page = 1, limit = config.sync.batchSize, cursor, params = {} } = options;

    try {
      const queryParams: Record<string, any> = {
        ...params,
        limit,
      };

      // Handle different pagination styles
      if (cursor) {
        queryParams.cursor = cursor;
      } else {
        queryParams.page = page;
      }

      const response = await makeRequestWithRetry<any>(this.adminClient, {
        method: 'GET',
        url: endpoint,
        params: queryParams,
      });

      // Normalize response structure
      if (Array.isArray(response)) {
        return { data: response };
      }

      // Handle common API response formats
      const data = response.data || response.results || response.items || [];
      const meta = {
        page: response.page || response.currentPage || page,
        total: response.total || response.totalCount,
        hasMore: response.hasMore || (response.page && response.totalPages && response.page < response.totalPages),
        nextCursor: response.nextCursor || response.next,
      };

      return { data: Array.isArray(data) ? data : [data], meta };
    } catch (error: any) {
      logger.error('Failed to fetch from admin API', {
        endpoint,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Transform data for user API
   */
  transformForUser(data: any, mapping: EndpointMapping): any {
    if (!mapping.requiresTransform) {
      return data;
    }

    try {
      return transformData(mapping.name, data);
    } catch (error: any) {
      logger.error('Transformation failed', {
        mapping: mapping.name,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send data to user API with idempotency support
   */
  async sendToUser(
    endpoint: string,
    method: string,
    payload: any,
    idempotencyKey: string,
    dryRun: boolean = false
  ): Promise<any> {
    if (dryRun) {
      logger.info('DRY RUN: Would send to user API', {
        endpoint,
        method,
        payload,
        idempotencyKey,
      });
      return { dryRun: true, payload };
    }

    try {
      const response = await makeRequestWithRetry<any>(this.userClient, {
        method,
        url: endpoint,
        data: payload,
        headers: {
          'x-idempotency-key': idempotencyKey,
        },
      });

      return response;
    } catch (error: any) {
      logger.error('Failed to send to user API', {
        endpoint,
        method,
        error: error.message,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Run batch synchronization for a specific mapping
   */
  async runBatchSync(
    mappingName: string,
    options: {
      mode?: 'sync' | 'dry-run';
      limit?: number;
      page?: number;
    } = {}
  ): Promise<SyncResult> {
    const requestId = randomUUID();
    const startTime = Date.now();
    
    const mode = options.mode || config.sync.mode;
    const isDryRun = mode === 'dry-run';
    const limit = options.limit || config.sync.batchSize;

    logger.info('Starting batch sync', {
      requestId,
      mappingName,
      mode,
      limit,
    });

    const mapping = config.mappings.find(m => m.name === mappingName);
    
    if (!mapping) {
      const error = `Mapping '${mappingName}' not found`;
      logger.error(error, { requestId });
      return {
        success: false,
        processedCount: 0,
        successCount: 0,
        failureCount: 0,
        skippedCount: 0,
        errors: [{ error }],
        dryRun: isDryRun,
      };
    }

    const result: SyncResult = {
      success: true,
      processedCount: 0,
      successCount: 0,
      failureCount: 0,
      skippedCount: 0,
      errors: [],
      dryRun: isDryRun,
      actions: [],
    };

    try {
      // Fetch data from admin API
      const fetchResponse = await this.fetchFromAdmin(
        mapping.adminEndpoint,
        { limit, page: options.page }
      );

      const items = fetchResponse.data;
      result.processedCount = items.length;

      logger.info(`Fetched ${items.length} items from admin API`, {
        requestId,
        mappingName,
      });

      // Process each item
      for (const item of items) {
        const itemData = item as any;
        const itemId = itemData[mapping.idField || 'id'];
        const logEntry: SyncLogEntry = {
          requestId,
          mappingName,
          action: mapping.method,
          status: 'success',
          adminResourceId: itemId,
          timestamp: new Date().toISOString(),
        };

        try {
          // Transform data
          const transformedData = this.transformForUser(itemData, mapping);
          
          // Generate idempotency key
          const idempotencyKey = `${itemId}-${mappingName}-${Date.now()}`;
          
          // Send to user API
          const response = await this.sendToUser(
            mapping.userEndpoint,
            mapping.method,
            transformedData,
            idempotencyKey,
            isDryRun
          );

          if (isDryRun) {
            result.actions?.push({
              action: mapping.method,
              resourceId: itemId,
              payload: transformedData,
            });
          } else {
            logEntry.userResourceId = response.id || response._id;
          }

          result.successCount++;
          logSyncAction(logEntry);

          // Rate limiting
          await sleep(config.rateLimit.delayMs);
        } catch (error: any) {
          logEntry.status = 'error';
          logEntry.error = error.message;
          logSyncAction(logEntry);

          result.failureCount++;
          result.errors.push({
            resourceId: itemId,
            error: error.message,
          });

          // Continue processing other items
          continue;
        }
      }

      const duration = Date.now() - startTime;
      
      logger.info('Batch sync completed', {
        requestId,
        mappingName,
        duration,
        ...result,
      });

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      logger.error('Batch sync failed', {
        requestId,
        mappingName,
        duration,
        error: error.message,
      });

      result.success = false;
      result.errors.push({ error: error.message });
      
      return result;
    }
  }
}
