"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import TournamentRegistrationForm from '@/components/TournamentRegistrationForm';

// Tournament type definition
type Tournament = {
  id: string;
  name: string;
  game: string;
  gameImage: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  prizePool: string;
  teamSize: number;
  maxTeams: number;
  currentTeams: number;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  organizer: {
    name: string;
    verified: boolean;
    contact: string;
  };
  description: string;
  rules: string;
  prizes: {
    position: number;
    reward: string;
  }[];
  schedule: {
    stage: string;
    date: string;
    details: string;
  }[];
  registrationFee: number;
  streamLink?: string;
  bannerImage?: string; // Added bannerImage to type
};

export default function TournamentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isFallbackData, setIsFallbackData] = useState(false);
  
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/tournaments/${id}`);
        setTournament(response.data.tournament);
        
        // Check if this is fallback data
        if (response.data.isFallback) {
          setIsFallbackData(true);
          setError(response.data.error || 'Showing sample data');
        } else {
          setIsFallbackData(false);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching tournament:', err);
        setError(err.response?.data?.error || 'Failed to load tournament details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchTournament();
    }
  }, [id]);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-gradient-to-r from-neon-blue to-blue-500 border-neon-blue/50';
      case 'ongoing':
        return 'bg-gradient-to-r from-neon-green to-green-500 border-neon-green/50';
      case 'completed':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 border-gray-500/50';
      default:
        return 'bg-gradient-to-r from-neon-blue to-blue-500 border-neon-blue/50';
    }
  };
  
  const getRegistrationStatus = () => {
    if (!tournament) return { text: 'Loading...', color: 'text-gray-400', canRegister: false };
    
    if (tournament.status === 'completed') {
      return { text: 'Tournament Ended', color: 'text-gray-400', canRegister: false };
    }
    
    if (tournament.status === 'ongoing') {
      return { text: 'In Progress', color: 'text-neon-green', canRegister: false };
    }
    
    if (tournament.currentTeams >= tournament.maxTeams) {
      return { text: 'Registration Closed (Full)', color: 'text-neon-red', canRegister: false };
    }
    
    if (new Date() > new Date(tournament.registrationDeadline)) {
      return { text: 'Registration Closed', color: 'text-neon-red', canRegister: false };
    }
    
    return { 
      text: `Registration Open (${tournament.currentTeams}/${tournament.maxTeams} teams)`, 
      color: 'text-neon-green',
      canRegister: true
    };
  };
  
  const handleRegisterClick = () => {
    if (!session) {
      // Redirect to login page if not authenticated
      router.push(`/login?redirect=/tournaments/${id}`);
      return;
    }
    
    // Show registration form
    setShowRegistrationForm(true);
  };
  
  const handleRegistrationSuccess = () => {
    setShowRegistrationForm(false);
    setRegistrationSuccess(true);
    
    // Refresh tournament data to show updated team count
    if (id) {
      setTimeout(async () => {
        try {
          const response = await axios.get(`/api/tournaments/${id}`);
          setTournament(response.data.tournament);
        } catch (err) {
          console.error('Error refreshing tournament data:', err);
        }
      }, 1000);
    }
  };

  // Generate deterministic particles for background
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: (i * 11.3) % 100,
    top: (i * 7.7) % 100,
    delay: (i * 0.15) % 2,
    duration: 4 + (i % 3),
  }));
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black"></div>
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
        </div>
        
        <div className="relative z-10 text-center">
          <div className="loading-spinner mb-4"></div>
          <div className="text-2xl font-gaming text-gradient">Loading tournament details...</div>
        </div>
      </div>
    );
  }
  
  if (!tournament) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-6">🏆</div>
          <div className="text-2xl font-gaming text-gradient mb-4">Tournament not found</div>
          <div className="mt-6">
            <Link href="/tournaments" className="btn-gaming">
              Back to Tournaments
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const registrationStatus = getRegistrationStatus();
  
  return (
    <div className="min-h-screen bg-dark-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black"></div>
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
      </div>

      {/* Fallback data warning banner */}
      <AnimatePresence>
        {isFallbackData && (
          <motion.div 
            className="fixed top-20 inset-x-0 z-50 bg-gradient-to-r from-neon-orange/20 to-yellow-500/20 border border-neon-orange/50 text-white p-4 glass-effect"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="container mx-auto px-4 flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-neon-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-neon-orange font-medium">{error || 'Showing sample tournament data. This is not a real tournament.'}</span>
              </div>
              <div>
                <Link href="/tournaments" className="bg-neon-orange text-dark-950 px-4 py-2 rounded-xl text-sm font-bold hover:bg-neon-orange/80 transition-colors">
                  Back to Tournaments
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Registration success notification */}
      <AnimatePresence>
        {registrationSuccess && (
          <motion.div 
            className="fixed top-20 inset-x-0 z-50 bg-gradient-to-r from-neon-green/20 to-green-500/20 border border-neon-green/50 text-white p-4 glass-effect"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="container mx-auto px-4 flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-neon-green font-medium">Registration successful! Your team has been registered for the tournament.</span>
              </div>
              <motion.button 
                onClick={() => setRegistrationSuccess(false)}
                className="text-neon-green hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tournament Header */}
      <div className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col lg:flex-row items-start gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Tournament Image */}
            <motion.div 
              className="w-full lg:w-1/3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative h-64 lg:h-80 w-full rounded-2xl overflow-hidden border-2 border-neon-blue/30 glow-animation">
                <Image 
                  src={tournament.bannerImage || tournament.gameImage || "/images/tournaments-bg.jpg"}
                  alt={tournament.name || "Tournament"}
                  fill
                  unoptimized={Boolean(tournament.bannerImage && tournament.bannerImage.startsWith('http'))}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </motion.div>
            
            {/* Tournament Info */}
            <motion.div 
              className="w-full lg:w-2/3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-4 py-2 text-sm font-bold rounded-xl border glass-effect ${getStatusBadgeColor(tournament.status || 'upcoming')}`}>
                  {tournament.status ? tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1) : 'Upcoming'}
                </span>
                <span className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-neon-purple to-purple-500 border border-neon-purple/50 rounded-xl glass-effect">
                  {tournament.game || 'Game'}
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-gaming font-bold text-gradient mb-4">{tournament.name || 'Tournament'}</h1>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-gray-400">Organized by</span>
                <span className="font-bold text-neon-blue flex items-center">
                  {tournament.organizer?.name || 'Tournament Organizer'}
                  {tournament.organizer?.verified && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neon-green ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Start Date', value: tournament.startDate ? formatDate(tournament.startDate) : 'TBD', icon: '📅' },
                  { label: 'End Date', value: tournament.endDate ? formatDate(tournament.endDate) : 'TBD', icon: '🏁' },
                  { label: 'Registration Deadline', value: tournament.registrationDeadline ? formatDate(tournament.registrationDeadline) : 'TBD', icon: '⏰' },
                  { label: 'Location', value: tournament.location || 'Online', icon: '📍' }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="glass-effect p-4 rounded-xl border border-neon-blue/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  >
                    <p className="text-gray-400 text-sm mb-1 flex items-center">
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </p>
                    <p className="font-bold text-white">{item.value}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Prize Pool', value: tournament.prizePool, color: 'text-neon-orange', icon: '💰' },
                  { label: 'Team Size', value: `${tournament.teamSize} players`, color: 'text-neon-blue', icon: '👥' },
                  { label: 'Registration Fee', value: tournament.registrationFee > 0 ? `₹${tournament.registrationFee}` : 'FREE', color: 'text-neon-green', icon: '💳' }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="glass-effect p-6 rounded-xl text-center border border-neon-blue/20 group hover:border-neon-blue/50 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <p className="text-gray-400 text-sm mb-2">{item.label}</p>
                    <p className={`text-2xl font-bold ${item.color} glow-text`}>{item.value}</p>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <div className={`text-lg font-bold ${registrationStatus.color} flex items-center`}>
                  <span className="mr-2">
                    {registrationStatus.canRegister ? '✅' : 
                     registrationStatus.color.includes('green') ? '🟢' : '🔴'}
                  </span>
                  {registrationStatus.text}
                </div>
                
                {registrationStatus.canRegister && (
                  <motion.button
                    onClick={handleRegisterClick}
                    className="btn-gaming text-lg px-8 py-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Register Now
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="relative z-10 glass-effect border-t border-b border-neon-blue/20 sticky top-20 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide space-x-2 py-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'rules', label: 'Rules', icon: '📋' },
              { id: 'schedule', label: 'Schedule', icon: '📅' },
              { id: 'prizes', label: 'Prizes', icon: '🏆' }
            ].map((tab, index) => (
              <motion.button 
                key={tab.id}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-neon' 
                    : 'glass-effect text-gray-300 hover:text-neon-blue border border-neon-blue/20 hover:border-neon-blue/50'
                }`}
                onClick={() => setActiveTab(tab.id)}
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
      
      {/* Tab Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="card-gaming"
            >
              <h2 className="section-title">🎮 Tournament Overview</h2>
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="whitespace-pre-line text-gray-300 leading-relaxed">{tournament.description}</p>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="card-gaming"
            >
              <h2 className="section-title">📋 Tournament Rules</h2>
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="whitespace-pre-line text-gray-300 leading-relaxed">{tournament.rules}</p>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="card-gaming"
            >
              <h2 className="section-title">📅 Tournament Schedule</h2>
              {tournament.schedule && tournament.schedule.length > 0 ? (
                <div className="space-y-6">
                  {tournament.schedule.map((item, index) => (
                    <motion.div 
                      key={index} 
                      className="glass-effect border border-neon-blue/20 rounded-xl p-6 hover:border-neon-blue/50 transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <h3 className="text-xl font-bold text-gradient">{item.stage}</h3>
                        <span className="text-neon-blue font-medium">{formatDate(item.date)}</span>
                      </div>
                      <p className="mt-3 text-gray-300 leading-relaxed">{item.details}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 glass-effect rounded-xl border border-neon-blue/20">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-400 text-lg">Schedule will be posted soon.</p>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'prizes' && (
            <motion.div
              key="prizes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="card-gaming"
            >
              <h2 className="section-title">🏆 Prize Distribution</h2>
              {tournament.prizes && tournament.prizes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tournament.prizes.map((prize, index) => (
                    <motion.div 
                      key={index} 
                      className={`glass-effect border rounded-xl p-8 text-center group hover:scale-105 transition-all ${
                        prize.position === 1 ? 'border-neon-orange glow-animation' : 
                        prize.position === 2 ? 'border-gray-400' : 
                        prize.position === 3 ? 'border-amber-600' : 
                        'border-neon-blue/20'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className={`text-4xl mb-4 ${
                        prize.position === 1 ? 'text-neon-orange' : 
                        prize.position === 2 ? 'text-gray-400' : 
                        prize.position === 3 ? 'text-amber-600' : 
                        'text-neon-blue'
                      }`}>
                        {prize.position === 1 ? '🥇' : 
                         prize.position === 2 ? '🥈' : 
                         prize.position === 3 ? '🥉' : '🏅'}
                      </div>
                      <div className={`text-xl font-bold mb-3 ${
                        prize.position === 1 ? 'text-neon-orange' : 
                        prize.position === 2 ? 'text-gray-400' : 
                        prize.position === 3 ? 'text-amber-600' : 
                        'text-white'
                      }`}>
                        {prize.position === 1 ? '1st Place' : 
                         prize.position === 2 ? '2nd Place' : 
                         prize.position === 3 ? '3rd Place' : 
                         `${prize.position}th Place`}
                      </div>
                      <div className="text-2xl font-bold text-gradient">{prize.reward}</div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 glass-effect rounded-xl border border-neon-blue/20">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-gray-400 text-lg">Prize information will be posted soon.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Contact Section */}
      <motion.div 
        className="relative z-10 glass-effect py-12 mt-12 border-t border-neon-blue/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <h2 className="section-title">📞 Contact Tournament Organizer</h2>
          <p className="mb-6 text-gray-300 text-lg">
            If you have any questions about this tournament, please contact the organizer:
          </p>
          <motion.div 
            className="glass-effect p-6 rounded-xl border border-neon-blue/20 inline-block hover:border-neon-blue/50 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <div className="font-bold text-xl text-gradient mb-2">{tournament.organizer?.name || 'Tournament Organizer'}</div>
                            <div className="text-neon-blue font-medium">{tournament.organizer?.contact || 'contact@epicesports.tech'}</div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Registration Form Modal */}
      <AnimatePresence>
        {showRegistrationForm && tournament && (
          <TournamentRegistrationForm 
            tournament={tournament}
            onCancel={() => setShowRegistrationForm(false)}
            onSuccess={handleRegistrationSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 