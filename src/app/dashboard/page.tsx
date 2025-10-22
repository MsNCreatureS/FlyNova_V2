'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NavBar from '@/components/NavBar';

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
}

interface VAMembership {
  va_id: number;
  va_name: string;
  va_callsign: string;
  va_logo_url?: string;
  role: string;
  points: number;
  member_count: number;
}

interface Flight {
  id: number;
  flight_number: string;
  departure_icao: string;
  arrival_icao: string;
  aircraft_registration: string;
  aircraft_name: string;
  scheduled_departure: string;
  status: string;
  va_name: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<VAMembership[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'flights' | 'achievements'>('overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch user profile
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers });
      if (!userResponse.ok) throw new Error('Not authenticated');
      const userData = await userResponse.json();
      setUser(userData.user);

      // Fetch VA memberships
      const profileResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/${userData.user.id}`,
        { headers }
      );
      const profileData = await profileResponse.json();
      setMemberships(profileData.memberships || []);
      setAchievements(profileData.achievements || []);

      // Fetch my flights
      const flightsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flights/my-flights`, { headers });
      const flightsData = await flightsResponse.json();
      setFlights(flightsData.flights || []);

    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('token');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {user.username}! ✈️
          </h1>
          <p className="text-slate-600 text-lg">
            Ready for your next flight?
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Virtual Airlines</p>
                <p className="text-3xl font-bold text-aviation-600">{memberships.length}</p>
              </div>
              <div className="text-4xl">✈️</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Total Flights</p>
                <p className="text-3xl font-bold text-slate-900">{flights.length}</p>
              </div>
              <div className="text-4xl">🛫</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Total Points</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {memberships.reduce((sum, m) => sum + m.points, 0)}
                </p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Achievements</p>
                <p className="text-3xl font-bold text-purple-600">{achievements.length}</p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'text-aviation-600 border-b-2 border-aviation-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('flights')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'flights'
                  ? 'text-aviation-600 border-b-2 border-aviation-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              My Flights
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'achievements'
                  ? 'text-aviation-600 border-b-2 border-aviation-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Achievements
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* My Virtual Airlines */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">My Virtual Airlines</h2>
                <Link href="/virtual-airlines" className="text-aviation-600 hover:text-aviation-700 text-sm font-semibold">
                  Browse All →
                </Link>
              </div>

              {memberships.length > 0 ? (
                <div className="space-y-4">
                  {memberships.map((membership) => (
                    <Link
                      key={membership.va_id}
                      href={`/va/${membership.va_id}`}
                      className="card p-5 block hover:scale-105 transition-transform"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-slate-900">{membership.va_name}</h3>
                          <p className="text-sm text-aviation-600 font-semibold">{membership.va_callsign}</p>
                        </div>
                        {membership.va_logo_url && (
                          <img src={membership.va_logo_url} alt={membership.va_name} className="w-12 h-12 object-contain" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            membership.role === 'Owner' ? 'bg-yellow-100 text-yellow-700' :
                            membership.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {membership.role}
                          </span>
                          <span className="text-slate-600">⭐ {membership.points} points</span>
                        </div>
                        <span className="text-slate-500">👥 {membership.member_count}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <p className="text-slate-600 mb-4">You haven't joined any virtual airlines yet.</p>
                  <Link href="/virtual-airlines" className="btn-primary">
                    Browse Virtual Airlines
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Recent Flights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Recent Flights</h2>
              </div>

              {flights.length > 0 ? (
                <div className="space-y-4">
                  {flights.slice(0, 5).map((flight) => (
                    <div key={flight.id} className="card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg text-slate-900">{flight.flight_number}</p>
                          <p className="text-sm text-slate-600">{flight.va_name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          flight.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          flight.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          flight.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {flight.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-slate-700">
                          <span className="font-semibold">{flight.departure_icao}</span>
                          <span className="text-aviation-600">→</span>
                          <span className="font-semibold">{flight.arrival_icao}</span>
                        </div>
                        <span className="text-slate-500">{flight.aircraft_registration}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(flight.scheduled_departure).toLocaleDateString()} at{' '}
                        {new Date(flight.scheduled_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <p className="text-slate-600 mb-4">No flights booked yet.</p>
                  <p className="text-sm text-slate-500">Join a VA to start booking flights!</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === 'flights' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">All My Flights</h2>
            
            {flights.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Flight #</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Route</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Aircraft</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">VA</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Date</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {flights.map((flight) => (
                        <tr key={flight.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">{flight.flight_number}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {flight.departure_icao} → {flight.arrival_icao}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{flight.aircraft_registration}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{flight.va_name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(flight.scheduled_departure).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              flight.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              flight.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              flight.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {flight.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">🛫</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Flights Yet</h3>
                <p className="text-slate-600 mb-6">Join a virtual airline and book your first flight!</p>
                <Link href="/virtual-airlines" className="btn-primary">
                  Browse Virtual Airlines
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">My Achievements</h2>
            
            {achievements.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card p-6 text-center"
                  >
                    <div className="text-5xl mb-4">{achievement.icon}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{achievement.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{achievement.description}</p>
                    <p className="text-xs text-slate-500">
                      Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Achievements Yet</h3>
                <p className="text-slate-600 mb-6">Complete flights to unlock achievements!</p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
