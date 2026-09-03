import { NextRequest } from 'next/server';
import { requireRole, getClientInfo } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { SystemAdminService } from '@/services/admin/system-admin.service';

const VALID_ROLES = ['user', 'teacher', 'admin'];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const clientInfo = getClientInfo(request);
    const admin = new SystemAdminService({ userId: auth.user.userId, ...clientInfo });

    const { id } = await params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return errorResponse('User ID is required', 'VALIDATION_ERROR', 400);
    }

    const result = await admin.getUserDetail(id);
    if (!result) {
      return errorResponse('User not found', 'NOT_FOUND', 404);
    }
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ERROR', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const clientInfo = getClientInfo(request);
    const admin = new SystemAdminService({ userId: auth.user.userId, ...clientInfo });

    const { id } = await params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return errorResponse('User ID is required', 'VALIDATION_ERROR', 400);
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 'VALIDATION_ERROR', 400);
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return errorResponse('Request body must be a JSON object', 'VALIDATION_ERROR', 400);
    }

    const role = body.role;
    if (typeof role !== 'string' || !VALID_ROLES.includes(role)) {
      return errorResponse(`role is required and must be one of: ${VALID_ROLES.join(', ')}`, 'VALIDATION_ERROR', 400);
    }
    const reason = body.reason;
    if (typeof reason !== 'string' || reason.trim().length === 0) {
      return errorResponse('reason is required and must be a non-empty string', 'VALIDATION_ERROR', 400);
    }
    if (auth.user.userId === id) {
      return errorResponse('You cannot change your own role', 'VALIDATION_ERROR', 400);
    }

    const updated = await admin.updateUserRole(id, role, reason.trim());
    return successResponse(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ERROR', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const clientInfo = getClientInfo(request);
    const admin = new SystemAdminService({ userId: auth.user.userId, ...clientInfo });

    const { id } = await params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return errorResponse('User ID is required', 'VALIDATION_ERROR', 400);
    }

    if (auth.user.userId === id) {
      return errorResponse('You cannot delete your own account', 'VALIDATION_ERROR', 400);
    }

    // Try to read reason from body (may fail on some serverless environments for DELETE)
    let reason = 'Admin deletion';
    try {
      const body = await request.json();
      if (body && typeof body === 'object' && typeof body.reason === 'string' && body.reason.trim()) {
        reason = body.reason.trim();
      }
    } catch {
      // Body not available (common with DELETE on serverless) — use default reason
    }

    await admin.deleteUser(id, reason);
    return successResponse({ message: 'User deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ERROR', 500);
  }
}
