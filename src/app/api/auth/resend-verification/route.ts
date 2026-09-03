import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { emailVerificationService } from '@/services/email/email-verification.service';
import { checkRateLimit, AUTH_RATE_LIMITS } from '@/lib/rate-limit';
import { z } from 'zod';

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = checkRateLimit(`resend-verification:${clientIp}`, AUTH_RATE_LIMITS.register);
    if (!rateLimit.allowed) {
      return errorResponse('Too many requests. Please try again later.', 'RATE_LIMITED', 429);
    }

    const body = await request.json();
    const parsed = resendSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Invalid email address', 'VALIDATION_ERROR', 400);
    }

    const result = await emailVerificationService.resendVerificationCode(parsed.data.email);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to resend verification code', 'RESEND_FAILED', 400);
    }

    return successResponse({
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to resend verification code';
    return errorResponse(message, 'RESEND_VERIFICATION_FAILED', 400);
  }
}
