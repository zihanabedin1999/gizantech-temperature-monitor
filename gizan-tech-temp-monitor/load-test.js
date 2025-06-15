import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  // Simulate 1000 concurrent users
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000, // 1000 iterations per second
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 100, // Initial number of VUs to start with
      maxVUs: 1000, // Maximum number of VUs to use
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

// The base URL of your API
const BASE_URL = 'http://localhost:5000';

export default function () {
  // Test the temperature endpoint
  const res = http.get(`${BASE_URL}/temperature`);

  // Check if the response is successful or rate limited
  check(res, {
    'is status 200 or 429': (r) => r.status === 200 || r.status === 429,
  });

  // Add a small delay between requests
  sleep(0.1);
}
