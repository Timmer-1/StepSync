'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import GridBackground from '@/app/ui/background';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your authentication logic here
    console.log('Sign in attempt:', { email, password, rememberMe });
  };
  /* 
  TODO List: 
     - Fix Logo
     - Add Supabase Auth 
     - Add Google, GitHub and another one? 
  */
  return (
    <GridBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-green-400 rounded-full" />
            </div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-gray-400 mt-2">Please enter your details to sign in.</p>
          </div>

          {/* Social Sign In */}
          <div className="grid grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-white/5">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 4.687-3.813 8.5-8.5 8.5-4.687 0-8.5-3.813-8.5-8.5 0-4.687 3.813-8.5 8.5-8.5z" />
              </svg>
            </button>
            <button className="flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-white/5">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 4.687-3.813 8.5-8.5 8.5-4.687 0-8.5-3.813-8.5-8.5 0-4.687 3.813-8.5 8.5-8.5z" />
              </svg>
            </button>
            <button className="flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-white/5">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 4.687-3.813 8.5-8.5 8.5-4.687 0-8.5-3.813-8.5-8.5 0-4.687 3.813-8.5 8.5-8.5z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-gray-600 flex-1" />
            <span className="text-gray-400 text-sm">OR</span>
            <div className="h-px bg-gray-600 flex-1" />
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-green-400 focus:ring-green-400 bg-white/5"
                />
                <span className="text-sm">Remember me</span>
              </label>
              <Link
                href="/registeration/forgotpassword"
                className="text-sm text-green-400 hover:text-green-300"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-green-400 text-gray-900 rounded-lg font-medium hover:bg-green-300 transition-colors"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/registeration/signup"
              className="text-green-400 hover:text-green-300 font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </GridBackground>
  );
}

