import type { RequestHandler } from 'express';

type RateBucket = { count: number; resetAt: number };

type UserRateLimitOptions = {
  max: number;
  windowMs: number;
  message: string;
};

export function createUserRateLimit({ max, windowMs, message }: UserRateLimitOptions): RequestHandler {
  const buckets = new Map<string, RateBucket>();

  return (request, response, next) => {
    const userId = request.user?.id;
    if (!userId) {
      response.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const now = Date.now();
    const current = buckets.get(userId);
    const bucket = !current || current.resetAt <= now
      ? { count: 1, resetAt: now + windowMs }
      : { count: current.count + 1, resetAt: current.resetAt };
    buckets.set(userId, bucket);

    response.set('RateLimit-Limit', String(max));
    response.set('RateLimit-Remaining', String(Math.max(max - bucket.count, 0)));
    response.set('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      response.set('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      response.status(429).json({ error: message });
      return;
    }

    if (buckets.size > 5_000) {
      for (const [key, value] of buckets) {
        if (value.resetAt <= now) buckets.delete(key);
      }
    }

    next();
  };
}
