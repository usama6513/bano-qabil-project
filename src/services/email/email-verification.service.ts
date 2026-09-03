import prisma from '@/lib/prisma';
import { emailService } from '@/services/email/email.service';
import { generateVerificationCode, isAdminEmail } from '@/lib/email-validation';
import { hashPassword } from '@/lib/password';
import { generateTokenPair, hashToken } from '@/lib/jwt';

export class EmailVerificationService {
  /**
   * Send a verification code to the user's email.
   * Creates the user as inactive, stores the code, and sends the email.
   * Returns the userId so the caller can track the pending verification.
   */
  async sendVerificationCode(data: {
    email: string;
    password: string;
    name: string;
    country?: string;
    preferredLanguage?: string;
  }): Promise<{ userId: string; requiresVerification: boolean; code: string; emailSent: boolean }> {
    const email = data.email.toLowerCase().trim();

    // Admin emails bypass verification
    if (isAdminEmail(email)) {
      return { userId: '', requiresVerification: false, code: '', emailSent: false };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user as inactive (pending verification)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: data.name.trim(),
        country: data.country || null,
        preferredLanguage: data.preferredLanguage || 'auto',
        role: 'user',
        isActive: false, // Blocked until email is verified
      },
    });

    // Create profile
    await prisma.profile.create({ data: { userId: user.id } });

    // Invalidate any previous verification tokens for this user
    await prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate verification code
    const code = generateVerificationCode();

    // Store the code as a verification token
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: code, // Store the 6-digit code as the token
        expiresAt,
      },
    });

    // Send verification email
    const emailResult = await emailService.sendVerificationCodeEmail(email, code);

    if (emailResult.success) {
      if (emailResult.previewUrl) {
        console.log(`[EmailVerification] Preview URL (dev): ${emailResult.previewUrl}`);
      }
      console.log(`[EmailVerification] Code sent to ${email}`);
    } else {
      console.error(`[EmailVerification] Failed to send code to ${email}: ${emailResult.error}`);
      // Don't throw — the code is stored, user can request resend
    }

    return { userId: user.id, requiresVerification: true, code, emailSent: emailResult.success && !emailResult.previewUrl };
  }

  /**
   * Verify the code and activate the user account.
   * Returns tokens on success so the user is logged in immediately.
   */
  async verifyCode(data: {
    email: string;
    code: string;
  }): Promise<{
    user: { id: string; email: string; name: string; role: string };
    tokens: { accessToken: string; refreshToken: string };
  } | null> {
    const email = data.email.toLowerCase().trim();

    // Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    // If user is already verified and active, just return success
    if (user.isActive && user.emailVerified) {
      return null;
    }

    // Find the valid verification token
    const token = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        token: data.code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      return null; // Invalid or expired code
    }

    // Mark token as used
    await prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    });

    // Activate the user and mark email as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        emailVerified: new Date(),
      },
    });

    // Generate tokens
    const tokenPair = generateTokenPair({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: updatedUser.id,
        token: hashToken(tokenPair.refreshToken),
        expiresAt: tokenPair.refreshTokenExpiresAt,
      },
    });

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
      },
    };
  }

  /**
   * Resend verification code to a pending user
   */
  async resendVerificationCode(email: string): Promise<{ success: boolean; error?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return { success: false, error: 'No account found with this email' };
    }

    if (user.isActive && user.emailVerified) {
      return { success: false, error: 'Account is already verified' };
    }

    // Rate limit: check if a code was sent in the last 60 seconds
    const recentToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        createdAt: { gt: new Date(Date.now() - 60000) },
      },
    });

    if (recentToken) {
      return { success: false, error: 'A verification code was sent recently. Please wait 60 seconds before requesting a new one.' };
    }

    // Invalidate previous tokens
    await prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate new code
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: code,
        expiresAt,
      },
    });

    // Send email
    const emailResult = await emailService.sendVerificationCodeEmail(normalizedEmail, code);

    if (emailResult.success) {
      if (emailResult.previewUrl) {
        console.log(`[EmailVerification] Resend preview URL (dev): ${emailResult.previewUrl}`);
      }
      return { success: true };
    }

    return { success: false, error: emailResult.error || 'Failed to send verification email' };
  }
}

export const emailVerificationService = new EmailVerificationService();
