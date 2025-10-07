/**
 * Transformer for syncTransactions mapping
 * Maps admin transaction fields to iconic-digital-frontend transaction format
 * Based on API documentation: /api/transactions (POST)
 */

export interface AdminTransaction {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  campaignId?: string;
  status: string;
  method?: string;
  reference?: string;
  metadata?: any;
  [key: string]: any;
}

export interface UserFrontendTransaction {
  userId: string;
  type: string;
  amount: number;
  description: string;
  campaignId?: string;
  status: string;
  method: string;
  reference?: string;
  metadata?: any;
  [key: string]: any;
}

export function transformSyncTransactions(adminData: AdminTransaction): UserFrontendTransaction {
  return {
    userId: adminData.userId,
    type: adminData.type || 'campaign_earning',
    amount: adminData.amount,
    description: adminData.description,
    campaignId: adminData.campaignId,
    status: adminData.status || 'completed',
    method: adminData.method || 'bank_transfer',
    reference: adminData.reference,
    metadata: adminData.metadata || {},
  };
}
