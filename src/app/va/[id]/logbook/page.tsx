'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { motion, AnimatePresence } from 'framer-motion';

interface FlightReport {
  id: number;
  flight_id: number;
  flight_number: string;
  departure_icao: string;
  departure_name: string;
  arrival_icao: string;
  arrival_name: string;
  aircraft_registration: string;
  aircraft_name: string;
  flight_duration: number;
  distance_flown: string;
  fuel_used: string;
  landing_rate: string;
  points_awarded: number;
  validation_status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  admin_id: number | null;
  validated_at: string | null;
  created_at: string;
  telemetry_data?: {
    max_altitude?: number;
    max_speed?: number;
  };
}

interface VAInfo {
  id: number;
  name: string;
  logo_url: string | null;
}

export default function LogbookPage() {
  const params = useParams();
  const router = useRouter();
  const vaId = params?.id as string;

  const [va, setVA] = useState<VAInfo | null>(null);
  const [flights, setFlights] = useState<FlightReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFlight, setSelectedFlight] = useState<FlightReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (vaId) {
      fetchVAInfo();
      fetchFlights();
    }
  }, [vaId]);

  const fetchVAInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/virtual-airlines/${vaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVA(data);
      }
    } catch (err) {
      console.error('Error fetching VA info:', err);
    }
  };

  const fetchFlights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/flights/my-reports/${vaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flight reports');
      }

      const data = await response.json();
      setFlights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-300';
    }
  };

  const openDetailModal = (flight: FlightReport) => {
    setSelectedFlight(flight);
    setShowDetailModal(true);
  };

  const filteredFlights = flights.filter(flight => {
    if (statusFilter === 'all') return true;
    return flight.validation_status === statusFilter;
  });

  const stats = {
    total: flights.length,
    approved: flights.filter(f => f.validation_status === 'approved').length,
    pending: flights.filter(f => f.validation_status === 'pending').length,
    rejected: flights.filter(f => f.validation_status === 'rejected').length,
    totalPoints: flights
      .filter(f => f.validation_status === 'approved')
      .reduce((sum, f) => sum + (f.points_awarded || 0), 0),
    totalHours: flights
      .filter(f => f.validation_status === 'approved')
      .reduce((sum, f) => sum + f.flight_duration, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-white text-xl">Loading your logbook...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header with VA Logo */}
        {va && (
          <div className="mb-8 text-center">
            {va.logo_url && (
              <img 
                src={va.logo_url} 
                alt={va.name}
                className="h-20 mx-auto mb-4 object-contain"
              />
            )}
            <h1 className="text-4xl font-bold text-white mb-2">My Logbook</h1>
            <p className="text-slate-300">{va.name}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-sm opacity-90">Total Flights</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="card p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-sm opacity-90">Approved</p>
            <p className="text-3xl font-bold">{stats.approved}</p>
          </div>
          <div className="card p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <p className="text-sm opacity-90">Pending</p>
            <p className="text-3xl font-bold">{stats.pending}</p>
          </div>
          <div className="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <p className="text-sm opacity-90">Total Points</p>
            <p className="text-3xl font-bold">{stats.totalPoints}</p>
          </div>
          <div className="card p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <p className="text-sm opacity-90">Flight Hours</p>
            <p className="text-3xl font-bold">{formatDuration(stats.totalHours)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-aviation-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              📊 All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              ⏳ Pending ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                statusFilter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              ✅ Approved ({stats.approved})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                statusFilter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              ❌ Rejected ({stats.rejected})
            </button>
          </div>
        </div>

        {/* Flights List */}
        {filteredFlights.length > 0 ? (
          <div className="space-y-4">
            {filteredFlights.map((flight) => (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openDetailModal(flight)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-aviation-600">{flight.flight_number}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(flight.validation_status)}`}>
                        {flight.validation_status.toUpperCase()}
                      </span>
                      {flight.admin_notes && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                          💬 Has Comments
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-600 mb-3">
                      <span>
                        <span className="font-semibold">{flight.departure_icao}</span> → <span className="font-semibold">{flight.arrival_icao}</span>
                      </span>
                      <span>⏱️ {formatDuration(flight.flight_duration)}</span>
                      <span>✈️ {Number(flight.distance_flown).toFixed(0)} NM</span>
                      <span>⬇️ -{Math.abs(Number(flight.landing_rate)).toFixed(0)} fpm</span>
                    </div>
                    {flight.aircraft_name && (
                      <div className="text-sm text-slate-500">
                        🛩️ {flight.aircraft_registration} - {flight.aircraft_name}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">
                      {new Date(flight.created_at).toLocaleDateString()}
                    </p>
                    {flight.validation_status === 'approved' && (
                      <p className="text-lg font-bold text-yellow-600">⭐ {flight.points_awarded} pts</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Flights</h3>
            <p className="text-slate-600">
              {statusFilter === 'all' && 'No flights in your logbook yet'}
              {statusFilter === 'pending' && 'No pending flights'}
              {statusFilter === 'approved' && 'No approved flights yet'}
              {statusFilter === 'rejected' && 'No rejected flights'}
            </p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedFlight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-50 rounded-2xl shadow-2xl max-w-4xl w-full my-8"
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Flight Report - {selectedFlight.flight_number}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedFlight.validation_status)}`}>
                        {selectedFlight.validation_status.toUpperCase()}
                      </span>
                      {selectedFlight.validation_status === 'approved' && (
                        <span className="text-lg font-bold text-yellow-600">⭐ {selectedFlight.points_awarded} points</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Flight Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="card p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">📍 Route Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-500">Departure</p>
                        <p className="font-semibold text-slate-900">
                          {selectedFlight.departure_icao} - {selectedFlight.departure_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Arrival</p>
                        <p className="font-semibold text-slate-900">
                          {selectedFlight.arrival_icao} - {selectedFlight.arrival_name}
                        </p>
                      </div>
                      {selectedFlight.aircraft_name && (
                        <div>
                          <p className="text-sm text-slate-500">Aircraft</p>
                          <p className="font-semibold text-slate-900">
                            {selectedFlight.aircraft_registration} - {selectedFlight.aircraft_name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">⏱️ Flight Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Duration</span>
                        <span className="font-semibold">{formatDuration(selectedFlight.flight_duration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Distance</span>
                        <span className="font-semibold">{Number(selectedFlight.distance_flown).toFixed(2)} NM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Fuel Used</span>
                        <span className="font-semibold">{Number(selectedFlight.fuel_used).toFixed(2)} lbs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Landing Rate</span>
                        <span className={`font-semibold ${Math.abs(Number(selectedFlight.landing_rate)) < 100 ? 'text-green-600' : Math.abs(Number(selectedFlight.landing_rate)) < 200 ? 'text-yellow-600' : 'text-red-600'}`}>
                          -{Math.abs(Number(selectedFlight.landing_rate)).toFixed(0)} fpm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telemetry Stats */}
                {selectedFlight.telemetry_data && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Flight Statistics</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedFlight.telemetry_data.max_altitude && (
                        <div className="card p-4 bg-sky-50 border-2 border-sky-200">
                          <p className="text-sm text-sky-600 font-semibold">⬆️ Max Altitude</p>
                          <p className="text-2xl font-bold text-sky-900">
                            {Number(selectedFlight.telemetry_data.max_altitude).toFixed(0)} ft
                          </p>
                        </div>
                      )}
                      {selectedFlight.telemetry_data.max_speed && (
                        <div className="card p-4 bg-indigo-50 border-2 border-indigo-200">
                          <p className="text-sm text-indigo-600 font-semibold">🚀 Max Speed</p>
                          <p className="text-2xl font-bold text-indigo-900">
                            {Number(selectedFlight.telemetry_data.max_speed).toFixed(0)} kts
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Comments */}
                {selectedFlight.admin_notes && (
                  <div className="card p-6 bg-blue-50 border-2 border-blue-200 mb-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">💬 Admin Comments</h3>
                    <p className="text-slate-700 whitespace-pre-wrap mb-3">{selectedFlight.admin_notes}</p>
                    {selectedFlight.validated_at && (
                      <div className="text-sm text-slate-500 border-t border-blue-200 pt-3">
                        <p>Validated on: {new Date(selectedFlight.validated_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Submission Date */}
                <div className="text-sm text-slate-500 text-center">
                  Submitted on {new Date(selectedFlight.created_at).toLocaleString()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
