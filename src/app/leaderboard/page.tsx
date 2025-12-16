"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import axios from 'axios';

// Types for the leaderboard data
interface LeaderboardPlayer {
  rank: number;
  player: string;
  avatar: string;
  score: number;
  winRate: number;
  kills: number;
  matches: number;
}

interface LeaderboardPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface LeaderboardResponse {
  players: LeaderboardPlayer[];
  pagination: LeaderboardPagination;
}

export default function LeaderboardPage() {
  const [activeGame, setActiveGame] = useState('valorant');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>([]);
  const [pagination, setPagination] = useState<LeaderboardPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate deterministic particles for background
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: (i * 13.1) % 100,
    top: (i * 7.3) % 100,
    delay: (i * 0.19) % 2,
    duration: 4.5 + (i % 3),
  }));
  
  const games = [
    { id: 'valorant', name: 'Valorant', icon: '🎯', gradient: 'from-red-500 to-orange-500' },
    { id: 'csgo', name: 'CS:GO', icon: '💥', gradient: 'from-blue-500 to-purple-500' },
    { id: 'fortnite', name: 'Fortnite', icon: '🏗️', gradient: 'from-purple-500 to-pink-500' },
    { id: 'lol', name: 'League of Legends', icon: '⚔️', gradient: 'from-yellow-500 to-orange-500' },
    { id: 'dota2', name: 'Dota 2', icon: '🛡️', gradient: 'from-green-500 to-teal-500' }
  ];
  
  // Fetch leaderboard data from the API
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get<LeaderboardResponse>(`/api/leaderboard?game=${activeGame}&limit=10`);
        setLeaderboardData(response.data.players);
        setPagination(response.data.pagination);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data. Please try again later.');
        // If there's an error, use fallback empty array
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboardData();
  }, [activeGame]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600', text: 'text-black', icon: '👑' };
    if (rank === 2) return { bg: 'bg-gradient-to-r from-gray-300 to-gray-500', text: 'text-black', icon: '🥈' };
    if (rank === 3) return { bg: 'bg-gradient-to-r from-amber-600 to-amber-800', text: 'text-white', icon: '🥉' };
    return { bg: 'bg-gradient-to-r from-neon-blue to-neon-purple', text: 'text-white', icon: '🏅' };
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
                <span className="block">EpicEsports</span>
                <span className="block text-gradient">Leaderboard</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Compete with the best players across India and climb the ranks in your favorite games
              </p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {[
                  { label: 'Active Players', count: '50K+', icon: '👥' },
                  { label: 'Games Tracked', count: '5+', icon: '🎮' },
                  { label: 'Matches Analyzed', count: '1M+', icon: '📊' },
                ].map((stat, index) => (
                  <div key={index} className="glass-effect px-6 py-3 rounded-xl border border-neon-blue/20">
                    <span className="text-2xl mr-2">{stat.icon}</span>
                    <span className="font-bold text-neon-blue">{stat.count}</span>
                    <span className="text-gray-300 ml-2">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Game Selection */}
        <section className="py-8 glass-effect border-b border-neon-blue/20 backdrop-blur-lg sticky top-20 z-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-2 text-white">Select Game</h2>
              <p className="text-gray-400">Choose a game to view its leaderboard</p>
            </motion.div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {games.map((game, index) => (
                <motion.button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                    activeGame === game.id 
                      ? `bg-gradient-to-r ${game.gradient} text-white shadow-neon` 
                      : 'glass-effect text-gray-300 hover:text-neon-blue border border-neon-blue/20 hover:border-neon-blue/50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">{game.icon}</span>
                  <span className="font-medium">{game.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Leaderboard Content */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div 
              className="card-gaming"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white capitalize mb-2">
                    {games.find(g => g.id === activeGame)?.name} Top Players
                  </h2>
                  <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="glass-effect px-4 py-2 rounded-xl border border-neon-blue/20">
                  <span className="text-neon-blue font-semibold">Season 5</span>
                </div>
              </div>
              
              {/* Table header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 mb-6 px-6 py-4 glass-effect rounded-xl border border-neon-blue/20">
                <div className="col-span-1 text-gray-400 font-medium">Rank</div>
                <div className="col-span-4 text-gray-400 font-medium">Player</div>
                <div className="col-span-2 text-right text-gray-400 font-medium">Score</div>
                <div className="col-span-2 text-right text-gray-400 font-medium">Win Rate</div>
                <div className="col-span-2 text-right text-gray-400 font-medium">Kills</div>
                <div className="col-span-1 text-right text-gray-400 font-medium">Matches</div>
              </div>
              
              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-center py-20">
                  <div className="loading-spinner"></div>
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <motion.div 
                  className="glass-effect border border-red-500/30 text-white p-6 rounded-xl mb-6 bg-red-500/10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <p className="text-red-400 mb-4">{error}</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="btn-gaming"
                    >
                      Try Again
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* Leaderboard list */}
              {!loading && !error && (
                <>
                  {leaderboardData.length === 0 ? (
                    <motion.div 
                      className="text-center py-16 glass-effect rounded-xl border border-neon-blue/20"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="text-8xl mb-6">🏆</div>
                      <h3 className="text-2xl font-bold mb-4 text-white">No Data Available</h3>
                      <p className="text-gray-400">No leaderboard data available for this game. Check back soon!</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {leaderboardData.map((player, index) => {
                        const rankBadge = getRankBadge(player.rank);
                        return (
                          <motion.div
                            key={player.rank}
                            variants={itemVariants}
                            className={`grid grid-cols-3 lg:grid-cols-12 gap-4 p-6 rounded-xl items-center group relative overflow-hidden ${
                              player.rank <= 3 
                                ? 'glass-effect border border-neon-blue/50 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10' 
                                : 'glass-effect border border-neon-blue/20 hover:border-neon-blue/50'
                            }`}
                            whileHover={{ y: -2 }}
                          >
                            {player.rank <= 3 && (
                              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 group-hover:from-neon-blue/10 group-hover:to-neon-purple/10 transition-all"></div>
                            )}
                            
                            {/* Rank */}
                            <div className="col-span-1 flex items-center justify-center lg:justify-start relative z-10">
                              <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold text-lg ${rankBadge.bg} ${rankBadge.text} shadow-lg`}>
                                <span className="mr-1">{rankBadge.icon}</span>
                                <span>{player.rank}</span>
                              </div>
                            </div>
                            
                            {/* Player */}
                            <div className="col-span-2 lg:col-span-4 flex items-center relative z-10">
                              <div className="relative w-12 h-12 mr-4 rounded-xl overflow-hidden bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center glow-animation">
                                <span className="text-white font-bold text-lg">{player.player.charAt(0)}</span>
                              </div>
                              <div>
                                <div className="font-bold text-white text-lg group-hover:text-neon-blue transition-colors">{player.player}</div>
                                <div className="text-sm text-gray-400">Pro Player</div>
                              </div>
                            </div>
                            
                            {/* Stats (responsive) */}
                            <div className="hidden lg:block lg:col-span-2 text-right relative z-10">
                              <span className="text-neon-orange font-bold text-lg">{player.score.toLocaleString()}</span>
                              <div className="text-xs text-gray-400">Score</div>
                            </div>
                            <div className="hidden lg:block lg:col-span-2 text-right relative z-10">
                              <span className="text-neon-green font-bold text-lg">{player.winRate}%</span>
                              <div className="text-xs text-gray-400">Win Rate</div>
                            </div>
                            <div className="hidden lg:block lg:col-span-2 text-right relative z-10">
                              <span className="text-neon-blue font-bold text-lg">{player.kills.toLocaleString()}</span>
                              <div className="text-xs text-gray-400">Kills</div>
                            </div>
                            <div className="hidden lg:block lg:col-span-1 text-right relative z-10">
                              <span className="text-gray-300 font-bold">{player.matches}</span>
                              <div className="text-xs text-gray-400">Matches</div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                  
                  {/* Pagination controls */}
                  {pagination && pagination.pages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <div className="flex space-x-2">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                              pageNum === pagination.page
                                ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-neon'
                                : 'glass-effect text-gray-300 hover:text-neon-blue border border-neon-blue/20 hover:border-neon-blue/50'
                            }`}
                            onClick={() => {
                              // Would add page navigation here
                            }}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Regional filters and season selector */}
              <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-4 pt-6 border-t border-neon-blue/20">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-medium">Region:</span>
                  <select className="glass-effect border border-neon-blue/30 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/50 backdrop-blur-sm">
                    <option>Global</option>
                    <option>Asia Pacific</option>
                    <option>North America</option>
                    <option>Europe</option>
                    <option>South America</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-medium">Season:</span>
                  <select className="glass-effect border border-neon-blue/30 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/50 backdrop-blur-sm">
                    <option>Season 5 (Current)</option>
                    <option>Season 4</option>
                    <option>Season 3</option>
                    <option>Season 2</option>
                    <option>Season 1</option>
                  </select>
                </div>
              </div>
            </motion.div>
            
            {/* Additional information */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                className="card-gaming"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center text-2xl mr-4">
                    📊
                  </div>
                  <h3 className="text-2xl font-bold text-gradient">How Rankings Work</h3>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Our leaderboard rankings are calculated based on a proprietary algorithm that takes into account:
                </p>
                <ul className="space-y-3 text-gray-300">
                  {[
                    'Match performance (kills, assists, objectives)',
                    'Win rate percentage',
                    'Level of competition',
                    'Consistency across matches',
                    'Participation in official tournaments'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-neon-blue rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-400 mt-6 text-sm leading-relaxed">
                  Rankings are updated daily. Only players who have completed at least 50 matches in the current season are eligible.
                </p>
              </motion.div>
              
              <motion.div 
                className="card-gaming"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-orange to-neon-pink rounded-xl flex items-center justify-center text-2xl mr-4">
                    🏆
                  </div>
                  <h3 className="text-2xl font-bold text-gradient">Seasonal Rewards</h3>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Top ranked players at the end of each season receive exclusive rewards:
                </p>
                <ul className="space-y-4 text-gray-300">
                  {[
                    { rank: 'Top 10', reward: 'Premium Battle Pass + 1000 EpicCoins', color: 'text-yellow-400' },
                    { rank: 'Top 50', reward: '500 EpicCoins + Seasonal Weapon Skin', color: 'text-neon-blue' },
                    { rank: 'Top 100', reward: '250 EpicCoins + Exclusive Avatar', color: 'text-neon-purple' },
                    { rank: 'Top 500', reward: 'Seasonal Profile Badge', color: 'text-neon-green' }
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className={`${item.color} font-bold mr-3 min-w-fit`}>{item.rank}:</span>
                      <span>{item.reward}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-400 mt-6 text-sm leading-relaxed">
                  EpicEsports also scouts top players for professional gaming opportunities and sponsorships.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 