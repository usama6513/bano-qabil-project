import prisma from '@/lib/prisma';
import { hashPassword, comparePassword, validatePasswordStrength } from '@/lib/password';
import { generateTokenPair, verifyRefreshToken, generateResetToken, hashToken } from '@/lib/jwt';
import { auditService } from '@/services/audit/audit.service';
import { emailService } from '@/services/email/email.service';
import type { RegisterRequest, LoginRequest, AuthTokens, User } from '@/types';

interface AuthContext {
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  async register(data: RegisterRequest, context?: AuthContext): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    // Validate password strength
    const passwordCheck = validatePasswordStrength(data.password);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.errors.join('. '));
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      // Return generic error to prevent email enumeration
      throw new Error('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        name: data.name.trim(),
        country: data.country || null,
        preferredLanguage: data.preferredLanguage || 'auto',
        role: 'user',
      },
    });

    // Create profile
    await prisma.profile.create({
      data: { userId: user.id },
    });

    // Generate tokens
    const tokenPair = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashToken(tokenPair.refreshToken),
        expiresAt: tokenPair.refreshTokenExpiresAt,
      },
    });

    // Audit log
    await auditService.log({
      userId: user.id,
      action: 'REGISTER',
      entityType: 'user',
      entityId: user.id,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as Omit<User, 'passwordHash'>, tokens: tokenPair };
  }

  async login(data: LoginRequest, context?: AuthContext): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user || user.deletedAt) {
      // Generic error to prevent email enumeration
      await auditService.log({
        action: 'LOGIN_FAILED',
        entityType: 'user',
        entityId: 'unknown',
        details: { email: data.email.toLowerCase().trim(), reason: 'user_not_found' },
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      });
      throw new Error('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account is disabled. Please contact support.');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      await auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'user',
        entityId: user.id,
        details: { reason: 'invalid_password' },
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      });
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokenPair = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashToken(tokenPair.refreshToken),
        expiresAt: tokenPair.refreshTokenExpiresAt,
      },
    });

    // Audit log
    await auditService.log({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'user',
      entityId: user.id,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as Omit<User, 'passwordHash'>, tokens: tokenPair };
  }

  async logout(userId: string, refreshToken?: string, context?: AuthContext): Promise<void> {
    // Revoke specific refresh token or all user tokens
    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { userId, token: hashedToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      // Revoke all refresh tokens for the user
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    await auditService.log({
      userId,
      action: 'LOGOUT',
      entityType: 'user',
      entityId: userId,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });
  }

  async refreshToken(token: string, context?: AuthContext): Promise<AuthTokens> {
    // Verify refresh token
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw new Error('Invalid or expired refresh token');
    }

    // Check if token exists and is not revoked
    const hashedToken = hashToken(token);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    });

    if (!storedToken || storedToken.revokedAt) {
      // Token reuse detected - revoke all tokens for this user
      if (storedToken) {
        await prisma.refreshToken.updateMany({
          where: { userId: storedToken.userId },
          data: { revokedAt: new Date() },
        });
      }
      throw new Error('Token revoked. Please log in again.');
    }

    // Check expiry
    if (new Date() > storedToken.expiresAt) {
      throw new Error('Refresh token expired. Please log in again.');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new Error('User not found or inactive');
    }

    // Revoke old refresh token (token rotation) — idempotent
    await prisma.refreshToken.updateMany({
      where: { id: storedToken.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens with retry for race conditions
    let tokenPair = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await prisma.refreshToken.create({
          data: {
            userId: user.id,
            token: hashToken(tokenPair.refreshToken),
            expiresAt: tokenPair.refreshTokenExpiresAt,
          },
        });
        break;
      } catch (err) {
        if (attempt === 2) throw err;
        tokenPair = generateTokenPair({
          userId: user.id,
          email: user.email,
          role: user.role,
        });
      }
    }

    await auditService.log({
      userId: user.id,
      action: 'TOKEN_REFRESHED',
      entityType: 'user',
      entityId: user.id,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    return tokenPair;
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || user.deletedAt) {
      return null;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'passwordHash'>;
  }

  async requestPasswordReset(email: string, context?: AuthContext): Promise<{ resetLink?: string } | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return null to prevent email enumeration
    if (!user || user.deletedAt) {
      return null;
    }

    // Invalidate any existing reset tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate new reset token
    const resetToken = generateResetToken();
    const hashedResetToken = hashToken(resetToken);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedResetToken,
        expiresAt,
      },
    });

    await auditService.log({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'user',
      entityId: user.id,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;
    const hasRealSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(user.email, resetToken);

    if (emailResult.success) {
      if (emailResult.previewUrl) {
        console.log(`[Password Reset] Email preview (dev mode): ${emailResult.previewUrl}`);
      }
    } else {
      console.error(`[Password Reset] Failed to send email to ${user.email}: ${emailResult.error}`);
    }

    // In development without real SMTP, return the reset link directly
    // so the user can still reset their password
    if (!hasRealSmtp && process.env.NODE_ENV !== 'production') {
      return { resetLink };
    }

    return null;
  }

  async resetPassword(token: string, newPassword: string, context?: AuthContext): Promise<void> {
    // Validate password strength
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.errors.join('. '));
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find the reset token
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!resetTokenRecord || resetTokenRecord.usedAt) {
      throw new Error('Invalid or expired reset token');
    }

    // Check expiry
    if (new Date() > resetTokenRecord.expiresAt) {
      throw new Error('Reset token expired. Please request a new one.');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all refresh tokens for security
      prisma.refreshToken.updateMany({
        where: { userId: resetTokenRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await auditService.log({
      userId: resetTokenRecord.userId,
      action: 'PASSWORD_RESET',
      entityType: 'user',
      entityId: resetTokenRecord.userId,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, context?: AuthContext): Promise<void> {
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.errors.join('. '));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await auditService.log({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'user',
      entityId: userId,
      details: { sessionsRevoked: true },
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });
  }

  async deleteAccount(userId: string, password: string, context?: AuthContext): Promise<void> {
    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Password is incorrect');
    }

    // Soft delete
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false },
    });

    // Revoke all tokens
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    await auditService.log({
      userId,
      action: 'ACCOUNT_DELETED',
      entityType: 'user',
      entityId: userId,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });
  }

  async updateProfile(userId: string, data: { name?: string; country?: string; preferredLanguage?: string }, context?: AuthContext): Promise<Omit<User, 'passwordHash'>> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.country !== undefined) updateData.country = data.country;
    if (data.preferredLanguage !== undefined) updateData.preferredLanguage = data.preferredLanguage;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await auditService.log({
      userId,
      action: 'PROFILE_UPDATED',
      entityType: 'user',
      entityId: userId,
      details: { fields: Object.keys(updateData) },
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'passwordHash'>;
  }

  async updateProfileDetails(userId: string, data: { bio?: string; dateOfBirth?: string; phone?: string; educationLevel?: string; occupation?: string; timezone?: string }, context?: AuthContext) {
    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        bio: data.bio,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        phone: data.phone,
        educationLevel: data.educationLevel,
        occupation: data.occupation,
        timezone: data.timezone,
      },
      update: {
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.educationLevel !== undefined && { educationLevel: data.educationLevel }),
        ...(data.occupation !== undefined && { occupation: data.occupation }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
      },
    });

    await auditService.log({
      userId,
      action: 'PROFILE_UPDATED',
      entityType: 'profile',
      entityId: profile.id,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    return profile;
  }
}

export const authService = new AuthService();
