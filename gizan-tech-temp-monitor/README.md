# GizanTech Temperature Monitoring System

A full-stack application for real-time temperature monitoring, built as part of the GizanTech Web Developer recruitment process.

## Features

- **Backend API**
  - RESTful API for temperature data
  - WebSocket support for real-time updates
  - Rate limiting (100 requests/second)
  - Comprehensive logging

- **Frontend Dashboard**
  - Real-time temperature visualization
  - Responsive design
  - Connection status monitoring
  - Error handling and loading states

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd gizan-tech-temp-monitor
```

### 2. Set up the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm start
```

The backend server will start on `http://localhost:5000`

### 3. Set up the Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will open in your default browser at `http://localhost:3000`

## Project Structure

```
gizan-tech-temp-monitor/
├── backend/               # Backend server code
│   ├── src/
│   │   ├── __tests__/    # Test files
│   │   └── index.js       # Main server file
│   ├── .env               # Environment variables
│   └── package.json
│
└── frontend/             # Frontend React application
    ├── public/            # Static files
    ├── src/               # Source files
    │   ├── App.tsx       # Main component
    │   ├── App.css       # Styles
    │   ├── index.tsx     # Entry point
    │   └── index.css     # Global styles
    └── package.json
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /temperature` - Get current temperature data
- WebSocket - Real-time temperature updates

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Load Testing

To test the rate limiting and performance of the API, you can use a tool like [k6](https://k6.io/):

```bash
# Install k6 (if not already installed)
# See: https://k6.io/docs/get-started/installation/

# Run load test
k6 run load-test.js
```

## Deployment

### Backend

1. Set environment variables in production:
   ```
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend-url.com
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Frontend

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy the contents of the `build` directory to your hosting service.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
