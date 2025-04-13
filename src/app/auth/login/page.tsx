'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import GridBackground from '@/app/ui/background';
import { TextHoverEffect } from "@/app/ui/text-hover-effect";
import { login } from './action';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // The user will be redirected to Google's auth page
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // The user will be redirected to GitHub's auth page
    }
    catch (error) {
      console.error('Error signing in with GitHub:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    const formData = new FormData(event.currentTarget)
    const response = await login(formData)
    if (response.error) {
      setErrorMessage(response.error)
    } else {
      router.push('/dashboard')
    }
  }

  useEffect(() => {
    let errorTimeout: NodeJS.Timeout;

    if (errorMessage) {
      setIsErrorVisible(true);

      errorTimeout = setTimeout(() => {
        setIsErrorVisible(false);

        // Clear the error message after fade out transition completes
        setTimeout(() => {
          setErrorMessage(null);
        }, 300); // matches the transition duration
      }, 5000);
    }

    // Cleanup function to clear the timeout if component unmounts
    return () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
    };
  }, [errorMessage]);


  return (
    <GridBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-lg space-y-4">
          {/* Logo and Title */}
          <div className="text-center space-y-2 py-6 px-4">
            <TextHoverEffect text="ProjectA" duration={0.2} />
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-gray-400 mt-2">Please enter your details to sign in.</p>
          </div>

          {/* Social Sign In */}
          <div className="grid grid-cols-2 gap-4">
            {/* Google Signup Button */}
            <button onClick={handleGoogleSignIn} className="flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-white/5">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 mr-2"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Login with Google</span>
            </button>


            {/* GitHub Signup Button */}
            <button onClick={handleGithubSignIn} className="flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-white/5">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 mr-2"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>Login with GitHub</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-gray-600 flex-1" />
            <span className="text-gray-400 text-sm">OR</span>
            <div className="h-px bg-gray-600 flex-1" />
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

