/**
 * Transformer for updateUser mapping
 * Maps admin user fields to iconic-digital-frontend user API format
 * Based on API documentation: /api/users/:id (PUT)
 */

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  level?: string;
  membershipId?: string;
  accountBalance?: number;
  totalEarnings?: number;
  campaignsCompleted?: number;
  creditScore?: number;
  referralCode?: string;
  [key: string]: any;
}

export interface UserFrontendUser {
  name: string;
  level?: string;
  accountBalance?: number;
  totalEarnings?: number;
  campaignsCompleted?: number;
  creditScore?: number;
  [key: string]: any;
}

export function transformUpdateUser(adminData: AdminUser): UserFrontendUser {
  return {
    name: adminData.name,
    level: adminData.level || 'Bronze',
    accountBalance: adminData.accountBalance || 0,
    totalEarnings: adminData.totalEarnings || 0,
    campaignsCompleted: adminData.campaignsCompleted || 0,
    creditScore: adminData.creditScore || 100,
  };
}
