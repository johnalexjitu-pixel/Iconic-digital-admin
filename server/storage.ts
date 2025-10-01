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
    // Seed customer
    const customer1: Customer = {
      id: randomUUID(),
      code: "70144",
      username: "deneson.souza",
      email: "deneson.souza@hotmail.com",
      actualWalletBalance: "-30000",
      walletBalance: "-30000",
      loginPassword: "ee2cea04a28",
      payPassword: "26104",
      phoneNumber: "+4497775820",
      referralCode: "KYMU710R5",
      ipAddress: "",
      ipCountry: "",
      ipRegion: "",
      ipISP: "",
      vipLevel: "Silver",
      taskCount: 38,
      completedTasks: 0,
      todayCompleted: 0,
      totalDeposit: "0",
      todayCommission: "0",
      totalCommission: "0",
      creditScore: 100,
      isActive: true,
      allowTask: true,
      allowCompleteTask: true,
      allowWithdraw: false,
      allowReferral: true,
      createdBy: "TEAM 1 - RUPEE",
      updatedBy: "lyna24",
      createdAt: new Date("2025-09-01T23:22:29"),
      updatedAt: new Date("2025-09-01T23:22:29"),
    };
    this.customers.set(customer1.id, customer1);

    // Seed withdrawals
    const withdrawal1: Withdrawal = {
      id: randomUUID(),
      customerId: customer1.id,
      amount: "2722",
      status: "Pending",
      bankName: "Bank of Ceylon",
      accountHolder: "G N Niroshan",
      iban: "1179237",
      contactNumber: "",
      branch: "Polonggoda",
      adminName: "TEAM 1 - RUPEE",
      createdBy: "ooo001",
      createdAt: new Date("2025-10-01T15:55:21"),
      updatedAt: new Date("2025-10-01T15:55:21"),
    };
    this.withdrawals.set(withdrawal1.id, withdrawal1);

    const withdrawal2: Withdrawal = {
      id: randomUUID(),
      customerId: randomUUID(),
      amount: "2395",
      status: "Pending",
      bankName: "Sampath",
      accountHolder: "V A HEWAGE",
      iban: "102155194132",
      contactNumber: "",
      branch: "Anuradhapura",
      adminName: "TEAM 1 - RUPEE",
      createdBy: "ooo001",
      createdAt: new Date("2025-09-25T22:55:52"),
      updatedAt: new Date("2025-09-25T22:55:52"),
    };
    this.withdrawals.set(withdrawal2.id, withdrawal2);

    // Seed products
    const products: Product[] = [
      {
        id: randomUUID(),
        name: "PIXEL",
        code: "PO47M6",
        price: "0",
        imageType: "black-text",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "NIKON",
        code: "XK37F6",
        price: "0",
        imageType: "white-text",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "SIGMA",
        code: "RX88B1",
        price: "0",
        imageType: "white-text",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "UBER FREIGHT",
        code: "HG34D4",
        price: "0",
        imageType: "white-multi",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "DHL SUPPLY CHAIN",
        code: "ES33V5",
        price: "0",
        imageType: "red-text",
        createdAt: new Date(),
      },
    ];
    products.forEach((p) => this.products.set(p.id, p));

    // Seed admin
    const admin1: Admin = {
      id: randomUUID(),
      name: "TEAM 1 - RUPEE",
      whatsappUrl: null,
      telegramUrl: null,
      telegramUrl2: "https://t.me/Socialtrendsupport",
      telegramUrl3: null,
      createdAt: new Date(),
    };
    this.admins.set(admin1.id, admin1);

    // Seed daily check-ins
    const checkIns: DailyCheckIn[] = [
      { id: randomUUID(), dayNumber: 1, amount: 2000, updatedBy: "TEAM 1 - RUPEE", updatedAt: new Date("2025-08-31T01:04:49") },
      { id: randomUUID(), dayNumber: 2, amount: 4000, updatedBy: "TEAM 1 - RUPEE", updatedAt: new Date("2025-08-26T20:18:11") },
      { id: randomUUID(), dayNumber: 3, amount: 6000, updatedBy: "TEAM 1 - RUPEE", updatedAt: new Date("2025-08-26T20:18:13") },
      { id: randomUUID(), dayNumber: 4, amount: 8000, updatedBy: "TEAM 1 - RUPEE", updatedAt: new Date("2025-08-26T20:18:19") },
      { id: randomUUID(), dayNumber: 5, amount: 100000, updatedBy: "TEAM 1 - RUPEE", updatedAt: new Date("2025-08-26T20:18:14") },
      { id: randomUUID(), dayNumber: 6, amount: 150000, updatedBy: "TEAM 1 - RUPEE", updatedAt: new Date("2025-08-26T20:18:16") },
      { id: randomUUID(), dayNumber: 7, amount: 200000, updatedBy: "TEAM 1 - RUPEE", updatedAt: new Date("2025-08-26T20:18:17") },
    ];
    checkIns.forEach((c) => this.dailyCheckIns.set(c.id, c));

    // Seed VIP levels
    const vipLevels: VipLevel[] = [
      {
        id: randomUUID(),
        name: "Silver",
        minAmount: 30000,
        taskCount: 38,
        threeTask: 3,
        commissionPercentage: 1,
        comboCommissionPercentage: 10,
        productRangeMin: 20,
        productRangeMax: 60,
        minWithdrawal: 1000,
        maxWithdrawal: 3000000,
        completedTasksToWithdraw: 90,
        withdrawalFees: 0,
      },
      {
        id: randomUUID(),
        name: "Gold",
        minAmount: 200000,
        taskCount: 38,
        threeTask: 3,
        commissionPercentage: 2,
        comboCommissionPercentage: 10,
        productRangeMin: 40,
        productRangeMax: 100,
        minWithdrawal: 5000,
        maxWithdrawal: 30000000,
        completedTasksToWithdraw: 90,
        withdrawalFees: 0,
      },
      {
        id: randomUUID(),
        name: "Platinum",
        minAmount: 400000,
        taskCount: 38,
        threeTask: 3,
        commissionPercentage: 3,
        comboCommissionPercentage: 10,
        productRangeMin: 60,
        productRangeMax: 100,
        minWithdrawal: 5000,
        maxWithdrawal: 30000000,
        completedTasksToWithdraw: 90,
        withdrawalFees: 0,
      },
      {
        id: randomUUID(),
        name: "Diamond",
        minAmount: 1000000,
        taskCount: 38,
        threeTask: 3,
        commissionPercentage: 4,
        comboCommissionPercentage: 10,
        productRangeMin: 60,
        productRangeMax: 100,
        minWithdrawal: 5000,
        maxWithdrawal: 30000000,
        completedTasksToWithdraw: 90,
        withdrawalFees: 0,
      },
      {
        id: randomUUID(),
        name: "Premier",
        minAmount: 2000000,
        taskCount: 38,
        threeTask: 3,
        commissionPercentage: 6,
        comboCommissionPercentage: 10,
        productRangeMin: 60,
        productRangeMax: 100,
        minWithdrawal: 5000,
        maxWithdrawal: 30000000,
        completedTasksToWithdraw: 90,
        withdrawalFees: 0,
      },
    ];
    vipLevels.forEach((v) => this.vipLevels.set(v.id, v));
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
