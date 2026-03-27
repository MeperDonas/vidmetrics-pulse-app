interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

interface RateLimiter {
  check: (ip: string) => RateLimitResult;
}

export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  const store = new Map<string, number[]>();

  // Periodic cleanup to prevent memory leaks from unique IPs
  const cleanup = () => {
    const now = Date.now();
    for (const [ip, timestamps] of store.entries()) {
      const valid = timestamps.filter((t) => now - t < config.windowMs);
      if (valid.length === 0) {
        store.delete(ip);
      } else {
        store.set(ip, valid);
      }
    }
  };
  setInterval(cleanup, 5 * 60 * 1000);

  return {
    check(ip: string): RateLimitResult {
      const now = Date.now();
      const timestamps = store.get(ip) ?? [];
      const valid = timestamps.filter((t) => now - t < config.windowMs);

      if (valid.length >= config.maxRequests) {
        const oldest = valid[0];
        return {
          allowed: false,
          remaining: 0,
          resetMs: oldest + config.windowMs - now,
        };
      }

      valid.push(now);
      store.set(ip, valid);

      return {
        allowed: true,
        remaining: config.maxRequests - valid.length,
        resetMs: 0,
      };
    },
  };
}
