"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('forums');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate deterministic particles for background
  const particles = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    left: (i * 11.7) % 100,
    top: (i * 8.9) % 100,
    delay: (i * 0.18) % 2,
    duration: 4.2 + (i % 3),
  }));
  
  // Sample forum categories
  const forumCategories = [
    {
      id: 1,
      name: 'General Discussion',
      description: 'Talk about anything related to esports and gaming in India',
      topics: 156,
      posts: 2340,
      icon: '🎮',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 2,
      name: 'Tournament Discussions',
      description: 'Discuss ongoing and upcoming tournaments',
      topics: 89,
      posts: 1245,
      icon: '🏆',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 3,
      name: 'Team Recruitment',
      description: 'Find teammates or join a team',
      topics: 210,
      posts: 1892,
      icon: '👥',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 4,
      name: 'Game Strategies',
      description: 'Share tips, tricks, and strategies for different games',
      topics: 134,
      posts: 2567,
      icon: '🧠',
      color: 'from-pink-500 to-red-500'
    },
    {
      id: 5,
      name: 'Technical Support',
      description: 'Get help with technical issues',
      topics: 78,
      posts: 980,
      icon: '🔧',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      id: 6,
      name: 'Content Creation',
      description: 'Discuss streaming, YouTube, and content creation',
      topics: 95,
      posts: 1430,
      icon: '📹',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  // Sample Discord communities
  const discordCommunities = [
    {
      id: 1,
      name: 'EpicEsports India Official',
      members: '5,230',
      description: 'The official Discord server for EpicEsports India. Join for tournament announcements, community events, and more.',
      image: '/images/community/discord-1.jpg',
      link: 'https://discord.gg/',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      id: 2,
      name: 'Indian Valorant Hub',
      members: '12,456',
      description: 'A community for Indian Valorant players to find teams, discuss strategies, and participate in community tournaments.',
      image: '/images/community/discord-2.jpg',
      link: 'https://discord.gg/',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      id: 3,
      name: 'BGMI Competitive',
      members: '8,932',
      description: 'Connect with BGMI players and teams. Regular scrims and custom room matches.',
      image: '/images/community/discord-3.jpg',
      link: 'https://discord.gg/',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 4,
      name: 'Esports College Network',
      members: '3,657',
      description: 'Connecting college students interested in esports across India. Inter-college tournaments and networking.',
      image: '/images/community/discord-4.jpg',
      link: 'https://discord.gg/',
      gradient: 'from-pink-500 to-red-500'
    }
  ];

  // Sample events
  const communityEvents = [
    {
      id: 1,
      title: 'Community Game Night',
      date: 'June 10, 2023',
      time: '8:00 PM IST',
      platform: 'Discord',
      description: 'Join us for a fun night of casual gaming. Games include Among Us, Fall Guys, and more!',
      image: '/images/events/community-meetup.jpg',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      id: 2,
      title: 'Q&A with Pro Players',
      date: 'June 15, 2023',
      time: '7:30 PM IST',
      platform: 'Discord & YouTube',
      description: 'Ask questions and get advice from professional esports players from top Indian teams.',
      image: '/images/events/qa-session.jpg',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 3,
      title: "Beginner's Workshop: Valorant",
      date: 'June 20, 2023',
      time: '6:00 PM IST',
      platform: 'Discord & Valorant',
      description: 'Learn the basics of Valorant from experienced players. Perfect for newcomers to the game!',
      image: '/images/events/workshop.jpg',
      gradient: 'from-green-500 to-teal-500'
    }
  ];

  const tabs = [
    { id: 'forums', label: 'Forums', icon: '💬' },
    { id: 'discord', label: 'Discord Communities', icon: '🎮' },
    { id: 'events', label: 'Community Events', icon: '🎪' },
    { id: 'teams', label: 'Find Teams', icon: '👥' },
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
                <span className="block">Join Our</span>
                <span className="block text-gradient">Community</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Connect with fellow gamers, find teams, share strategies, and be part of India's growing esports ecosystem
              </p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {[
                  { label: 'Active Members', count: '25K+', icon: '👥' },
                  { label: 'Discord Servers', count: '15+', icon: '🎮' },
                  { label: 'Forum Topics', count: '500+', icon: '💬' },
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
        
        {/* Tabs */}
        <section className="py-8 glass-effect border-b border-neon-blue/20 backdrop-blur-lg sticky top-20 z-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="flex overflow-x-auto scrollbar-hide space-x-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
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
            </motion.div>
          </div>
        </section>
        
        {/* Content Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {/* Forums */}
            {activeTab === 'forums' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h2 className="section-title mb-0">Community Forums</h2>
                    <p className="text-gray-400 text-lg">Engage in discussions with fellow gamers</p>
                  </div>
                  <Link 
                    href="/community/forums"
                    className="btn-gaming"
                  >
                    <span className="mr-2">✏️</span>
                    Create New Topic
                  </Link>
                </div>
                
                <div className="grid gap-6">
                  {forumCategories.map((category, index) => (
                    <motion.div 
                      key={category.id}
                      className="card-gaming group relative overflow-hidden"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                      <div className="relative z-10 flex items-start">
                        <div className="w-16 h-16 glass-effect rounded-2xl flex items-center justify-center text-3xl mr-6 border border-neon-blue/30 group-hover:border-neon-blue/50 transition-colors">
                          {category.icon}
                        </div>
                        <div className="flex-grow">
                          <Link 
                            href={`/community/forums/${category.id}`}
                            className="text-2xl font-bold text-white hover:text-neon-blue transition-colors group-hover:text-neon-blue"
                          >
                            {category.name}
                          </Link>
                          <p className="text-gray-400 mt-2 leading-relaxed">{category.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="glass-effect px-4 py-2 rounded-xl border border-neon-blue/20 mb-2">
                            <div className="text-lg font-bold text-neon-blue">{category.topics}</div>
                            <div className="text-xs text-gray-400">topics</div>
                          </div>
                          <div className="glass-effect px-4 py-2 rounded-xl border border-neon-purple/20">
                            <div className="text-lg font-bold text-neon-purple">{category.posts}</div>
                            <div className="text-xs text-gray-400">posts</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Discord Communities */}
            {activeTab === 'discord' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-12">
                  <h2 className="section-title">Discord Communities</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    Join our vibrant Discord servers and connect with gamers in real-time
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {discordCommunities.map((community, index) => (
                    <motion.div 
                      key={community.id}
                      className="card-gaming group relative overflow-hidden"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                    >
                      {/* Community Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-xl">
                        <Image
                          src={community.image}
                          alt={community.name}
                          fill
                          style={{ objectFit: "cover" }}
                          className="transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                        <div className={`absolute inset-0 bg-gradient-to-t ${community.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                        
                        {/* Members Badge */}
                        <div className="absolute top-4 right-4">
                          <div className="glass-effect px-3 py-1 rounded-full text-sm font-semibold border border-neon-blue/30">
                            <span className="text-neon-blue">{community.members}</span>
                            <span className="text-gray-300 ml-1">members</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Community Details */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-neon-blue transition-colors">
                          {community.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{community.description}</p>
                        <a 
                          href={community.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-gaming w-full text-center bg-[#5865F2] hover:bg-[#4752C4] border-[#5865F2] hover:border-[#4752C4]"
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
                          </svg>
                          Join Discord
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Community Events */}
            {activeTab === 'events' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-12">
                  <h2 className="section-title">Upcoming Community Events</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    Join our exciting community events and connect with fellow gamers
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {communityEvents.map((event, index) => (
                    <motion.div 
                      key={event.id}
                      className="card-gaming group relative overflow-hidden"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                    >
                      {/* Event Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-xl">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          style={{ objectFit: "cover" }}
                          className="transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                        <div className={`absolute inset-0 bg-gradient-to-t ${event.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                      </div>
                      
                      {/* Event Details */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-neon-blue transition-colors">
                          {event.title}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">{event.date}</span>
                          </div>
                          <div className="flex items-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">{event.time}</span>
                          </div>
                          <div className="flex items-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">{event.platform}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{event.description}</p>
                        
                        <Link 
                          href={`/events/${event.id}`}
                          className="btn-gaming w-full text-center"
                        >
                          Register
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-12">
                  <Link 
                    href="/events"
                    className="text-neon-blue hover:text-neon-purple transition-colors inline-flex items-center text-lg font-medium"
                  >
                    View all community events
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Find Teams */}
            {activeTab === 'teams' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <h2 className="section-title">Find Your Team</h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Looking for teammates or want to join an existing team? This is the place to start. Browse team listings or create your own to find the perfect match for your competitive journey.
                  </p>
                </div>
                
                <motion.div 
                  className="card-gaming text-center mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-6xl mb-6">👥</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Team Finder Coming Soon!</h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    We're currently developing our team matchmaking feature. In the meantime, you can use our Discord community to connect with other players.
                  </p>
                  <button
                    onClick={() => setActiveTab('discord')}
                    className="btn-gaming bg-[#5865F2] hover:bg-[#4752C4] border-[#5865F2] hover:border-[#4752C4]"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
                    </svg>
                    Join Our Discord
                  </button>
                </motion.div>
                
                <motion.div 
                  className="glass-effect rounded-3xl p-12 border border-neon-blue/30 relative overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-pink/10"></div>
                  <div className="relative z-10 lg:flex items-center">
                    <div className="lg:w-2/3 mb-8 lg:mb-0">
                      <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-gradient">
                        Want to be notified when Team Finder launches?
                      </h3>
                      <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                        Sign up for our newsletter to get updates on all our new features and community tools.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="email" 
                          placeholder="Your email address" 
                          className="flex-1 px-4 py-3 glass-effect border border-neon-blue/30 rounded-xl focus:outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/50 backdrop-blur-sm text-white placeholder-gray-400"
                        />
                        <button className="btn-gaming px-8 py-3">
                          Subscribe
                        </button>
                      </div>
                    </div>
                    <div className="lg:w-1/3 flex justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center text-4xl glow-animation">
                          📢
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl blur-xl opacity-50"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
} 