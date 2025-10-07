import dotenv from 'dotenv';

dotenv.config();

export interface EndpointMapping {
  name: string;
  adminEndpoint: string;
  userEndpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  idField?: string;
  paginationStyle?: 'page' | 'cursor' | 'offset';
  requiresTransform?: boolean;
}

export interface ApiConfig {
  base: string;
  headers: {
    Authorization: string;
    'Content-Type': string;
  };
}

export const config = {
  admin: {
    base: process.env.ADMIN_API_BASE || '',
    headers: {
      Authorization: process.env.ADMIN_AUTH_HEADER || '',
      'Content-Type': 'application/json',
    },
  } as ApiConfig,
  
  user: {
    base: process.env.USER_API_BASE || '',
    headers: {
      Authorization: process.env.USER_AUTH_HEADER || '',
      'Content-Type': 'application/json',
    },
  } as ApiConfig,
  
  sync: {
    batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '100', 10),
    mode: (process.env.SYNC_MODE || 'dry-run') as 'sync' | 'dry-run',
    port: parseInt(process.env.SYNC_PORT || '3001', 10),
    secret: process.env.SYNC_SECRET || '',
  },
  
  retry: {
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    delayMs: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),
  },
  
  rateLimit: {
    delayMs: parseInt(process.env.RATE_LIMIT_DELAY_MS || '100', 10),
  },
  
  // Endpoint mappings configuration
  // Based on iconic-digital-frontend API documentation
  // Production: iconicdigital.com
  mappings: [
    {
      name: 'syncUsers',
      adminEndpoint: '/admin/users',
      userEndpoint: '/api/auth/register',
      method: 'POST',
      idField: '_id',
      paginationStyle: 'page',
      requiresTransform: true,
    },
    {
      name: 'updateUser',
      adminEndpoint: '/admin/users',
      userEndpoint: '/api/users',
      method: 'PUT',
      idField: '_id',
      paginationStyle: 'page',
      requiresTransform: true,
    },
    {
      name: 'syncCampaigns',
      adminEndpoint: '/admin/campaigns',
      userEndpoint: '/api/campaigns',
      method: 'POST',
      idField: '_id',
      paginationStyle: 'page',
      requiresTransform: true,
    },
    {
      name: 'updateCampaign',
      adminEndpoint: '/admin/campaigns',
      userEndpoint: '/api/campaigns',
      method: 'PUT',
      idField: '_id',
      paginationStyle: 'page',
      requiresTransform: true,
    },
    {
      name: 'syncTransactions',
      adminEndpoint: '/admin/transactions',
      userEndpoint: '/api/transactions',
      method: 'POST',
      idField: '_id',
      paginationStyle: 'page',
      requiresTransform: true,
    },
    {
      name: 'syncDashboardStats',
      adminEndpoint: '/admin/dashboard/stats',
      userEndpoint: '/api/dashboard/stats',
      method: 'POST',
      idField: '_id',
      paginationStyle: 'page',
      requiresTransform: false,
    },
    {
      name: 'syncDashboardAnalytics',
      adminEndpoint: '/admin/dashboard/analytics',
      userEndpoint: '/api/dashboard/analytics',
      method: 'POST',
      idField: '_id',
      paginationStyle: 'page',
      requiresTransform: false,
    },
  ] as EndpointMapping[],
};

export function getMapping(name: string): EndpointMapping | undefined {
  return config.mappings.find(m => m.name === name);
}

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.admin.base) {
    errors.push('ADMIN_API_BASE is required');
  }
  
  if (!config.admin.headers.Authorization) {
    errors.push('ADMIN_AUTH_HEADER is required');
  }
  
  if (!config.user.base) {
    errors.push('USER_API_BASE is required');
  }
  
  if (!config.user.headers.Authorization) {
    errors.push('USER_AUTH_HEADER is required');
  }
  
  if (!config.sync.secret) {
    errors.push('SYNC_SECRET is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
