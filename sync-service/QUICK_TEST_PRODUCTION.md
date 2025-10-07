# ⚡ Quick Production Test - iconicdigital.com

## 🚀 দ্রুত শুরু করুন (Production)

### Step 1: Environment Setup (2 মিনিট)

```bash
cd AdminPanelClone/sync-service

# Production environment copy করুন
cp .env.production .env

# Edit করুন
nano .env  # অথবা vim/code
```

Important variables:
```env
ADMIN_API_BASE=https://iconicdigital.com/api
USER_API_BASE=https://iconicdigital.com/api
SYNC_SECRET=your-production-secret
SYNC_MODE=dry-run
```

### Step 2: Install & Build (3 মিনিট)

```bash
# Dependencies install
npm install

# Build production
npm run build

# Start
npm start
```

### Step 3: Test Connection (1 মিনিট)

```bash
# Health check
curl http://localhost:3002/sync/health

# List mappings
curl -H "x-sync-secret: your-secret" \
  http://localhost:3002/sync/mappings
```

## 🎯 iconicdigital.com থেকে Data Fetch Test

### Test 1: Dashboard Stats Sync
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncDashboardStats",
    "mode": "dry-run",
    "limit": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "processedCount": 1,
    "successCount": 1,
    "failureCount": 0,
    "dryRun": true,
    "actions": [...]
  }
}
```

### Test 2: Users Sync
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

### Test 3: Campaigns Sync
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

### Test 4: Transactions Sync
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncTransactions",
    "mode": "dry-run",
    "limit": 20
  }'
```

### Test 5: Dashboard Analytics
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncDashboardAnalytics",
    "mode": "dry-run"
  }'
```

## 📊 Logs Check করুন

```bash
# Sync logs
cat logs/sync.log

# Last 20 lines
tail -20 logs/sync.log

# Real-time monitoring
tail -f logs/sync.log

# Search for errors
grep "error" logs/sync.log

# Specific mapping logs
grep "syncDashboardStats" logs/sync.log
```

## ✅ Dry-Run Results Check

Dry-run response এ দেখুন:
```json
{
  "result": {
    "dryRun": true,
    "actions": [
      {
        "action": "POST",
        "resourceId": "68e09ac5d30baad87b6d81b0",
        "payload": {
          // এখানে দেখবেন কি data পাঠানো হবে
        }
      }
    ]
  }
}
```

## 🚀 Live Sync Enable করুন (সাবধানে!)

**⚠️ Warning:** Dry-run test successful হওয়ার পরেই live sync করুন!

### Small Batch Test (1 item)
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncUsers",
    "mode": "sync",
    "limit": 1
  }'
```

### Medium Batch Test (10 items)
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncCampaigns",
    "mode": "sync",
    "limit": 10
  }'
```

### Full Sync
```bash
curl -X POST http://localhost:3002/sync/run-batch \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": [
      "syncUsers",
      "syncCampaigns",
      "syncTransactions"
    ],
    "mode": "sync",
    "limit": 100
  }'
```

## 🔍 Verify Data

### Check iconicdigital.com
```bash
# Verify users synced
curl https://iconicdigital.com/api/users

# Verify campaigns
curl https://iconicdigital.com/api/campaigns

# Verify transactions
curl https://iconicdigital.com/api/transactions
```

## 📱 PM2 এ Deploy (Production)

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/index.js --name iconicdigital-sync

# Check status
pm2 status

# View logs
pm2 logs iconicdigital-sync

# Monitor
pm2 monit

# Save configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

## 🕐 Auto Sync Setup (Cron)

```bash
# Edit crontab
crontab -e
```

Add:
```bash
# Every hour - Dashboard sync
0 * * * * curl -s -X POST http://localhost:3002/sync/run -H "x-sync-secret: YOUR_SECRET" -d '{"mappingName":"syncDashboardStats","mode":"sync"}' >> /var/log/sync-cron.log 2>&1

# Every 30 min - Campaigns
*/30 * * * * curl -s -X POST http://localhost:3002/sync/run -H "x-sync-secret: YOUR_SECRET" -d '{"mappingName":"syncCampaigns","mode":"sync"}' >> /var/log/sync-cron.log 2>&1

# Every 15 min - Transactions
*/15 * * * * curl -s -X POST http://localhost:3002/sync/run -H "x-sync-secret: YOUR_SECRET" -d '{"mappingName":"syncTransactions","mode":"sync"}' >> /var/log/sync-cron.log 2>&1
```

## 🚨 Common Issues & Quick Fixes

### Cannot connect to iconicdigital.com
```bash
# Test connection
curl -I https://iconicdigital.com/api/status

# Check DNS
ping iconicdigital.com

# Test with full URL
curl https://iconicdigital.com/api/users
```

### 401 Unauthorized
```bash
# Check auth header
echo $ADMIN_AUTH_HEADER

# Update in .env
ADMIN_AUTH_HEADER=Bearer your-correct-token
```

### No data returned
```bash
# Check admin API directly
curl https://iconicdigital.com/api/users

# Verify endpoint exists
curl -I https://iconicdigital.com/api/users
```

## ✅ Quick Checklist

- [ ] `.env.production` configured
- [ ] `npm install` successful
- [ ] `npm run build` successful
- [ ] Service started successfully
- [ ] Health check passes
- [ ] Dry-run test successful
- [ ] Logs show correct data
- [ ] Small batch sync test successful
- [ ] Data verified on iconicdigital.com
- [ ] PM2 deployed (optional)
- [ ] Cron jobs added (optional)

## 📞 Quick Commands Reference

```bash
# Start
npm start

# Build
npm run build

# Test
npm test

# Logs
tail -f logs/sync.log

# PM2 Start
pm2 start dist/index.js --name iconicdigital-sync

# PM2 Logs
pm2 logs iconicdigital-sync

# PM2 Restart
pm2 restart iconicdigital-sync

# PM2 Stop
pm2 stop iconicdigital-sync
```

---

এই steps follow করে আপনি **iconicdigital.com** থেকে dashboard data এবং সব data sync করতে পারবেন! 🎉

মনে রাখবেন: প্রথমে **dry-run**, তারপর **sync**!
