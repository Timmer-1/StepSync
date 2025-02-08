'use client'

import GridBackground from "@/app/ui/background"
import { useState } from "react";
import Link from 'next/link'

export default function ForgotPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Continue here psasword logic here!!!!
  };

  return (
    <GridBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-green-400 rounded-full" />
            </div>
            <h2 className="text-2xl font-bold">Reset Password</h2>
            <p className="text-gray-400 mt-2">Please enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Enter your new password"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Confirm your new password"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-green-400 text-gray-900 rounded-lg font-medium hover:bg-green-300 transition-colors"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </GridBackground>
  );
}