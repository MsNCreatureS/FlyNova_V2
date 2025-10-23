'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NavBar from '@/components/NavBar';
import FlightMap from '@/components/FlightMap';
import Script from 'next/script';
import dynamic from 'next/dynamic';

// Lazy load FlightMap to avoid SSR issues with Leaflet
const DynamicFlightMap = dynamic(() => import('@/components/FlightMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
      <p className="text-slate-600">Loading map...</p>
    </div>
  )
});

interface Flight {
  id: number;
  flight_number: string;
  departure_icao: string;
  departure_name: string;
  arrival_icao: string;
  arrival_name: string;
  aircraft_registration: string;
  aircraft_name: string;
  aircraft_icao?: string;  // Code ICAO de l'avion (B738, A320, etc.)
  status: string;
}

interface SimbriefData {
  origin: {
    icao_code: string;
    name: string;
    pos_lat: string;
    pos_long: string;
  };
  destination: {
    icao_code: string;
    name: string;
    pos_lat: string;
    pos_long: string;
  };
  general: {
    flight_number: string;
    is_etops: string;
    cruise_altitude: string;
    avg_wind_comp: string;
    avg_wind_dir: string;
    avg_wind_spd: string;
    gc_distance: string;
    route_distance: string;
  };
  aircraft: {
    name: string;
    icaocode: string;
    registration: string;
  };
  times: {
    est_time_enroute: string;
    sched_out: string;
    sched_off: string;
    sched_on: string;
    sched_in: string;
    taxi_out: string;
    taxi_in: string;
  };
  fuel: {
    plan_ramp: string;
    plan_takeoff: string;
    plan_landing: string;
    reserve: string;
    contingency: string;
    alternate_burn: string;
    avg_fuel_flow: string;
  };
  weights: {
    est_zfw: string;
    est_tow: string;
    est_ldw: string;
    max_tow: string;
    max_ldw: string;
  };
  weather: {
    orig_metar: string;
    dest_metar: string;
  };
  alternate: {
    icao_code: string;
    name: string;
  };
  route: string;
  images: {
    directory: string;
  };
}

export default function BriefingPage() {
  const router = useRouter();
  const params = useParams();
  const vaId = params.id as string;
  const flightId = params.flightId as string;

  const [flight, setFlight] = useState<Flight | null>(null);
  const [simbriefData, setSimbriefData] = useState<any | null>(null); // any car structure complexe
  const [loading, setLoading] = useState(true);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [fuelUnits, setFuelUnits] = useState<'KGS' | 'LBS'>('KGS'); // Choix d'unités
  const [activeTab, setActiveTab] = useState<'overview' | 'weather' | 'fuel' | 'weights'>('overview');
  const [showSimbriefForm, setShowSimbriefForm] = useState(false); // Formulaire SimBrief
  const [simbriefConfig, setSimbriefConfig] = useState({
    units: 'KGS' as 'KGS' | 'LBS',
    costIndex: ''
  });
  const [userSimbriefUsername, setUserSimbriefUsername] = useState<string | null>(null);

  const SIMBRIEF_API_KEY = '7visKd8EEiXJGFc0Jsp8LSu2Ck5L7WQw';

  useEffect(() => {
    if (flightId) {
      fetchFlightData();
      fetchUserProfile();
    }
    
    // Écouter les messages de SimBrief (callback automatique)
    const handleSimbriefCallback = (event: MessageEvent) => {
      console.log('Received postMessage:', { origin: event.origin, data: event.data }); // Debug ALL messages
      
      // Vérifier que le message vient de SimBrief
      if (event.origin.includes('simbrief.com') && event.data) {
        console.log('✅ SimBrief callback confirmed:', event.data); // Debug
        
        // Si on reçoit un OFP ID directement
        if (event.data.ofp_id) {
          console.log('🎯 Captured OFP ID from SimBrief:', event.data.ofp_id);
          saveOFPId(event.data.ofp_id);
          fetchSimbriefData(event.data.ofp_id);
          setGeneratingBrief(false);
        }
        // Sinon essayer avec username
        else if (event.data.username) {
          console.log('👤 Received username from SimBrief:', event.data.username);
          fetchSimbriefData(event.data.username);
          setGeneratingBrief(false);
        }
      }
    };
    
    window.addEventListener('message', handleSimbriefCallback);
    
    return () => {
      window.removeEventListener('message', handleSimbriefCallback);
    };
  }, [flightId]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserSimbriefUsername(data.user.simbrief_username);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchFlightData = async () => {
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

      // Fetch flight details
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flights/${flightId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setFlight(data.flight);

        // If we have a saved SimBrief username, load the last generated flight plan
        if (data.flight.simbrief_ofp_id) {
          console.log('📋 Loading last SimBrief plan for user:', data.flight.simbrief_ofp_id);
          fetchSimbriefData(data.flight.simbrief_ofp_id, false); // Don't save on initial load
        }
      }
    } catch (error) {
      console.error('Failed to fetch flight data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimbriefData = async (usernameOrId: string, saveUsername: boolean = true) => {
    try {
      console.log('🔍 Fetching SimBrief data for:', usernameOrId);
      
      // Always try with username - it returns the latest flight plan
      const response = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?username=${usernameOrId}&json=1`);
      
      if (response.ok) {
        const data = await response.json();
        setSimbriefData(data);
        
        console.log('✅ SimBrief data loaded successfully!');
        
        // Save the username for future auto-loading
        if (saveUsername) {
          console.log('💾 Saving SimBrief username to database...');
          await saveOFPId(usernameOrId);
        }
      } else {
        console.error('❌ Failed to fetch SimBrief data, status:', response.status);
      }
    } catch (error) {
      console.error('❌ Failed to fetch SimBrief data:', error);
    }
  };

  const generateSimbrief = async () => {
    if (!flight) return;

    // Ouvrir le formulaire de configuration
    setShowSimbriefForm(true);
  };

  const submitSimbriefGeneration = async () => {
    if (!flight) return;

    setShowSimbriefForm(false);
    setGeneratingBrief(true);
    setFuelUnits(simbriefConfig.units);

    try {
      // Debug: Log flight data
      console.log('🛩️ Flight data:', {
        aircraft_name: flight.aircraft_name,
        aircraft_icao: flight.aircraft_icao,
        aircraft_registration: flight.aircraft_registration
      });
      
      // Use aircraft ICAO code from database or fallback to extraction
      const aircraftType = flight.aircraft_icao || extractAircraftICAO(flight.aircraft_name);
      
      console.log('✈️ Aircraft Type determined:', aircraftType);
      
      // Validate aircraft type
      if (!aircraftType || aircraftType.length < 3) {
        alert('Code ICAO de l\'avion invalide. Veuillez vérifier la configuration de votre flotte.');
        setGeneratingBrief(false);
        return;
      }
      
      // Generate timestamp
      const timestamp = Math.round(Date.now() / 1000);
      
      // Calculate output page URL (without http:// or https://)
      const outputPage = window.location.href.split('?')[0];
      const outputPageCalc = outputPage.replace('http://', '').replace('https://', '');

      // Get API code from backend
      const token = localStorage.getItem('token');
      const apiCodeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/simbrief/generate-apicode`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orig: flight.departure_icao,
          dest: flight.arrival_icao,
          type: aircraftType,
          timestamp: timestamp,
          outputpage: outputPageCalc
        })
      });

      if (!apiCodeResponse.ok) {
        throw new Error('Failed to generate API code');
      }

      const { apicode } = await apiCodeResponse.json();

      // Prepare the form for SimBrief API
      const form = document.createElement('form');
      form.id = 'sbapiform';
      form.method = 'get';
      form.action = 'https://www.simbrief.com/ofp/ofp.loader.api.php';
      form.target = 'SBworker';

      // Add required fields matching the demo.php structure
      // Extract airline code and flight number properly
      const airlineCode = flight.flight_number.match(/^([A-Z]{2,3})/)?.[1] || '';
      const flightNum = flight.flight_number.replace(/[^0-9]/g, '') || '';
      
      const fields: { [key: string]: string } = {
        'orig': flight.departure_icao,
        'dest': flight.arrival_icao,
        'type': aircraftType,
        'reg': flight.aircraft_registration || '',
        'airline': airlineCode,  // Code OACI de la compagnie (ex: AFL, AFR)
        'fltnum': flightNum,     // Numéro de vol uniquement
        'units': simbriefConfig.units,   // KGS ou LBS
        'civalue': simbriefConfig.costIndex,  // Cost Index
        'apicode': apicode,
        'timestamp': timestamp.toString(),
        'outputpage': outputPageCalc,
      };

      // Add username if available (from user profile)
      if (userSimbriefUsername) {
        fields['username'] = userSimbriefUsername;
      }

      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);

      // Open SimBrief in a popup
      const popup = window.open('', 'SBworker', 'width=600,height=315');
      
      if (!popup) {
        alert('Veuillez autoriser les popups pour ce site afin de générer des plans de vol');
        setGeneratingBrief(false);
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
        return;
      }

      form.submit();
      
      // Poll for completion
      let attempts = 0;
      const maxAttempts = 120; // 2 minutes max
      
      const checkInterval = setInterval(async () => {
        attempts++;
        
        // Check if popup is closed
        if (popup.closed) {
          clearInterval(checkInterval);
          
          if (document.body.contains(form)) {
            document.body.removeChild(form);
          }
          
          // Attendre la récupération automatique via message postMessage
          // Si après 3 secondes rien n'est reçu, essayer avec username sauvegardé ou demander manuellement
          setTimeout(() => {
            if (!simbriefData) {
              setGeneratingBrief(false);
              
              // D'abord essayer avec le username sauvegardé
              if (userSimbriefUsername) {
                fetchSimbriefData(userSimbriefUsername);
              } else {
                // Sinon demander manuellement
                const username = prompt(
                  'Pour charger automatiquement votre plan de vol,\n' +
                  'entrez votre nom d\'utilisateur SimBrief:'
                );
                
                if (username && username.trim()) {
                  fetchSimbriefData(username.trim());
                }
              }
            }
          }, 3000); // Attendre 3 secondes pour la récupération auto
          
          return;
        }
        
        // Timeout after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setGeneratingBrief(false);
          if (!popup.closed) {
            popup.close();
          }
          if (document.body.contains(form)) {
            document.body.removeChild(form);
          }
          alert('Délai d\'attente dépassé. Veuillez réessayer.');
        }
      }, 1000);

    } catch (error) {
      console.error('Error generating SimBrief plan:', error);
      alert('Échec de la génération du plan de vol. Veuillez réessayer.');
      setGeneratingBrief(false);
    }
  };

  // Helper function to extract aircraft ICAO code
  const extractAircraftICAO = (aircraftName: string): string => {
    if (!aircraftName) {
      console.warn('⚠️ No aircraft name provided, using default B738');
      return 'B738';
    }

    console.log('🔍 Extracting ICAO from:', aircraftName);

    // Common mappings (plus exhaustive)
    const mappings: { [key: string]: string } = {
      'boeing 737-800': 'B738',
      '737-800': 'B738',
      'b737-800': 'B738',
      'b738': 'B738',
      'boeing 737-700': 'B737',
      '737-700': 'B737',
      'b737-700': 'B737',
      'boeing 737-900': 'B739',
      '737-900': 'B739',
      'boeing 737': 'B738',
      '737': 'B738',
      'airbus a320': 'A320',
      'a320': 'A320',
      'airbus a321': 'A321',
      'a321': 'A321',
      'airbus a319': 'A319',
      'a319': 'A319',
      'airbus a318': 'A318',
      'a318': 'A318',
      'boeing 777-300er': 'B77W',
      '777-300er': 'B77W',
      'b777-300er': 'B77W',
      'boeing 777-200': 'B772',
      '777-200': 'B772',
      'boeing 787-9': 'B789',
      '787-9': 'B789',
      'boeing 787-8': 'B788',
      '787-8': 'B788',
      'boeing 747-400': 'B744',
      '747-400': 'B744',
      'boeing 747-8': 'B748',
      '747-8': 'B748',
      'airbus a330-300': 'A333',
      'a330-300': 'A333',
      'airbus a330-200': 'A332',
      'a330-200': 'A332',
      'airbus a350-900': 'A359',
      'a350-900': 'A359',
      'airbus a350-1000': 'A35K',
      'a350-1000': 'A35K',
      'a35k': 'A35K',
      'airbus a380': 'A388',
      'a380': 'A388',
      'boeing 757': 'B752',
      '757': 'B752',
      'boeing 767': 'B763',
      '767': 'B763',
    };

    const lowerName = aircraftName.toLowerCase().trim();
    
    // Check mappings first
    for (const [key, value] of Object.entries(mappings)) {
      if (lowerName.includes(key)) {
        console.log(`✅ Found mapping: "${key}" → ${value}`);
        return value;
      }
    }

    // Try to extract 4-letter ICAO code from name (e.g., "B738", "A320")
    const match = aircraftName.match(/\b([AB]\d{3}[A-Z0-9]?)\b/i);
    if (match) {
      const code = match[1].toUpperCase();
      console.log(`✅ Extracted ICAO code from name: ${code}`);
      return code;
    }

    // Default fallback
    console.warn(`⚠️ Could not determine ICAO for "${aircraftName}", using default B738`);
    return 'B738';
  };

  const saveOFPId = async (ofpId: string) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Sending OFP ID to backend:', ofpId || 'NULL', 'for flight:', flightId); // Debug
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flights/${flightId}/simbrief`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ simbrief_ofp_id: ofpId || null })
      });
      
      if (response.ok) {
        console.log('OFP ID saved successfully!'); // Debug
      } else {
        console.error('Failed to save OFP ID, status:', response.status); // Debug
      }
    } catch (error) {
      console.error('Failed to save OFP ID:', error);
    }
  };

  const startFlight = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flights/${flightId}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Flight started! Please launch your tracker.');
        router.push(`/tracker`);
      }
    } catch (error) {
      console.error('Failed to start flight:', error);
    }
  };

  const cancelReservation = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flights/${flightId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Réservation annulée avec succès.');
        router.push(`/va/${vaId}/pilot/dashboard`);
      } else {
        alert('Erreur lors de l\'annulation de la réservation.');
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      alert('Erreur lors de l\'annulation de la réservation.');
    }
  };

  // Format time - SimBrief returns in seconds
  const formatFlightTime = (seconds: string | number | undefined): string => {
    if (!seconds) return 'N/A';
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
    if (isNaN(totalSeconds)) return 'N/A';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading briefing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Flight Not Found</h2>
          <Link href={`/va/${vaId}/pilot/dashboard`} className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Load SimBrief API JavaScript */}
      <Script
        src="/simbrief.apiv1.js"
        strategy="beforeInteractive"
      />
      
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Flight Briefing</h1>
              <p className="text-2xl text-va-primary font-semibold mt-2">{flight.flight_number}</p>
            </div>
            <Link href={`/va/${vaId}/pilot/dashboard`} className="btn-va-secondary px-6 py-3">
              ← Back to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Flight Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-8 mb-6"
        >
          {/* Route Display */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">Departure</p>
              <div className="bg-va-primary text-white px-8 py-4 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}>
                <p className="text-4xl font-bold tracking-wider">{flight.departure_icao}</p>
              </div>
              <p className="text-slate-600 mt-2 font-medium">{flight.departure_name}</p>
            </div>
            
            <div className="flex items-center">
              <svg className="w-16 h-16 text-va-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">Arrival</p>
              <div className="bg-va-primary text-white px-8 py-4 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}>
                <p className="text-4xl font-bold tracking-wider">{flight.arrival_icao}</p>
              </div>
              <p className="text-slate-600 mt-2 font-medium">{flight.arrival_name}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-center gap-12">
            <div className="text-center">
              <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">Aircraft</p>
              <p className="font-bold text-xl text-slate-900">{flight.aircraft_registration}</p>
              <p className="text-sm text-slate-600 mt-1">{flight.aircraft_name}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">Status</p>
              <span className={`inline-block px-6 py-2 rounded-lg font-semibold text-lg ${
                flight.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                flight.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {flight.status === 'reserved' ? '🔄 Reserved' : flight.status}
              </span>
            </div>
          </div>
        </motion.div>

        {/* SimBrief Section */}
        {!simbriefData ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card p-12 text-center mb-6"
          >
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Generate Flight Plan</h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Create your detailed flight plan using SimBrief. This will generate route, fuel calculations,
              weather information, and all necessary data for your flight.
            </p>
            
            {!showSimbriefForm ? (
              <>
                <button
                  onClick={generateSimbrief}
                  disabled={generatingBrief}
                  className="btn-va-primary text-lg px-8 py-4"
                >
                  {generatingBrief ? 'Opening SimBrief...' : '🚀 Generate with SimBrief'}
                </button>
                <p className="text-sm text-slate-500 mt-4">
                  Configure your SimBrief settings before generation.
                </p>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto text-left bg-slate-50 p-6 rounded-lg"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-4">SimBrief Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Fuel Units
                    </label>
                    <select
                      value={simbriefConfig.units}
                      onChange={(e) => setSimbriefConfig({ ...simbriefConfig, units: e.target.value as 'KGS' | 'LBS' })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-aviation-600 focus:border-transparent"
                    >
                      <option value="KGS">Kilogrammes (KGS)</option>
                      <option value="LBS">Livres (LBS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Cost Index (Optional)
                    </label>
                    <input
                      type="number"
                      value={simbriefConfig.costIndex}
                      onChange={(e) => setSimbriefConfig({ ...simbriefConfig, costIndex: e.target.value })}
                      placeholder="e.g., 50"
                      min="0"
                      max="999"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-aviation-600 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty for default aircraft value
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={submitSimbriefGeneration}
                    disabled={generatingBrief}
                    className="btn-va-primary flex-1"
                  >
                    {generatingBrief ? 'Generating...' : '✈️ Generate'}
                  </button>
                  <button
                    onClick={() => setShowSimbriefForm(false)}
                    disabled={generatingBrief}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <>
            {/* SimBrief Data Tabs */}
            <div className="mb-6 border-b border-slate-200">
              <div className="flex space-x-8 overflow-x-auto">
                {['overview', 'weather', 'fuel', 'weights'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-4 px-2 font-semibold transition-colors capitalize whitespace-nowrap ${
                      activeTab === tab
                        ? 'text-va-primary border-b-2 border-va-primary'
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="card p-6">
                    <p className="text-sm text-slate-600 mb-2">Great Circle Distance</p>
                    <p className="text-2xl font-bold text-slate-900">{simbriefData?.general?.gc_distance || 'N/A'} NM</p>
                  </div>
                  <div className="card p-6">
                    <p className="text-sm text-slate-600 mb-2">Route Distance</p>
                    <p className="text-2xl font-bold text-slate-900">{simbriefData?.general?.route_distance || 'N/A'} NM</p>
                  </div>
                  <div className="card p-6">
                    <p className="text-sm text-slate-600 mb-2">Flight Time</p>
                    <p className="text-2xl font-bold text-va-primary">
                      {formatFlightTime(simbriefData?.times?.est_time_enroute)}
                    </p>
                  </div>
                  <div className="card p-6">
                    <p className="text-sm text-slate-600 mb-2">Cruise Altitude</p>
                    <p className="text-2xl font-bold text-slate-900">
                      FL{Math.floor((simbriefData?.general?.initial_altitude || 0) / 100)}
                    </p>
                  </div>
                  <div className="card p-6">
                    <p className="text-sm text-slate-600 mb-2">Average Wind</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {simbriefData?.general?.avg_wind_dir || 'N/A'}° / {simbriefData?.general?.avg_wind_spd || 'N/A'} kt
                    </p>
                  </div>
                  <div className="card p-6">
                    <p className="text-sm text-slate-600 mb-2">Cost Index</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {simbriefData?.general?.costindex || simbriefConfig.costIndex || 'N/A'}
                    </p>
                  </div>
                  <div className="card p-6">
                    <p className="text-sm text-slate-600 mb-2">Units</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {simbriefData?.params?.units || fuelUnits}
                    </p>
                  </div>
                  <div className="card p-6">
                    <p className="text-sm text-slate-600 mb-2">👥 Passengers</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {simbriefData?.weights?.pax_count || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Flight Map Interactive */}
                {simbriefData?.origin && simbriefData?.destination && (
                  <div className="card p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Flight Map & Route</h3>
                    <DynamicFlightMap
                      origin={simbriefData.origin}
                      destination={simbriefData.destination}
                      waypoints={simbriefData?.navlog?.fix || []}
                      route={simbriefData?.general?.route || simbriefData?.route}
                    />
                    
                    {/* Alternate Airport */}
                    {simbriefData?.alternate && (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="font-semibold text-amber-900 mb-1">✈️ Alternate Airport</h4>
                        <p className="text-lg text-amber-800">
                          <span className="font-bold">{simbriefData.alternate.icao_code}</span>
                          {' - '}{simbriefData.alternate.name}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'weather' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="card p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {simbriefData?.origin?.icao_code || 'N/A'} METAR
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm">
                    {simbriefData?.weather?.orig_metar || 'No METAR available'}
                  </div>
                </div>
                <div className="card p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {simbriefData?.destination?.icao_code || 'N/A'} METAR
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm">
                    {simbriefData?.weather?.dest_metar || 'No METAR available'}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'fuel' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 gap-4"
              >
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Ramp Fuel</p>
                  <p className="text-3xl font-bold text-slate-900">{simbriefData?.fuel?.plan_ramp || 'N/A'} {simbriefData?.params?.units || fuelUnits}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Takeoff Fuel</p>
                  <p className="text-3xl font-bold text-slate-900">{simbriefData?.fuel?.plan_takeoff || 'N/A'} {simbriefData?.params?.units || fuelUnits}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Landing Fuel</p>
                  <p className="text-3xl font-bold text-slate-900">{simbriefData?.fuel?.plan_landing || 'N/A'} {simbriefData?.params?.units || fuelUnits}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Reserve Fuel</p>
                  <p className="text-3xl font-bold text-aviation-600">{simbriefData?.fuel?.reserve || 'N/A'} {simbriefData?.params?.units || fuelUnits}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Contingency</p>
                  <p className="text-3xl font-bold text-slate-900">{simbriefData?.fuel?.contingency || 'N/A'} {simbriefData?.params?.units || fuelUnits}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Avg Fuel Flow</p>
                  <p className="text-3xl font-bold text-slate-900">{simbriefData?.fuel?.avg_fuel_flow || 'N/A'} {simbriefData?.params?.units || fuelUnits}/hr</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'weights' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Est. Zero Fuel Weight</p>
                  <p className="text-3xl font-bold text-slate-900">{simbriefData?.weights?.est_zfw || 'N/A'} {simbriefData?.params?.units || fuelUnits}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Est. Takeoff Weight</p>
                  <p className="text-3xl font-bold text-slate-900">{simbriefData?.weights?.est_tow || 'N/A'} {simbriefData?.params?.units || fuelUnits}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Est. Landing Weight</p>
                  <p className="text-3xl font-bold text-slate-900">{simbriefData?.weights?.est_ldw || 'N/A'} {simbriefData?.params?.units || fuelUnits}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Max Takeoff Weight</p>
                  <p className="text-3xl font-bold text-aviation-600">{simbriefData?.weights?.max_tow || 'N/A'} {simbriefData?.params?.units || fuelUnits}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Max Landing Weight</p>
                  <p className="text-3xl font-bold text-aviation-600">{simbriefData.weights.max_ldw} lbs</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">📦 Cargo Weight</p>
                  <p className="text-3xl font-bold text-slate-900">{simbriefData?.weights?.cargo || 'N/A'} {simbriefData?.params?.units || fuelUnits}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-slate-600 mb-2">Payload</p>
                  <p className="text-3xl font-bold text-slate-900">{simbriefData?.weights?.payload || 'N/A'} {simbriefData?.params?.units || fuelUnits}</p>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* VATSIM & IVAO Prefile Buttons */}
        {simbriefData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card p-6 mt-6"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4">🌐 Online Network Filing</h2>
            <p className="text-slate-600 mb-4">
              Pre-file your flight plan with VATSIM or IVAO directly from SimBrief with all data auto-filled.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {/* VATSIM Prefile */}
              <a
                href={simbriefData?.prefile?.vatsim?.link || `https://my.vatsim.net/pilots/flightplan?${(() => {
                  // Get current UTC time as default for off-block
                  const now = new Date();
                  const currentUTC = now.getUTCHours().toString().padStart(2, '0') + 
                                    now.getUTCMinutes().toString().padStart(2, '0');
                  
                  // Aircraft Type - code ICAO (A343, B738, etc.)
                  const aircraftType = simbriefData?.aircraft?.icaocode || '';
                  console.log('🛩️ Aircraft ICAO:', aircraftType);
                  console.log('📊 Aircraft full data:', simbriefData?.aircraft);
                  
                  // Off Block Time
                  const schedOut = simbriefData?.times?.sched_out || simbriefData?.times?.est_out || '';
                  console.log('🕐 Sched out raw:', schedOut);
                  console.log('📊 Times full data:', simbriefData?.times);
                  
                  let offBlockTime = currentUTC; // Default to current UTC
                  if (schedOut) {
                    const outTime = new Date(parseInt(schedOut) * 1000);
                    offBlockTime = outTime.getUTCHours().toString().padStart(2, '0') + 
                                  outTime.getUTCMinutes().toString().padStart(2, '0');
                  }
                  console.log('🕐 Off Block Time (HHMM):', offBlockTime);
                  
                  // Wake Category - VATSIM mapping
                  const wakeRaw = simbriefData?.aircraft?.wake || 'M';
                  let wakeVatsim = 'M'; // Default Medium
                  if (wakeRaw === 'L') wakeVatsim = 'L'; // Light (MTOW <= 7,000 kg)
                  else if (wakeRaw === 'M') wakeVatsim = 'M'; // Medium (MTOW <= 136,000 kg)
                  else if (wakeRaw === 'H') wakeVatsim = 'H'; // Heavy
                  else if (wakeRaw === 'J' || wakeRaw === 'S') wakeVatsim = 'J'; // Super (A388)
                  console.log('💨 Wake Category raw:', wakeRaw, '→ VATSIM:', wakeVatsim);
                  
                  // Equipment (ICAO/FAA format) - Full string
                  const equipmentFull = simbriefData?.aircraft?.equip || 'SDE2E3FGHIJ3J5M1RWXYZ/LB1';
                  console.log('� Equipment:', equipmentFull);
                  
                  // Off Block UTC - Use scheduled departure time
                  const schedDep = simbriefData?.times?.sched_dep || simbriefData?.times?.est_out || '';
                  let depTimeUTC = offBlockTime; // Default to current
                  if (schedDep) {
                    const depTime = new Date(parseInt(schedDep) * 1000);
                    depTimeUTC = depTime.getUTCHours().toString().padStart(2, '0') + 
                                depTime.getUTCMinutes().toString().padStart(2, '0');
                  }
                  console.log('🕐 Departure Time UTC:', depTimeUTC, 'from timestamp:', schedDep);
                  
                  // Enroute Time (HHMM)
                  const enrouteTime = parseInt(simbriefData?.times?.est_time_enroute || '0');
                  const enrouteHours = Math.floor(enrouteTime / 3600);
                  const enrouteMinutes = Math.floor((enrouteTime % 3600) / 60);
                  const enrouteHHMM = enrouteHours.toString().padStart(2, '0') + 
                                     enrouteMinutes.toString().padStart(2, '0');
                  console.log('⏱️ Enroute Time:', enrouteHHMM, `(${enrouteHours}h${enrouteMinutes}m)`);
                  
                  // Fuel Endurance (HHMM)
                  const endurance = parseInt(simbriefData?.times?.endurance || '0');
                  const enduranceHours = Math.floor(endurance / 3600);
                  const enduranceMinutes = Math.floor((endurance % 3600) / 60);
                  const enduranceHHMM = enduranceHours.toString().padStart(2, '0') + 
                                       enduranceMinutes.toString().padStart(2, '0');
                  console.log('⛽ Fuel Endurance:', enduranceHHMM, `(${enduranceHours}h${enduranceMinutes}m)`);
                  
                  // Build URL with correct VATSIM parameter names
                  const vatsimUrl = `https://my.vatsim.net/pilots/flightplan?` +
                    `callsign=${encodeURIComponent(simbriefData?.atc?.callsign || '')}` +
                    `&aircraft=${encodeURIComponent(aircraftType)}` + // Type d'avion ICAO
                    `&wake=${encodeURIComponent(wakeVatsim)}` + // Wake Category (L/M/H/J)
                    `&equipment=${encodeURIComponent(equipmentFull)}` + // Equipment complet (ICAO/FAA)
                    `&transponder=${encodeURIComponent(simbriefData?.aircraft?.transponder || 'LB1')}` +
                    `&departure=${encodeURIComponent(simbriefData?.origin?.icao_code || '')}` +
                    `&arrival=${encodeURIComponent(simbriefData?.destination?.icao_code || '')}` +
                    `&alternate=${encodeURIComponent(simbriefData?.alternate?.icao_code || '')}` +
                    `&altitude=${encodeURIComponent(simbriefData?.general?.initial_altitude || '')}` +
                    `&speed=${encodeURIComponent(simbriefData?.general?.cruise_tas || '')}` + // Airspeed (knots)
                    `&dep_time=${encodeURIComponent(depTimeUTC)}` + // Off Block UTC (HHMM)
                    `&enroute_time=${encodeURIComponent(enrouteHHMM)}` + // Enroute Time (HHMM)
                    `&fuel_time=${encodeURIComponent(enduranceHHMM)}` + // Fuel Endurance (HHMM)
                    `&flight_rules=${encodeURIComponent(simbriefData?.params?.flight_rules || 'I')}` +
                    `&route=${encodeURIComponent(simbriefData?.general?.route || '')}` +
                    `&remarks=${encodeURIComponent(`SIMBRIEF ${simbriefData?.params?.request_id || ''} /V/`)}`;
                  
                  console.log('📋 VATSIM URL:', vatsimUrl);
                  return vatsimUrl.split('?')[1]; // Return just the query string
                })()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative p-6 flex items-center gap-4">
                  <img src="/img/Logo_VATSIM.png" alt="VATSIM" className="w-16 h-16 object-contain bg-white rounded-lg p-2" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">VATSIM</h3>
                    <p className="text-sm text-blue-100">Pre-file on VATSIM Network</p>
                  </div>
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </a>

              {/* IVAO Prefile */}
              <a
                href={simbriefData?.prefile?.ivao?.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative p-6 flex items-center gap-4">
                  <img src="/img/Logo_IVAO.png" alt="IVAO" className="w-16 h-16 object-contain bg-white rounded-lg p-2" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">IVAO</h3>
                    <p className="text-sm text-red-100">Pre-file on IVAO Network</p>
                  </div>
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              💡 <strong>Tip:</strong> These links will auto-fill your flight plan details on the respective network platforms.
            </p>
          </motion.div>
        )}

        {/* Tracker Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-8 mt-6"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">📡 Next Steps</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-va-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Download Flight Tracker</h3>
                <p className="text-slate-600">
                  If you haven't already, download and install the FlyNova flight tracker from the{' '}
                  <Link href="/downloads" className="text-va-primary hover:underline font-semibold">
                    Downloads
                  </Link>{' '}
                  page.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-va-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Launch Your Simulator</h3>
                <p className="text-slate-600">
                  Start your flight simulator (MSFS, X-Plane, P3D, etc.) and load the aircraft at {flight.departure_icao}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-va-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Start the Tracker</h3>
                <p className="text-slate-600">
                  Launch the FlyNova tracker and log in with your credentials. The tracker will automatically detect your flight.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-va-secondary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Fly & Enjoy!</h3>
                <p className="text-slate-600">
                  Follow your flight plan and enjoy your flight. The tracker will automatically submit your PIREP when you land.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={startFlight}
              className="btn-va-primary flex-1"
            >
              ✈️ Mark Flight as Started
            </button>
            <Link
              href="/tracker"
              className="btn-va-secondary flex-1 text-center flex items-center justify-center"
            >
              📡 Go to Tracker Page
            </Link>
            <button
              onClick={cancelReservation}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              ❌ Cancel Reservation
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
