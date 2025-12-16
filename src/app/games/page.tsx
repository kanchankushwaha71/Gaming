"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ClientOnly from '@/components/ClientOnly';

export default function GamesPage() {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const games = [
    {
      id: 'valorant',
      name: 'Valorant',
      description: 'Compete in high-stakes tactical shooter tournaments featuring Valorant, Riot Games\' popular 5v5 character-based tactical FPS.',
      image: '/images/valorant.jpg',
      tournamentCount: 8,
      category: 'pc',
      players: '2.5M+',
      icon: '🎯'
    },
    {
      id: 'bgmi',
      name: 'BGMI',
      description: 'Join Battlegrounds Mobile India competitions and showcase your battle royale skills in solo, duo, or squad formats.',
      image: '/images/bgmi.jpg',
      tournamentCount: 5,
      category: 'mobile',
      players: '5M+',
      icon: '🏝️'
    },
    {
      id: 'cod-mobile',
      name: 'COD Mobile',
      description: 'Participate in Call of Duty Mobile tournaments featuring both multiplayer and battle royale formats.',
      image: '/images/cod-mobile.jpg',
      tournamentCount: 3,
      category: 'mobile',
      players: '3M+',
      icon: '💥'
    },
    {
      id: 'free-fire',
      name: 'Free Fire',
      description: 'Compete in Garena Free Fire tournaments with fast-paced battle royale action on mobile devices.',
      image: '/images/free-fire.jpg',
      tournamentCount: 4,
      category: 'mobile',
      players: '8M+',
      icon: '🔥'
    },
    {
      id: 'fifa',
      name: 'FIFA',
      description: 'Test your football gaming skills in competitive FIFA tournaments for both casual and professional players.',
      image: '/images/fifa.jpg',
      tournamentCount: 2,
      category: 'console',
      players: '900K+',
      icon: '⚽'
    },
    {
      id: 'csgo',
      name: 'CS:GO',
      description: 'Join Counter-Strike: Global Offensive tournaments and prove your tactical shooting skills.',
      image: '/images/csgo.jpg',
      tournamentCount: 6,
      category: 'pc',
      players: '1.8M+',
      icon: '🔫'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'mobile', name: 'Mobile', icon: '📱' },
    { id: 'pc', name: 'PC', icon: '💻' },
    { id: 'console', name: 'Console', icon: '🎮' }
  ];

  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  return (
    <div className="bg-dark-950 text-white min-h-screen">
      {/* Simple Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black"></div>
        <ClientOnly>
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 15 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-neon-blue rounded-full"
                style={{
                  left: `${(i * 20) % 100}%`,
                  top: `${(i * 25) % 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 5 + (i % 2),
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </ClientOnly>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24">
        {/* Hero Section - Better Spacing */}
        <section className="py-12 border-b border-neon-blue/20">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-gaming text-gradient mb-6">
                Game Categories
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                Choose your game and compete with the best players across India
              </p>
              
              {/* Search and Filter - Better Layout */}
              <div className="flex flex-col lg:flex-row gap-4 max-w-3xl mx-auto mb-8">
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="flex-1 px-6 py-4 bg-dark-800/50 border border-neon-blue/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:bg-dark-800 transition-all"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="lg:w-48 px-6 py-4 bg-dark-800/50 border border-neon-blue/30 rounded-xl text-white focus:outline-none focus:border-neon-blue focus:bg-dark-800 transition-all"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id} className="bg-dark-800">
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Games Grid - Much Better Layout */}
        <section className="py-16">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
              {filteredGames.map((game, index) => (
                <motion.div 
                  key={game.id} 
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="glass-effect rounded-2xl overflow-hidden border border-neon-blue/20 hover:border-neon-blue/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-neon-blue/20">
                    {/* Game Image - Better Proportions */}
                    <div className="relative h-56 lg:h-64 overflow-hidden">
                      <Image
                        src={game.image}
                        alt={game.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 3}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      
                      {/* Floating Stats - Better Positioning */}
                      <div className="absolute top-4 left-4">
                        <div className="glass-effect px-4 py-2 rounded-full text-sm font-semibold border border-neon-blue/40 backdrop-blur-md">
                          <span className="text-neon-blue">{game.players}</span>
                          <span className="text-gray-300 ml-1">Players</span>
                        </div>
                      </div>
                      
                      <div className="absolute top-4 right-4">
                        <div className="glass-effect px-4 py-2 rounded-full text-sm font-semibold border border-neon-orange/40 backdrop-blur-md">
                          <span className="text-neon-orange">{game.tournamentCount}</span>
                          <span className="text-gray-300 ml-1">Tournaments</span>
                        </div>
                      </div>

                      {/* Game Icon - Better Placement */}
                      <div className="absolute bottom-4 left-4">
                        <div className="w-14 h-14 glass-effect rounded-2xl flex items-center justify-center text-3xl border border-neon-blue/40 backdrop-blur-md group-hover:scale-110 transition-transform">
                          {game.icon}
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute bottom-4 right-4">
                        <div className="glass-effect px-3 py-1 rounded-full text-xs font-semibold border border-gray-500/40 backdrop-blur-md">
                          <span className="text-gray-300 capitalize">{game.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Game Details - Better Spacing */}
                    <div className="p-6 lg:p-8">
                      <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-neon-blue transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-gray-400 mb-6 leading-relaxed text-sm lg:text-base line-clamp-3">
                        {game.description}
                      </p>
                      
                      {/* Action Buttons - Better Design */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link 
                          href={`/tournaments?game=${game.id}`}
                          className="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold py-3 px-6 rounded-xl text-center transition-all duration-300 hover:shadow-lg hover:shadow-neon-blue/30 hover:scale-105"
                        >
                          <span className="mr-2">🏆</span>
                          Join Tournaments
                        </Link>
                        <Link 
                          href={`/games/${game.id}`}
                          className="flex-1 border-2 border-neon-blue/50 text-neon-blue font-semibold py-3 px-6 rounded-xl text-center transition-all duration-300 hover:bg-neon-blue/10 hover:border-neon-blue hover:scale-105"
                        >
                          <span className="mr-2">📊</span>
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State - Better Design */}
            {filteredGames.length === 0 && (
              <motion.div 
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-3xl font-bold mb-4 text-white">No games found</h3>
                <p className="text-gray-400 text-lg mb-8">Try adjusting your search or filter criteria</p>
                <button 
                  onClick={() => {
                    setSearchFilter('');
                    setSelectedCategory('all');
                  }}
                  className="btn-gaming px-8 py-4"
                >
                  <span className="mr-2">🔄</span>
                  Reset Filters
                </button>
              </motion.div>
            )}
          </div>
        </section>
        
        {/* Quick Stats - Better Spacing */}
        <section className="py-16 border-t border-neon-blue/20 bg-dark-900/30">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { value: '25K+', label: 'Active Players', icon: '👥' },
                { value: '500+', label: 'Tournaments', icon: '🏆' },
                { value: '₹50L+', label: 'Prize Pool', icon: '💰' },
                { value: '15+', label: 'Game Titles', icon: '🎮' },
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="glass-effect rounded-2xl p-6 lg:p-8 text-center border border-neon-blue/20 hover:border-neon-blue/40 transition-all duration-300 hover:transform hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-4xl lg:text-5xl mb-3">{stat.icon}</div>
                  <div className="text-2xl lg:text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-sm lg:text-base font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section - Better Design */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div 
              className="glass-effect rounded-3xl p-8 lg:p-12 border border-neon-blue/30 text-center relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-neon-purple/5 to-neon-pink/5"></div>
              <div className="relative z-10">
                <div className="text-6xl lg:text-7xl mb-6">🎮</div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gradient">
                  Ready to compete?
                </h2>
                <p className="text-gray-300 text-lg lg:text-xl mb-8 leading-relaxed max-w-2xl mx-auto">
                  Join thousands of players in epic tournaments and climb the leaderboards!
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
                  <Link 
                    href="/register"
                    className="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold py-4 px-8 rounded-xl text-center transition-all duration-300 hover:shadow-xl hover:shadow-neon-blue/30 hover:scale-105"
                  >
                    <span className="mr-2">🚀</span>
                    Get Started
                  </Link>
                  <Link 
                    href="/tournaments"
                    className="flex-1 border-2 border-neon-blue/50 text-neon-blue font-bold py-4 px-8 rounded-xl text-center transition-all duration-300 hover:bg-neon-blue/10 hover:border-neon-blue hover:scale-105"
                  >
                    <span className="mr-2">🏆</span>
                    Browse Tournaments
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 