import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validateRequest } from '@/lib/utils';
import { validateEmailForRegistration } from '@/lib/email-validation';
import { emailVerificationService } from '@/services/email/email-verification.service';
import { checkRateLimit, AUTH_RATE_LIMITS } from '@/lib/rate-limit';
import { z } from 'zod';

const sendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  country: z.string().optional(),
  preferredLanguage: z.enum(['auto', 'english', 'roman_urdu', 'urdu']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = checkRateLimit(`send-verification:${clientIp}`, AUTH_RATE_LIMITS.register);
    if (!rateLimit.allowed) {
      return errorResponse('Too many requests. Please try again later.', 'RATE_LIMITED', 429);
    }

    // Validate input
    const body = await request.json();
    const validation = validateRequest(sendVerificationSchema, body);
    if (!validation.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, validation.errors);
    }

    // Validate email (format, domain, MX records)
    const emailValidation = await validateEmailForRegistration(validation.data.email);
    if (!emailValidation.valid) {
      return errorResponse(emailValidation.error || 'Invalid email address', 'INVALID_EMAIL', 400);
    }

    // If admin email, skip verification — proceed with normal registration
    if (!emailValidation.requiresVerification) {
      return successResponse({ requiresVerification: false });
    }

    // Send verification code (creates user as inactive)
    const result = await emailVerificationService.sendVerificationCode(validation.data);

    return successResponse({
      requiresVerification: true,
      userId: result.userId,
      email: validation.data.email,
      message: 'A verification code has been sent to your email. Please check your inbox.',
    }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send verification code';
    return errorResponse(message, 'SEND_VERIFICATION_FAILED', 400);
  }
}
