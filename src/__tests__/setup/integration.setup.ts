import { rest } from 'msw';
import { setupServer } from 'msw/node';
import supertest from 'supertest';
import { app } from '../../backend/src/server';

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Setup MSW server for API mocking
const server = setupServer();

// Setup supertest
export const request = supertest(app);

beforeAll(() => {
  // Start MSW server
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

afterEach(() => {
  // Reset MSW handlers
  server.resetHandlers();
});

afterAll(() => {
  // Close MSW server
  server.close();
});

// Global test utilities
global.createMockHandler = (path: string, method: 'get' | 'post' | 'put' | 'delete', response: any) => {
  return rest[method](path, (req, res, ctx) => {
    return res(ctx.json(response));
  });
};

// Mock Redis
jest.mock('ioredis', () => {
  const Redis = require('ioredis-mock');
  return Redis;
});

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test'; 