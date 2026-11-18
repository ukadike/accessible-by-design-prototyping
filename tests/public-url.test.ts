import { describe, expect, it } from 'vitest';
import { isPublicIpAddress, isPublicWebUrl } from '../src/security/public-url.js';

describe('GitHub-hosted website audit address checks', () => {
  it('allows public IPv4 and IPv6 addresses', () => {
    expect(isPublicIpAddress('8.8.8.8')).toBe(true);
    expect(isPublicIpAddress('2606:4700:4700::1111')).toBe(true);
  });

  it('rejects private, loopback, link-local, and reserved IPv4 ranges', () => {
    for (const address of [
      '0.0.0.0',
      '10.1.2.3',
      '127.0.0.1',
      '169.254.169.254',
      '172.16.0.1',
      '192.168.1.1',
      '100.64.0.1',
      '198.18.0.1',
      '203.0.113.5',
      '224.0.0.1',
    ]) {
      expect(isPublicIpAddress(address), address).toBe(false);
    }
  });

  it('rejects non-global IPv6 ranges', () => {
    for (const address of ['::1', 'fc00::1', 'fd00::1', 'fe80::1', '2001:db8::1', '2002::1']) {
      expect(isPublicIpAddress(address), address).toBe(false);
    }
  });

  it('rejects local, credential-bearing, and non-web URLs before DNS lookup', async () => {
    for (const url of [
      'file:///etc/passwd',
      'ftp://example.com/',
      'http://localhost/',
      'http://127.0.0.1/',
      'http://169.254.169.254/',
      'https://user:password@example.com/',
      'https://example.com:8080/',
    ]) {
      await expect(isPublicWebUrl(url), url).resolves.toBe(false);
    }
  });
});
