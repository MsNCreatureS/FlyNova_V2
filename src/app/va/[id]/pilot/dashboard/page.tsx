'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NavBar from '@/components/NavBar';

interface VA {
  id: number;
  name: string;
  callsign: string;
  logo_url?: string;
}

interface Event {
  id: number;
  name: string;
  description: string;
  event_type: string;
  cover_image?: string;
  start_date: string;
  end_date: string;
  bonus_points: number;
  status: string;
  focus_airport_icao?: string;
}

interface Flight {
  id: number;
  flight_number: string;
  pilot_username: string;
  departure_icao: string;
  departure_name: string;
  arrival_icao: string;
  arrival_name: string;
  status: string;
  departure_time?: string;
  aircraft_registration?: string;
  progress?: number;
}

interface PilotStats {
  total_flights: number;
  total_hours: number;
  points: number;
  rank: number;
}

export default function PilotDashboard() {
  const router = useRouter();
  const params = useParams();
  const vaId = params.id as string;

  const [va, setVa] = useState<VA | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeFlights, setActiveFlights] = useState<Flight[]>([]);
  const [stats, setStats] = useState<PilotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (vaId) {
      fetchDashboardData();
    }
  }, [vaId]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch VA info
      const vaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines/${vaId}`, { headers });
      const vaData = await vaResponse.json();
      setVa(vaData.virtualAirline);

      // Check user membership
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const member = vaData.members?.find((m: any) => m.user_id === userData.user.id);
        
        if (!member && userData.user.id !== vaData.virtualAirline.owner_id) {
          router.push(`/va/${vaId}`);
          return;
        }
        setUserRole(member?.role || 'Owner');
      }

      // Fetch active events
      const eventsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/va/${vaId}/active`, { headers });
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
      }

      // Fetch active flights by other pilots
      const flightsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flights/va/${vaId}/active`, { headers });
      if (flightsResponse.ok) {
        const flightsData = await flightsResponse.json();
        setActiveFlights(flightsData.flights || []);
      }

      // Fetch pilot stats
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines/${vaId}/my-stats`, { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'focus_airport': return 'bg-blue-100 text-blue-700';
      case 'route_challenge': return 'bg-purple-100 text-purple-700';
      case 'competition': return 'bg-red-100 text-red-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-green-100 text-green-700';
      case 'reserved': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!va) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Virtual Airline Not Found</h2>
          <Link href="/virtual-airlines" className="btn-primary">
            Browse Virtual Airlines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {va.logo_url && (
                <img src={va.logo_url} alt={va.name} className="w-16 h-16 object-contain" />
              )}
              <div>
                <h1 className="text-4xl font-bold text-slate-900">{va.name}</h1>
                <p className="text-lg text-aviation-600 font-semibold">{va.callsign} - Pilot Dashboard</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/va/${vaId}`} className="btn-secondary">
                ← Back to VA
              </Link>
              {(userRole === 'Owner' || userRole === 'Admin') && (
                <Link href={`/va/${vaId}/manage`} className="btn-secondary">
                  🛠️ Manage
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Flights</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.total_flights || 0}</p>
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
                <p className="text-sm text-slate-600 mb-1">Flight Hours</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.total_hours?.toFixed(1) || 0}</p>
              </div>
              <div className="text-4xl">⏱️</div>
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
                <p className="text-sm text-slate-600 mb-1">Points</p>
                <p className="text-3xl font-bold text-yellow-600">{stats?.points || 0}</p>
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
                <p className="text-sm text-slate-600 mb-1">Rank</p>
                <p className="text-3xl font-bold text-aviation-600">#{stats?.rank || '-'}</p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/va/${vaId}/pilot/book-flight`} className="card p-6 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-aviation-100 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  🎫
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Book a Flight</h3>
                  <p className="text-sm text-slate-600">Reserve your next route</p>
                </div>
              </div>
            </Link>

            <Link href={`/tracker`} className="card p-6 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  📡
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Flight Tracker</h3>
                  <p className="text-sm text-slate-600">Track your live flights</p>
                </div>
              </div>
            </Link>

            <Link href={`/downloads`} className="card p-6 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  📥
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Downloads</h3>
                  <p className="text-sm text-slate-600">Liveries & documents</p>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Active Events */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🎯 Active Events</h2>
          {events.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {events.map((event) => (
                <div key={event.id} className="card overflow-hidden">
                  {event.cover_image && (
                    <div className="h-40 bg-gradient-to-br from-aviation-500 to-aviation-700 relative">
                      <img 
                        src={event.cover_image} 
                        alt={event.name}
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-slate-900">{event.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-4 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span>📅</span>
                        <span>{new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</span>
                      </div>
                      {event.bonus_points > 0 && (
                        <div className="flex items-center gap-2 text-yellow-600 font-semibold">
                          <span>⭐</span>
                          <span>+{event.bonus_points} Bonus Points</span>
                        </div>
                      )}
                      {event.focus_airport_icao && (
                        <div className="flex items-center gap-2 text-aviation-600 font-semibold">
                          <span>🛬</span>
                          <span>Focus: {event.focus_airport_icao}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Events</h3>
              <p className="text-slate-600">Check back later for upcoming events!</p>
            </div>
          )}
        </motion.div>

        {/* Active Flights by Other Pilots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🌍 Live Flights</h2>
          {activeFlights.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Flight</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Pilot</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Route</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Aircraft</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Departure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeFlights.map((flight) => (
                      <tr key={flight.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <span className="font-bold text-aviation-600">{flight.flight_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">{flight.pilot_username}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{flight.departure_icao}</span>
                            <span className="text-aviation-600">→</span>
                            <span className="font-semibold">{flight.arrival_icao}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {flight.aircraft_registration || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(flight.status)}`}>
                            {flight.status === 'in_progress' ? '✈️ In Flight' : '🔄 Reserved'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {flight.departure_time ? new Date(flight.departure_time).toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Flights</h3>
              <p className="text-slate-600">No pilots are currently flying. Be the first!</p>
              <Link href={`/va/${vaId}/pilot/book-flight`} className="btn-primary mt-4 inline-block">
                Book a Flight
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
