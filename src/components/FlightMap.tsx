'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Waypoint {
  ident: string;
  name?: string;
  pos_lat: string;
  pos_long: string;
  type?: string;
}

interface FlightMapProps {
  origin: { icao_code: string; pos_lat: string; pos_long: string };
  destination: { icao_code: string; pos_lat: string; pos_long: string };
  waypoints?: Waypoint[];
  route?: string;
}

// Composant pour ajuster la vue de la carte (seulement au montage initial)
function MapBounds({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (bounds && !hasInitialized) {
      map.fitBounds(bounds, { padding: [50, 50] });
      setHasInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécuter seulement au montage
  
  return null;
}

// Composant pour gérer l'affichage des labels selon le zoom
function WaypointMarker({ waypoint, icon, showLabel }: { waypoint: Waypoint; icon: L.DivIcon; showLabel: boolean }) {
  const lat = parseFloat(waypoint.pos_lat);
  const lng = parseFloat(waypoint.pos_long);
  
  if (isNaN(lat) || isNaN(lng)) return null;

  return (
    <Marker position={[lat, lng]} icon={icon}>
      {showLabel && (
        <Tooltip 
          permanent 
          direction="top" 
          offset={[0, -5]}
          className="waypoint-label"
        >
          <span className="text-xs font-semibold text-slate-900">{waypoint.ident}</span>
        </Tooltip>
      )}
      <Popup>
        <div className="text-center">
          <strong className="text-blue-600 text-base">{waypoint.ident}</strong>
          {waypoint.name && <p className="text-xs text-slate-600">{waypoint.name}</p>}
          {waypoint.type && <p className="text-xs text-slate-500">{waypoint.type}</p>}
          <p className="text-xs text-slate-400 mt-1">{lat.toFixed(4)}°, {lng.toFixed(4)}°</p>
        </div>
      </Popup>
    </Marker>
  );
}

// Composant pour gérer le zoom et l'affichage conditionnel
function ZoomHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };
    
    map.on('zoomend', handleZoom);
    handleZoom(); // Initial call
    
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);
  
  return null;
}

export default function FlightMap({ origin, destination, waypoints, route }: FlightMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(4);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
        <p className="text-slate-600">Loading map...</p>
      </div>
    );
  }

  // Convertir les coordonnées en nombres
  const originLat = parseFloat(origin.pos_lat);
  const originLng = parseFloat(origin.pos_long);
  const destLat = parseFloat(destination.pos_lat);
  const destLng = parseFloat(destination.pos_long);

  // Afficher les labels seulement à partir du zoom 6
  const showWaypointLabels = currentZoom >= 6;

  // Créer les markers personnalisés
  const createSquareIcon = (color: string, size: number = 8) => {
    return new L.DivIcon({
      className: 'custom-square-marker',
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.5);
        transform: translate(-50%, -50%);
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const originIcon = createSquareIcon('#10b981', 12); // Vert
  const destIcon = createSquareIcon('#ef4444', 12);   // Rouge
  const waypointIcon = createSquareIcon('#3b82f6', 6); // Bleu petit

  // Construire le chemin de la route
  const routePath: [number, number][] = [[originLat, originLng]];

  if (waypoints && waypoints.length > 0) {
    waypoints.forEach(wp => {
      const lat = parseFloat(wp.pos_lat);
      const lng = parseFloat(wp.pos_long);
      if (!isNaN(lat) && !isNaN(lng)) {
        routePath.push([lat, lng]);
      }
    });
  }

  routePath.push([destLat, destLng]);

  // Calculer les limites pour centrer la carte
  const bounds = L.latLngBounds(routePath);

  return (
    <div className="w-full space-y-4">
      {/* Map Legend */}
      <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-300 font-medium">Departure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-300 font-medium">Arrival</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-slate-300 font-medium">Waypoint</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-cyan-400" style={{ opacity: 0.85 }}></div>
          <span className="text-xs text-slate-300 font-medium">Flight Path</span>
        </div>
      </div>
      
      {/* Interactive Map */}
      <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl">
        <MapContainer
          center={[(originLat + destLat) / 2, (originLng + destLng) / 2]}
          zoom={4}
          style={{ height: '100%', width: '100%', background: '#1a1d29' }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          {/* Dark tile layer for aviation style */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <MapBounds bounds={bounds} />
          <ZoomHandler onZoomChange={setCurrentZoom} />

          {/* Marker origine */}
          <Marker position={[originLat, originLng]} icon={originIcon}>
            <Tooltip permanent direction="top" offset={[0, -8]}>
              <span className="text-xs font-bold text-slate-900">{origin.icao_code}</span>
            </Tooltip>
            <Popup>
              <div className="text-center">
                <strong className="text-green-600 text-lg">{origin.icao_code}</strong>
                <p className="text-xs font-semibold text-slate-600">DEPARTURE</p>
                <p className="text-xs text-slate-500">{originLat.toFixed(4)}°, {originLng.toFixed(4)}°</p>
              </div>
            </Popup>
          </Marker>

          {/* Marker destination */}
          <Marker position={[destLat, destLng]} icon={destIcon}>
            <Tooltip permanent direction="top" offset={[0, -8]}>
              <span className="text-xs font-bold text-slate-900">{destination.icao_code}</span>
            </Tooltip>
            <Popup>
              <div className="text-center">
                <strong className="text-red-600 text-lg">{destination.icao_code}</strong>
                <p className="text-xs font-semibold text-slate-600">ARRIVAL</p>
                <p className="text-xs text-slate-500">{destLat.toFixed(4)}°, {destLng.toFixed(4)}°</p>
              </div>
            </Popup>
          </Marker>

          {/* Waypoints avec labels conditionnels */}
          {waypoints && waypoints.map((wp, index) => (
            <WaypointMarker 
              key={index} 
              waypoint={wp} 
              icon={waypointIcon} 
              showLabel={showWaypointLabels}
            />
          ))}

        {/* Ligne de route - style aviation */}
        <Polyline 
          positions={routePath} 
          color="#00d4ff" 
          weight={4}
          opacity={0.85}
          dashArray="8, 12"
        />
        
        {/* Ligne de route secondaire pour effet 3D */}
        <Polyline 
          positions={routePath} 
          color="#0099cc" 
          weight={2}
          opacity={0.6}
        />
      </MapContainer>
      </div>

      {/* Route text overlay with dark theme */}
      {route && (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Flight Route</span>
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-xs text-slate-500">{waypoints?.length || 0} waypoints</span>
          </div>
          <p className="text-sm font-mono text-slate-200 break-all leading-relaxed tracking-wide">
            {route}
          </p>
        </div>
      )}
    </div>
  );
}
