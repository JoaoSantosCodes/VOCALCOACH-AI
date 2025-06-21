import { request } from '../../setup/integration.setup';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

describe('Login Flow Integration Tests', () => {
  const loginEndpoint = '/api/auth/login';
  const mockUser = {
    email: 'test@example.com',
    password: 'Test@123',
  };

  describe('Login Validation', () => {
    it('should validate email format', async () => {
      const response = await request
        .post(loginEndpoint)
        .send({ ...mockUser, email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0]).toHaveProperty('param', 'email');
    });

    it('should validate password requirements', async () => {
      const response = await request
        .post(loginEndpoint)
        .send({ ...mockUser, password: '123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0]).toHaveProperty('param', 'password');
    });
  });

  describe('Login Authentication', () => {
    it('should return JWT token on successful login', async () => {
      const response = await request
        .post(loginEndpoint)
        .send(mockUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it('should handle invalid credentials', async () => {
      const response = await request
        .post(loginEndpoint)
        .send({ ...mockUser, password: 'WrongPassword@123' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('Rate Limiting', () => {
    it('should block after multiple failed attempts', async () => {
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await request
          .post(loginEndpoint)
          .send({ ...mockUser, password: 'WrongPassword@123' });
      }

      // This attempt should be blocked
      const response = await request
        .post(loginEndpoint)
        .send(mockUser);

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/too many requests/i);
    });
  });

  describe('2FA Flow', () => {
    it('should require 2FA token when enabled', async () => {
      // First login step
      const loginResponse = await request
        .post(loginEndpoint)
        .send(mockUser);

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('requires2FA', true);
      expect(loginResponse.body).toHaveProperty('tempToken');

      // Verify 2FA step
      const verify2FAResponse = await request
        .post('/api/auth/verify-2fa')
        .set('Authorization', `Bearer ${loginResponse.body.tempToken}`)
        .send({ token: '123456' });

      expect(verify2FAResponse.status).toBe(200);
      expect(verify2FAResponse.body).toHaveProperty('token');
    });
  });

  describe('Session Management', () => {
    it('should handle concurrent sessions correctly', async () => {
      // First login
      const firstLogin = await request
        .post(loginEndpoint)
        .send(mockUser);

      // Second login from different device
      const secondLogin = await request
        .post(loginEndpoint)
        .send(mockUser)
        .set('User-Agent', 'Different Device');

      expect(firstLogin.status).toBe(200);
      expect(secondLogin.status).toBe(200);
      expect(firstLogin.body.token).not.toBe(secondLogin.body.token);
    });
  });
}); 