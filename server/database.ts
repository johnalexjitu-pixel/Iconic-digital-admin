import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://iconicdigital:iconicdigital@iconicdigital.t5nr2g9.mongodb.net/iconicdigital?retryWrites=true&w=majority&appName=iconicdigital';
const DB_NAME = 'iconicdigital';

let client: MongoClient | null = null;
let db: Db | null = null;

// User Interface
export interface IUser {
  _id?: ObjectId;
  name: string;
  username?: string;
  email: string;
  password: string;
  withdrawalPassword?: string;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  vipLevel?: string;
  membershipId: string;
  referralCode: string;
  creditScore: number;
  avatar?: string;
  accountBalance: number;
  actualWalletBalance?: number;
  walletBalance?: number;
  totalEarnings: number;
  campaignsCompleted: number;
  phoneNumber?: string;
  lastLogin: Date;
  dailyCheckIn: {
    lastCheckIn?: Date;
    streak: number;
    daysClaimed: number[];
  };
  withdrawalInfo?: {
    method: string;
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    branch: string;
    documentsUploaded: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Campaign Interface
export interface ICampaign {
  _id?: ObjectId;
  campaignId: string;
  code: string;
  brand: string;
  logo: string;
  description: string;
  type: 'Social' | 'Paid' | 'Creative' | 'Influencer';
  commissionRate: number;
  commissionAmount: number;
  baseAmount: number;
  profit: number;
  taskCode: string;
  status: 'Active' | 'Completed' | 'Pending' | 'Cancelled';
  requirements: string[];
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Interface
export interface ITransaction {
  _id?: ObjectId;
  transactionId: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  campaignId?: string;
  status: string;
  method: string;
  reference: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Interface
export interface IAdmin {
  _id?: ObjectId;
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'superadmin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Product Interface
export interface IProduct {
  _id?: ObjectId;
  name: string;
  code: string;
  price: number;
  image?: string;
  imageType?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Task Assignment Interface
export interface ICustomerTask {
  _id?: ObjectId;
  customerId: string;
  customerCode: string;
  taskNumber: number;
  campaignId: string;
  taskCommission: number;
  taskPrice: number;
  estimatedNegativeAmount: number;
  priceFrom: number;
  priceTo: number;
  hasGoldenEgg: boolean;
  expiredDate: Date;
  status: 'pending' | 'completed' | 'expired';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Daily Check-In Interface
export interface IDailyCheckIn {
  _id?: ObjectId;
  dayNumber: number;
  amount: number;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// VIP Level Interface
export interface IVIPLevel {
  _id?: ObjectId;
  name: string;
  minAmount: number;
  taskCount: number;
  threeTask: string;
  commissionPercentage: number;
  comboCommissionPercentage: number;
  productRangeMin: number;
  productRangeMax: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  completedTasksToWithdraw: number;
  withdrawalFees: number;
  createdAt: Date;
  updatedAt: Date;
}

// Database connection
export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${DB_NAME}`);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Get collections
export function getUsersCollection(): Collection<IUser> {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection<IUser>('users');
}

export function getCampaignsCollection(): Collection<ICampaign> {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection<ICampaign>('campaigns');
}

export function getTransactionsCollection(): Collection<ITransaction> {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection<ITransaction>('transactions');
}

export function getAdminsCollection(): Collection<IAdmin> {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection<IAdmin>('admins');
}

export function getCustomerTasksCollection(): Collection<ICustomerTask> {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection<ICustomerTask>('customerTasks');
}

export function getDailyCheckInsCollection(): Collection<IDailyCheckIn> {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection<IDailyCheckIn>('dailyCheckIns');
}

export function getVIPLevelsCollection(): Collection<IVIPLevel> {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection<IVIPLevel>('vipLevels');
}

export function getProductsCollection(): Collection<IProduct> {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection<IProduct>('products');
}

// Disconnect
export async function disconnectFromDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 Disconnected from MongoDB');
  }
}