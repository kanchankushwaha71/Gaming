"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate deterministic particles for background
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: (i * 15.7) % 100,
    top: (i * 5.3) % 100,
    delay: (i * 0.23) % 2,
    duration: 5.2 + (i % 3),
  }));

  // Sample team data
  const teamMembers = [
    {
      id: 1,
      name: 'Shubham Kushwaha',
      role: 'Founder & CEO',
      image: '/images/team/shubham.jpg',
      bio: 'Passionate gamer and entrepreneur with a vision to elevate the Indian esports scene to global standards. Full-stack developer specializing in blockchain, web3, and decentralized technologies.',
      gradient: 'from-blue-500 to-purple-500',
      social: {
        linkedin: 'https://www.linkedin.com/in/shubham-kushwaha-038940249/',
        github: 'https://github.com/Quadwinner',
      }
    }
  ];

  const stats = [
    { value: '1k+', label: 'Players Engaged', icon: '👥', gradient: 'from-blue-500 to-purple-500' },
    { value: '5+', label: 'Tournaments Hosted', icon: '🏆', gradient: 'from-yellow-500 to-orange-500' },
    { value: '10+', label: 'Partner Colleges', icon: '🎓', gradient: 'from-green-500 to-teal-500' },
    { value: '₹2L+', label: 'Prize Pool Distributed', icon: '💰', gradient: 'from-pink-500 to-red-500' },
  ];

  const milestones = [
    {
      year: '2025',
      title: 'Platform Launch',
      description: 'EpicEsports India officially launched with our first major tournament.',
      icon: '🚀'
    },
    {
      year: '2025',
      title: 'Community Growth',
      description: 'Reached 10,000+ registered players and hosted 50+ tournaments.',
      icon: '📈'
    },
    {
      year: '2025',
      title: 'College Partnerships',
      description: 'Partnered with 25+ colleges across India for inter-college tournaments.',
      icon: '🤝'
    },
    {
      year: '2026',
      title: 'Future Vision',
      description: 'Expanding to become India\'s premier esports platform.',
      icon: '🎯'
    }
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
                <span className="block">About</span>
                <span className="block text-gradient">EpicEsports India</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Building the future of competitive gaming in India, one tournament at a time.
              </p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {[
                  { label: 'Founded', count: '2025', icon: '🎯' },
                  { label: 'Team Members', count: '1', icon: '👥' },
                  { label: 'Active Users', count: 'counting...', icon: '🎮' },
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

        {/* Mission & Vision Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div 
                className="card-gaming"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center text-2xl mr-4">
                    🎯
                  </div>
                  <h2 className="text-3xl font-bold text-gradient">Our Mission</h2>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  To create a thriving esports ecosystem in India that provides equal opportunities for all gamers to compete, 
                  learn, and grow. We aim to bridge the gap between casual gaming and professional esports by offering 
                  structured tournaments, educational resources, and community support.
                </p>
              </motion.div>

              <motion.div 
                className="card-gaming"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-orange to-neon-pink rounded-xl flex items-center justify-center text-2xl mr-4">
                    🚀
                  </div>
                  <h2 className="text-3xl font-bold text-gradient">Our Vision</h2>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  To establish India as a global powerhouse in esports by nurturing talent, fostering innovation, 
                  and creating world-class gaming experiences. We envision a future where Indian esports athletes 
                  compete at the highest international levels and inspire the next generation of gamers.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-hero-gradient border-y border-neon-blue/20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="section-title">Our Impact</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Numbers that showcase our commitment to growing the Indian esports community
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="card-gaming group text-center relative overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">{stat.icon}</div>
                    <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                    <div className="text-gray-400 font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="section-title">Our Journey</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Key milestones in our mission to transform Indian esports
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {milestones.map((milestone, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start mb-12 last:mb-0"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center text-2xl mr-6 glow-animation">
                    {milestone.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="glass-effect p-6 rounded-xl border border-neon-blue/20 hover:border-neon-blue/50 transition-all">
                      <div className="flex items-center mb-3">
                        <span className="text-neon-blue font-bold text-lg mr-3">{milestone.year}</span>
                        <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
                      </div>
                      <p className="text-gray-400 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-hero-gradient border-y border-neon-blue/20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="section-title">Meet Our Team</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                The passionate individuals behind EpicEsports India who are dedicated to shaping the future of competitive gaming in India.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 max-w-2xl mx-auto">
              {teamMembers.map((member, index) => (
                <motion.div 
                  key={member.id} 
                  className="card-gaming group relative overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  
                  {/* Member Image */}
                  <div className="relative h-64 overflow-hidden rounded-t-xl">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  </div>
                  
                  {/* Member Details */}
                  <div className="relative z-10 p-6">
                    <h3 className="text-xl font-bold mb-1 text-white group-hover:text-neon-blue transition-colors">{member.name}</h3>
                    <p className="text-neon-blue text-sm font-medium mb-4">{member.role}</p>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">{member.bio}</p>
                    
                    <div className="flex space-x-3">
                      <a 
                        href={member.social.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-8 h-8 glass-effect rounded-lg flex items-center justify-center text-gray-300 hover:text-neon-blue transition-colors border border-neon-blue/20 hover:border-neon-blue/50"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                      <a 
                        href={member.social.github} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-8 h-8 glass-effect rounded-lg flex items-center justify-center text-gray-300 hover:text-neon-blue transition-colors border border-neon-blue/20 hover:border-neon-blue/50"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Us CTA */}
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
              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <div className="text-6xl mb-6">🎮</div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gradient">
                  Join Our Journey
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Whether you're a player, tournament organizer, content creator, or just passionate about gaming, 
                  there's a place for you in the EpicEsports community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/register"
                    className="btn-gaming text-lg px-8 py-4"
                  >
                    <span className="mr-2">🚀</span>
                    Create Account
                  </Link>
                  <Link 
                    href="/careers"
                    className="btn-gaming-outline text-lg px-8 py-4"
                  >
                    <span className="mr-2">💼</span>
                    Join Our Team
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