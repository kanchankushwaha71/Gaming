"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Close dropdowns when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Set scrolled state for background blur
      setScrolled(currentScrollY > 20);
      
      // Hide/show header based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setHidden(true);
      } else {
        // Scrolling up or at top
        setHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/games', label: 'Games', icon: '🎮' },
    { href: '/tournaments', label: 'Tournaments', icon: '🏆' },
    { href: '/events', label: 'Events', icon: '📅' },
    { href: '/community', label: 'Community', icon: '👥' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '📊' },
    { href: '/careers', label: 'Careers', icon: '💼' },
    { href: '/about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-dark-900/90 backdrop-blur-lg border-b border-neon-blue/20 shadow-gaming' 
          : 'bg-transparent'
      }`}
      initial={false}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 flex-shrink-0"
          >
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center text-white font-bold text-lg lg:text-xl glow-animation">
                  E
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-gaming font-bold text-gradient">
                  EpicEsports
                </h1>
                <p className="text-xs text-neon-blue font-medium">INDIA</p>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <motion.nav 
            className="hidden xl:flex items-center space-x-3 2xl:space-x-5 ml-8 lg:ml-10"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {navItems.map((item) => (
              <motion.div
                key={item.href}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link 
                  href={item.href} 
                  className="nav-link flex items-center space-x-1 group text-sm 2xl:text-base"
                >
                  <span className="text-sm group-hover:animate-bounce">{item.icon}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.nav>
          
          {/* User Menu / Auth */}
          <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            {session ? (
              <div className="relative">
                <motion.button
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 glass-effect text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 border border-neon-blue/30"
                >
                  <div className="relative">
                    <div className="h-8 w-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center text-white font-bold text-sm glow-animation">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-dark-900 animate-pulse"></div>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="font-semibold text-sm">{session.user?.name?.split(' ')[0] || 'User'}</p>
                    <p className="text-xs text-gray-400">Online</p>
                  </div>
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-neon-blue" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    initial={false}
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </motion.svg>
                </motion.button>
                
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div 
                      className="absolute right-0 mt-3 w-64 glass-effect rounded-xl shadow-gaming-lg py-2 z-20 border border-neon-blue/30"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="font-semibold text-white">{session.user?.name}</p>
                        <p className="text-sm text-gray-400">{session.user?.email}</p>
                      </div>
                      
                      <Link href="/member" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <span className="mr-3">📊</span>
                        Member Dashboard
                      </Link>
                      
                      {session.user?.role === 'admin' && (
                        <Link href="/admin" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <span className="mr-3">⚙️</span>
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <Link href="/account" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <span className="mr-3">👤</span>
                        Account Settings
                      </Link>
                      
                      <div className="border-t border-gray-700 mt-2">
                        <button 
                          onClick={() => {
                            handleSignOut();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <span className="mr-3">🚪</span>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center space-x-2"
              >
                <Link 
                  href="/login" 
                  className="btn-gaming-outline text-sm px-4 py-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
                <Link 
                  href="/register" 
                  className="btn-gaming text-sm px-4 py-2 hidden md:flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Join Now
                </Link>
              </motion.div>
            )}
            
            {/* Mobile Menu Button */}
            <motion.button 
              className="xl:hidden glass-effect p-2 rounded-lg border border-neon-blue/30 ml-2"
              onClick={toggleMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={false}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
                initial={false}
              >
                {isMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="xl:hidden mt-4 glass-effect rounded-xl border border-neon-blue/30 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="py-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                  >
                    <Link 
                      href={item.href} 
                      className="flex items-center space-x-3 px-4 py-3 text-gray-200 hover:bg-white/10 hover:text-neon-blue transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
                
                {session ? (
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <Link 
                      href="/member" 
                      className="flex items-center space-x-3 px-4 py-3 text-gray-200 hover:bg-white/10 hover:text-neon-blue transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-lg">📊</span>
                      <span>Member Dashboard</span>
                    </Link>
                    {session.user?.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="flex items-center space-x-3 px-4 py-3 text-gray-200 hover:bg-white/10 hover:text-neon-blue transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="text-lg">⚙️</span>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all duration-300"
                    >
                      <span className="text-lg">🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-700 pt-4 mt-4 px-4 space-y-3">
                    <Link 
                      href="/login" 
                      className="btn-gaming-outline w-full text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/register" 
                      className="btn-gaming w-full text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Join Now
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header; 