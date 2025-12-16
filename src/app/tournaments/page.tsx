"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import axios from 'axios';

// Tournament type definition
type Tournament = {
  id: number;
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
  };
};

export default function TournamentsPage() {
  // State for filtering and sorting
  const [filters, setFilters] = useState({
    game: 'all',
    status: 'all',
    teamSize: 'all',
  });
  
  const [sortBy, setSortBy] = useState('startDate');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate deterministic particles for background
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: (i * 9.7) % 100,
    top: (i * 13.3) % 100,
    delay: (i * 0.12) % 2,
    duration: 3 + (i % 4),
  }));

  // Initialize tournaments on mount
  useEffect(() => {
    const fetchTournaments = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        
        // Build query params
        const queryParams = new URLSearchParams();
        
        if (filters.game !== 'all') {
          queryParams.append('game', filters.game);
        }
        
        if (filters.status !== 'all') {
          queryParams.append('status', filters.status);
        }
        
        if (filters.teamSize !== 'all') {
          queryParams.append('teamSize', filters.teamSize);
        }
        
        queryParams.append('sortBy', sortBy);
        
        // Make API call to fetch tournaments from our backend
        const response = await axios.get(`/api/tournaments?${queryParams.toString()}`, {
          timeout: 30000, // 30 second timeout (increased from 10s)
          headers: {
            'Content-Type': 'application/json',
          },
          // Add retry logic for network issues
          validateStatus: function (status) {
            return status < 500; // Resolve only if the status code is less than 500
          }
        });
        
        // Set fallback flag if data is mock data
        setIsFallbackData(response.data.isFallback || false);
        
        // Filter results by search query if provided
        let filteredTournaments = (response.data?.tournaments || []).filter((tournament: any) => 
          tournament && 
          tournament.name && 
          typeof tournament.name === 'string'
        );
        
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase().trim();
          filteredTournaments = filteredTournaments.filter((tournament: Tournament) => 
            tournament && 
            tournament.name && 
            tournament.game && 
            tournament.location && (
              tournament.name.toLowerCase().includes(query) ||
              tournament.game.toLowerCase().includes(query) ||
              tournament.location.toLowerCase().includes(query)
            )
          );
        }
        
        setTournaments(filteredTournaments);
        setError(null);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        
        // Retry logic for timeout errors
        if (retryCount < 2 && (err.code === 'ECONNABORTED' || err.message.includes('timeout'))) {
          console.log(`Retrying request (attempt ${retryCount + 1}/2)...`);
          setTimeout(() => fetchTournaments(retryCount + 1), 2000); // Wait 2 seconds before retry
          return;
        }
        
        // Use fallback data if API fails
        const fallbackTournaments = [
          {
            id: 1,
            name: "EpicEsports Valorant Championship",
            game: "Valorant",
            gameImage: "/images/valorant.jpg",
            startDate: "2024-06-15",
            endDate: "2024-06-20",
            registrationDeadline: "2024-06-10",
            prizePool: "₹1,00,000",
            teamSize: 5,
            maxTeams: 16,
            currentTeams: 14,
            location: "Online",
            status: "upcoming" as const,
            organizer: {
              name: "EpicEsports",
              verified: true
            }
          },
          {
            id: 2,
            name: "Delhi Gaming Festival - BGMI Tournament",
            game: "BGMI",
            gameImage: "/images/bgmi.jpg",
            startDate: "2024-07-05",
            endDate: "2024-07-07",
            registrationDeadline: "2024-07-01",
            prizePool: "₹50,000",
            teamSize: 4,
            maxTeams: 20,
            currentTeams: 18,
            location: "Delhi, India",
            status: "upcoming" as const,
            organizer: {
              name: "Delhi Gaming Association",
              verified: true
            }
          }
        ];
        
        setTournaments(fallbackTournaments);
        setIsFallbackData(true);
        setError('Unable to connect to server. Showing sample tournaments.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTournaments();
  }, [filters, sortBy, searchQuery]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30';
      case 'ongoing':
        return 'bg-neon-green/20 text-neon-green border border-neon-green/30';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      default:
        return 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30';
    }
  };

  // Define a type for registration status to include the canRegister property
  type RegistrationStatus = {
    text: string;
    color: string;
    canRegister: boolean;
  };

  const getRegistrationStatus = (tournament: Tournament): RegistrationStatus => {
    if (tournament.status === 'completed') {
      return { text: 'Tournament Ended', color: 'text-gray-400', canRegister: false };
    }
    
    if (tournament.status === 'ongoing') {
      return { text: 'In Progress', color: 'text-neon-green', canRegister: false };
    }
    
    if (tournament.currentTeams >= tournament.maxTeams) {
      return { text: 'Registration Closed', color: 'text-red-400', canRegister: false };
    }
    
    if (new Date() > new Date(tournament.registrationDeadline)) {
      return { text: 'Registration Closed', color: 'text-red-400', canRegister: false };
    }
    
    return { text: 'Registration Open', color: 'text-neon-orange', canRegister: true };
  };

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
        {/* Hero Section */}
        <section className="relative py-20 bg-hero-gradient border-b border-neon-blue/20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="hero-title mb-6">
                <span className="block">Epic</span>
                <span className="block text-gradient">Tournaments</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Discover and join competitive gaming tournaments across India. Show your skills and compete for prizes!
              </p>
              
              <motion.div 
                className="relative max-w-2xl mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  className="w-full glass-effect text-white border border-neon-blue/30 rounded-2xl py-4 px-6 pr-14 focus:outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/50 backdrop-blur-lg text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg 
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-neon-blue" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Filter Section */}
        <section className="py-8 glass-effect border-b border-neon-blue/20 backdrop-blur-lg sticky top-20 z-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="flex flex-wrap justify-between items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-wrap gap-4 lg:gap-6">
                {/* Game Filter */}
                <div>
                  <label htmlFor="game-filter" className="block text-sm text-gray-400 mb-2 font-medium">Game</label>
                  <select
                    id="game-filter"
                    className="glass-effect border border-neon-blue/30 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue backdrop-blur-sm"
                    value={filters.game}
                    onChange={(e) => handleFilterChange('game', e.target.value)}
                  >
                    <option value="all">All Games</option>
                    <option value="Valorant">Valorant</option>
                    <option value="BGMI">BGMI</option>
                    <option value="Counter-Strike 2">Counter-Strike 2</option>
                    <option value="Fortnite">Fortnite</option>
                    <option value="Apex Legends">Apex Legends</option>
                    <option value="Dota 2">Dota 2</option>
                  </select>
                </div>
                
                {/* Status Filter */}
                <div>
                  <label htmlFor="status-filter" className="block text-sm text-gray-400 mb-2 font-medium">Status</label>
                  <select
                    id="status-filter"
                    className="glass-effect border border-neon-blue/30 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue backdrop-blur-sm"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                {/* Team Size Filter */}
                <div>
                  <label htmlFor="team-size-filter" className="block text-sm text-gray-400 mb-2 font-medium">Team Size</label>
                  <select
                    id="team-size-filter"
                    className="glass-effect border border-neon-blue/30 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue backdrop-blur-sm"
                    value={filters.teamSize}
                    onChange={(e) => handleFilterChange('teamSize', e.target.value)}
                  >
                    <option value="all">All Sizes</option>
                    <option value="1">Solo</option>
                    <option value="2">Duo</option>
                    <option value="3">Trio</option>
                    <option value="4">Squad (4)</option>
                    <option value="5">Team (5)</option>
                  </select>
                </div>
              </div>
              
              {/* Sort Options */}
              <div>
                <label htmlFor="sort-by" className="block text-sm text-gray-400 mb-2 font-medium">Sort By</label>
                <select
                  id="sort-by"
                  className="glass-effect border border-neon-blue/30 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue backdrop-blur-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Date (Soonest)</option>
                  <option value="prize">Prize Pool (Highest)</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Tournament List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Tournaments Grid */}
            <div className="mt-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="loading-spinner"></div>
                </div>
              ) : error ? (
                <motion.div 
                  className="glass-effect border border-red-500/30 text-white p-6 rounded-xl mb-6 bg-red-500/10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-red-400">{error}</p>
                </motion.div>
              ) : tournaments.length === 0 ? (
                <motion.div 
                  className="text-center py-16 card-gaming"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-8xl mb-6">🏆</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">No tournaments found</h3>
                  <p className="text-gray-400 mb-8">Try adjusting your filters or check back later for new tournaments.</p>
                  <Link href="/tournaments" className="btn-gaming">
                    Reset Filters
                  </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {tournaments.filter(tournament => tournament && tournament.name).map((tournament, index) => (
                    <motion.div 
                      key={tournament.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="card-gaming group relative overflow-hidden"
                      whileHover={{ y: -5 }}
                    >
                      {/* Tournament Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-xl">
                        <Image
                          src={tournament.gameImage || '/images/tournaments-bg.jpg'}
                          alt={tournament.game || 'Tournament'}
                          fill
                          style={{ objectFit: "cover" }}
                          className="transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(tournament.status || 'upcoming')}`}>
                            {tournament.status ? tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1) : 'Upcoming'}
                          </span>
                          <div className="glass-effect px-3 py-1 rounded-full text-xs font-semibold border border-neon-blue/30">
                            {tournament.game || 'Game'}
                          </div>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <div className="glass-effect px-4 py-2 rounded-xl border border-neon-orange/30">
                            <span className="text-neon-orange font-bold text-lg">{tournament.prizePool || '₹0'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tournament Details */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h2 className="text-xl font-bold mb-2 text-white group-hover:text-neon-blue transition-colors">
                            {tournament.name || 'Tournament'}
                          </h2>
                          <div className="flex items-center text-sm text-gray-400">
                            <span className="mr-2">By</span>
                            <span className="font-semibold text-white">{tournament.organizer?.name || 'Organizer'}</span>
                            {tournament.organizer?.verified && (
                              <svg className="ml-1 w-4 h-4 text-neon-blue" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                              </svg>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="glass-effect p-3 rounded-lg border border-neon-blue/20">
                            <p className="text-xs text-gray-400 mb-1">Start Date</p>
                            <p className="font-semibold text-white">{formatDate(tournament.startDate)}</p>
                          </div>
                          <div className="glass-effect p-3 rounded-lg border border-neon-blue/20">
                            <p className="text-xs text-gray-400 mb-1">Team Size</p>
                            <p className="font-semibold text-white">{tournament.teamSize === 1 ? 'Solo' : `${tournament.teamSize} Players`}</p>
                          </div>
                          <div className="glass-effect p-3 rounded-lg border border-neon-blue/20">
                            <p className="text-xs text-gray-400 mb-1">Teams</p>
                            <p className="font-semibold text-white">{tournament.currentTeams} / {tournament.maxTeams}</p>
                          </div>
                          <div className="glass-effect p-3 rounded-lg border border-neon-blue/20">
                            <p className="text-xs text-gray-400 mb-1">Location</p>
                            <p className="font-semibold text-white text-xs">{tournament.location}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className={`${getRegistrationStatus(tournament).color} text-sm font-semibold`}>
                            {getRegistrationStatus(tournament).text}
                          </span>
                          <Link
                            href={`/tournaments/${tournament.id}`}
                            className="btn-gaming-outline px-6 py-2"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Host Tournament CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="glass-effect rounded-3xl p-12 border border-neon-blue/30 relative overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-pink/10"></div>
              <div className="relative z-10 lg:flex items-center justify-between">
                <div className="lg:w-2/3 mb-8 lg:mb-0">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gradient">
                    Want to host your own tournament?
                  </h2>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    If you're interested in organizing a tournament on our platform, we'd love to hear from you. 
                    Our team will work with you to set up the perfect competitive experience.
                  </p>
                  <Link 
                    href="/host-tournament"
                    className="btn-gaming text-lg px-8 py-4"
                  >
                    <span className="mr-2">🚀</span>
                    Host a Tournament
                  </Link>
                </div>
                <div className="lg:w-1/3 flex justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center text-6xl glow-animation">
                      🏆
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl blur-xl opacity-50"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 