"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function CareersPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate deterministic particles for background
  const particles = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    left: (i * 14.3) % 100,
    top: (i * 6.7) % 100,
    delay: (i * 0.21) % 2,
    duration: 4.8 + (i % 3),
  }));

  const positions = [
    {
      id: 1,
      title: 'Tournament Coordinator',
      type: 'Full-time • Remote',
      description: 'We\'re looking for an experienced tournament coordinator to help us organize and manage our online gaming events. You\'ll be responsible for scheduling, rule enforcement, and ensuring smooth tournament operations.',
      requirements: [
        '2+ years experience in esports tournament management',
        'Strong knowledge of competitive gaming rules',
        'Excellent communication and conflict resolution skills'
      ],
      gradient: 'from-blue-500 to-purple-500',
      icon: '🏆'
    },
    {
      id: 2,
      title: 'Community Manager',
      type: 'Full-time • Remote',
      description: 'We\'re seeking a passionate community manager to build and nurture our growing community of gamers. You\'ll be responsible for social media management, community engagement, and content creation.',
      requirements: [
        '2+ years experience in community management',
        'Strong social media presence and content creation skills',
        'Passionate about gaming and esports'
      ],
      gradient: 'from-green-500 to-teal-500',
      icon: '👥'
    },
    {
      id: 3,
      title: 'Web Developer',
      type: 'Full-time • Remote',
      description: 'We\'re looking for a skilled web developer to join our team and help build and maintain our online platform. You\'ll be responsible for developing new features, fixing bugs, and ensuring the platform runs smoothly.',
      requirements: [
        '3+ years experience in web development',
        'Proficient in React, Next.js, and TypeScript',
        'Experience with database design and API development'
      ],
      gradient: 'from-yellow-500 to-orange-500',
      icon: '💻'
    },
    {
      id: 4,
      title: 'Marketing Specialist',
      type: 'Full-time • Remote',
      description: 'We\'re seeking a marketing specialist to help us grow our platform. You\'ll be responsible for developing and implementing marketing strategies, managing campaigns, and analyzing results.',
      requirements: [
        '2+ years experience in digital marketing',
        'Experience with social media marketing and content creation',
        'Analytical mindset and data-driven approach'
      ],
      gradient: 'from-pink-500 to-red-500',
      icon: '📈'
    }
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We constantly push boundaries and explore new ways to improve the esports experience for everyone.',
      icon: '⚡',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      title: 'Community',
      description: 'We believe in building inclusive, supportive communities that help gamers connect and grow together.',
      icon: '🤝',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from our platform to our tournaments and events.',
      icon: '🎯',
      gradient: 'from-yellow-500 to-orange-500'
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
                <span className="block">Join Our</span>
                <span className="block text-gradient">Team</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Help us build the future of esports in India. We're looking for passionate and talented individuals to join our growing team.
              </p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {[
                  { label: 'Open Positions', count: '4+', icon: '💼' },
                  { label: 'Team Members', count: '25+', icon: '👥' },
                  { label: 'Remote Work', count: '100%', icon: '🌍' },
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

        {/* Open Positions Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="section-title">Open Positions</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                We're constantly looking for talented individuals to join our team. Check out our current openings below.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {positions.map((position, index) => (
                <motion.div 
                  key={position.id}
                  className="card-gaming group relative overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${position.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${position.gradient} rounded-xl flex items-center justify-center text-2xl mr-4`}>
                        {position.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-neon-blue transition-colors">{position.title}</h3>
                        <p className="text-neon-blue font-medium">{position.type}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 mb-6 leading-relaxed">{position.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {position.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-start text-gray-300">
                          <div className="w-2 h-2 bg-neon-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                    
                    <Link 
                      href={`mailto:shubhamkush012@gmail.com?subject=Application for ${position.title}`}
                      className="btn-gaming w-full text-center"
                    >
                      Apply Now
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-hero-gradient border-y border-neon-blue/20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gradient">Don't See a Match?</h2>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                We're always looking for talented individuals to join our team. If you don't see a position that matches your skills but think you'd be a great fit, we'd still love to hear from you!
              </p>
              <Link 
                href="mailto:shubhamkush012@gmail.com?subject=Open Application for EpicEsports"
                className="btn-gaming text-lg px-8 py-4"
              >
                <span className="mr-2">📧</span>
                Send Open Application
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="section-title">Our Values</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                At EpicEsports India, we're guided by these core values that shape everything we do.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div 
                  key={index}
                  className="card-gaming group text-center relative overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl glow-animation`}>
                      {value.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-neon-blue transition-colors">{value.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-hero-gradient border-y border-neon-blue/20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="section-title">Why Work With Us?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                We offer competitive benefits and a great work environment for our team members.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🏠', title: 'Remote Work', desc: 'Work from anywhere in India' },
                { icon: '💰', title: 'Competitive Pay', desc: 'Market-rate salaries and bonuses' },
                { icon: '📚', title: 'Learning Budget', desc: 'Annual budget for courses and conferences' },
                { icon: '🎮', title: 'Gaming Perks', desc: 'Free access to tournaments and events' },
                { icon: '⏰', title: 'Flexible Hours', desc: 'Work when you\'re most productive' },
                { icon: '🏥', title: 'Health Benefits', desc: 'Comprehensive health insurance' },
                { icon: '🌱', title: 'Growth Path', desc: 'Clear career progression opportunities' },
                { icon: '🎉', title: 'Team Events', desc: 'Regular team building activities' },
              ].map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="glass-effect p-6 rounded-xl border border-neon-blue/20 text-center group hover:border-neon-blue/50 transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="text-3xl mb-3">{benefit.icon}</div>
                  <h4 className="font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">{benefit.title}</h4>
                  <p className="text-gray-400 text-sm">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
