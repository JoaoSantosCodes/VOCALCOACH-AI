import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { request } from '../../setup/integration.setup';
import { readFileSync } from 'fs';
import path from 'path';

describe('Voice Exercise Integration Tests', () => {
  const voiceEndpoint = '/api/voice/exercise';
  const mockAudioBlob = new Blob(['mock audio data'], { type: 'audio/webm' });
  
  const mockExerciseData = {
    userId: 'test-user-123',
    exerciseId: 'exercise-123',
    audioData: mockAudioBlob,
    metrics: {
      pitch: 440,
      volume: 0.75,
      clarity: 0.85,
      snr: 15,
      duration: 30
    }
  };

  describe('Voice Recording', () => {
    it('should validate audio format and quality', async () => {
      const response = await request
        .post(`${voiceEndpoint}/validate`)
        .attach('audio', mockAudioBlob, 'recording.webm')
        .field('metrics', JSON.stringify(mockExerciseData.metrics));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isValid', true);
      expect(response.body).toHaveProperty('quality');
      expect(response.body.quality).toBeGreaterThan(0.7);
    });

    it('should reject invalid audio format', async () => {
      const invalidBlob = new Blob(['invalid data'], { type: 'audio/invalid' });
      
      const response = await request
        .post(`${voiceEndpoint}/validate`)
        .attach('audio', invalidBlob, 'invalid.mp3')
        .field('metrics', JSON.stringify(mockExerciseData.metrics));

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/formato de áudio inválido/i);
    });

    it('should handle corrupted audio data', async () => {
      const corruptedBlob = new Blob(['corrupted'], { type: 'audio/webm' });
      
      const response = await request
        .post(`${voiceEndpoint}/validate`)
        .attach('audio', corruptedBlob, 'corrupted.webm')
        .field('metrics', JSON.stringify(mockExerciseData.metrics));

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/áudio corrompido/i);
    });
  });

  describe('Real-time Analysis', () => {
    it('should process audio stream and return metrics', async () => {
      const response = await request
        .post(`${voiceEndpoint}/analyze-stream`)
        .send({
          audioChunk: Buffer.from('mock audio chunk'),
          timestamp: Date.now()
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pitch');
      expect(response.body).toHaveProperty('volume');
      expect(response.body).toHaveProperty('clarity');
      expect(response.body).toHaveProperty('snr');
      expect(response.body.pitch).toBeGreaterThan(0);
    });

    it('should detect silence in audio stream', async () => {
      const response = await request
        .post(`${voiceEndpoint}/analyze-stream`)
        .send({
          audioChunk: Buffer.from('silence'),
          timestamp: Date.now()
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isSilence', true);
      expect(response.body.volume).toBeLessThan(0.1);
    });
  });

  describe('Exercise Progress', () => {
    it('should save exercise progress', async () => {
      const response = await request
        .post(`${voiceEndpoint}/save-progress`)
        .send({
          userId: mockExerciseData.userId,
          exerciseId: mockExerciseData.exerciseId,
          progress: {
            completionRate: 0.75,
            score: 85,
            metrics: mockExerciseData.metrics,
            timestamp: Date.now()
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('saved', true);
      expect(response.body).toHaveProperty('progressId');
    });

    it('should handle offline progress sync', async () => {
      const offlineProgress = {
        userId: mockExerciseData.userId,
        exerciseId: mockExerciseData.exerciseId,
        progress: [{
          completionRate: 0.6,
          score: 75,
          metrics: mockExerciseData.metrics,
          timestamp: Date.now() - 3600000 // 1 hour ago
        }, {
          completionRate: 0.8,
          score: 90,
          metrics: mockExerciseData.metrics,
          timestamp: Date.now()
        }]
      };

      const response = await request
        .post(`${voiceEndpoint}/sync-progress`)
        .send(offlineProgress);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('synced', true);
      expect(response.body.syncedCount).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      const response = await request
        .post(`${voiceEndpoint}/analyze-stream`)
        .send({
          audioChunk: null,
          timestamp: 'invalid'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('retryAfter');
    });

    it('should handle rate limiting', async () => {
      // Fazer múltiplas requisições rapidamente
      const requests = Array(10).fill(null).map(() => 
        request
          .post(`${voiceEndpoint}/analyze-stream`)
          .send({
            audioChunk: Buffer.from('test'),
            timestamp: Date.now()
          })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should process audio within acceptable time', async () => {
      const start = Date.now();
      
      const response = await request
        .post(`${voiceEndpoint}/analyze-stream`)
        .send({
          audioChunk: Buffer.from('performance test'),
          timestamp: Date.now()
        });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // menos de 100ms
      expect(response.status).toBe(200);
    });

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 5;
      const start = Date.now();
      
      const requests = Array(concurrentRequests).fill(null).map(() => 
        request
          .post(`${voiceEndpoint}/analyze-stream`)
          .send({
            audioChunk: Buffer.from('concurrent test'),
            timestamp: Date.now()
          })
      );

      const responses = await Promise.all(requests);
      const duration = Date.now() - start;
      
      expect(responses.every(r => r.status === 200)).toBe(true);
      expect(duration).toBeLessThan(200); // menos de 200ms para todas
    });
  });
}); 