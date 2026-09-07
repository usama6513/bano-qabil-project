import { describe, it, expect, beforeEach } from 'vitest';
import { UrlAnalyzer } from '@/services/fraud/url-analyzer';

describe('URL Analyzer', { timeout: 30000 }, () => {
  let analyzer: UrlAnalyzer;

  beforeEach(() => {
    analyzer = new UrlAnalyzer();
  });

  describe('analyzeUrl', () => {
    it('detects non-HTTPS URLs', async () => {
      const result = await analyzer.analyzeUrl('http://example.com/page');
      expect(result.isHttps).toBe(false);
      const noHttps = result.indicators.find((i) => i.indicator === 'NO_HTTPS');
      expect(noHttps).toBeDefined();
      expect(noHttps!.severity).toBe('medium');
    });

    it('does not flag HTTPS URLs', async () => {
      const result = await analyzer.analyzeUrl('https://example.com/page');
      expect(result.isHttps).toBe(true);
      const noHttps = result.indicators.find((i) => i.indicator === 'NO_HTTPS');
      expect(noHttps).toBeUndefined();
    });

    it('detects URL shorteners', async () => {
      const result = await analyzer.analyzeUrl('https://bit.ly/abc123');
      const shortener = result.indicators.find(
        (i) => i.indicator === 'URL_SHORTENER'
      );
      expect(shortener).toBeDefined();
      expect(shortener!.severity).toBe('medium');
    });

    it('detects lookalike domains', async () => {
      const result = await analyzer.analyzeUrl('https://paypa1-secure.com/login');
      const lookalike = result.indicators.find(
        (i) => i.indicator === 'LOOKALIKE_DOMAIN' || i.indicator === 'TYPOSQUAT_DOMAIN'
      );
      expect(lookalike).toBeDefined();
    });

    it('returns high risk for invalid URLs', async () => {
      const result = await analyzer.analyzeUrl('not-a-valid-url');
      expect(result.riskLevel).toBe('high');
      expect(result.indicators.length).toBeGreaterThan(0);
    });

    it('detects IP address URLs', async () => {
      const result = await analyzer.analyzeUrl('http://203.0.113.50/admin');
      const ipIndicator = result.indicators.find(
        (i) => i.indicator === 'IP_ADDRESS_URL'
      );
      expect(ipIndicator).toBeDefined();
    });

    it('detects blocked hosts', async () => {
      const result = await analyzer.analyzeUrl('http://169.254.169.254/metadata');
      const blocked = result.indicators.find(
        (i) => i.indicator === 'BLOCKED_HOST'
      );
      expect(blocked).toBeDefined();
      expect(blocked!.severity).toBe('critical');
    });

    it('detects unusual ports', async () => {
      const result = await analyzer.analyzeUrl('https://example.com:8443/path');
      const portIndicator = result.indicators.find(
        (i) => i.indicator === 'UNUSUAL_PORT'
      );
      expect(portIndicator).toBeDefined();
    });

    it('does not flag standard ports', async () => {
      const result = await analyzer.analyzeUrl('https://example.com:443/path');
      const portIndicator = result.indicators.find(
        (i) => i.indicator === 'UNUSUAL_PORT'
      );
      expect(portIndicator).toBeUndefined();
    });

    it('returns safe risk level for clean HTTPS URLs', async () => {
      const result = await analyzer.analyzeUrl('https://google.com');
      expect(['safe', 'low']).toContain(result.riskLevel);
    });
  });

  describe('parseUrl', () => {
    it('correctly extracts domain, subdomain, TLD', () => {
      const parsed = analyzer.parseUrl('https://www.example.com/path');
      expect(parsed.domain).toBe('example');
      expect(parsed.subdomain).toBe('www');
      expect(parsed.tld).toBe('com');
    });

    it('handles URLs without subdomain', () => {
      const parsed = analyzer.parseUrl('https://example.com/path');
      expect(parsed.domain).toBe('example');
      expect(parsed.subdomain).toBe('');
      expect(parsed.tld).toBe('com');
    });

    it('handles multi-level subdomains', () => {
      const parsed = analyzer.parseUrl('https://a.b.c.example.com/path');
      expect(parsed.domain).toBe('example');
      expect(parsed.subdomain).toBe('a.b.c');
      expect(parsed.tld).toBe('com');
    });

    it('handles .co.uk style TLDs', () => {
      const parsed = analyzer.parseUrl('https://example.co.uk/path');
      expect(parsed.domain).toBe('co');
      expect(parsed.tld).toBe('uk');
    });

    it('returns empty strings for invalid URLs', () => {
      const parsed = analyzer.parseUrl('not-a-url');
      expect(parsed.domain).toBe('');
      expect(parsed.subdomain).toBe('');
      expect(parsed.tld).toBe('');
    });
  });

  describe('calculateRiskScore', () => {
    it('returns 0 for empty indicators', () => {
      const score = analyzer.calculateRiskScore([]);
      expect(score).toBe(0);
    });

    it('calculates correct score for medium indicators', () => {
      const score = analyzer.calculateRiskScore([
        { indicator: 'test', severity: 'medium', description: 'test' },
      ]);
      expect(score).toBe(8);
    });

    it('calculates correct score for high indicators', () => {
      const score = analyzer.calculateRiskScore([
        { indicator: 'test', severity: 'high', description: 'test' },
      ]);
      expect(score).toBe(15);
    });

    it('calculates correct score for critical indicators', () => {
      const score = analyzer.calculateRiskScore([
        { indicator: 'test', severity: 'critical', description: 'test' },
      ]);
      expect(score).toBe(25);
    });

    it('calculates correct score for low indicators', () => {
      const score = analyzer.calculateRiskScore([
        { indicator: 'test', severity: 'low', description: 'test' },
      ]);
      expect(score).toBe(3);
    });

    it('caps score at 100', () => {
      const manyCritical = Array.from({ length: 10 }, () => ({
        indicator: 'test',
        severity: 'critical' as const,
        description: 'test',
      }));
      const score = analyzer.calculateRiskScore(manyCritical);
      expect(score).toBe(100);
    });
  });

  describe('checkUrlShortener', () => {
    it('detects bit.ly', () => {
      const result = analyzer.checkUrlShortener('https://bit.ly/abc123');
      expect(result).not.toBeNull();
      expect(result!.indicator).toBe('URL_SHORTENER');
    });

    it('detects tinyurl.com', () => {
      const result = analyzer.checkUrlShortener('https://tinyurl.com/xyz');
      expect(result).not.toBeNull();
    });

    it('detects t.co', () => {
      const result = analyzer.checkUrlShortener('https://t.co/abc');
      expect(result).not.toBeNull();
    });

    it('returns null for non-shortener domains', () => {
      const result = analyzer.checkUrlShortener('https://google.com');
      expect(result).toBeNull();
    });

    it('returns null for invalid URLs', () => {
      const result = analyzer.checkUrlShortener('not-a-url');
      expect(result).toBeNull();
    });
  });

  // checkLookalikeDomain — REMOVED: AI classifies domain reputation from evidence
});
