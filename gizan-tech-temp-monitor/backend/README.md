# GizanTech Temperature Monitor - Backend

This is the backend service for the GizanTech Temperature Monitoring System. It provides a REST API for temperature data and real-time updates via WebSockets.

## Features

- REST API endpoint for temperature data
- Real-time updates via WebSockets
- Rate limiting (100 requests/second)
- Request logging
- CORS support
- Health check endpoint

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd gizan-tech-temp-monitor/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the backend directory (see `.env.example` for reference)

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

### GET /temperature
Get current temperature data.

**Response:**
```json
{
  "temperature": 28.75,
  "unit": "Celsius",
  "timestamp": "2024-06-15T12:00:00.000Z"
}
```

## Rate Limiting

The API is rate limited to 100 requests per second per IP address. If the limit is exceeded, the API will respond with a 429 status code.

## WebSocket Events

### Connection
Connect to the WebSocket server at `ws://localhost:5000`

### Events

#### temperatureUpdate
Eitted when new temperature data is available.

**Data:**
```json
{
  "temperature": 28.75,
  "unit": "Celsius",
  "timestamp": "2024-06-15T12:00:00.000Z"
}
```

## Testing

Run the test suite:
```bash
npm test
```

## Logging

Logs are stored in the following files:
- `error.log`: Error logs
- `combined.log`: All logs

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port to run the server on | 5000 |
| NODE_ENV | Node environment | development |
| FRONTEND_URL | URL of the frontend for CORS | http://localhost:3000 |
| RATE_LIMIT_WINDOW_MS | Rate limit window in milliseconds | 1000 |
| RATE_LIMIT_MAX_REQUESTS | Maximum requests per window | 100 |
