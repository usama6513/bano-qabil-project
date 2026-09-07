import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { analyzePhoneNumber } from '@/services/fraud/phone-analyzer';
import { lookupPhoneRealtime } from '@/services/fraud/phone-lookup';

// Extend timeout for phone scanning (realtime API calls)
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { phone } = body as { phone: string };

    if (!phone || typeof phone !== 'string') {
      return errorResponse('Phone number is required', 'VALIDATION_ERROR', 400);
    }

    const cleaned = phone.replace(/[\s\-\(\)\+\.]/g, '');
    if (cleaned.length < 5 || cleaned.length > 15) {
      return errorResponse('Invalid phone number length', 'VALIDATION_ERROR', 400);
    }

    let liveData = null;
    try {
      liveData = await lookupPhoneRealtime(phone);
    } catch {
      // Live lookup failed, continue with static analysis
    }

    const result = await analyzePhoneNumber(phone, liveData);
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'PHONE_SCAN_FAILED', 500);
  }
}
