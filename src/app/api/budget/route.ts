import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { budgetService } from '@/services/budget/budget.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const [profile, summary] = await Promise.all([
      budgetService.getBudgetProfile(auth.user.userId),
      budgetService.getBudgetSummary(auth.user.userId),
    ]);

    return successResponse({ profile, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'BUDGET_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { monthlyIncome, currency, savingsGoal, profileType, city, familySize, monthlyRent } = body;

    if (!monthlyIncome || !currency) {
      return errorResponse('monthlyIncome and currency are required', 'VALIDATION_ERROR', 400);
    }

    const profile = await budgetService.createBudgetProfile(auth.user.userId, {
      monthlyIncome,
      currency,
      savingsGoal,
      profileType,
      city,
      familySize,
      monthlyRent,
    });

    return successResponse(profile, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'BUDGET_CREATE_FAILED', 500);
  }
}
