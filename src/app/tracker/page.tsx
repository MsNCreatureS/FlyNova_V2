'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { motion } from 'framer-motion';

interface ActiveFlight {
  id: number;
  flight_number: string;
  pilot_username: string;
  departure_icao: string;
  arrival_icao: string;
  aircraft_registration: string;
  va_name: string;
  started_at: string;
}

export default function TrackerPage() {
  const router = useRouter();
  const [activeFlights, setActiveFlights] = useState<ActiveFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [myVAs, setMyVAs] = useState<any[]>([]);
  const [selectedVA, setSelectedVA] = useState<string>('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchData();
    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [selectedVA]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch user's VAs
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers });
      const userData = await userResponse.json();
      
      const profileResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/${userData.user.id}`,
        { headers }
      );
      const profileData = await profileResponse.json();
      setMyVAs(profileData.memberships || []);

      // Fetch active flights
      if (selectedVA === 'all') {
        // Fetch from all VAs (would need a backend endpoint for this)
        // For now, just show empty or fetch from first VA
        if (profileData.memberships && profileData.memberships.length > 0) {
          const firstVA = profileData.memberships[0];
          const flightsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/flights/active/${firstVA.va_id}`,
            { headers }
          );
          if (flightsResponse.ok) {
            const flightsData = await flightsResponse.json();
            setActiveFlights(flightsData.flights || []);
          }
        }
      } else {
        const flightsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/flights/active/${selectedVA}`,
          { headers }
        );
        if (flightsResponse.ok) {
          const flightsData = await flightsResponse.json();
          setActiveFlights(flightsData.flights || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tracker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFlightDuration = (startedAt: string) => {
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    const diff = Math.floor((now - start) / 1000 / 60); // minutes
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Flight Tracker</h1>
          <p className="text-slate-600 text-lg">Monitor active flights in real-time</p>
        </motion.div>

        {/* VA Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filter by Virtual Airline
              </label>
              <select
                value={selectedVA}
                onChange={(e) => setSelectedVA(e.target.value)}
                className="input w-64"
              >
                <option value="all">All My VAs</option>
                {myVAs.map((va) => (
                  <option key={va.va_id} value={va.va_id}>
                    {va.va_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">Live Updates</span>
              </div>
              <button
                onClick={() => fetchData()}
                className="btn-secondary"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Active Flights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Active Flights ({activeFlights.length})
          </h2>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading active flights...</p>
            </div>
          ) : activeFlights.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeFlights.map((flight) => (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-aviation-100 rounded-bl-full opacity-50"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-aviation-600">{flight.flight_number}</h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-semibold">LIVE</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-slate-600 mb-2">Pilot: <span className="font-semibold text-slate-900">{flight.pilot_username}</span></p>
                      <p className="text-sm text-slate-600">VA: <span className="font-semibold text-slate-900">{flight.va_name}</span></p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900">{flight.departure_icao}</p>
                          <p className="text-xs text-slate-500">Departure</p>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="relative">
                            <div className="h-1 bg-aviation-200 rounded"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <div className="text-2xl animate-bounce">✈️</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900">{flight.arrival_icao}</p>
                          <p className="text-xs text-slate-500">Arrival</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">🛩️ {flight.aircraft_registration}</span>
                      <span className="text-slate-500">⏱️ {getFlightDuration(flight.started_at)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Flights</h3>
              <p className="text-slate-600 mb-6">
                {myVAs.length === 0 
                  ? 'Join a virtual airline to start tracking flights'
                  : 'No pilots are currently flying in this VA'
                }
              </p>
              {myVAs.length === 0 && (
                <a href="/virtual-airlines" className="btn-primary">
                  Browse Virtual Airlines
                </a>
              )}
            </div>
          )}
        </motion.div>

        {/* Integration Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">📡 How to Use the Tracker</h2>
            
            <div className="space-y-4 text-slate-700">
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">1. Download the FlyNova Tracker</h3>
                <p className="mb-2">Get the tracker software from the Downloads page to connect your flight simulator.</p>
                <a href="/downloads" className="text-aviation-600 hover:text-aviation-700 font-semibold">
                  Go to Downloads →
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">2. Book a Flight</h3>
                <p>Browse available routes in your VA and book a flight before starting.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">3. Start Flying</h3>
                <p>Launch the tracker, connect to your simulator, and start your flight. Your position will appear here in real-time!</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
                <p className="text-sm text-blue-900">
                  <strong>Supported Simulators:</strong> Microsoft Flight Simulator, X-Plane 11/12, Prepar3D
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
