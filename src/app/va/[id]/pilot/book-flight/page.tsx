'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '@/components/NavBar';

interface VA {
  id: number;
  name: string;
  callsign: string;
  logo_url?: string;
}

interface Route {
  id: number;
  flight_number: string;
  route_type: string;
  departure_icao: string;
  departure_name: string;
  arrival_icao: string;
  arrival_name: string;
  aircraft_type?: string;
  status: string;
  distance?: number;
  duration?: number;
}

interface FleetAircraft {
  id: number;
  registration: string;
  aircraft_name: string;
  aircraft_type: string;
  status: string;
  home_airport: string;
}

export default function BookFlightPage() {
  const router = useRouter();
  const params = useParams();
  const vaId = params.id as string;

  const [va, setVa] = useState<VA | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [fleet, setFleet] = useState<FleetAircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedAircraft, setSelectedAircraft] = useState<number | null>(null);

  // Modal state
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (vaId) {
      fetchData();
    }
  }, [vaId]);

  const fetchData = async () => {
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

      // Fetch routes
      const routesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routes/${vaId}`, { headers });
      if (routesResponse.ok) {
        const routesData = await routesResponse.json();
        setRoutes(routesData.routes?.filter((r: Route) => r.status === 'active') || []);
      }

      // Fetch fleet
      const fleetResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet/${vaId}`, { headers });
      if (fleetResponse.ok) {
        const fleetData = await fleetResponse.json();
        setFleet(fleetData.fleet?.filter((a: FleetAircraft) => a.status === 'active') || []);
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = async () => {
    if (!selectedRoute) return;

    setBooking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flights/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          va_id: vaId,
          route_id: selectedRoute.id,
          fleet_id: selectedAircraft
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to briefing page
        router.push(`/va/${vaId}/pilot/briefing/${data.flight.id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to book flight');
      }
    } catch (error) {
      console.error('Failed to book flight:', error);
      alert('Failed to book flight');
    } finally {
      setBooking(false);
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = 
      route.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.departure_icao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.arrival_icao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.departure_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.arrival_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || route.route_type === filterType;

    return matchesSearch && matchesType;
  });

  const availableAircraft = selectedRoute?.aircraft_type
    ? fleet.filter(a => a.aircraft_type === selectedRoute.aircraft_type)
    : fleet;

  const getRouteTypeIcon = (type: string) => {
    switch (type) {
      case 'Civil': return '👥';
      case 'Cargo': return '📦';
      case 'Private': return '🛩️';
      default: return '✈️';
    }
  };

  const getRouteTypeColor = (type: string) => {
    switch (type) {
      case 'Civil': return 'bg-blue-100 text-blue-700';
      case 'Cargo': return 'bg-orange-100 text-orange-700';
      case 'Private': return 'bg-purple-100 text-purple-700';
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
            <p className="text-slate-600">Loading routes...</p>
          </div>
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
              {va?.logo_url && (
                <img src={va.logo_url} alt={va.name} className="w-16 h-16 object-contain" />
              )}
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Book a Flight</h1>
                <p className="text-lg text-aviation-600 font-semibold">{va?.name}</p>
              </div>
            </div>
            <Link href={`/va/${vaId}/pilot/dashboard`} className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-6"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search Routes
              </label>
              <input
                type="text"
                placeholder="Search by flight number, airport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Route Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
              >
                <option value="all">All Types</option>
                <option value="Civil">Civil</option>
                <option value="Cargo">Cargo</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Routes Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredRoutes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoutes.map((route) => (
                <motion.div
                  key={route.id}
                  whileHover={{ scale: 1.02 }}
                  className="card p-6 cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => {
                    setSelectedRoute(route);
                    setSelectedAircraft(null);
                    setShowBookingModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-aviation-600 mb-1">
                        {route.flight_number}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRouteTypeColor(route.route_type)}`}>
                        {getRouteTypeIcon(route.route_type)} {route.route_type}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">🛫</span>
                          <span className="font-bold text-lg text-slate-900">{route.departure_icao}</span>
                        </div>
                        <p className="text-sm text-slate-600 ml-8">{route.departure_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="h-px bg-slate-300 flex-1"></div>
                      <span className="px-3 text-aviation-600 text-xl">✈️</span>
                      <div className="h-px bg-slate-300 flex-1"></div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">🛬</span>
                          <span className="font-bold text-lg text-slate-900">{route.arrival_icao}</span>
                        </div>
                        <p className="text-sm text-slate-600 ml-8">{route.arrival_name}</p>
                      </div>
                    </div>
                  </div>

                  {route.aircraft_type && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold">Aircraft:</span> {route.aircraft_type}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <button className="w-full btn-primary">
                      Select Route →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Routes Found</h3>
              <p className="text-slate-600">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No routes available at the moment'}
              </p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedRoute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-slate-900">✈️ Book Flight</h2>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Route Details */}
                <div className="card p-6 mb-6">
                  <p className="text-2xl font-bold text-aviation-600 mb-4">
                    {selectedRoute.flight_number}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 mb-1">Departure</p>
                        <p className="text-xl font-bold text-slate-900">{selectedRoute.departure_icao}</p>
                        <p className="text-sm text-slate-600">{selectedRoute.departure_name}</p>
                      </div>
                      <div className="text-3xl text-aviation-600">→</div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 mb-1">Arrival</p>
                        <p className="text-xl font-bold text-slate-900">{selectedRoute.arrival_icao}</p>
                        <p className="text-sm text-slate-600">{selectedRoute.arrival_name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-sm text-slate-600">Route Type</p>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getRouteTypeColor(selectedRoute.route_type)}`}>
                          {getRouteTypeIcon(selectedRoute.route_type)} {selectedRoute.route_type}
                        </span>
                      </div>
                      {selectedRoute.aircraft_type && (
                        <div>
                          <p className="text-sm text-slate-600">Aircraft Type</p>
                          <p className="font-semibold text-slate-900 mt-1">{selectedRoute.aircraft_type}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aircraft Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Select Aircraft {selectedRoute.aircraft_type && `(${selectedRoute.aircraft_type} only)`}
                  </label>
                  
                  {availableAircraft.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {availableAircraft.map((aircraft) => (
                        <div
                          key={aircraft.id}
                          onClick={() => setSelectedAircraft(aircraft.id)}
                          className={`card p-4 cursor-pointer transition-all ${
                            selectedAircraft === aircraft.id
                              ? 'ring-2 ring-aviation-500 bg-aviation-50'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-bold text-slate-900">{aircraft.registration}</p>
                              <p className="text-sm text-slate-600">{aircraft.aircraft_name}</p>
                              <p className="text-xs text-slate-500 mt-1">🏠 {aircraft.home_airport}</p>
                            </div>
                            {selectedAircraft === aircraft.id && (
                              <div className="text-2xl text-aviation-600">✓</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-6 text-center text-slate-500">
                      <p>No available aircraft for this route type</p>
                      <p className="text-sm mt-2">Please select a different route or contact an administrator</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookFlight}
                    disabled={booking || !selectedAircraft}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {booking ? 'Booking...' : 'Book & Continue to Briefing →'}
                  </button>
                </div>

                {!selectedAircraft && availableAircraft.length > 0 && (
                  <p className="text-sm text-amber-600 text-center mt-3">
                    ⚠️ Please select an aircraft to continue
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
