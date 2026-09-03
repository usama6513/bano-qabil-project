import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { emailVerificationService } from '@/services/email/email-verification.service';
import { checkRateLimit, AUTH_RATE_LIMITS } from '@/lib/rate-limit';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = checkRateLimit(`verify-email:${clientIp}`, AUTH_RATE_LIMITS.register);
    if (!rateLimit.allowed) {
      return errorResponse('Too many attempts. Please try again later.', 'RATE_LIMITED', 429);
    }

    // Validate input
    const body = await request.json();
    const parsed = verifyEmailSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, errors);
    }

    // Verify the code
    const result = await emailVerificationService.verifyCode(parsed.data);

    if (!result) {
      return errorResponse('Invalid or expired verification code. Please check the code or request a new one.', 'INVALID_CODE', 400);
    }

    return successResponse({
      user: result.user,
      tokens: result.tokens,
      message: 'Email verified successfully! Your account is now active.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify email';
    return errorResponse(message, 'VERIFY_EMAIL_FAILED', 400);
  }
}
