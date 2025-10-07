import {
  type Customer,
  type InsertCustomer,
  type Withdrawal,
  type InsertWithdrawal,
  type Product,
  type InsertProduct,
  type Admin,
  type InsertAdmin,
  type DailyCheckIn,
  type InsertDailyCheckIn,
  type VipLevel,
  type InsertVipLevel,
  type Stats,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Stats
  getStats(): Promise<Stats>;
  
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer>;
  
  // Withdrawals
  getWithdrawals(): Promise<Withdrawal[]>;
  getWithdrawal(id: string): Promise<Withdrawal | undefined>;
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  updateWithdrawal(id: string, withdrawal: Partial<Withdrawal>): Promise<Withdrawal>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Admins
  getAdmins(): Promise<Admin[]>;
  getAdmin(id: string): Promise<Admin | undefined>;
  
  // Daily Check-ins
  getDailyCheckIns(): Promise<DailyCheckIn[]>;
  updateDailyCheckIn(id: string, checkIn: Partial<DailyCheckIn>): Promise<DailyCheckIn>;
  
  // VIP Levels
  getVipLevels(): Promise<VipLevel[]>;
  getVipLevel(id: string): Promise<VipLevel | undefined>;
}

export class MemStorage implements IStorage {
  private stats: Stats;
  private customers: Map<string, Customer>;
  private withdrawals: Map<string, Withdrawal>;
  private products: Map<string, Product>;
  private admins: Map<string, Admin>;
  private dailyCheckIns: Map<string, DailyCheckIn>;
  private vipLevels: Map<string, VipLevel>;

  constructor() {
    this.stats = {
      id: randomUUID(),
      depositsToday: "0",
      depositsYesterday: "16200",
      depositsTotal: "25065820.12",
      approvedToday: "0",
      approvedYesterday: "0",
      approvedTotal: "8840915.52",
      pendingToday: "0",
      pendingYesterday: "2722",
      pendingTotal: "16569307.19",
      rejectedToday: "0",
      rejectedYesterday: "0",
      rejectedTotal: "2172630",
      customersToday: 0,
      customersYesterday: 1,
      customersTotal: 2140,
    };

    this.customers = new Map();
    this.withdrawals = new Map();
    this.products = new Map();
    this.admins = new Map();
    this.dailyCheckIns = new Map();
    this.vipLevels = new Map();

    this.initializeSeedData();
  }

  private initializeSeedData() {
    // All mock data removed - empty storage
  }

  async getStats(): Promise<Stats> {
    return this.stats;
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      code: insertCustomer.code,
      username: insertCustomer.username,
      loginPassword: insertCustomer.loginPassword,
      payPassword: insertCustomer.payPassword,
      id,
      email: insertCustomer.email ?? null,
      actualWalletBalance: insertCustomer.actualWalletBalance ?? null,
      walletBalance: insertCustomer.walletBalance ?? null,
      phoneNumber: insertCustomer.phoneNumber ?? null,
      referralCode: insertCustomer.referralCode ?? null,
      ipAddress: insertCustomer.ipAddress ?? null,
      ipCountry: insertCustomer.ipCountry ?? null,
      ipRegion: insertCustomer.ipRegion ?? null,
      ipISP: insertCustomer.ipISP ?? null,
      vipLevel: insertCustomer.vipLevel ?? null,
      taskCount: insertCustomer.taskCount ?? null,
      completedTasks: insertCustomer.completedTasks ?? null,
      todayCompleted: insertCustomer.todayCompleted ?? null,
      totalDeposit: insertCustomer.totalDeposit ?? null,
      todayCommission: insertCustomer.todayCommission ?? null,
      totalCommission: insertCustomer.totalCommission ?? null,
      creditScore: insertCustomer.creditScore ?? null,
      isActive: insertCustomer.isActive ?? null,
      allowTask: insertCustomer.allowTask ?? null,
      allowCompleteTask: insertCustomer.allowCompleteTask ?? null,
      allowWithdraw: insertCustomer.allowWithdraw ?? null,
      allowReferral: insertCustomer.allowReferral ?? null,
      createdBy: insertCustomer.createdBy ?? null,
      updatedBy: insertCustomer.updatedBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const customer = this.customers.get(id);
    if (!customer) throw new Error("Customer not found");
    const updated = { ...customer, ...updates, updatedAt: new Date() };
    this.customers.set(id, updated);
    return updated;
  }

  async getWithdrawals(): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values());
  }

  async getWithdrawal(id: string): Promise<Withdrawal | undefined> {
    return this.withdrawals.get(id);
  }

  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const id = randomUUID();
    const withdrawal: Withdrawal = {
      id,
      customerId: insertWithdrawal.customerId,
      amount: insertWithdrawal.amount,
      status: insertWithdrawal.status ?? "Pending",
      bankName: insertWithdrawal.bankName ?? null,
      accountHolder: insertWithdrawal.accountHolder ?? null,
      iban: insertWithdrawal.iban ?? null,
      contactNumber: insertWithdrawal.contactNumber ?? null,
      branch: insertWithdrawal.branch ?? null,
      adminName: insertWithdrawal.adminName ?? null,
      createdBy: insertWithdrawal.createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.withdrawals.set(id, withdrawal);
    return withdrawal;
  }

  async updateWithdrawal(id: string, updates: Partial<Withdrawal>): Promise<Withdrawal> {
    const withdrawal = this.withdrawals.get(id);
    if (!withdrawal) throw new Error("Withdrawal not found");
    const updated = { ...withdrawal, ...updates, updatedAt: new Date() };
    this.withdrawals.set(id, updated);
    return updated;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      price: insertProduct.price ?? null,
      imageType: insertProduct.imageType ?? null,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async getAdmins(): Promise<Admin[]> {
    return Array.from(this.admins.values());
  }

  async getAdmin(id: string): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getDailyCheckIns(): Promise<DailyCheckIn[]> {
    return Array.from(this.dailyCheckIns.values()).sort((a, b) => a.dayNumber - b.dayNumber);
  }

  async updateDailyCheckIn(id: string, updates: Partial<DailyCheckIn>): Promise<DailyCheckIn> {
    const checkIn = this.dailyCheckIns.get(id);
    if (!checkIn) throw new Error("Daily check-in not found");
    const updated = { ...checkIn, ...updates, updatedAt: new Date() };
    this.dailyCheckIns.set(id, updated);
    return updated;
  }

  async getVipLevels(): Promise<VipLevel[]> {
    return Array.from(this.vipLevels.values());
  }

  async getVipLevel(id: string): Promise<VipLevel | undefined> {
    return this.vipLevels.get(id);
  }
}

export const storage = new MemStorage();
