const request = require('supertest');
const { app, server, generateTemperatureData } = require('../index');

// Close the server after all tests are done
afterAll((done) => {
  server.close(done);
});

describe('GET /health', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GET /temperature', () => {
  it('should return temperature data with correct structure', async () => {
    const response = await request(app).get('/temperature');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('temperature');
    expect(response.body).toHaveProperty('unit', 'Celsius');
    expect(response.body).toHaveProperty('timestamp');
    
    // Check if temperature is within expected range
    expect(response.body.temperature).toBeGreaterThanOrEqual(15);
    expect(response.body.temperature).toBeLessThanOrEqual(45);
    
    // Check if timestamp is a valid ISO string
    expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
  });
});

describe('Rate Limiting', () => {
  const makeRequests = (count) => {
    const requests = [];
    for (let i = 0; i < count; i++) {
      requests.push(request(app).get('/temperature'));
    }
    return Promise.all(requests);
  };

  it('should allow up to 100 requests per second', async () => {
    // Make 100 requests (just under the limit)
    const responses = await makeRequests(100);
    
    // All responses should be successful
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  }, 10000);

  it('should return 429 for requests exceeding the rate limit', async () => {
    // Make 110 requests (10 over the limit)
    const responses = await makeRequests(110);
    
    // Count successful and rate-limited responses
    const statuses = responses.map(r => r.status);
    const successCount = statuses.filter(s => s === 200).length;
    const rateLimitedCount = statuses.filter(s => s === 429).length;
    
    // Should have exactly 100 successful responses and 10 rate-limited responses
    expect(successCount).toBe(100);
    expect(rateLimitedCount).toBe(10);
  }, 15000);
});

describe('generateTemperatureData', () => {
  it('should generate temperature data within the correct range', () => {
    for (let i = 0; i < 1000; i++) {
      const data = generateTemperatureData();
      expect(data.temperature).toBeGreaterThanOrEqual(15);
      expect(data.temperature).toBeLessThanOrEqual(45);
      expect(data.unit).toBe('Celsius');
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    }
  });
});
