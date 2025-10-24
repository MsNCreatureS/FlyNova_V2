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
            <h2 className="section-title">Join Our Virtual Airlines Community</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover active virtual airlines from around the world or create your own
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : virtualAirlines.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {virtualAirlines.slice(0, 6).map((va, index) => (
                  <motion.div
                    key={va.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link href={`/va/${va.id}`} className="card block p-6 hover:scale-105 transition-transform duration-300 h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{va.name}</h3>
                          <p className="text-aviation-600 font-semibold text-sm">{va.callsign}</p>
                        </div>
                        {va.logo_url && (
                          <img src={va.logo_url} alt={va.name} className="w-16 h-16 object-contain" />
                        )}
                      </div>
                      <p className="text-slate-600 mb-4 line-clamp-3 text-sm">{va.description}</p>
                      <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1">
                          <span className="text-lg">👥</span>
                          <span>{va.member_count} {va.member_count === 1 ? 'pilot' : 'pilots'}</span>
                        </span>
                        <span className="text-aviation-600 font-semibold hover:text-aviation-700">
                          View Details →
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <Link href="/virtual-airlines" className="btn-primary inline-block">
                  View All Virtual Airlines
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 card max-w-2xl mx-auto">
              <div className="text-6xl mb-6">✈️</div>
              <p className="text-slate-600 text-lg mb-6">No virtual airlines yet. Be the first to create one!</p>
              <Link href="/auth/register" className="btn-primary">
                Create Your Virtual Airline
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">How Does FlyNova Work?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              FlyNova is a comprehensive virtual airline management platform that brings realism and 
              organization to your flight simulation experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                step: '1',
                title: 'Create Account',
                description: 'Sign up for free and create your pilot profile with your SimBrief credentials',
                icon: '�',
                color: 'from-blue-500 to-blue-600'
              },
              {
                step: '2',
                title: 'Join or Create',
                description: 'Join an existing virtual airline or create your own with custom branding and routes',
                icon: '🏢',
                color: 'from-purple-500 to-purple-600'
              },
              {
                step: '3',
                title: 'Book & Plan',
                description: 'Reserve flights from your VA\'s schedule and generate flight plans via SimBrief integration',
                icon: '📋',
                color: 'from-green-500 to-green-600'
              },
              {
                step: '4',
                title: 'Fly & Track',
                description: 'Use ACARS to track your flight in real-time and earn points upon landing',
                icon: '🚀',
                color: 'from-red-500 to-red-600'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="card p-6 h-full hover:shadow-xl transition-shadow">
                  <div className={`absolute -top-4 left-6 w-12 h-12 bg-gradient-to-br ${item.color} text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg`}>
                    {item.step}
                  </div>
                  <div className="text-5xl mb-4 mt-6">{item.icon}</div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* What is FlyNova */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h3 className="text-3xl font-bold mb-6 text-slate-900">What is FlyNova?</h3>
              <div className="space-y-4 text-slate-600">
                <p className="text-lg">
                  <strong className="text-slate-900">FlyNova</strong> is a modern virtual airline management system 
                  designed for flight simulation enthusiasts who want to add structure and realism to their flying.
                </p>
                <p>
                  Whether you're a VA owner managing a fleet of virtual pilots or a pilot looking to join an organized 
                  community, FlyNova provides all the tools you need:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Complete VA Management:</strong> Manage aircraft, routes, members, and events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Flight Booking System:</strong> Reserve flights from your VA's schedule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>SimBrief Integration:</strong> Generate professional flight plans automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>ACARS Flight Tracking:</strong> Real-time telemetry and validation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Points & Leaderboards:</strong> Compete and earn achievements</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <Link href="/" className="flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
                <img src="/logo.png" alt="FlyNova" className="h-48 w-auto drop-shadow-2xl" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ACARS Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold mb-4">
              Real-Time Flight Tracking
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">What is ACARS?</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              ACARS (Aircraft Communications Addressing and Reporting System) is our advanced flight tracking 
              system that monitors your flights in real-time
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">📡</span>
                  How ACARS Works
                </h3>
                <div className="space-y-4 text-slate-300">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-aviation-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Download the Tracker</h4>
                      <p className="text-sm">Install our lightweight ACARS client on your computer</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-aviation-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Connect to Your Flight</h4>
                      <p className="text-sm">Link the tracker to your booked flight before departure</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-aviation-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Fly Your Route</h4>
                      <p className="text-sm">ACARS monitors your flight data in real-time during the flight</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  Tracked Data
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '🛫', label: 'Departure Time' },
                    { icon: '🛬', label: 'Arrival Time' },
                    { icon: '⏱️', label: 'Flight Duration' },
                    { icon: '📏', label: 'Distance Flown' },
                    { icon: '⛽', label: 'Fuel Consumption' },
                    { icon: '📉', label: 'Landing Rate' },
                    { icon: '�️', label: 'Flight Path' },
                    { icon: '✈️', label: 'Aircraft Type' }
                  ].map((item, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 text-center hover:bg-white/10 transition-colors">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-sm font-medium">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
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

      {/* Support Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-aviation-50 to-aviation-100 rounded-2xl p-12 text-center border-2 border-aviation-200"
          >
            <div className="max-w-3xl mx-auto">
              <div className="text-5xl mb-6">❤️</div>
              <h3 className="text-3xl font-bold mb-4 text-slate-900">Support FlyNova Development</h3>
              <p className="text-lg text-slate-700 mb-8">
                FlyNova is completely <strong>free to use</strong> and will always remain so. 
                However, running servers, maintaining infrastructure, and developing new features requires time and resources. 
                If you appreciate our work and would like to support the continued development of this platform, 
                your donations are greatly appreciated and help keep FlyNova running smoothly for everyone.
              </p>
              
              <div className="bg-white rounded-xl p-8 shadow-lg mb-6 max-w-2xl mx-auto">
                <h4 className="text-xl font-bold mb-4 text-slate-900">Your Support Helps With:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-left mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-slate-700">Server hosting and maintenance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-slate-700">New feature development</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-slate-700">Bug fixes and improvements</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-slate-700">Community support</span>
                  </div>
                </div>
              </div>

              <a 
                href="https://www.paypal.com/paypalme/YourPayPalUsername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.806.806 0 01-.795.68H7.822a.563.563 0 01-.556-.65l1.209-7.665.034-.204a.806.806 0 01.795-.68h1.657c3.274 0 5.836-1.33 6.583-5.176.061-.316.094-.604.099-.87.23.142.442.307.632.496.377.377.662.86.792 1.429z"/>
                  <path d="M9.145 8.531a.82.82 0 01.807-.681h5.167c.617 0 1.192.043 1.722.141.173.032.34.07.503.113.162.043.32.091.472.144.152.053.299.112.44.176.14.063.275.133.405.207.032.02.064.04.094.061.293.19.546.422.754.689.23.142.442.307.632.496.377.377.662.86.792 1.429.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.806.806 0 01-.795.68H7.822a.563.563 0 01-.556-.65l1.209-7.665.034-.204a.806.806 0 01.795-.68h1.657c3.274 0 5.836-1.33 6.583-5.176.061-.316.094-.604.099-.87.23.142.442.307.632.496-.377-.377-.662-.86-.792-1.429-.13-.569-.13-1.203 0-1.772z"/>
                </svg>
                <span className="text-lg">Donate via PayPal</span>
              </a>
              
              <p className="text-sm text-slate-600 mt-6">
                Every contribution, no matter the size, makes a difference. Thank you for your support! 🙏
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-aviation-600 via-aviation-700 to-aviation-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-6xl mb-6">✈️</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for Takeoff?</h2>
            <p className="text-xl mb-10 text-aviation-100">
              Join thousands of pilots worldwide and start your virtual aviation journey today. 
              It's completely free, forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/auth/register" className="btn-primary text-lg px-10 py-4 bg-white text-aviation-600 hover:bg-aviation-50">
                Create Free Account
              </Link>
              <Link href="/virtual-airlines" className="btn-secondary text-lg px-10 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-aviation-600">
                Browse Virtual Airlines
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 text-aviation-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Community driven</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="FlyNova" className="h-12 w-auto" />
                <span className="text-3xl font-bold">FlyNova</span>
              </Link>
              <p className="text-slate-400 mb-4 max-w-md">
                The modern virtual airline management platform for flight simulation enthusiasts. 
                Free and built by the community, for the community.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com/flynova" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="https://discord.gg/flynova" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/virtual-airlines" className="text-slate-400 hover:text-white transition-colors">Virtual Airlines</Link></li>
                <li><Link href="/tracker" className="text-slate-400 hover:text-white transition-colors">ACARS Tracker</Link></li>
                <li><Link href="/downloads" className="text-slate-400 hover:text-white transition-colors">Downloads</Link></li>
                <li><Link href="/auth/register" className="text-slate-400 hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">API Reference</a></li>
                <li><a href="https://github.com/flynova" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://www.paypal.com/paypalme/YourPayPalUsername" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Support Us</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} FlyNova. Made with ❤️ for the virtual aviation community.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
