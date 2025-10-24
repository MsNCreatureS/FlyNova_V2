'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';

interface Stats {
  totalVAs: number;
  totalUsers: number;
  totalFlights: number;
  completedFlights: number;
  activeVAs: number;
  recentUsers: number;
}

interface VirtualAirline {
  id: number;
  name: string;
  callsign: string;
  icao_code: string;
  iata_code: string;
  status: string;
  created_at: string;
  logo_url: string;
  owner_username: string;
  owner_email: string;
  member_count: number;
  total_flights: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  status: string;
  is_super_admin: boolean;
  created_at: string;
  last_login: string;
  va_count: number;
  flight_count: number;
}

interface Activity {
  type: string;
  entity_id: number;
  entity_name: string;
  username: string;
  timestamp: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [virtualAirlines, setVirtualAirlines] = useState<VirtualAirline[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'vas' | 'users' | 'activities'>('overview');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Fetch stats
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsRes.status === 403) {
        alert('Access denied. Super Admin privileges required.');
        router.push('/dashboard');
        return;
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch VAs
      const vasRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/virtual-airlines`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (vasRes.ok) {
        const vasData = await vasRes.json();
        setVirtualAirlines(vasData.virtualAirlines);
      }

      // Fetch Users
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }

      // Fetch Activities
      const activitiesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.activities);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const updateVAStatus = async (vaId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/virtual-airlines/${vaId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating VA status:', error);
    }
  };

  const deleteVA = async (vaId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/virtual-airlines/${vaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting VA:', error);
    }
  };

  const updateUserStatus = async (userId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'va_created': return '✈️';
      case 'user_registered': return '👤';
      case 'flight_completed': return '🎯';
      default: return '📌';
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'va_created':
        return `${activity.username} created VA "${activity.entity_name}"`;
      case 'user_registered':
        return `New user registered: ${activity.username}`;
      case 'flight_completed':
        return `${activity.username} completed flight ${activity.entity_name}`;
      default:
        return activity.entity_name;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading Super Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                <span className="text-red-600">🔐</span>
                Super Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-2">Manage all Virtual Airlines and Users</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="text-3xl mb-2">✈️</div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalVAs}</div>
              <div className="text-sm text-slate-600">Total VAs</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="text-3xl mb-2">🟢</div>
              <div className="text-2xl font-bold text-green-600">{stats.activeVAs}</div>
              <div className="text-sm text-slate-600">Active VAs</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
              <div className="text-sm text-slate-600">Total Users</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="text-3xl mb-2">✨</div>
              <div className="text-2xl font-bold text-blue-600">{stats.recentUsers}</div>
              <div className="text-sm text-slate-600">New (7d)</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="text-3xl mb-2">🛫</div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalFlights}</div>
              <div className="text-sm text-slate-600">Total Flights</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">{stats.completedFlights}</div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('vas')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'vas'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✈️ Virtual Airlines ({virtualAirlines.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👥 Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'activities'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📈 Recent Activities
            </button>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activities</h3>
                  <div className="space-y-2">
                    {activities.slice(0, 10).map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">{getActivityText(activity)}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Virtual Airlines Tab */}
            {activeTab === 'vas' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Logo</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Callsign</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Owner</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Members</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Flights</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {virtualAirlines.map((va) => (
                      <tr key={va.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          {va.logo_url ? (
                            <img src={va.logo_url} alt={va.name} className="h-10 w-10 object-contain" />
                          ) : (
                            <div className="h-10 w-10 bg-slate-200 rounded flex items-center justify-center text-slate-500">
                              ✈️
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">{va.name}</td>
                        <td className="py-3 px-4 text-slate-600">{va.callsign}</td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{va.owner_username}</div>
                          <div className="text-xs text-slate-500">{va.owner_email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{va.member_count}</td>
                        <td className="py-3 px-4 text-slate-600">{va.total_flights}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            va.status === 'active' ? 'bg-green-100 text-green-700' :
                            va.status === 'suspended' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {va.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {va.status === 'active' ? (
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Suspend VA',
                                    message: `Are you sure you want to suspend ${va.name}?`,
                                    onConfirm: () => {
                                      updateVAStatus(va.id, 'suspended');
                                      setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                                    }
                                  });
                                }}
                                className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => updateVAStatus(va.id, 'active')}
                                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete VA',
                                  message: `Are you sure you want to permanently delete ${va.name}? This action cannot be undone.`,
                                  onConfirm: () => {
                                    deleteVA(va.id);
                                    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                                  }
                                });
                              }}
                              className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Avatar</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Username</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">VAs</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Flights</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="h-10 w-10 rounded-full" />
                          ) : (
                            <div className="h-10 w-10 bg-aviation-600 rounded-full flex items-center justify-center text-white font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">{user.username}</td>
                        <td className="py-3 px-4 text-slate-600">{user.email}</td>
                        <td className="py-3 px-4 text-slate-600">{user.va_count}</td>
                        <td className="py-3 px-4 text-slate-600">{user.flight_count}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.status === 'active' ? 'bg-green-100 text-green-700' :
                            user.status === 'suspended' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.is_super_admin && (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                              Super Admin
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {!user.is_super_admin && (
                            <div className="flex gap-2">
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: 'Suspend User',
                                      message: `Are you sure you want to suspend ${user.username}?`,
                                      onConfirm: () => {
                                        updateUserStatus(user.id, 'suspended');
                                        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                                      }
                                    });
                                  }}
                                  className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                >
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateUserStatus(user.id, 'active')}
                                  className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                >
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Delete User',
                                    message: `Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`,
                                    onConfirm: () => {
                                      deleteUser(user.id);
                                      setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                                    }
                                  });
                                }}
                                className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div className="space-y-2">
                {activities.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100">
                    <span className="text-3xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">{getActivityText(activity)}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
        type="danger"
      />
    </div>
  );
}
