"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';

function CredentialsList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/member/my-credentials', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        setItems(data.notifications || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-gray-400 text-sm">Loading…</div>;
  if (error) return <div className="text-red-400 text-sm">{error}</div>;
  if (!items.length) return <div className="text-gray-500 text-sm">No credentials yet.</div>;

  return (
    <div className="space-y-3">
      {items.map((n) => (
        <div key={n.id} className="bg-dark-900 border border-neon-blue/20 rounded-lg p-3">
          <div className="text-sm text-neon-blue font-semibold">{n.subject || 'Credentials'}</div>
          <div className="text-white whitespace-pre-wrap text-sm mt-1">{n.message}</div>
          <div className="text-gray-500 text-xs mt-2">{n.sent_at ? new Date(n.sent_at).toLocaleString() : ''}</div>
        </div>
      ))}
    </div>
  );
}

export default function MemberDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [tournamentHistory, setTournamentHistory] = useState<any[]>([]);
  const [joinDate, setJoinDate] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'profile', 'teams', 'tournaments', 'achievements'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      // If not authenticated, redirect to login
      if (status === 'unauthenticated') {
        router.push('/login?callbackUrl=/member');
        return;
      }

      if (status !== 'authenticated') return;

      setLoading(true);
      try {
        console.log('Fetching profile and registration data...');
        
        // Fetch profile data
        const profileResponse = await axios.get('/api/profile');
        if (profileResponse.data.profile) {
          console.log(`Profile data retrieved: ${profileResponse.data.profile.username || 'anonymous'}`);
          setProfileData(profileResponse.data.profile);
        
          // Format join date
          if (profileResponse.data.profile.createdAt) {
            const date = new Date(profileResponse.data.profile.createdAt);
            setJoinDate(date.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            }));
          }
        } else {
          console.error('No profile data returned from API');
        }

        // Fetch tournament history with no cache to ensure fresh data
        console.log('Fetching tournament history...');
        const historyResponse = await axios.get('/api/profile/history', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          params: {
            t: new Date().getTime() // Add timestamp to prevent caching
          }
        });
        
        if (historyResponse.data && historyResponse.data.registrations) {
          console.log(`Received ${historyResponse.data.registrations.length} tournament entries from API`);
          setTournamentHistory(historyResponse.data.registrations);
        } else {
          console.log('No tournament history returned from API');
          setTournamentHistory([]);
        }

        setError('');
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load member data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [status, router]);

  // Generate deterministic particles for background
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: (i * 11.3) % 100,
    top: (i * 7.7) % 100,
    delay: (i * 0.15) % 2,
    duration: 4 + (i % 3),
  }));

  // If still loading the session
  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-950">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // If error occurred
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-dark-950 text-white p-4">
        <div className="text-red-400 text-2xl mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-gaming"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Generate player statistics based on fetched data
  const playerStats = {
    totalMatches: profileData?.totalMatches || 0,
    wins: profileData?.matchesWon || 0,
    winRate: profileData?.totalMatches ? Math.round((profileData.matchesWon / profileData.totalMatches) * 100) : 0,
    tournaments: profileData?.totalTournaments || 0
  };

  // Determine admin based on session token or fetched profile
  const isAdmin = ((session?.user as any)?.role === 'admin') || (profileData?.role === 'admin');

  // Get recent tournament registrations
  const recentTournaments = tournamentHistory
    .sort((a, b) => {
      const dateA = new Date(a.startDate || 0).getTime();
      const dateB = new Date(b.startDate || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'teams', label: 'My Teams', icon: '👥' },
    { id: 'tournaments', label: 'My Tournaments', icon: '🏆' },
    { id: 'achievements', label: 'Achievements', icon: '🏅' },
  ];

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
        {/* Header with user info */}
        <div className="bg-hero-gradient py-16 border-b border-neon-blue/20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="flex flex-col lg:flex-row items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative mb-6 lg:mb-0 lg:mr-8">
                <div className="w-32 h-32 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center text-5xl font-bold overflow-hidden glow-animation">
                  {profileData?.avatarUrl ? (
                    <Image 
                      src={profileData.avatarUrl} 
                      alt={profileData.displayName || profileData.username} 
                      width={128} 
                      height={128}
                      style={{ objectFit: 'cover' }}
                      className="rounded-2xl"
                    />
                  ) : (
                    (profileData?.displayName || session?.user?.name)?.charAt(0) || 'U'
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-neon-green rounded-full border-4 border-dark-950 animate-pulse"></div>
              </div>
              
              <div className="text-center lg:text-left flex-grow">
                <h1 className="text-4xl lg:text-5xl font-gaming font-bold text-gradient mb-2">
                  {profileData?.displayName || session?.user?.name || 'Member'}
                </h1>
                <p className="text-gray-300 text-lg mb-4">{profileData?.email || session?.user?.email}</p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  <span className="glass-effect px-4 py-2 rounded-full text-sm border border-neon-orange/30">
                    <span className="mr-2">📅</span>
                    Member Since: {joinDate || 'Recently'}
                  </span>
                  <span className="glass-effect px-4 py-2 rounded-full text-sm border border-neon-blue/30">
                    <span className="mr-2">⭐</span>
                    {profileData?.experienceLevel ? 
                      `${profileData.experienceLevel.charAt(0).toUpperCase()}${profileData.experienceLevel.slice(1)}` : 
                      'Member'}
                  </span>
                  {profileData?.mainGame && (
                    <span className="glass-effect px-4 py-2 rounded-full text-sm border border-neon-purple/30">
                      <span className="mr-2">🎮</span>
                      {profileData.mainGame}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-6 lg:mt-0">
                <Link 
                  href="/performance"
                  className="btn-gaming text-lg px-8 py-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Performance
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="glass-effect border-b border-neon-blue/20 sticky top-20 z-20 backdrop-blur-lg">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide space-x-2 py-6">
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
        </div>
        
        {/* Content Based on Active Tab */}
        <div className="container mx-auto px-4 py-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { value: playerStats.totalMatches, label: 'Total Matches', icon: '⚔️', color: 'from-blue-500 to-purple-500' },
                  { value: playerStats.wins, label: 'Matches Won', icon: '🏆', color: 'from-green-500 to-teal-500' },
                  { value: `${playerStats.winRate}%`, label: 'Win Rate', icon: '📈', color: 'from-yellow-500 to-orange-500' },
                  { value: playerStats.tournaments, label: 'Tournaments', icon: '🎯', color: 'from-pink-500 to-red-500' },
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="card-gaming group relative overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    <div className="relative z-10 text-center">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                      <div className="text-gray-400 font-medium">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Recent Tournaments */}
              <motion.div 
                className="card-gaming"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="section-title mb-0">Recent Tournaments</h2>
                  <Link 
                    href="/tournaments"
                    className="text-neon-blue hover:text-neon-purple transition-colors font-medium"
                  >
                    Browse All Tournaments →
                  </Link>
                </div>
                
                {recentTournaments.length > 0 ? (
                  <div className="space-y-4">
                    {recentTournaments.map((tournament, index) => (
                      <motion.div 
                        key={tournament.registrationId || index} 
                        className="glass-effect rounded-xl p-6 border border-neon-blue/20 hover:border-neon-blue/50 transition-all"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                          <div className="mb-4 lg:mb-0">
                            <h3 className="font-bold text-xl text-white mb-2">{tournament.tournamentName}</h3>
                            <p className="text-neon-blue font-medium">{tournament.game}</p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <span className="glass-effect px-3 py-1 rounded-full text-sm border border-gray-600">
                              📅 {tournament.startDate || 'TBD'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              tournament.registrationStatus === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                              tournament.registrationStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                              tournament.registrationStatus === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {tournament.registrationStatus}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 glass-effect rounded-xl border border-neon-blue/20">
                    <div className="text-6xl mb-4">🎮</div>
                    <p className="text-gray-300 text-lg mb-6">You haven't participated in any tournaments yet.</p>
                    <Link 
                      href="/tournaments"
                      className="btn-gaming"
                    >
                      Browse Tournaments
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          )}
          
          {/* My Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Profile Header */}
              <div className="card-gaming">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="section-title mb-0">My Profile</h2>
                  <Link 
                    href="/profile/edit"
                    className="btn-gaming"
                  >
                    <span className="mr-2">✏️</span>
                    Edit Profile
                  </Link>
                </div>
                
                <div className="glass-effect p-8 rounded-xl border border-neon-blue/20">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                    {/* Avatar */}
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-neon-blue glow-animation">
                      {profileData?.avatarUrl ? (
                        <Image 
                          src={profileData.avatarUrl}
                          alt={profileData.displayName || profileData.username}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-4xl font-bold">
                          {(profileData?.displayName?.charAt(0) || profileData?.username?.charAt(0) || 'U').toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-grow text-center lg:text-left">
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gradient">
                        {profileData?.displayName || profileData?.username || 'User'}
                      </h1>
                      <p className="text-gray-300 mb-4 text-lg">
                        @{profileData?.username || 'username'}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                        {profileData?.experienceLevel && (
                          <div className="glass-effect px-4 py-2 rounded-xl border border-neon-blue/30">
                            <span className="text-neon-blue font-bold">
                              {profileData.experienceLevel.charAt(0).toUpperCase() + profileData.experienceLevel.slice(1)}
                            </span>
                          </div>
                        )}
                        {profileData?.mainGame && (
                          <div className="glass-effect px-4 py-2 rounded-xl border border-neon-purple/30">
                            <span className="text-neon-purple font-bold">{profileData.mainGame}</span>
                          </div>
                        )}
                        {(profileData?.city || profileData?.state || profileData?.country) && (
                          <div className="glass-effect px-4 py-2 rounded-xl border border-neon-green/30">
                            <span className="text-neon-green font-bold">
                              {[profileData.city, profileData.state, profileData.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {profileData?.bio && (
                        <div className="glass-effect p-4 rounded-xl border border-neon-blue/20">
                          <h3 className="text-lg font-bold mb-2 text-gradient">About Me</h3>
                          <p className="text-gray-300 leading-relaxed">{profileData.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="card-gaming">
                <h2 className="section-title">Detailed Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { value: profileData?.totalTournaments || 0, label: 'Total Tournaments', icon: '🏆', color: 'text-neon-orange' },
                    { value: profileData?.tournamentsWon || 0, label: 'Tournaments Won', icon: '🥇', color: 'text-neon-green' },
                    { value: profileData?.totalMatches || 0, label: 'Total Matches', icon: '⚔️', color: 'text-neon-blue' },
                    { value: profileData?.matchesWon || 0, label: 'Matches Won', icon: '🎯', color: 'text-neon-purple' },
                  ].map((stat, index) => (
                    <motion.div 
                      key={index} 
                      className="glass-effect p-6 rounded-xl text-center border border-neon-blue/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="text-3xl mb-3">{stat.icon}</div>
                      <div className={`text-2xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tournament History */}
              <div className="card-gaming">
                <h2 className="section-title">Tournament History</h2>
                {tournamentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {tournamentHistory.map((item, index) => (
                      <motion.div 
                        key={item.registrationId || index}
                        className="glass-effect p-6 rounded-xl border border-neon-blue/20 hover:border-neon-blue/50 transition-all group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="flex items-center flex-grow">
                            <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center text-2xl mr-4">
                              🏆
                            </div>
                            <div>
                              {item.tournamentId ? (
                                <Link href={`/tournaments/${item.tournamentId}`}>
                                  <h3 className="font-bold text-lg text-white group-hover:text-neon-blue transition-colors">{item.tournamentName}</h3>
                                </Link>
                              ) : (
                                <h3 className="font-bold text-lg text-white">{item.tournamentName}</h3>
                              )}
                              <div className="flex flex-wrap gap-3 mt-1">
                                <span className="text-sm text-gray-400">{item.game || 'Unknown Game'}</span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-400">{item.startDate || 'TBD'}</span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-400">{item.teamName || 'Individual'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                              item.registrationStatus === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                              item.registrationStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {item.registrationStatus ? `${item.registrationStatus.charAt(0).toUpperCase()}${item.registrationStatus.slice(1)}` : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 glass-effect rounded-xl border border-neon-blue/20">
                    <div className="text-8xl mb-6">🏆</div>
                    <h3 className="text-2xl font-bold mb-4 text-white">No Tournament History</h3>
                    <p className="text-gray-400 mb-8">You haven't participated in any tournaments yet. Join your first tournament to start building your competitive history!</p>
                    <Link href="/tournaments" className="btn-gaming">
                      <span className="mr-2">🎮</span>
                      Browse Tournaments
                    </Link>
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div className="card-gaming">
                <h2 className="section-title">Achievements & Badges</h2>
                {profileData?.achievements && profileData.achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profileData.achievements.map((achievement: any, index: number) => (
                      <motion.div 
                        key={index} 
                        className="glass-effect p-6 rounded-xl border border-neon-blue/20 hover:border-neon-blue/50 transition-all group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <div className="flex items-start">
                          <div className="w-16 h-16 bg-gradient-to-br from-neon-orange to-neon-pink rounded-2xl flex items-center justify-center text-3xl mr-4 glow-animation">
                            🏅
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-white group-hover:text-neon-blue transition-colors">{achievement.title}</h3>
                            <p className="text-gray-400 mt-2 leading-relaxed">{achievement.description}</p>
                            {achievement.date && (
                              <div className="text-xs text-neon-green mt-3 flex items-center">
                                <span className="mr-1">📅</span>
                                Achieved on {new Date(achievement.date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 glass-effect rounded-xl border border-neon-blue/20">
                    <div className="text-8xl mb-6">🏅</div>
                    <h3 className="text-2xl font-bold mb-4 text-white">No Achievements Yet</h3>
                    <p className="text-gray-400 mb-4">Participate in tournaments and events to earn achievements and badges</p>
                    <p className="text-sm text-gray-500 mb-8">Complete challenges, win tournaments, and reach milestones to unlock exclusive rewards</p>
                    <Link href="/tournaments" className="btn-gaming">
                      <span className="mr-2">🎯</span>
                      Start Competing
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* My Teams Tab */}
          {activeTab === 'teams' && (
            <motion.div 
              className="card-gaming"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="section-title">My Teams</h2>

              {/* Quick action: Send Credentials to registered players (admin only) */}
              {isAdmin && (
              <div className="glass-effect p-4 mb-6 rounded-xl border border-neon-blue/30">
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">Registration ID</label>
                    <input id="cred-reg-id" className="w-full bg-dark-900 border border-neon-blue/20 rounded-lg px-3 py-2 text-white" placeholder="registration UUID" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">To Email (optional)</label>
                    <input id="cred-email" className="w-full bg-dark-900 border border-neon-blue/20 rounded-lg px-3 py-2 text-white" placeholder="player@example.com" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">Tournament ID (for Send To All)</label>
                    <input id="cred-tournament-id" className="w-full bg-dark-900 border border-neon-blue/20 rounded-lg px-3 py-2 text-white" placeholder="tournament UUID" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm text-gray-400 mb-1">Message</label>
                  <textarea id="cred-message" className="w-full bg-dark-900 border border-neon-blue/20 rounded-lg px-3 py-2 text-white" rows={3} placeholder={`Room ID: XXXX\nPassword: YYYY\nBe ready at 8:45 PM.`}></textarea>
                </div>
                <div className="mt-3 flex gap-3">
                  <button
                    className="btn-gaming"
                    onClick={async () => {
                      const regId = (document.getElementById('cred-reg-id') as HTMLInputElement)?.value?.trim();
                      const email = (document.getElementById('cred-email') as HTMLInputElement)?.value?.trim();
                      const msg = (document.getElementById('cred-message') as HTMLTextAreaElement)?.value?.trim();
                      if (!regId && !email) {
                        alert('Provide at least Registration ID or Email');
                        return;
                      }
                      try {
                        const res = await fetch('/api/member/send-credentials', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ registrationId: regId || undefined, toEmail: email || undefined, message: msg || undefined })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Failed');
                        alert(`Credentials sent to ${data.to}`);
                      } catch (e: any) {
                        console.error('Send single credentials error:', e);
                        alert(e.message || 'Failed to send');
                      }
                    }}
                  >
                    Send Credentials
                  </button>
                  <button
                    className="btn-gaming"
                    onClick={async () => {
                      const tournamentId = (document.getElementById('cred-tournament-id') as HTMLInputElement)?.value?.trim();
                      const msg = (document.getElementById('cred-message') as HTMLTextAreaElement)?.value?.trim();
                      if (!tournamentId) {
                        alert('Enter Tournament ID');
                        return;
                      }
                      try {
                        const res = await fetch('/api/member/send-credentials/bulk', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tournamentId, message: msg || undefined, statusFilter: ['paid', 'confirmed'] })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Failed');
                        alert(`Sent to ${data.sent}/${data.total} players`);
                      } catch (e: any) {
                        console.error('Send bulk credentials error:', e);
                        alert(e.message || 'Failed to send');
                      }
                    }}
                  >
                    Send To All (Paid/Confirmed)
                  </button>
                  <Link href="/tournaments" className="btn-gaming-outline">Browse Tournaments</Link>
                </div>
              </div>
              )}

              {/* Member credential inbox */}
              {!isAdmin && (
                <div className="glass-effect p-4 mb-6 rounded-xl border border-neon-blue/30">
                  <h3 className="text-white font-semibold mb-2">Your Received Credentials</h3>
                  <CredentialsList />
                </div>
              )}

              <div className="text-gray-400 text-sm">Team management UI coming soon.</div>
            </motion.div>
          )}
          
          {/* My Tournaments Tab */}
          {activeTab === 'tournaments' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="card-gaming">
                <h2 className="section-title">My Tournaments</h2>
                
                {tournamentHistory && tournamentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {tournamentHistory.map((tournament, index) => (
                      <motion.div 
                        key={tournament.registrationId || tournament.tournamentId || index} 
                        className="glass-effect rounded-xl overflow-hidden border border-neon-blue/20 hover:border-neon-blue/50 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="p-6">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                            <div className="mb-4 lg:mb-0">
                              <h3 className="font-bold text-xl text-white mb-2">
                                {tournament.tournamentName || 'Tournament'}
                                {tournament.tournamentId && (
                                  <Link href={`/tournaments/${tournament.tournamentId}`}>
                                    <span className="ml-3 text-sm text-neon-blue hover:text-neon-purple transition-colors">
                                      View Tournament →
                                    </span>
                                  </Link>
                                )}
                              </h3>
                              <p className="text-neon-blue font-medium mb-2">{tournament.game || 'Various Games'}</p>
                              <span className="text-sm text-gray-400">Team: {tournament.teamName || 'Individual'}</span>
                            </div>
                            <div className="flex flex-col items-end space-y-3">
                              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                tournament.registrationStatus === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                                tournament.registrationStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                                tournament.registrationStatus === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                                tournament.registrationStatus === 'registered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                                'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {tournament.registrationStatus || 'Unknown'}
                              </span>
                              <div className="text-sm text-gray-400">
                                📅 {typeof tournament.startDate === 'string' ? 
                                  new Date(tournament.startDate).toLocaleDateString('en-US', {
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric'
                                  }) : 'Date TBD'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 glass-effect rounded-xl border border-neon-blue/20">
                    <div className="text-8xl mb-6">🏆</div>
                    <p className="text-xl text-white mb-4">No tournaments yet!</p>
                    <p className="text-gray-400 mb-8">Join your first tournament and start your esports journey.</p>
                    <Link 
                      href="/tournaments"
                      className="btn-gaming"
                    >
                      Browse Tournaments
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <motion.div 
              className="card-gaming"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="section-title">Achievements</h2>
              
              {profileData?.achievements?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profileData.achievements.map((achievement: any, index: number) => (
                    <motion.div 
                      key={index} 
                      className="glass-effect rounded-xl p-6 border border-neon-blue/20 hover:border-neon-blue/50 transition-all"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-start">
                        <div className="text-4xl mr-4">{achievement.icon || '🏆'}</div>
                        <div>
                          <h3 className="font-bold text-white mb-2">{achievement.title}</h3>
                          <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>
                          {achievement.awarded_at && (
                            <p className="text-xs text-neon-blue">
                              {new Date(achievement.awarded_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 glass-effect rounded-xl border border-neon-blue/20">
                  <div className="text-8xl mb-6">🏅</div>
                  <p className="text-xl text-white mb-4">No achievements yet!</p>
                  <p className="text-gray-400 mb-8">Participate in tournaments to earn achievements and show off your skills.</p>
                  <Link 
                    href="/tournaments"
                    className="btn-gaming"
                  >
                    Browse Tournaments
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}