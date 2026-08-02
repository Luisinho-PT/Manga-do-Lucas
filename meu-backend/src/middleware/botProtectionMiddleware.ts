import type { RequestHandler } from 'express';

const AUTOMATED_USER_AGENT = /bot|crawler|spider|scraper|slurp|bingpreview|facebookexternalhit|python-requests|python-urllib|wget|curl|go-http-client|headlesschrome|phantomjs|selenium/i;
const WINDOW_MS = 60_000;
const MAX_READS_PER_WINDOW = 80;

type RateBucket = { count: number; resetAt: number };
const buckets = new Map<string, RateBucket>();

const botProtectionMiddleware: RequestHandler = (request, response, next) => {
  if (request.method === 'HEAD' || request.path === '/api/teste' || request.path === '/api/health') {
    next();
    return;
  }

  const userAgent = request.get('user-agent') || '';
  if (AUTOMATED_USER_AGENT.test(userAgent)) {
    response.set('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex, nosnippet');
    response.status(403).json({ error: 'Acesso automatizado não permitido.' });
    return;
  }

  if (request.method !== 'GET') {
    next();
    return;
  }

  const now = Date.now();
  const key = request.ip || request.socket.remoteAddress || 'unknown';
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 1, resetAt: now + WINDOW_MS }
    : { count: current.count + 1, resetAt: current.resetAt };
  buckets.set(key, bucket);

  response.set('RateLimit-Limit', String(MAX_READS_PER_WINDOW));
  response.set('RateLimit-Remaining', String(Math.max(MAX_READS_PER_WINDOW - bucket.count, 0)));
  response.set('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
  response.set('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex, nosnippet');

  if (bucket.count > MAX_READS_PER_WINDOW) {
    response.set('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    response.status(429).json({ error: 'Muitas requisições. Tente novamente em instantes.' });
    return;
  }

  if (buckets.size > 5_000) {
    for (const [bucketKey, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  next();
};

export default botProtectionMiddleware;
