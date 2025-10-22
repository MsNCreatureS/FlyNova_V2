'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface VirtualAirline {
  id: number;
  name: string;
  callsign: string;
  logo_url?: string;
  description: string;
  member_count: number;
  owner_username: string;
}

export default function Home() {
  const [virtualAirlines, setVirtualAirlines] = useState<VirtualAirline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVirtualAirlines();
  }, []);

  const fetchVirtualAirlines = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines`);
      const data = await response.json();
      setVirtualAirlines(data.virtualAirlines || []);
    } catch (error) {
      console.error('Failed to fetch VAs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-aviation-950 via-aviation-800 to-aviation-600 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-aviation-400 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <img src="/logo.png" alt="FlyNova" className="h-24 w-auto mr-4" />
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                Fly<span className="text-aviation-300">Nova</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-4 text-aviation-100 font-light">
              The Modern Virtual Airline Platform
            </p>
            <p className="text-lg md:text-xl mb-12 text-aviation-200 max-w-3xl mx-auto">
              Create, join, and manage virtual airlines. Track your flights, compete on leaderboards, 
              and become part of a global flight simulation community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
              Get Started
            </Link>
            <Link href="/auth/login" className="btn-secondary text-lg px-8 py-4 bg-transparent text-white border-white hover:bg-white hover:text-aviation-600">
              Sign In
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">Everything You Need to Soar</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Professional tools for managing your virtual airline operations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '✈️',
                title: 'Fleet Management',
                description: 'Manage your aircraft fleet with real-world data from OpenFlights database'
              },
              {
                icon: '🗺️',
                title: 'Route Planning',
                description: 'Create and manage routes between thousands of airports worldwide'
              },
              {
                icon: '📊',
                title: 'Flight Tracking',
                description: 'Track flights in real-time and review detailed flight reports'
              },
              {
                icon: '🏆',
                title: 'Leaderboards',
                description: 'Compete with other pilots and earn points for validated flights'
              },
              {
                icon: '🎯',
                title: 'Events & Challenges',
                description: 'Create focus airport challenges and special events for your VA'
              },
              {
                icon: '📥',
                title: 'Downloads Hub',
                description: 'Share liveries, tracker software, and other resources'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-8 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Airlines Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">Active Virtual Airlines</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join an existing virtual airline or create your own
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : virtualAirlines.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {virtualAirlines.map((va, index) => (
                <motion.div
                  key={va.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/va/${va.id}`} className="card block p-6 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{va.name}</h3>
                        <p className="text-aviation-600 font-semibold">{va.callsign}</p>
                      </div>
                      {va.logo_url && (
                        <img src={va.logo_url} alt={va.name} className="w-12 h-12 object-contain" />
                      )}
                    </div>
                    <p className="text-slate-600 mb-4 line-clamp-2">{va.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        👥 {va.member_count} {va.member_count === 1 ? 'member' : 'members'}
                      </span>
                      <span className="text-aviation-600 font-semibold">View Details →</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg mb-6">No virtual airlines yet. Be the first to create one!</p>
              <Link href="/auth/register" className="btn-primary">
                Create Your Virtual Airline
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 aviation-gradient text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for Takeoff?</h2>
            <p className="text-xl mb-10 text-aviation-100">
              Join FlyNova today and start your virtual aviation journey
            </p>
            <Link href="/auth/register" className="btn-primary bg-white text-aviation-600 hover:bg-aviation-50 text-lg px-10 py-4">
              Create Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.png" alt="FlyNova" className="h-10 w-auto" />
                <h3 className="text-2xl font-bold">FlyNova</h3>
              </div>
              <p className="text-slate-400">Modern virtual airline management platform</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/downloads" className="hover:text-white transition-colors">Downloads</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/virtual-airlines" className="hover:text-white transition-colors">Virtual Airlines</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
                <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2025 FlyNova. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
