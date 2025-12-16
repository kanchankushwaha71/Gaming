'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOAuthUser = searchParams.get('oauth') === 'google';
  const oauthEmail = searchParams.get('email') || '';
  
  const [formData, setFormData] = useState({
    name: '',
    email: oauthEmail,
    password: '',
    confirmPassword: '',
    gamertag: '',
    primaryGame: '',
    bio: '',
    agreeToTerms: false
  });
  
  useEffect(() => {
    if (oauthEmail) {
      setFormData(prev => ({ ...prev, email: oauthEmail }));
    }
  }, [oauthEmail]);
  
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    // Validate form
    const newErrors: { [key: string]: string[] } = {};
    
    // Only validate password for non-OAuth users
    if (!isOAuthUser) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = ['Passwords do not match'];
      }
      if (!formData.password) {
        newErrors.password = ['Password is required'];
      }
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = ['You must agree to the terms and conditions'];
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Use the registration API
      const registrationData: any = {
        name: formData.name,
        email: formData.email,
        gamertag: formData.gamertag,
        primaryGame: formData.primaryGame,
        bio: formData.bio || '',
        isOAuthUser: isOAuthUser
      };
      
      // Only include password for non-OAuth users
      if (!isOAuthUser) {
        registrationData.password = formData.password;
      }
      
      const response = await axios.post('/api/register', registrationData);
      
      if (response.status === 201) {
        // Registration successful
        if (isOAuthUser) {
          router.push('/login?oauth_registered=true');
        } else {
          router.push('/login?registered=true');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response?.status === 409) {
        const errorData = error.response?.data;
        if (errorData?.error?.includes('email already exists') || errorData?.error?.includes('already been registered')) {
          setSubmitError('An account with this email already exists. Please use the login page or try password reset if you forgot your password.');
        } else if (errorData?.error?.includes('username') || errorData?.error?.includes('gamertag')) {
          setSubmitError('This username/gamertag is already taken. Please choose a different one.');
        } else {
          setSubmitError(errorData?.error || 'An account with this email already exists.');
        }
      } else if (error.response?.data?.error) {
        setSubmitError(error.response.data.error);
      } else {
        setSubmitError('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const gameOptions = [
    { value: '', label: 'Select your primary game' },
    { value: 'valorant', label: 'Valorant' },
    { value: 'bgmi', label: 'BGMI' },
    { value: 'cod-mobile', label: 'COD Mobile' },
    { value: 'free-fire', label: 'Free Fire' },
    { value: 'fifa', label: 'FIFA' },
    { value: 'other', label: 'Other' }
  ];
  
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {isOAuthUser ? 'Complete Your Registration' : 'Create Your Account'}
            </h1>
            <p className="text-gray-300">
              {isOAuthUser 
                ? 'Complete your profile to finish setting up your EpicEsports account.'
                : 'Join the EpicEsports India community to participate in tournaments, connect with other gamers, and track your performance.'
              }
            </p>
            {isOAuthUser && (
              <div className="bg-blue-600/20 border border-blue-400 text-blue-300 px-4 py-3 rounded mt-4">
                <p>✅ You've signed in with Google. Please complete your gaming profile below.</p>
              </div>
            )}
          </div>
          
          {submitError && (
            <div className="bg-red-600/20 border border-red-400 text-white px-4 py-3 rounded mb-6">
              <p className="mb-2">{submitError}</p>
              {submitError.includes('email already exists') && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    Go to Login
                  </Link>
                  <Link 
                    href="/login" 
                    className="inline-flex items-center px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors"
                  >
                    Try Login Instead
                  </Link>
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-8">
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name[0]}</p>
                )}
              </div>
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address <span className="text-red-500">*</span>
                  {isOAuthUser && <span className="text-blue-400 text-xs ml-2">(from Google)</span>}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isOAuthUser}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isOAuthUser 
                      ? 'bg-slate-600 border-slate-500 text-gray-300 cursor-not-allowed' 
                      : 'bg-slate-700 border-slate-600'
                  }`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email[0]}</p>
                )}
              </div>
              
              {/* Gamertag Field */}
              <div>
                <label htmlFor="gamertag" className="block text-sm font-medium mb-2">
                  Gamertag/Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="gamertag"
                  name="gamertag"
                  type="text"
                  value={formData.gamertag}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                {errors.gamertag && (
                  <p className="mt-1 text-sm text-red-400">{errors.gamertag[0]}</p>
                )}
              </div>
              
              {/* Primary Game Field */}
              <div>
                <label htmlFor="primaryGame" className="block text-sm font-medium mb-2">
                  Primary Game
                </label>
                <select
                  id="primaryGame"
                  name="primaryGame"
                  value={formData.primaryGame}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {gameOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.primaryGame && (
                  <p className="mt-1 text-sm text-red-400">{errors.primaryGame[0]}</p>
                )}
              </div>
              
              {/* Bio Field */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2">
                  Short Bio (Optional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Tell us a bit about yourself as a gamer..."
                />
              </div>
              
              {/* Password Fields - Only for non-OAuth users */}
              {!isOAuthUser && (
                <>
                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">{errors.password[0]}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      Password must be at least 8 characters
                    </p>
                  </div>
                  
                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.confirmPassword[0]}</p>
                    )}
                  </div>
                </>
              )}
              
              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="font-medium text-gray-300">
                    I agree to the <Link href="/terms" className="text-orange-400 hover:underline">Terms and Conditions</Link> and <Link href="/privacy" className="text-orange-400 hover:underline">Privacy Policy</Link>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-400">{errors.agreeToTerms[0]}</p>
                  )}
                </div>
              </div>
              
              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-md font-semibold hover:bg-orange-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
              
              {/* Login Link */}
              <div className="text-center text-gray-300 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-orange-400 hover:underline">
                  Log in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 