import { MongoClient, ObjectId } from 'mongodb';

// Function to parse user agent for device information
function parseUserAgent(userAgent) {
  const ua = userAgent.toLowerCase();
  
  // Device type detection
  let deviceType = 'Desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'Tablet';
  }
  
  // Device name and model detection
  let deviceName = 'Unknown Device';
  let deviceModel = 'Unknown Model';
  
  if (ua.includes('iphone')) {
    deviceName = 'iPhone';
    // Extract iPhone model
    const iphoneMatch = ua.match(/iphone\s+os\s+[\d_]+/);
    if (iphoneMatch) {
      deviceModel = iphoneMatch[0].replace('iphone os ', '').replace(/_/g, '.');
    }
  } else if (ua.includes('ipad')) {
    deviceName = 'iPad';
    deviceModel = 'iPad';
  } else if (ua.includes('android')) {
    deviceName = 'Android Device';
    // Extract Android device info
    const androidMatch = ua.match(/android\s+[\d.]+/);
    if (androidMatch) {
      deviceModel = androidMatch[0];
    }
  } else if (ua.includes('windows')) {
    deviceName = 'Windows PC';
    if (ua.includes('windows nt 10.0')) {
      deviceModel = 'Windows 10';
    } else if (ua.includes('windows nt 11.0')) {
      deviceModel = 'Windows 11';
    } else {
      deviceModel = 'Windows';
    }
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    deviceName = 'Mac';
    if (ua.includes('mac os x')) {
      deviceModel = 'macOS';
    } else {
      deviceModel = 'Mac';
    }
  } else if (ua.includes('linux')) {
    deviceName = 'Linux PC';
    deviceModel = 'Linux';
  }
  
  // Browser detection
  let browserInfo = 'Unknown Browser';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    const chromeMatch = ua.match(/chrome\/([\d.]+)/);
    browserInfo = chromeMatch ? `Chrome ${chromeMatch[1]}` : 'Chrome';
  } else if (ua.includes('firefox')) {
    const firefoxMatch = ua.match(/firefox\/([\d.]+)/);
    browserInfo = firefoxMatch ? `Firefox ${firefoxMatch[1]}` : 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    const safariMatch = ua.match(/version\/([\d.]+)/);
    browserInfo = safariMatch ? `Safari ${safariMatch[1]}` : 'Safari';
  } else if (ua.includes('edg')) {
    const edgeMatch = ua.match(/edg\/([\d.]+)/);
    browserInfo = edgeMatch ? `Edge ${edgeMatch[1]}` : 'Edge';
  }
  
  // OS information
  let osInfo = 'Unknown OS';
  if (ua.includes('windows nt 10.0')) {
    osInfo = 'Windows 10';
  } else if (ua.includes('windows nt 11.0')) {
    osInfo = 'Windows 11';
  } else if (ua.includes('mac os x')) {
    osInfo = 'macOS';
  } else if (ua.includes('android')) {
    osInfo = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    osInfo = 'iOS';
  } else if (ua.includes('linux')) {
    osInfo = 'Linux';
  }
  
  return {
    deviceType,
    deviceName,
    deviceModel,
    browserInfo,
    osInfo
  };
}

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
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      ssl: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    });
    
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Ping to verify connection
    await db.admin().ping();
    console.log('✅ MongoDB ping successful');
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    
    // Reset client and db for retry
    client = null;
    db = null;
    
    throw error;
  }
}

export default async function handler(req, res) {
  // Enable CORS and prevent caching
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Prevent caching to ensure fresh data
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('ETag', `"${Date.now()}"`);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Log all requests for debugging
  console.log(`📥 API Request: ${req.method} ${req.url}`);

  try {
    console.log("🚀 API Request:", req.method, req.url);
    console.log("🚀 Request path:", req.url);
    
    // Try to connect with retry mechanism for SSL errors
    let database;
    let retries = 3;
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        database = await connectToDatabase();
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        console.log(`⚠️ Connection attempt ${i + 1}/${retries} failed`);
        
        // Reset connection state for retry
        client = null;
        db = null;
        
        if (i < retries - 1) {
          // Wait before retry (exponential backoff)
          const waitTime = Math.min(1000 * Math.pow(2, i), 5000);
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (!database) {
      console.error('❌ All connection attempts failed');
      return res.status(503).json({
        success: false,
        error: 'Database connection failed after multiple retries',
        details: lastError?.message || 'Unknown error'
      });
    }
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    
    console.log("🚀 Parsed path:", path);
    
    // Admin Authentication Routes
    
    // Create Admin
    if (req.method === 'POST' && path === '/api/admin/create') {
      console.log('👤 Creating new admin...');
      console.log('📦 Request body:', JSON.stringify(req.body));
      
      try {
        const { username, email, password, fullName, role = 'team' } = req.body;
        console.log('🔍 Extracted data:', { username, email, fullName, role, hasPassword: !!password });
        
        // Validation
        if (!username || !email || !password || !fullName) {
          return res.status(400).json({
            success: false,
            error: 'All fields are required'
          });
        }
        
        if (password.length < 6) {
          return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters long'
          });
        }
        
        // Get admins collection
        const adminsCollection = database.collection('admins');
        
        // Check if admin already exists
        const existingAdmin = await adminsCollection.findOne({
          $or: [
            { username: username },
            { email: email }
          ]
        });
        
        if (existingAdmin) {
          return res.status(400).json({
            success: false,
            error: 'Admin with this username or email already exists'
          });
        }
        
        // Create admin (password stored as plain text)
        const adminData = {
          username,
          email,
          password: password,
          fullName,
          role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await adminsCollection.insertOne(adminData);
        
        console.log(`✅ Admin created successfully: ${username}`);
        
        res.json({
          success: true,
          message: 'Admin created successfully',
          data: {
            id: result.insertedId,
            username,
            email,
            fullName,
            role
          }
        });
        
      } catch (error) {
        console.error('❌ Error creating admin:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create admin'
        });
      }
    }
    
    // Admin Login
    if (req.method === 'POST' && path === '/api/admin/login') {
      const { username, password, deviceInfo } = req.body;
      
      console.log(`🔐 Admin login attempt: ${username}`);
      console.log(`📱 Device info:`, deviceInfo);

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

      // Get client IP address
      const clientIP = req.headers['x-forwarded-for'] || 
                      req.headers['x-real-ip'] || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress ||
                      (req.connection.socket ? req.connection.socket.remoteAddress : null);

      // Generate or use provided device ID
      const deviceId = deviceInfo?.deviceId || `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Parse user agent for device information
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const deviceDetails = parseUserAgent(userAgent);
      
      // Create device session with enhanced information
      const deviceSession = {
        deviceId,
        ipAddress: clientIP,
        userAgent: userAgent,
        deviceType: deviceInfo?.deviceType || deviceDetails.deviceType,
        deviceName: deviceInfo?.deviceName || deviceDetails.deviceName,
        deviceModel: deviceInfo?.deviceModel || deviceDetails.deviceModel,
        browserInfo: deviceInfo?.browserInfo || deviceDetails.browserInfo,
        osInfo: deviceInfo?.osInfo || deviceDetails.osInfo,
        loginTime: new Date(),
        isActive: true
      };

      // Update admin with device tracking
      await adminsCollection.updateOne(
        { _id: admin._id },
        { 
          $set: { 
            lastLogin: new Date(),
            currentIP: clientIP,
            currentDeviceId: deviceId
          },
          $push: {
            deviceSessions: {
              $each: [deviceSession],
              $slice: -10 // Keep only last 10 sessions
            }
          }
        }
      );

      console.log(`✅ Admin logged in successfully: ${username} from IP: ${clientIP}`);

      res.json({
        success: true,
        data: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          deviceId,
          currentIP: clientIP
        },
        message: "Login successful"
      });
    }
    
    // Get Current Admin Info
    else if (req.method === 'GET' && path === '/api/admin/current') {
      console.log('👤 Fetching current admin info...');
      
      try {
        const { username } = req.query;
        
        if (!username) {
        return res.status(400).json({ 
          success: false, 
            error: 'Username is required'
        });
      }

      const adminsCollection = database.collection('admins');
        const admin = await adminsCollection.findOne({ 
          username,
          isActive: true 
        });
        
        if (!admin) {
          return res.status(404).json({
            success: false,
            error: 'Admin not found'
          });
        }
        
        // Remove password from response
        const { password, ...adminWithoutPassword } = admin;
        
        console.log(`✅ Current admin info fetched: ${username} (${admin.role})`);
        
        res.json({
          success: true,
          data: adminWithoutPassword
        });
        
      } catch (error) {
        console.error('❌ Error fetching current admin info:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch current admin info'
        });
      }
    }
    
    // Get Admin List
    else if (req.method === 'GET' && path === '/api/admin/list') {
      console.log('📋 Fetching admin list...');
      
      try {
        const { page = 1, limit = 10, search = '', status = 'all', currentUserRole = 'team' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const adminsCollection = database.collection('admins');
        
        // Build query
        let query = {};
        
        // Role-based filtering
        if (currentUserRole === 'team') {
          // Team role can only see other team members
          query.role = 'team';
        } else if (currentUserRole === 'admin') {
          // Admin role can see team and admin (but not superadmin)
          query.role = { $in: ['team', 'admin'] };
        }
        // superadmin can see all roles (no additional filtering)
        
        if (search) {
          query.$and = query.$and || [];
          query.$and.push({
            $or: [
              { username: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { fullName: { $regex: search, $options: 'i' } }
            ]
          });
        }
        
        if (status !== 'all') {
          query.isActive = status === 'active';
        }
        
        // Get total count
        const total = await adminsCollection.countDocuments(query);
        
        // Get admins with pagination
        const admins = await adminsCollection
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .toArray();
        
        // Remove password from response and add device info for superadmin
        const adminsWithoutPassword = admins.map(admin => {
          const { password, ...adminWithoutPassword } = admin;
          
          // Add device information if current user is superadmin
          if (currentUserRole === 'superadmin') {
            console.log(`🔍 Admin ${admin.username} device data:`, {
              currentIP: admin.currentIP,
              currentDeviceId: admin.currentDeviceId,
              deviceSessions: admin.deviceSessions,
              lastLogin: admin.lastLogin
            });
            
            adminWithoutPassword.deviceInfo = {
              currentIP: admin.currentIP || 'Not Available',
              currentDeviceId: admin.currentDeviceId || 'Not Available',
              deviceCount: admin.deviceSessions ? admin.deviceSessions.filter(session => session.isActive).length : 0,
              lastLogin: admin.lastLogin,
              deviceSessions: admin.deviceSessions ? admin.deviceSessions.slice(-5) : [] // Last 5 sessions
            };
            
            console.log(`✅ Device info for ${admin.username}:`, adminWithoutPassword.deviceInfo);
          }
          
          return adminWithoutPassword;
        });
        
        const pages = Math.ceil(total / limitNum);
        
        console.log(`✅ Found ${adminsWithoutPassword.length} admins (total: ${total}) for role: ${currentUserRole}`);
        
        res.json({
          success: true,
          data: adminsWithoutPassword,
          total,
          pages,
          currentPage: pageNum,
          limit: limitNum
        });
        
      } catch (error) {
        console.error('❌ Error fetching admin list:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch admin list'
        });
      }
    }
    
    // Toggle Admin Status
    else if (req.method === 'POST' && path === '/api/admin/toggle-status') {
      console.log('🔄 Toggling admin status...');
      
      try {
        const { adminId, isActive } = req.body;
        
        if (!adminId || typeof isActive !== 'boolean') {
        return res.status(400).json({ 
          success: false, 
            error: 'Admin ID and status are required'
          });
        }
        
        const adminsCollection = database.collection('admins');
        
        const result = await adminsCollection.updateOne(
          { _id: new ObjectId(adminId) },
          { 
            $set: { 
              isActive,
        updatedAt: new Date()
            }
          }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            error: 'Admin not found'
          });
        }
        
        console.log(`✅ Admin status updated: ${adminId} -> ${isActive ? 'active' : 'inactive'}`);

      res.json({
        success: true,
          message: 'Admin status updated successfully'
        });
        
      } catch (error) {
        console.error('❌ Error updating admin status:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update admin status'
        });
      }
    }
    
    // Populate device info for existing admins (for testing)
    else if (req.method === 'POST' && path === '/api/admin/populate-device-info') {
      console.log('🔧 Populating device info for existing admins...');
      
      try {
        const adminsCollection = database.collection('admins');
        
        // Get all admins without device info
        const adminsWithoutDeviceInfo = await adminsCollection.find({
          $or: [
            { currentIP: { $exists: false } },
            { currentIP: null },
            { deviceSessions: { $exists: false } },
            { deviceSessions: null }
          ]
        }).toArray();
        
        console.log(`🔧 Found ${adminsWithoutDeviceInfo.length} admins without device info`);
        
        // Update each admin with enhanced device info
        for (const admin of adminsWithoutDeviceInfo) {
          const mockIP = `192.168.1.${Math.floor(Math.random() * 255)}`;
          const mockDeviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          
          // Generate realistic device information
          const deviceTypes = ['Desktop', 'Mobile', 'Tablet'];
          const deviceNames = ['Windows PC', 'Mac', 'iPhone', 'Android Device', 'iPad'];
          const deviceModels = ['Windows 10', 'Windows 11', 'macOS', 'iPhone 15', 'Samsung Galaxy S24'];
          const browsers = ['Chrome 120.0.0.0', 'Firefox 119.0', 'Safari 17.0', 'Edge 120.0.0.0'];
          const osInfo = ['Windows 11', 'macOS Sonoma', 'iOS 17', 'Android 14'];
          
          const randomDeviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
          const randomDeviceName = deviceNames[Math.floor(Math.random() * deviceNames.length)];
          const randomDeviceModel = deviceModels[Math.floor(Math.random() * deviceModels.length)];
          const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];
          const randomOS = osInfo[Math.floor(Math.random() * osInfo.length)];
          
          await adminsCollection.updateOne(
            { _id: admin._id },
            {
              $set: {
                currentIP: mockIP,
                currentDeviceId: mockDeviceId,
                deviceSessions: [{
                  deviceId: mockDeviceId,
                  ipAddress: mockIP,
                  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  deviceType: randomDeviceType,
                  deviceName: randomDeviceName,
                  deviceModel: randomDeviceModel,
                  browserInfo: randomBrowser,
                  osInfo: randomOS,
                  loginTime: admin.lastLogin || new Date(),
                  isActive: true
                }]
              }
            }
          );
          
          console.log(`✅ Updated device info for admin: ${admin.username}`);
        }
        
        res.json({
          success: true,
          message: `Updated device info for ${adminsWithoutDeviceInfo.length} admins`,
          updatedCount: adminsWithoutDeviceInfo.length
        });
        
      } catch (error) {
        console.error('❌ Error populating device info:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to populate device info'
        });
      }
    }
    
    // Get Admin Device Info (Superadmin only)
    else if (req.method === 'GET' && path.startsWith('/api/admin/device-info/')) {
      console.log('📱 Fetching admin device info...');
      
      try {
        const { currentUserRole } = req.query;
        
        // Only superadmin can access device info
        if (currentUserRole !== 'superadmin') {
          return res.status(403).json({
            success: false,
            error: 'Access denied. Superadmin role required.'
          });
        }
        
        const adminId = path.split('/').pop();
        console.log(`📱 Fetching device info for admin: ${adminId}`);
        
        const adminsCollection = database.collection('admins');
        const admin = await adminsCollection.findOne({ _id: new ObjectId(adminId) });
        
        if (!admin) {
          return res.status(404).json({
            success: false,
            error: 'Admin not found'
          });
        }
        
        const deviceInfo = {
          adminId: admin._id,
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName,
          currentIP: admin.currentIP || 'Not Available',
          currentDeviceId: admin.currentDeviceId || 'Not Available',
          deviceCount: admin.deviceSessions ? admin.deviceSessions.filter(session => session.isActive).length : 0,
          lastLogin: admin.lastLogin,
          allDeviceSessions: admin.deviceSessions || [],
          createdAt: admin.createdAt,
          isActive: admin.isActive
        };
        
        console.log(`✅ Device info retrieved for admin: ${admin.username}`);
        
        res.json({
          success: true,
          data: deviceInfo
        });
        
      } catch (error) {
        console.error('❌ Error fetching admin device info:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch admin device info'
        });
      }
    }
    
    // Developer Notice Management
    else if (req.method === 'POST' && path === '/api/developer-notice/create') {
      console.log('📝 Creating new developer notice...');
      try {
        const { content, visibleToRoles, createdByUsername } = req.body;

        if (!content || !visibleToRoles || !Array.isArray(visibleToRoles) || visibleToRoles.length === 0 || !createdByUsername) {
          return res.status(400).json({
            success: false,
            error: 'Content, visibleToRoles (array), and createdByUsername are required'
          });
        }

        const adminsCollection = database.collection('admins');
        const creatorAdmin = await adminsCollection.findOne({ username: createdByUsername, isActive: true });

        if (!creatorAdmin || creatorAdmin.role !== 'superadmin') {
          return res.status(403).json({
            success: false,
            error: 'Only Super Admin can create developer notices'
          });
        }

        const developerNoticesCollection = database.collection('developerNotices');
        const noticeData = {
          content,
          visibleToRoles,
          createdBy: createdByUsername,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };

        const result = await developerNoticesCollection.insertOne(noticeData);
        console.log(`✅ Developer notice created successfully by ${createdByUsername}`);
        res.json({
          success: true,
          message: 'Developer notice created successfully',
        data: {
          id: result.insertedId,
            ...noticeData
          }
        });

      } catch (error) {
        console.error('❌ Error creating developer notice:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create developer notice'
        });
      }
    }
    else if (req.method === 'GET' && path === '/api/developer-notice/list') {
      console.log('📋 Fetching developer notices...');
      try {
        const { currentUserUsername } = req.query;

        if (!currentUserUsername) {
          return res.status(400).json({
            success: false,
            error: 'currentUserUsername is required'
          });
        }

        const adminsCollection = database.collection('admins');
        const currentAdmin = await adminsCollection.findOne({ username: currentUserUsername, isActive: true });

        if (!currentAdmin) {
          return res.status(404).json({
            success: false,
            error: 'Current admin not found or inactive'
          });
        }

        const currentUserRole = currentAdmin.role;
        const developerNoticesCollection = database.collection('developerNotices');

        // Fetch notices that are active and visible to the current user's role
        const notices = await developerNoticesCollection.find({
          isActive: true,
          visibleToRoles: currentUserRole
        }).sort({ createdAt: -1 }).toArray();

        console.log(`✅ Found ${notices.length} developer notices for role: ${currentUserRole}`);
        res.json({
          success: true,
          data: notices
        });

      } catch (error) {
        console.error('❌ Error fetching developer notices:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch developer notices'
        });
      }
    }
    else if (req.method === 'GET' && path === '/api/developer-notice/all') {
      console.log('📋 Fetching all developer notices for management...');
      try {
        const { currentUserUsername } = req.query;

        if (!currentUserUsername) {
          return res.status(400).json({
            success: false,
            error: 'currentUserUsername is required'
          });
        }

        const adminsCollection = database.collection('admins');
        const currentAdmin = await adminsCollection.findOne({ username: currentUserUsername, isActive: true });

        if (!currentAdmin || currentAdmin.role !== 'superadmin') {
          return res.status(403).json({
            success: false,
            error: 'Only Super Admin can view all notices'
          });
        }

        const developerNoticesCollection = database.collection('developerNotices');
        const notices = await developerNoticesCollection.find({}).sort({ createdAt: -1 }).toArray();

        console.log(`✅ Found ${notices.length} developer notices for management`);
        res.json({
          success: true,
          data: notices
        });

      } catch (error) {
        console.error('❌ Error fetching all developer notices:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch all developer notices'
        });
      }
    }
    else if (req.method === 'PUT' && path.startsWith('/api/developer-notice/update/')) {
      console.log('🔄 Updating developer notice...');
      try {
        const noticeId = path.split('/').pop();
        const { content, visibleToRoles, updatedByUsername } = req.body;

        if (!noticeId || !content || !visibleToRoles || !Array.isArray(visibleToRoles) || visibleToRoles.length === 0 || !updatedByUsername) {
          return res.status(400).json({
            success: false,
            error: 'Notice ID, content, visibleToRoles (array), and updatedByUsername are required'
          });
        }

        const adminsCollection = database.collection('admins');
        const updaterAdmin = await adminsCollection.findOne({ username: updatedByUsername, isActive: true });

        if (!updaterAdmin || updaterAdmin.role !== 'superadmin') {
          return res.status(403).json({
            success: false,
            error: 'Only Super Admin can update developer notices'
          });
        }

        const developerNoticesCollection = database.collection('developerNotices');
        const result = await developerNoticesCollection.updateOne(
          { _id: new ObjectId(noticeId) },
          { 
            $set: {
              content,
              visibleToRoles,
              updatedBy: updatedByUsername,
              updatedAt: new Date()
            }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            error: 'Developer notice not found'
          });
        }

        console.log(`✅ Developer notice ${noticeId} updated successfully by ${updatedByUsername}`);
        res.json({
          success: true,
          message: 'Developer notice updated successfully'
        });

      } catch (error) {
        console.error('❌ Error updating developer notice:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update developer notice'
        });
      }
    }
    else if (req.method === 'DELETE' && path.startsWith('/api/developer-notice/delete/')) {
      console.log('🗑️ Deleting developer notice...');
      try {
        const noticeId = path.split('/').pop();
        const { deletedByUsername } = req.body;

        if (!noticeId || !deletedByUsername) {
          return res.status(400).json({
            success: false,
            error: 'Notice ID and deletedByUsername are required'
          });
        }

        const adminsCollection = database.collection('admins');
        const deleterAdmin = await adminsCollection.findOne({ username: deletedByUsername, isActive: true });

        if (!deleterAdmin || deleterAdmin.role !== 'superadmin') {
          return res.status(403).json({
            success: false,
            error: 'Only Super Admin can delete developer notices'
          });
        }

        const developerNoticesCollection = database.collection('developerNotices');
        const result = await developerNoticesCollection.deleteOne({ _id: new ObjectId(noticeId) });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            error: 'Developer notice not found'
          });
        }

        console.log(`✅ Developer notice ${noticeId} deleted successfully by ${deletedByUsername}`);
        res.json({
          success: true,
          message: 'Developer notice deleted successfully'
        });

      } catch (error) {
        console.error('❌ Error deleting developer notice:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to delete developer notice'
        });
      }
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
    
    // Test endpoint to verify API routing
    else if (req.method === 'GET' && path === '/api/test') {
      res.json({
        success: true,
        message: "API is working",
        timestamp: new Date().toISOString()
      });
    }
    
    // Test MongoDB connection specifically
    else if (req.method === 'GET' && path === '/api/test-mongodb') {
      try {
        console.log("🔍 Testing MongoDB connection...");
        
        // Test basic connection
        const pingResult = await database.admin().ping();
        console.log("✅ MongoDB ping successful");
        
        // Test withdrawals collection
        const withdrawalsCollection = database.collection('withdrawals');
        const count = await withdrawalsCollection.countDocuments();
        console.log(`✅ Withdrawals collection has ${count} documents`);
        
        // Get sample data
        const sampleWithdrawals = await withdrawalsCollection.find({}).limit(3).toArray();
        console.log(`✅ Sample withdrawals:`, sampleWithdrawals.length);
        
        res.json({
          success: true,
          message: "MongoDB connection working",
          timestamp: new Date().toISOString(),
          mongodb: {
            connected: true,
            pingResult: pingResult,
            withdrawalsCount: count,
            sampleCount: sampleWithdrawals.length,
            sampleData: sampleWithdrawals
          }
        });
      } catch (error) {
        console.error("❌ MongoDB test failed:", error);
        res.status(500).json({
          success: false,
          message: "MongoDB connection failed",
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Simple withdrawal debug endpoint
    else if (req.method === 'GET' && path === '/api/debug-withdrawals') {
      try {
        console.log("🔍 Debug withdrawals endpoint called");
        
        const withdrawalsCollection = database.collection('withdrawals');
        const count = await withdrawalsCollection.countDocuments();
        console.log(`📊 Total withdrawals in database: ${count}`);
        
        const withdrawals = await withdrawalsCollection.find({}).limit(5).toArray();
        console.log(`📊 Sample withdrawals:`, withdrawals.length);
        
        res.json({
          success: true,
          message: "Debug withdrawals successful",
          timestamp: new Date().toISOString(),
          data: {
            totalCount: count,
            sampleCount: withdrawals.length,
            withdrawals: withdrawals
          }
        });
      } catch (error) {
        console.error("❌ Debug withdrawals error:", error);
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Health check endpoint with MongoDB status
    else if (req.method === 'GET' && path === '/api/health') {
      try {
        // Check MongoDB connection
        const pingResult = await database.admin().ping();
        const dbStats = await database.stats();
        
        res.json({
          success: true,
          status: "healthy",
          timestamp: new Date().toISOString(),
          database: {
            connected: true,
            name: database.databaseName,
            collections: dbStats.collections,
            dataSize: dbStats.dataSize,
            indexSize: dbStats.indexSize
          }
        });
      } catch (error) {
        res.status(503).json({
          success: false,
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
    }
    
    // Debug campaigns endpoint
    else if (req.method === 'GET' && path === '/api/debug-campaigns') {
      console.log("🔍 Debug campaigns endpoint called");
      try {
        const campaignsCollection = database.collection('campaigns');
        const totalCampaigns = await campaignsCollection.countDocuments();
        const campaigns = await campaignsCollection.find({}).limit(5).toArray();
        
        console.log("📊 Debug - Total campaigns:", totalCampaigns);
        console.log("📊 Debug - Sample campaigns:", campaigns.length);
        
        res.json({
          success: true,
          totalCampaigns,
          sampleCampaigns: campaigns,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("❌ Debug campaigns error:", error);
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Remove this simple endpoint - it's interfering with the proper one
    
    // Toggle user account status (suspend/activate) - MUST BE BEFORE user profile update
    else if (req.method === 'PATCH' && path.match(/^\/api\/frontend\/users\/[^\/]+\/toggle-status$/)) {
      console.log(`🔄 Toggle status request matched - Method: ${req.method}, Path: ${path}`);
      console.log(`🔄 Regex test result:`, /^\/api\/frontend\/users\/[^\/]+\/toggle-status$/.test(path));
      
      try {
        const pathParts = path.split('/');
        console.log(`🔄 Path parts:`, pathParts);
        const userId = pathParts[pathParts.length - 2]; // Get userId from the path
        console.log(`🔄 Extracted userId: ${userId}`);

        const usersCollection = database.collection('users');
        console.log(`🔄 Looking for user with ID: ${userId}`);
        
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        console.log(`🔄 User found:`, user ? 'Yes' : 'No');
        
        if (!user) {
          console.log(`❌ User not found with ID: ${userId}`);
          return res.status(404).json({ 
            success: false, 
            error: "User not found" 
          });
        }

        console.log(`🔄 Current user data:`, {
          _id: user._id,
          name: user.name,
          status: user.status,
          isActive: user.isActive
        });

        // Get current status from database (check both isActive and status fields)
        const currentStatus = user.status || (user.isActive ? 'active' : 'inactive');
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        
        console.log(`🔄 Status change: ${currentStatus} -> ${newStatus}`);
        
        const updateResult = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { 
            $set: { 
              status: newStatus,
              isActive: newStatus === 'active',
              accountStatus: newStatus,
              updatedAt: new Date()
            } 
          }
        );

        console.log(`🔄 Update result:`, {
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount,
          acknowledged: updateResult.acknowledged
        });

        console.log(`✅ User ${userId} status changed from ${currentStatus} to: ${newStatus}`);

        res.json({
          success: true,
          message: `User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`,
          data: {
            userId,
            status: newStatus,
            isActive: newStatus === 'active'
          }
        });
      } catch (error) {
        console.error(`❌ Error in toggle status endpoint:`, error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
          details: error.message
        });
      }
    }
    
    // Update user profile
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/users/') && !path.includes('/balance') && !path.includes('/toggle-status')) {
      const userId = path.split('/').pop();
      const updateData = req.body;

      console.log(`✏️ Updating user ${userId}:`, updateData);
      console.log(`✏️ Update data keys:`, Object.keys(updateData));
      console.log(`✏️ CampaignStatus update:`, updateData.campaignStatus);

      delete updateData._id;
      delete updateData.createdAt;

      // Filter out empty/undefined fields to avoid overwriting existing data with empty values
      const filteredUpdateData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && updateData[key] !== null && updateData[key] !== "") {
          filteredUpdateData[key] = updateData[key];
        }
      });

      filteredUpdateData.updatedAt = new Date();
      
      console.log(`✏️ Filtered update data:`, filteredUpdateData);

      const usersCollection = database.collection('users');
      console.log(`✏️ Database update query:`, { _id: new ObjectId(userId) }, { $set: filteredUpdateData });
      
      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: filteredUpdateData },
        { 
          returnDocument: 'after',
          projection: {}
        }
      );

      console.log(`✏️ Database update result:`, result);

      if (!result) {
        console.log(`❌ User not found with ID: ${userId}`);
        return res.status(404).json({ 
          success: false, 
          error: "User not found" 
        });
      }

      console.log(`✅ User updated successfully:`, result._id);
      console.log(`✅ Updated user data:`, {
        _id: result._id,
        campaignStatus: result.campaignStatus,
        accountStatus: result.accountStatus
      });

      // If campaignsCompleted is being reset to 0, also delete customer tasks history
      if (filteredUpdateData.campaignsCompleted === 0) {
        console.log("🗑️ Campaigns completed reset to 0, deleting customer tasks history");
        
        try {
          const customerTasksCollection = database.collection('customerTasks');
          
          // Delete all tasks using multiple criteria
          const deleteCriteria = {
            $or: [
              { customerId: userId },
              { customerId: new ObjectId(userId) }
            ]
          };
          
          // Add customerCode to criteria
          if (result.membershipId) {
            deleteCriteria.$or.push({ customerCode: result.membershipId });
            deleteCriteria.$or.push({ customerCode: result.membershipId.toString() });
          }
          if (result.code) {
            deleteCriteria.$or.push({ customerCode: result.code });
            deleteCriteria.$or.push({ customerCode: result.code.toString() });
          }
          
          console.log("🗑️ Delete criteria:", JSON.stringify(deleteCriteria, null, 2));
          
          const deleteResult = await customerTasksCollection.deleteMany(deleteCriteria);
          
          console.log(`🗑️ Deleted ${deleteResult.deletedCount} tasks for customer ${userId}`);
          
          // Update the response message
          result.tasksDeleted = deleteResult.deletedCount;
        } catch (deleteError) {
          console.error("❌ Error deleting customer tasks:", deleteError);
          // Don't fail the entire operation if task deletion fails
        }
      }

      res.json({
        success: true,
        data: result,
        message: filteredUpdateData.campaignsCompleted === 0 && result.tasksDeleted ? 
          `User profile updated and ${result.tasksDeleted} tasks history cleared` : 
          "User profile updated successfully"
      });
    }
    
    // Simple test endpoint for balance update
    else if (req.method === 'GET' && path === '/api/test-balance') {
      try {
        if (!database) {
          return res.status(500).json({ success: false, error: "Database not connected" });
        }
        
        const usersCollection = database.collection('users');
        const testUser = await usersCollection.findOne({ membershipId: "77480" });
        
        res.json({
          success: true,
          message: "Balance update API is working",
          testUser: testUser ? {
            name: testUser.name,
            membershipId: testUser.membershipId,
            accountBalance: testUser.accountBalance
          } : null,
          databaseConnected: !!database,
          collectionName: usersCollection.collectionName
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
    
    // Test endpoint for debugging user lookup
    else if (req.method === 'GET' && path.includes('/api/debug/user/')) {
      const userId = path.split('/').pop();
      console.log(`🔍 Debug user lookup for: ${userId}`);
      
      try {
        if (!database) {
          return res.status(500).json({ 
            success: false, 
            error: "Database connection not available" 
          });
        }

        const usersCollection = database.collection('users');
        
        // Try multiple methods
        let user1, user2, user3;
        
        try {
          user1 = await usersCollection.findOne({ _id: new ObjectId(userId) });
        } catch (e) {
          console.log(`❌ ObjectId search failed: ${e.message}`);
        }
        
        user2 = await usersCollection.findOne({ _id: userId });
        user3 = await usersCollection.findOne({ membershipId: userId });
        
        const totalUsers = await usersCollection.countDocuments();
        
        res.json({
          success: true,
          debug: {
            userId,
            userIdType: typeof userId,
            userIdLength: userId?.length,
            totalUsers,
            objectIdSearch: user1 ? `Found: ${user1.name}` : 'Not found',
            stringIdSearch: user2 ? `Found: ${user2.name}` : 'Not found',
            membershipIdSearch: user3 ? `Found: ${user3.name}` : 'Not found',
            allResults: {
              user1,
              user2,
              user3
            }
          }
        });
      } catch (error) {
        console.error("❌ Debug error:", error);
        res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
    }
    
    // Update user balance
    else if (req.method === 'PATCH' && path.includes('/api/frontend/users/') && path.includes('/balance')) {
      // Extract userId from path - handle different path formats
      let userId;
      const pathParts = path.split('/');
      
      // Find the user ID in the path (it should be after /api/frontend/users/)
      const usersIndex = pathParts.indexOf('users');
      if (usersIndex !== -1 && pathParts[usersIndex + 1]) {
        userId = pathParts[usersIndex + 1];
      } else {
        userId = pathParts[pathParts.length - 2]; // Fallback to second to last part
      }
      
      const { amount, operation } = req.body;

      console.log(`💰 Updating balance for user ${userId}: ${operation} ${amount}`);
      console.log(`🔍 Full path: ${path}`);
      console.log(`🔍 Path parts: ${JSON.stringify(pathParts)}`);
      console.log(`🔍 Extracted userId: ${userId}`);
      console.log(`🔍 UserId type: ${typeof userId}`);
      console.log(`🔍 UserId length: ${userId?.length}`);

      // Validate userId
      if (!userId || userId === 'undefined' || userId === 'null' || userId === 'balance') {
        console.log(`❌ Invalid userId: ${userId}`);
        return res.status(400).json({ 
          success: false, 
          error: "Invalid user ID provided" 
        });
      }

      if (!amount || !operation) {
        return res.status(400).json({ 
          success: false, 
          error: "Amount and operation are required" 
        });
      }

      // Validate amount
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid amount provided. Amount must be a positive number." 
        });
      }

      // Check database connection
      if (!database) {
        console.error("❌ Database connection not available");
        return res.status(500).json({ 
          success: false, 
          error: "Database connection not available" 
        });
      }

      const usersCollection = database.collection('users');
      console.log(`🔍 MongoDB collection: ${usersCollection.collectionName}`);
      console.log(`🔍 Database name: ${database.databaseName}`);
      
      // Find user by multiple methods
      let user = null;
      console.log(`🔍 Searching for user with ID: ${userId}`);
      
      // Method 1: Try ObjectId search
      try {
        user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (user) {
          console.log(`✅ Found user by ObjectId: ${user.name} (${user.membershipId})`);
        }
      } catch (objectIdError) {
        console.log(`❌ ObjectId search failed for: ${userId}`);
      }
      
      // Method 2: Try string ID search
      if (!user) {
        user = await usersCollection.findOne({ _id: userId });
        if (user) {
          console.log(`✅ Found user by string ID: ${user.name} (${user.membershipId})`);
        }
      }
      
      // Method 3: Try membershipId search
      if (!user) {
        user = await usersCollection.findOne({ membershipId: userId });
        if (user) {
          console.log(`✅ Found user by membershipId: ${user.name} (${user.membershipId})`);
        }
      }
      
      // Method 4: Try email search
      if (!user) {
        user = await usersCollection.findOne({ email: userId });
        if (user) {
          console.log(`✅ Found user by email: ${user.name} (${user.membershipId})`);
        }
      }
      
      if (!user) {
        console.log(`❌ User not found with any method for userId: ${userId}`);
        // Get some sample users for debugging
        const sampleUsers = await usersCollection.find({}).limit(3).toArray();
        console.log(`🔍 Sample users in database:`, sampleUsers.map(u => ({ _id: u._id, membershipId: u.membershipId, name: u.name })));
        
        return res.status(404).json({ 
          success: false, 
          error: "User not found" 
        });
      }
      
      console.log(`✅ User found: ${user.name} (${user.membershipId}) with balance: ${user.accountBalance}`);

      const currentBalance = user.accountBalance || 0;
      let newBalance = currentBalance;

      if (operation === "add") {
        newBalance = currentBalance + numericAmount;
      } else if (operation === "subtract") {
        newBalance = currentBalance - numericAmount;
      } else {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid operation. Use 'add' or 'subtract'." 
        });
      }

      // Update the user's balance using the user's actual _id
      let result;
      console.log(`🔍 Updating balance for user _id: ${user._id}`);
      console.log(`🔍 Balance change: ${currentBalance} → ${newBalance} (${operation} ${numericAmount})`);
      
      const updateData = { 
        $set: { 
          accountBalance: newBalance,
          updatedAt: new Date()
        } 
      };
      
      const updateOptions = { 
        returnDocument: 'after',
        projection: { password: 0, withdrawalPassword: 0 }
      };
      
      try {
        result = await usersCollection.findOneAndUpdate(
          { _id: user._id },
          updateData,
          updateOptions
        );
        console.log(`✅ Balance update successful:`, result ? `Updated user: ${result.name}` : 'No result');
      } catch (updateError) {
        console.error("❌ Balance update error:", updateError);
        return res.status(500).json({ 
          success: false, 
          error: "Failed to update balance" 
        });
      }

      if (!result) {
        console.error("❌ No result returned from balance update");
        return res.status(500).json({ 
          success: false, 
          error: "Failed to update balance - no result returned" 
        });
      }

      console.log(`✅ Balance updated successfully: ${currentBalance} → ${newBalance}`);

      res.json({
        success: true,
        data: result,
        message: `Balance ${operation === "add" ? "added" : "subtracted"} successfully`,
        oldBalance: currentBalance,
        newBalance: newBalance,
        operation: operation,
        amount: numericAmount
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
      console.log("🔍 Frontend users API called with query params:", req.query);
      console.log("🔍 Request URL:", req.url);
      console.log("🔍 Environment:", process.env.NODE_ENV);
      console.log("🔍 Pagination params:", { page: req.query.page, limit: req.query.limit });
      
      const { 
        page = 1, 
        limit = 10, 
        level, 
        search, 
        membershipId, 
        phoneNumber, 
        isActive,
        startDate,
        endDate,
        number,
        withdrawalPassword,
        username,
        ipAddress,
        onlineStatus
      } = req.query;
      const query = {};
      
      if (level) query.level = level;
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { membershipId: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (membershipId) {
        query.membershipId = { $regex: membershipId, $options: 'i' };
      }
      
      if (phoneNumber) {
        query.phoneNumber = { $regex: phoneNumber, $options: 'i' };
        console.log(`🔍 Phone number filter applied:`, phoneNumber);
        console.log(`🔍 Phone number query:`, query.phoneNumber);
      }
      
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }
      
      // New filter parameters
      if (number) {
        query.email = { $regex: number, $options: 'i' };
      }
      
      if (username) {
        query.username = { $regex: username, $options: 'i' };
      }
      
      if (ipAddress) {
        query.ipAddress = { $regex: ipAddress, $options: 'i' };
      }
      
      if (onlineStatus && onlineStatus !== 'all') {
        // For now, we'll use a placeholder logic for online/offline status
        // You can implement actual online status tracking based on your requirements
        if (onlineStatus === 'online') {
          query.lastLogin = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }; // Last 24 hours
        } else if (onlineStatus === 'offline') {
          query.lastLogin = { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }; // More than 24 hours ago
        }
      }

      const usersCollection = database.collection('users');
      
      // Check total users in collection
      const totalUsersInCollection = await usersCollection.countDocuments({});
      console.log(`📊 Total users in collection: ${totalUsersInCollection}`);
      
      const users = await usersCollection
        .find(query, { 
          projection: { 
            // Include password and withdrawalPassword fields for admin view
            // Include all fields including username and number
          }
        })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .toArray();

      const total = await usersCollection.countDocuments(query);

      console.log(`📊 Found ${users.length} users (total: ${total}) with filters:`, query);
      console.log(`📊 Final query object:`, JSON.stringify(query, null, 2));
      console.log(`📊 Sample user data:`, users.length > 0 ? JSON.stringify(users[0], null, 2) : "No users found");
      console.log(`📊 Pagination response:`, {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
        usersReturned: users.length
      });
      
      // Debug withdrawalPassword field specifically
      if (users.length > 0) {
        console.log(`🔍 Debug withdrawalPassword fields:`, users.map(user => ({
          username: user.username,
          withdrawalPassword: user.withdrawalPassword,
          hasWithdrawalPassword: !!user.withdrawalPassword
        })));
        
        // Debug phone number fields
        console.log(`🔍 Debug phone number fields:`, users.map(user => ({
          username: user.username,
          phoneNumber: user.phoneNumber,
          number: user.number,
          email: user.email,
          hasPhoneNumber: !!user.phoneNumber,
          hasNumber: !!user.number
        })));
      }

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
    
    // Get customer tasks - Show ALL campaigns (not user-specific)
    else if (req.method === 'GET' && path.startsWith('/api/frontend/customer-tasks/') && !path.includes('/allow')) {
      console.log("🎯 MATCHED: Customer tasks endpoint - Showing ALL campaigns");
      const customerId = path.split('/')[3];
      console.log("📋 Customer ID:", customerId);
      console.log("📋 Showing ALL campaigns for customer task details");

      try {
        // Check MongoDB connection first
        console.log("📋 Database connection status:", database ? "Connected" : "Not connected");
        
        // Get all campaigns from campaignsCollection (same as Task Management)
        const campaignsCollection = database.collection('campaigns');
        console.log("📋 Fetching ALL campaigns from campaignsCollection");
        
        // Get all campaigns (same as Task Management page)
        const campaigns = await campaignsCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        
        console.log("📋 Found campaigns:", campaigns.length);
        console.log("📋 First campaign sample:", campaigns[0] ? {
          _id: campaigns[0]._id,
          brand: campaigns[0].brand,
          baseAmount: campaigns[0].baseAmount,
          logo: campaigns[0].logo,
          code: campaigns[0].code
        } : "No campaigns found");

        if (campaigns.length === 0) {
          console.log("No campaigns found in campaignsCollection");
          return res.json({ success: true, data: [], total: 0 });
        }

        // Get customer info for reference
        const usersCollection = database.collection('users');
        let customer = null;
        try {
          customer = await usersCollection.findOne({ _id: new ObjectId(customerId) });
        } catch (objectIdError) {
          customer = await usersCollection.findOne({ _id: customerId });
        }
        
        // Convert ALL campaigns to customer tasks format - SAME AS TASK MANAGEMENT
        const customerTasks = campaigns.map((campaign, index) => ({
          _id: campaign._id.toString(),
          customerId: customerId,
          customerCode: customer?.membershipId || customer?.code || "",
          taskNumber: index + 1,
          campaignId: campaign._id.toString(),
          taskCommission: campaign.commissionAmount || 0,
          taskPrice: campaign.baseAmount || 0,
          estimatedNegativeAmount: (campaign.commissionAmount || 0) * -1,
          priceFrom: 0,
          priceTo: 0,
          hasGoldenEgg: campaign.type === "Paid" || (campaign.baseAmount || 0) > 10000,
          expiredDate: campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending',
          createdAt: campaign.createdAt || new Date(),
          updatedAt: new Date(),
          // Campaign fields - SAME AS TASK MANAGEMENT PAGE
          campaignName: campaign.brand || campaign.name || `Campaign ${index + 1}`,
          campaignLogo: campaign.logo || "",
          campaignType: campaign.type || "Free",
          campaignCode: campaign.code || campaign.taskCode || `TASK${index + 1}`,
          // Additional fields for compatibility
          name: campaign.brand || campaign.name,
          price: campaign.baseAmount || 0,
          code: campaign.code || campaign.taskCode,
          logo: campaign.logo || ""
        }));

        console.log("📋 Converted to customer tasks:", customerTasks.length);
        console.log("📋 Sample task:", customerTasks[0]);
        console.log("📋 Sending response with", customerTasks.length, "customer tasks");
        
        const response = { success: true, data: customerTasks, total: customerTasks.length };
        console.log("📋 Response structure:", {
          success: response.success,
          dataLength: response.data.length,
          total: response.total
        });
        
        res.json(response);
      } catch (error) {
        console.error("❌ Error in customer tasks endpoint:", error);
        console.error("❌ Error stack:", error.stack);
        res.status(500).json({
          success: false,
          error: "Internal server error",
          details: error.message
        });
      }
    }
    
    // Save/Update customer task
    else if (req.method === 'POST' && path === '/api/frontend/customer-tasks') {
      const { customerId, taskNumber, taskCommission, taskPrice, expiredDate, estimatedNegativeAmount, negativeAmount, priceFrom, priceTo, hasGoldenEgg } = req.body;
      console.log("💾 Saving customer task:", { customerId, taskNumber, taskCommission, taskPrice, estimatedNegativeAmount, priceFrom, priceTo, hasGoldenEgg });
      
      const customerTasksCollection = database.collection('customerTasks');
      
      // Check if task exists first
      const existingTask = await customerTasksCollection.findOne({ customerId, taskNumber: Number(taskNumber) });
      console.log("🔍 Existing task found:", !!existingTask);
      if (existingTask) {
        console.log("🔍 Existing task details:", {
          _id: existingTask._id,
          customerId: existingTask.customerId,
          taskNumber: existingTask.taskNumber,
          taskPrice: existingTask.taskPrice,
          hasGoldenEgg: existingTask.hasGoldenEgg
        });
      }

      const updateData = {
        taskCommission: Number(taskCommission),
        taskPrice: Number(taskPrice),
        estimatedNegativeAmount: Number(estimatedNegativeAmount || negativeAmount || 0),
        priceFrom: Number(priceFrom),
        priceTo: Number(priceTo),
        expiredDate: new Date(expiredDate),
        // Set hasGoldenEgg to true when price is edited (user's requirement)
        hasGoldenEgg: typeof hasGoldenEgg === 'boolean' ? hasGoldenEgg : true,
        updatedAt: new Date()
      };

      // First try to find and update existing task
      let result = await customerTasksCollection.findOneAndUpdate(
        { customerId, taskNumber: Number(taskNumber) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      // If task not found, create a new one
      if (!result) {
        console.log("💡 Task not found, creating new task for customer:", customerId, "taskNumber:", taskNumber);
        
        // Get customer info for new task creation
        const usersCollection = database.collection('users');
        let customer;
        try {
          customer = await usersCollection.findOne({ _id: new ObjectId(customerId) });
        } catch (objectIdError) {
          customer = await usersCollection.findOne({ _id: customerId });
        }

        const newTask = {
          _id: new ObjectId(),
          customerId: customerId,
          customerCode: customer?.membershipId || customer?.code || "",
          taskNumber: Number(taskNumber),
          campaignId: `task_${taskNumber}_${Date.now()}`,
          taskCommission: Number(taskCommission),
          taskPrice: Number(taskPrice),
          estimatedNegativeAmount: Number(estimatedNegativeAmount || negativeAmount || 0),
          priceFrom: Number(priceFrom),
          priceTo: Number(priceTo),
          hasGoldenEgg: typeof hasGoldenEgg === 'boolean' ? hasGoldenEgg : true,
          expiredDate: new Date(expiredDate),
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const insertResult = await customerTasksCollection.insertOne(newTask);
        console.log("✅ New customer task created successfully");
        result = newTask; // Return the full document for insert
      } else {
        console.log("✅ Existing customer task updated successfully");
      }

      res.json({
        success: true,
        data: result,
        message: "Task saved successfully"
      });
    }
    
    // Reset customer tasks history - Delete all tasks for a customer
    else if (req.method === 'DELETE' && path.startsWith('/api/frontend/customer-tasks/') && path.includes('/reset-history')) {
      const customerId = path.split('/')[3];
      console.log("🗑️ Resetting customer tasks history for customer:", customerId);

      try {
        const customerTasksCollection = database.collection('customerTasks');
        const usersCollection = database.collection('users');
        
        // Get user info first to get customerCode
        let user;
        try {
          user = await usersCollection.findOne({ _id: new ObjectId(customerId) });
        } catch (objectIdError) {
          user = await usersCollection.findOne({ _id: customerId });
        }
        
        console.log("🗑️ Found user:", user);
        
        // Delete all tasks using multiple criteria
        const deleteCriteria = {
          $or: [
            { customerId: customerId },
            { customerId: new ObjectId(customerId) }
          ]
        };
        
        // Add customerCode to criteria if user exists
        if (user) {
          deleteCriteria.$or.push(
            { customerCode: user.membershipId },
            { customerCode: user.code },
            { customerCode: user.membershipId?.toString() },
            { customerCode: user.code?.toString() }
          );
        }
        
        console.log("🗑️ Delete criteria:", JSON.stringify(deleteCriteria, null, 2));
        
        const result = await customerTasksCollection.deleteMany(deleteCriteria);
        
        console.log(`🗑️ Deleted ${result.deletedCount} tasks for customer ${customerId}`);

        res.json({
          success: true,
          message: `Successfully deleted ${result.deletedCount} tasks from customer history`,
          deletedCount: result.deletedCount,
          customerId: customerId,
          customerCode: user?.membershipId || user?.code
        });
      } catch (error) {
        console.error("❌ Error resetting customer tasks history:", error);
        res.status(500).json({
          success: false,
          error: "Failed to reset customer tasks history",
          details: error.message
        });
      }
    }
    
    // Toggle campaign status (UPDATED - no task initialization)
    else if (req.method === 'POST' && path.startsWith('/api/frontend/customer-tasks/allow/')) {
      const customerId = path.split('/').pop();
      console.log("🔄 Toggling campaign status for customer:", customerId);

      const usersCollection = database.collection('users');
      const user = await usersCollection.findOne({ _id: new ObjectId(customerId) });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      // Toggle campaignStatus
      const currentStatus = user.campaignStatus || 'inactive';
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      console.log(`🔄 Toggling campaignStatus from ${currentStatus} to ${newStatus}`);
      
      await usersCollection.updateOne(
        { _id: new ObjectId(customerId) },
        { $set: { campaignStatus: newStatus, updatedAt: new Date() } }
      );

      console.log("✅ Campaign status updated:", customerId, newStatus);
      res.json({
        success: true,
        message: `Campaign status updated to ${newStatus}`,
        data: {
          userId: customerId,
          campaignStatus: newStatus
        }
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
      const withdrawalsCollection = database.collection('withdrawals');

      const totalUsers = await usersCollection.countDocuments();
      const totalCampaigns = await campaignsCollection.countDocuments();
      const activeCampaigns = await campaignsCollection.countDocuments({ status: 'Active' });
      const totalTransactions = await transactionsCollection.countDocuments();
      
      // Withdrawal statistics from MongoDB
      const totalWithdrawals = await withdrawalsCollection.countDocuments();
      const approvedWithdrawals = await withdrawalsCollection.countDocuments({ status: 'completed' });
      const pendingWithdrawals = await withdrawalsCollection.countDocuments({ status: 'pending' });
      const rejectedWithdrawals = await withdrawalsCollection.countDocuments({ status: 'rejected' });
      
      // Calculate total withdrawal amounts
      const totalApprovedAmount = await withdrawalsCollection.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray();

      const totalPendingAmount = await withdrawalsCollection.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray();

      const totalRejectedAmount = await withdrawalsCollection.aggregate([
        { $match: { status: 'rejected' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray();
      
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
          totalBalance: totalBalance[0]?.total || 0,
          // Withdrawal statistics
          totalWithdrawals,
          approvedWithdrawals,
          pendingWithdrawals,
          rejectedWithdrawals,
          totalApprovedAmount: totalApprovedAmount[0]?.total || 0,
          totalPendingAmount: totalPendingAmount[0]?.total || 0,
          totalRejectedAmount: totalRejectedAmount[0]?.total || 0
        }
      });
    }
    
    // Pending Counts for Sidebar
    else if (req.method === 'GET' && path === '/api/frontend/pending-counts') {
      console.log('📊 Fetching pending counts for sidebar...');
      
      try {
        const withdrawalsCollection = database.collection('withdrawals');
        const usersCollection = database.collection('users');
        
        // Get pending withdrawals count
        const pendingWithdrawals = await withdrawalsCollection.countDocuments({ status: 'pending' });
        
        // Get pending/inactive users count (users with inactive status or isActive: false)
        const pendingUsers = await usersCollection.countDocuments({
          $or: [
            { status: 'inactive' },
            { isActive: false }
          ]
        });
        
        console.log(`📊 Pending counts - Withdrawals: ${pendingWithdrawals}, Users: ${pendingUsers}`);
        
        res.json({
          success: true,
          data: {
            pendingWithdrawals,
            pendingUsers
          }
        });
      } catch (error) {
        console.error('❌ Error fetching pending counts:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch pending counts'
        });
      }
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
    
    // Frontend Withdrawal Management
    
    // Test endpoint for debugging
    else if (req.method === 'GET' && path === '/api/test') {
      res.json({
        success: true,
        message: "API is working in production",
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'unknown'
      });
    }
    
    // Get all withdrawals
    else if (req.method === 'GET' && path === '/api/frontend/withdrawals') {
      console.log("💰 ===== WITHDRAWAL API CALLED =====");
      console.log("💰 Fetching withdrawals from 'withdrawals' collection");
      console.log("💰 Query params:", req.query);
      console.log("💰 Request URL:", req.url);
      
      try {
        const { 
          page = 1, 
          limit = 100, 
          status, 
          customerId,
          method,
          search,
          startDate,
          endDate
        } = req.query;
        
        console.log("💰 Parsed params:", { page, limit, status, customerId, method, search, startDate, endDate });
        
        const query = {};
        
        // Status filter - handle "all" case
        if (status && status !== "all") {
          query.status = status;
          console.log("💰 Added status filter:", status);
        }
        
        if (customerId) {
          query.customerId = customerId;
          console.log("💰 Added customerId filter:", customerId);
        }
        
        if (method) {
          query.method = method;
          console.log("💰 Added method filter:", method);
        }
        
        // Date filter - use submittedAt field
        if (startDate || endDate) {
          query.submittedAt = {};
          if (startDate) {
            query.submittedAt.$gte = new Date(startDate);
            console.log("💰 Added startDate filter:", startDate);
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.submittedAt.$lte = end;
            console.log("💰 Added endDate filter:", endDate);
          }
        }

        console.log("💰 Final MongoDB query:", JSON.stringify(query, null, 2));

        const withdrawalsCollection = database.collection('withdrawals');
        console.log("💰 Using collection: withdrawals");
        
        // Get total withdrawals count
        const totalWithdrawals = await withdrawalsCollection.countDocuments(query);
        console.log(`📊 Total withdrawals matching query: ${totalWithdrawals}`);
        
        // Get all withdrawals without pagination first to debug
        const allWithdrawals = await withdrawalsCollection.find(query).toArray();
        console.log(`📊 All withdrawals found: ${allWithdrawals.length}`);
        
        // Log first few withdrawals for debugging
        if (allWithdrawals.length > 0) {
          console.log("📊 Sample withdrawals from DB:");
          allWithdrawals.slice(0, 3).forEach((w, i) => {
            console.log(`  ${i+1}. ID: ${w._id}, Status: ${w.status}, Amount: ${w.amount}, CustomerId: ${w.customerId}, SubmittedAt: ${w.submittedAt}`);
          });
        }
        
        const withdrawals = await withdrawalsCollection
          .find(query)
          .sort({ submittedAt: -1 })
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit))
          .toArray();

        console.log(`📊 Paginated withdrawals: ${withdrawals.length}`);

        // Get customer details for each withdrawal
        const usersCollection = database.collection('users');
        console.log("💰 Fetching customer details...");
        
        const withdrawalsWithCustomerDetails = await Promise.all(
          withdrawals.map(async (withdrawal, index) => {
            console.log(`💰 Processing withdrawal ${index + 1}/${withdrawals.length}: ${withdrawal._id}`);
            
            let customer = null;
            try {
              customer = await usersCollection.findOne({ _id: new ObjectId(withdrawal.customerId) });
              if (customer) {
                console.log(`  ✅ Found customer: ${customer.name} (${customer.membershipId})`);
              } else {
                console.log(`  ❌ Customer not found for ID: ${withdrawal.customerId}`);
              }
            } catch (objectIdError) {
              console.log(`  ⚠️ ObjectId error, trying string search for: ${withdrawal.customerId}`);
              customer = await usersCollection.findOne({ _id: withdrawal.customerId });
              if (customer) {
                console.log(`  ✅ Found customer with string search: ${customer.name}`);
              }
            }
            
            const result = {
              ...withdrawal,
              customer: customer ? {
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                membershipId: customer.membershipId,
                phoneNumber: customer.phoneNumber,
                accountBalance: customer.accountBalance
              } : null
            };
            
            console.log(`  📋 Final withdrawal data:`, {
              id: result._id,
              status: result.status,
              amount: result.amount,
              customer: result.customer?.name || 'No customer'
            });
            
            return result;
          })
        );

        console.log(`📊 Withdrawals with customer details: ${withdrawalsWithCustomerDetails.length}`);

        // Apply search filter after getting customer details
        let filteredWithdrawals = withdrawalsWithCustomerDetails;
        if (search) {
          console.log(`📊 Applying search filter: "${search}"`);
          filteredWithdrawals = withdrawalsWithCustomerDetails.filter(withdrawal => {
            const customer = withdrawal.customer;
            if (!customer) return false;
            
            const matches = customer.name?.toLowerCase().includes(search.toLowerCase()) ||
                   customer.membershipId?.toLowerCase().includes(search.toLowerCase()) ||
                   customer.email?.toLowerCase().includes(search.toLowerCase());
            
            console.log(`  🔍 Search check for ${customer.name}: ${matches}`);
            return matches;
          });
          console.log(`📊 After search filter: ${filteredWithdrawals.length}`);
        }

        console.log(`📊 Final result: ${filteredWithdrawals.length} withdrawals`);
        
        // Debug: Log final result
        if (filteredWithdrawals.length > 0) {
          console.log("📊 Final sample withdrawal:");
          console.log("  ID:", filteredWithdrawals[0]._id);
          console.log("  Status:", filteredWithdrawals[0].status);
          console.log("  Amount:", filteredWithdrawals[0].amount);
          console.log("  Customer:", filteredWithdrawals[0].customer?.name);
          console.log("  SubmittedAt:", filteredWithdrawals[0].submittedAt);
        } else {
          console.log("❌ No withdrawals found in final result!");
        }

        const response = {
          success: true,
          data: filteredWithdrawals,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalWithdrawals,
            pages: Math.ceil(totalWithdrawals / Number(limit))
          }
        };

        console.log("💰 Final response structure:", {
          success: response.success,
          dataLength: response.data.length,
          pagination: response.pagination
        });

        console.log("💰 ===== SENDING RESPONSE =====");
        res.json(response);
        
      } catch (error) {
        console.error("❌ Error in withdrawal API:", error);
        console.error("❌ Error stack:", error.stack);
        res.status(500).json({
          success: false,
          error: error.message,
          details: "Check server logs for more information"
        });
      }
    }
    
    // Get single withdrawal by ID
    else if (req.method === 'GET' && path.startsWith('/api/frontend/withdrawals/') && !path.includes('/update-status')) {
      const withdrawalId = path.split('/').pop();
      console.log(`💰 Fetching withdrawal: ${withdrawalId}`);

      const withdrawalsCollection = database.collection('withdrawals');
      
      let withdrawal;
      try {
        withdrawal = await withdrawalsCollection.findOne({ _id: new ObjectId(withdrawalId) });
      } catch (objectIdError) {
        withdrawal = await withdrawalsCollection.findOne({ _id: withdrawalId });
      }
      
      if (!withdrawal) {
        return res.status(404).json({ 
          success: false, 
          error: "Withdrawal not found" 
        });
      }

      // Get customer details
      const usersCollection = database.collection('users');
      let customer = null;
      try {
        customer = await usersCollection.findOne({ _id: new ObjectId(withdrawal.customerId) });
      } catch (objectIdError) {
        customer = await usersCollection.findOne({ _id: withdrawal.customerId });
      }

      res.json({
        success: true,
        data: {
          ...withdrawal,
          customer: customer ? {
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            membershipId: customer.membershipId,
            phoneNumber: customer.phoneNumber,
            accountBalance: customer.accountBalance
          } : null
        }
      });
    }
    
    // Update withdrawal status
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/withdrawals/') && path.includes('/update-status')) {
      console.log("💰 ===== WITHDRAWAL STATUS UPDATE CALLED =====");
      
      // Extract withdrawal ID from path - it should be the part before '/update-status'
      const pathParts = path.split('/');
      const updateStatusIndex = pathParts.indexOf('update-status');
      const withdrawalId = updateStatusIndex > 0 ? pathParts[updateStatusIndex - 1] : pathParts[pathParts.length - 2];
      
      const { status, adminNotes, processedBy } = req.body;
      
      console.log(`💰 Updating withdrawal status: ${withdrawalId} to ${status}`);
      console.log(`🔍 Full path: ${path}`);
      console.log(`🔍 Path parts: ${JSON.stringify(pathParts)}`);
      console.log(`🔍 Extracted withdrawalId: ${withdrawalId}`);
      console.log(`🔍 Request body:`, req.body);

      if (!status) {
        console.log("❌ No status provided in request body");
        return res.status(400).json({ 
          success: false, 
          error: "Status is required" 
        });
      }

      // Map frontend status to database status
      let dbStatus = status;
      if (status === 'Approved') dbStatus = 'completed';
      if (status === 'Rejected') dbStatus = 'rejected';
      
      console.log(`💰 Status mapping: ${status} -> ${dbStatus}`);

      const validStatuses = ['pending', 'processing', 'completed', 'rejected'];
      if (!validStatuses.includes(dbStatus)) {
        console.log(`❌ Invalid status: ${dbStatus}`);
        return res.status(400).json({ 
          success: false, 
          error: "Invalid status. Must be one of: pending, processing, completed, rejected" 
        });
      }

      const withdrawalsCollection = database.collection('withdrawals');
      console.log("💰 Using collection: withdrawals");
      
      // Get the withdrawal first
      let withdrawal;
      try {
        console.log(`🔍 Searching for withdrawal with ObjectId: ${withdrawalId}`);
        withdrawal = await withdrawalsCollection.findOne({ _id: new ObjectId(withdrawalId) });
        if (withdrawal) {
          console.log(`✅ Found withdrawal with ObjectId: ${withdrawal._id}, current status: ${withdrawal.status}`);
        }
      } catch (objectIdError) {
        console.log(`⚠️ ObjectId error, trying string search for: ${withdrawalId}`);
        withdrawal = await withdrawalsCollection.findOne({ _id: withdrawalId });
        if (withdrawal) {
          console.log(`✅ Found withdrawal with string search: ${withdrawal._id}, current status: ${withdrawal.status}`);
        }
      }
      
      if (!withdrawal) {
        console.log(`❌ Withdrawal not found for ID: ${withdrawalId}`);
        
        // List some sample withdrawals for debugging
        const sampleWithdrawals = await withdrawalsCollection.find({}).limit(3).toArray();
        console.log("📋 Sample withdrawals in database:");
        sampleWithdrawals.forEach((w, i) => {
          console.log(`  ${i+1}. ID: ${w._id}, Status: ${w.status}, Amount: ${w.amount}`);
        });
        
        return res.status(404).json({ 
          success: false, 
          error: "Withdrawal not found" 
        });
      }

      console.log(`💰 Current withdrawal data:`, {
        id: withdrawal._id,
        status: withdrawal.status,
        amount: withdrawal.amount,
        customerId: withdrawal.customerId
      });

      const updateData = {
        status: dbStatus,
        updatedAt: new Date()
      };

      // Add admin notes if provided
      if (adminNotes) {
        updateData.adminNotes = adminNotes;
        console.log(`💰 Adding admin notes: ${adminNotes}`);
      }

      // Add processed info for completed/rejected withdrawals
      if (dbStatus === 'completed' || dbStatus === 'rejected') {
        updateData.processedAt = new Date();
        updateData.processedBy = processedBy || 'admin';
        console.log(`💰 Adding processed info: ${updateData.processedAt}, by: ${updateData.processedBy}`);
      }

      console.log(`💰 Update data:`, updateData);

      // Update the withdrawal
      let result;
      try {
        console.log(`🔍 Updating withdrawal with ObjectId: ${withdrawalId}`);
        result = await withdrawalsCollection.findOneAndUpdate(
          { _id: new ObjectId(withdrawalId) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
        if (result) {
          console.log(`✅ Updated withdrawal with ObjectId successfully: ${result._id}`);
        }
      } catch (objectIdError) {
        console.log(`⚠️ ObjectId update failed, trying string update for: ${withdrawalId}`);
        result = await withdrawalsCollection.findOneAndUpdate(
          { _id: withdrawalId },
          { $set: updateData },
          { returnDocument: 'after' }
        );
        if (result) {
          console.log(`✅ Updated withdrawal with string ID successfully: ${result._id}`);
        }
      }

      if (!result) {
        console.log(`❌ Failed to update withdrawal: ${withdrawalId}`);
        return res.status(500).json({ 
          success: false, 
          error: "Failed to update withdrawal status" 
        });
      }

      console.log(`✅ Withdrawal ${withdrawalId} status updated successfully`);
      console.log(`💰 Updated withdrawal data:`, {
        id: result._id,
        status: result.status,
        updatedAt: result.updatedAt,
        processedAt: result.processedAt,
        processedBy: result.processedBy
      });

      console.log("💰 ===== STATUS UPDATE COMPLETED =====");

      res.json({
        success: true,
        data: result,
        message: `Withdrawal status updated to ${status} successfully`
      });
    }
    
    // Withdrawals (legacy) - Frontend calls this endpoint - v10.0 FORCE DEPLOY
    else if (req.method === 'GET' && path === '/api/withdrawals') {
      console.log("💰 ===== LEGACY WITHDRAWALS API CALLED =====");
      console.log("💰 Frontend calling /api/withdrawals endpoint");
      console.log("💰 Query params:", req.query);
      console.log("💰 Database connected:", !!database);
      console.log("💰 Database name:", database?.databaseName);
      
      try {
        const { 
          page = 1, 
          limit = 100, 
          status, 
          customerId,
          method,
          search,
          startDate,
          endDate
        } = req.query;
        
        console.log("💰 Parsed params:", { page, limit, status, customerId, method, search, startDate, endDate });
        
        const query = {};
        
        // Status filter - handle "all" case
        if (status && status !== "all") {
          query.status = status;
          console.log("💰 Added status filter:", status);
        }
        
        if (customerId) {
          query.customerId = customerId;
          console.log("💰 Added customerId filter:", customerId);
        }
        
        if (method) {
          query.method = method;
          console.log("💰 Added method filter:", method);
        }
        
        // Date filter - use submittedAt field
        if (startDate || endDate) {
          query.submittedAt = {};
          if (startDate) {
            query.submittedAt.$gte = new Date(startDate);
            console.log("💰 Added startDate filter:", startDate);
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.submittedAt.$lte = end;
            console.log("💰 Added endDate filter:", endDate);
          }
        }

        console.log("💰 Final MongoDB query:", JSON.stringify(query, null, 2));

        const withdrawalsCollection = database.collection('withdrawals');
        console.log("💰 Using collection: withdrawals");
        
        // Get total withdrawals count
        const totalWithdrawals = await withdrawalsCollection.countDocuments(query);
        console.log(`📊 Total withdrawals matching query: ${totalWithdrawals}`);
        
        // Get all withdrawals without pagination first to debug
        const allWithdrawals = await withdrawalsCollection.find(query).toArray();
        console.log(`📊 All withdrawals found: ${allWithdrawals.length}`);
        
        // Log first few withdrawals for debugging
        if (allWithdrawals.length > 0) {
          console.log("📊 Sample withdrawals from DB:");
          allWithdrawals.slice(0, 3).forEach((w, i) => {
            console.log(`  ${i+1}. ID: ${w._id}, Status: ${w.status}, Amount: ${w.amount}, CustomerId: ${w.customerId}, SubmittedAt: ${w.submittedAt}`);
          });
        }
        
        const withdrawals = await withdrawalsCollection
          .find(query)
          .sort({ submittedAt: -1 })
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit))
          .toArray();

        console.log(`📊 Paginated withdrawals: ${withdrawals.length}`);

        // Get customer details for each withdrawal
        const usersCollection = database.collection('users');
        console.log("💰 Fetching customer details...");
        
        const withdrawalsWithCustomerDetails = await Promise.all(
          withdrawals.map(async (withdrawal, index) => {
            console.log(`💰 Processing withdrawal ${index + 1}/${withdrawals.length}: ${withdrawal._id}`);
            
            let customer = null;
            try {
              customer = await usersCollection.findOne({ _id: new ObjectId(withdrawal.customerId) });
              if (customer) {
                console.log(`  ✅ Found customer: ${customer.name} (${customer.membershipId})`);
              } else {
                console.log(`  ❌ Customer not found for ID: ${withdrawal.customerId}`);
              }
            } catch (objectIdError) {
              console.log(`  ⚠️ ObjectId error, trying string search for: ${withdrawal.customerId}`);
              customer = await usersCollection.findOne({ _id: withdrawal.customerId });
              if (customer) {
                console.log(`  ✅ Found customer with string search: ${customer.name}`);
              }
            }
            
            const result = {
              ...withdrawal,
              customer: customer ? {
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                membershipId: customer.membershipId,
                phoneNumber: customer.phoneNumber,
                accountBalance: customer.accountBalance
              } : null
            };
            
            console.log(`  📋 Final withdrawal data:`, {
              id: result._id,
              status: result.status,
              amount: result.amount,
              customer: result.customer?.name || 'No customer'
            });
            
            return result;
          })
        );

        console.log(`📊 Withdrawals with customer details: ${withdrawalsWithCustomerDetails.length}`);

        // Apply search filter after getting customer details
        let filteredWithdrawals = withdrawalsWithCustomerDetails;
        if (search) {
          console.log(`📊 Applying search filter: "${search}"`);
          filteredWithdrawals = withdrawalsWithCustomerDetails.filter(withdrawal => {
            const customer = withdrawal.customer;
            if (!customer) return false;
            
            const matches = customer.name?.toLowerCase().includes(search.toLowerCase()) ||
                   customer.membershipId?.toLowerCase().includes(search.toLowerCase()) ||
                   customer.email?.toLowerCase().includes(search.toLowerCase());
            
            console.log(`  🔍 Search check for ${customer.name}: ${matches}`);
            return matches;
          });
          console.log(`📊 After search filter: ${filteredWithdrawals.length}`);
        }

        console.log(`📊 Final result: ${filteredWithdrawals.length} withdrawals`);
        
        // Debug: Log final result
        if (filteredWithdrawals.length > 0) {
          console.log("📊 Final sample withdrawal:");
          console.log("  ID:", filteredWithdrawals[0]._id);
          console.log("  Status:", filteredWithdrawals[0].status);
          console.log("  Amount:", filteredWithdrawals[0].amount);
          console.log("  Customer:", filteredWithdrawals[0].customer?.name);
          console.log("  SubmittedAt:", filteredWithdrawals[0].submittedAt);
        } else {
          console.log("❌ No withdrawals found in final result!");
        }

        // Return in the format expected by frontend
        const response = {
          success: true,
          data: filteredWithdrawals,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalWithdrawals,
            pages: Math.ceil(totalWithdrawals / Number(limit))
          }
        };

        console.log("💰 Final response structure:", {
          success: response.success,
          dataLength: response.data.length,
          pagination: response.pagination
        });

        console.log("💰 ===== SENDING RESPONSE TO FRONTEND =====");
        
        // Add specific headers for withdrawal endpoint
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('ETag', `"withdrawals-${Date.now()}"`);
        
        res.json(response);
        
      } catch (error) {
        console.error("❌ Error in legacy withdrawal API:", error);
        console.error("❌ Error stack:", error.stack);
        res.status(500).json({
          success: false,
          error: error.message,
          details: "Check server logs for more information"
        });
      }
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
    
    // Combo Task Management
    
    // Create Combo Task
    else if (req.method === 'POST' && path === '/api/frontend/combo-tasks') {
      const { customerId, taskIds, comboCommission, comboType } = req.body;
      console.log("🎯 Creating combo task:", { customerId, taskIds, comboCommission });

      if (!customerId || !taskIds || !Array.isArray(taskIds)) {
        return res.status(400).json({
          success: false,
          error: "Customer ID and task IDs are required"
        });
      }

      const comboTasksCollection = database.collection('comboTasks');
      
      // Check if combo already exists for this customer
      const existingCombo = await comboTasksCollection.findOne({
        customerId,
        status: { $in: ['pending', 'active'] }
      });

      if (existingCombo) {
        return res.status(400).json({
          success: false,
          error: "Customer already has an active combo task"
        });
      }

      const newComboTask = {
        customerId,
        taskIds,
        comboCommission: comboCommission || 0,
        comboType: comboType || 'standard',
        status: 'pending',
        completedTasks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await comboTasksCollection.insertOne(newComboTask);
      const savedComboTask = await comboTasksCollection.findOne({ _id: result.insertedId });

      console.log("✅ Combo task created successfully:", result.insertedId);

      res.json({
        success: true,
        data: savedComboTask,
        message: "Combo task created successfully"
      });
    }
    
    // Update Combo Task (for customerTasks collection)
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/combo-tasks/') && !path.includes('/save-task-price') && !path.includes('/toggle-golden-egg') && !path.includes('/golden-egg-price-update')) {
      const customerId = path.split('/')[3];
      const { taskNumber, status, hasGoldenEgg, taskPrice } = req.body;
      console.log("✏️ Updating combo task in customerTasks:", { customerId, taskNumber, status, hasGoldenEgg, taskPrice });

      const customerTasksCollection = database.collection('customerTasks');
      const updateData = {
        updatedAt: new Date()
      };

      if (status) updateData.status = status;
      if (hasGoldenEgg !== undefined) updateData.hasGoldenEgg = hasGoldenEgg;
      if (taskPrice !== undefined) updateData.taskPrice = taskPrice;

      const result = await customerTasksCollection.findOneAndUpdate(
        { 
          customerId: customerId,
          taskNumber: Number(taskNumber)
        },
        { $set: updateData },
        { returnDocument: 'after', upsert: true }
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Combo task not found"
        });
      }

      console.log("✅ Combo task updated successfully in customerTasks:", result);

      // If task is completed, delete it from database (only keep pending tasks)
      if (status === 'completed') {
        console.log(`🗑️ Task ${taskNumber} completed, deleting from database`);
        await customerTasksCollection.deleteOne({
          customerId: customerId,
          taskNumber: Number(taskNumber)
        });
        
        res.json({
          success: true,
          message: `Task ${taskNumber} completed and removed from database`,
          data: { taskNumber: taskNumber, customerId: customerId, status: 'completed' }
        });
      } else {
        res.json({
          success: true,
          data: result,
          message: "Combo task updated successfully"
        });
      }
    }
    
    // Complete Combo Task
    else if (req.method === 'POST' && path.startsWith('/api/frontend/combo-tasks/') && path.includes('/complete')) {
      const comboTaskId = path.split('/')[3];
      const { completedTaskIds } = req.body;
      console.log("🎉 Completing combo task:", comboTaskId);

      const comboTasksCollection = database.collection('comboTasks');
      const usersCollection = database.collection('users');
      
      let comboTask;
      try {
        comboTask = await comboTasksCollection.findOne({ _id: new ObjectId(comboTaskId) });
      } catch (objectIdError) {
        comboTask = await comboTasksCollection.findOne({ _id: comboTaskId });
      }

      if (!comboTask) {
        return res.status(404).json({
          success: false,
          error: "Combo task not found"
        });
      }

      if (comboTask.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: "Combo task is not active"
        });
      }

      // Check if all required tasks are completed
      const allTasksCompleted = comboTask.taskIds.every(taskId => 
        completedTaskIds.includes(taskId)
      );

      if (!allTasksCompleted) {
        return res.status(400).json({
          success: false,
          error: "Not all required tasks are completed"
        });
      }

      // Calculate combo commission
      const vipLevelsCollection = database.collection('vipLevels');
      let customer;
      try {
        customer = await usersCollection.findOne({ _id: new ObjectId(comboTask.customerId) });
      } catch (objectIdError) {
        customer = await usersCollection.findOne({ _id: comboTask.customerId });
      }

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: "Customer not found"
        });
      }

      // Get customer's VIP level for combo commission
      const vipLevel = await vipLevelsCollection.findOne({ name: customer.vipLevel });
      const comboCommissionRate = vipLevel?.comboCommissionPercentage || 10;
      const comboCommissionAmount = comboTask.comboCommission * (comboCommissionRate / 100);

      // Update combo task status
      await comboTasksCollection.updateOne(
        { _id: comboTask._id },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            comboCommissionEarned: comboCommissionAmount,
            updatedAt: new Date()
          }
        }
      );

      // Add combo commission to customer balance
      await usersCollection.updateOne(
        { _id: customer._id },
        {
          $inc: { 
            accountBalance: comboCommissionAmount,
            totalEarnings: comboCommissionAmount 
          },
          $set: { updatedAt: new Date() }
        }
      );

      // Record transaction
      const transactionsCollection = database.collection('transactions');
      await transactionsCollection.insertOne({
        userId: customer._id,
        type: 'combo_commission',
        amount: comboCommissionAmount,
        description: `Combo task completion bonus`,
        status: 'completed',
        createdAt: new Date()
      });

      console.log("✅ Combo task completed successfully:", comboTaskId);

      res.json({
        success: true,
        message: "Combo task completed successfully",
        comboCommissionEarned: comboCommissionAmount,
        newBalance: customer.accountBalance + comboCommissionAmount
      });
    }
    
    // Activate Combo Task
    else if (req.method === 'POST' && path.startsWith('/api/frontend/combo-tasks/') && path.includes('/activate')) {
      const comboTaskId = path.split('/')[3];
      console.log("🚀 Activating combo task:", comboTaskId);

      const comboTasksCollection = database.collection('comboTasks');
      
      let result;
      try {
        result = await comboTasksCollection.findOneAndUpdate(
          { _id: new ObjectId(comboTaskId) },
          { $set: { status: 'active', updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      } catch (objectIdError) {
        result = await comboTasksCollection.findOneAndUpdate(
          { _id: comboTaskId },
          { $set: { status: 'active', updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      }

      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Combo task not found"
        });
      }

      console.log("✅ Combo task activated successfully:", comboTaskId);

      res.json({
        success: true,
        data: result,
        message: "Combo task activated successfully"
      });
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
    
    // Combo Task Management
    
    // Get combo tasks for a specific user - Fetch from campaigns collection
    else if (req.method === 'GET' && path.startsWith('/api/frontend/combo-tasks/')) {
      console.log("🎯 MATCHED: Combo tasks endpoint - Manual 30 tasks display");
      const customerId = path.split('/')[3];
      console.log("🎯 Showing manual combo tasks for customer:", customerId);

      try {
        console.log("🎯 Creating manual combo tasks for customer:", customerId);
        
        // Get customer info first
        const usersCollection = database.collection('users');
        let customer;
        try {
          customer = await usersCollection.findOne({ _id: new ObjectId(customerId) });
        } catch (objectIdError) {
          customer = await usersCollection.findOne({ _id: customerId });
        }
        
        // Get existing customer tasks to check if any are already saved
        const customerTasksCollection = database.collection('customerTasks');
        const existingTasks = await customerTasksCollection
          .find({ customerId: customerId })
          .sort({ taskNumber: 1 })
          .toArray();
        
        console.log("🎯 Found existing customer tasks:", existingTasks.length);
        
        // Create manual 30 combo tasks (Task 1 to 30)
        const manualComboTasks = [];
        for (let i = 1; i <= 30; i++) {
          // Check if task already exists in database
          const existingTask = existingTasks.find(task => task.taskNumber === i);
          
          manualComboTasks.push({
            _id: existingTask?._id?.toString() || `manual_combo_${customerId}_${i}`,
            customerId: customerId,
            customerCode: customer?.membershipId || customer?.code || "",
            taskNumber: i,
            campaignId: existingTask?.campaignId || `manual_combo_task_${i}`,
            taskCommission: existingTask?.taskCommission || 0,
            taskPrice: existingTask?.taskPrice || (100 + (i * 10)), // Default prices: 110, 120, 130...
            estimatedNegativeAmount: existingTask?.estimatedNegativeAmount || 0,
            priceFrom: existingTask?.priceFrom || 0,
            priceTo: existingTask?.priceTo || 0,
            hasGoldenEgg: existingTask?.hasGoldenEgg || false,
            expiredDate: existingTask?.expiredDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: existingTask?.status || 'pending',
            createdAt: existingTask?.createdAt || new Date(),
            updatedAt: existingTask?.updatedAt || new Date(),
            campaignName: existingTask?.campaignName || `Manual Combo Task ${i}`,
            campaignLogo: existingTask?.campaignLogo || "",
            campaignType: existingTask?.campaignType || "Combo",
            campaignCode: existingTask?.campaignCode || `MANUAL_COMBO_${i}`,
            name: existingTask?.campaignName || `Manual Combo Task ${i}`,
            price: existingTask?.taskPrice || (100 + (i * 10)),
            code: existingTask?.campaignCode || `MANUAL_COMBO_${i}`,
            logo: existingTask?.campaignLogo || ""
          });
        }

        console.log("🎯 Created", manualComboTasks.length, "manual combo tasks");
        
        // Response with manual combo tasks (always 30 tasks)
        res.json({ success: true, data: manualComboTasks, total: manualComboTasks.length });
        
      } catch (error) {
        console.error("❌ Error creating manual combo tasks:", error);
        res.status(500).json({ success: false, error: "Failed to create manual combo tasks" });
      }
    }
    
    // Update combo task prices by range
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/combo-tasks/') && !path.includes('/save-task-price') && !path.includes('/save-complete-task') && !path.includes('/toggle-golden-egg') && !path.includes('/golden-egg-price-update')) {
      const customerId = path.split('/')[3];
      const { taskRange, newPrice } = req.body;
      
      console.log("💰 Updating combo task prices:", { customerId, taskRange, newPrice });

      if (!taskRange || !newPrice) {
        return res.status(400).json({
          success: false,
          error: "Task range and new price are required"
        });
      }

      const customerTasksCollection = database.collection('customerTasks');
      
      // Parse task range (e.g., "1-10", "11-20", "21-30")
      const [startTask, endTask] = taskRange.split('-').map(num => parseInt(num.trim()));
      
      if (isNaN(startTask) || isNaN(endTask)) {
        return res.status(400).json({
          success: false,
          error: "Invalid task range format. Use format like '1-10'"
        });
      }

      // Update tasks in the specified range
      const result = await customerTasksCollection.updateMany(
        { 
          customerId,
          taskNumber: { $gte: startTask, $lte: endTask }
        },
        { 
          $set: { 
            taskPrice: Number(newPrice),
            updatedAt: new Date() 
          } 
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} combo tasks with price ${newPrice}`);

      res.json({
        success: true,
        message: `Updated ${result.modifiedCount} tasks (${startTask}-${endTask}) with price ${newPrice}`,
        modifiedCount: result.modifiedCount,
        taskRange,
        newPrice
      });
    }
    
    // Bulk update combo task prices for specific task numbers
    else if (req.method === 'POST' && path.startsWith('/api/frontend/combo-tasks/')) {
      const customerId = path.split('/')[3];
      const { taskPrices } = req.body; // Array of {taskNumber, price}
      
      console.log("🎯 Bulk updating combo task prices:", { customerId, taskPrices });

      if (!Array.isArray(taskPrices)) {
        return res.status(400).json({
          success: false,
          error: "taskPrices must be an array of {taskNumber, price}"
        });
      }

      const customerTasksCollection = database.collection('customerTasks');
      
      let updatedCount = 0;
      
      // Update each task individually
      for (const taskPrice of taskPrices) {
        const { taskNumber, price } = taskPrice;
        
        if (!taskNumber || !price) {
          continue; // Skip invalid entries
        }

        const result = await customerTasksCollection.updateOne(
          { 
            customerId,
            taskNumber: Number(taskNumber)
          },
          { 
            $set: { 
              taskPrice: Number(price),
              updatedAt: new Date() 
            } 
          }
        );

        if (result.modifiedCount > 0) {
          updatedCount++;
        }
      }

      console.log(`✅ Bulk updated ${updatedCount} combo tasks`);

      res.json({
        success: true,
        message: `Bulk updated ${updatedCount} combo tasks`,
        updatedCount,
        totalRequested: taskPrices.length
      });
    }
    
    // Golden Egg Price Update - When egg is clicked, allow price update
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/combo-tasks/') && path.includes('/golden-egg-price-update')) {
      const customerId = path.split('/')[4]; // Get customer ID from correct position
      const { taskNumber, taskPrice, hasGoldenEgg, estimatedNegativeAmount, taskCommission } = req.body;
      
      console.log("🥚 Golden egg price update:", { customerId, taskNumber, taskPrice, hasGoldenEgg, estimatedNegativeAmount, taskCommission });

      try {
        // Get customer info first
        const usersCollection = database.collection('users');
        let customer;
        try {
          customer = await usersCollection.findOne({ _id: new ObjectId(customerId) });
        } catch (objectIdError) {
          customer = await usersCollection.findOne({ _id: customerId });
        }
        
        console.log("🥚 Found customer:", customer);
        
        const customerTasksCollection = database.collection('customerTasks');
        
        // Get existing task
        const existingTask = await customerTasksCollection.findOne({
          customerId: customerId,
          taskNumber: Number(taskNumber)
        });
        
        console.log("🥚 Found existing task:", existingTask);
        
        // Prepare update data
        const updateData = {
          taskCommission: taskCommission !== undefined ? Number(taskCommission) : (existingTask?.taskCommission || 0),
          taskPrice: Number(taskPrice),
          estimatedNegativeAmount: estimatedNegativeAmount !== undefined ? Number(estimatedNegativeAmount) : (existingTask?.estimatedNegativeAmount || 0),
          priceFrom: existingTask?.priceFrom || 0,
          priceTo: existingTask?.priceTo || 0,
          hasGoldenEgg: hasGoldenEgg !== undefined ? Boolean(hasGoldenEgg) : true,
          expiredDate: existingTask?.expiredDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        };
        
        console.log("🥚 Update data:", updateData);
        
        // Use findOneAndUpdate to get the updated document back
        let result = await customerTasksCollection.findOneAndUpdate(
          { 
            customerId: customerId,
            taskNumber: Number(taskNumber)
          },
          { 
            $set: updateData
          },
          { returnDocument: 'after' }
        );

        // If task not found, create a new one (same as POST endpoint)
        if (!result) {
          console.log("💡 Task not found, creating new task");
          
          const newTask = {
            _id: new ObjectId(),
            customerId: customerId,
            customerCode: customer?.membershipId || customer?.code || "",
            taskNumber: Number(taskNumber),
            campaignId: `task_${taskNumber}_${Date.now()}`,
            taskCommission: 0,
            taskPrice: Number(taskPrice),
            estimatedNegativeAmount: 0,
            priceFrom: 0,
            priceTo: 0,
            hasGoldenEgg: hasGoldenEgg !== undefined ? Boolean(hasGoldenEgg) : true,
            expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const insertResult = await customerTasksCollection.insertOne(newTask);
          console.log("✅ New task created with golden egg");
          result = newTask; // Return the full document for insert
        } else {
          console.log("✅ Task updated with golden egg");
        }

        res.json({
          success: true,
          data: result,
          message: "Task saved successfully"
        });
      } catch (error) {
        console.error("❌ Error updating golden egg price:", error);
        res.status(500).json({
          success: false,
          error: "Failed to update golden egg price",
          details: error.message
        });
      }
    }
    
    // Toggle Golden Egg for combo task with price update
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/combo-tasks/') && path.includes('/toggle-golden-egg')) {
      const customerId = path.split('/')[4]; // Get customer ID from correct position
      const { taskNumber, hasGoldenEgg, taskPrice } = req.body;
      
      console.log("🟡 Toggling golden egg with price update:", { customerId, taskNumber, hasGoldenEgg, taskPrice });

      try {
        const customerTasksCollection = database.collection('customerTasks');
        
        // Update the golden egg status and price for the specific task
        console.log("🟡 Updating golden egg status and price:", { customerId, taskNumber, hasGoldenEgg, taskPrice });
        
        const updateData = {
          hasGoldenEgg: Boolean(hasGoldenEgg),
          updatedAt: new Date()
        };
        
        // If price is provided, update it too
        if (taskPrice !== undefined) {
          updateData.taskPrice = Number(taskPrice);
        }
        
        console.log("🟡 Update data being sent to database:", updateData);
        console.log("🟡 Query filter:", { customerId: customerId, taskNumber: Number(taskNumber) });
        
        const result = await customerTasksCollection.updateOne(
          { 
            customerId: customerId,
            taskNumber: Number(taskNumber)
          },
          { 
            $set: updateData
          },
          { upsert: true }
        );
        
        console.log("🟡 Database update result:", result);
        console.log("🟡 Modified count:", result.modifiedCount);
        console.log("🟡 Upserted id:", result.upsertedId);

        if (result.matchedCount === 0) {
          console.log("⚠️ No task found for customer:", customerId, "task:", taskNumber);
          console.log("💡 Creating new task with golden egg status");
          
          // Get customer info for new task creation
          const usersCollection = database.collection('users');
          let customer;
          try {
            customer = await usersCollection.findOne({ _id: new ObjectId(customerId) });
          } catch (objectIdError) {
            customer = await usersCollection.findOne({ _id: customerId });
          }

          const newTask = {
            _id: new ObjectId(),
            customerId: customerId,
            customerCode: customer?.membershipId || customer?.code || "",
            taskNumber: Number(taskNumber),
            campaignId: `task_${taskNumber}_${Date.now()}`,
            taskCommission: 0,
            taskPrice: taskPrice !== undefined ? Number(taskPrice) : (100 + (taskNumber * 10)), // Use provided price or default
            estimatedNegativeAmount: 0,
            priceFrom: 0,
            priceTo: 0,
            hasGoldenEgg: Boolean(hasGoldenEgg),
            expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const insertResult = await customerTasksCollection.insertOne(newTask);
          console.log("✅ New task created with golden egg status:", hasGoldenEgg);
          
          res.json({
            success: true,
            message: `Golden egg ${hasGoldenEgg ? 'activated' : 'deactivated'} successfully`,
            data: newTask,
            taskNumber: taskNumber,
            hasGoldenEgg: hasGoldenEgg,
            taskPrice: newTask.taskPrice,
            created: true
          });
          return;
        }

        console.log("✅ Golden egg status updated successfully");
        console.log("🟡 Final golden egg status:", hasGoldenEgg);
        
        // Get the updated task to return complete data
        const updatedTask = await customerTasksCollection.findOne({
          customerId: customerId,
          taskNumber: Number(taskNumber)
        });
        
        res.json({
          success: true,
          message: `Golden egg ${hasGoldenEgg ? 'activated' : 'deactivated'} successfully`,
          data: updatedTask,
          taskNumber: taskNumber,
          hasGoldenEgg: hasGoldenEgg,
          taskPrice: updatedTask?.taskPrice,
          updated: true
        });
      } catch (error) {
        console.error("❌ Error toggling golden egg:", error);
        res.status(500).json({
          success: false,
          error: "Failed to toggle golden egg",
          details: error.message
        });
      }
    }
    
    // Save complete combo task data from modal to customerTasks collection
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/combo-tasks/') && path.includes('/save-complete-task')) {
      const customerId = path.split('/')[4]; // Get customer ID from correct position
      const { 
        taskNumber, 
        taskPrice, 
        taskCommission, 
        expiredDate, 
        estimatedNegativeAmount, 
        priceFrom, 
        priceTo,
        hasGoldenEgg,
        status
      } = req.body;
      
      console.log("💾 Saving complete combo task:", { 
        customerId, 
        taskNumber, 
        taskPrice, 
        taskCommission, 
        expiredDate, 
        estimatedNegativeAmount, 
        priceFrom, 
        priceTo,
        hasGoldenEgg,
        status
      });

      try {
        const customerTasksCollection = database.collection('customerTasks');
        
        // Get existing task to preserve some data
        const existingTask = await customerTasksCollection.findOne({
          customerId: customerId,
          taskNumber: Number(taskNumber)
        });
        
        console.log("💾 Existing task found:", !!existingTask);
        
        // Get customer info for customerCode
        const usersCollection = database.collection('users');
        let customer;
        try {
          customer = await usersCollection.findOne({ _id: new ObjectId(customerId) });
        } catch (objectIdError) {
          customer = await usersCollection.findOne({ _id: customerId });
        }
        
        // Prepare complete task data with all fields from modal
        const taskData = {
          customerId: customerId,
          customerCode: existingTask?.customerCode || customer?.membershipId || customer?.code || "",
          taskNumber: Number(taskNumber),
          campaignId: existingTask?.campaignId || `manual_combo_task_${taskNumber}`,
          taskCommission: taskCommission !== undefined ? Number(taskCommission) : (existingTask?.taskCommission || 0),
          taskPrice: taskPrice !== undefined ? Number(taskPrice) : (existingTask?.taskPrice || 100 + (taskNumber * 10)),
          estimatedNegativeAmount: estimatedNegativeAmount !== undefined ? Number(estimatedNegativeAmount) : (existingTask?.estimatedNegativeAmount || 0),
          priceFrom: priceFrom !== undefined ? Number(priceFrom) : (existingTask?.priceFrom || 0),
          priceTo: priceTo !== undefined ? Number(priceTo) : (existingTask?.priceTo || 0),
          // Auto-set golden egg to true when price is updated from modal
          hasGoldenEgg: hasGoldenEgg !== undefined ? Boolean(hasGoldenEgg) : (taskPrice !== undefined ? true : (existingTask?.hasGoldenEgg || false)),
          expiredDate: expiredDate ? new Date(expiredDate) : (existingTask?.expiredDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
          status: status || existingTask?.status || 'pending',
          createdAt: existingTask?.createdAt || new Date(),
          updatedAt: new Date()
        };
        
        console.log("💾 Complete task data to save:", taskData);
        
        // Update or create the task in customerTasks collection
        const result = await customerTasksCollection.updateOne(
          { 
            customerId: customerId,
            taskNumber: Number(taskNumber)
          },
          { 
            $set: taskData
          },
          { upsert: true } // Create if doesn't exist
        );
        
        console.log("💾 Task saved successfully:", result);

        // Get the updated task to return complete data
        const updatedTask = await customerTasksCollection.findOne({
          customerId: customerId,
          taskNumber: Number(taskNumber)
        });

        // If task is completed, delete it from database (only keep pending tasks)
        if (taskData.status === 'completed') {
          console.log(`🗑️ Task ${taskNumber} completed, deleting from database`);
          await customerTasksCollection.deleteOne({
            customerId: customerId,
            taskNumber: Number(taskNumber)
          });
          
          res.json({
            success: true,
            message: `Task ${taskNumber} completed and removed from database`,
            data: { taskNumber: taskNumber, customerId: customerId, status: 'completed' },
            taskNumber: taskNumber,
            customerId: customerId
          });
        } else {
          res.json({
            success: true,
            message: `Task ${taskNumber} saved successfully with all fields`,
            data: updatedTask,
            taskNumber: taskNumber,
            customerId: customerId
          });
        }
      } catch (error) {
        console.error("❌ Error saving complete combo task:", error);
        res.status(500).json({
          success: false,
          error: "Failed to save complete combo task",
          details: error.message
        });
      }
    }
    
    // Save individual task price to customerTasks collection
    else if (req.method === 'PATCH' && path.startsWith('/api/frontend/combo-tasks/') && path.includes('/save-task-price')) {
      const customerId = path.split('/')[4]; // Get customer ID from correct position
      const { taskNumber, taskPrice, customerId: bodyCustomerId } = req.body;
      
      console.log("💰 Saving task price:", { customerId, taskNumber, taskPrice, bodyCustomerId });

      try {
        const customerTasksCollection = database.collection('customerTasks');
        
        // Get existing task to preserve all existing data
        const existingTask = await customerTasksCollection.findOne({
          customerId: customerId,
          taskNumber: Number(taskNumber)
        });
        
        console.log("💰 Existing task found:", !!existingTask);
        if (existingTask) {
          console.log("💰 Existing golden egg status:", existingTask.hasGoldenEgg);
        }
        
        // Get customer info for new task creation
        const usersCollection = database.collection('users');
        let customer;
        try {
          customer = await usersCollection.findOne({ _id: new ObjectId(customerId) });
        } catch (objectIdError) {
          customer = await usersCollection.findOne({ _id: customerId });
        }
        
        // Prepare complete task data with all required fields
        const taskData = {
          customerId: customerId,
          customerCode: existingTask?.customerCode || customer?.membershipId || customer?.code || "",
          taskNumber: Number(taskNumber),
          campaignId: existingTask?.campaignId || `manual_combo_task_${taskNumber}`,
          taskCommission: existingTask?.taskCommission || 0,
          taskPrice: Number(taskPrice),
          estimatedNegativeAmount: existingTask?.estimatedNegativeAmount || 0,
          priceFrom: existingTask?.priceFrom || 0,
          priceTo: existingTask?.priceTo || 0,
          // Auto-set golden egg to true when price is updated
          hasGoldenEgg: true,
          expiredDate: existingTask?.expiredDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: existingTask?.status || 'pending',
          createdAt: existingTask?.createdAt || new Date(),
          updatedAt: new Date()
        };
        
        // Update or create the task in customerTasks collection
        const result = await customerTasksCollection.updateOne(
          { 
            customerId: customerId,
            taskNumber: Number(taskNumber)
          },
          { 
            $set: taskData
          },
          { upsert: true } // Create if doesn't exist
        );
        
        console.log("💰 Task price saved with golden egg status:", existingTask?.hasGoldenEgg || false);

        console.log("✅ Task price saved successfully:", result);

        // Get the updated task to return complete data
        const updatedTask = await customerTasksCollection.findOne({
          customerId: customerId,
          taskNumber: Number(taskNumber)
        });

        res.json({
          success: true,
          message: `Task ${taskNumber} price saved successfully`,
          data: updatedTask,
          taskNumber: taskNumber,
          taskPrice: taskPrice,
          customerId: customerId
        });
      } catch (error) {
        console.error("❌ Error saving task price:", error);
        res.status(500).json({
          success: false,
          error: "Failed to save task price",
          details: error.message
        });
      }
    }
    
    // Debug endpoint to check campaigns count
    else if (req.method === 'GET' && path === '/api/debug-campaigns') {
      console.log("🔍 DEBUG: Checking campaigns count");
      
      try {
        const campaignsCollection = database.collection('campaigns');
        const totalCampaigns = await campaignsCollection.countDocuments();
        
        const campaigns = await campaignsCollection
          .find({})
          .sort({ createdAt: -1 })
          .limit(30)
          .toArray();
        
        console.log("🔍 Total campaigns in database:", totalCampaigns);
        console.log("🔍 Found campaigns (limit 30):", campaigns.length);
        
        res.json({
          success: true,
          totalCampaigns: totalCampaigns,
          foundCampaigns: campaigns.length,
          campaigns: campaigns.map(c => ({
            _id: c._id,
            brand: c.brand,
            baseAmount: c.baseAmount,
            commissionAmount: c.commissionAmount
          }))
        });
      } catch (error) {
        console.error("🔍 Error checking campaigns:", error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
    
    // Get combo task statistics for a user
    else if (req.method === 'GET' && path.startsWith('/api/frontend/combo-tasks-stats/')) {
      const customerId = path.split('/')[3];
      console.log("📊 Fetching combo task stats for customer:", customerId);

      const customerTasksCollection = database.collection('customerTasks');
      
      const stats = await customerTasksCollection.aggregate([
        { $match: { customerId } },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            completedTasks: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            pendingTasks: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            totalEarnings: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$taskPrice", 0] } },
            avgTaskPrice: { $avg: "$taskPrice" },
            minTaskPrice: { $min: "$taskPrice" },
            maxTaskPrice: { $max: "$taskPrice" }
          }
        }
      ]).toArray();

      const taskStats = stats[0] || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalEarnings: 0,
        avgTaskPrice: 0,
        minTaskPrice: 0,
        maxTaskPrice: 0
      };

      res.json({
        success: true,
        data: taskStats
      });
    }

    // Create deposit endpoint
    else if (req.method === 'POST' && path === '/api/frontend/deposits') {
      console.log("💰 Creating deposit:", req.body);

      try {
        const { userId, amount, method, reference, status } = req.body;
        
        if (!userId || !amount || !method) {
          return res.status(400).json({
            success: false,
            error: "userId, amount, and method are required"
          });
        }

        const depositsCollection = database.collection('deposits');
        const usersCollection = database.collection('users');

        // Get user information first
        const user = await usersCollection.findOne(
          { _id: new ObjectId(userId) },
          { projection: { username: 1, membershipId: 1, name: 1 } }
        );

        if (!user) {
          return res.status(404).json({
            success: false,
            error: "User not found"
          });
        }

        // Create deposit record with user information
        const depositData = {
          userId: new ObjectId(userId),
          username: user.username || user.name || 'Unknown',
          membershipId: user.membershipId || 'Unknown',
          amount: Number(amount),
          method,
          reference: reference || '',
          status: status || 'completed',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const depositResult = await depositsCollection.insertOne(depositData);
        console.log("✅ Deposit created:", depositResult.insertedId);

        // Update user balance
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { 
            $inc: { accountBalance: Number(amount) },
            $set: { updatedAt: new Date() }
          }
        );

        console.log("✅ User balance updated by:", amount);

        res.json({
          success: true,
          message: "Deposit recorded successfully",
          data: {
            depositId: depositResult.insertedId,
            amount: Number(amount),
            username: user.username || user.name || 'Unknown',
            membershipId: user.membershipId || 'Unknown',
            method,
            reference: reference || '',
            status: status || 'completed'
          }
        });
      } catch (error) {
        console.error("❌ Error creating deposit:", error);
        res.status(500).json({
          success: false,
          error: "Failed to record deposit",
          details: error.message
        });
      }
  }

    // Create bonus endpoint
    else if (req.method === 'POST' && path === '/api/frontend/bonuses') {
      console.log("🎁 Creating bonus:", req.body);

      try {
        const { userId, amount, type, reason, status } = req.body;
        
        if (!userId || !amount || !type) {
          return res.status(400).json({
            success: false,
            error: "userId, amount, and type are required"
          });
        }

        const bonusesCollection = database.collection('bonuses');
        const usersCollection = database.collection('users');

        // Create bonus record
        const bonusData = {
          userId: new ObjectId(userId),
          amount: Number(amount),
          type,
          reason: reason || '',
          status: status || 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const bonusResult = await bonusesCollection.insertOne(bonusData);
        console.log("✅ Bonus created:", bonusResult.insertedId);

        // Update user balance
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { 
            $inc: { accountBalance: Number(amount) },
            $set: { updatedAt: new Date() }
          }
        );

        console.log("✅ User balance updated by bonus:", amount);

        res.json({
          success: true,
          message: "Bonus added successfully",
          data: {
            bonusId: bonusResult.insertedId,
            amount: Number(amount),
            type
          }
        });
      } catch (error) {
        console.error("❌ Error creating bonus:", error);
        res.status(500).json({
          success: false,
          error: "Failed to add bonus",
          details: error.message
        });
      }
    }

    // Debug endpoint to check database directly
    else if (req.method === 'GET' && path.includes('/debug-combo-task/')) {
      const customerId = path.split('/').pop();
      const { taskNumber } = req.query;
      
      console.log("🔍 Debug: Checking database directly for customerId:", customerId, "taskNumber:", taskNumber);
      
      try {
        const customerTasksCollection = database.collection('customerTasks');
        
        // Check all tasks for this customer
        const allTasks = await customerTasksCollection.find({ customerId: customerId }).toArray();
        console.log("🔍 All tasks for customer:", allTasks);
        
        // Check specific task if taskNumber provided
        if (taskNumber) {
          const specificTask = await customerTasksCollection.findOne({
            customerId: customerId,
            taskNumber: Number(taskNumber)
          });
          console.log("🔍 Specific task:", specificTask);
          
          res.json({
            success: true,
            customerId: customerId,
            taskNumber: taskNumber,
            specificTask: specificTask,
            allTasks: allTasks,
            message: "Database check completed"
          });
        } else {
          res.json({
            success: true,
            customerId: customerId,
            allTasks: allTasks,
            message: "All tasks for customer retrieved"
          });
        }
      } catch (error) {
        console.error("❌ Debug error:", error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
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
