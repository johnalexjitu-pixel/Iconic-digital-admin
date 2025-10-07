# 🚀 Sync Service - দ্রুত শুরু করুন (Bengali Guide)

## 📋 কি পাবেন

একটি সম্পূর্ণ backend synchronization service যা **AdminPanelClone** এবং **iconic-digital-frontend** এর মধ্যে data sync করে।

## 🎯 Service গুলো

```
Port 5000  → AdminPanelClone Backend (Admin API)
Port 3001  → iconic-digital-frontend (User Frontend API)
Port 3002  → Sync Service (Synchronization Service)
```

## ⚡ দ্রুত সেটাপ (5 মিনিট)

### ধাপ ১: Dependencies Install করুন

```bash
cd AdminPanelClone/sync-service
npm install
```

### ধাপ ২: Environment Configure করুন

```bash
# .env file তৈরি করুন
cp .env.example .env
```

`.env` file edit করুন:
```env
# Admin Panel API (আপনার backend server)
ADMIN_API_BASE=http://localhost:5000/api
ADMIN_AUTH_HEADER=Bearer your-admin-token

# User Frontend API (iconic-digital-frontend)
USER_API_BASE=http://localhost:3001/api
USER_AUTH_HEADER=Bearer your-user-token

# Sync Service Settings
SYNC_SECRET=apnar-secure-secret-key
SYNC_MODE=dry-run
SYNC_PORT=3002
```

### ধাপ ৩: তিনটি Service চালু করুন

**Terminal 1 - Backend (Port 5000):**
```bash
cd AdminPanelClone
npm run dev
```

**Terminal 2 - User Frontend (Port 3001):**
```bash
cd iconic-digital-frontend
bun run dev
```

**Terminal 3 - Sync Service (Port 3002):**
```bash
cd AdminPanelClone/sync-service
npm run dev
```

### ধাপ ৪: Test করুন

```bash
# Sync service health check
curl http://localhost:3002/sync/health
```

## 🎯 Available Sync Mappings

### 1. syncUsers
Admin panel থেকে user frontend এ নতুন user sync করে।

```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: apnar-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncUsers",
    "mode": "dry-run",
    "limit": 5
  }'
```

### 2. updateUser
User এর information update করে।

```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: apnar-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "updateUser",
    "mode": "dry-run",
    "limit": 10
  }'
```

### 3. syncCampaigns
Campaign data sync করে।

```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: apnar-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncCampaigns",
    "mode": "dry-run",
    "limit": 10
  }'
```

### 4. updateCampaign
Campaign status ও participant count update করে।

```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: apnar-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "updateCampaign",
    "mode": "dry-run"
  }'
```

### 5. syncTransactions
Transaction records sync করে।

```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: apnar-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncTransactions",
    "mode": "dry-run",
    "limit": 20
  }'
```

## 🔄 Batch Sync (একসাথে সব sync)

```bash
curl -X POST http://localhost:3002/sync/run-batch \
  -H "x-sync-secret: apnar-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": ["syncUsers", "syncCampaigns", "syncTransactions"],
    "mode": "dry-run",
    "limit": 50
  }'
```

## 📊 Log দেখুন

```bash
# Real-time log দেখুন
tail -f logs/sync.log

# Windows PowerShell এ
Get-Content logs\sync.log -Wait

# শুধু errors দেখুন
cat logs/error.log
```

## 🎓 Dry-Run vs Sync Mode

### Dry-Run Mode (নিরাপদ testing)
```json
{
  "mode": "dry-run"  // কোন data পাঠায় না, শুধু দেখায় কি পাঠাবে
}
```

### Sync Mode (আসল sync)
```json
{
  "mode": "sync"  // আসলেই data পাঠায়
}
```

**⚠️ সতর্কতা:** প্রথমে সবসময় `dry-run` দিয়ে test করুন!

## 📝 Available Endpoints

| Endpoint | Method | কি করে |
|----------|--------|---------|
| `/sync/health` | GET | Service চলছে কিনা check করে |
| `/sync/mappings` | GET | সব mappings এর list দেয়  |
| `/sync/mappings/:name` | GET | একটি specific mapping এর details |
| `/sync/run` | POST | একটি mapping sync করে |
| `/sync/run-batch` | POST | একাধিক mappings sync করে |

## 🔍 Troubleshooting

### Problem: "Configuration validation failed"
**Solution:** `.env` file check করুন, সব required variables আছে কিনা।

### Problem: "Cannot connect to backend"
**Solution:** 
```bash
# Backend চলছে কিনা check করুন
curl http://localhost:5000/api/health
```

### Problem: "Cannot connect to user frontend"
**Solution:**
```bash
# Frontend চলছে কিনা check করুন
curl http://localhost:3001/api/status
```

### Problem: "401 Unauthorized"
**Solution:** `.env` file এ auth headers check করুন।

## 🎯 Data Flow বুঝুন

```
Admin Panel (5000)
      ↓
   Fetch Data
      ↓
Sync Service (3002)
      ↓
  Transform Data
      ↓
User Frontend (3001)
```

## ✅ Testing Checklist

- [ ] Backend server চলছে (port 5000)
- [ ] User frontend চলছে (port 3001)
- [ ] Sync service চলছে (port 3002)
- [ ] সব health checks successful
- [ ] Dry-run test করেছি
- [ ] Logs check করেছি
- [ ] ছোট batch দিয়ে actual sync test করেছি
- [ ] User frontend এ data verify করেছি

## 📚 আরও তথ্য

- **README.md** - সম্পূর্ণ documentation (English)
- **ICONIC_DIGITAL_INTEGRATION.md** - বিস্তারিত integration guide
- **GETTING_STARTED.md** - Step-by-step guide

## 🚀 Production এ Deploy

```bash
# Build করুন
npm run build

# Production mode এ চালান
npm start

# PM2 দিয়ে চালান (recommended)
pm2 start dist/index.js --name sync-service
pm2 logs sync-service
```

---

এখন sync service সম্পূর্ণভাবে ready! 🎉

প্রথমে **dry-run** mode দিয়ে test করুন, তারপর **sync** mode ব্যবহার করুন।
