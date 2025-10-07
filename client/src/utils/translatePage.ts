// Utility to help translate pages
// This file contains common text replacements for translation

export const commonTranslations = {
  // Headers
  'Customer Management': 'customerManagement',
  'User Management': 'userManagement',
  'Task Management': 'taskManagement',
  'Withdrawal Management': 'withdrawalManagement',
  'Dashboard': 'dashboard',
  
  // Buttons
  'Create Customer': 'createCustomer',
  'Edit Profile': 'editProfile',
  'Edit Balance': 'editBalance',
  'Filter': 'filter',
  'Back': 'back',
  'Cancel': 'cancel',
  'Confirm': 'confirm',
  'Save': 'save',
  'Update': 'update',
  'Approve': 'approve',
  'Reject': 'reject',
  'Task': 'task',
  'Combo Task': 'comboTask',
  'Reset Task': 'resetTask',
  'Activate': 'activate',
  'Deactivate': 'deactivate',
  
  // Labels
  'Created Date': 'createdDate',
  'Login User Name': 'loginUserName',
  'Code': 'code',
  'IP Address': 'ipAddress',
  'Phone Number': 'phoneNumber',
  'Customer Status': 'customerStatus',
  'Online/Offline': 'onlineOffline',
  'Customer Name': 'customerName',
  'Email': 'email',
  'Password': 'password',
  'Level': 'level',
  'Credit Score': 'creditScore',
  'Account Balance': 'accountBalance',
  'Total Earnings': 'totalEarnings',
  'Campaigns Completed': 'campaignsCompleted',
  'Membership ID': 'membershipId',
  'Referral Code': 'referralCode',
  
  // Table Headers
  'Details': 'details',
  'Account Management': 'accountManagement',
  'Bank Account Details': 'bankAccountDetails',
  'Task Plan': 'taskPlan',
  'Setting': 'setting',
  'Status': 'status',
  'Actions': 'actions',
  'Action': 'action',
  
  // Common Words
  'All': 'all',
  'Active': 'active',
  'Inactive': 'inactive',
  'Online': 'online',
  'Offline': 'offline',
  'Pending': 'pending',
  'Approved': 'approved',
  'Rejected': 'rejected',
  'Today': 'today',
  'Yesterday': 'yesterday',
  'Total': 'total',
  
  // Account Management
  'Actual Account': 'actualAccount',
  'Allow To Start Task': 'allowToStartTask',
  'Allow To Complete Task': 'allowToCompleteTask',
  'Allowed To Withdraw': 'allowedToWithdraw',
  'Allow To Use Referral Code': 'allowToUseReferralCode',
  'Wallet Balance': 'walletBalance',
  'Actual Wallet Balance': 'actualWalletBalance',
  'Login Password': 'loginPassword',
  'Pay Password': 'payPassword',
  
  // IP Info
  'IP Country': 'ipCountry',
  'IP Region': 'ipRegion',
  'IP ISP': 'ipISP',
  
  // Task Info
  'Everyday': 'everyday',
  'Completed': 'completed',
  'Total Deposit': 'totalDeposit',
  'Today Commission': 'todayCommission',
  'Total Commission': 'totalCommission',
  
  // Withdrawal
  'Date': 'date',
  'Admin': 'admin',
  'Withdrawal Amount': 'withdrawalAmount',
  'Bank Name': 'bankName',
  'Bank Account Holder': 'bankAccountHolder',
  'IBAN': 'iban',
  'Contact Number': 'contactNumber',
  'Branch': 'branch',
  'Actual Amount': 'actualAmount',
  'Updated By': 'updatedBy',
  
  // User Management
  'Admin Name': 'adminName',
  'Whatsapp Url': 'whatsappUrl',
  'Telegram Url': 'telegramUrl',
  
  // Task Management
  'Product Image': 'productImage',
  'Product Name': 'productName',
  'Product Price': 'productPrice',
  'Product Code': 'productCode',
  'Rows per page': 'rowsPerPage',
  
  // Edit Balance Modal
  'Edit Customer Balance': 'editCustomerBalance',
  'Customer Information': 'customerInformation',
  'Current Balance': 'currentBalance',
  'Operation': 'operation',
  'Amount': 'amount',
  'Add': 'add',
  'Subtract': 'subtract',
  'Enter amount': 'enterAmount',
  'New Balance will be': 'newBalanceWillBe',
  'Update Balance': 'updateBalance',
  'Updating...': 'updating',
  
  // Create Customer
  'Auto Generate': 'autoGenerate',
  'Recommend By': 'recommendBy',
  'Update Customer Profile': 'updateCustomerProfile',
  'Confirm Create Customer': 'confirmCreateCustomer',
  'Enter customer name': 'enterCustomerName',
  'Enter email': 'enterEmail',
  'Enter phone number': 'enterPhoneNumber',
  'Enter password': 'enterPassword',
};

// Helper function to get translation key
export function getTranslationKey(text: string): string {
  return commonTranslations[text as keyof typeof commonTranslations] || text;
}

// Instructions for translating a page:
/*
1. Import useTranslation:
   import { useTranslation } from "react-i18next";

2. Use in component:
   const { t } = useTranslation();

3. Replace text:
   "Customer Management" → {t('customerManagement')}
   "Create Customer" → {t('createCustomer')}
   
4. For labels with colons:
   "Email:" → {t('email')}:
   
5. For conditional text:
   {customer.isActive ? "Active" : "Inactive"}
   → {customer.isActive ? t('active') : t('inactive')}
*/
