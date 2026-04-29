# Real-Time Convoy & Vehicle GPS Tracking System

> This repository contains a Node.js backend API plus a static frontend app in `public/`.
>
> The static frontend can be deployed independently, or the backend can be hosted on a separate platform.
>
>A pipeline-first architecture for reliable fleet management with real-time GPS tracking, convoy coordination, and automated alerting.

**Status**: ✅ All systems operational and tested

## Features

- **Real-Time GPS Tracking**: Process and store GPS data from vehicles
- **Convoy Management**: Create and manage vehicle convoys with route planning
- **Automated Alerts**: Speed violation and geofence breach detection
- **WebSocket Broadcasting**: Real-time updates to connected clients
- **Queue-Based Processing**: Reliable job processing with BullMQ
- **PostgreSQL Database**: Robust data storage with proper indexing
- **Redis Caching**: High-performance caching and queue management
- **Production Ready**: Tested and configured for Railway & Vercel deployment

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Cache/Queue**: Redis, BullMQ
- **Real-time**: WebSockets
- **Validation**: Joi
- **Logging**: Winston
- **Email**: Nodemailer
- **Deployment**: Docker, Railway, Vercel

## Project Structure

```
src/
├── config/          # Database, Redis, Queue configuration
├── routes/          # API route handlers
├── services/        # Business logic services
├── workers/         # BullMQ job processors (GPS, Alerts, Notifications)
├── models/          # Data models
├── utils/           # Helpers (haversine, validators, logger)
├── sockets/         # WebSocket management
├── middleware/      # Auth, validation, error handling
├── app.js           # Express app setup
└── index.js         # Server entry point
```

## Quick Start

### Easiest Setup (Recommended)
```bash
./setup.sh
```

### Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services:**
   ```bash
   # Using Docker Compose
   docker-compose up

   # Or directly with npm
   npm run dev
   ```

## Testing

Run the automated test suite:
```bash
./test-api.sh
```

Expected output:
```
✅ PASS - Health check returned 200
✅ PASS - Vehicles endpoint returned 200
✅ PASS - Invalid endpoint properly handled
✅ PASS - Response time: 14ms
✅ PASS - All 10 requests succeeded
```

## API Endpoints

### Health Check
- `GET /` - Server status

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/:id` - Get vehicle details
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### GPS Tracking
- `POST /api/gps` - Submit GPS data
- `GET /api/gps/:vehicleId` - Get GPS history

### Convoys
- `GET /api/convoys` - List all convoys
- `POST /api/convoys` - Create convoy
- `GET /api/convoys/:id` - Get convoy details

## Deployment

### Railway (Recommended)

Best for full-featured deployment with workers and real-time features.

```bash
# 1. Connect to Railway
# Import repository at https://railway.app

# 2. Set environment variables in Railway dashboard
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key

# 3. Railway auto-deploys on push
git push origin main
```

### Vercel (Static Frontend)

This repository includes a static frontend in `public/` that can be deployed to Vercel.
If you want the full API backend too, host the backend separately on Railway or Render.

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy the frontend
vercel --prod
```

Then set the backend API URL in `public/config.js`:
```js
window.API_ROOT = 'https://your-backend.example.com/api';
```

If the backend is hosted on the same domain, keep `window.API_ROOT = '/api'`.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide.

## Configuration

### Environment Variables

**Required:**
```env
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/convoy
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

**Optional:**
```env
DISABLE_REDIS=false          # Set to 'true' for Vercel or when no Redis service is available
GOOGLE_MAPS_API_KEY=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
```

> Note: In production, do not leave `REDIS_URL=redis://127.0.0.1:6379` unless Redis is running in the same runtime. If Redis is unavailable, set `DISABLE_REDIS=true`.

See `.env.example` for all options.

## Docker Setup

### Using Docker Compose

```bash
# Start all services (app, postgres, redis)
docker-compose up

# Start background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t fleet-management .

# Run container
docker run -p 5000:5000 fleet-management
```

## Known Issues - FIXED ✅

### ✅ Redis Connection Error (RESOLVED)
**Problem**: `ECONNREFUSED 127.0.0.1:6379`
**Solution**: 
- Installed Redis locally: `sudo apt install redis-server`
- Configured proper connection string
- Added graceful fallback for Vercel deployments

### ✅ Database Connection (VERIFIED)
**Status**: Working - automatic table creation on startup

### ✅ Port Conflicts (RESOLVED)
**Solution**: Proper process cleanup and port management

## Troubleshooting

### Redis Not Running
```bash
sudo service redis-server restart
redis-cli ping  # Should respond: PONG
```

### Port 5000 Already in Use
```bash
lsof -i :5000
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -h localhost -U postgres

# Create database
createdb -h localhost -U postgres convoy
```

### Clear Everything and Start Fresh
```bash
# Kill all node processes
pkill -f "node"

# Remove logs
rm -f *.log

# Restart services
npm run dev
```

## Performance

- **API Response Time**: ~14ms average
- **Throughput**: 10+ requests/second sustained
- **Database Connections**: Connection pooling with 20 max connections
- **Redis Connections**: Optimized for BullMQ with retry logic

## Production Checklist

- [ ] Redis running and accessible
- [ ] PostgreSQL backups configured
- [ ] JWT_SECRET set to secure value
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Health endpoint responding
- [ ] API tests passing
- [ ] Workers initializing
- [ ] Logs configured and monitored
- [ ] CORS configured for frontend
- [ ] Error monitoring enabled

## Getting Help

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
2. Review logs: `docker-compose logs -f`
3. Test API: `./test-api.sh`
4. Review `.env` configuration

## License

ISC
   - `JWT_SECRET` (generate a secure secret)
   - `NODE_ENV=production`
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` (for email alerts)

3. **Deploy:**
   Railway will build and deploy automatically on push.

## Testing

### GPS Pipeline Test
```bash
curl -X POST http://localhost:5000/api/gps \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "1",
    "lat": 40.7128,
    "lng": -74.0060,
    "speed": 130,
    "timestamp": "2024-01-01T12:00:00Z"
  }'
```

### WebSocket Test
Connect to `ws://localhost:5000` and listen for real-time updates.

## Architecture

### Pipeline Flow
1. **Input**: GPS data received via API
2. **Validation**: Joi schema validation
3. **Queue**: Job added to BullMQ queue
4. **Worker**: Background processing
5. **Decision Logic**: Alert generation
6. **Output**: Database storage + WebSocket broadcast + Notifications

### Reliability Features
- Queue retries with exponential backoff
- Database connection pooling
- Error logging and monitoring
- Graceful failure handling
- Health checks for deployment

## Contributing

1. Follow the pipeline-first architecture
2. Add proper error handling and logging
3. Test thoroughly before committing
4. Update documentation as needed

## License

ISC