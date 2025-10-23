'use client';

import { useState, useEffect, useRef } from 'react';

interface Aircraft {
  id: number;
  name: string;
  iata_code?: string;
  icao_code?: string;
}

interface AircraftSearchProps {
  value: string;
  onChange: (aircraftCode: string, aircraft: Aircraft) => void; // First param is ICAO/IATA code, not name
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function AircraftSearch({ value, onChange, placeholder, label, required }: AircraftSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set initial value if provided
  useEffect(() => {
    if (value && !selectedAircraft) {
      setSearchTerm(value);
    }
  }, [value]);

  const searchAircraft = async (term: string) => {
    if (term.length < 2) {
      setAircraft([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/aircraft/search?q=${encodeURIComponent(term)}`);
      const data = await response.json();
      setAircraft(data.aircraft || []);
      setShowResults(true);
    } catch (err) {
      console.error('Failed to search aircraft:', err);
      setAircraft([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAircraftDisplay = (aircraft: Aircraft) => {
    const codes = [];
    if (aircraft.icao_code) codes.push(aircraft.icao_code);
    if (aircraft.iata_code) codes.push(aircraft.iata_code);
    return codes.length > 0 ? `${codes.join(' / ')} - ${aircraft.name}` : aircraft.name;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSelectedAircraft(null);
    searchAircraft(term);
  };

  const handleSelectAircraft = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft);
    setSearchTerm(formatAircraftDisplay(aircraft));
    setShowResults(false);
    // Pass ICAO code as first parameter (falls back to IATA or empty string)
    const aircraftCode = aircraft.icao_code || aircraft.iata_code || '';
    onChange(aircraftCode, aircraft);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedAircraft(null);
    setAircraft([]);
    setShowResults(false);
    onChange('', {} as Aircraft);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => aircraft.length > 0 && setShowResults(true)}
          placeholder={placeholder || "Search aircraft (ICAO, IATA, name)..."}
          required={required}
          className="w-full px-4 py-3 pr-10 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-aviation-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showResults && aircraft.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {aircraft.map((ac) => (
            <button
              key={ac.id}
              type="button"
              onClick={() => handleSelectAircraft(ac)}
              className="w-full px-4 py-3 text-left hover:bg-aviation-50 border-b border-slate-100 last:border-b-0 transition-colors"
            >
              <div className="font-semibold text-aviation-600">
                {ac.icao_code && <span>{ac.icao_code}</span>}
                {ac.icao_code && ac.iata_code && <span className="text-slate-500"> / </span>}
                {ac.iata_code && <span className="text-slate-500">{ac.iata_code}</span>}
              </div>
              <div className="text-sm text-slate-600">
                {ac.name}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && searchTerm.length >= 2 && aircraft.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-300 rounded-lg shadow-xl p-4 text-center text-slate-600">
          No aircraft found
        </div>
      )}
    </div>
  );
}
