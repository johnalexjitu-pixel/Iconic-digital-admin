import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://iconicdigital:iconicdigital@iconicdigital.t5nr2g9.mongodb.net/?retryWrites=true&w=majority&appName=iconicdigital';
const DB_NAME = 'iconicdigital';

let client = null;
let db = null;

async function connectToDatabase() {
  if (db) {
    return db;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📡 MongoDB URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('❌ Error details:', error.message);
    throw error;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const database = await connectToDatabase();
    
    if (req.method === 'GET') {
      // Handle different API endpoints
      const url = new URL(req.url, `http://${req.headers.host}`);
      const path = url.pathname;
      
      if (path === '/api/stats') {
        // Return mock stats for now
        res.status(200).json({
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
          customersToday: 4,
          customersYesterday: 0,
          customersTotal: 4
        });
      } else if (path === '/api/frontend/dashboard-stats') {
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
      } else if (path === '/api/frontend/users') {
        const { searchParams } = url;
        const query = {};
        
        if (searchParams.get('search')) {
          const search = searchParams.get('search');
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { membershipId: { $regex: search, $options: 'i' } }
          ];
        }

        const usersCollection = database.collection('users');
        const users = await usersCollection
          .find(query)
          .sort({ createdAt: -1 })
          .limit(100)
          .toArray();

        const total = await usersCollection.countDocuments(query);

        res.json({
          success: true,
          data: users,
          pagination: {
            page: 1,
            limit: 100,
            total,
            pages: Math.ceil(total / 100)
          }
        });
      } else if (path === '/api/frontend/campaigns') {
        const campaignsCollection = database.collection('campaigns');
        const campaigns = await campaignsCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();

        res.json({
          success: true,
          data: campaigns,
          total: campaigns.length
        });
      } else if (path === '/api/frontend/products') {
        // Return empty products array for now
        res.json({
          success: true,
          data: [],
          total: 0
        });
      } else if (path === '/api/products') {
        // Return empty products array for now
        res.json([]);
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    } else if (req.method === 'POST') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const path = url.pathname;
      
      if (path === '/api/admin/login') {
        const { username, password } = req.body;
        
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

        if (!admin || admin.password !== password) {
          return res.status(401).json({ 
            success: false, 
            error: "Invalid username or password" 
          });
        }

        await adminsCollection.updateOne(
          { _id: admin._id },
          { $set: { lastLogin: new Date() } }
        );

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
      } else if (path === '/api/frontend/products') {
        // Handle product creation
        const { name, code, price, imageType } = req.body;
        
        if (!name || !code) {
          return res.status(400).json({
            success: false,
            error: "Name and code are required"
          });
        }

        // For now, just return success without actually saving
        res.json({
          success: true,
          data: {
            id: Math.random().toString(36).substr(2, 9),
            name,
            code,
            price: price || 0,
            imageType: imageType || null,
            createdAt: new Date()
          },
          message: "Product created successfully"
        });
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
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
