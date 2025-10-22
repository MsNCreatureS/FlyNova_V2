'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import AirportSearch from '@/components/AirportSearch';
import AircraftSearch from '@/components/AircraftSearch';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FleetAircraft {
  id: number;
  registration: string;
  aircraft_type: string;
  aircraft_name: string;
  status: string;
  home_airport: string;
  created_at: string;
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
  created_at: string;
}

export default function VAManagePage() {
  const params = useParams();
  const router = useRouter();
  const vaId = params.id as string;

  const [va, setVa] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'fleet' | 'routes'>('fleet');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fleet states
  const [fleet, setFleet] = useState<FleetAircraft[]>([]);
  const [showAddAircraft, setShowAddAircraft] = useState(false);
  const [aircraftForm, setAircraftForm] = useState({
    registration: '',
    aircraft_type: '',
    aircraft_name: '',
    home_airport: ''
  });
  const [addingAircraft, setAddingAircraft] = useState(false);

  // Route states
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [routeForm, setRouteForm] = useState({
    flight_number: '',
    route_type: 'Civil',
    departure_icao: '',
    departure_name: '',
    arrival_icao: '',
    arrival_name: '',
    aircraft_type: ''
  });
  const [addingRoute, setAddingRoute] = useState(false);

  useEffect(() => {
    if (vaId) {
      fetchVAData();
    }
  }, [vaId]);

  const fetchVAData = async () => {
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

      // Fetch VA details
      const vaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines/${vaId}`, { headers });
      const vaData = await vaResponse.json();
      setVa(vaData.virtualAirline);

      // Fetch fleet
      const fleetResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet/${vaId}`, { headers });
      if (fleetResponse.ok) {
        const fleetData = await fleetResponse.json();
        setFleet(fleetData.fleet || []);
      }

      // Fetch routes
      const routesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routes/${vaId}`, { headers });
      if (routesResponse.ok) {
        const routesData = await routesResponse.json();
        setRoutes(routesData.routes || []);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch VA data:', err);
      setError('Failed to load VA data');
      setLoading(false);
    }
  };

  const handleAddAircraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAddingAircraft(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet/${vaId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aircraftForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add aircraft');
      }

      // Success
      setShowAddAircraft(false);
      setAircraftForm({
        registration: '',
        aircraft_type: '',
        aircraft_name: '',
        home_airport: ''
      });
      await fetchVAData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingAircraft(false);
    }
  };

  const handleDeleteAircraft = async (aircraftId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avion ?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet/${vaId}/${aircraftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete aircraft');
      }

      await fetchVAData();
    } catch (err) {
      setError('Failed to delete aircraft');
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAddingRoute(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routes/${vaId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add route');
      }

      // Success
      setShowAddRoute(false);
      setRouteForm({
        flight_number: '',
        route_type: 'Civil',
        departure_icao: '',
        departure_name: '',
        arrival_icao: '',
        arrival_name: '',
        aircraft_type: ''
      });
      await fetchVAData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingRoute(false);
    }
  };

  const handleDeleteRoute = async (routeId: number) => {
    if (!confirm('Are you sure you want to delete this route?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routes/${vaId}/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete route');
      }

      await fetchVAData();
    } catch (err) {
      setError('Failed to delete route');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading...</p>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href={`/va/${vaId}`} className="text-aviation-600 hover:text-aviation-700 mb-2 inline-block">
              ← Back to {va?.name}
            </Link>
            <h1 className="text-4xl font-bold text-slate-900">🛠️ VA Management</h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('fleet')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'fleet'
                  ? 'text-aviation-600 border-b-2 border-aviation-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ✈️ Fleet
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'routes'
                  ? 'text-aviation-600 border-b-2 border-aviation-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🗺️ Routes
            </button>
          </div>
        </div>

        {/* Fleet Tab */}
        {activeTab === 'fleet' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Fleet ({fleet.length})</h2>
              <button
                onClick={() => setShowAddAircraft(true)}
                className="btn-primary"
              >
                + Add Aircraft
              </button>
            </div>

            {fleet.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Registration</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Type</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Name</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Base</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Status</th>
                        <th className="text-right px-6 py-3 text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {fleet.map((aircraft) => (
                        <tr key={aircraft.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm font-semibold text-aviation-600">{aircraft.registration}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{aircraft.aircraft_type}</td>
                          <td className="px-6 py-4 text-sm text-slate-900">{aircraft.aircraft_name}</td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-600">{aircraft.home_airport}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              aircraft.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {aircraft.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteAircraft(aircraft.id)}
                              className="text-red-600 hover:text-red-700 font-semibold"
                            >
                              Delete
                            </button>
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
                <h3 className="text-xl font-bold text-slate-900 mb-2">No aircraft</h3>
                <p className="text-slate-600 mb-6">Add your first aircraft to the fleet</p>
                <button onClick={() => setShowAddAircraft(true)} className="btn-primary">
                  + Add Aircraft
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Routes Tab */}
        {activeTab === 'routes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Routes ({routes.length})</h2>
              <button
                onClick={() => setShowAddRoute(true)}
                className="btn-primary"
              >
                + Ajouter une route
              </button>
            </div>

            {routes.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Flight</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Departure</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Arrival</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Aircraft</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Route Type</th>
                        <th className="text-right px-6 py-3 text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {routes.map((route) => (
                        <tr key={route.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm font-semibold text-aviation-600">{route.flight_number}</td>
                          <td className="px-6 py-4 text-sm">
                            <div>
                              <p className="font-semibold text-slate-900">{route.departure_icao}</p>
                              <p className="text-xs text-slate-500">{route.departure_name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div>
                              <p className="font-semibold text-slate-900">{route.arrival_icao}</p>
                              <p className="text-xs text-slate-500">{route.arrival_name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{route.aircraft_type || 'All'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              route.route_type === 'Civil' ? 'bg-blue-100 text-blue-700' :
                              route.route_type === 'Cargo' ? 'bg-orange-100 text-orange-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {route.route_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteRoute(route.id)}
                              className="text-red-600 hover:text-red-700 font-semibold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Routes</h3>
                <p className="text-slate-600 mb-6">Create your first route</p>
                <button onClick={() => setShowAddRoute(true)} className="btn-primary">
                  + Add Route
                </button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Add Aircraft Modal */}
      {showAddAircraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">✈️ Add Aircraft</h2>
                <button
                  onClick={() => setShowAddAircraft(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddAircraft} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Registration *
                  </label>
                  <input
                    type="text"
                    value={aircraftForm.registration}
                    onChange={(e) => setAircraftForm({...aircraftForm, registration: e.target.value})}
                    placeholder="F-GKXY"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  />
                </div>

                <AircraftSearch
                  value={aircraftForm.aircraft_type}
                  onChange={(icao, aircraft) => setAircraftForm({
                    ...aircraftForm,
                    aircraft_type: icao || aircraft.icao_code || aircraft.iata_code || '',
                    aircraft_name: aircraft.name
                  })}
                  label="Aircraft Type"
                  placeholder="Search for an aircraft..."
                  required
                />

                <AirportSearch
                  value={aircraftForm.home_airport}
                  onChange={(icao) => setAircraftForm({...aircraftForm, home_airport: icao})}
                  label="Home Airport"
                  placeholder="Search for an airport..."
                  required
                />

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddAircraft(false)}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingAircraft}
                    className="flex-1 btn-primary"
                  >
                    {addingAircraft ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Route Modal */}
      {showAddRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">🗺️ Add Route</h2>
                <button
                  onClick={() => setShowAddRoute(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddRoute} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Flight Number *
                  </label>
                  <input
                    type="text"
                    value={routeForm.flight_number}
                    onChange={(e) => setRouteForm({...routeForm, flight_number: e.target.value})}
                    placeholder="FLY001"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  />
                </div>

                <AirportSearch
                  value={routeForm.departure_icao}
                  onChange={(icao, airport) => setRouteForm({
                    ...routeForm,
                    departure_icao: icao,
                    departure_name: airport.name
                  })}
                  label="Departure Airport"
                  placeholder="Search for departure airport..."
                  required
                />

                <AirportSearch
                  value={routeForm.arrival_icao}
                  onChange={(icao, airport) => setRouteForm({
                    ...routeForm,
                    arrival_icao: icao,
                    arrival_name: airport.name
                  })}
                  label="Arrival Airport"
                  placeholder="Search arrival airport..."
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Route Type *
                  </label>
                  <select
                    value={routeForm.route_type}
                    onChange={(e) => setRouteForm({...routeForm, route_type: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  >
                    <option value="Civil">Civil</option>
                    <option value="Cargo">Cargo</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <AircraftSearch
                  value={routeForm.aircraft_type}
                  onChange={(name) => setRouteForm({...routeForm, aircraft_type: name})}
                  label="Aircraft Type (optional)"
                  placeholder="Search aircraft..."
                  required={false}
                />

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddRoute(false)}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingRoute}
                    className="flex-1 btn-primary"
                  >
                    {addingRoute ? 'Adding...' : 'Add Route'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
