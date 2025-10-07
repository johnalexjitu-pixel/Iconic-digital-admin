import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectId } from "mongodb";
import { 
  connectToDatabase, 
  getUsersCollection, 
  getCampaignsCollection, 
  getTransactionsCollection,
  getAdminsCollection,
  getProductsCollection,
  getCustomerTasksCollection,
  getDailyCheckInsCollection,
  getVIPLevelsCollection
} from "./database";

export async function registerRoutes(app: Express): Promise<Server> {
  // Connect to MongoDB
  await connectToDatabase();

  // Admin Authentication Routes
  
  // Admin Login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log(`🔐 Admin login attempt: ${username}`);

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
        console.log(`❌ Admin not found: ${username}`);
        return res.status(401).json({ 
          success: false, 
          error: "Invalid username or password" 
        });
      }

      // Simple password check (in production, use bcrypt)
      if (admin.password !== password) {
        console.log(`❌ Invalid password for: ${username}`);
        return res.status(401).json({ 
          success: false, 
          error: "Invalid username or password" 
        });
      }

      // Update last login
      await adminsCollection.updateOne(
        { _id: admin._id },
        { $set: { lastLogin: new Date() } }
      );

      console.log(`✅ Admin logged in successfully: ${username}`);

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
    } catch (error: any) {
      console.error("❌ Login error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Login failed" 
      });
    }
  });

  // Create Admin (for initial setup)
  app.post("/api/admin/create", async (req, res) => {
    try {
      const { username, password, email, role = 'admin' } = req.body;
      
      console.log(`👤 Creating admin: ${username}`);

      if (!username || !password || !email) {
        return res.status(400).json({ 
          success: false, 
          error: "Username, password, and email are required" 
        });
      }

      const adminsCollection = getAdminsCollection();
      
      // Check if admin already exists
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
        password, // In production, hash this with bcrypt
        email,
        role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await adminsCollection.insertOne(newAdmin);
      
      console.log(`✅ Admin created successfully: ${username}`);

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
    } catch (error: any) {
      console.error("❌ Error creating admin:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to create admin" 
      });
    }
  });

  // Change Admin Password
  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { adminId, currentPassword, newPassword } = req.body;
      
      console.log(`🔑 Change password request for admin: ${adminId}`);

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
        _id: new ObjectId(adminId),
        isActive: true 
      });

      if (!admin) {
        console.log(`❌ Admin not found: ${adminId}`);
        return res.status(404).json({ 
          success: false, 
          error: "Admin not found" 
        });
      }

      // Verify current password
      if (admin.password !== currentPassword) {
        console.log(`❌ Invalid current password for: ${admin.username}`);
        return res.status(401).json({ 
          success: false, 
          error: "Current password is incorrect" 
        });
      }

      // Update password
      await adminsCollection.updateOne(
        { _id: admin._id },
        { 
          $set: { 
            password: newPassword, // In production, hash this with bcrypt
            updatedAt: new Date() 
          } 
        }
      );

      console.log(`✅ Password changed successfully for: ${admin.username}`);

      res.json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error: any) {
      console.error("❌ Error changing password:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to change password" 
      });
    }
  });

  // Stats
  app.get("/api/stats", async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Frontend Data Integration APIs
  
  // Get single user by ID
  app.get("/api/frontend/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`📖 Fetching user: ${userId}`);

      const usersCollection = getUsersCollection();
      const user = await usersCollection.findOne(
        { _id: new ObjectId(userId) },
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
    } catch (error: any) {
      console.error("❌ Error fetching user:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to fetch user"
      });
    }
  });

  // Update user profile in MongoDB
  app.patch("/api/frontend/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      console.log(`✏️ Updating user ${userId}:`, updateData);

      // Remove fields that shouldn't be updated
      delete updateData.password;
      delete updateData.withdrawalPassword;
      delete updateData._id;
      delete updateData.createdAt;

      updateData.updatedAt = new Date();

      const usersCollection = getUsersCollection();
      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { 
          returnDocument: 'after',
          projection: { password: 0, withdrawalPassword: 0 }
        }
      );

      if (!result) {
        return res.status(404).json({ 
          success: false, 
          error: "User not found" 
        });
      }

      console.log(`✅ User updated successfully:`, result._id);

      // Auto-update VIP level if balance fields were updated
      if (updateData.accountBalance !== undefined || updateData.actualWalletBalance !== undefined) {
        await updateUserVIPLevel(userId);
      }

      res.json({
        success: true,
        data: result,
        message: "User profile updated successfully"
      });
    } catch (error: any) {
      console.error("❌ Error updating user:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to update user"
      });
    }
  });

  // Update user balance in MongoDB
  app.patch("/api/frontend/users/:userId/balance", async (req, res) => {
    try {
      const { userId } = req.params;
      const { amount, operation } = req.body;

      console.log(`💰 Updating balance for user ${userId}: ${operation} ${amount}`);

      if (!amount || !operation) {
        return res.status(400).json({ 
          success: false, 
          error: "Amount and operation are required" 
        });
      }

      const usersCollection = getUsersCollection();
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      
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
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            accountBalance: newBalance,
            updatedAt: new Date()
          } 
        },
        { 
          returnDocument: 'after',
          projection: { password: 0, withdrawalPassword: 0 }
        }
      );

      console.log(`✅ Balance updated: ${currentBalance} → ${newBalance}`);

      // Auto-update VIP level based on new balance
      await updateUserVIPLevel(userId);

      res.json({
        success: true,
        data: result,
        message: `Balance ${operation === "add" ? "added" : "subtracted"} successfully`,
        oldBalance: currentBalance,
        newBalance: newBalance
      });
    } catch (error: any) {
      console.error("❌ Error updating balance:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to update balance"
      });
    }
  });

  // Create new user in MongoDB
  app.post("/api/frontend/users", async (req, res) => {
    try {
      console.log("📝 Creating new customer with data:", req.body);
      
      const { name, email, password, phoneNumber, referralCode, level } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: "Name, email, and password are required" 
        });
      }

      const usersCollection = getUsersCollection();

      // Check if email already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: "Email already exists" 
        });
      }

      // Generate unique membership ID
      const membershipId = Math.random().toString(36).substring(2, 7).toUpperCase();
      
      // Generate referral code if not provided
      const userReferralCode = referralCode || Math.random().toString(36).substring(2, 8).toUpperCase();

      const newUser = {
        name,
        email,
        password, // In production, hash this password
        phoneNumber: phoneNumber || "",
        membershipId,
        referralCode: userReferralCode,
        level: level || 'Bronze',
        creditScore: 100,
        accountBalance: 0,
        totalEarnings: 0,
        campaignsCompleted: 0,
        lastLogin: new Date(),
        dailyCheckIn: {
          lastCheckIn: null,
          streak: 0,
          daysClaimed: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await usersCollection.insertOne(newUser as any);
      const savedUser = await usersCollection.findOne(
        { _id: result.insertedId },
        { projection: { password: 0 } }
      );

      console.log("✅ Customer created successfully:", result.insertedId);

      res.json({
        success: true,
        data: savedUser,
        message: "Customer created successfully"
      });
    } catch (error: any) {
      console.error("❌ Error creating customer:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to create customer"
      });
    }
  });
  
  // Users from frontend database
  app.get("/api/frontend/users", async (req, res) => {
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
      const query: any = {};
      
      if (level) query.level = level;
      
      // Search by name, email, or membershipId
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { membershipId: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Filter by membershipId/code
      if (membershipId) {
        query.membershipId = { $regex: membershipId, $options: 'i' };
      }
      
      // Filter by phone number
      if (phoneNumber) {
        query.phoneNumber = { $regex: phoneNumber, $options: 'i' };
      }
      
      // Filter by active status
      if (isActive !== undefined) {
        // Note: All users are active by default, but we can add this field later
        // query.isActive = isActive === 'true';
      }
      
      // Filter by date range
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate as string);
        }
        if (endDate) {
          const end = new Date(endDate as string);
          end.setHours(23, 59, 59, 999); // Include the entire end date
          query.createdAt.$lte = end;
        }
      }

      const usersCollection = getUsersCollection();
      
      const users = await usersCollection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .toArray();

      const total = await usersCollection.countDocuments(query);

      console.log(`📊 Found ${users.length} users (total: ${total}) with filters:`, query);

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
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Campaigns from frontend database
  app.get("/api/frontend/campaigns", async (req, res) => {
    try {
      const { status, type } = req.query;
      const query: any = {};
      
      if (status) query.status = status;
      if (type) query.type = type;

      const campaignsCollection = getCampaignsCollection();
      const campaigns = await campaignsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      
      const total = await campaignsCollection.countDocuments(query);

      res.json({
        success: true,
        data: campaigns,
        total
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Products are now stored in campaigns collection
  // No separate products endpoint needed

  // Create Product in MongoDB (Save to campaigns collection)
  app.post("/api/frontend/products", async (req, res) => {
    try {
      const { name, price, image, imageType } = req.body;

      console.log("📦 Creating new product in campaigns:", { name, price });

      if (!name || !price) {
        return res.status(400).json({ 
          success: false, 
          error: "Product name and price are required" 
        });
      }

      // Generate unique product code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const campaignId = `CAMP-${Date.now()}`;

      const campaignsCollection = getCampaignsCollection();

      // Create campaign object matching the schema
      const newCampaign = {
        campaignId,
        code,
        brand: name,  // Use product name as brand
        logo: image || "",
        description: `Product: ${name}`,
        type: "Social" as const,
        commissionRate: 0,
        commissionAmount: 0,
        baseAmount: Number(price),
        profit: 0,
        taskCode: code,
        status: "Active" as const,
        requirements: [],
        duration: 1,
        maxParticipants: 0,
        currentParticipants: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await campaignsCollection.insertOne(newCampaign as any);
      const savedCampaign = await campaignsCollection.findOne({ _id: result.insertedId });

      console.log("✅ Product created in campaigns successfully:", result.insertedId);

      res.json({
        success: true,
        data: savedCampaign,
        message: "Product created successfully"
      });
    } catch (error: any) {
      console.error("❌ Error creating product:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to create product"
      });
    }
  });

  // Update Product in MongoDB (Update in campaigns collection)
  app.patch("/api/frontend/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, image, imageType } = req.body;

      console.log("✏️ Updating product in campaigns:", id);

      const campaignsCollection = getCampaignsCollection();

      const updateData: any = {
        updatedAt: new Date()
      };

      if (name) updateData.brand = name;
      if (price) updateData.baseAmount = Number(price);
      if (image !== undefined) updateData.logo = image;
      if (name) updateData.description = `Product: ${name}`;

      const result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found" 
        });
      }

      console.log("✅ Product updated in campaigns successfully:", id);

      res.json({
        success: true,
        data: result,
        message: "Product updated successfully"
      });
    } catch (error: any) {
      console.error("❌ Error updating product:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to update product"
      });
    }
  });

  // Delete Product from MongoDB (Delete from campaigns collection)
  app.delete("/api/frontend/products/:id", async (req, res) => {
    try {
      const { id } = req.params;

      console.log("🗑️ Deleting product from campaigns:", id);

      const campaignsCollection = getCampaignsCollection();

      const result = await campaignsCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found" 
        });
      }

      console.log("✅ Product deleted from campaigns successfully:", id);

      res.json({
        success: true,
        message: "Product deleted successfully"
      });
    } catch (error: any) {
      console.error("❌ Error deleting product:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to delete product"
      });
    }
  });

  // Update task settings (commission, dates, etc.)
  app.patch("/api/frontend/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { taskCommission, expiredDate, negativeAmount, priceFrom, priceTo } = req.body;
      console.log("✏️ Updating task settings in campaigns:", id);

      const campaignsCollection = getCampaignsCollection();
      const updateData: any = { updatedAt: new Date() };

      if (taskCommission !== undefined) updateData.commissionAmount = Number(taskCommission);
      if (expiredDate) updateData.endDate = new Date(expiredDate);
      if (negativeAmount !== undefined) updateData.negativeAmount = Number(negativeAmount);
      if (priceFrom !== undefined) updateData.priceFrom = Number(priceFrom);
      if (priceTo !== undefined) updateData.priceTo = Number(priceTo);

      const result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Task not found"
        });
      }

      console.log("✅ Task settings updated in campaigns successfully:", id);
      res.json({
        success: true,
        data: result,
        message: "Task settings updated successfully"
      });
    } catch (error: any) {
      console.error("❌ Error updating task settings:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update task settings"
      });
    }
  });

  // Update task price (for golden egg)
  app.patch("/api/frontend/tasks/:id/price", async (req, res) => {
    try {
      const { id } = req.params;
      const { taskPrice } = req.body;
      console.log("💰 Updating task price in campaigns:", id);

      const campaignsCollection = getCampaignsCollection();
      const updateData: any = {
        baseAmount: Number(taskPrice),
        updatedAt: new Date()
      };

      const result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Task not found"
        });
      }

      console.log("✅ Task price updated in campaigns successfully:", id);
      res.json({
        success: true,
        data: result,
        message: "Task price updated successfully"
      });
    } catch (error: any) {
      console.error("❌ Error updating task price:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update task price"
      });
    }
  });

  // Get customer tasks
  app.get("/api/frontend/customer-tasks/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      console.log("📋 Fetching tasks for customer:", customerId);

      const customerTasksCollection = getCustomerTasksCollection();
      const tasks = await customerTasksCollection
        .find({ customerId })
        .sort({ taskNumber: 1 })
        .toArray();

      // If no tasks found, initialize 30 tasks from campaigns
      if (tasks.length === 0) {
        console.log("No tasks found, initializing 30 tasks for customer:", customerId);
        const campaignsCollection = getCampaignsCollection();
        const campaigns = await campaignsCollection.find().limit(30).toArray();
        
        const usersCollection = getUsersCollection();
        const customer = await usersCollection.findOne({ _id: new ObjectId(customerId) });
        
        if (!customer) {
          return res.json({ success: true, data: [], total: 0 });
        }

        const newTasks = campaigns.map((campaign, index) => ({
          customerId,
          customerCode: customer.membershipId || "",
          taskNumber: index + 1,
          campaignId: campaign._id!.toString(),
          taskCommission: campaign.commissionAmount || 0,
          taskPrice: campaign.baseAmount || 0,
          estimatedNegativeAmount: campaign.commissionAmount ? -campaign.commissionAmount : 0,
          priceFrom: 0,
          priceTo: 0,
          hasGoldenEgg: campaign.type === "Paid" || campaign.baseAmount > 10000,
          expiredDate: campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        if (newTasks.length > 0) {
          await customerTasksCollection.insertMany(newTasks as any);
          const insertedTasks = await customerTasksCollection
            .find({ customerId })
            .sort({ taskNumber: 1 })
            .toArray();
          return res.json({ success: true, data: insertedTasks, total: insertedTasks.length });
        }
      }

      res.json({ success: true, data: tasks, total: tasks.length });
    } catch (error: any) {
      console.error("❌ Error fetching customer tasks:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch customer tasks"
      });
    }
  });

  // Save/Update customer task
  app.post("/api/frontend/customer-tasks", async (req, res) => {
    try {
      const { customerId, taskNumber, taskCommission, taskPrice, expiredDate, negativeAmount, priceFrom, priceTo } = req.body;
      console.log("💾 Saving customer task:", { customerId, taskNumber });

      const customerTasksCollection = getCustomerTasksCollection();
      
      const updateData: any = {
        taskCommission: Number(taskCommission),
        taskPrice: Number(taskPrice),
        estimatedNegativeAmount: Number(negativeAmount),
        priceFrom: Number(priceFrom),
        priceTo: Number(priceTo),
        expiredDate: new Date(expiredDate),
        updatedAt: new Date()
      };

      const result = await customerTasksCollection.findOneAndUpdate(
        { customerId, taskNumber: Number(taskNumber) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Task not found"
        });
      }

      console.log("✅ Customer task saved successfully");
      res.json({
        success: true,
        data: result,
        message: "Task saved successfully"
      });
    } catch (error: any) {
      console.error("❌ Error saving customer task:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to save customer task"
      });
    }
  });

  // Allow customer to start tasks
  app.post("/api/frontend/customer-tasks/allow/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      console.log("✅ Allowing tasks for customer:", customerId);

      // First, initialize tasks if they don't exist
      const customerTasksCollection = getCustomerTasksCollection();
      const existingTasks = await customerTasksCollection
        .find({ customerId })
        .toArray();

      if (existingTasks.length === 0) {
        console.log("No tasks found, initializing 30 tasks for customer:", customerId);
        const campaignsCollection = getCampaignsCollection();
        const campaigns = await campaignsCollection.find().limit(30).toArray();
        
        const usersCollection = getUsersCollection();
        const customer = await usersCollection.findOne({ _id: new ObjectId(customerId) });
        
        if (!customer) {
          return res.status(404).json({
            success: false,
            error: "Customer not found"
          });
        }

        const newTasks = campaigns.map((campaign, index) => ({
          customerId,
          customerCode: customer.membershipId || "",
          taskNumber: index + 1,
          campaignId: campaign._id!.toString(),
          taskCommission: campaign.commissionAmount || 0,
          taskPrice: campaign.baseAmount || 0,
          estimatedNegativeAmount: campaign.commissionAmount ? -campaign.commissionAmount : 0,
          priceFrom: 0,
          priceTo: 0,
          hasGoldenEgg: campaign.type === "Paid" || campaign.baseAmount > 10000,
          expiredDate: campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        if (newTasks.length > 0) {
          await customerTasksCollection.insertMany(newTasks as any);
        }

        console.log(`✅ ${newTasks.length} tasks initialized for customer:`, customerId);
      }

      // Update customer's allowTask status
      const usersCollection = getUsersCollection();
      await usersCollection.updateOne(
        { _id: new ObjectId(customerId) },
        { $set: { allowTask: true, updatedAt: new Date() } }
      );

      console.log("✅ Customer allowed to start tasks:", customerId);
      res.json({
        success: true,
        message: "Customer allowed to start tasks",
        tasksInitialized: existingTasks.length === 0 ? 30 : existingTasks.length
      });
    } catch (error: any) {
      console.error("❌ Error allowing customer tasks:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to allow customer tasks"
      });
    }
  });

  // Transactions from frontend database
  app.get("/api/frontend/transactions", async (req, res) => {
    try {
      const { userId, type, status } = req.query;
      const query: any = {};
      
      if (userId) query.userId = userId;
      if (type) query.type = type;
      if (status) query.status = status;

      const transactionsCollection = getTransactionsCollection();
      const transactions = await transactionsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      res.json({
        success: true,
        data: transactions
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Dashboard stats from frontend data
  app.get("/api/frontend/dashboard-stats", async (req, res) => {
    try {
      const usersCollection = getUsersCollection();
      const campaignsCollection = getCampaignsCollection();
      const transactionsCollection = getTransactionsCollection();

      const totalUsers = await usersCollection.countDocuments();
      const totalCampaigns = await campaignsCollection.countDocuments();
      const activeCampaigns = await campaignsCollection.countDocuments({ status: 'Active' });
      const totalTransactions = await transactionsCollection.countDocuments();
      
      const totalEarnings = await transactionsCollection.aggregate([
        { $match: { type: 'campaign_earning', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray();

      const totalBalance = await usersCollection.aggregate([
        { $group: { _id: null, total: { $sum: '$accountBalance' } } }
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
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Daily Check-Ins from MongoDB
  app.get("/api/frontend/daily-check-ins", async (req, res) => {
    try {
      const dailyCheckInsCollection = getDailyCheckInsCollection();
      const checkIns = await dailyCheckInsCollection
        .find()
        .sort({ dayNumber: 1 })
        .toArray();

      // If no check-ins exist, initialize with default values
      if (checkIns.length === 0) {
        const defaultCheckIns = [
          { dayNumber: 1, amount: 2000, updatedBy: "TEAM 1 - RUPEE", createdAt: new Date(), updatedAt: new Date() },
          { dayNumber: 2, amount: 4000, updatedBy: "TEAM 1 - RUPEE", createdAt: new Date(), updatedAt: new Date() },
          { dayNumber: 3, amount: 6000, updatedBy: "TEAM 1 - RUPEE", createdAt: new Date(), updatedAt: new Date() },
          { dayNumber: 4, amount: 8000, updatedBy: "TEAM 1 - RUPEE", createdAt: new Date(), updatedAt: new Date() },
          { dayNumber: 5, amount: 100000, updatedBy: "TEAM 1 - RUPEE", createdAt: new Date(), updatedAt: new Date() },
          { dayNumber: 6, amount: 150000, updatedBy: "TEAM 1 - RUPEE", createdAt: new Date(), updatedAt: new Date() },
          { dayNumber: 7, amount: 200000, updatedBy: "TEAM 1 - RUPEE", createdAt: new Date(), updatedAt: new Date() }
        ];
        
        await dailyCheckInsCollection.insertMany(defaultCheckIns as any);
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
    } catch (error: any) {
      console.error("❌ Error fetching daily check-ins:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch daily check-ins"
      });
    }
  });

  // Update Daily Check-In
  app.patch("/api/frontend/daily-check-ins/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, updatedBy } = req.body;
      
      const dailyCheckInsCollection = getDailyCheckInsCollection();
      const result = await dailyCheckInsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            amount: Number(amount), 
            updatedBy,
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
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
    } catch (error: any) {
      console.error("❌ Error updating daily check-in:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update daily check-in"
      });
    }
  });

  // Helper function to update user VIP level based on balance
  async function updateUserVIPLevel(userId: string) {
    try {
      const usersCollection = getUsersCollection();
      const vipLevelsCollection = getVIPLevelsCollection();

      // Get user
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (!user) return;

      // Get user's actual balance
      const userBalance = Number(user.actualWalletBalance || user.walletBalance || 0);

      // Get all VIP levels sorted by minAmount descending
      const vipLevels = await vipLevelsCollection
        .find()
        .sort({ minAmount: -1 })
        .toArray();

      // Find appropriate VIP level
      let newVipLevel = "Silver"; // default
      for (const level of vipLevels) {
        if (userBalance >= level.minAmount) {
          newVipLevel = level.name;
          break;
        }
      }

      // Update user VIP level if changed
      if (user.vipLevel !== newVipLevel) {
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { 
            $set: { 
              vipLevel: newVipLevel,
              updatedAt: new Date() 
            } 
          }
        );
        console.log(`✅ User ${user.username} VIP level updated: ${user.vipLevel} → ${newVipLevel} (Balance: ${userBalance})`);
      }
    } catch (error) {
      console.error("❌ Error updating user VIP level:", error);
    }
  }

  // VIP Levels from MongoDB
  app.get("/api/frontend/vip-levels", async (req, res) => {
    try {
      const vipLevelsCollection = getVIPLevelsCollection();
      const vipLevels = await vipLevelsCollection
        .find()
        .toArray();

      // If no VIP levels exist, initialize with defaults
      if (vipLevels.length === 0) {
        const defaultLevels = [
          {
            name: "Silver",
            minAmount: 30000,
            taskCount: 30,
            threeTask: "Set",
            commissionPercentage: 1,
            comboCommissionPercentage: 10,
            productRangeMin: 20,
            productRangeMax: 60,
            minWithdrawal: 1000,
            maxWithdrawal: 3000000,
            completedTasksToWithdraw: 90,
            withdrawalFees: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: "Gold",
            minAmount: 200000,
            taskCount: 30,
            threeTask: "Set",
            commissionPercentage: 2,
            comboCommissionPercentage: 10,
            productRangeMin: 40,
            productRangeMax: 100,
            minWithdrawal: 5000,
            maxWithdrawal: 30000000,
            completedTasksToWithdraw: 90,
            withdrawalFees: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: "Platinum",
            minAmount: 400000,
            taskCount: 30,
            threeTask: "Set",
            commissionPercentage: 3,
            comboCommissionPercentage: 10,
            productRangeMin: 60,
            productRangeMax: 100,
            minWithdrawal: 5000,
            maxWithdrawal: 30000000,
            completedTasksToWithdraw: 90,
            withdrawalFees: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: "Diamond",
            minAmount: 1000000,
            taskCount: 30,
            threeTask: "Set",
            commissionPercentage: 4,
            comboCommissionPercentage: 10,
            productRangeMin: 60,
            productRangeMax: 100,
            minWithdrawal: 5000,
            maxWithdrawal: 30000000,
            completedTasksToWithdraw: 90,
            withdrawalFees: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: "Premier",
            minAmount: 2000000,
            taskCount: 30,
            threeTask: "Set",
            commissionPercentage: 6,
            comboCommissionPercentage: 10,
            productRangeMin: 60,
            productRangeMax: 100,
            minWithdrawal: 5000,
            maxWithdrawal: 30000000,
            completedTasksToWithdraw: 90,
            withdrawalFees: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        await vipLevelsCollection.insertMany(defaultLevels as any);
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
    } catch (error: any) {
      console.error("❌ Error fetching VIP levels:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch VIP levels"
      });
    }
  });

  // Check and update VIP levels for all users
  app.post("/api/frontend/vip-levels/check-all", async (req, res) => {
    try {
      const usersCollection = getUsersCollection();
      const users = await usersCollection.find().toArray();

      let updatedCount = 0;
      for (const user of users) {
        const userId = user._id!.toString();
        const oldLevel = user.vipLevel;
        await updateUserVIPLevel(userId);
        
        // Check if level changed
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
    } catch (error: any) {
      console.error("❌ Error checking VIP levels:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to check VIP levels"
      });
    }
  });

  // Update VIP Level
  app.patch("/api/frontend/vip-levels/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const vipLevelsCollection = getVIPLevelsCollection();
      const result = await vipLevelsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
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
    } catch (error: any) {
      console.error("❌ Error updating VIP level:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update VIP level"
      });
    }
  });

  // Customers
  app.get("/api/customers", async (_req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.get("/api/customers/:id", async (req, res) => {
    const customer = await storage.getCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  });

  app.post("/api/customers", async (req, res) => {
    const customer = await storage.createCustomer(req.body);
    res.json(customer);
  });

  app.patch("/api/customers/:id", async (req, res) => {
    const customer = await storage.updateCustomer(req.params.id, req.body);
    res.json(customer);
  });

  // Withdrawals
  app.get("/api/withdrawals", async (_req, res) => {
    const withdrawals = await storage.getWithdrawals();
    res.json(withdrawals);
  });

  app.get("/api/withdrawals/:id", async (req, res) => {
    const withdrawal = await storage.getWithdrawal(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    res.json(withdrawal);
  });

  app.post("/api/withdrawals", async (req, res) => {
    const withdrawal = await storage.createWithdrawal(req.body);
    res.json(withdrawal);
  });

  app.patch("/api/withdrawals/:id", async (req, res) => {
    const withdrawal = await storage.updateWithdrawal(req.params.id, req.body);
    res.json(withdrawal);
  });

  // Products
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.post("/api/products", async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.json(product);
  });

  // Admins
  app.get("/api/admins", async (_req, res) => {
    const admins = await storage.getAdmins();
    res.json(admins);
  });

  app.get("/api/admins/:id", async (req, res) => {
    const admin = await storage.getAdmin(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  });

  // Daily Check-ins
  app.get("/api/daily-check-ins", async (_req, res) => {
    const checkIns = await storage.getDailyCheckIns();
    res.json(checkIns);
  });

  app.patch("/api/daily-check-ins/:id", async (req, res) => {
    const checkIn = await storage.updateDailyCheckIn(req.params.id, req.body);
    res.json(checkIn);
  });

  // VIP Levels
  app.get("/api/vip-levels", async (_req, res) => {
    const levels = await storage.getVipLevels();
    res.json(levels);
  });

  app.get("/api/vip-levels/:id", async (req, res) => {
    const level = await storage.getVipLevel(req.params.id);
    if (!level) {
      return res.status(404).json({ message: "VIP level not found" });
    }
    res.json(level);
  });

  const httpServer = createServer(app);
  return httpServer;
}
