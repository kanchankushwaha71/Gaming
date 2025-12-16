"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getEvents } from '@/lib/supabase';

// Define Event type to fix TypeScript errors
interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  description: string;
  image: string;
  bannerImage?: string;
  ticketPrice?: number;
  vipTicketPrice?: number;
  organizer?: string;
  isPublic?: boolean;
  highlights?: string[];
  schedule?: Array<{time: string, title: string, description: string}>;
  faqs?: Array<{question: string, answer: string}>;
}

export default function EventsPage() {
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate deterministic particles for background
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: (i * 12.1) % 100,
    top: (i * 9.7) % 100,
    delay: (i * 0.16) % 2,
    duration: 3.8 + (i % 3),
  }));
  
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const fetchedEvents = await getEvents();
        if (Array.isArray(fetchedEvents)) {
          // Make sure all required fields have default values
          const processedEvents = fetchedEvents.map(event => ({
            id: event.id || `temp-${Math.random().toString(36).substring(7)}`,
            title: event.title || 'Untitled Event',
            type: event.type || 'other',
            date: event.date || new Date().toISOString(),
            location: event.location || 'TBD',
            description: event.description || 'No description available',
            image: event.image || '/images/event-placeholder.jpg', // Fallback image
            ...event
          }));
          setEvents(processedEvents);
        } else {
          // If fetched events is not an array, set empty array
          setEvents([]);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, []);
  
  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.type === filter);

  const filterOptions = [
    { id: 'all', label: 'All Events', icon: '🎯' },
    { id: 'tournament', label: 'Tournaments', icon: '🏆' },
    { id: 'workshop', label: 'Workshops', icon: '🎓' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'expo', label: 'Expos', icon: '🎪' },
    { id: 'career', label: 'Career Events', icon: '💼' },
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tournament':
        return 'from-yellow-500 to-orange-500';
      case 'workshop':
        return 'from-blue-500 to-purple-500';
      case 'community':
        return 'from-green-500 to-teal-500';
      case 'expo':
        return 'from-pink-500 to-red-500';
      case 'career':
        return 'from-indigo-500 to-blue-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
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
                <span className="block">Upcoming</span>
                <span className="block text-gradient">Events</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Join us at our tournaments, workshops, and community meetups happening across India
              </p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {[
                  { label: 'Live Events', count: '12+', icon: '🎪' },
                  { label: 'Online Events', count: '25+', icon: '💻' },
                  { label: 'Workshops', count: '8+', icon: '🎓' },
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
        
        {/* Filter Section */}
        <section className="py-8 glass-effect border-b border-neon-blue/20 backdrop-blur-lg sticky top-20 z-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {filterOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  onClick={() => setFilter(option.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                    filter === option.id 
                      ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-neon' 
                      : 'glass-effect text-gray-300 hover:text-neon-blue border border-neon-blue/20 hover:border-neon-blue/50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* Events List */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="loading-spinner"></div>
              </div>
            ) : error ? (
              <motion.div 
                className="text-center py-16 card-gaming"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-6xl mb-6">⚠️</div>
                <h3 className="text-2xl font-bold mb-4 text-white">Error Loading Events</h3>
                <p className="text-gray-400 mb-8">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn-gaming"
                >
                  Try Again
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event, index) => (
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
                      {event.image ? (
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          style={{ objectFit: "cover" }}
                          className="transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-gray-700 to-gray-800 h-full w-full flex items-center justify-center">
                          <div className="text-4xl">🎪</div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                      
                      {/* Event Type Badge */}
                      <div className="absolute top-4 right-4">
                        <div className={`glass-effect px-3 py-1 rounded-full text-xs font-semibold border border-neon-blue/30 bg-gradient-to-r ${getEventTypeColor(event.type)} text-white`}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </div>
                      </div>
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">{event.location}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                      
                      <Link 
                        href={`/events/${event.id}`} 
                        className="btn-gaming w-full text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {filteredEvents.length === 0 && !loading && !error && (
              <motion.div 
                className="text-center py-16 card-gaming"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-8xl mb-6">📅</div>
                <h3 className="text-2xl font-bold mb-4 text-white">No events found</h3>
                <p className="text-gray-400 mb-8">There are no upcoming events in this category.</p>
                <Link href="/events/create" className="btn-gaming">
                  Create an Event
                </Link>
              </motion.div>
            )}
          </div>
        </section>
        
        {/* Calendar Integration CTA */}
        <section className="py-20 bg-hero-gradient border-y border-neon-blue/20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="flex flex-col lg:flex-row items-center justify-between"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8 lg:mb-0 lg:max-w-xl">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gradient">Never Miss an Event!</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Subscribe to our events calendar to stay updated with all the upcoming tournaments, workshops and meetups.
                </p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <motion.button 
                  className="btn-gaming-outline flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Google Calendar
                </motion.button>
                <motion.button 
                  className="btn-gaming flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Apple Calendar
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Host an Event CTA */}
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
              <div className="relative z-10 lg:flex items-center">
                <div className="lg:w-2/3 mb-8 lg:mb-0 lg:pr-8">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gradient">
                    Want to host your own event?
                  </h2>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    If you're a gaming organization, university, or company looking to host an esports event, 
                    we can help with planning, promotion, and execution.
                  </p>
                  <Link 
                    href="/events/create"
                    className="btn-gaming text-lg px-8 py-4"
                  >
                    <span className="mr-2">🎪</span>
                    Create an Event
                  </Link>
                </div>
                <div className="lg:w-1/3 flex justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center text-6xl glow-animation">
                      🎪
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