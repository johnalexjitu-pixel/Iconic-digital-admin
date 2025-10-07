# 🚀 Production Setup - iconicdigital.com

## 📋 Overview

আপনার production server **iconicdigital.com** থেকে dashboard data এবং অন্যান্য data sync করার complete setup guide।

## 🔧 Production Configuration

### Step 1: Production Environment File Setup

```bash
cd AdminPanelClone/sync-service

# Production environment file copy করুন
cp .env.production .env
```

### Step 2: Production Environment Variables

`.env` file edit করুন:

```env
# Production API Base URL (iconicdigital.com)
ADMIN_API_BASE=https://iconicdigital.com/api
ADMIN_AUTH_HEADER=Bearer your-production-admin-token

USER_API_BASE=https://iconicdigital.com/api
USER_AUTH_HEADER=Bearer your-production-user-token

# Sync Service Settings
SYNC_SECRET=your-very-secure-production-secret
SYNC_MODE=dry-run  # প্রথমে dry-run দিয়ে test করুন
SYNC_PORT=3002
SYNC_BATCH_SIZE=100

# MongoDB (from BACKEND_SETUP_GUIDE.md)
MONGODB_URI=mongodb+srv://iconicdigital:iconicdigital@iconicdigital.t5nr2g9.mongodb.net/?retryWrites=true&w=majority&appName=iconicdigital

# Production Settings
NODE_ENV=production
RATE_LIMIT_DELAY_MS=200
MAX_RETRIES=3
```

## 📡 Available Sync Endpoints

### 1. User Management

#### Sync Users
```bash
curl -X POST https://your-sync-domain.com/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncUsers",
    "mode": "dry-run",
    "limit": 10
  }'
```

#### Update Users
```bash
curl -X POST https://your-sync-domain.com/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "updateUser",
    "mode": "dry-run",
    "limit": 20
  }'
```

### 2. Campaign Management

#### Sync Campaigns
```bash
curl -X POST https://your-sync-domain.com/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncCampaigns",
    "mode": "dry-run",
    "limit": 50
  }'
```

#### Update Campaign Status
```bash
curl -X POST https://your-sync-domain.com/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "updateCampaign",
    "mode": "dry-run"
  }'
```

### 3. Transaction Sync

```bash
curl -X POST https://your-sync-domain.com/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncTransactions",
    "mode": "dry-run",
    "limit": 100
  }'
```

### 4. Dashboard Data Sync (NEW!)

#### Dashboard Statistics
```bash
curl -X POST https://your-sync-domain.com/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncDashboardStats",
    "mode": "dry-run"
  }'
```

#### Dashboard Analytics
```bash
curl -X POST https://your-sync-domain.com/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncDashboardAnalytics",
    "mode": "dry-run"
  }'
```

### 5. Bulk Sync (All Data)

```bash
curl -X POST https://your-sync-domain.com/sync/run-batch \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": [
      "syncUsers",
      "syncCampaigns",
      "syncTransactions",
      "syncDashboardStats",
      "syncDashboardAnalytics"
    ],
    "mode": "dry-run",
    "limit": 100
  }'
```

## 🏗️ Production Deployment

### Option 1: PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Build the application
cd AdminPanelClone/sync-service
npm run build

# Start with PM2
pm2 start dist/index.js --name iconicdigital-sync

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3002

CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t iconicdigital-sync .
docker run -d --name iconicdigital-sync \
  -p 3002:3002 \
  --env-file .env \
  iconicdigital-sync
```

### Option 3: systemd Service

Create `/etc/systemd/system/iconicdigital-sync.service`:
```ini
[Unit]
Description=IconicDigital Sync Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/AdminPanelClone/sync-service
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable iconicdigital-sync
sudo systemctl start iconicdigital-sync
sudo systemctl status iconicdigital-sync
```

## 🔒 Security Setup

### 1. Generate Secure Secret
```bash
# Linux/Mac
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

এটি `.env` এর `SYNC_SECRET` এ use করুন।

### 2. HTTPS Only
Production এ শুধুমাত্র HTTPS use করুন:
```env
ADMIN_API_BASE=https://iconicdigital.com/api
USER_API_BASE=https://iconicdigital.com/api
```

### 3. Firewall Rules
```bash
# শুধুমাত্র specific IPs থেকে access allow করুন
sudo ufw allow from YOUR_IP to any port 3002
```

### 4. Reverse Proxy (Nginx)

`/etc/nginx/sites-available/sync-service`:
```nginx
server {
    listen 80;
    server_name sync.iconicdigital.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d sync.iconicdigital.com
```

## 📊 Monitoring & Logging

### View Logs
```bash
# PM2 logs
pm2 logs iconicdigital-sync

# Direct log files
tail -f logs/sync.log
tail -f logs/error.log

# systemd logs
sudo journalctl -u iconicdigital-sync -f
```

### Log Rotation
Create `/etc/logrotate.d/iconicdigital-sync`:
```
/path/to/AdminPanelClone/sync-service/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

## 🔍 Health Monitoring

### Simple Health Check Script
```bash
#!/bin/bash
# health-check.sh

SYNC_URL="https://sync.iconicdigital.com/sync/health"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $SYNC_URL)

if [ $STATUS -eq 200 ]; then
    echo "✅ Sync service is healthy"
    exit 0
else
    echo "❌ Sync service is down (Status: $STATUS)"
    exit 1
fi
```

### Cron Job for Health Monitoring
```bash
# Add to crontab
*/5 * * * * /path/to/health-check.sh || systemctl restart iconicdigital-sync
```

## 🕐 Scheduled Sync Jobs

### Cron Jobs Setup

Edit crontab:
```bash
crontab -e
```

Add scheduled syncs:
```bash
# Every hour - Sync users
0 * * * * curl -X POST https://sync.iconicdigital.com/sync/run -H "x-sync-secret: YOUR_SECRET" -d '{"mappingName":"syncUsers","mode":"sync","limit":100}'

# Every 30 minutes - Sync campaigns
*/30 * * * * curl -X POST https://sync.iconicdigital.com/sync/run -H "x-sync-secret: YOUR_SECRET" -d '{"mappingName":"syncCampaigns","mode":"sync"}'

# Every 15 minutes - Sync transactions
*/15 * * * * curl -X POST https://sync.iconicdigital.com/sync/run -H "x-sync-secret: YOUR_SECRET" -d '{"mappingName":"syncTransactions","mode":"sync"}'

# Daily at 2 AM - Full dashboard sync
0 2 * * * curl -X POST https://sync.iconicdigital.com/sync/run-batch -H "x-sync-secret: YOUR_SECRET" -d '{"mappings":["syncDashboardStats","syncDashboardAnalytics"],"mode":"sync"}'
```

## 🧪 Production Testing Checklist

- [ ] `.env.production` configured with correct URLs
- [ ] SYNC_SECRET generated and set
- [ ] HTTPS enabled and SSL certificate installed
- [ ] Health check endpoint responding: `https://sync.iconicdigital.com/sync/health`
- [ ] Dry-run test successful for all mappings
- [ ] Logs directory writable
- [ ] PM2/systemd service running
- [ ] Firewall rules configured
- [ ] Reverse proxy (Nginx) configured
- [ ] Log rotation set up
- [ ] Monitoring/alerting configured
- [ ] Cron jobs for scheduled syncs added

## 🚨 Troubleshooting Production Issues

### Issue: Cannot connect to iconicdigital.com
```bash
# Test API connectivity
curl -I https://iconicdigital.com/api/status

# Check DNS resolution
nslookup iconicdigital.com

# Check firewall
sudo ufw status
```

### Issue: Authentication errors (401)
```bash
# Verify auth headers
echo $ADMIN_AUTH_HEADER
echo $USER_AUTH_HEADER

# Test with actual token
curl -H "Authorization: Bearer YOUR_TOKEN" https://iconicdigital.com/api/users
```

### Issue: Rate limiting
```env
# Increase delays in .env
RATE_LIMIT_DELAY_MS=500
MAX_RETRIES=5
RETRY_DELAY_MS=3000
```

### Issue: Memory leaks
```bash
# Monitor memory usage
pm2 monit

# Restart service
pm2 restart iconicdigital-sync

# Set max memory limit
pm2 start dist/index.js --name iconicdigital-sync --max-memory-restart 500M
```

## 📱 Monitoring Dashboard

### Setup Monitoring with PM2 Plus
```bash
# Install PM2 Plus
pm2 install pm2-server-monit

# Link to PM2 Plus
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

## 🎯 Performance Optimization

### 1. Database Connection Pooling
Production এ connection pool size বাড়ান।

### 2. Caching
```env
# Add to .env
CACHE_TTL=300
ENABLE_CACHE=true
```

### 3. Batch Size Tuning
```env
# Production এ batch size optimize করুন
SYNC_BATCH_SIZE=200  # Network এর উপর depend করে
```

## ✅ Final Production Deployment Steps

1. **Backup করুন**
   ```bash
   # Database backup
   mongodump --uri="$MONGODB_URI"
   ```

2. **Build করুন**
   ```bash
   npm run build
   ```

3. **Test করুন (dry-run)**
   ```bash
   SYNC_MODE=dry-run npm start
   ```

4. **Deploy করুন**
   ```bash
   pm2 start dist/index.js --name iconicdigital-sync
   pm2 save
   ```

5. **Monitor করুন**
   ```bash
   pm2 logs iconicdigital-sync
   tail -f logs/sync.log
   ```

6. **Health check করুন**
   ```bash
   curl https://sync.iconicdigital.com/sync/health
   ```

---

এখন আপনার sync service **iconicdigital.com** থেকে dashboard data সহ সব data sync করতে পারবে! 🚀

প্রথমে **dry-run** mode দিয়ে test করুন, তারপর **sync** mode enable করুন।
