"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ClientOnly from "@/components/ClientOnly";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Prevent server-side rendering to avoid hydration mismatches
  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-pulse text-neon-blue text-xl">Loading...</div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
    <div className="bg-dark-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black"></div>
        
        {/* Dynamic effects - client only */}
        <ClientOnly>
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-neon-blue rounded-full"
                style={{
                  left: `${(i * 7.3) % 100}%`,
                  top: `${(i * 11.7) % 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  delay: (i * 0.1) % 2,
                }}
              />
            ))}
          </div>
          
          <motion.div
            className="absolute w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl"
            style={{
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 30 }}
          />
        </ClientOnly>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 z-10">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Gaming background"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            className="opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-hero-gradient"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="hero-title mb-6">
                <span className="block">Welcome to the</span>
                <span className="block text-gradient">Future of Gaming</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Join India&apos;s premier esports platform where champions are born, 
                communities thrive, and gaming dreams become reality.
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
            >
              <Link href="/tournaments" className="btn-gaming text-lg px-8 py-4">
                <span className="mr-2">🏆</span>
                Join Tournaments
              </Link>
              <Link href="/register" className="btn-gaming-outline text-lg px-8 py-4">
                <span className="mr-2">🚀</span>
                Start Your Journey
              </Link>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { number: "10K+", label: "Active Players" },
                { number: "500+", label: "Tournaments" },
                { number: "₹50L+", label: "Prize Pool" },
                { number: "100+", label: "Communities" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="glass-effect rounded-xl p-6 text-center border border-neon-blue/20"
                  whileHover={{ scale: 1.05, borderColor: "rgba(0, 245, 255, 0.5)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-gradient mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-neon-blue rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-neon-blue rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Games Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-title">Featured Games</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Compete in the most popular esports titles and showcase your skills
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Link href="/games?filter=valorant" className="block">
                <div className="relative overflow-hidden rounded-xl bg-gaming-card transition-all duration-300 group-hover:shadow-gaming">
                  <div className="relative h-40 w-full">
                    <Image
                      src="/images/valorant.jpg"
                      alt="Valorant"
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-neon-blue transition-colors">
                      Valorant
                    </h3>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>2.5M+ Players</span>
                      <span>150+ Tournaments</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1 * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Link href="/games?filter=bgmi" className="block">
                <div className="relative overflow-hidden rounded-xl bg-gaming-card transition-all duration-300 group-hover:shadow-gaming">
                  <div className="relative h-40 w-full">
                    <Image
                      src="/images/bgmi.jpg"
                      alt="BGMI"
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-neon-blue transition-colors">
                      BGMI
                    </h3>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>5M+ Players</span>
                      <span>200+ Tournaments</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 2 * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Link href="/games?filter=csgo" className="block">
                <div className="relative overflow-hidden rounded-xl bg-gaming-card transition-all duration-300 group-hover:shadow-gaming">
                  <div className="relative h-40 w-full">
                    <Image
                      src="/images/csgo.jpg"
                      alt="CS:GO"
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-neon-blue transition-colors">
                      CS:GO
                    </h3>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>1.8M+ Players</span>
                      <span>120+ Tournaments</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 3 * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Link href="/games?filter=freefire" className="block">
                <div className="relative overflow-hidden rounded-xl bg-gaming-card transition-all duration-300 group-hover:shadow-gaming">
                  <div className="relative h-40 w-full">
                    <Image
                      src="/images/free-fire.jpg"
                      alt="Free Fire"
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-neon-blue transition-colors">
                      Free Fire
                    </h3>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>8M+ Players</span>
                      <span>300+ Tournaments</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 4 * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Link href="/games?filter=fifa" className="block">
                <div className="relative overflow-hidden rounded-xl bg-gaming-card transition-all duration-300 group-hover:shadow-gaming">
                  <div className="relative h-40 w-full">
                    <Image
                      src="/images/fifa.jpg"
                      alt="FIFA"
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-neon-blue transition-colors">
                      FIFA
                    </h3>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>900K+ Players</span>
                      <span>80+ Tournaments</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 5 * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Link href="/games?filter=codmobile" className="block">
                <div className="relative overflow-hidden rounded-xl bg-gaming-card transition-all duration-300 group-hover:shadow-gaming">
                  <div className="relative h-40 w-full">
                    <Image
                      src="/images/cod-mobile.jpg"
                      alt="COD Mobile"
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-neon-blue transition-colors">
                      COD Mobile
                    </h3>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>3M+ Players</span>
                      <span>180+ Tournaments</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-title">Why Choose EpicEsports?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Experience the ultimate gaming platform with cutting-edge features
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🏆",
                title: "Professional Tournaments",
                description: "Compete in officially sanctioned tournaments with substantial prize pools and recognition."
              },
              {
                icon: "💰",
                title: "Secure Payments",
                description: "Safe and instant prize distribution with multiple payment options and transparent transactions."
              },
              {
                icon: "📊",
                title: "Performance Analytics",
                description: "Track your progress with detailed statistics and performance insights to improve your gameplay."
              },
              {
                icon: "👥",
                title: "Community Building",
                description: "Connect with fellow gamers, form teams, and build lasting relationships in the gaming community."
              },
              {
                icon: "🎯",
                title: "Skill Development",
                description: "Access coaching resources, tutorials, and practice sessions to enhance your gaming skills."
              },
              {
                icon: "🌟",
                title: "Recognition System",
                description: "Earn badges, rankings, and achievements that showcase your gaming accomplishments."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="glass-effect rounded-xl p-8 text-center border border-neon-blue/20 hover:border-neon-blue/40 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-gaming text-gradient mb-6">
              Ready to Dominate?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of gamers who have already started their journey to esports glory.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/register" className="btn-gaming text-lg px-8 py-4">
                <span className="mr-2">🚀</span>
                Start Your Journey
              </Link>
              <Link href="/tournaments" className="btn-gaming-outline text-lg px-8 py-4">
                <span className="mr-2">👀</span>
                Browse Tournaments
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
