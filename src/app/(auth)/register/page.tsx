'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

type Step = 'form' | 'verify';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    preferredLanguage: 'auto',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verification step state
  const [step, setStep] = useState<Step>('form');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { register, loginWithTokens } = useAuth();
  const router = useRouter();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      // Step 1: Send verification code
      const response = await apiClient.post<{
        data: {
          requiresVerification: boolean;
          userId?: string;
          email?: string;
          message?: string;
        };
      }>('/api/auth/send-verification', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country || undefined,
        preferredLanguage: formData.preferredLanguage,
      });

      if (!response.data.requiresVerification) {
        // Admin email — proceed with normal registration (no verification needed)
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          country: formData.country || undefined,
          preferredLanguage: formData.preferredLanguage,
        });
        router.push('/education');
        return;
      }

      // Move to verification step
      setVerificationEmail(formData.email);
      setStep('verify');
      setResendCooldown(60);
      // Focus first code input
      setTimeout(() => codeInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setVerifyError('');
    setResendMessage('');

    // Auto-focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      codeInputRefs.current[5]?.focus();
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setVerifyError('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await apiClient.post<{
        data: {
          user: { id: string; email: string; name: string; role: string };
          tokens: { accessToken: string; refreshToken: string };
        };
      }>('/api/auth/verify-email', {
        email: verificationEmail,
        code: fullCode,
      });

      // Store tokens and set user via auth context
      const { user, tokens } = response.data;
      loginWithTokens(user as Parameters<typeof loginWithTokens>[0], tokens);

      router.push('/education');
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Invalid verification code');
      // Clear the code inputs
      setCode(['', '', '', '', '', '']);
      codeInputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setResendMessage('');
    setVerifyError('');

    try {
      await apiClient.post('/api/auth/resend-verification', { email: verificationEmail });
      setResendMessage('A new code has been sent to your email.');
      setResendCooldown(60);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Failed to resend code');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  // ── VERIFICATION STEP ──
  if (step === 'verify') {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold gradient-text">Verify Your Email</h2>
          <p className="text-gray-400 mt-2 text-sm">
            We sent a 6-digit code to<br />
            <span className="text-cyan-400 font-medium">{verificationEmail}</span>
          </p>
        </div>

        {verifyError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center" role="alert">
            {verifyError}
          </div>
        )}

        {resendMessage && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleVerifyCode}>
          <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handleCodePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { codeInputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                disabled={isVerifying}
                className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold bg-[#0f172a] border-2 border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifying || code.join('').length !== 6}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying...
              </span>
            ) : 'Verify & Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center space-y-3">
          <button
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || isVerifying}
            className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive the code? Resend"}
          </button>

          <div>
            <button
              onClick={() => { setStep('form'); setCode(['', '', '', '', '', '']); setVerifyError(''); setResendMessage(''); }}
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              ← Change email address
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          The code expires in 15 minutes. Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    );
  }

  // ── REGISTRATION FORM STEP ──
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-center mb-6">Create your account</h2>

      {apiError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm" role="alert">
          {apiError}
        </div>
      )}

      <div className="mb-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>We&apos;ll send a verification code to your email to confirm it&apos;s a real account. Only valid email addresses (Gmail, Yahoo, etc.) are accepted.</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="Your full name" disabled={isLoading} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="input-field" placeholder="you@gmail.com" disabled={isLoading} />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <div className="relative">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange} className="input-field pr-12" placeholder="Min 8 chars, uppercase + number" disabled={isLoading} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[#1e293b] transition-colors" tabIndex={-1}>
              {showPassword ? (
                <svg className="w-5 h-5 text-gray-500 hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="w-5 h-5 text-gray-500 hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm password</label>
          <div className="relative">
            <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className="input-field pr-12" placeholder="Re-enter your password" disabled={isLoading} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[#1e293b] transition-colors" tabIndex={-1}>
              {showConfirmPassword ? (
                <svg className="w-5 h-5 text-gray-500 hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="w-5 h-5 text-gray-500 hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">Country (optional)</label>
          <input id="country" name="country" type="text" value={formData.country} onChange={handleChange} className="input-field" placeholder="Your country" disabled={isLoading} />
        </div>

        <div>
          <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-300 mb-1">Preferred language</label>
          <select id="preferredLanguage" name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="input-field" disabled={isLoading}>
            <option value="auto">Auto-detect</option>
            <option value="english">English</option>
            <option value="roman_urdu">Roman Urdu</option>
            <option value="urdu">Urdu</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending verification code...
            </span>
          ) : 'Continue'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
