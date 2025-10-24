'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function ForgotPasswordPage() {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        success('Reset link sent! Check your email inbox.');
      } else {
        showError(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showError('Failed to send reset link. Please try again.');
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
          {!emailSent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-aviation-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-aviation-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-slate-600">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pilot@example.com"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-aviation-500 focus:bg-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    '📧 Send Reset Link'
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
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Check Your Email! 📬
              </h2>
              <p className="text-slate-600 mb-2">
                We've sent a password reset link to:
              </p>
              <p className="text-aviation-600 font-semibold mb-6">
                {email}
              </p>
              <p className="text-sm text-slate-500 mb-8">
                The link will expire in 1 hour. Check your spam folder if you don't see it.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setEmailSent(false)}
                  className="w-full btn-secondary"
                >
                  Try Another Email
                </button>
                <Link
                  href="/auth/login"
                  className="block w-full text-center text-aviation-600 hover:text-aviation-700 font-semibold transition-colors"
                >
                  ← Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li className="flex items-start gap-2">
                <span className="text-aviation-300 font-bold">1.</span>
                <span>You'll receive an email with a secure reset link</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-aviation-300 font-bold">2.</span>
                <span>Click the link to access the password reset page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-aviation-300 font-bold">3.</span>
                <span>Create a new secure password for your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-aviation-300 font-bold">4.</span>
                <span>Log in with your new password and continue flying!</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security Tips
            </h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li className="flex items-start gap-2">
                <span className="text-green-300">✓</span>
                <span>The reset link expires in 1 hour for your security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-300">✓</span>
                <span>Use a strong password with letters, numbers, and symbols</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-300">✓</span>
                <span>Never share your password with anyone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-300">✓</span>
                <span>Check your spam folder if you don't see the email</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center text-white text-sm opacity-75">
            <p>
              Need help?{' '}
              <a href="mailto:support@flynova.com" className="font-semibold hover:underline text-aviation-200">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-white text-sm mt-6 opacity-75">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-semibold hover:underline">
            Sign Up
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
