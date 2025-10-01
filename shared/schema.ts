import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  username: text("username").notNull().unique(),
  email: text("email"),
  actualWalletBalance: decimal("actual_wallet_balance", { precision: 10, scale: 2 }).default("0"),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0"),
  loginPassword: text("login_password").notNull(),
  payPassword: text("pay_password").notNull(),
  phoneNumber: text("phone_number"),
  referralCode: text("referral_code"),
  ipAddress: text("ip_address"),
  ipCountry: text("ip_country"),
  ipRegion: text("ip_region"),
  ipISP: text("ip_isp"),
  vipLevel: text("vip_level").default("Silver"),
  taskCount: integer("task_count").default(38),
  completedTasks: integer("completed_tasks").default(0),
  todayCompleted: integer("today_completed").default(0),
  totalDeposit: decimal("total_deposit", { precision: 10, scale: 2 }).default("0"),
  todayCommission: decimal("today_commission", { precision: 10, scale: 2 }).default("0"),
  totalCommission: decimal("total_commission", { precision: 10, scale: 2 }).default("0"),
  creditScore: integer("credit_score").default(100),
  isActive: boolean("is_active").default(true),
  allowTask: boolean("allow_task").default(true),
  allowCompleteTask: boolean("allow_complete_task").default(true),
  allowWithdraw: boolean("allow_withdraw").default(false),
  allowReferral: boolean("allow_referral").default(true),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("Pending"),
  bankName: text("bank_name"),
  accountHolder: text("account_holder"),
  iban: text("iban"),
  contactNumber: text("contact_number"),
  branch: text("branch"),
  adminName: text("admin_name"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  imageType: text("image_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  whatsappUrl: text("whatsapp_url"),
  telegramUrl: text("telegram_url"),
  telegramUrl2: text("telegram_url2"),
  telegramUrl3: text("telegram_url3"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyCheckIns = pgTable("daily_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dayNumber: integer("day_number").notNull(),
  amount: integer("amount").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vipLevels = pgTable("vip_levels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  minAmount: integer("min_amount").notNull(),
  taskCount: integer("task_count").notNull(),
  threeTask: integer("three_task").notNull(),
  commissionPercentage: integer("commission_percentage").notNull(),
  comboCommissionPercentage: integer("combo_commission_percentage").notNull(),
  productRangeMin: integer("product_range_min").notNull(),
  productRangeMax: integer("product_range_max").notNull(),
  minWithdrawal: integer("min_withdrawal").notNull(),
  maxWithdrawal: integer("max_withdrawal").notNull(),
  completedTasksToWithdraw: integer("completed_tasks_to_withdraw").notNull(),
  withdrawalFees: integer("withdrawal_fees").notNull(),
});

export const stats = pgTable("stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  depositsToday: decimal("deposits_today", { precision: 10, scale: 2 }).default("0"),
  depositsYesterday: decimal("deposits_yesterday", { precision: 10, scale: 2 }).default("0"),
  depositsTotal: decimal("deposits_total", { precision: 10, scale: 2 }).default("0"),
  approvedToday: decimal("approved_today", { precision: 10, scale: 2 }).default("0"),
  approvedYesterday: decimal("approved_yesterday", { precision: 10, scale: 2 }).default("0"),
  approvedTotal: decimal("approved_total", { precision: 10, scale: 2 }).default("0"),
  pendingToday: decimal("pending_today", { precision: 10, scale: 2 }).default("0"),
  pendingYesterday: decimal("pending_yesterday", { precision: 10, scale: 2 }).default("0"),
  pendingTotal: decimal("pending_total", { precision: 10, scale: 2 }).default("0"),
  rejectedToday: decimal("rejected_today", { precision: 10, scale: 2 }).default("0"),
  rejectedYesterday: decimal("rejected_yesterday", { precision: 10, scale: 2 }).default("0"),
  rejectedTotal: decimal("rejected_total", { precision: 10, scale: 2 }).default("0"),
  customersToday: integer("customers_today").default(0),
  customersYesterday: integer("customers_yesterday").default(0),
  customersTotal: integer("customers_total").default(0),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const insertDailyCheckInSchema = createInsertSchema(dailyCheckIns).omit({
  id: true,
  updatedAt: true,
});

export const insertVipLevelSchema = createInsertSchema(vipLevels).omit({
  id: true,
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type DailyCheckIn = typeof dailyCheckIns.$inferSelect;
export type InsertDailyCheckIn = z.infer<typeof insertDailyCheckInSchema>;
export type VipLevel = typeof vipLevels.$inferSelect;
export type InsertVipLevel = z.infer<typeof insertVipLevelSchema>;
export type Stats = typeof stats.$inferSelect;
