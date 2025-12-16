'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { data: session, status } = useSession();
  const isRegistered = searchParams.get('registered') === 'true';
  const isOAuthRegistered = searchParams.get('oauth_registered') === 'true';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate deterministic particles for background
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: (i * 14.7) % 100,
    top: (i * 8.3) % 100,
    delay: (i * 0.2) % 2,
    duration: 4 + (i % 3),
  }));

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl
      });
      
      if (!result?.ok) {
        setError(result?.error || 'Login failed. Please check your credentials.');
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to sign in with Google. Please try again later.');
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="bg-dark-950 text-white min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-dark-950 text-white min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black"></div>
        {mounted && (
          <div className="absolute inset-0 opacity-20">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-1 h-1 bg-neon-blue rounded-full"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-8">
              <motion.div 
                className="flex justify-center mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center text-white font-bold text-3xl glow-animation">
                    E
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl blur-xl opacity-50"></div>
                </div>
              </motion.div>
              
              <h1 className="text-4xl lg:text-5xl font-gaming font-bold text-gradient mb-4">
                Welcome Back
              </h1>
              <p className="text-gray-300 text-lg">
                Log in to your EpicEsports account and continue your gaming journey.
              </p>
            </div>
            
            {error && (
              <motion.div 
                className="glass-effect border border-red-500/30 text-white px-6 py-4 rounded-xl mb-6 bg-red-500/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-red-400">{error}</p>
              </motion.div>
            )}
            
            {(isRegistered || isOAuthRegistered) && (
              <motion.div 
                className="glass-effect border border-green-500/30 text-white px-6 py-4 rounded-xl mb-6 bg-green-500/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-green-400">
                  {isOAuthRegistered 
                    ? '✅ Registration completed! You can now sign in with your Google account.'
                    : '✅ Registration successful! You can now sign in with your credentials.'
                  }
                </p>
              </motion.div>
            )}
            
            <motion.form 
              onSubmit={handleSubmit} 
              className="card-gaming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-3 text-gray-300">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass-effect border border-neon-blue/30 rounded-xl focus:outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/50 backdrop-blur-sm text-white placeholder-gray-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-3 text-gray-300">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass-effect border border-neon-blue/30 rounded-xl focus:outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/50 backdrop-blur-sm text-white placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                {/* Remember Me and Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-neon-blue bg-dark-800 border-neon-blue/30 rounded focus:ring-neon-blue focus:ring-2"
                    />
                    <label htmlFor="rememberMe" className="ml-3 block text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link href="/forgot-password" className="text-neon-blue hover:text-neon-purple transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gaming w-full text-lg py-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="loading-spinner mr-2"></div>
                        Logging in...
                      </span>
                    ) : (
                      <>
                        <span className="mr-2">🚀</span>
                        Log In
                      </>
                    )}
                  </motion.button>
                </div>
                
                {/* Register Link */}
                <div className="text-center text-gray-300">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-neon-blue hover:text-neon-purple transition-colors font-semibold">
                    Create an account
                  </Link>
                </div>
                
                {/* Social Login Options */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 glass-effect text-gray-400 rounded-full border border-gray-600">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <motion.button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full glass-effect border border-neon-blue/30 rounded-xl py-3 px-4 text-white hover:border-neon-blue/50 transition-all backdrop-blur-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center">
                        <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="font-medium">Sign in with Google</span>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.form>
            
            {/* Back to Home */}
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link 
                href="/" 
                className="text-gray-400 hover:text-neon-blue transition-colors inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 