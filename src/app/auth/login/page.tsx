'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Mail } from 'lucide-react';
import GridBackground from '@/app/ui/background';
import { TextHoverEffect } from "@/app/ui/text-hover-effect";
import { login } from './action';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ShineBorder } from '@/components/magicui/shine-border';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsEmailNotConfirmed(false)
    const formData = new FormData(event.currentTarget)
    const response = await login(formData)

    if (response.error) {
      if (response.error === 'email_not_confirmed') {
        setIsEmailNotConfirmed(true)
        setIsErrorVisible(true);
      } else {
        setErrorMessage(response.error)
        setIsErrorVisible(true);
      }
    } else {
      router.push('/dashboard')
    }
  }

  useEffect(() => {
    let errorTimeout: NodeJS.Timeout;

    if (errorMessage || isEmailNotConfirmed) {
      setIsErrorVisible(true);

      errorTimeout = setTimeout(() => {
        setIsErrorVisible(false);

        // Clear the error message after fade out transition completes
        setTimeout(() => {
          setErrorMessage(null);
          setIsEmailNotConfirmed(false)
        }, 300); // matches the transition duration
      }, 5000);
    }

    // Cleanup function to clear the timeout if component unmounts
    return () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
    };
  }, [errorMessage, isEmailNotConfirmed]); // Fixed dependency array


  return (
    <GridBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-lg space-y-4">
          <ShineBorder shineColor="#4ade80" duration={10} borderWidth={1} />
          {/* Logo and Title */}
          <div className="text-center space-y-2 py-6 px-4">
            <TextHoverEffect text="StepSync" duration={0.2} />
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-gray-400 mt-2">Please enter your details to sign in.</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500/20 to-red-400/10 border border-red-500/50 transform transition-all duration-300 ${isErrorVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                }`}
              role="alert"
            >
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200 font-medium text-sm">
                {errorMessage === 'Invalid credentials' ? 'Invalid credentials. Please check your email and password.' : errorMessage}
              </p>
            </div>
          )}

          {/* Email Not Confirmed Message */}
          {isEmailNotConfirmed && (
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-yellow-400/10 border border-yellow-500/50 transform transition-all duration-300 ${isErrorVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                }`}
              role="alert"
            >
              <Mail className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <p className="text-yellow-200 font-medium text-sm">
                Email not confirmed. Please check your inbox and confirm your email address to sign in.
              </p>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-green-400 focus:ring-green-400 bg-white/5"
                />
                <span className="text-sm">Remember me</span>
              </label>
              <Link
                href="/auth/forgotpassword"
                className="text-sm text-green-400 hover:text-green-300"
              >
                Forgot password?
              </Link>
            </div>

            <div className="space-y-3">
              <button
                className="w-full py-3 px-4 bg-green-400 text-gray-900 rounded-lg font-medium hover:bg-green-300 transition-colors"
              >
                Sign in
              </button>

            </div>
          </form>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <button
              className="text-green-400 hover:text-green-300 font-medium"
            >
              <Link href="/auth/signup">
                Sign up
              </Link>
            </button>
          </p>
        </div>
      </div>
    </GridBackground>
  );
}

