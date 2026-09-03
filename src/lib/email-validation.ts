import * as dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// Admin emails that bypass email verification
const ADMIN_EMAILS = ['admin@eduguard.com'];

// Known valid email domains (major providers + common domains)
const KNOWN_VALID_DOMAINS = new Set([
  // Gmail
  'gmail.com',
  // Microsoft
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  // Yahoo
  'yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.com.au', 'yahoo.co.in',
  // Pakistan-specific
  'yahoo.com.pk',
  // ProtonMail
  'protonmail.com', 'proton.me', 'pm.me',
  // Other major providers
  'aol.com', 'icloud.com', 'mac.com', 'me.com',
  'zoho.com', 'yandex.com', 'gmx.com', 'mail.com',
  'tutanota.com', 'tutanota.de', 'fastmail.com',
  // Education
  'edu.pk',
]);

// Disposable/temporary email domains to block
const BLOCKED_DOMAINS = new Set([
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'guerrillamailblock.com',
  'mailinator.com', 'trashmail.com', 'trashmail.me', 'fakeinbox.com',
  'sharklasers.com', 'guerrillamail.info', 'grr.la', 'guerrillamail.net',
  'temp-mail.org', 'temp-mail.io', 'dispostable.com', 'yopmail.com',
  '10minutemail.com', 'maildrop.cc', 'tmpmail.net', 'tmpmail.org',
  'emailondeck.com', 'getnada.com', 'burnermail.io',
]);

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  requiresVerification: boolean;
}

/**
 * Validates an email address for registration:
 * 1. Checks format
 * 2. Checks if domain is blocked (disposable emails)
 * 3. Checks if domain is a known provider or has valid MX records
 * 4. Determines if email verification is required
 */
export async function validateEmailForRegistration(email: string): Promise<EmailValidationResult> {
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email address format', requiresVerification: false };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const domain = normalizedEmail.split('@')[1];

  if (!domain) {
    return { valid: false, error: 'Invalid email address', requiresVerification: false };
  }

  // Check if domain is blocked (disposable/temporary email)
  if (BLOCKED_DOMAINS.has(domain)) {
    return { valid: false, error: 'Disposable email addresses are not allowed. Please use a permanent email.', requiresVerification: false };
  }

  // Check if it's a known valid domain (major providers)
  const isKnownDomain = KNOWN_VALID_DOMAINS.has(domain);

  // If not a known domain, verify MX records exist
  if (!isKnownDomain) {
    try {
      const mxRecords = await resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return { valid: false, error: 'Email domain does not accept mail. Please use a valid email address.', requiresVerification: false };
      }
    } catch {
      return { valid: false, error: 'Could not verify email domain. Please check the email address or try a different provider (e.g., Gmail).', requiresVerification: false };
    }
  }

  // All valid emails require verification (except admin)
  const isAdminEmail = ADMIN_EMAILS.includes(normalizedEmail);

  return {
    valid: true,
    requiresVerification: !isAdminEmail,
  };
}

/**
 * Check if an email is an admin email (bypasses verification)
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}
