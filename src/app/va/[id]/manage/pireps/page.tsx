'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import FlightMap from '@/components/FlightMap';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface FlightReport {
  id: number;
  flight_id: number;
  flight_number: string;
  pilot_username: string;
  pilot_id: number;
  departure_icao: string;
  departure_name: string;
  arrival_icao: string;
  arrival_name: string;
  aircraft_registration?: string;
  aircraft_name?: string;
  aircraft_type?: string;
  validation_status: 'pending' | 'approved' | 'rejected';
  actual_departure_time: string;
  actual_arrival_time: string;
  flight_duration: number;
  distance_flown: number;
  fuel_used: number;
  landing_rate: number;
  telemetry_data: any;
  points_awarded: number;
  admin_notes?: string;
  created_at: string;
  validated_at?: string;
  dep_lat: number;
  dep_lon: number;
  arr_lat: number;
  arr_lon: number;
}

interface VA {
  id: number;
  name: string;
  logo_url?: string;
}

export default function VAManagePirepsPage() {
  const params = useParams();
  const router = useRouter();
  const vaId = params.id as string;

  const [va, setVa] = useState<VA | null>(null);
  const [reports, setReports] = useState<FlightReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<FlightReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Detail modal states
  const [selectedReport, setSelectedReport] = useState<FlightReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'approved' | 'rejected'>('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (vaId) {
      fetchVAData();
      fetchReports();
    }
  }, [vaId]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(r => r.validation_status === statusFilter));
    }
  }, [statusFilter, reports]);

  const fetchVAData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines/${vaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVa(data.virtualAirline);
      }
    } catch (err) {
      console.error('Failed to fetch VA data:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/flights/va/${vaId}/reports?status=all`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.reports || []);
    } catch (err: any) {
      console.error('Failed to fetch reports:', err);
      setError(err.message || 'Failed to load flight reports');
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (report: FlightReport) => {
    setSelectedReport(report);
    setValidationStatus(report.validation_status === 'rejected' ? 'rejected' : 'approved');
    setAdminNotes(report.admin_notes || '');
    setPointsAwarded(report.points_awarded || calculateDefaultPoints(report));
    setShowDetailModal(true);
  };

  const calculateDefaultPoints = (report: FlightReport): number => {
    // Base points calculation
    let points = 100;
    
    // Distance bonus
    const distance = Number(report.distance_flown || 0);
    if (distance > 500) points += 50;
    if (distance > 1000) points += 100;
    
    // Landing rate bonus
    const landingRate = Math.abs(Number(report.landing_rate || 0));
    if (landingRate < 100) points += 50;
    if (landingRate < 50) points += 100;
    
    return points;
  };

  const handleValidate = async () => {
    if (!selectedReport) return;

    setValidating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/flights/reports/${selectedReport.id}/validate`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            validation_status: validationStatus,
            admin_notes: adminNotes,
            points_awarded: validationStatus === 'approved' ? pointsAwarded : 0
          })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to validate report');
      }

      // Success
      setShowDetailModal(false);
      setSelectedReport(null);
      await fetchReports();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setValidating(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return badges[status as keyof typeof badges] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading flight reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with VA Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            {va?.logo_url && (
              <img src={va.logo_url} alt={va.name} className="h-16 w-auto object-contain" />
            )}
            <div>
              <Link href={`/va/${vaId}/manage`} className="text-aviation-600 hover:text-aviation-700 mb-2 inline-block">
                ← Back to Management
              </Link>
              <h1 className="text-4xl font-bold text-slate-900">📋 PIREP Validation</h1>
              <p className="text-slate-600 mt-1">{va?.name}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                statusFilter === 'pending'
                  ? 'text-aviation-600 border-b-2 border-aviation-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ⏳ Pending ({reports.filter(r => r.validation_status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                statusFilter === 'approved'
                  ? 'text-aviation-600 border-b-2 border-aviation-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ✅ Approved ({reports.filter(r => r.validation_status === 'approved').length})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                statusFilter === 'rejected'
                  ? 'text-aviation-600 border-b-2 border-aviation-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ❌ Rejected ({reports.filter(r => r.validation_status === 'rejected').length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'text-aviation-600 border-b-2 border-aviation-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              📊 All ({reports.length})
            </button>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length > 0 ? (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openDetailModal(report)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-aviation-600">{report.flight_number}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(report.validation_status)}`}>
                        {report.validation_status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-2">
                      👨‍✈️ <Link href={`/profile/${report.pilot_id}`} className="font-semibold hover:text-aviation-600" onClick={(e) => e.stopPropagation()}>
                        {report.pilot_username}
                      </Link>
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <span>
                        <span className="font-semibold">{report.departure_icao}</span> → <span className="font-semibold">{report.arrival_icao}</span>
                      </span>
                      <span>⏱️ {formatDuration(report.flight_duration)}</span>
                      <span>✈️ {report.distance_flown ? Number(report.distance_flown).toFixed(0) : '0'} NM</span>
                      <span>⬇️ {report.landing_rate ? `-${Math.abs(Number(report.landing_rate)).toFixed(0)}` : '0'} fpm</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">
                      {new Date(report.created_at).toLocaleDateString()} {new Date(report.created_at).toLocaleTimeString()}
                    </p>
                    {report.validation_status === 'approved' && (
                      <p className="text-lg font-bold text-yellow-600">⭐ {report.points_awarded} pts</p>
                    )}
                  </div>
                </div>
                {report.aircraft_name && (
                  <div className="text-sm text-slate-500">
                    🛩️ {report.aircraft_registration} - {report.aircraft_name}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Reports</h3>
            <p className="text-slate-600">
              {statusFilter === 'pending' && 'No pending flight reports to validate'}
              {statusFilter === 'approved' && 'No approved flight reports yet'}
              {statusFilter === 'rejected' && 'No rejected flight reports'}
              {statusFilter === 'all' && 'No flight reports submitted yet'}
            </p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-50 rounded-2xl shadow-2xl max-w-6xl w-full my-8"
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Flight Report - {selectedReport.flight_number}
                    </h2>
                    <p className="text-slate-600">
                      Pilot: <span className="font-semibold">{selectedReport.pilot_username}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                {/* Flight Info Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="card p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">📍 Route Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-500">Departure</p>
                        <p className="font-semibold text-slate-900">
                          {selectedReport.departure_icao} - {selectedReport.departure_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Arrival</p>
                        <p className="font-semibold text-slate-900">
                          {selectedReport.arrival_icao} - {selectedReport.arrival_name}
                        </p>
                      </div>
                      {selectedReport.aircraft_name && (
                        <div>
                          <p className="text-sm text-slate-500">Aircraft</p>
                          <p className="font-semibold text-slate-900">
                            {selectedReport.aircraft_registration} - {selectedReport.aircraft_name}
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
                        <span className="font-semibold">{formatDuration(selectedReport.flight_duration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Distance</span>
                        <span className="font-semibold">{selectedReport.distance_flown ? Number(selectedReport.distance_flown).toFixed(2) : '0'} NM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Fuel Used</span>
                        <span className="font-semibold">{selectedReport.fuel_used ? Number(selectedReport.fuel_used).toFixed(2) : '0'} lbs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Landing Rate</span>
                        <span className={`font-semibold ${Math.abs(Number(selectedReport.landing_rate || 0)) < 100 ? 'text-green-600' : Math.abs(Number(selectedReport.landing_rate || 0)) < 200 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {selectedReport.landing_rate ? `-${Math.abs(Number(selectedReport.landing_rate)).toFixed(0)}` : '0'} fpm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Flight Statistics */}
                <div className="mb-6 mt-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Complete Flight Statistics</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {/* Distance */}
                    <div className="card p-4 bg-blue-50 border-2 border-blue-200">
                      <p className="text-sm text-blue-600 font-semibold">✈️ Distance</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {selectedReport.distance_flown ? Number(selectedReport.distance_flown).toFixed(2) : '0'} NM
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="card p-4 bg-purple-50 border-2 border-purple-200">
                      <p className="text-sm text-purple-600 font-semibold">⏱️ Duration</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatDuration(selectedReport.flight_duration)}
                      </p>
                    </div>

                    {/* Landing Rate */}
                    <div className={`card p-4 border-2 ${
                      Math.abs(Number(selectedReport.landing_rate || 0)) < 100 
                        ? 'bg-green-50 border-green-200' 
                        : Math.abs(Number(selectedReport.landing_rate || 0)) < 200 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className={`text-sm font-semibold ${
                        Math.abs(Number(selectedReport.landing_rate || 0)) < 100 
                          ? 'text-green-600' 
                          : Math.abs(Number(selectedReport.landing_rate || 0)) < 200 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        ⬇️ Landing Rate
                      </p>
                      <p className={`text-2xl font-bold ${
                        Math.abs(Number(selectedReport.landing_rate || 0)) < 100 
                          ? 'text-green-900' 
                          : Math.abs(Number(selectedReport.landing_rate || 0)) < 200 
                          ? 'text-yellow-900' 
                          : 'text-red-900'
                      }`}>
                        {selectedReport.landing_rate ? `-${Math.abs(Number(selectedReport.landing_rate)).toFixed(0)}` : '0'} fpm
                      </p>
                      <p className="text-xs mt-1 opacity-75">
                        {Math.abs(Number(selectedReport.landing_rate || 0)) < 100 
                          ? '� Excellent' 
                          : Math.abs(Number(selectedReport.landing_rate || 0)) < 200 
                          ? '🟡 Good' 
                          : '🔴 Hard Landing'}
                      </p>
                    </div>

                    {/* Fuel Used */}
                    <div className="card p-4 bg-orange-50 border-2 border-orange-200">
                      <p className="text-sm text-orange-600 font-semibold">⛽ Fuel Used</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {selectedReport.fuel_used ? Number(selectedReport.fuel_used).toFixed(0) : '0'} lbs
                      </p>
                    </div>

                    {/* Max Altitude */}
                    {selectedReport.telemetry_data?.max_altitude && (
                      <div className="card p-4 bg-sky-50 border-2 border-sky-200">
                        <p className="text-sm text-sky-600 font-semibold">⬆️ Max Altitude</p>
                        <p className="text-2xl font-bold text-sky-900">
                          {Number(selectedReport.telemetry_data.max_altitude).toFixed(0)} ft
                        </p>
                      </div>
                    )}

                    {/* Max Speed */}
                    {selectedReport.telemetry_data?.max_speed && (
                      <div className="card p-4 bg-indigo-50 border-2 border-indigo-200">
                        <p className="text-sm text-indigo-600 font-semibold">🚀 Max Speed</p>
                        <p className="text-2xl font-bold text-indigo-900">
                          {Number(selectedReport.telemetry_data.max_speed).toFixed(0)} kts
                        </p>
                      </div>
                    )}

                    {/* Tracking Points */}
                    {selectedReport.telemetry_data?.telemetry_points && (
                      <div className="card p-4 bg-teal-50 border-2 border-teal-200">
                        <p className="text-sm text-teal-600 font-semibold">📍 Tracking Points</p>
                        <p className="text-2xl font-bold text-teal-900">
                          {selectedReport.telemetry_data.telemetry_points.length}
                        </p>
                      </div>
                    )}

                    {/* Flight Status */}
                    <div className="card p-4 bg-slate-50 border-2 border-slate-200">
                      <p className="text-sm text-slate-600 font-semibold">📋 Status</p>
                      <p className={`text-xl font-bold ${
                        selectedReport.validation_status === 'approved' ? 'text-green-600' :
                        selectedReport.validation_status === 'rejected' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {selectedReport.validation_status === 'approved' ? '✅ Approved' :
                         selectedReport.validation_status === 'rejected' ? '❌ Rejected' :
                         '⏳ Pending'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flight Map - Trajectoire complète */}
                {selectedReport.telemetry_data?.telemetry_points && selectedReport.dep_lat && selectedReport.arr_lat && (
                  <div className="mb-6 mt-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">🗺️ Flight Path - Detailed Trajectory</h3>
                    <div className="card overflow-hidden" style={{ height: '500px' }}>
                      <FlightMap
                        origin={{
                          icao_code: selectedReport.departure_icao,
                          pos_lat: selectedReport.dep_lat.toString(),
                          pos_long: selectedReport.dep_lon.toString()
                        }}
                        destination={{
                          icao_code: selectedReport.arrival_icao,
                          pos_lat: selectedReport.arr_lat.toString(),
                          pos_long: selectedReport.arr_lon.toString()
                        }}
                        waypoints={selectedReport.telemetry_data.telemetry_points.map((point: any, index: number) => ({
                          ident: `WP${index + 1}`,
                          pos_lat: point.latitude?.toString() || '0',
                          pos_long: point.longitude?.toString() || '0',
                          type: point.altitude ? `${Math.round(point.altitude)} ft - ${Math.round(point.groundSpeed || 0)} kts` : undefined
                        }))}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      ✈️ Full trajectory displayed with all {selectedReport.telemetry_data.telemetry_points.length} tracking points
                    </p>
                  </div>
                )}

                {/* Validation Section */}
                {selectedReport.validation_status === 'pending' && (
                  <div className="card p-6 bg-yellow-50 border-2 border-yellow-200 mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">✅ Validate Flight Report</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Status *
                        </label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setValidationStatus('approved')}
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                              validationStatus === 'approved'
                                ? 'bg-green-600 text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            ✅ Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setValidationStatus('rejected')}
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                              validationStatus === 'rejected'
                                ? 'bg-red-600 text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>

                      {validationStatus === 'approved' && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Points Awarded
                          </label>
                          <input
                            type="number"
                            value={pointsAwarded}
                            onChange={(e) => setPointsAwarded(parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Admin Notes (optional)
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={3}
                          placeholder="Add any notes or feedback for the pilot..."
                          className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                        />
                      </div>

                      <button
                        onClick={handleValidate}
                        disabled={validating}
                        className="w-full btn-primary"
                      >
                        {validating ? 'Validating...' : `${validationStatus === 'approved' ? 'Approve' : 'Reject'} Flight Report`}
                      </button>
                    </div>
                  </div>
                )}

                {/* Already Validated Info */}
                {selectedReport.validation_status !== 'pending' && (
                  <div className={`card p-6 mb-6 ${
                    selectedReport.validation_status === 'approved' 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'bg-red-50 border-2 border-red-200'
                  }`}>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      {selectedReport.validation_status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      {selectedReport.validation_status === 'approved' && (
                        <p>
                          <span className="font-semibold">Points Awarded:</span> {selectedReport.points_awarded}
                        </p>
                      )}
                      {selectedReport.validated_at && (
                        <p>
                          <span className="font-semibold">Validated At:</span>{' '}
                          {new Date(selectedReport.validated_at).toLocaleDateString()}{' '}
                          {new Date(selectedReport.validated_at).toLocaleTimeString()}
                        </p>
                      )}
                      {selectedReport.admin_notes && (
                        <div>
                          <p className="font-semibold mb-1">Admin Notes:</p>
                          <p className="text-slate-700 bg-white p-3 rounded-lg">{selectedReport.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
