'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      showError('Invalid reset link');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showError('Invalid reset token');
      return;
    }

    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        success('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        showError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-aviation-600 via-aviation-700 to-aviation-900 flex items-center justify-center px-4 py-12 pb-24">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl opacity-5 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-aviation-400 rounded-full blur-3xl opacity-5 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="FlyNova" className="h-12 w-auto" />
            <span className="text-3xl font-bold">FlyNova</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-aviation-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-aviation-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Reset Password
            </h1>
            <p className="text-slate-600">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-aviation-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-aviation-500 focus:bg-white transition-colors"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Resetting...
                </span>
              ) : (
                '🔒 Reset Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-aviation-600 hover:text-aviation-700 font-semibold transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>

        {/* Additional Security Info */}
        <div className="mt-8 space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Password Requirements
            </h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li className="flex items-start gap-2">
                <span className={newPassword.length >= 6 ? 'text-green-300' : 'text-white/50'}>
                  {newPassword.length >= 6 ? '✓' : '○'}
                </span>
                <span>At least 6 characters long</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={/[A-Z]/.test(newPassword) ? 'text-green-300' : 'text-white/50'}>
                  {/[A-Z]/.test(newPassword) ? '✓' : '○'}
                </span>
                <span>Contains uppercase letters (recommended)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={/[0-9]/.test(newPassword) ? 'text-green-300' : 'text-white/50'}>
                  {/[0-9]/.test(newPassword) ? '✓' : '○'}
                </span>
                <span>Contains numbers (recommended)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={/[!@#$%^&*]/.test(newPassword) ? 'text-green-300' : 'text-white/50'}>
                  {/[!@#$%^&*]/.test(newPassword) ? '✓' : '○'}
                </span>
                <span>Contains special characters (recommended)</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Security Tips
            </h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li className="flex items-start gap-2">
                <span className="text-aviation-300">•</span>
                <span>Choose a unique password you haven't used before</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-aviation-300">•</span>
                <span>Avoid using personal information in your password</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-aviation-300">•</span>
                <span>Consider using a password manager for added security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-aviation-300">•</span>
                <span>Never share your password with anyone</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 text-white border border-green-400/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold mb-1">Your account is secure</p>
                <p className="opacity-90">After resetting your password, you'll be redirected to the login page.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-white text-sm mt-6 opacity-75">
          Remember your password?{' '}
          <Link href="/auth/login" className="font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/50 backdrop-blur-md border-t border-white/10 py-4">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <Link href="/" className="flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity">
            <img src="/logo.png" alt="FlyNova" className="h-8 w-auto" />
            <span className="text-white font-semibold">FlyNova</span>
          </Link>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
