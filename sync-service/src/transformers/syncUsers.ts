/**
 * Transformer for syncUsers mapping
 * Maps admin user fields to iconic-digital-frontend user registration format
 * Based on API documentation: /api/auth/register (POST)
 */

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  level?: string;
  membershipId?: string;
  accountBalance?: number;
  totalEarnings?: number;
  campaignsCompleted?: number;
  creditScore?: number;
  referralCode?: string;
  [key: string]: any;
}

export interface UserFrontendRegistration {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
  [key: string]: any;
}

export function transformSyncUsers(adminData: AdminUser): UserFrontendRegistration {
  return {
    name: adminData.name,
    email: adminData.email,
    password: adminData.password || 'defaultPassword123', // Admin should provide proper password
    referralCode: adminData.referralCode,
  };
}
