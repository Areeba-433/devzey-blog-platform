import crypto from 'crypto';

export function voterIdFromIp(ip: string): string {
  const normalized = (ip || '').trim();
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  return `ip:${hash}`;
}

export function ipFromXForwardedFor(xff: string | null): string | null {
  if (!xff) return null;
  const first = xff.split(',')[0]?.trim();
  return first || null;
}

