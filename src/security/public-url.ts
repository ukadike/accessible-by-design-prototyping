import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const blockedHostSuffixes = ['.localhost', '.local', '.internal', '.test', '.invalid'];

function isPublicIpv4(address: string): boolean {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;

  const [a, b, c] = parts;
  if (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113)
  ) {
    return false;
  }
  return true;
}

function isPublicIpv6(address: string): boolean {
  const normalized = address.toLowerCase();
  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.slice('::ffff:'.length);
    if (isIP(mapped) === 4) return isPublicIpv4(mapped);
  }

  const firstGroup = Number.parseInt(normalized.split(':', 1)[0] || '0', 16);
  // Public IPv6 unicast is within 2000::/3. Exclude documentation, ORCHID,
  // and 6to4 ranges, plus anything that failed the global-unicast check.
  return (
    firstGroup >= 0x2000 &&
    firstGroup <= 0x3fff &&
    !normalized.startsWith('2001:db8:') &&
    !normalized.startsWith('2001:10:') &&
    !normalized.startsWith('2002:')
  );
}

export function isPublicIpAddress(address: string): boolean {
  const version = isIP(address);
  return version === 4 ? isPublicIpv4(address) : version === 6 ? isPublicIpv6(address) : false;
}

const hostCheckCache = new Map<string, Promise<boolean>>();

async function hostResolvesPublicly(hostname: string): Promise<boolean> {
  const host = hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase();
  if (
    !host ||
    host === 'localhost' ||
    blockedHostSuffixes.some((suffix) => host.endsWith(suffix)) ||
    host === 'metadata.google.internal' ||
    host === 'metadata.azure.internal'
  ) {
    return false;
  }

  const literalVersion = isIP(host);
  if (literalVersion) return isPublicIpAddress(host);

  const cached = hostCheckCache.get(host);
  if (cached) return cached;

  const check = lookup(host, { all: true, verbatim: true })
    .then((records) => records.length > 0 && records.every(({ address }) => isPublicIpAddress(address)))
    .catch(() => false);
  hostCheckCache.set(host, check);
  return check;
}

/** Returns true only for public HTTP(S) destinations. Used by the GitHub-hosted audit workflow. */
export async function isPublicWebUrl(input: string): Promise<boolean> {
  try {
    const url = new URL(input);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return false;
    if (url.port && !['80', '443'].includes(url.port)) return false;
    return await hostResolvesPublicly(url.hostname);
  } catch {
    return false;
  }
}
