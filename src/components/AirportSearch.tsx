'use client';

import { useState, useEffect, useRef } from 'react';

interface Airport {
  id: number;
  name: string;
  city: string;
  country: string;
  iata_code?: string;
  icao_code: string;
}

interface AirportSearchProps {
  value: string;
  onChange: (icao: string, airport: Airport) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function AirportSearch({ value, onChange, placeholder, label, required }: AirportSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
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

  // Load selected airport if value is provided
  useEffect(() => {
    if (value && !selectedAirport) {
      fetchAirportByICAO(value);
    }
  }, [value]);

  const fetchAirportByICAO = async (icao: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/airports/icao/${icao}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedAirport(data.airport);
        setSearchTerm(formatAirportDisplay(data.airport));
      }
    } catch (err) {
      console.error('Failed to fetch airport:', err);
    }
  };

  const searchAirports = async (term: string) => {
    if (term.length < 2) {
      setAirports([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/airports/search?q=${encodeURIComponent(term)}`);
      const data = await response.json();
      setAirports(data.airports || []);
      setShowResults(true);
    } catch (err) {
      console.error('Failed to search airports:', err);
      setAirports([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAirportDisplay = (airport: Airport) => {
    return `${airport.icao_code}${airport.iata_code ? ` / ${airport.iata_code}` : ''} - ${airport.name}, ${airport.city}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSelectedAirport(null);
    searchAirports(term);
  };

  const handleSelectAirport = (airport: Airport) => {
    setSelectedAirport(airport);
    setSearchTerm(formatAirportDisplay(airport));
    setShowResults(false);
    onChange(airport.icao_code, airport);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedAirport(null);
    setAirports([]);
    setShowResults(false);
    onChange('', {} as Airport);
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
          onFocus={() => airports.length > 0 && setShowResults(true)}
          placeholder={placeholder || "Rechercher un aéroport (ICAO, nom, ville)..."}
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

      {showResults && airports.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {airports.map((airport) => (
            <button
              key={airport.id}
              type="button"
              onClick={() => handleSelectAirport(airport)}
              className="w-full px-4 py-3 text-left hover:bg-aviation-50 border-b border-slate-100 last:border-b-0 transition-colors"
            >
              <div className="font-semibold text-aviation-600">
                {airport.icao_code}
                {airport.iata_code && <span className="text-slate-500"> / {airport.iata_code}</span>}
              </div>
              <div className="text-sm text-slate-600">
                {airport.name}
              </div>
              <div className="text-xs text-slate-500">
                {airport.city}, {airport.country}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && searchTerm.length >= 2 && airports.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-300 rounded-lg shadow-xl p-4 text-center text-slate-600">
          Aucun aéroport trouvé
        </div>
      )}
    </div>
  );
}
