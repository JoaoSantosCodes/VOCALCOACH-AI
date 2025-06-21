import { prisma } from '../config/database';
import { Redis } from 'ioredis';
import { createHash } from 'crypto';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class AnomalyDetectionService {
  private static readonly RATE_WINDOW = 3600; // 1 hora
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly SUSPICIOUS_IP_THRESHOLD = 10;
  private static readonly UNUSUAL_ACTIVITY_THRESHOLD = 50;

  // Detecta tentativas de força bruta
  static async detectBruteForce(userId: string, ip: string): Promise<boolean> {
    const key = `bruteforce:${userId}:${ip}`;
    const attempts = await redis.incr(key);
    await redis.expire(key, this.RATE_WINDOW);

    if (attempts > this.MAX_FAILED_ATTEMPTS) {
      await this.flagSuspiciousActivity(userId, ip, 'brute_force');
      return true;
    }

    return false;
  }

  // Detecta acesso de localizações suspeitas
  static async detectSuspiciousLocation(
    userId: string,
    ip: string,
    userAgent: string
  ): Promise<boolean> {
    const key = `location:${userId}`;
    const knownLocations = await redis.smembers(key);
    const locationHash = this.hashLocation(ip, userAgent);

    if (!knownLocations.includes(locationHash)) {
      await redis.sadd(key, locationHash);
      
      // Se muitas localizações diferentes em pouco tempo
      if (knownLocations.length >= this.SUSPICIOUS_IP_THRESHOLD) {
        await this.flagSuspiciousActivity(userId, ip, 'suspicious_location');
        return true;
      }
    }

    return false;
  }

  // Detecta atividade incomum baseada em padrões
  static async detectUnusualActivity(
    userId: string,
    action: string
  ): Promise<boolean> {
    const key = `activity:${userId}:${action}`;
    const count = await redis.incr(key);
    await redis.expire(key, this.RATE_WINDOW);

    if (count > this.UNUSUAL_ACTIVITY_THRESHOLD) {
      await this.flagSuspiciousActivity(userId, 'system', 'unusual_activity');
      return true;
    }

    return false;
  }

  // Detecta padrões de comportamento anômalo
  static async detectAnomalousBehavior(
    userId: string,
    action: string,
    metadata: any
  ): Promise<boolean> {
    const key = `behavior:${userId}:${action}`;
    const pattern = JSON.stringify(metadata);
    
    // Armazena padrões de comportamento
    await redis.lpush(key, pattern);
    await redis.ltrim(key, 0, 99); // Mantém apenas os últimos 100 padrões
    
    const patterns = await redis.lrange(key, 0, -1);
    const anomalyScore = this.calculateAnomalyScore(pattern, patterns);
    
    if (anomalyScore > 0.8) { // 80% de desvio do padrão normal
      await this.flagSuspiciousActivity(userId, 'system', 'anomalous_behavior');
      return true;
    }

    return false;
  }

  // Registra atividade suspeita
  private static async flagSuspiciousActivity(
    userId: string,
    source: string,
    type: string
  ): Promise<void> {
    await prisma.securityAlert.create({
      data: {
        userId,
        source,
        type,
        timestamp: new Date(),
        metadata: {
          detectedBy: 'anomaly_detection_service',
        },
      },
    });

    // Notifica sistemas de monitoramento
    await this.notifySecurityTeam(userId, type, source);
  }

  // Calcula pontuação de anomalia baseada em padrões históricos
  private static calculateAnomalyScore(
    currentPattern: string,
    historicalPatterns: string[]
  ): number {
    if (historicalPatterns.length < 10) return 0;

    const patternCount = historicalPatterns.filter(
      p => p === currentPattern
    ).length;

    return 1 - patternCount / historicalPatterns.length;
  }

  // Hash de localização para privacidade
  private static hashLocation(ip: string, userAgent: string): string {
    return createHash('sha256')
      .update(`${ip}:${userAgent}`)
      .digest('hex');
  }

  // Notifica equipe de segurança
  private static async notifySecurityTeam(
    userId: string,
    type: string,
    source: string
  ): Promise<void> {
    // Implementar notificação (email, Slack, etc.)
    console.warn(`Security Alert: ${type} detected for user ${userId} from ${source}`);
  }
} 