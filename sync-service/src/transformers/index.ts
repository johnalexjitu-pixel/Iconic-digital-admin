/**
 * Transformer registry
 * Maps transformer names to their functions
 * Updated for iconic-digital-frontend API endpoints
 */

import { transformSyncUsers } from './syncUsers.js';
import { transformUpdateUser } from './updateUser.js';
import { transformSyncCampaigns } from './syncCampaigns.js';
import { transformUpdateCampaign } from './updateCampaign.js';
import { transformSyncTransactions } from './syncCustomers.js'; // Renamed file content

type TransformerFunction = (data: any) => any;

const transformers: Record<string, TransformerFunction> = {
  syncUsers: transformSyncUsers,
  updateUser: transformUpdateUser,
  syncCampaigns: transformSyncCampaigns,
  updateCampaign: transformUpdateCampaign,
  syncTransactions: transformSyncTransactions,
};

export function getTransformer(mappingName: string): TransformerFunction | undefined {
  return transformers[mappingName];
}

export function transformData(mappingName: string, data: any): any {
  const transformer = getTransformer(mappingName);
  
  if (!transformer) {
    // If no transformer exists, return data as-is
    return data;
  }
  
  return transformer(data);
}
