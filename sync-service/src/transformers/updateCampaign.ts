/**
 * Transformer for updateCampaign mapping
 * Maps admin campaign update fields to iconic-digital-frontend campaign format
 * Based on API documentation: /api/campaigns/:id (PUT)
 */

export interface AdminCampaignUpdate {
  _id: string;
  status?: string;
  currentParticipants?: number;
  isActive?: boolean;
  [key: string]: any;
}

export interface UserFrontendCampaignUpdate {
  status?: string;
  currentParticipants?: number;
  isActive?: boolean;
  [key: string]: any;
}

export function transformUpdateCampaign(adminData: AdminCampaignUpdate): UserFrontendCampaignUpdate {
  return {
    status: adminData.status,
    currentParticipants: adminData.currentParticipants,
    isActive: adminData.isActive,
  };
}
