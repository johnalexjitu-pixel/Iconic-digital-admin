# 🎯 iconicdigital.com থেকে Real Users Fetch করুন

## সমস্যা
আপনার Admin Panel এর **User Management** page এ data নেই (1-0 of 0 দেখাচ্ছে)।

## কারণ
Backend server `USER_SITE_URL` environment variable থেকে user data fetch করে, কিন্তু সেটা configure করা নেই।

## ✅ সমাধান (দ্রুত)

### Step 1: Environment Variable Set করুন

AdminPanelClone folder এ `.env.local` file তৈরি করুন:

```bash
cd AdminPanelClone
```

Create `.env.local`:
```env
USER_SITE_URL=https://iconicdigital.com
MONGODB_URI=mongodb+srv://iconicdigital:iconicdigital@iconicdigital.t5nr2g9.mongodb.net/?retryWrites=true&w=majority&appName=iconicdigital
PORT=5000
```

### Step 2: Backend Server Restart করুন

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Browser Refresh করুন

Admin Panel এ যান এবং refresh করুন:
```
http://localhost:5000/user-management
```

এখন iconicdigital.com থেকে real users দেখাবে! 🎉

## 🔍 API Endpoints

Backend এই endpoints ব্যবহার করছে:

### 1. Get Users (with pagination)
```
GET /api/frontend/users?page=1&limit=10
```

এটি internally call করে:
```
https://iconicdigital.com/api/users?page=1&limit=10
```

### 2. Get Users with Filters
```
GET /api/frontend/users?level=Gold&search=john
```

### 3. Get Campaigns
```
GET /api/frontend/campaigns?status=Active
```

### 4. Get Transactions
```
GET /api/frontend/transactions
```

## 🧪 Test করুন

### Backend API থেকে direct test:
```bash
# Test users API
curl http://localhost:5000/api/frontend/users

# Test campaigns API
curl http://localhost:5000/api/frontend/campaigns

# Test transactions API
curl http://localhost:5000/api/frontend/transactions
```

### iconicdigital.com থেকে direct test:
```bash
# Test if iconicdigital.com API works
curl https://iconicdigital.com/api/users

# Test campaigns
curl https://iconicdigital.com/api/campaigns

# Test status
curl https://iconicdigital.com/api/status
```

## 🚨 যদি এখনও data না আসে

### Problem 1: iconicdigital.com API down
```bash
# Check API status
curl -I https://iconicdigital.com/api/status
```

### Problem 2: CORS Issue
Backend এ CORS enable করতে হবে। `server/index.ts` এ check করুন।

### Problem 3: Authentication Required
যদি iconicdigital.com API authentication require করে:

`.env.local` এ add করুন:
```env
USER_SITE_API_KEY=your-api-key-here
```

Then update `server/routes.ts`:
```typescript
const response = await fetch(`${USER_SITE_URL}/api/users?${queryParams}`, {
  headers: {
    'Authorization': `Bearer ${process.env.USER_SITE_API_KEY}`
  }
});
```

## 🎯 Alternative: Direct MongoDB Access

যদি API এ problem হয়, direct MongoDB থেকে fetch করতে পারেন:

`server/routes.ts` এ change করুন:

```typescript
// Users from MongoDB directly
app.get("/api/frontend/users", async (req, res) => {
  try {
    const { page = 1, limit = 10, level, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = {};
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { membershipId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
      
    const total = await User.countDocuments(query);
    
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
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});
```

## 📊 Data Flow Diagram

```
User Management Page (Frontend)
         ↓
    fetch('/api/frontend/users')
         ↓
AdminPanelClone Backend (localhost:5000)
         ↓
    fetch(`${USER_SITE_URL}/api/users`)
         ↓
iconicdigital.com API
         ↓
    MongoDB Database
         ↓
    Return Users Data
```

## ✅ Quick Checklist

- [ ] `.env.local` file created
- [ ] `USER_SITE_URL=https://iconicdigital.com` set
- [ ] Backend server restarted
- [ ] Browser refreshed
- [ ] iconicdigital.com API accessible
- [ ] MongoDB connection working
- [ ] Users showing in Admin Panel

## 🎉 Success!

যদি সব ঠিক থাকে, এখন আপনার Admin Panel এ iconicdigital.com থেকে real user data দেখাবে!

User Management page এ দেখবেন:
- User names
- Email addresses
- Membership IDs
- Levels (Bronze, Silver, Gold, etc.)
- Account balances
- Campaign completion counts
- Created dates

---

**Note:** প্রথমবার refresh করার পর কিছু second লাগতে পারে iconicdigital.com থেকে data load হতে।

