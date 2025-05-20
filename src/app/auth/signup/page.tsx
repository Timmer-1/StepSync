'use client'

import GridBackground from "@/app/ui/background";
import { useState } from "react";
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { TextHoverEffect } from "@/app/ui/text-hover-effect";
import { signup } from '../login/action';
import { createClient } from '@/utils/supabase/client';
import { ShineBorder } from "@/components/magicui/shine-border";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  // TODO: Add a Page to show you signed up and need to verify your email

  const supabase = createClient();


  const handleFormAction = async (formData: FormData) => {
    setFormError(null);
    setFormSuccess(null);

    const result = await signup(formData);

    if ('error' in result && result.error) {
      setFormError(result.error);
    } else if ('success' in result && result.success) {
      if (result.message) {
        setFormSuccess(result.message);
      } else {
        setFormSuccess('Account created successfully!');
      }
    }
  };

  return (
    <GridBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-7 w-full max-w-lg space-y-4">
          <ShineBorder shineColor="#4ade80" duration={10} borderWidth={1} />
          {/* Logo and Title */}
          <div className="text-center space-y-2 py-6 px-4">
            <ShineBorder shineColor="#4ade80" duration={10} borderWidth={1} />
            <TextHoverEffect text="StepSync" duration={0.2} />
            <h2 className="text-2xl font-bold"> Create your account</h2>
            <p className="text-gray-400 mt-2">Please enter your details to create an account.</p>
          </div>

          {/* Error/Success Messages */}
          {formError && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded">
              {formSuccess}
            </div>
          )}

          {/* Sign Up Form */}
          <form action={handleFormAction} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="displayname"
                type="text"
                className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-green-400 focus:ring-green-400 bg-white/5"
                  required
                />
                <span className="text-sm">I agree to all Terms, Privacy Policy and Fees</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!termsAccepted}
              className="w-full py-3 px-4 bg-green-400 text-gray-900 rounded-lg font-medium hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Have an account?{' '}
            <Link
              href="/auth/login"
              className="text-green-400 hover:text-green-300 font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </GridBackground>
  );
}