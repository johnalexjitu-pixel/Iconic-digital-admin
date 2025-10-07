/**
 * Transformer for syncCampaigns mapping
 * Maps admin campaign fields to iconic-digital-frontend campaign format
 * Based on API documentation: /api/campaigns (POST)
 */

export interface AdminCampaign {
  _id: string;
  brand: string;
  logo?: string;
  description: string;
  type: string;
  commissionRate: number;
  commissionAmount: number;
  baseAmount: number;
  profit: number;
  requirements?: string[];
  duration: number;
  maxParticipants: number;
  startDate: string | Date;
  endDate: string | Date;
  [key: string]: any;
}

export interface UserFrontendCampaign {
  brand: string;
  logo: string;
  description: string;
  type: string;
  commissionRate: number;
  commissionAmount: number;
  baseAmount: number;
  profit: number;
  requirements: string[];
  duration: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  [key: string]: any;
}

export function transformSyncCampaigns(adminData: AdminCampaign): UserFrontendCampaign {
  return {
    brand: adminData.brand,
    logo: adminData.logo || '🎯',
    description: adminData.description,
    type: adminData.type || 'Social',
    commissionRate: adminData.commissionRate,
    commissionAmount: adminData.commissionAmount,
    baseAmount: adminData.baseAmount,
    profit: adminData.profit,
    requirements: adminData.requirements || [],
    duration: adminData.duration,
    maxParticipants: adminData.maxParticipants,
    startDate: typeof adminData.startDate === 'string' 
      ? adminData.startDate 
      : adminData.startDate.toISOString(),
    endDate: typeof adminData.endDate === 'string' 
      ? adminData.endDate 
      : adminData.endDate.toISOString(),
  };
}
