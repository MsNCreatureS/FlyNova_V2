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
  icao_code?: string;
  iata_code?: string;
  logo_url?: string;
  description: string;
  owner_id: number;
  owner_username: string;
  created_at: string;
}

interface Member {
  user_id: number;
  username: string;
  avatar_url?: string;
  role: string;
  points: number;
  joined_at: string;
}

interface FleetAircraft {
  id: number;
  registration: string;
  aircraft_name: string;
  status: string;
  home_airport: string;
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
}

export default function VADetailPage() {
  const router = useRouter();
  const params = useParams();
  const vaId = params.id as string;

  const [va, setVa] = useState<VA | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [fleet, setFleet] = useState<FleetAircraft[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'routes' | 'leaderboard'>('overview');
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (vaId) {
      fetchVAData();
    }
  }, [vaId]);

  const fetchVAData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Fetch VA details
      const vaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines/${vaId}`, { headers });
      const vaData = await vaResponse.json();
      setVa(vaData.virtualAirline);
      
      // Set edit form with current data
      setEditForm({
        name: vaData.virtualAirline.name || '',
        description: vaData.virtualAirline.description || '',
        website: vaData.virtualAirline.website || '',
        logo_url: vaData.virtualAirline.logo_url || ''
      });

      // Check if user is a member or owner
      if (token) {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const memberRole = vaData.members?.find((m: Member) => m.user_id === userData.user.id);
          
          // Check if user is the owner
          const isOwner = userData.user.id === vaData.virtualAirline.owner_id;
          
          if (memberRole) {
            setIsMember(true);
            setUserRole(memberRole.role);
          } else if (isOwner) {
            // Owner should have full access even if not officially a member
            setIsMember(true);
            setUserRole('Owner');
          }
        }
      }

      setMembers(vaData.members || []);

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

    } catch (error) {
      console.error('Failed to fetch VA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinVA = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setJoining(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines/${vaId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchVAData(); // Refresh data
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to join VA');
      }
    } catch (error) {
      console.error('Failed to join VA:', error);
      alert('Failed to join VA');
    } finally {
      setJoining(false);
    }
  };

  const handleUpdateVA = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setUpdating(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', editForm.name);
      formDataToSend.append('description', editForm.description);
      formDataToSend.append('website', editForm.website || '');
      
      // Add logo file or URL
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      } else if (editForm.logo_url) {
        formDataToSend.append('logo_url', editForm.logo_url);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines/${vaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Failed to update VA');
      }

      // Success! Reload the page
      setShowEditModal(false);
      setLogoFile(null);
      setLogoPreview('');
      await fetchVAData();
    } catch (err: any) {
      setUpdateError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setEditForm({...editForm, logo_url: ''});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading virtual airline...</p>
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
          className="card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-6 flex-1">
              {va.logo_url && (
                <img src={va.logo_url} alt={va.name} className="w-24 h-24 object-contain" />
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">{va.name}</h1>
                <p className="text-2xl text-aviation-600 font-semibold mb-2">{va.callsign}</p>
                {(va.icao_code || va.iata_code) && (
                  <p className="text-slate-600 mb-3">
                    {va.icao_code && <span className="font-mono font-semibold">{va.icao_code}</span>}
                    {va.icao_code && va.iata_code && <span className="mx-2">•</span>}
                    {va.iata_code && <span className="font-mono font-semibold">{va.iata_code}</span>}
                  </p>
                )}
                <p className="text-slate-600">{va.description}</p>
                <p className="text-sm text-slate-500 mt-3">
                  Founded by <span className="font-semibold">{va.owner_username}</span> on {new Date(va.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {!isMember ? (
                <button
                  onClick={handleJoinVA}
                  disabled={joining}
                  className="btn-primary"
                >
                  {joining ? 'Joining...' : '✈️ Join This VA'}
                </button>
              ) : (
                <>
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold text-center">
                    ✓ Member ({userRole})
                  </div>
                  <Link href={`/va/${vaId}/logbook`} className="btn-primary text-center bg-purple-600 hover:bg-purple-700">
                    📖 My Logbook
                  </Link>
                  {(userRole === 'Owner' || userRole === 'Admin') && (
                    <>
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="btn-secondary text-center"
                      >
                        ✏️ Edit VA
                      </button>
                      <Link href={`/va/${vaId}/manage`} className="btn-primary text-center">
                        🛠️ Manage VA
                      </Link>
                      <Link href={`/va/${vaId}/manage/pireps`} className="btn-primary text-center bg-yellow-600 hover:bg-yellow-700">
                        📋 Validate PIREPs
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-6 text-center"
          >
            <p className="text-3xl font-bold text-aviation-600 mb-1">{members.length}</p>
            <p className="text-sm text-slate-600">Members</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card p-6 text-center"
          >
            <p className="text-3xl font-bold text-slate-900 mb-1">{fleet.length}</p>
            <p className="text-sm text-slate-600">Aircraft</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card p-6 text-center"
          >
            <p className="text-3xl font-bold text-slate-900 mb-1">{routes.length}</p>
            <p className="text-sm text-slate-600">Routes</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="card p-6 text-center"
          >
            <p className="text-3xl font-bold text-yellow-600 mb-1">
              {members.reduce((sum, m) => sum + m.points, 0)}
            </p>
            <p className="text-sm text-slate-600">Total Points</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex space-x-8">
            {['overview', 'fleet', 'routes', 'leaderboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 px-2 font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-aviation-600 border-b-2 border-aviation-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Recent Routes</h2>
              {routes.length > 0 ? (
                <div className="space-y-3">
                  {routes.slice(0, 5).map((route) => (
                    <div key={route.id} className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-lg text-aviation-600">{route.flight_number}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          route.route_type === 'Civil' ? 'bg-blue-100 text-blue-700' :
                          route.route_type === 'Cargo' ? 'bg-orange-100 text-orange-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {route.route_type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700">
                        <span className="font-semibold">{route.departure_icao}</span>
                        <span className="text-aviation-600">→</span>
                        <span className="font-semibold">{route.arrival_icao}</span>
                      </div>
                      {route.aircraft_type && (
                        <p className="text-sm text-slate-500 mt-2">🛩️ {route.aircraft_type}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center text-slate-500">No routes available</div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Top Pilots</h2>
              {members.length > 0 ? (
                <div className="space-y-3">
                  {members
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 5)
                    .map((member, index) => (
                      <div key={member.user_id} className="card p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-slate-400' :
                            index === 2 ? 'bg-orange-600' :
                            'bg-slate-300'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{member.username}</p>
                            <p className="text-xs text-slate-500">{member.role}</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-yellow-600">⭐ {member.points}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="card p-8 text-center text-slate-500">No members yet</div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {fleet.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fleet.map((aircraft) => (
                  <div key={aircraft.id} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-lg text-slate-900">{aircraft.registration}</p>
                        <p className="text-sm text-slate-600">{aircraft.aircraft_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        aircraft.status === 'Active' ? 'bg-green-100 text-green-700' :
                        aircraft.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {aircraft.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">🏠 {aircraft.home_airport}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Aircraft</h3>
                <p className="text-slate-600">This VA hasn't added any aircraft yet</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'routes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {routes.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Flight #</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Departure</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Arrival</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Aircraft</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Route Type</th>
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
                          <td className="px-6 py-4 text-sm text-slate-600">{route.aircraft_type || 'Any'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              route.route_type === 'Civil' ? 'bg-blue-100 text-blue-700' :
                              route.route_type === 'Cargo' ? 'bg-orange-100 text-orange-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {route.route_type}
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
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Routes</h3>
                <p className="text-slate-600">This VA hasn't created any routes yet</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {members.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Rank</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Pilot</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Role</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Points</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {members
                        .sort((a, b) => b.points - a.points)
                        .map((member, index) => (
                          <tr key={member.user_id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-slate-400' :
                                index === 2 ? 'bg-orange-600' :
                                'bg-slate-300'
                              }`}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Link href={`/profile/${member.user_id}`} className="font-semibold text-slate-900 hover:text-aviation-600">
                                {member.username}
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                member.role === 'Owner' ? 'bg-yellow-100 text-yellow-700' :
                                member.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {member.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-lg font-bold text-yellow-600">⭐ {member.points}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {new Date(member.joined_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Members</h3>
                <p className="text-slate-600">Be the first to join this VA!</p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Edit VA Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">✏️ Edit Virtual Airline</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setLogoFile(null);
                    setLogoPreview('');
                    setUpdateError('');
                  }}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {updateError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {updateError}
                </div>
              )}

              <form onSubmit={handleUpdateVA} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    VA Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Logo
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2">Upload from PC</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                      />
                    </div>
                    <div className="text-center text-sm text-slate-500">OR</div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2">Logo URL</label>
                      <input
                        type="url"
                        value={editForm.logo_url}
                        onChange={(e) => {
                          setEditForm({...editForm, logo_url: e.target.value});
                          setLogoFile(null);
                          setLogoPreview('');
                        }}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                      />
                    </div>
                    {(logoPreview || editForm.logo_url) && (
                      <div className="mt-4">
                        <p className="text-xs text-slate-600 mb-2">Preview:</p>
                        <div className="bg-white border-2 border-slate-300 rounded-lg p-4 flex items-center justify-center">
                          <img
                            src={logoPreview || editForm.logo_url}
                            alt="Logo Preview"
                            className="max-h-32 max-w-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setLogoFile(null);
                      setLogoPreview('');
                      setUpdateError('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 btn-primary"
                  >
                    {updating ? 'Updating...' : 'Update VA'}
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
