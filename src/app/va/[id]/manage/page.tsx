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

interface Member {
  id: number;
  user_id: number;
  username: string;
  email: string;
  role: string;
  points: number;
  total_flights: number;
  total_hours: number;
  join_date: string;
  status: string;
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
  created_at: string;
}

export default function VAManagePage() {
  const params = useParams();
  const router = useRouter();
  const vaId = params.id as string;

  const [va, setVa] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'fleet' | 'routes' | 'members' | 'events'>('fleet');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fleet states
  const [fleet, setFleet] = useState<FleetAircraft[]>([]);
  const [showAddAircraft, setShowAddAircraft] = useState(false);
  const [showEditAircraft, setShowEditAircraft] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<FleetAircraft | null>(null);
  const [aircraftForm, setAircraftForm] = useState({
    registration: '',
    aircraft_type: '',
    aircraft_name: '',
    home_airport: ''
  });
  const [addingAircraft, setAddingAircraft] = useState(false);
  const [updatingAircraft, setUpdatingAircraft] = useState(false);

  // Route states
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [showEditRoute, setShowEditRoute] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
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
  const [updatingRoute, setUpdatingRoute] = useState(false);

  // Member states
  const [members, setMembers] = useState<Member[]>([]);
  const [showManageMember, setShowManageMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberRole, setMemberRole] = useState('Member');
  const [updatingMember, setUpdatingMember] = useState(false);

  // Event states
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    event_type: 'special_event',
    start_date: '',
    end_date: '',
    bonus_points: 0,
    cover_image_url: ''
  });
  const [eventCoverFile, setEventCoverFile] = useState<File | null>(null);
  const [eventCoverPreview, setEventCoverPreview] = useState<string>('');
  const [addingEvent, setAddingEvent] = useState(false);
  const [updatingEvent, setUpdatingEvent] = useState(false);

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

      // Fetch members
      const membersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines/${vaId}/members`, { headers });
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.members || []);
      }

      // Fetch events
      const eventsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${vaId}`, { headers });
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
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

  const handleEditAircraft = (aircraft: FleetAircraft) => {
    setSelectedAircraft(aircraft);
    setAircraftForm({
      registration: aircraft.registration,
      aircraft_type: aircraft.aircraft_type,
      aircraft_name: aircraft.aircraft_name,
      home_airport: aircraft.home_airport
    });
    setShowEditAircraft(true);
  };

  const handleUpdateAircraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAircraft) return;
    
    setError('');
    setUpdatingAircraft(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet/${vaId}/${selectedAircraft.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aircraftForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update aircraft');
      }

      setShowEditAircraft(false);
      setSelectedAircraft(null);
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
      setUpdatingAircraft(false);
    }
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setRouteForm({
      flight_number: route.flight_number,
      route_type: route.route_type,
      departure_icao: route.departure_icao,
      departure_name: route.departure_name,
      arrival_icao: route.arrival_icao,
      arrival_name: route.arrival_name,
      aircraft_type: route.aircraft_type || ''
    });
    setShowEditRoute(true);
  };

  const handleUpdateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;
    
    setError('');
    setUpdatingRoute(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routes/${vaId}/${selectedRoute.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update route');
      }

      setShowEditRoute(false);
      setSelectedRoute(null);
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
      setUpdatingRoute(false);
    }
  };

  const handleUpdateMemberRole = async () => {
    if (!selectedMember) return;
    
    setUpdatingMember(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines/${vaId}/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: memberRole })
      });

      if (!response.ok) {
        throw new Error('Failed to update member role');
      }

      setShowManageMember(false);
      setSelectedMember(null);
      await fetchVAData();
    } catch (err) {
      setError('Failed to update member role');
    } finally {
      setUpdatingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines/${vaId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      await fetchVAData();
    } catch (err) {
      setError('Failed to remove member');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAddingEvent(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', eventForm.name);
      formData.append('description', eventForm.description);
      formData.append('event_type', eventForm.event_type);
      formData.append('start_date', eventForm.start_date);
      formData.append('end_date', eventForm.end_date);
      formData.append('bonus_points', eventForm.bonus_points.toString());
      
      if (eventCoverFile) {
        formData.append('cover_image', eventCoverFile);
      } else if (eventForm.cover_image_url) {
        formData.append('cover_image_url', eventForm.cover_image_url);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${vaId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add event');
      }

      setShowAddEvent(false);
      setEventForm({
        name: '',
        description: '',
        event_type: 'special_event',
        start_date: '',
        end_date: '',
        bonus_points: 0,
        cover_image_url: ''
      });
      setEventCoverFile(null);
      setEventCoverPreview('');
      await fetchVAData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${vaId}/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchVAData();
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setEventForm({
      name: event.name,
      description: event.description,
      event_type: event.event_type,
      start_date: event.start_date.split('T')[0],
      end_date: event.end_date.split('T')[0],
      bonus_points: event.bonus_points,
      cover_image_url: ''
    });
    if (event.cover_image) {
      setEventCoverPreview(event.cover_image.startsWith('http') ? event.cover_image : `http://localhost:3001${event.cover_image}`);
    }
    setShowEditEvent(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    setError('');
    setUpdatingEvent(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', eventForm.name);
      formData.append('description', eventForm.description);
      formData.append('event_type', eventForm.event_type);
      formData.append('start_date', eventForm.start_date);
      formData.append('end_date', eventForm.end_date);
      formData.append('bonus_points', eventForm.bonus_points.toString());
      
      if (eventCoverFile) {
        formData.append('cover_image', eventCoverFile);
      } else if (eventForm.cover_image_url) {
        formData.append('cover_image_url', eventForm.cover_image_url);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${vaId}/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update event');
      }

      setShowEditEvent(false);
      setSelectedEvent(null);
      setEventForm({
        name: '',
        description: '',
        event_type: 'special_event',
        start_date: '',
        end_date: '',
        bonus_points: 0,
        cover_image_url: ''
      });
      setEventCoverFile(null);
      setEventCoverPreview('');
      await fetchVAData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdatingEvent(false);
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
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'members'
                  ? 'text-aviation-600 border-b-2 border-aviation-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              👥 Members
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'events'
                  ? 'text-aviation-600 border-b-2 border-aviation-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🎯 Events
            </button>
            <Link
              href={`/va/${vaId}/manage/pireps`}
              className="pb-4 px-2 font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              📋 PIREPs
            </Link>
            <Link
              href={`/va/${vaId}/logbook`}
              className="pb-4 px-2 font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              📖 My Logbook
            </Link>
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
                              onClick={() => handleEditAircraft(aircraft)}
                              className="text-aviation-600 hover:text-aviation-700 font-semibold mr-4"
                            >
                              Update
                            </button>
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
                              onClick={() => handleEditRoute(route)}
                              className="text-aviation-600 hover:text-aviation-700 font-semibold mr-4"
                            >
                              Update
                            </button>
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

        {/* Members Tab */}
        {activeTab === 'members' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Members ({members.length})</h2>
            </div>

            {members.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Username</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Email</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Role</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Flights</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Hours</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Points</th>
                        <th className="text-right px-6 py-3 text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">{member.username}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{member.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              member.role === 'Owner' ? 'bg-purple-100 text-purple-700' :
                              member.role === 'Admin' ? 'bg-blue-100 text-blue-700' :
                              member.role === 'Pilot' ? 'bg-green-100 text-green-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{member.total_flights}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{Number(member.total_hours || 0).toFixed(1)}h</td>
                          <td className="px-6 py-4 text-sm font-semibold text-aviation-600">{member.points}</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {member.role !== 'Owner' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setMemberRole(member.role);
                                    setShowManageMember(true);
                                  }}
                                  className="text-aviation-600 hover:text-aviation-700 font-semibold"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-red-600 hover:text-red-700 font-semibold"
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Members Yet</h3>
                <p className="text-slate-600">Members will appear here when they join your VA</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Events ({events.length})</h2>
              <button
                onClick={() => setShowAddEvent(true)}
                className="btn-primary"
              >
                + Add Event
              </button>
            </div>

            {events.length > 0 ? (
              <div className="grid gap-4">
                {events.map((event) => (
                  <div key={event.id} className="card overflow-hidden">
                    {event.cover_image && (
                      <div className="h-48 bg-slate-200">
                        <img 
                          src={event.cover_image.startsWith('http') 
                            ? event.cover_image 
                            : `http://localhost:3001${event.cover_image}`
                          }
                          alt={event.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Failed to load image:', event.cover_image);
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.style.display = 'none';
                            }
                          }}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{event.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            event.event_type === 'focus_airport' ? 'bg-blue-100 text-blue-700' :
                            event.event_type === 'route_challenge' ? 'bg-green-100 text-green-700' :
                            event.event_type === 'competition' ? 'bg-orange-100 text-orange-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {event.event_type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-aviation-600 hover:text-aviation-700 font-semibold"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-700 font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 mb-4">{event.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-slate-500">Start: </span>
                          <span className="font-semibold">{new Date(event.start_date).toLocaleDateString()}</span>
                          <span className="text-slate-500 ml-4">End: </span>
                          <span className="font-semibold">{new Date(event.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-aviation-600 font-bold">
                          +{event.bonus_points} bonus points
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Events</h3>
                <p className="text-slate-600 mb-6">Create your first event to engage pilots</p>
                <button onClick={() => setShowAddEvent(true)} className="btn-primary">
                  + Add Event
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

      {/* Manage Member Modal */}
      {showManageMember && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 rounded-2xl shadow-2xl max-w-md w-full"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">👤 Manage Member</h2>
                <button
                  onClick={() => setShowManageMember(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-2">Member: <span className="font-semibold text-slate-900">{selectedMember.username}</span></p>
                <p className="text-sm text-slate-600">Email: <span className="font-semibold">{selectedMember.email}</span></p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role
                </label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                >
                  <option value="Member">Member</option>
                  <option value="Pilot">Pilot</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowManageMember(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateMemberRole}
                  disabled={updatingMember}
                  className="flex-1 btn-primary"
                >
                  {updatingMember ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">🎯 Add Event</h2>
                <button
                  onClick={() => {
                    setShowAddEvent(false);
                    setEventCoverFile(null);
                    setEventCoverPreview('');
                  }}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                    placeholder="Summer Tour 2025"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    placeholder="Describe your event..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    value={eventForm.event_type}
                    onChange={(e) => setEventForm({...eventForm, event_type: e.target.value})}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  >
                    <option value="special_event">Special Event</option>
                    <option value="focus_airport">Focus Airport</option>
                    <option value="route_challenge">Route Challenge</option>
                    <option value="competition">Competition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cover Image
                  </label>
                  <div className="space-y-4">
                    {eventCoverPreview && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-slate-300">
                        <img
                          src={eventCoverPreview}
                          alt="Event cover preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEventCoverFile(null);
                            setEventCoverPreview('');
                            setEventForm({...eventForm, cover_image_url: ''});
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">Upload from computer</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEventCoverFile(file);
                            setEventCoverPreview(URL.createObjectURL(file));
                            setEventForm({...eventForm, cover_image_url: ''});
                          }
                        }}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                      />
                    </div>
                    <div className="text-center text-sm text-slate-500">OR</div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">Image URL</label>
                      <input
                        type="url"
                        value={eventForm.cover_image_url}
                        onChange={(e) => {
                          setEventForm({...eventForm, cover_image_url: e.target.value});
                          if (e.target.value) {
                            setEventCoverFile(null);
                            setEventCoverPreview(e.target.value);
                          }
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.start_date}
                      onChange={(e) => setEventForm({...eventForm, start_date: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.end_date}
                      onChange={(e) => setEventForm({...eventForm, end_date: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Bonus Points
                  </label>
                  <input
                    type="number"
                    value={eventForm.bonus_points}
                    onChange={(e) => setEventForm({...eventForm, bonus_points: parseInt(e.target.value) || 0})}
                    min="0"
                    placeholder="100"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEvent(false);
                      setEventCoverFile(null);
                      setEventCoverPreview('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingEvent}
                    className="flex-1 btn-primary"
                  >
                    {addingEvent ? 'Adding...' : 'Add Event'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Aircraft Modal */}
      {showEditAircraft && selectedAircraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">✈️ Update Aircraft</h2>
                <button
                  onClick={() => {
                    setShowEditAircraft(false);
                    setSelectedAircraft(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateAircraft} className="space-y-6">
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
                    onClick={() => {
                      setShowEditAircraft(false);
                      setSelectedAircraft(null);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingAircraft}
                    className="flex-1 btn-primary"
                  >
                    {updatingAircraft ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Route Modal */}
      {showEditRoute && selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">🗺️ Update Route</h2>
                <button
                  onClick={() => {
                    setShowEditRoute(false);
                    setSelectedRoute(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateRoute} className="space-y-6">
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
                    onClick={() => {
                      setShowEditRoute(false);
                      setSelectedRoute(null);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingRoute}
                    className="flex-1 btn-primary"
                  >
                    {updatingRoute ? 'Updating...' : 'Update Route'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditEvent && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">🎯 Update Event</h2>
                <button
                  onClick={() => {
                    setShowEditEvent(false);
                    setSelectedEvent(null);
                    setEventCoverFile(null);
                    setEventCoverPreview('');
                  }}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateEvent} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                    placeholder="Summer Challenge 2024"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    placeholder="Event description..."
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    value={eventForm.event_type}
                    onChange={(e) => setEventForm({...eventForm, event_type: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  >
                    <option value="focus_airport">Focus Airport</option>
                    <option value="route_challenge">Route Challenge</option>
                    <option value="competition">Competition</option>
                    <option value="special_event">Special Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-4">
                    Cover Image
                  </label>
                  <div className="space-y-4">
                    {eventCoverPreview && (
                      <div className="relative w-full h-48 bg-slate-200 rounded-lg overflow-hidden">
                        <img
                          src={eventCoverPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEventCoverFile(null);
                            setEventCoverPreview('');
                            setEventForm({...eventForm, cover_image_url: ''});
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">Upload from computer</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEventCoverFile(file);
                            setEventCoverPreview(URL.createObjectURL(file));
                            setEventForm({...eventForm, cover_image_url: ''});
                          }
                        }}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                      />
                    </div>
                    <div className="text-center text-sm text-slate-500">OR</div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">Image URL</label>
                      <input
                        type="url"
                        value={eventForm.cover_image_url}
                        onChange={(e) => {
                          setEventForm({...eventForm, cover_image_url: e.target.value});
                          if (e.target.value) {
                            setEventCoverFile(null);
                            setEventCoverPreview(e.target.value);
                          }
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.start_date}
                      onChange={(e) => setEventForm({...eventForm, start_date: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.end_date}
                      onChange={(e) => setEventForm({...eventForm, end_date: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Bonus Points
                  </label>
                  <input
                    type="number"
                    value={eventForm.bonus_points}
                    onChange={(e) => setEventForm({...eventForm, bonus_points: parseInt(e.target.value) || 0})}
                    min="0"
                    placeholder="100"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditEvent(false);
                      setSelectedEvent(null);
                      setEventCoverFile(null);
                      setEventCoverPreview('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingEvent}
                    className="flex-1 btn-primary"
                  >
                    {updatingEvent ? 'Updating...' : 'Update Event'}
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
