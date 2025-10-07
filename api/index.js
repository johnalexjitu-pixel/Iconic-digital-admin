import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://iconicdigital:iconicdigital@iconicdigital.t5nr2g9.mongodb.net/?retryWrites=true&w=majority&appName=iconicdigital';
const DB_NAME = 'iconicdigital';

let client = null;
let db = null;

async function connectToDatabase() {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const database = await connectToDatabase();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    
    // Admin Authentication Routes
    
    // Admin Login
    if (req.method === 'POST' && path === '/api/admin/login') {
      const { username, password } = req.body;
      
      console.log(`🔐 Admin login attempt: ${username}`);

      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          error: "Username and password are required" 
        });
      }

      const adminsCollection = database.collection('admins');
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

      if (admin.password !== password) {
        console.log(`❌ Invalid password for: ${username}`);
        return res.status(401).json({ 
          success: false, 
          error: "Invalid username or password" 
        });
      }

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
    }
    
    // Create Admin
    else if (req.method === 'POST' && path === '/api/admin/create') {
      const { username, password, email, role = 'admin' } = req.body;
      
      console.log(`👤 Creating admin: ${username}`);

      if (!username || !password || !email) {
        return res.status(400).json({ 
          success: false, 
          error: "Username, password, and email are required" 
        });
      }

      const adminsCollection = database.collection('admins');
      
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
    }
    
    // Change Admin Password
    else if (req.method === 'POST' && path === '/api/admin/change-password') {
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

      const adminsCollection = database.collection('admins');
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

      if (admin.password !== currentPassword) {
        console.log(`❌ Invalid current password for: ${admin.username}`);
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
            updatedAt: new Date() 
          } 
        }
      );

      console.log(`✅ Password changed successfully for: ${admin.username}`);

      res.json({
        success: true,
        message: "Password changed successfully"
      });
    }
    
    // Frontend Data Integration APIs
    
    // Get single user by ID
    else if (req.method === 'GET' && path.startsWith('/api/frontend/users/') && !path.includes('?')) {
      const userId = path.split('/').pop();
      console.log(`📖 Fetching user: ${userId}`);

      const usersCollection = database.collection('users');
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
    }
    
    // Update user profile
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/users/') && !path.includes('/balance')) {
      const userId = path.split('/').pop();
      const updateData = req.body;

      console.log(`✏️ Updating user ${userId}:`, updateData);

      delete updateData.password;
      delete updateData.withdrawalPassword;
      delete updateData._id;
      delete updateData.createdAt;

      updateData.updatedAt = new Date();

      const usersCollection = database.collection('users');
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

      res.json({
        success: true,
        data: result,
        message: "User profile updated successfully"
      });
    }
    
    // Update user balance
    else if (req.method === 'PATCH' && path.includes('/api/frontend/users/') && path.includes('/balance')) {
      const userId = path.split('/')[3];
      const { amount, operation } = req.body;

      console.log(`💰 Updating balance for user ${userId}: ${operation} ${amount}`);

      if (!amount || !operation) {
        return res.status(400).json({ 
          success: false, 
          error: "Amount and operation are required" 
        });
      }

      const usersCollection = database.collection('users');
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

      res.json({
        success: true,
        data: result,
        message: `Balance ${operation === "add" ? "added" : "subtracted"} successfully`,
        oldBalance: currentBalance,
        newBalance: newBalance
      });
    }
    
    // Create new user
    else if (req.method === 'POST' && path === '/api/frontend/users') {
      console.log("📝 Creating new customer with data:", req.body);
      
      const { name, email, password, phoneNumber, referralCode, level } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: "Name, email, and password are required" 
        });
      }

      const usersCollection = database.collection('users');

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

      const result = await usersCollection.insertOne(newUser);
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
    }
    
    // Get users with filters
    else if (req.method === 'GET' && path === '/api/frontend/users') {
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
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { membershipId: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (membershipId) {
        query.membershipId = { $regex: membershipId, $options: 'i' };
      }
      
      if (phoneNumber) {
        query.phoneNumber = { $regex: phoneNumber, $options: 'i' };
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

      const usersCollection = database.collection('users');
      
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
    }
    
    // Get campaigns
    else if (req.method === 'GET' && path === '/api/frontend/campaigns') {
      const { status, type } = req.query;
      const query = {};
      
      if (status) query.status = status;
      if (type) query.type = type;

      const campaignsCollection = database.collection('campaigns');
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
    }
    
    // Create Product
    else if (req.method === 'POST' && path === '/api/frontend/products') {
      const { name, price, image, imageType } = req.body;

      console.log("📦 Creating new product in campaigns:", { name, price });

      if (!name || !price) {
        return res.status(400).json({ 
          success: false, 
          error: "Product name and price are required" 
        });
      }

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const campaignId = `CAMP-${Date.now()}`;

      const campaignsCollection = database.collection('campaigns');

      const newCampaign = {
        campaignId,
        code,
        brand: name,
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
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await campaignsCollection.insertOne(newCampaign);
      const savedCampaign = await campaignsCollection.findOne({ _id: result.insertedId });

      console.log("✅ Product created in campaigns successfully:", result.insertedId);

      res.json({
        success: true,
        data: savedCampaign,
        message: "Product created successfully"
      });
    }
    
    // Update Product
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/products/')) {
      const productId = path.split('/').pop();
      const { name, price, image, imageType } = req.body;

      console.log("✏️ Updating product in campaigns:", productId);

      const campaignsCollection = database.collection('campaigns');

      const updateData = {
        updatedAt: new Date()
      };

      if (name) updateData.brand = name;
      if (price) updateData.baseAmount = Number(price);
      if (image !== undefined) updateData.logo = image;
      if (name) updateData.description = `Product: ${name}`;

      const result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId(productId) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found" 
        });
      }

      console.log("✅ Product updated in campaigns successfully:", productId);

      res.json({
        success: true,
        data: result,
        message: "Product updated successfully"
      });
    }
    
    // Delete Product
    else if (req.method === 'DELETE' && path.startsWith('/api/frontend/products/')) {
      const productId = path.split('/').pop();

      console.log("🗑️ Deleting product from campaigns:", productId);

      const campaignsCollection = database.collection('campaigns');

      const result = await campaignsCollection.deleteOne({ _id: new ObjectId(productId) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found" 
        });
      }

      console.log("✅ Product deleted from campaigns successfully:", productId);

      res.json({
        success: true,
        message: "Product deleted successfully"
      });
    }
    
    // Update task settings
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/tasks/') && !path.includes('/price')) {
      const taskId = path.split('/').pop();
      const { taskCommission, expiredDate, negativeAmount, priceFrom, priceTo } = req.body;
      console.log("✏️ Updating task settings in campaigns:", taskId);

      const campaignsCollection = database.collection('campaigns');
      const updateData = { updatedAt: new Date() };

      if (taskCommission !== undefined) updateData.commissionAmount = Number(taskCommission);
      if (expiredDate) updateData.endDate = new Date(expiredDate);
      if (negativeAmount !== undefined) updateData.negativeAmount = Number(negativeAmount);
      if (priceFrom !== undefined) updateData.priceFrom = Number(priceFrom);
      if (priceTo !== undefined) updateData.priceTo = Number(priceTo);

      const result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId(taskId) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Task not found"
        });
      }

      console.log("✅ Task settings updated in campaigns successfully:", taskId);
      res.json({
        success: true,
        data: result,
        message: "Task settings updated successfully"
      });
    }
    
    // Update task price
    else if (req.method === 'PATCH' && path.includes('/api/frontend/tasks/') && path.includes('/price')) {
      const taskId = path.split('/')[3];
      const { taskPrice } = req.body;
      console.log("💰 Updating task price in campaigns:", taskId);

      const campaignsCollection = database.collection('campaigns');
      const updateData = {
        baseAmount: Number(taskPrice),
        updatedAt: new Date()
      };

      const result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId(taskId) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Task not found"
        });
      }

      console.log("✅ Task price updated in campaigns successfully:", taskId);
      res.json({
        success: true,
        data: result,
        message: "Task price updated successfully"
      });
    }
    
    // Get customer tasks
    else if (req.method === 'GET' && path.startsWith('/api/frontend/customer-tasks/') && !path.includes('/allow')) {
      const customerId = path.split('/')[3];
      console.log("📋 Fetching tasks for customer:", customerId);

      const customerTasksCollection = database.collection('customerTasks');
      const tasks = await customerTasksCollection
        .find({ customerId })
        .sort({ taskNumber: 1 })
        .toArray();

      if (tasks.length === 0) {
        console.log("No tasks found, initializing 30 tasks for customer:", customerId);
        const campaignsCollection = database.collection('campaigns');
        const campaigns = await campaignsCollection.find().limit(30).toArray();
        
        const usersCollection = database.collection('users');
        let customer;
        try {
          customer = await usersCollection.findOne({ _id: new ObjectId(customerId) });
        } catch (objectIdError) {
          // Fallback: try finding by string ID
          customer = await usersCollection.findOne({ _id: customerId });
        }
        
        if (!customer) {
          return res.json({ success: true, data: [], total: 0 });
        }

        const newTasks = campaigns.map((campaign, index) => ({
          customerId,
          customerCode: customer.membershipId || "",
          taskNumber: index + 1,
          campaignId: campaign._id.toString(),
          taskCommission: campaign.commissionAmount || 0,
          taskPrice: campaign.baseAmount || 0,
          estimatedNegativeAmount: campaign.commissionAmount ? -campaign.commissionAmount : 0,
          priceFrom: 0,
          priceTo: 0,
          hasGoldenEgg: campaign.type === "Paid" || campaign.baseAmount > 10000,
          expiredDate: campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        if (newTasks.length > 0) {
          await customerTasksCollection.insertMany(newTasks);
          const insertedTasks = await customerTasksCollection
            .find({ customerId })
            .sort({ taskNumber: 1 })
            .toArray();
          return res.json({ success: true, data: insertedTasks, total: insertedTasks.length });
        }
      }

      res.json({ success: true, data: tasks, total: tasks.length });
    }
    
    // Save/Update customer task
    else if (req.method === 'POST' && path === '/api/frontend/customer-tasks') {
      const { customerId, taskNumber, taskCommission, taskPrice, expiredDate, negativeAmount, priceFrom, priceTo } = req.body;
      console.log("💾 Saving customer task:", { customerId, taskNumber });

      const customerTasksCollection = database.collection('customerTasks');
      
      const updateData = {
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
    }
    
    // Allow customer to start tasks
    else if (req.method === 'POST' && path.startsWith('/api/frontend/customer-tasks/allow/')) {
      const customerId = path.split('/').pop();
      console.log("✅ Allowing tasks for customer:", customerId);

      const customerTasksCollection = database.collection('customerTasks');
      const existingTasks = await customerTasksCollection
        .find({ customerId })
        .toArray();

      if (existingTasks.length === 0) {
        console.log("No tasks found, initializing 30 tasks for customer:", customerId);
        const campaignsCollection = database.collection('campaigns');
        const campaigns = await campaignsCollection.find().limit(30).toArray();
        
        const usersCollection = database.collection('users');
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
          campaignId: campaign._id.toString(),
          taskCommission: campaign.commissionAmount || 0,
          taskPrice: campaign.baseAmount || 0,
          estimatedNegativeAmount: campaign.commissionAmount ? -campaign.commissionAmount : 0,
          priceFrom: 0,
          priceTo: 0,
          hasGoldenEgg: campaign.type === "Paid" || campaign.baseAmount > 10000,
          expiredDate: campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        if (newTasks.length > 0) {
          await customerTasksCollection.insertMany(newTasks);
        }

        console.log(`✅ ${newTasks.length} tasks initialized for customer:`, customerId);
      }

      const usersCollection = database.collection('users');
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
    }
    
    // Get transactions
    else if (req.method === 'GET' && path === '/api/frontend/transactions') {
      const { userId, type, status } = req.query;
      const query = {};
      
      if (userId) query.userId = userId;
      if (type) query.type = type;
      if (status) query.status = status;

      const transactionsCollection = database.collection('transactions');
      const transactions = await transactionsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      res.json({
        success: true,
        data: transactions
      });
    }
    
    // Dashboard stats
    else if (req.method === 'GET' && path === '/api/frontend/dashboard-stats') {
      const usersCollection = database.collection('users');
      const campaignsCollection = database.collection('campaigns');
      const transactionsCollection = database.collection('transactions');

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
    }
    
    // Daily Check-Ins
    else if (req.method === 'GET' && path === '/api/frontend/daily-check-ins') {
      const dailyCheckInsCollection = database.collection('dailyCheckIns');
      const checkIns = await dailyCheckInsCollection
        .find()
        .sort({ dayNumber: 1 })
        .toArray();

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
    }
    
    // Update Daily Check-In
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/daily-check-ins/')) {
      const checkInId = path.split('/').pop();
      const { amount, updatedBy } = req.body;
      
      const dailyCheckInsCollection = database.collection('dailyCheckIns');
      const result = await dailyCheckInsCollection.findOneAndUpdate(
        { _id: new ObjectId(checkInId) },
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
    }
    
    // VIP Levels
    else if (req.method === 'GET' && path === '/api/frontend/vip-levels') {
      const vipLevelsCollection = database.collection('vipLevels');
      const vipLevels = await vipLevelsCollection
        .find()
        .toArray();

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
    }
    
    // Update VIP Level
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/vip-levels/')) {
      const vipLevelId = path.split('/').pop();
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const vipLevelsCollection = database.collection('vipLevels');
      const result = await vipLevelsCollection.findOneAndUpdate(
        { _id: new ObjectId(vipLevelId) },
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
    }
    
    // Legacy endpoints for compatibility
    else if (req.method === 'GET' && path === '/api/products') {
      const campaignsCollection = database.collection('campaigns');
      const products = await campaignsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.json(products);
    }
    
    // Missing endpoints from original server
    
    // Customers (legacy)
    else if (req.method === 'GET' && path === '/api/customers') {
      const usersCollection = database.collection('users');
      const customers = await usersCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.json(customers);
    }
    
    else if (req.method === 'GET' && path.startsWith('/api/customers/')) {
      const customerId = path.split('/').pop();
      const usersCollection = database.collection('users');
      let customer;
      try {
        customer = await usersCollection.findOne({ _id: new ObjectId(customerId) });
      } catch (objectIdError) {
        customer = await usersCollection.findOne({ _id: customerId });
      }
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    }
    
    else if (req.method === 'POST' && path === '/api/customers') {
      const newCustomer = req.body;
      const usersCollection = database.collection('users');
      const result = await usersCollection.insertOne({
        ...newCustomer,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const customer = await usersCollection.findOne({ _id: result.insertedId });
      res.json(customer);
    }
    
    else if (req.method === 'PATCH' && path.startsWith('/api/customers/')) {
      const customerId = path.split('/').pop();
      const updateData = req.body;
      const usersCollection = database.collection('users');
      
      let result;
      try {
        result = await usersCollection.findOneAndUpdate(
          { _id: new ObjectId(customerId) },
          { $set: { ...updateData, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      } catch (objectIdError) {
        result = await usersCollection.findOneAndUpdate(
          { _id: customerId },
          { $set: { ...updateData, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      }
      
      if (!result) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(result);
    }
    
    // Withdrawals (legacy)
    else if (req.method === 'GET' && path === '/api/withdrawals') {
      const transactionsCollection = database.collection('transactions');
      const withdrawals = await transactionsCollection
        .find({ type: 'withdrawal' })
        .sort({ createdAt: -1 })
        .toArray();
      res.json(withdrawals);
    }
    
    else if (req.method === 'GET' && path.startsWith('/api/withdrawals/')) {
      const withdrawalId = path.split('/').pop();
      const transactionsCollection = database.collection('transactions');
      let withdrawal;
      try {
        withdrawal = await transactionsCollection.findOne({ _id: new ObjectId(withdrawalId) });
      } catch (objectIdError) {
        withdrawal = await transactionsCollection.findOne({ _id: withdrawalId });
      }
      
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      res.json(withdrawal);
    }
    
    else if (req.method === 'POST' && path === '/api/withdrawals') {
      const newWithdrawal = req.body;
      const transactionsCollection = database.collection('transactions');
      const result = await transactionsCollection.insertOne({
        ...newWithdrawal,
        type: 'withdrawal',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const withdrawal = await transactionsCollection.findOne({ _id: result.insertedId });
      res.json(withdrawal);
    }
    
    else if (req.method === 'PATCH' && path.startsWith('/api/withdrawals/')) {
      const withdrawalId = path.split('/').pop();
      const updateData = req.body;
      const transactionsCollection = database.collection('transactions');
      
      let result;
      try {
        result = await transactionsCollection.findOneAndUpdate(
          { _id: new ObjectId(withdrawalId) },
          { $set: { ...updateData, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      } catch (objectIdError) {
        result = await transactionsCollection.findOneAndUpdate(
          { _id: withdrawalId },
          { $set: { ...updateData, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      }
      
      if (!result) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      res.json(result);
    }
    
    // Admins (legacy)
    else if (req.method === 'GET' && path === '/api/admins') {
      const adminsCollection = database.collection('admins');
      const admins = await adminsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.json(admins);
    }
    
    else if (req.method === 'GET' && path.startsWith('/api/admins/')) {
      const adminId = path.split('/').pop();
      const adminsCollection = database.collection('admins');
      let admin;
      try {
        admin = await adminsCollection.findOne({ _id: new ObjectId(adminId) });
      } catch (objectIdError) {
        admin = await adminsCollection.findOne({ _id: adminId });
      }
      
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      res.json(admin);
    }
    
    // Daily Check-ins (legacy)
    else if (req.method === 'GET' && path === '/api/daily-check-ins') {
      const dailyCheckInsCollection = database.collection('dailyCheckIns');
      const checkIns = await dailyCheckInsCollection
        .find({})
        .sort({ dayNumber: 1 })
        .toArray();
      res.json(checkIns);
    }
    
    else if (req.method === 'PATCH' && path.startsWith('/api/daily-check-ins/')) {
      const checkInId = path.split('/').pop();
      const updateData = req.body;
      const dailyCheckInsCollection = database.collection('dailyCheckIns');
      
      let result;
      try {
        result = await dailyCheckInsCollection.findOneAndUpdate(
          { _id: new ObjectId(checkInId) },
          { $set: { ...updateData, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      } catch (objectIdError) {
        result = await dailyCheckInsCollection.findOneAndUpdate(
          { _id: checkInId },
          { $set: { ...updateData, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      }
      
      if (!result) {
        return res.status(404).json({ message: "Daily check-in not found" });
      }
      res.json(result);
    }
    
    // VIP Levels (legacy)
    else if (req.method === 'GET' && path === '/api/vip-levels') {
      const vipLevelsCollection = database.collection('vipLevels');
      const vipLevels = await vipLevelsCollection
        .find({})
        .sort({ minAmount: 1 })
        .toArray();
      res.json(vipLevels);
    }
    
    else if (req.method === 'GET' && path.startsWith('/api/vip-levels/')) {
      const vipLevelId = path.split('/').pop();
      const vipLevelsCollection = database.collection('vipLevels');
      let vipLevel;
      try {
        vipLevel = await vipLevelsCollection.findOne({ _id: new ObjectId(vipLevelId) });
      } catch (objectIdError) {
        vipLevel = await vipLevelsCollection.findOne({ _id: vipLevelId });
      }
      
      if (!vipLevel) {
        return res.status(404).json({ message: "VIP level not found" });
      }
      res.json(vipLevel);
    }
    
    // Check all VIP levels
    else if (req.method === 'POST' && path === '/api/frontend/vip-levels/check-all') {
      const usersCollection = database.collection('users');
      const vipLevelsCollection = database.collection('vipLevels');
      const users = await usersCollection.find().toArray();

      let updatedCount = 0;
      for (const user of users) {
        const userId = user._id.toString();
        const oldLevel = user.vipLevel;
        
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
          try {
            await usersCollection.updateOne(
              { _id: new ObjectId(userId) },
              { 
                $set: { 
                  vipLevel: newVipLevel,
                  updatedAt: new Date() 
                } 
              }
            );
            updatedCount++;
          } catch (objectIdError) {
            await usersCollection.updateOne(
              { _id: userId },
              { 
                $set: { 
                  vipLevel: newVipLevel,
                  updatedAt: new Date() 
                } 
              }
            );
            updatedCount++;
          }
        }
      }

      res.json({
        success: true,
        message: `Checked ${users.length} users, updated ${updatedCount} VIP levels`,
        totalUsers: users.length,
        updatedCount
      });
    }
    
    // Stats (legacy)
    else if (req.method === 'GET' && path === '/api/stats') {
      const usersCollection = database.collection('users');
      const campaignsCollection = database.collection('campaigns');
      const transactionsCollection = database.collection('transactions');
      
      const totalUsers = await usersCollection.countDocuments();
      const totalCampaigns = await campaignsCollection.countDocuments();
      const totalTransactions = await transactionsCollection.countDocuments();
      
      res.json({
        id: "801874e4-2df4-4947-b453-787a82073f09",
        depositsToday: "16200",
        depositsYesterday: "25065820.12",
        depositsTotal: "25065820.12",
        approvedToday: "16200",
        approvedYesterday: "25065820.12",
        approvedTotal: "25065820.12",
        pendingToday: "0",
        pendingYesterday: "0",
        pendingTotal: "0",
        rejectedToday: "0",
        rejectedYesterday: "0",
        rejectedTotal: "0",
        customersToday: totalUsers,
        customersYesterday: 0,
        customersTotal: totalUsers
      });
    }
    
    else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      type: error.name,
      details: 'Check server logs for more information'
    });
  }
}