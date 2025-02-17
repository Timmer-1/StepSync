'use client'

import GridBackground from "@/app/ui/background"
import { useState } from "react";
import Link from 'next/link'
import { TextHoverEffect } from "@/app/ui/text-hover-effect";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <GridBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="text-center space-y-2 py-2 px-4">
              <TextHoverEffect text="ProjectA" duration={0.2} />
            </div>

            <h2 className="text-2xl font-bold">Forgot your Password?</h2>
            <p className="text-gray-400 mt-2">Please enter your email to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">

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
          </form>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-400 text-gray-900 rounded-lg font-medium hover:bg-green-300 transition-colors"
          >
            <Link href="/auth/resetpassword">
              Reset Password
            </Link>
          </button>
        </div>
      </div>
    </GridBackground>
  );
}