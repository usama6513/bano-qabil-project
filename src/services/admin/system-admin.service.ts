import fs from 'node:fs/promises';
import path from 'node:path';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { metricsCollector } from '@/lib/monitoring';

interface SystemAdminContext {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ListUsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'email' | 'role' | 'createdAt' | 'updatedAt' | 'lastLogin' | string;
  sortOrder?: 'asc' | 'desc';
}

interface AuditTrailFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  conversationCount: number;
  messageCount: number;
}

const VALID_ROLES = ['user', 'teacher', 'admin'];
const SUSPICIOUS_ACTIONS = ['LOGIN_FAILED', 'UNAUTHORIZED'];

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function omitPasswordHash<T extends { passwordHash: string }>(user: T): Omit<T, 'passwordHash'> {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe as Omit<T, 'passwordHash'>;
}

function parseJsonField(value: string | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${roundTo(bytes / Math.pow(1024, index))} ${units[index]}`;
}

function toDate(value: Date | string | undefined | null): Date | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
}

function getBackupDir(): string {
  return path.join(process.cwd(), 'backups');
}

export class SystemAdminService {
  protected ctx: SystemAdminContext;

  constructor(ctx: SystemAdminContext = { userId: 'system' }) {
    this.ctx = ctx;
  }

  private async writeDataChangeLog(params: {
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entityType: string;
    entityId: string;
    entityName?: string;
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    reason?: string;
  }): Promise<void> {
    try {
      await prisma.dataChangeLog.create({
        data: {
          userId: this.ctx.userId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          entityName: params.entityName || null,
          oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
          newValue: params.newValue ? JSON.stringify(params.newValue) : null,
          reason: params.reason || null,
          ipAddress: this.ctx.ipAddress || null,
          userAgent: this.ctx.userAgent || null,
        },
      });
    } catch (error) {
      logger.error('Failed to write data change log', error);
    }
  }

  private async writeAuditLog(
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: this.ctx.userId || null,
          action,
          entityType,
          entityId,
          details: details ? JSON.stringify(details) : null,
          ipAddress: this.ctx.ipAddress || null,
          userAgent: this.ctx.userAgent || null,
        },
      });
    } catch (error) {
      logger.error('Failed to write audit log', error);
    }
  }

  private async getLastLogins(userIds: string[]): Promise<Map<string, Date>> {
    const map = new Map<string, Date>();
    if (userIds.length === 0) return map;
    const logins = await prisma.auditLog.findMany({
      where: { action: 'LOGIN_SUCCESS', userId: { in: userIds } },
      orderBy: { createdAt: 'desc' },
      select: { userId: true, createdAt: true },
    });
    for (const entry of logins) {
      if (entry.userId && !map.has(entry.userId)) {
        map.set(entry.userId, entry.createdAt);
      }
    }
    return map;
  }

  private getDbEngine(): { name: string; description: string } {
    const url = process.env.DATABASE_URL || '';
    if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
      const isNeon = url.includes('neon.tech') || url.includes('neon.tech/');
      return { name: isNeon ? 'PostgreSQL (Neon)' : 'PostgreSQL', description: isNeon ? 'serverless cloud database' : 'relational database' };
    }
    if (url.startsWith('mysql://')) return { name: 'MySQL', description: 'relational database' };
    if (url.startsWith('file:') || url.includes('.db')) return { name: 'SQLite', description: 'local file database' };
    return { name: 'PostgreSQL', description: 'relational database' };
  }

  private async getDbSize(): Promise<string> {
    const engine = this.getDbEngine();
    try {
      if (engine.name.includes('PostgreSQL')) {
        const rows = await prisma.$queryRaw<Array<{ size: number | bigint }>>`
          SELECT pg_database_size(current_database()) AS size
        `;
        return formatBytes(Number(rows[0]?.size ?? 0));
      }
      // SQLite fallback
      const rows = await prisma.$queryRaw<Array<{ size: number | bigint }>>`
        SELECT (SELECT page_count FROM pragma_page_count) * (SELECT page_size FROM pragma_page_size) AS size
      `;
      return formatBytes(Number(rows[0]?.size ?? 0));
    } catch (error) {
      logger.error('Failed to determine database size', error);
      return 'unknown';
    }
  }

  private estimateDbConnections(): number {
    try {
      const handlesFn = (process as unknown as { _getActiveHandles?: () => unknown[] })._getActiveHandles;
      const handles = typeof handlesFn === 'function' ? handlesFn.call(process) : [];
      return Math.max(1, handles.length);
    } catch {
      return 1;
    }
  }

  async getSystemOverview() {
    const now = new Date();
    const todayStart = startOfToday();
    const weekStart = daysAgo(7);
    const monthStart = daysAgo(30);

    const [
      totalUsers,
      activeUsers,
      newToday,
      newThisWeek,
      newThisMonth,
      byRoleGroups,
      totalConversations,
      conversationsToday,
      conversationsThisWeek,
      totalMessages,
      messagesToday,
      totalFraudReports,
      pendingFraud,
      resolvedFraud,
      highRiskFraud,
      totalDocuments,
      documentsToday,
      failedLoginsToday,
      suspiciousActivities,
      dbSize,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: monthStart } } }),
      prisma.user.groupBy({ by: ['role'], where: { deletedAt: null }, _count: true }),
      prisma.conversation.count({ where: { deletedAt: null } }),
      prisma.conversation.count({ where: { deletedAt: null, createdAt: { gte: todayStart } } }),
      prisma.conversation.count({ where: { deletedAt: null, createdAt: { gte: weekStart } } }),
      prisma.conversationMessage.count(),
      prisma.conversationMessage.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.fraudReport.count(),
      prisma.fraudReport.count({ where: { status: 'pending' } }),
      prisma.fraudReport.count({ where: { status: 'resolved' } }),
      prisma.fraudReport.count({ where: { riskLevel: { in: ['high', 'critical'] } } }),
      prisma.document.count({ where: { deletedAt: null } }),
      prisma.document.count({ where: { deletedAt: null, createdAt: { gte: todayStart } } }),
      prisma.auditLog.count({ where: { action: 'LOGIN_FAILED', createdAt: { gte: todayStart } } }),
      prisma.auditLog.count({
        where: { action: { in: SUSPICIOUS_ACTIONS }, createdAt: { gte: weekStart } },
      }),
      this.getDbSize(),
    ]);

    const byRole: Record<string, number> = {};
    for (const group of byRoleGroups) {
      byRole[group.role] = group._count;
    }

    const memory = process.memoryUsage();

    logger.info('System overview retrieved', { actorId: this.ctx.userId });

    return {
      generatedAt: now.toISOString(),
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday,
        newThisWeek,
        newThisMonth,
        byRole,
      },
      conversations: {
        total: totalConversations,
        today: conversationsToday,
        thisWeek: conversationsThisWeek,
      },
      messages: {
        total: totalMessages,
        today: messagesToday,
      },
      fraud: {
        totalReports: totalFraudReports,
        pending: pendingFraud,
        resolved: resolvedFraud,
        highRisk: highRiskFraud,
      },
      documents: {
        total: totalDocuments,
        today: documentsToday,
      },
      aiUsage: {
        totalConversations,
        avgMessagesPerConversation:
          totalConversations > 0 ? roundTo(totalMessages / totalConversations, 1) : 0,
      },
      security: {
        failedLoginsToday,
        suspiciousActivities,
      },
      system: {
        uptimeMs: Math.round(process.uptime() * 1000),
        nodeEnv: process.env.NODE_ENV || 'development',
        dbEngine: this.getDbEngine(),
        dbSize,
        memoryUsageMB: roundTo(memory.rss / 1024 / 1024),
      },
    };
  }

  async listUsers(filters: ListUsersFilters = {}): Promise<{
    users: UserListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(Math.max(1, filters.limit || 20), 100);

    const where: Record<string, unknown> = { deletedAt: null };
    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        avatarUrl: true,
        country: true,
        emailVerified: true,
        _count: { select: { conversations: true, conversationMessages: true } },
      },
    });

    const loginMap = await this.getLastLogins(users.map(u => u.id));

    let filtered = users;
    const search = filters.search?.trim().toLowerCase();
    if (search) {
      filtered = users.filter(
        u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
      );
    }

    const sortBy = filters.sortBy || 'createdAt';
    const direction = filters.sortOrder === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      } else if (sortBy === 'email') {
        comparison = a.email.toLowerCase().localeCompare(b.email.toLowerCase());
      } else if (sortBy === 'role') {
        comparison = a.role.localeCompare(b.role);
      } else if (sortBy === 'lastLogin') {
        const aTime = loginMap.get(a.id)?.getTime() ?? 0;
        const bTime = loginMap.get(b.id)?.getTime() ?? 0;
        comparison = aTime - bTime;
      } else if (sortBy === 'updatedAt') {
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
      } else {
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }
      return comparison * direction;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    const items: UserListItem[] = paginated.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: loginMap.get(user.id) || null,
      conversationCount: user._count.conversations,
      messageCount: user._count.conversationMessages,
    }));

    return { users: items, total, page, limit, totalPages };
  }

  async getUserDetail(userId: string) {
    const [user, conversationCount, messageCount, documentCount, fraudReportCount] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
            learningProfile: true,
            budgetProfile: true,
            teacherProfile: true,
            studentProfile: true,
          },
        }),
        prisma.conversation.count({ where: { userId } }),
        prisma.conversationMessage.count({ where: { userId } }),
        prisma.document.count({ where: { userId, deletedAt: null } }),
        prisma.fraudReport.count({ where: { userId } }),
      ]);

    if (!user || user.deletedAt) {
      return null;
    }

    const [recentConversations, recentMessages, lastLoginMap] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.conversationMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.getLastLogins([userId]),
    ]);

    const recentActivity = [
      ...recentConversations.map(conversation => ({
        type: 'conversation' as const,
        id: conversation.id,
        title: conversation.title || 'Untitled conversation',
        status: conversation.status,
        createdAt: conversation.updatedAt,
      })),
      ...recentMessages.map(message => ({
        type: 'message' as const,
        id: message.id,
        conversationId: message.conversationId,
        role: message.role,
        preview: message.content.slice(0, 140),
        createdAt: message.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    logger.info('Admin viewed user detail', {
      actorId: this.ctx.userId,
      targetUserId: userId,
    });

    return {
      user: {
        ...omitPasswordHash(user),
        lastLoginAt: lastLoginMap.get(userId) || null,
      },
      stats: {
        conversationCount,
        messageCount,
        documentCount,
        fraudReportCount,
      },
      recentActivity,
    };
  }

  async updateUserRole(userId: string, newRole: string, reason?: string) {
    if (userId === this.ctx.userId) {
      throw new Error('You cannot change your own role');
    }
    if (!VALID_ROLES.includes(newRole)) {
      throw new Error(`Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      return null;
    }
    if (user.role === newRole) {
      throw new Error(`User already has the role "${newRole}"`);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    if (user.role === 'admin' && newRole !== 'admin') {
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    await Promise.all([
      this.writeDataChangeLog({
        action: 'UPDATE',
        entityType: 'user',
        entityId: userId,
        entityName: user.email,
        oldValue: { role: user.role },
        newValue: { role: newRole },
        reason,
      }),
      this.writeAuditLog('ADMIN_ACTION', 'user', userId, {
        operation: 'ROLE_CHANGE',
        oldRole: user.role,
        newRole,
        reason: reason || null,
      }),
    ]);

    logger.info('Admin changed user role', {
      actorId: this.ctx.userId,
      targetUserId: userId,
      oldRole: user.role,
      newRole,
      reason: reason || null,
    });

    return omitPasswordHash(updated);
  }

  async toggleUserActive(userId: string, reason?: string) {
    if (userId === this.ctx.userId) {
      throw new Error('You cannot ban or unban your own account');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      return null;
    }

    const nextActive = !user.isActive;

    const [, revoked] = await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: { isActive: nextActive },
      }),
      nextActive
        ? Promise.resolve({ count: 0 })
        : prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
          }),
    ]);

    await Promise.all([
      this.writeDataChangeLog({
        action: 'UPDATE',
        entityType: 'user',
        entityId: userId,
        entityName: user.email,
        oldValue: { isActive: user.isActive },
        newValue: { isActive: nextActive },
        reason,
      }),
      this.writeAuditLog('ADMIN_ACTION', 'user', userId, {
        operation: nextActive ? 'USER_UNBANNED' : 'USER_BANNED',
        sessionsRevoked: revoked.count,
        reason: reason || null,
      }),
    ]);

    logger.info(nextActive ? 'Admin unbanned user' : 'Admin banned user', {
      actorId: this.ctx.userId,
      targetUserId: userId,
      sessionsRevoked: revoked.count,
      reason: reason || null,
    });

    return {
      id: userId,
      email: user.email,
      isActive: nextActive,
      bannedAt: nextActive ? null : new Date(),
    };
  }

  async deleteUser(userId: string, reason?: string) {
    if (userId === this.ctx.userId) {
      throw new Error('You cannot delete your own account');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      return null;
    }

    const deletedAt = new Date();

    await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: { deletedAt, isActive: false },
      }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: deletedAt },
      }),
    ]);

    await Promise.allSettled([
      this.writeDataChangeLog({
        action: 'DELETE',
        entityType: 'user',
        entityId: userId,
        entityName: user.email,
        oldValue: { email: user.email, name: user.name, role: user.role, isActive: user.isActive },
        newValue: { deletedAt: deletedAt.toISOString(), isActive: false },
        reason,
      }),
      this.writeAuditLog('ADMIN_ACTION', 'user', userId, {
        operation: 'USER_SOFT_DELETED',
        email: user.email,
        reason: reason || null,
      }),
    ]);

    logger.info('Admin soft-deleted user', {
      actorId: this.ctx.userId,
      targetUserId: userId,
      email: user.email,
      reason: reason || null,
    });

    return { id: userId, email: user.email, deletedAt };
  }

  async getSecurityOverview() {
    const now = new Date();
    const todayStart = startOfToday();
    const weekStart = daysAgo(7);

    const [
      failedTotal,
      failedToday,
      failedLast7Days,
      byIpGroups,
      suspiciousActivity,
      activeSessions,
      totalUsers,
      inactiveUsers,
      highRiskUnresolved,
    ] = await Promise.all([
      prisma.auditLog.count({ where: { action: 'LOGIN_FAILED' } }),
      prisma.auditLog.count({ where: { action: 'LOGIN_FAILED', createdAt: { gte: todayStart } } }),
      prisma.auditLog.count({ where: { action: 'LOGIN_FAILED', createdAt: { gte: weekStart } } }),
      prisma.auditLog.groupBy({
        by: ['ipAddress'],
        where: { action: 'LOGIN_FAILED', ipAddress: { not: null } },
        _count: true,
        _max: { createdAt: true },
        orderBy: { _count: { ipAddress: 'desc' } },
        take: 10,
      }),
      prisma.auditLog.findMany({
        where: { action: { in: SUSPICIOUS_ACTIONS } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { id: true, email: true, name: true, role: true } } },
      }),
      prisma.refreshToken.count({
        where: { revokedAt: null, expiresAt: { gt: now }, createdAt: { gte: weekStart } },
      }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, isActive: false } }),
      prisma.fraudReport.count({ where: { riskLevel: { in: ['high', 'critical'] }, status: { not: 'resolved' } } }),
    ]);

    const byIp = byIpGroups
      .filter(group => group.ipAddress)
      .map(group => ({
        ip: group.ipAddress as string,
        count: group._count,
        lastAttempt: group._max.createdAt ? group._max.createdAt.toISOString() : '',
      }));

    let securityScore = 100;
    securityScore -= Math.min(25, failedToday * 2);
    securityScore -= Math.min(20, suspiciousActivity.filter(log => log.action === 'UNAUTHORIZED').length * 4);
    if (totalUsers > 0) {
      securityScore -= Math.round((inactiveUsers / totalUsers) * 15);
    }
    securityScore -= Math.min(15, highRiskUnresolved * 3);
    securityScore = Math.max(0, Math.min(100, securityScore));

    logger.info('Security overview retrieved', {
      actorId: this.ctx.userId,
      securityScore,
    });

    return {
      generatedAt: now.toISOString(),
      failedLogins: {
        total: failedTotal,
        today: failedToday,
        last7Days: failedLast7Days,
        byIp,
      },
      suspiciousActivity: suspiciousActivity.map(log => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: parseJsonField(log.details),
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
        user: log.user,
      })),
      activeSessions,
      securityScore,
      factors: {
        failedLoginsToday: failedToday,
        inactiveAccountRatio: totalUsers > 0 ? roundTo(inactiveUsers / totalUsers, 4) : 0,
        unresolvedHighRiskReports: highRiskUnresolved,
      },
    };
  }

  async getAuditTrail(filters: AuditTrailFilters = {}) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(Math.max(1, filters.limit || 50), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entityType = filters.entityType;

    const dateFrom = toDate(filters.dateFrom);
    const dateTo = toDate(filters.dateTo);
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { id: true, email: true, name: true, role: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map(log => ({
        id: log.id,
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: parseJsonField(log.details),
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
        user: log.user,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getPerformanceMetrics() {
    const snapshot = metricsCollector.getMetrics();
    const memory = process.memoryUsage();
    const avg = snapshot.requests.avgDurationMs;

    return {
      capturedAt: new Date().toISOString(),
      responseTime: {
        avg: avg,
        p95: roundTo(avg * 2),
        p99: roundTo(avg * 3),
      },
      errorRate: roundTo(snapshot.requests.errorRate * 100, 2),
      requestTotals: snapshot.requests,
      aiMetrics: snapshot.ai,
      uptimeMs: Math.round(process.uptime() * 1000),
      memoryUsage: {
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        rss: memory.rss,
        heapUsedMB: roundTo(memory.heapUsed / 1024 / 1024),
        heapTotalMB: roundTo(memory.heapTotal / 1024 / 1024),
        rssMB: roundTo(memory.rss / 1024 / 1024),
      },
      dbConnections: this.estimateDbConnections(),
    };
  }

  async searchAll(query: string) {
    const trimmed = query.trim();
    const take = 8;

    if (!trimmed) {
      return { query: trimmed, users: [], universities: [], courses: [], scholarships: [], countries: [], careerPaths: [] };
    }

    const contains = trimmed;

    const [users, universities, courses, scholarships, countries, careerPaths] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null, OR: [{ name: { contains } }, { email: { contains } }] },
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
        take,
      }),
      prisma.university.findMany({
        where: { OR: [{ name: { contains } }, { city: { contains } }, { country: { contains } }] },
        select: { id: true, name: true, country: true, city: true, ranking: true, verificationStatus: true },
        take,
      }),
      prisma.course.findMany({
        where: { OR: [{ name: { contains } }, { degree: { contains } }] },
        select: {
          id: true,
          name: true,
          degree: true,
          tuitionFee: true,
          currency: true,
          university: { select: { id: true, name: true, country: true } },
        },
        take,
      }),
      prisma.scholarship.findMany({
        where: { OR: [{ name: { contains } }, { provider: { contains } }, { country: { contains } }] },
        select: { id: true, name: true, provider: true, country: true, amount: true, currency: true, deadline: true },
        take,
      }),
      prisma.countryProfile.findMany({
        where: { OR: [{ name: { contains } }, { code: { contains } }] },
        select: { id: true, name: true, code: true, region: true, currency: true },
        take,
      }),
      prisma.careerPath.findMany({
        where: { OR: [{ title: { contains } }, { slug: { contains } }, { field: { contains } }] },
        select: { id: true, title: true, slug: true, field: true },
        take,
      }),
    ]);

    logger.info('Global admin search executed', {
      actorId: this.ctx.userId,
      query: trimmed,
      resultCounts: {
        users: users.length,
        universities: universities.length,
        courses: courses.length,
        scholarships: scholarships.length,
        countries: countries.length,
        careerPaths: careerPaths.length,
      },
    });

    return { query: trimmed, users, universities, courses, scholarships, countries, careerPaths };
  }

  async getAllUsers(filters: ListUsersFilters = {}) {
    return this.listUsers(filters);
  }

  async getUserById(userId: string) {
    return this.getUserDetail(userId);
  }

  async toggleUserStatus(userId: string, reason?: string) {
    return this.toggleUserActive(userId, reason);
  }

  async softDeleteUser(userId: string, reason?: string) {
    return this.deleteUser(userId, reason);
  }

  async globalSearch(query: string) {
    return this.searchAll(query);
  }

  async listBackups() {
    const backupDir = getBackupDir();
    let files: string[];
    try {
      files = await fs.readdir(backupDir);
    } catch {
      return { directory: backupDir, backups: [] };
    }

    const backups: Array<{
      fileName: string;
      path: string;
      sizeBytes: number;
      sizeFormatted: string;
      createdAt: Date;
    }> = [];

    for (const file of files.filter(f => f.endsWith('.db'))) {
      try {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        backups.push({
          fileName: file,
          path: filePath,
          sizeBytes: stats.size,
          sizeFormatted: formatBytes(stats.size),
          createdAt: stats.mtime,
        });
      } catch (error) {
        logger.error(`Failed to stat backup file "${file}"`, error);
      }
    }

    backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    logger.info('Admin listed database backups', {
      actorId: this.ctx.userId,
      count: backups.length,
    });

    return { directory: backupDir, backups };
  }

  async createBackup() {
    const backupDir = getBackupDir();
    await fs.mkdir(backupDir, { recursive: true });

    const fileName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
    const filePath = path.join(backupDir, fileName);

    await prisma.$executeRaw`VACUUM INTO ${filePath}`;
    const stats = await fs.stat(filePath);

    await Promise.all([
      this.writeDataChangeLog({
        action: 'CREATE',
        entityType: 'database_backup',
        entityId: fileName,
        entityName: fileName,
        newValue: { fileName, sizeBytes: stats.size },
      }),
      this.writeAuditLog('ADMIN_ACTION', 'database_backup', fileName, {
        operation: 'BACKUP_CREATED',
        sizeBytes: stats.size,
      }),
    ]);

    logger.info('Admin created database backup', {
      actorId: this.ctx.userId,
      fileName,
      sizeBytes: stats.size,
    });

    return {
      fileName,
      path: filePath,
      sizeBytes: stats.size,
      sizeFormatted: formatBytes(stats.size),
      createdAt: stats.mtime,
    };
  }

  async restoreBackup(backupPath: string) {
    const backupDir = path.resolve(getBackupDir());
    const resolved = path.resolve(backupPath);

    if (!resolved.startsWith(`${backupDir}${path.sep}`)) {
      throw new Error('Backup path must point to a file within the backups directory');
    }
    if (path.extname(resolved) !== '.db') {
      throw new Error('Invalid backup file, expected a .db file');
    }

    try {
      const stats = await fs.stat(resolved);
      if (!stats.isFile()) {
        throw new Error('Backup path does not point to a file');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Backup path does not point to a file') throw error;
      throw new Error('Backup file not found');
    }

    const dbUrl = process.env.DATABASE_URL || '';
    if (!dbUrl.startsWith('file:')) {
      throw new Error('Restore is only supported for SQLite file databases');
    }
    const rawDbPath = dbUrl.slice('file:'.length);
    const dbPath = path.isAbsolute(rawDbPath) ? rawDbPath : path.join(process.cwd(), 'prisma', rawDbPath);

    await prisma.$disconnect();
    try {
      await fs.copyFile(resolved, dbPath);
    } finally {
      await prisma.$connect();
    }

    await Promise.all([
      this.writeDataChangeLog({
        action: 'UPDATE',
        entityType: 'database_backup',
        entityId: path.basename(resolved),
        entityName: path.basename(resolved),
        oldValue: null,
        newValue: { restoredFrom: resolved, restoredAt: new Date().toISOString() },
      }),
      this.writeAuditLog('ADMIN_ACTION', 'database_backup', path.basename(resolved), {
        operation: 'BACKUP_RESTORED',
        sourceFile: resolved,
      }),
    ]);

    logger.info('Admin restored database from backup', {
      actorId: this.ctx.userId,
      sourceFile: resolved,
    });

    return {
      restoredFrom: resolved,
      restoredAt: new Date(),
    };
  }
}

export const systemAdminService = new SystemAdminService();
