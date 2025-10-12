// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  stats;
  customers;
  withdrawals;
  products;
  admins;
  dailyCheckIns;
  vipLevels;
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
      customersTotal: 2140
    };
    this.customers = /* @__PURE__ */ new Map();
    this.withdrawals = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.admins = /* @__PURE__ */ new Map();
    this.dailyCheckIns = /* @__PURE__ */ new Map();
    this.vipLevels = /* @__PURE__ */ new Map();
    this.initializeSeedData();
  }
  initializeSeedData() {
  }
  async getStats() {
    return this.stats;
  }
  async getCustomers() {
    return Array.from(this.customers.values());
  }
  async getCustomer(id) {
    return this.customers.get(id);
  }
  async createCustomer(insertCustomer) {
    const id = randomUUID();
    const customer2 = {
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
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.customers.set(id, customer2);
    return customer2;
  }
  async updateCustomer(id, updates) {
    const customer2 = this.customers.get(id);
    if (!customer2) throw new Error("Customer not found");
    const updated = { ...customer2, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.customers.set(id, updated);
    return updated;
  }
  async getWithdrawals() {
    return Array.from(this.withdrawals.values());
  }
  async getWithdrawal(id) {
    return this.withdrawals.get(id);
  }
  async createWithdrawal(insertWithdrawal) {
    const id = randomUUID();
    const withdrawal = {
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
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.withdrawals.set(id, withdrawal);
    return withdrawal;
  }
  async updateWithdrawal(id, updates) {
    const withdrawal = this.withdrawals.get(id);
    if (!withdrawal) throw new Error("Withdrawal not found");
    const updated = { ...withdrawal, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.withdrawals.set(id, updated);
    return updated;
  }
  async getProducts() {
    return Array.from(this.products.values());
  }
  async getProduct(id) {
    return this.products.get(id);
  }
  async createProduct(insertProduct) {
    const id = randomUUID();
    const product = {
      ...insertProduct,
      id,
      price: insertProduct.price ?? null,
      imageType: insertProduct.imageType ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.products.set(id, product);
    return product;
  }
  async getAdmins() {
    return Array.from(this.admins.values());
  }
  async getAdmin(id) {
    return this.admins.get(id);
  }
  async getDailyCheckIns() {
    return Array.from(this.dailyCheckIns.values()).sort((a, b) => a.dayNumber - b.dayNumber);
  }
  async updateDailyCheckIn(id, updates) {
    const checkIn = this.dailyCheckIns.get(id);
    if (!checkIn) throw new Error("Daily check-in not found");
    const updated = { ...checkIn, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.dailyCheckIns.set(id, updated);
    return updated;
  }
  async getVipLevels() {
    return Array.from(this.vipLevels.values());
  }
  async getVipLevel(id) {
    return this.vipLevels.get(id);
  }
};
var storage = new MemStorage();

// server/routes.ts
import { ObjectId as ObjectId2 } from "mongodb";

// server/database.ts
import { MongoClient } from "mongodb";
var MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://iconicdigital:iconicdigital@iconicdigital.t5nr2g9.mongodb.net/iconicdigital?retryWrites=true&w=majority&appName=iconicdigital";
var DB_NAME = "iconicdigital";
var client = null;
var db = null;
async function connectToDatabase() {
  if (db) {
    return db;
  }
  try {
    console.log("\u{1F50C} Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("\u2705 Connected to MongoDB successfully");
    console.log(`\u{1F4CA} Database: ${DB_NAME}`);
    return db;
  } catch (error) {
    console.error("\u274C MongoDB connection error:", error);
    throw error;
  }
}
function getUsersCollection() {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db.collection("users");
}
function getCampaignsCollection() {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db.collection("campaigns");
}
function getTransactionsCollection() {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db.collection("transactions");
}
function getAdminsCollection() {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db.collection("admins");
}
function getCustomerTasksCollection() {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db.collection("customerTasks");
}
function getDailyCheckInsCollection() {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db.collection("dailyCheckIns");
}
function getVIPLevelsCollection() {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db.collection("vipLevels");
}

// server/routes.ts
async function registerRoutes(app2) {
  await connectToDatabase();
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`\u{1F510} Admin login attempt: ${username}`);
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: "Username and password are required"
        });
      }
      const adminsCollection = getAdminsCollection();
      const admin = await adminsCollection.findOne({
        username,
        isActive: true
      });
      if (!admin) {
        console.log(`\u274C Admin not found: ${username}`);
        return res.status(401).json({
          success: false,
          error: "Invalid username or password"
        });
      }
      if (admin.password !== password) {
        console.log(`\u274C Invalid password for: ${username}`);
        return res.status(401).json({
          success: false,
          error: "Invalid username or password"
        });
      }
      await adminsCollection.updateOne(
        { _id: admin._id },
        { $set: { lastLogin: /* @__PURE__ */ new Date() } }
      );
      console.log(`\u2705 Admin logged in successfully: ${username}`);
      res.json({
        success: true,
        data: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        },
        message: "Login successful"
      });
    } catch (error) {
      console.error("\u274C Login error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Login failed"
      });
    }
  });
  app2.post("/api/admin/create", async (req, res) => {
    try {
      const { username, password, email, role = "admin" } = req.body;
      console.log(`\u{1F464} Creating admin: ${username}`);
      if (!username || !password || !email) {
        return res.status(400).json({
          success: false,
          error: "Username, password, and email are required"
        });
      }
      const adminsCollection = getAdminsCollection();
      const existingAdmin = await adminsCollection.findOne({
        $or: [{ username }, { email }]
      });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          error: "Admin with this username or email already exists"
        });
      }
      const newAdmin = {
        username,
        password,
        // In production, hash this with bcrypt
        email,
        role,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const result = await adminsCollection.insertOne(newAdmin);
      console.log(`\u2705 Admin created successfully: ${username}`);
      res.json({
        success: true,
        data: {
          id: result.insertedId,
          username,
          email,
          role
        },
        message: "Admin created successfully"
      });
    } catch (error) {
      console.error("\u274C Error creating admin:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to create admin"
      });
    }
  });
  app2.post("/api/admin/change-password", async (req, res) => {
    try {
      const { adminId, currentPassword, newPassword } = req.body;
      console.log(`\u{1F511} Change password request for admin: ${adminId}`);
      if (!adminId || !currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: "Admin ID, current password, and new password are required"
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: "New password must be at least 6 characters long"
        });
      }
      const adminsCollection = getAdminsCollection();
      const admin = await adminsCollection.findOne({
        _id: new ObjectId2(adminId),
        isActive: true
      });
      if (!admin) {
        console.log(`\u274C Admin not found: ${adminId}`);
        return res.status(404).json({
          success: false,
          error: "Admin not found"
        });
      }
      if (admin.password !== currentPassword) {
        console.log(`\u274C Invalid current password for: ${admin.username}`);
        return res.status(401).json({
          success: false,
          error: "Current password is incorrect"
        });
      }
      await adminsCollection.updateOne(
        { _id: admin._id },
        {
          $set: {
            password: newPassword,
            // In production, hash this with bcrypt
            updatedAt: /* @__PURE__ */ new Date()
          }
        }
      );
      console.log(`\u2705 Password changed successfully for: ${admin.username}`);
      res.json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error("\u274C Error changing password:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to change password"
      });
    }
  });
  app2.get("/api/stats", async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });
  app2.get("/api/frontend/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`\u{1F4D6} Fetching user: ${userId}`);
      const usersCollection = getUsersCollection();
      const user = await usersCollection.findOne(
        { _id: new ObjectId2(userId) },
        { projection: { password: 0, withdrawalPassword: 0 } }
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error("\u274C Error fetching user:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch user"
      });
    }
  });
  app2.patch("/api/frontend/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      console.log(`\u270F\uFE0F Updating user ${userId}:`, updateData);
      delete updateData.password;
      delete updateData.withdrawalPassword;
      delete updateData._id;
      delete updateData.createdAt;
      updateData.updatedAt = /* @__PURE__ */ new Date();
      const usersCollection = getUsersCollection();
      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId2(userId) },
        { $set: updateData },
        {
          returnDocument: "after",
          projection: { password: 0, withdrawalPassword: 0 }
        }
      );
      if (!result) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }
      console.log(`\u2705 User updated successfully:`, result._id);
      if (updateData.accountBalance !== void 0 || updateData.actualWalletBalance !== void 0) {
        await updateUserVIPLevel(userId);
      }
      res.json({
        success: true,
        data: result,
        message: "User profile updated successfully"
      });
    } catch (error) {
      console.error("\u274C Error updating user:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update user"
      });
    }
  });
  app2.patch("/api/frontend/users/:userId/balance", async (req, res) => {
    try {
      const { userId } = req.params;
      const { amount, operation } = req.body;
      console.log(`\u{1F4B0} Updating balance for user ${userId}: ${operation} ${amount}`);
      if (!amount || !operation) {
        return res.status(400).json({
          success: false,
          error: "Amount and operation are required"
        });
      }
      const usersCollection = getUsersCollection();
      const user = await usersCollection.findOne({ _id: new ObjectId2(userId) });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }
      const currentBalance = user.accountBalance || 0;
      let newBalance = currentBalance;
      if (operation === "add") {
        newBalance = currentBalance + Number(amount);
      } else if (operation === "subtract") {
        newBalance = currentBalance - Number(amount);
      }
      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId2(userId) },
        {
          $set: {
            accountBalance: newBalance,
            updatedAt: /* @__PURE__ */ new Date()
          }
        },
        {
          returnDocument: "after",
          projection: { password: 0, withdrawalPassword: 0 }
        }
      );
      console.log(`\u2705 Balance updated: ${currentBalance} \u2192 ${newBalance}`);
      await updateUserVIPLevel(userId);
      res.json({
        success: true,
        data: result,
        message: `Balance ${operation === "add" ? "added" : "subtracted"} successfully`,
        oldBalance: currentBalance,
        newBalance
      });
    } catch (error) {
      console.error("\u274C Error updating balance:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update balance"
      });
    }
  });
  app2.post("/api/frontend/users", async (req, res) => {
    try {
      console.log("\u{1F4DD} Creating new customer with data:", req.body);
      const { name, email, password, phoneNumber, referralCode, level } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: "Name, email, and password are required"
        });
      }
      const usersCollection = getUsersCollection();
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Email already exists"
        });
      }
      const membershipId = Math.random().toString(36).substring(2, 7).toUpperCase();
      const userReferralCode = referralCode || Math.random().toString(36).substring(2, 8).toUpperCase();
      const newUser = {
        name,
        email,
        password,
        // In production, hash this password
        phoneNumber: phoneNumber || "",
        membershipId,
        referralCode: userReferralCode,
        level: level || "Bronze",
        creditScore: 100,
        accountBalance: 0,
        totalEarnings: 0,
        campaignsCompleted: 0,
        lastLogin: /* @__PURE__ */ new Date(),
        dailyCheckIn: {
          lastCheckIn: null,
          streak: 0,
          daysClaimed: []
        },
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const result = await usersCollection.insertOne(newUser);
      const savedUser = await usersCollection.findOne(
        { _id: result.insertedId },
        { projection: { password: 0 } }
      );
      console.log("\u2705 Customer created successfully:", result.insertedId);
      res.json({
        success: true,
        data: savedUser,
        message: "Customer created successfully"
      });
    } catch (error) {
      console.error("\u274C Error creating customer:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to create customer"
      });
    }
  });
  app2.get("/api/frontend/users", async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        level,
        search,
        membershipId,
        phoneNumber,
        isActive,
        startDate,
        endDate
      } = req.query;
      const query = {};
      if (level) query.level = level;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { membershipId: { $regex: search, $options: "i" } }
        ];
      }
      if (membershipId) {
        query.membershipId = { $regex: membershipId, $options: "i" };
      }
      if (phoneNumber) {
        query.phoneNumber = { $regex: phoneNumber, $options: "i" };
      }
      if (isActive !== void 0) {
      }
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }
      const usersCollection = getUsersCollection();
      const users = await usersCollection.find(query).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)).toArray();
      const total = await usersCollection.countDocuments(query);
      console.log(`\u{1F4CA} Found ${users.length} users (total: ${total}) with filters:`, query);
      res.json({
        success: true,
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.get("/api/frontend/campaigns", async (req, res) => {
    try {
      const { status, type } = req.query;
      const query = {};
      if (status) query.status = status;
      if (type) query.type = type;
      const campaignsCollection = getCampaignsCollection();
      const campaigns = await campaignsCollection.find(query).sort({ createdAt: -1 }).toArray();
      const total = await campaignsCollection.countDocuments(query);
      res.json({
        success: true,
        data: campaigns,
        total
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.post("/api/frontend/products", async (req, res) => {
    try {
      const { name, price, image, imageType } = req.body;
      console.log("\u{1F4E6} Creating new product in campaigns:", { name, price });
      if (!name || !price) {
        return res.status(400).json({
          success: false,
          error: "Product name and price are required"
        });
      }
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const campaignId = `CAMP-${Date.now()}`;
      const campaignsCollection = getCampaignsCollection();
      const newCampaign = {
        campaignId,
        code,
        brand: name,
        // Use product name as brand
        logo: image || "",
        description: `Product: ${name}`,
        type: "Social",
        commissionRate: 0,
        commissionAmount: 0,
        baseAmount: Number(price),
        profit: 0,
        taskCode: code,
        status: "Active",
        requirements: [],
        duration: 1,
        maxParticipants: 0,
        currentParticipants: 0,
        startDate: /* @__PURE__ */ new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3),
        // 1 year from now
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const result = await campaignsCollection.insertOne(newCampaign);
      const savedCampaign = await campaignsCollection.findOne({ _id: result.insertedId });
      console.log("\u2705 Product created in campaigns successfully:", result.insertedId);
      res.json({
        success: true,
        data: savedCampaign,
        message: "Product created successfully"
      });
    } catch (error) {
      console.error("\u274C Error creating product:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to create product"
      });
    }
  });
  app2.patch("/api/frontend/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, image, imageType } = req.body;
      console.log("\u270F\uFE0F Updating product in campaigns:", id);
      const campaignsCollection = getCampaignsCollection();
      const updateData = {
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (name) updateData.brand = name;
      if (price) updateData.baseAmount = Number(price);
      if (image !== void 0) updateData.logo = image;
      if (name) updateData.description = `Product: ${name}`;
      const result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId2(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Product not found"
        });
      }
      console.log("\u2705 Product updated in campaigns successfully:", id);
      res.json({
        success: true,
        data: result,
        message: "Product updated successfully"
      });
    } catch (error) {
      console.error("\u274C Error updating product:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update product"
      });
    }
  });
  app2.delete("/api/frontend/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("\u{1F5D1}\uFE0F Deleting product from campaigns:", id);
      const campaignsCollection = getCampaignsCollection();
      const result = await campaignsCollection.deleteOne({ _id: new ObjectId2(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: "Product not found"
        });
      }
      console.log("\u2705 Product deleted from campaigns successfully:", id);
      res.json({
        success: true,
        message: "Product deleted successfully"
      });
    } catch (error) {
      console.error("\u274C Error deleting product:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to delete product"
      });
    }
  });
  app2.patch("/api/frontend/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { taskCommission, expiredDate, negativeAmount, priceFrom, priceTo } = req.body;
      console.log("\u270F\uFE0F Updating task settings in campaigns:", id);
      const campaignsCollection = getCampaignsCollection();
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (taskCommission !== void 0) updateData.commissionAmount = Number(taskCommission);
      if (expiredDate) updateData.endDate = new Date(expiredDate);
      if (negativeAmount !== void 0) updateData.negativeAmount = Number(negativeAmount);
      if (priceFrom !== void 0) updateData.priceFrom = Number(priceFrom);
      if (priceTo !== void 0) updateData.priceTo = Number(priceTo);
      const result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId2(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Task not found"
        });
      }
      console.log("\u2705 Task settings updated in campaigns successfully:", id);
      res.json({
        success: true,
        data: result,
        message: "Task settings updated successfully"
      });
    } catch (error) {
      console.error("\u274C Error updating task settings:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update task settings"
      });
    }
  });
  app2.patch("/api/frontend/tasks/:id/price", async (req, res) => {
    try {
      const { id } = req.params;
      const { taskPrice } = req.body;
      console.log("\u{1F4B0} Updating task price in campaigns:", id);
      const campaignsCollection = getCampaignsCollection();
      const updateData = {
        baseAmount: Number(taskPrice),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId2(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Task not found"
        });
      }
      console.log("\u2705 Task price updated in campaigns successfully:", id);
      res.json({
        success: true,
        data: result,
        message: "Task price updated successfully"
      });
    } catch (error) {
      console.error("\u274C Error updating task price:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update task price"
      });
    }
  });
  app2.get("/api/frontend/customer-tasks/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      console.log("\u{1F4CB} Fetching tasks for customer:", customerId);
      const customerTasksCollection = getCustomerTasksCollection();
      const tasks = await customerTasksCollection.find({ customerId }).sort({ taskNumber: 1 }).toArray();
      if (tasks.length === 0) {
        const usersCollection = getUsersCollection();
        const customer2 = await usersCollection.findOne({ _id: new ObjectId2(customerId) });
        if (!customer2) {
          return res.json({ success: true, data: [], total: 0 });
        }
        const userTaskCount2 = customer2.requiredTask || customer2.taskCount || 30;
        console.log(`No tasks found, initializing ${userTaskCount2} tasks for customer:`, customerId);
        const campaignsCollection = getCampaignsCollection();
        const campaigns = await campaignsCollection.find().limit(userTaskCount2).toArray();
        const newTasks = campaigns.map((campaign, index) => ({
          customerId,
          customerCode: customer2.membershipId || "",
          taskNumber: index + 1,
          campaignId: campaign._id.toString(),
          taskCommission: campaign.commissionAmount || 0,
          taskPrice: campaign.baseAmount || 0,
          estimatedNegativeAmount: campaign.commissionAmount ? -campaign.commissionAmount : 0,
          priceFrom: 0,
          priceTo: 0,
          hasGoldenEgg: campaign.type === "Paid" || campaign.baseAmount > 1e4,
          expiredDate: campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
          status: "pending",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }));
        if (newTasks.length > 0) {
          await customerTasksCollection.insertMany(newTasks);
          const insertedTasks = await customerTasksCollection.find({ customerId }).sort({ taskNumber: 1 }).toArray();
          return res.json({ success: true, data: insertedTasks, total: insertedTasks.length });
        }
      }
      res.json({ success: true, data: tasks, total: tasks.length });
    } catch (error) {
      console.error("\u274C Error fetching customer tasks:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch customer tasks"
      });
    }
  });
  app2.post("/api/frontend/customer-tasks", async (req, res) => {
    try {
      const { customerId, taskNumber, taskCommission, taskPrice, expiredDate, negativeAmount, priceFrom, priceTo } = req.body;
      console.log("\u{1F4BE} Saving customer task:", { customerId, taskNumber });
      const customerTasksCollection = getCustomerTasksCollection();
      const updateData = {
        taskCommission: Number(taskCommission),
        taskPrice: Number(taskPrice),
        estimatedNegativeAmount: Number(negativeAmount),
        priceFrom: Number(priceFrom),
        priceTo: Number(priceTo),
        expiredDate: new Date(expiredDate),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const result = await customerTasksCollection.findOneAndUpdate(
        { customerId, taskNumber: Number(taskNumber) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Task not found"
        });
      }
      console.log("\u2705 Customer task saved successfully");
      res.json({
        success: true,
        data: result,
        message: "Task saved successfully"
      });
    } catch (error) {
      console.error("\u274C Error saving customer task:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to save customer task"
      });
    }
  });
  app2.post("/api/frontend/customer-tasks/allow/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      console.log("\u2705 Allowing tasks for customer:", customerId);
      const customerTasksCollection = getCustomerTasksCollection();
      const existingTasks = await customerTasksCollection.find({ customerId }).toArray();
      if (existingTasks.length === 0) {
        console.log("No tasks found, initializing 30 tasks for customer:", customerId);
        const campaignsCollection = getCampaignsCollection();
        const campaigns = await campaignsCollection.find().limit(30).toArray();
        const usersCollection2 = getUsersCollection();
        const customer2 = await usersCollection2.findOne({ _id: new ObjectId2(customerId) });
        if (!customer2) {
          return res.status(404).json({
            success: false,
            error: "Customer not found"
          });
        }
        const newTasks = campaigns.map((campaign, index) => ({
          customerId,
          customerCode: customer2.membershipId || "",
          taskNumber: index + 1,
          campaignId: campaign._id.toString(),
          taskCommission: campaign.commissionAmount || 0,
          taskPrice: campaign.baseAmount || 0,
          estimatedNegativeAmount: campaign.commissionAmount ? -campaign.commissionAmount : 0,
          priceFrom: 0,
          priceTo: 0,
          hasGoldenEgg: campaign.type === "Paid" || campaign.baseAmount > 1e4,
          expiredDate: campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
          status: "pending",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }));
        if (newTasks.length > 0) {
          await customerTasksCollection.insertMany(newTasks);
        }
        console.log(`\u2705 ${newTasks.length} tasks initialized for customer (requiredTask: ${userTaskCount}):`, customerId);
      }
      const usersCollection = getUsersCollection();
      await usersCollection.updateOne(
        { _id: new ObjectId2(customerId) },
        { $set: { allowTask: true, updatedAt: /* @__PURE__ */ new Date() } }
      );
      console.log("\u2705 Customer allowed to start tasks:", customerId);
      res.json({
        success: true,
        message: "Customer allowed to start tasks",
        tasksInitialized: existingTasks.length === 0 ? customer?.requiredTask || customer?.taskCount || 30 : existingTasks.length
      });
    } catch (error) {
      console.error("\u274C Error allowing customer tasks:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to allow customer tasks"
      });
    }
  });
  app2.get("/api/frontend/transactions", async (req, res) => {
    try {
      const { userId, type, status } = req.query;
      const query = {};
      if (userId) query.userId = userId;
      if (type) query.type = type;
      if (status) query.status = status;
      const transactionsCollection = getTransactionsCollection();
      const transactions = await transactionsCollection.find(query).sort({ createdAt: -1 }).toArray();
      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.get("/api/frontend/dashboard-stats", async (req, res) => {
    try {
      const usersCollection = getUsersCollection();
      const campaignsCollection = getCampaignsCollection();
      const transactionsCollection = getTransactionsCollection();
      const totalUsers = await usersCollection.countDocuments();
      const totalCampaigns = await campaignsCollection.countDocuments();
      const activeCampaigns = await campaignsCollection.countDocuments({ status: "Active" });
      const totalTransactions = await transactionsCollection.countDocuments();
      const totalEarnings = await transactionsCollection.aggregate([
        { $match: { type: "campaign_earning", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).toArray();
      const totalBalance = await usersCollection.aggregate([
        { $group: { _id: null, total: { $sum: "$accountBalance" } } }
      ]).toArray();
      res.json({
        success: true,
        data: {
          totalUsers,
          totalCampaigns,
          activeCampaigns,
          totalTransactions,
          totalEarnings: totalEarnings[0]?.total || 0,
          totalBalance: totalBalance[0]?.total || 0
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.get("/api/frontend/daily-check-ins", async (req, res) => {
    try {
      const dailyCheckInsCollection = getDailyCheckInsCollection();
      const checkIns = await dailyCheckInsCollection.find().sort({ dayNumber: 1 }).toArray();
      if (checkIns.length === 0) {
        const defaultCheckIns = [
          { dayNumber: 1, amount: 2e3, updatedBy: "TEAM 1 - RUPEE", createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() },
          { dayNumber: 2, amount: 4e3, updatedBy: "TEAM 1 - RUPEE", createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() },
          { dayNumber: 3, amount: 6e3, updatedBy: "TEAM 1 - RUPEE", createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() },
          { dayNumber: 4, amount: 8e3, updatedBy: "TEAM 1 - RUPEE", createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() },
          { dayNumber: 5, amount: 1e5, updatedBy: "TEAM 1 - RUPEE", createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() },
          { dayNumber: 6, amount: 15e4, updatedBy: "TEAM 1 - RUPEE", createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() },
          { dayNumber: 7, amount: 2e5, updatedBy: "TEAM 1 - RUPEE", createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }
        ];
        await dailyCheckInsCollection.insertMany(defaultCheckIns);
        const newCheckIns = await dailyCheckInsCollection.find().sort({ dayNumber: 1 }).toArray();
        return res.json({
          success: true,
          data: newCheckIns
        });
      }
      res.json({
        success: true,
        data: checkIns
      });
    } catch (error) {
      console.error("\u274C Error fetching daily check-ins:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch daily check-ins"
      });
    }
  });
  app2.patch("/api/frontend/daily-check-ins/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, updatedBy } = req.body;
      const dailyCheckInsCollection = getDailyCheckInsCollection();
      const result = await dailyCheckInsCollection.findOneAndUpdate(
        { _id: new ObjectId2(id) },
        {
          $set: {
            amount: Number(amount),
            updatedBy,
            updatedAt: /* @__PURE__ */ new Date()
          }
        },
        { returnDocument: "after" }
      );
      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Daily check-in not found"
        });
      }
      res.json({
        success: true,
        data: result,
        message: "Daily check-in updated successfully"
      });
    } catch (error) {
      console.error("\u274C Error updating daily check-in:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update daily check-in"
      });
    }
  });
  async function updateUserVIPLevel(userId) {
    try {
      const usersCollection = getUsersCollection();
      const vipLevelsCollection = getVIPLevelsCollection();
      const user = await usersCollection.findOne({ _id: new ObjectId2(userId) });
      if (!user) return;
      const userBalance = Number(user.actualWalletBalance || user.walletBalance || 0);
      const vipLevels = await vipLevelsCollection.find().sort({ minAmount: -1 }).toArray();
      let newVipLevel = "Silver";
      for (const level of vipLevels) {
        if (userBalance >= level.minAmount) {
          newVipLevel = level.name;
          break;
        }
      }
      if (user.vipLevel !== newVipLevel) {
        await usersCollection.updateOne(
          { _id: new ObjectId2(userId) },
          {
            $set: {
              vipLevel: newVipLevel,
              updatedAt: /* @__PURE__ */ new Date()
            }
          }
        );
        console.log(`\u2705 User ${user.username} VIP level updated: ${user.vipLevel} \u2192 ${newVipLevel} (Balance: ${userBalance})`);
      }
    } catch (error) {
      console.error("\u274C Error updating user VIP level:", error);
    }
  }
  app2.get("/api/frontend/vip-levels", async (req, res) => {
    try {
      const vipLevelsCollection = getVIPLevelsCollection();
      const vipLevels = await vipLevelsCollection.find().toArray();
      if (vipLevels.length === 0) {
        const defaultLevels = [
          {
            name: "Silver",
            minAmount: 3e4,
            taskCount: 30,
            threeTask: "Set",
            commissionPercentage: 1,
            comboCommissionPercentage: 10,
            productRangeMin: 20,
            productRangeMax: 60,
            minWithdrawal: 1e3,
            maxWithdrawal: 3e6,
            completedTasksToWithdraw: 90,
            withdrawalFees: 0,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          },
          {
            name: "Gold",
            minAmount: 2e5,
            taskCount: 30,
            threeTask: "Set",
            commissionPercentage: 2,
            comboCommissionPercentage: 10,
            productRangeMin: 40,
            productRangeMax: 100,
            minWithdrawal: 5e3,
            maxWithdrawal: 3e7,
            completedTasksToWithdraw: 90,
            withdrawalFees: 0,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          },
          {
            name: "Platinum",
            minAmount: 4e5,
            taskCount: 30,
            threeTask: "Set",
            commissionPercentage: 3,
            comboCommissionPercentage: 10,
            productRangeMin: 60,
            productRangeMax: 100,
            minWithdrawal: 5e3,
            maxWithdrawal: 3e7,
            completedTasksToWithdraw: 90,
            withdrawalFees: 0,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          },
          {
            name: "Diamond",
            minAmount: 1e6,
            taskCount: 30,
            threeTask: "Set",
            commissionPercentage: 4,
            comboCommissionPercentage: 10,
            productRangeMin: 60,
            productRangeMax: 100,
            minWithdrawal: 5e3,
            maxWithdrawal: 3e7,
            completedTasksToWithdraw: 90,
            withdrawalFees: 0,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          },
          {
            name: "Premier",
            minAmount: 2e6,
            taskCount: 30,
            threeTask: "Set",
            commissionPercentage: 6,
            comboCommissionPercentage: 10,
            productRangeMin: 60,
            productRangeMax: 100,
            minWithdrawal: 5e3,
            maxWithdrawal: 3e7,
            completedTasksToWithdraw: 90,
            withdrawalFees: 0,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }
        ];
        await vipLevelsCollection.insertMany(defaultLevels);
        const newLevels = await vipLevelsCollection.find().toArray();
        return res.json({
          success: true,
          data: newLevels
        });
      }
      res.json({
        success: true,
        data: vipLevels
      });
    } catch (error) {
      console.error("\u274C Error fetching VIP levels:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch VIP levels"
      });
    }
  });
  app2.post("/api/frontend/vip-levels/check-all", async (req, res) => {
    try {
      const usersCollection = getUsersCollection();
      const users = await usersCollection.find().toArray();
      let updatedCount = 0;
      for (const user of users) {
        const userId = user._id.toString();
        const oldLevel = user.vipLevel;
        await updateUserVIPLevel(userId);
        const updatedUser = await usersCollection.findOne({ _id: user._id });
        if (updatedUser && updatedUser.vipLevel !== oldLevel) {
          updatedCount++;
        }
      }
      res.json({
        success: true,
        message: `Checked ${users.length} users, updated ${updatedCount} VIP levels`,
        totalUsers: users.length,
        updatedCount
      });
    } catch (error) {
      console.error("\u274C Error checking VIP levels:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to check VIP levels"
      });
    }
  });
  app2.patch("/api/frontend/vip-levels/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedAt: /* @__PURE__ */ new Date()
      };
      const vipLevelsCollection = getVIPLevelsCollection();
      const result = await vipLevelsCollection.findOneAndUpdate(
        { _id: new ObjectId2(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      if (!result) {
        return res.status(404).json({
          success: false,
          error: "VIP level not found"
        });
      }
      res.json({
        success: true,
        data: result,
        message: "VIP level updated successfully"
      });
    } catch (error) {
      console.error("\u274C Error updating VIP level:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update VIP level"
      });
    }
  });
  app2.get("/api/customers", async (_req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });
  app2.get("/api/customers/:id", async (req, res) => {
    const customer2 = await storage.getCustomer(req.params.id);
    if (!customer2) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer2);
  });
  app2.post("/api/customers", async (req, res) => {
    const customer2 = await storage.createCustomer(req.body);
    res.json(customer2);
  });
  app2.patch("/api/customers/:id", async (req, res) => {
    const customer2 = await storage.updateCustomer(req.params.id, req.body);
    res.json(customer2);
  });
  app2.get("/api/withdrawals", async (_req, res) => {
    const withdrawals = await storage.getWithdrawals();
    res.json(withdrawals);
  });
  app2.get("/api/withdrawals/:id", async (req, res) => {
    const withdrawal = await storage.getWithdrawal(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    res.json(withdrawal);
  });
  app2.post("/api/withdrawals", async (req, res) => {
    const withdrawal = await storage.createWithdrawal(req.body);
    res.json(withdrawal);
  });
  app2.patch("/api/withdrawals/:id", async (req, res) => {
    const withdrawal = await storage.updateWithdrawal(req.params.id, req.body);
    res.json(withdrawal);
  });
  app2.get("/api/frontend/withdrawals", async (req, res) => {
    try {
      console.log("\u{1F4B0} Fetching all withdrawals from withdrawals collection");
      const {
        page = 1,
        limit = 10,
        status,
        customerId,
        method,
        search,
        startDate,
        endDate
      } = req.query;
      const query = {};
      if (status) query.status = status;
      if (customerId) query.customerId = customerId;
      if (method) query.method = method;
      if (startDate || endDate) {
        query.submittedAt = {};
        if (startDate) {
          query.submittedAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.submittedAt.$lte = end;
        }
      }
      const database = await connectToDatabase();
      const withdrawalsCollection = database.collection("withdrawals");
      const totalWithdrawals = await withdrawalsCollection.countDocuments(query);
      console.log(`\u{1F4CA} Total withdrawals in collection: ${totalWithdrawals}`);
      const withdrawals = await withdrawalsCollection.find(query).sort({ submittedAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)).toArray();
      const usersCollection = database.collection("users");
      const withdrawalsWithCustomerDetails = await Promise.all(
        withdrawals.map(async (withdrawal) => {
          let customer2 = null;
          try {
            customer2 = await usersCollection.findOne({ _id: new ObjectId2(withdrawal.customerId) });
          } catch (objectIdError) {
            customer2 = await usersCollection.findOne({ _id: withdrawal.customerId });
          }
          return {
            ...withdrawal,
            customer: customer2 ? {
              _id: customer2._id,
              name: customer2.name,
              email: customer2.email,
              membershipId: customer2.membershipId,
              phoneNumber: customer2.phoneNumber,
              accountBalance: customer2.accountBalance
            } : null
          };
        })
      );
      let filteredWithdrawals = withdrawalsWithCustomerDetails;
      if (search) {
        filteredWithdrawals = withdrawalsWithCustomerDetails.filter((withdrawal) => {
          const customer2 = withdrawal.customer;
          if (!customer2) return false;
          return customer2.name?.toLowerCase().includes(search.toLowerCase()) || customer2.membershipId?.toLowerCase().includes(search.toLowerCase()) || customer2.email?.toLowerCase().includes(search.toLowerCase());
        });
      }
      console.log(`\u{1F4CA} Found ${withdrawals.length} withdrawals, ${filteredWithdrawals.length} after search filter`);
      console.log(`\u{1F4CA} Query filters:`, query);
      if (search) console.log(`\u{1F4CA} Search term:`, search);
      res.json({
        success: true,
        data: filteredWithdrawals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredWithdrawals.length,
          pages: Math.ceil(filteredWithdrawals.length / Number(limit))
        }
      });
    } catch (error) {
      console.error("\u274C Error fetching withdrawals:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch withdrawals"
      });
    }
  });
  app2.get("/api/frontend/withdrawals/:id", async (req, res) => {
    try {
      const withdrawalId = req.params.id;
      console.log(`\u{1F4B0} Fetching withdrawal: ${withdrawalId}`);
      const database = await connectToDatabase();
      const withdrawalsCollection = database.collection("withdrawals");
      let withdrawal;
      try {
        withdrawal = await withdrawalsCollection.findOne({ _id: new ObjectId2(withdrawalId) });
      } catch (objectIdError) {
        withdrawal = await withdrawalsCollection.findOne({ _id: withdrawalId });
      }
      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          error: "Withdrawal not found"
        });
      }
      const usersCollection = database.collection("users");
      let customer2 = null;
      try {
        customer2 = await usersCollection.findOne({ _id: new ObjectId2(withdrawal.customerId) });
      } catch (objectIdError) {
        customer2 = await usersCollection.findOne({ _id: withdrawal.customerId });
      }
      res.json({
        success: true,
        data: {
          ...withdrawal,
          customer: customer2 ? {
            _id: customer2._id,
            name: customer2.name,
            email: customer2.email,
            membershipId: customer2.membershipId,
            accountBalance: customer2.accountBalance
          } : null
        }
      });
    } catch (error) {
      console.error("\u274C Error fetching withdrawal:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch withdrawal"
      });
    }
  });
  app2.patch("/api/frontend/withdrawals/:id/update-status", async (req, res) => {
    try {
      const withdrawalId = req.params.id;
      const { status, adminNotes, processedBy } = req.body;
      console.log(`\u{1F4B0} Updating withdrawal status: ${withdrawalId} to ${status}`);
      if (!status) {
        return res.status(400).json({
          success: false,
          error: "Status is required"
        });
      }
      const validStatuses = ["pending", "processing", "completed", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status. Must be one of: " + validStatuses.join(", ")
        });
      }
      const database = await connectToDatabase();
      const withdrawalsCollection = database.collection("withdrawals");
      let withdrawal;
      try {
        withdrawal = await withdrawalsCollection.findOne({ _id: new ObjectId2(withdrawalId) });
      } catch (objectIdError) {
        withdrawal = await withdrawalsCollection.findOne({ _id: withdrawalId });
      }
      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          error: "Withdrawal not found"
        });
      }
      const updateData = {
        status,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (adminNotes) updateData.adminNotes = adminNotes;
      if (processedBy) updateData.processedBy = processedBy;
      if (status === "completed" || status === "rejected") {
        updateData.processedAt = /* @__PURE__ */ new Date();
      }
      const result = await withdrawalsCollection.findOneAndUpdate(
        { _id: withdrawal._id },
        { $set: updateData },
        { returnDocument: "after" }
      );
      console.log(`\u2705 Withdrawal status updated: ${withdrawalId} \u2192 ${status}`);
      res.json({
        success: true,
        data: result,
        message: "Withdrawal status updated successfully"
      });
    } catch (error) {
      console.error("\u274C Error updating withdrawal status:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update withdrawal status"
      });
    }
  });
  app2.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });
  app2.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });
  app2.post("/api/products", async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.json(product);
  });
  app2.get("/api/admins", async (_req, res) => {
    const admins = await storage.getAdmins();
    res.json(admins);
  });
  app2.get("/api/admins/:id", async (req, res) => {
    const admin = await storage.getAdmin(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  });
  app2.get("/api/daily-check-ins", async (_req, res) => {
    const checkIns = await storage.getDailyCheckIns();
    res.json(checkIns);
  });
  app2.patch("/api/daily-check-ins/:id", async (req, res) => {
    const checkIn = await storage.updateDailyCheckIn(req.params.id, req.body);
    res.json(checkIn);
  });
  app2.get("/api/vip-levels", async (_req, res) => {
    const levels = await storage.getVipLevels();
    res.json(levels);
  });
  app2.get("/api/vip-levels/:id", async (req, res) => {
    const level = await storage.getVipLevel(req.params.id);
    if (!level) {
      return res.status(404).json({ message: "VIP level not found" });
    }
    res.json(level);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api")) {
      return next();
    }
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = process.env.PORT || 3e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
