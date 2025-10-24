'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

interface VAMembership {
  va_id: number;
  va_name: string;
  va_callsign: string;
  role: string;
  points: number;
}

interface Flight {
  id: number;
  flight_number: string;
  departure_icao: string;
  arrival_icao: string;
  aircraft_registration: string;
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

interface Stats {
  total_flights: number;
  total_hours: number;
  total_distance: number;
  total_points: number;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<VAMembership[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_flights: 0,
    total_hours: 0,
    total_distance: 0,
    total_points: 0
  });
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Check if viewing own profile
      if (token) {
        const meResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers });
        if (meResponse.ok) {
          const meData = await meResponse.json();
          setIsOwnProfile(meData.user.id === parseInt(userId));
        }
      }

      // Fetch profile data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/${userId}`, { headers });
      
      if (!response.ok) {
        throw new Error('Profile not found');
      }

      const data = await response.json();
      setUser(data.user);
      setMemberships(data.memberships || []);
      setAchievements(data.achievements || []);
      setFlights(data.flights || []);

      // Calculate stats
      const totalPoints = data.memberships?.reduce((sum: number, m: VAMembership) => sum + m.points, 0) || 0;
      const totalFlights = data.flights?.length || 0;
      
      setStats({
        total_flights: totalFlights,
        total_hours: 0, // Would need flight hours from backend
        total_distance: 0, // Would need distance from backend
        total_points: totalPoints
      });

    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">User Not Found</h2>
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
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-32 h-32 rounded-full ring-4 ring-aviation-100" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-aviation-600 flex items-center justify-center text-white text-5xl font-bold ring-4 ring-aviation-100">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-slate-900">{user.username}</h1>
                {isOwnProfile && (
                  <Link href="/profile/edit" className="btn-secondary text-sm">
                    ⚙️ Edit Profile
                  </Link>
                )}
              </div>
              <p className="text-slate-600 mb-3">{user.email}</p>
              <p className="text-sm text-slate-500">
                ✈️ Pilot since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-6 text-center"
          >
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.total_flights}</p>
            <p className="text-sm text-slate-600">Total Flights</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card p-6 text-center"
          >
            <p className="text-3xl font-bold text-aviation-600 mb-1">{memberships.length}</p>
            <p className="text-sm text-slate-600">Virtual Airlines</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card p-6 text-center"
          >
            <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.total_points}</p>
            <p className="text-sm text-slate-600">Total Points</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="card p-6 text-center"
          >
            <p className="text-3xl font-bold text-purple-600 mb-1">{achievements.length}</p>
            <p className="text-sm text-slate-600">Achievements</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Virtual Airlines */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Virtual Airlines</h2>
              {memberships.length > 0 ? (
                <div className="space-y-4">
                  {memberships.map((membership) => (
                    <Link
                      key={membership.va_id}
                      href={`/va/${membership.va_id}`}
                      className="card p-5 block hover:scale-105 transition-transform"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{membership.va_name}</h3>
                          <p className="text-sm text-aviation-600 font-semibold">{membership.va_callsign}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            membership.role === 'Owner' ? 'bg-yellow-100 text-yellow-700' :
                            membership.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {membership.role}
                          </span>
                          <p className="text-sm text-slate-600 mt-2">⭐ {membership.points} points</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center text-slate-500">
                  {isOwnProfile ? "You haven't joined any VAs yet" : "No virtual airlines"}
                </div>
              )}
            </motion.div>

            {/* Flight History */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Flight History</h2>
              {flights.length > 0 ? (
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Flight</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Route</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Aircraft</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {flights.slice(0, 10).map((flight) => (
                          <tr key={flight.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-900">{flight.flight_number}</p>
                              <p className="text-xs text-slate-500">{flight.va_name}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">
                              {flight.departure_icao} → {flight.arrival_icao}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{flight.aircraft_registration}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                flight.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                flight.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
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
                <div className="card p-8 text-center text-slate-500">
                  {isOwnProfile ? "You haven't flown any flights yet" : "No flights recorded"}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Achievements */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Achievements</h2>
              {achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="card p-5">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 mb-1">{achievement.name}</h3>
                          <p className="text-sm text-slate-600 mb-2">{achievement.description}</p>
                          <p className="text-xs text-slate-500">
                            🏆 Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="text-5xl mb-3">🏆</div>
                  <p className="text-slate-500 text-sm">
                    {isOwnProfile ? "Complete flights to earn achievements" : "No achievements yet"}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
