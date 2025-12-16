"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function AccountSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    bio: '',
    country: '',
    state: '',
    city: '',
    mainGame: '',
    socialLinks: {
      discord: '',
      twitch: '',
      youtube: '',
      twitter: ''
    }
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account');
      return;
    }

    if (status === 'authenticated') {
      fetchProfileData();
    }
  }, [status, router]);

  // Initialize form with defaults if no profile data
  useEffect(() => {
    if (!loading && !profileData && status === 'authenticated') {
      console.log('No profile data found, initializing with defaults');
      setFormData({
        displayName: session?.user?.name || '',
        email: session?.user?.email || '',
        bio: '',
        country: '',
        state: '',
        city: '',
        mainGame: '',
        socialLinks: {
          discord: '',
          twitch: '',
          youtube: '',
          twitter: ''
        }
      });
    }
  }, [loading, profileData, status, session]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile');
      if (response.data.profile) {
        const profile = response.data.profile;
        console.log('Account Settings - Profile data received:', profile);
        console.log('Account Settings - socialLinks type:', typeof profile.socialLinks, profile.socialLinks);
        setProfileData(profile);
        
        // Safely handle socialLinks - it might be an array, object, or undefined
        let socialLinksData = {
          discord: '',
          twitch: '',
          youtube: '',
          twitter: ''
        };
        
        if (profile.socialLinks) {
          if (Array.isArray(profile.socialLinks)) {
            // If it's an array (expected format)
            console.log('Social links is an array:', profile.socialLinks);
            socialLinksData = {
              discord: profile.socialLinks.find((link: any) => link.platform === 'discord')?.url || '',
              twitch: profile.socialLinks.find((link: any) => link.platform === 'twitch')?.url || '',
              youtube: profile.socialLinks.find((link: any) => link.platform === 'youtube')?.url || '',
              twitter: profile.socialLinks.find((link: any) => link.platform === 'twitter')?.url || ''
            };
          } else if (typeof profile.socialLinks === 'object') {
            // If it's already an object (alternative format)
            console.log('Social links is an object:', profile.socialLinks);
            socialLinksData = {
              discord: profile.socialLinks.discord || '',
              twitch: profile.socialLinks.twitch || '',
              youtube: profile.socialLinks.youtube || '',
              twitter: profile.socialLinks.twitter || ''
            };
          }
        }
        
        console.log('Final socialLinksData:', socialLinksData);
        
        setFormData({
          displayName: profile.displayName || profile.username || '',
          email: profile.email || session?.user?.email || '',
          bio: profile.bio || '',
          country: profile.country || '',
          state: profile.state || '',
          city: profile.city || '',
          mainGame: profile.mainGame || '',
          socialLinks: socialLinksData
        });
      } else {
        console.log('No profile data in response:', response.data);
        setMessage('No profile data found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const platform = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const socialLinksArray = Object.entries(formData.socialLinks)
        .filter(([_, url]) => url.trim() !== '')
        .map(([platform, url]) => ({ platform, url }));

      const updateData = {
        displayName: formData.displayName,
        bio: formData.bio,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        mainGame: formData.mainGame,
        socialLinks: socialLinksArray
      };

      await axios.patch('/api/profile', updateData);
      setMessage('Profile updated successfully!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy', icon: '🔐' }
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-950 text-white min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 pt-20">
        {/* Header */}
        <div className="bg-hero-gradient py-16 border-b border-neon-blue/20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-5xl font-gaming font-bold text-gradient mb-4">Account Settings</h1>
              <p className="text-gray-300 text-lg">Manage your account preferences and settings</p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="glass-effect border-b border-neon-blue/20 rounded-xl mb-8 backdrop-blur-lg">
            <div className="flex flex-wrap gap-2 p-4">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-neon'
                      : 'glass-effect text-gray-300 hover:text-neon-blue border border-neon-blue/20 hover:border-neon-blue/50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl mb-6 glass-effect border ${
                message.includes('success') || message.includes('Success') 
                  ? 'border-neon-green/50 bg-neon-green/10' 
                  : 'border-red-500/50 bg-red-500/10'
              }`}
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">
                  {message.includes('success') || message.includes('Success') ? '✅' : '❌'}
                </span>
                {message}
              </div>
            </motion.div>
          )}

          {/* Tab Content */}
          <div className="card-gaming">
            {activeTab === 'profile' && (
              <div>
                <h2 className="section-title">Profile Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Display Name</label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full glass-effect border border-gray-600 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                      placeholder="your.email@example.com"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                      placeholder="India"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                      placeholder="State/Province"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                      placeholder="Your city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Main Game</label>
                    <select
                      name="mainGame"
                      value={formData.mainGame}
                      onChange={handleInputChange}
                      className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white"
                    >
                      <option value="">Select your main game</option>
                      <option value="Valorant">Valorant</option>
                      <option value="BGMI">BGMI</option>
                      <option value="Free Fire">Free Fire</option>
                      <option value="Call of Duty Mobile">Call of Duty Mobile</option>
                      <option value="FIFA">FIFA</option>
                      <option value="Fortnite">Fortnite</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gradient">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        <span className="mr-2">💬</span>Discord
                      </label>
                      <input
                        type="url"
                        name="social_discord"
                        value={formData.socialLinks.discord}
                        onChange={handleInputChange}
                        className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                        placeholder="https://discord.gg/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        <span className="mr-2">🎮</span>Twitch
                      </label>
                      <input
                        type="url"
                        name="social_twitch"
                        value={formData.socialLinks.twitch}
                        onChange={handleInputChange}
                        className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                        placeholder="https://twitch.tv/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        <span className="mr-2">📺</span>YouTube
                      </label>
                      <input
                        type="url"
                        name="social_youtube"
                        value={formData.socialLinks.youtube}
                        onChange={handleInputChange}
                        className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        <span className="mr-2">🐦</span>Twitter
                      </label>
                      <input
                        type="url"
                        name="social_twitter"
                        value={formData.socialLinks.twitter}
                        onChange={handleInputChange}
                        className="w-full glass-effect border border-neon-blue/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all text-white placeholder-gray-400"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className={`btn-gaming ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="section-title">Security Settings</h2>
                <div className="space-y-6">
                  <div className="glass-effect p-6 rounded-xl border border-neon-blue/20">
                    <h3 className="text-lg font-semibold mb-2 text-gradient">Password</h3>
                    <p className="text-gray-400 mb-4">You're signed in with {session?.user?.email}</p>
                    <p className="text-sm text-gray-500">Password management is handled through your OAuth provider (Google/Discord).</p>
                  </div>
                  
                  <div className="glass-effect p-6 rounded-xl border border-neon-blue/20">
                    <h3 className="text-lg font-semibold mb-2 text-gradient">Two-Factor Authentication</h3>
                    <p className="text-gray-400 mb-4">Add an extra layer of security to your account</p>
                    <button className="btn-gaming-outline">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h2 className="section-title">Preferences</h2>
                <div className="space-y-6">
                  <div className="glass-effect p-6 rounded-xl border border-neon-blue/20">
                    <h3 className="text-lg font-semibold mb-4 text-gradient">Notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span>Tournament registration confirmations</span>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-neon-blue bg-transparent border-2 border-neon-blue/50 rounded focus:ring-neon-blue focus:ring-2" 
                          defaultChecked 
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Tournament reminders</span>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-neon-blue bg-transparent border-2 border-neon-blue/50 rounded focus:ring-neon-blue focus:ring-2" 
                          defaultChecked 
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Marketing emails</span>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-neon-blue bg-transparent border-2 border-neon-blue/50 rounded focus:ring-neon-blue focus:ring-2" 
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="glass-effect p-6 rounded-xl border border-neon-blue/20">
                    <h3 className="text-lg font-semibold mb-4 text-gradient">Display</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span>Dark Mode</span>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-neon-blue bg-transparent border-2 border-neon-blue/50 rounded focus:ring-neon-blue focus:ring-2" 
                          defaultChecked 
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Show online status</span>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-neon-blue bg-transparent border-2 border-neon-blue/50 rounded focus:ring-neon-blue focus:ring-2" 
                          defaultChecked 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h2 className="section-title">Privacy Settings</h2>
                <div className="space-y-6">
                  <div className="glass-effect p-6 rounded-xl border border-neon-blue/20">
                    <h3 className="text-lg font-semibold mb-4 text-gradient">Profile Visibility</h3>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <input type="radio" name="visibility" value="public" className="mr-3 text-neon-blue focus:ring-neon-blue" defaultChecked />
                        <div>
                          <div className="font-medium">Public</div>
                          <div className="text-sm text-gray-400">Anyone can view your profile</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <input type="radio" name="visibility" value="friends" className="mr-3 text-neon-blue focus:ring-neon-blue" />
                        <div>
                          <div className="font-medium">Friends only</div>
                          <div className="text-sm text-gray-400">Only your friends can view your profile</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <input type="radio" name="visibility" value="private" className="mr-3 text-neon-blue focus:ring-neon-blue" />
                        <div>
                          <div className="font-medium">Private</div>
                          <div className="text-sm text-gray-400">Only you can view your profile</div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="glass-effect p-6 rounded-xl border border-red-500/30 bg-red-500/5">
                    <h3 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h3>
                    <p className="text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 