'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaApple } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isAppleSubmitting, setIsAppleSubmitting] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      setIsEmailSubmitting(true);
      await signIn('email', { email, callbackUrl: '/' });
    } catch (error) {
      console.error('Email sign in error:', error);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSubmitting(true);
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsAppleSubmitting(true);
      await signIn('apple', { callbackUrl: '/' });
    } catch (error) {
      console.error('Apple sign in error:', error);
    } finally {
      setIsAppleSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in to USCG Evaluation Generator</h1>
          <p className="mt-2 text-gray-600">
            Access your account to manage your evaluation reports
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <FaGoogle className="h-5 w-5 text-red-500" />
            <span>{isGoogleSubmitting ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

          <button
            onClick={handleAppleSignIn}
            disabled={isAppleSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <FaApple className="h-5 w-5" />
            <span>{isAppleSubmitting ? 'Signing in...' : 'Sign in with Apple'}</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="name@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isEmailSubmitting || !email}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <MdEmail className="h-5 w-5" />
              <span>{isEmailSubmitting ? 'Sending link...' : 'Sign in with Email'}</span>
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
