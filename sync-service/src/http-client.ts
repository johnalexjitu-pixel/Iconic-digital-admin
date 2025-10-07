import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { config } from './config.js';
import { logger } from './logger.js';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function exponentialBackoff(
  attempt: number,
  baseDelay: number = config.retry.delayMs
): Promise<void> {
  const delay = baseDelay * Math.pow(2, attempt);
  await sleep(delay);
}

export function createHttpClient(baseURL: string, headers: Record<string, string>): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers,
    timeout: 30000,
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    (config: any) => {
      logger.debug('HTTP Request', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
      });
      return config;
    },
    (error: any) => {
      logger.error('HTTP Request Error', { error: error.message });
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging
  client.interceptors.response.use(
    (response: any) => {
      logger.debug('HTTP Response', {
        status: response.status,
        url: response.config.url,
      });
      return response;
    },
    (error: any) => {
      if (axios.isAxiosError(error)) {
        logger.error('HTTP Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export async function makeRequestWithRetry<T>(
  client: AxiosInstance,
  requestConfig: AxiosRequestConfig,
  maxRetries: number = config.retry.maxRetries
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.request<T>(requestConfig);
      return response.data;
    } catch (error) {
      lastError = error as Error;
      const axiosError = error as AxiosError;
      
      if (axios.isAxiosError(axiosError)) {
        const status = axiosError.response?.status;
        
        // Don't retry on 4xx errors (client errors)
        if (status && status >= 400 && status < 500) {
          logger.warn('Client error, not retrying', {
            status,
            url: requestConfig.url,
            attempt,
          });
          throw error;
        }
        
        // Retry on 5xx errors (server errors) or network errors
        if (attempt < maxRetries) {
          logger.warn('Request failed, retrying', {
            status,
            url: requestConfig.url,
            attempt: attempt + 1,
            maxRetries,
          });
          await exponentialBackoff(attempt);
          continue;
        }
      }
      
      // If we've exhausted retries, throw the error
      throw error;
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export function isRetryableError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    // Retry on 5xx errors or network errors
    return !status || status >= 500;
  }
  return true;
}
