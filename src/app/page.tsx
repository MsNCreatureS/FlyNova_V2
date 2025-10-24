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

      {/* Statistics Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">FlyNova by the Numbers</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join a growing community of virtual aviation enthusiasts
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '50K+', label: 'Registered Pilots', icon: '👨‍✈️' },
              { number: '500+', label: 'Virtual Airlines', icon: '✈️' },
              { number: '1M+', label: 'Flights Completed', icon: '🌍' },
              { number: '24/7', label: 'Global Coverage', icon: '⏰' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-gradient-to-br from-aviation-50 to-aviation-100 rounded-2xl"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-bold text-aviation-600 mb-2">{stat.number}</div>
                <div className="text-slate-600 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Account',
                description: 'Sign up for free and set up your pilot profile in minutes',
                icon: '📝'
              },
              {
                step: '2',
                title: 'Join or Create a VA',
                description: 'Join an existing virtual airline or start your own with custom branding',
                icon: '🏢'
              },
              {
                step: '3',
                title: 'Start Flying',
                description: 'Book flights, track your progress, and climb the leaderboards',
                icon: '🚀'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="card p-8 h-full">
                  <div className="absolute -top-6 left-8 w-12 h-12 bg-aviation-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <div className="text-5xl mb-4 mt-4">{item.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">Powerful Integrations</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Seamlessly connect with your favorite flight simulation tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'SimBrief',
                description: 'Integrated flight planning with automatic OFP generation',
                icon: '📋',
                badge: 'Integrated'
              },
              {
                name: 'ACARS Tracker',
                description: 'Real-time flight tracking with telemetry data validation',
                icon: '📡',
                badge: 'Available'
              },
              {
                name: 'OpenFlights',
                description: 'Access to 10,000+ airports and real aircraft data',
                icon: '🗺️',
                badge: 'Active'
              }
            ].map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-8 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{integration.icon}</div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    {integration.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{integration.name}</h3>
                <p className="text-slate-600">{integration.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-aviation-600 to-aviation-800 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Pilots Say</h2>
            <p className="text-xl text-aviation-100 max-w-2xl mx-auto">
              Trusted by virtual pilots around the world
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "FlyNova has revolutionized how we manage our virtual airline. The interface is intuitive and the features are exactly what we needed.",
                author: "Captain John Smith",
                role: "VA Owner",
                avatar: "👨‍✈️"
              },
              {
                quote: "The SimBrief integration is seamless. Planning flights has never been easier. Highly recommend for any serious virtual pilot!",
                author: "Sarah Johnson",
                role: "Senior First Officer",
                avatar: "👩‍✈️"
              },
              {
                quote: "Love the real-time flight tracking and validation system. It adds authenticity to every flight and keeps the competition fair.",
                author: "Mike Chen",
                role: "Flight Instructor",
                avatar: "👨‍✈️"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
              >
                <div className="mb-6">
                  <svg className="w-10 h-10 text-aviation-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-lg mb-6 italic">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold">{testimonial.author}</div>
                    <div className="text-aviation-200 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Ready for Takeoff?</h2>
            <p className="text-xl mb-10 text-slate-600">
              Join FlyNova today and start your virtual aviation journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-primary text-lg px-10 py-4">
                Create Free Account
              </Link>
              <Link href="/virtual-airlines" className="btn-secondary text-lg px-10 py-4">
                Browse Virtual Airlines
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-6">
              No credit card required • Free forever • Join 50,000+ pilots
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center">
            <Link href="/" className="flex items-center gap-3 opacity-75 hover:opacity-100 transition-opacity">
              <img src="/logo.png" alt="FlyNova" className="h-12 w-auto" />
              <span className="text-3xl font-bold">FlyNova</span>
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
