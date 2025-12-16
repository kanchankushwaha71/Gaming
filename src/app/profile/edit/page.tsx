"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

interface Profile {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  bio?: string;
  mainGame?: string;
  country?: string;
  state?: string;
  city?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  socialLinks?: { platform: string; url: string }[];
  experienceLevel?: string;
  achievements?: any[];
  totalTournaments: number;
  tournamentsWon: number;
  totalMatches: number;
  matchesWon: number;
}

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate deterministic particles for background
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: (i * 16.2) % 100,
    top: (i * 4.8) % 100,
    delay: (i * 0.24) % 2,
    duration: 5.5 + (i % 3),
  }));
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    mainGame: '',
    country: '',
    state: '',
    city: '',
    experienceLevel: 'beginner',
    avatarUrl: '',
    bannerUrl: '',
    socialLinks: [] as { platform: string; url: string }[]
  });

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/profile');
        const profileData = response.data.profile;
        setProfile(profileData);
        
        // Initialize form with existing profile data
        setFormData({
          displayName: profileData.displayName || '',
          bio: profileData.bio || '',
          mainGame: profileData.mainGame || '',
          country: profileData.country || '',
          state: profileData.state || '',
          city: profileData.city || '',
          experienceLevel: profileData.experienceLevel || 'beginner',
          avatarUrl: profileData.avatarUrl || '',
          bannerUrl: profileData.bannerUrl || '',
          socialLinks: Array.isArray(profileData.socialLinks) ? profileData.socialLinks : []
        });
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        
        if (err.response?.status === 404 && err.response?.data?.needsSetup) {
          // Redirect to profile setup if needed
          router.push('/profile/setup');
          return;
        }
        
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    if (status === 'authenticated' && session) {
      fetchProfile();
    } else if (status === 'unauthenticated') {
      router.push('/login?redirect=/profile/edit');
    }
  }, [session, status, router]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (error) {
      setError(null);
    }
  };

  // Handle social link changes
  const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
    const updatedLinks = [...formData.socialLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      socialLinks: updatedLinks
    }));
  };

  // Add new social link
  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
    }));
  };

  // Remove social link
  const removeSocialLink = (index: number) => {
    const updatedLinks = formData.socialLinks.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      socialLinks: updatedLinks
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const response = await axios.post('/api/profile', formData);
      
      setSuccessMessage('Profile updated successfully!');
      toast.success('Profile updated!');
      
      // Redirect to profile page after short delay
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-dark-950 min-h-screen text-white relative overflow-hidden">
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
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-dark-950 min-h-screen text-white relative overflow-hidden">
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
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <motion.div 
            className="card-gaming text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-8xl mb-6">👤</div>
            <h3 className="text-2xl font-bold mb-4 text-white">Profile Not Found</h3>
            <p className="text-gray-400 mb-8">Create your gaming profile to get started</p>
            <Link href="/profile/setup" className="btn-gaming">
              Create Profile
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-dark-950 text-white min-h-screen relative overflow-hidden">
      <Toaster position="top-right" />
      
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
        {/* Header */}
        <section className="relative py-20 bg-hero-gradient border-b border-neon-blue/20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="hero-title mb-6">
                <span className="block">Edit Your</span>
                <span className="block text-gradient">Profile</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Update your Epic Esports India profile information and showcase your gaming identity
              </p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="glass-effect px-6 py-3 rounded-xl border border-neon-blue/20">
                  <span className="text-2xl mr-2">👤</span>
                  <span className="font-bold text-neon-blue">@{profile.username}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div 
              className="card-gaming"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {error && (
                <motion.div 
                  className="bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl mb-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    {error}
                  </div>
                </motion.div>
              )}
              
              {successMessage && (
                <motion.div 
                  className="bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl mb-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">✅</span>
                    {successMessage}
                  </div>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div className="glass-effect p-6 rounded-xl border border-neon-blue/20">
                    <h2 className="text-2xl font-bold mb-6 text-gradient flex items-center">
                      <span className="mr-3">📝</span>
                      Basic Information
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Username (read-only) */}
                      <div className="lg:col-span-2">
                        <label htmlFor="username" className="block mb-3 font-medium text-white">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          value={profile.username}
                          className="w-full glass-effect border border-gray-600 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                          disabled
                        />
                        <p className="mt-2 text-sm text-gray-400">
                          Username cannot be changed
                        </p>
                      </div>
                      
                      {/* Display Name */}
                      <div>
                        <label htmlFor="displayName" className="block mb-3 font-medium text-white">
                          Display Name
                        </label>
                        <input
                          type="text"
                          id="displayName"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleChange}
                          className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                          placeholder="Your preferred display name"
                          maxLength={30}
                        />
                      </div>
                      
                      {/* Main Game */}
                      <div>
                        <label htmlFor="mainGame" className="block mb-3 font-medium text-white">
                          Main Game
                        </label>
                        <select
                          id="mainGame"
                          name="mainGame"
                          value={formData.mainGame}
                          onChange={handleChange}
                          className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white"
                        >
                          <option value="">Select your main game</option>
                          <option value="Valorant">Valorant</option>
                          <option value="BGMI">BGMI</option>
                          <option value="CSGO">CS:GO</option>
                          <option value="Fortnite">Fortnite</option>
                          <option value="League of Legends">League of Legends</option>
                          <option value="Dota 2">Dota 2</option>
                          <option value="Apex Legends">Apex Legends</option>
                          <option value="Call of Duty">Call of Duty</option>
                          <option value="Free Fire">Free Fire</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      {/* Bio */}
                      <div className="lg:col-span-2">
                        <label htmlFor="bio" className="block mb-3 font-medium text-white">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                          placeholder="Tell us about yourself as a gamer"
                          rows={4}
                          maxLength={250}
                        ></textarea>
                        <p className="mt-2 text-sm text-gray-400">
                          {formData.bio.length}/250 characters
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Gaming Details */}
                  <div className="glass-effect p-6 rounded-xl border border-neon-blue/20">
                    <h2 className="text-2xl font-bold mb-6 text-gradient flex items-center">
                      <span className="mr-3">🎮</span>
                      Gaming Details
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Experience Level */}
                      <div>
                        <label htmlFor="experienceLevel" className="block mb-3 font-medium text-white">
                          Experience Level
                        </label>
                        <select
                          id="experienceLevel"
                          name="experienceLevel"
                          value={formData.experienceLevel}
                          onChange={handleChange}
                          className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="professional">Professional</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="glass-effect p-6 rounded-xl border border-neon-blue/20">
                    <h2 className="text-2xl font-bold mb-6 text-gradient flex items-center">
                      <span className="mr-3">📍</span>
                      Location
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="country" className="block mb-3 font-medium text-white">
                          Country
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                          placeholder="Country"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block mb-3 font-medium text-white">
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label htmlFor="city" className="block mb-3 font-medium text-white">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                          placeholder="City"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Images */}
                  <div className="glass-effect p-6 rounded-xl border border-neon-blue/20">
                    <h2 className="text-2xl font-bold mb-6 text-gradient flex items-center">
                      <span className="mr-3">🖼️</span>
                      Profile Images
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="avatarUrl" className="block mb-3 font-medium text-white">
                          Avatar URL
                        </label>
                        <input
                          type="url"
                          id="avatarUrl"
                          name="avatarUrl"
                          value={formData.avatarUrl}
                          onChange={handleChange}
                          className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                          placeholder="https://example.com/avatar.jpg"
                        />
                        {formData.avatarUrl && (
                          <div className="mt-4 flex items-center">
                            <div className="h-16 w-16 rounded-xl overflow-hidden glass-effect border border-neon-blue/30 mr-4">
                              <Image 
                                src={formData.avatarUrl}
                                alt="Avatar preview"
                                width={64}
                                height={64}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "https://via.placeholder.com/64";
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-400">Preview</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="bannerUrl" className="block mb-3 font-medium text-white">
                          Banner URL
                        </label>
                        <input
                          type="url"
                          id="bannerUrl"
                          name="bannerUrl"
                          value={formData.bannerUrl}
                          onChange={handleChange}
                          className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                          placeholder="https://example.com/banner.jpg"
                        />
                        {formData.bannerUrl && (
                          <div className="mt-4">
                            <div className="h-32 w-full rounded-xl overflow-hidden glass-effect border border-neon-blue/30">
                              <Image 
                                src={formData.bannerUrl}
                                alt="Banner preview"
                                width={500}
                                height={128}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "https://via.placeholder.com/500x128";
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-400 mt-2 block">Preview</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="glass-effect p-6 rounded-xl border border-neon-blue/20">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gradient flex items-center">
                        <span className="mr-3">🔗</span>
                        Social Links
                      </h2>
                      <button
                        type="button"
                        onClick={addSocialLink}
                        className="btn-gaming-outline text-sm"
                      >
                        <span className="mr-2">➕</span>
                        Add Link
                      </button>
                    </div>
                    
                    {(!formData.socialLinks || formData.socialLinks.length === 0) ? (
                      <div className="glass-effect border border-neon-blue/20 rounded-xl px-6 py-8 text-center text-gray-400">
                        <div className="text-4xl mb-4">🔗</div>
                        <p>No social links added. Click "Add Link" to connect your social profiles.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Array.isArray(formData.socialLinks) && formData.socialLinks.map((link, index) => (
                          <motion.div 
                            key={index} 
                            className="flex gap-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <select
                              value={link.platform}
                              onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                              className="w-1/3 glass-effect border border-neon-blue/30 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white"
                            >
                              <option value="">Platform</option>
                              <option value="twitter">Twitter</option>
                              <option value="twitch">Twitch</option>
                              <option value="youtube">YouTube</option>
                              <option value="discord">Discord</option>
                              <option value="instagram">Instagram</option>
                              <option value="facebook">Facebook</option>
                              <option value="linkedin">LinkedIn</option>
                              <option value="website">Website</option>
                            </select>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                              placeholder="https://..."
                              className="flex-1 glass-effect border border-neon-blue/30 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                            />
                            <button
                              type="button"
                              onClick={() => removeSocialLink(index)}
                              className="bg-red-500/20 text-red-400 border border-red-500/50 p-3 rounded-xl hover:bg-red-500/30 transition-all"
                              aria-label="Remove link"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      type="submit"
                      className={`btn-gaming flex-1 flex items-center justify-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="loading-spinner mr-3"></div>
                          Updating Profile...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">💾</span>
                          Update Profile
                        </>
                      )}
                    </button>
                    
                    <Link 
                      href="/account"
                      className="btn-gaming-outline flex-1 text-center flex items-center justify-center"
                    >
                      <span className="mr-2">❌</span>
                      Cancel
                    </Link>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 