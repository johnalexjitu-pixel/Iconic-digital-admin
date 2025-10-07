# Sync Service

A robust backend synchronization service that syncs data between Admin Panel API and User Site API using REST API calls.

## Features

- ✅ **API-only integration** - No database or UI modifications
- ✅ **Idempotency support** - Prevents duplicate operations
- ✅ **Retry logic** - Exponential backoff for failed requests
- ✅ **Rate limiting** - Configurable delays between requests
- ✅ **Dry-run mode** - Test synchronization without making changes
- ✅ **Batch processing** - Configurable batch sizes
- ✅ **Transform support** - Map data between different API schemas
- ✅ **Comprehensive logging** - Structured logs with request/response tracking
- ✅ **Authentication** - Secure endpoints with token-based auth

## Installation

```bash
cd AdminPanelClone/sync-service
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
```env
# Admin Panel API Configuration (AdminPanelClone backend)
ADMIN_API_BASE=http://localhost:5000/api
ADMIN_AUTH_HEADER=Bearer your-admin-api-key-here

# User Site API Configuration (iconic-digital-frontend)
USER_API_BASE=http://localhost:3001/api
USER_AUTH_HEADER=Bearer your-user-api-key-here

# Sync Service Configuration
SYNC_BATCH_SIZE=100
SYNC_MODE=dry-run
SYNC_PORT=3002
SYNC_SECRET=your-secure-sync-secret-here

# Backend URL
BACKEND_URL=http://localhost:5000
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Running Tests
```bash
npm test
```

## API Endpoints

### Health Check
```bash
curl http://localhost:3002/sync/health
```

### List Available Mappings
```bash
curl -H "x-sync-secret: your-secret" \
  http://localhost:3002/sync/mappings
```

### Run Synchronization (Dry-Run)
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncUsers",
    "mode": "dry-run",
    "limit": 10
  }'
```

### Run Synchronization (Live)
```bash
curl -X POST http://localhost:3002/sync/run \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappingName": "syncCampaigns",
    "mode": "sync",
    "limit": 100
  }'
```

### Run Multiple Mappings
```bash
curl -X POST http://localhost:3002/sync/run-batch \
  -H "x-sync-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": ["syncUsers", "syncCampaigns", "syncTransactions"],
    "mode": "dry-run",
    "limit": 50
  }'
```

## Available Mappings

Based on **iconic-digital-frontend** API documentation.

### 1. syncUsers
Syncs new users from Admin Panel to User Frontend (registration).

**Endpoint:** `POST /api/auth/register`  
**Transform:** Admin user → User registration format

### 2. updateUser
Updates existing user information in User Frontend.

**Endpoint:** `PUT /api/users/:id`  
**Transform:** Admin user fields → User update fields

### 3. syncCampaigns
Syncs campaigns from Admin Panel to User Frontend.

**Endpoint:** `POST /api/campaigns`  
**Transform:** Admin campaign → User campaign format

### 4. updateCampaign
Updates campaign status and participant count.

**Endpoint:** `PUT /api/campaigns/:id`  
**Transform:** Campaign update fields

### 5. syncTransactions
Syncs transaction records from Admin to User Frontend.

**Endpoint:** `POST /api/transactions`  
**Transform:** Admin transaction → User transaction format

## Adding New Mappings

1. **Add mapping configuration** in `src/config.ts`:
```typescript
{
  name: 'syncOrders',
  adminEndpoint: '/admin/orders',
  userEndpoint: '/api/orders',
  method: 'POST',
  idField: 'orderId',
  paginationStyle: 'page',
  requiresTransform: true,
}
```

2. **Create transformer** (if needed) in `src/transformers/syncOrders.ts`:
```typescript
export function transformSyncOrders(adminData: AdminOrder): UserOrder {
  return {
    order_id: adminData.orderId,
    customer_id: adminData.customerId,
    items: adminData.orderItems,
    total: adminData.totalAmount,
  };
}
```

3. **Register transformer** in `src/transformers/index.ts`:
```typescript
import { transformSyncOrders } from './syncOrders.js';

const transformers: Record<string, TransformerFunction> = {
  // ... existing transformers
  syncOrders: transformSyncOrders,
};
```

## Architecture

### Components

- **`src/index.ts`** - Express server setup and initialization
- **`src/config.ts`** - Configuration and mapping definitions
- **`src/routes.ts`** - API route handlers
- **`src/syncController.ts`** - Core synchronization logic
- **`src/http-client.ts`** - HTTP client with retry logic
- **`src/logger.ts`** - Winston-based structured logging
- **`src/transformers/`** - Data transformation functions

### Flow

1. **Fetch** - Retrieve data from Admin API with pagination
2. **Transform** - Convert data to User API format (if needed)
3. **Send** - POST/PUT to User API with idempotency key
4. **Log** - Record all actions with request/response IDs

### Error Handling

- **4xx errors** - Logged and skipped (client errors, won't retry)
- **5xx errors** - Retried up to 3 times with exponential backoff
- **Network errors** - Retried with exponential backoff
- **Partial failures** - Continue processing remaining items

## Testing Checklist

- [ ] Copy `.env.example` to `.env` and configure all variables
- [ ] Run `npm install`
- [ ] Run `npm test` to verify unit tests pass
- [ ] Start service: `npm run dev`
- [ ] Test health endpoint: `curl http://localhost:3001/sync/health`
- [ ] Test authentication: Try accessing without `x-sync-secret` (should fail)
- [ ] Run dry-run sync and inspect logs: Check `logs/sync.log`
- [ ] Review dry-run actions in response JSON
- [ ] Configure staging User API endpoint
- [ ] Run actual sync with `mode: "sync"` and small limit (10)
- [ ] Verify data in User API
- [ ] Check error handling: Test with invalid mapping name
- [ ] Monitor logs during sync: `tail -f logs/sync.log`

## Logs

Logs are stored in `logs/` directory:
- `sync.log` - All sync operations
- `error.log` - Errors only

Log entries include:
- Request ID for tracking
- Mapping name
- Admin resource ID
- User resource ID
- Timestamps
- Duration
- Status (success/error/skipped)

## Security

- **Never commit `.env` file** - Contains sensitive API keys
- **Rotate SYNC_SECRET regularly** - Used for endpoint authentication
- **Use HTTPS in production** - Encrypt API communication
- **Limit network access** - Firewall sync service port
- **Monitor logs** - Watch for unauthorized access attempts

## Troubleshooting

### Configuration errors on startup
- Verify all required env variables are set
- Check `.env` file format (no quotes needed for values)

### 401 Unauthorized errors
- Verify API keys in `ADMIN_AUTH_HEADER` and `USER_AUTH_HEADER`
- Check API key format (usually `Bearer <token>`)

### Sync failures
- Check `logs/error.log` for details
- Verify Admin API is accessible
- Test User API endpoints with curl
- Ensure mapping configuration matches actual API endpoints

### Rate limiting issues
- Increase `RATE_LIMIT_DELAY_MS` in `.env`
- Reduce `SYNC_BATCH_SIZE`
- Check API provider's rate limits

## Production Deployment

1. **Build the service:**
```bash
npm run build
```

2. **Set production environment variables**

3. **Run with process manager:**
```bash
# Using PM2
pm2 start dist/index.js --name sync-service

# Using systemd
sudo systemctl start sync-service
```

4. **Set up monitoring:**
- Monitor `logs/` directory
- Set up alerts for error log entries
- Track sync job completion times

5. **Schedule regular syncs:**
```bash
# Cron example - Run every hour
0 * * * * curl -X POST http://localhost:3001/sync/run -H "x-sync-secret: $SYNC_SECRET" -d '{"mappingName":"createArticle","mode":"sync"}'
```

## Contributing

When adding new features:
1. Add TypeScript types
2. Include error handling
3. Add unit tests
4. Update this README
5. Add structured logging

## License

MIT
