"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const footerSections = [
    {
      title: "Platform",
      links: [
        { href: "/", label: "Home", icon: "🏠" },
        { href: "/games", label: "Games", icon: "🎮" },
        { href: "/tournaments", label: "Tournaments", icon: "🏆" },
        { href: "/events", label: "Events", icon: "📅" },
        { href: "/community", label: "Community", icon: "👥" },
      ]
    },
    {
      title: "Resources",
      links: [
        { href: "/performance", label: "Performance", icon: "📊" },
        { href: "/leaderboard", label: "Leaderboard", icon: "🏅" },
        { href: "/careers", label: "Careers", icon: "💼" },
        { href: "/about", label: "About Us", icon: "ℹ️" },
        { href: "/contact", label: "Contact", icon: "📧" },
      ]
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy-policy", label: "Privacy Policy", icon: "🔒" },
        { href: "/terms-and-conditions", label: "Terms & Conditions", icon: "📋" },
        { href: "/support", label: "Support", icon: "🛠️" },
        { href: "/faq", label: "FAQ", icon: "❓" },
      ]
    }
  ];

  const socialLinks = [
    {
      name: "Discord",
      href: "https://discord.gg/",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.39-.444.878-.608 1.265a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.265.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.319 13.58.099 18.061a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
      color: "hover:text-indigo-400"
    },
    {
      name: "Twitter",
      href: "https://twitter.com/",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
      color: "hover:text-blue-400"
    },
    {
      name: "YouTube",
      href: "https://youtube.com/",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      color: "hover:text-red-400"
    },
    {
      name: "Instagram",
      href: "https://instagram.com/",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.875-1.387-2.026-1.387-3.323s.49-2.448 1.297-3.323c.875-.897 2.026-1.387 3.323-1.387s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z" />
        </svg>
      ),
      color: "hover:text-pink-400"
    }
  ];

  // Generate deterministic particle positions for footer
  const footerParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: (i * 13.7) % 100,
    top: (i * 17.3) % 100,
    delay: (i * 0.2) % 2,
    duration: 4 + (i % 3),
  }));

  return (
    <footer className="relative bg-dark-900/50 backdrop-blur-lg border-t border-neon-blue/20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 to-transparent"></div>
      
      {/* Only render particles after mounting to avoid hydration issues */}
      {mounted && (
        <div className="absolute inset-0 opacity-30">
          {footerParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-neon-blue rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0],
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

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center text-white font-bold text-2xl glow-animation">
                  E
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl blur-md opacity-50"></div>
              </div>
              <div>
                <h3 className="text-2xl font-gaming font-bold text-gradient">EpicEsports</h3>
                <p className="text-sm text-neon-blue font-medium">INDIA</p>
              </div>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              India's premier esports platform where champions are born, communities thrive, 
              and gaming dreams become reality. Join thousands of gamers in their journey to glory.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mb-8">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`glass-effect p-3 rounded-lg text-gray-400 ${social.color} transition-all duration-300 border border-neon-blue/20 hover:border-neon-blue/50`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <span className="sr-only">{social.name}</span>
                  {social.icon}
                </motion.a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="glass-effect rounded-xl p-6 border border-neon-blue/20">
              <h4 className="text-lg font-semibold mb-3 text-white">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-4">Get the latest tournament updates and gaming news.</p>
              <form className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-3 bg-dark-800/50 text-white rounded-lg border border-neon-blue/30 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue backdrop-blur-sm"
                />
                <button 
                  type="submit" 
                  className="btn-gaming px-6 py-3"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </motion.div>
          
          {/* Links Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-6 text-white">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: linkIndex * 0.05 }}
                  >
                    <Link 
                      href={link.href} 
                      className="flex items-center space-x-2 text-gray-400 hover:text-neon-blue transition-all duration-300 group"
                    >
                      <span className="text-sm group-hover:animate-bounce">{link.icon}</span>
                      <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom Section */}
        <motion.div 
          className="mt-16 pt-8 border-t border-gray-700/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                &copy; {currentYear} EpicEsports India. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Made with ❤️ in India</span>
                <span>•</span>
                <span>Powered by Gaming Passion</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 