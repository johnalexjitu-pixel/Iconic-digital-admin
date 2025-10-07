# 🔗 Iconic Digital Frontend Integration Guide

## 📋 Overview

এই sync service এখন **iconic-digital-frontend** এর actual API endpoints ব্যবহার করে configured করা হয়েছে।

## 🎯 Configured API Endpoints

### User Frontend API (iconic-digital-frontend)
**Base URL:** `http://localhost:3001/api` (Development)

### Backend API (AdminPanelClone)
**Base URL:** `http://localhost:5000/api`

## 📡 Available Sync Mappings

### 1. syncUsers
**Admin → User Frontend**
- **Admin Endpoint:** `GET /admin/users`
- **User Endpoint:** `POST /api/auth/register`
- **Transform:** Yes
- **Purpose:** Sync new users from admin panel to user frontend

**Admin Data Format:**
```json
{
  "_id": "68e09ac5d30baad87b6d81b0",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "level": "Gold",
  "membershipId": "29935",
  "accountBalance": 50000,
  "totalEarnings": 25000,
  "referralCode": "9CNMVST9"
}
```

**User Frontend Format (After Transform):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "defaultPassword123",
  "referralCode": "9CNMVST9"
}
```

### 2. updateUser
**Admin → User Frontend**
- **Admin Endpoint:** `GET /admin/users`
- **User Endpoint:** `PUT /api/users/:id`
- **Transform:** Yes
- **Purpose:** Update existing user information

**Transform Fields:**
```
name → name
level → level
accountBalance → accountBalance
totalEarnings → totalEarnings
campaignsCompleted → campaignsCompleted
creditScore → creditScore
```

### 3. syncCampaigns
**Admin → User Frontend**
- **Admin Endpoint:** `GET /admin/campaigns`
- **User Endpoint:** `POST /api/campaigns`
- **Transform:** Yes
- **Purpose:** Sync campaigns from admin panel to user frontend

**Admin Data Format:**
```json
{
  "_id": "68e09adcd30baad87b6d81b4",
  "brand": "Nike",
  "logo": "👟",
  "description": "Nike shoe promotion campaign",
  "type": "Social",
  "commissionRate": 15,
  "commissionAmount": 7500,
  "baseAmount": 50000,
  "profit": 7500,
  "requirements": ["Post on Instagram", "Use #NikeShoes"],
  "duration": 14,
  "maxParticipants": 200,
  "startDate": "2025-10-05T00:00:00.000Z",
  "endDate": "2025-10-19T00:00:00.000Z"
}
```

### 4. updateCampaign
**Admin → User Frontend**
- **Admin Endpoint:** `GET /admin/campaigns`
- **User Endpoint:** `PUT /api/campaigns/:id`
- **Transform:** Yes
- **Purpose:** Update campaign status and participants

**Transform Fields:**
```
status → status
currentParticipants → currentParticipants
isActive → isActive
```

### 5. syncTransactions
**Admin → User Frontend**
- **Admin Endpoint:** `GET /admin/transactions`
- **User Endpoint:** `POST /api/transactions`
- **Transform:** Yes
- **Purpose:** Sync transaction records

**Admin Data Format:**
```json
{
  "_id": "68e09ae5d30baad87b6d81b5",
  "userId": "68e09ac5d30baad87b6d81b0",
  "type": "campaign_earning",
  "amount": 5000,
  "description": "Earning from Nike campaign",
  "campaignId": "68e09adcd30baad87b6d81b4",
  "status": "completed",
  "method": "bank_transfer",
  "reference": "REF123456"
}
```

## 🚀 Setup Instructions

### Step 1: Environment Configuration

```bash
cd AdminPanelClone/sync-service
cp .env.example .env
```

Edit `.env`:
```env
# Admin Panel API (your backend server)
ADMIN_API_BASE=http://localhost:5000/api
ADMIN_AUTH_HEADER=Bearer your-admin-token

# User Frontend API (iconic-digital-frontend)
USER_API_BASE=http://localhost:3001/api
USER_AUTH_HEADER=Bearer your-user-token

# Sync Service Settings
SYNC_SECRET=your-secure-secret
SYNC_MODE=dry-run  # Start with dry-run!
SYNC_PORT=3002     # Different from frontend (3001) and backend (5000)
```

### Step 2: Start Required Services

**Terminal 1 - Backend Server (AdminPanelClone):**
```bash
cd AdminPanelClone
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - User Frontend (iconic-digital-frontend):**
```bash
cd iconic-digital-frontend
bun run dev
# Runs on http://localhost:3001
```

**Terminal 3 - Sync Service:**
```bash
cd AdminPanelClone/sync-service
npm install
npm run dev
# Runs on http://localhost:3002
```

### Step 3: Test Health Checks

```bash
# Test backend
curl http://localhost:5000/api/health

# Test user frontend
curl http://localhost:3001/api/status

# Test sync service
curl http://localhost:3002/sync/health
```

## 🧪 Testing Sync Operations

### 1. List Available Mappings
```bash
curl -H "x-sync-secret: your-secret" \
  http://localhost:3002/sync/mappings
```

### 2. Sync Users (Dry-Run)
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncUsers",
    "mode": "dry-run",
    "limit": 5
  }'
```

### 3. Sync Campaigns (Dry-Run)
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncCampaigns",
    "mode": "dry-run",
    "limit": 10
  }'
```

### 4. Update Users (Live Sync)
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "updateUser",
    "mode": "sync",
    "limit": 10
  }'
```

### 5. Sync All (Batch)
```bash
curl -X POST http://localhost:3002/sync/run-batch \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": ["syncUsers", "syncCampaigns", "syncTransactions"],
    "mode": "dry-run",
    "limit": 20
  }'
```

## 📊 Data Flow

```
┌─────────────────────┐
│  Admin Panel Clone  │
│   (Port: 5000)      │
│   Backend Server    │
└──────────┬──────────┘
           │
           │ 1. Fetch Data
           ↓
┌─────────────────────┐
│   Sync Service      │
│   (Port: 3002)      │
│  • Fetch from Admin │
│  • Transform Data   │
│  • Send to User     │
└──────────┬──────────┘
           │
           │ 2. Send Transformed Data
           ↓
┌─────────────────────┐
│ Iconic Digital      │
│   Frontend          │
│   (Port: 3001)      │
│   Next.js + MongoDB │
└─────────────────────┘
```

## 🔍 Monitoring

### View Sync Logs
```bash
# Real-time log watching
tail -f logs/sync.log

# On Windows PowerShell
Get-Content logs\sync.log -Wait

# Search for specific mapping
grep "syncUsers" logs/sync.log

# View errors only
cat logs/error.log
```

### Check Sync Status
```bash
# Get last sync operations
curl -H "x-sync-secret: your-secret" \
  http://localhost:3002/sync/mappings
```

## 🛠️ Common Scenarios

### Scenario 1: New User Registration in Admin Panel
When admin creates a new user:
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -d '{"mappingName":"syncUsers","mode":"sync","limit":1}'
```

### Scenario 2: Campaign Status Update
When campaign status changes:
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -d '{"mappingName":"updateCampaign","mode":"sync"}'
```

### Scenario 3: Daily Bulk Sync
Run all syncs at once:
```bash
curl -X POST http://localhost:3002/sync/run-batch \
  -H "x-sync-secret: your-secret" \
  -d '{
    "mappings": ["syncUsers","syncCampaigns","syncTransactions"],
    "mode":"sync",
    "limit":100
  }'
```

## 📝 Important Notes

### 1. MongoDB Connection
User frontend uses MongoDB. The sync service only uses API calls, **না direct database access**.

### 2. Authentication
- Admin API needs proper authorization header
- User frontend API may require authentication tokens
- Update headers in `.env` file accordingly

### 3. ID Fields
User frontend uses `_id` (MongoDB ObjectID format), not `id`.

### 4. Dry-Run First
Always test with `dry-run` mode before doing actual sync:
```json
{
  "mode": "dry-run"  // Safe testing
}
```

### 5. Rate Limiting
Frontend has rate limits. Adjust in `.env`:
```env
RATE_LIMIT_DELAY_MS=200  # Increase if getting rate limited
```

## 🚨 Troubleshooting

### Issue: Cannot connect to user frontend
```bash
# Check if frontend is running
curl http://localhost:3001/api/status

# Check environment variable
echo $USER_API_BASE
```

### Issue: Sync fails with 401 Unauthorized
```bash
# Update auth headers in .env
USER_AUTH_HEADER=Bearer your-valid-token
```

### Issue: Data format mismatch
Check transformer files in `src/transformers/`:
- `syncUsers.ts`
- `updateUser.ts`
- `syncCampaigns.ts`
- `updateCampaign.ts`
- `syncCustomers.ts` (for transactions)

## 🎯 Production Deployment

### Environment Variables for Production
```env
ADMIN_API_BASE=https://admin.your-domain.com/api
USER_API_BASE=https://your-domain.com/api
SYNC_MODE=sync
SYNC_PORT=3002
```

### PM2 Process Manager
```bash
# Build
npm run build

# Start with PM2
pm2 start dist/index.js --name sync-service

# Monitor
pm2 logs sync-service
pm2 monit
```

## ✅ Testing Checklist

- [ ] Backend server running on port 5000
- [ ] User frontend running on port 3001
- [ ] Sync service running on port 3002
- [ ] All health checks passing
- [ ] Dry-run sync successful for all mappings
- [ ] Logs showing correct data transformations
- [ ] No errors in error.log
- [ ] Test actual sync with limit=1
- [ ] Verify data in user frontend
- [ ] Test batch sync

---

এখন sync service সম্পূর্ণভাবে iconic-digital-frontend এর সাথে কাজ করার জন্য ready! 🎉
