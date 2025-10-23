/**
 * SimBrief Integration Utility
 * Helper functions for SimBrief API integration
 */

export interface SimbriefFlight {
  origin: string;
  destination: string;
  aircraft_type: string;
  registration: string;
  flight_number: string;
}

export interface SimbriefData {
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

const SIMBRIEF_API_KEY = '7visKd8EEiXJGFc0Jsp8LSu2Ck5L7WQw';

/**
 * Generate a flight plan using SimBrief API
 * Opens a popup window for the user to complete the SimBrief dispatch
 */
export const generateSimbriefPlan = (flight: SimbriefFlight): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    try {
      // Create form for SimBrief API
      const form = document.createElement('form');
      form.id = 'sbapiform';
      form.method = 'get';
      form.action = 'https://www.simbrief.com/ofp/ofp.loader.api.php';
      form.target = 'SBworker';

      // Add required fields
      const fields = {
        'orig': flight.origin,
        'dest': flight.destination,
        'type': flight.aircraft_type,
        'reg': flight.registration,
        'callsign': flight.flight_number,
        'airline': '',
        'fltnum': flight.flight_number.replace(/[^0-9]/g, ''),
        'apicode': SIMBRIEF_API_KEY,
      };

      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);

      // Open SimBrief in a popup
      const popup = window.open('', 'SBworker', 'width=600,height=400');
      
      if (!popup) {
        document.body.removeChild(form);
        reject(new Error('Please allow popups for this site to generate flight plans'));
        return;
      }

      form.submit();

      // Poll for completion
      const checkInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkInterval);
          document.body.removeChild(form);
          
          // Prompt user to enter OFP ID
          const ofpId = prompt(
            'Please enter your SimBrief OFP ID:\n\n' +
            'You can find this in the URL of your SimBrief flight plan or in your SimBrief account.\n' +
            'Example: 1234567890'
          );
          
          resolve(ofpId);
        }
      }, 1000);

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Fetch SimBrief flight plan data by OFP ID
 */
export const fetchSimbriefData = async (ofpId: string): Promise<SimbriefData> => {
  const response = await fetch(
    `https://www.simbrief.com/api/xml.fetcher.php?ofp_id=${ofpId}&json=1`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch SimBrief data');
  }

  const data = await response.json();
  return data;
};

/**
 * Get the URL for the SimBrief flight map
 */
export const getSimbriefMapUrl = (directory: string): string => {
  return `https://www.simbrief.com/ofp/flightplans/${directory}/map.png`;
};

/**
 * Get the URL to view the full OFP on SimBrief website
 */
export const getSimbriefOFPUrl = (ofpId: string): string => {
  return `https://www.simbrief.com/ofp/flightplans/briefing${ofpId}.html`;
};

/**
 * Download PDF version of the flight plan
 */
export const downloadSimbriefPDF = (directory: string, filename: string = 'flightplan.pdf') => {
  const url = `https://www.simbrief.com/ofp/flightplans/${directory}/pdf/${filename}`;
  window.open(url, '_blank');
};

/**
 * Format flight time from minutes to HH:MM format
 */
export const formatFlightTime = (timeString: string): string => {
  if (!timeString) return '00:00';
  
  // If already in HH:MM format, return as is
  if (timeString.includes(':')) return timeString;
  
  // If in minutes, convert
  const totalMinutes = parseInt(timeString);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Parse METAR data for better display
 */
export const parseMetar = (metar: string): {
  airport: string;
  time: string;
  wind: string;
  visibility: string;
  weather: string;
  clouds: string;
  temperature: string;
  dewpoint: string;
  qnh: string;
} => {
  // This is a simplified parser - you might want to use a proper METAR parsing library
  const parts = metar.split(' ');
  
  return {
    airport: parts[0] || '',
    time: parts[1] || '',
    wind: parts[2] || '',
    visibility: parts[3] || '',
    weather: parts.slice(4, -3).join(' ') || '',
    clouds: '',
    temperature: '',
    dewpoint: '',
    qnh: parts[parts.length - 1] || ''
  };
};

/**
 * Calculate fuel remaining percentage
 */
export const calculateFuelRemaining = (current: number, total: number): number => {
  return (current / total) * 100;
};

/**
 * Validate SimBrief OFP ID format
 */
export const isValidOFPId = (ofpId: string): boolean => {
  // OFP IDs are typically numeric and between 8-12 digits
  return /^\d{8,12}$/.test(ofpId);
};

/**
 * Get SimBrief redirect URL with pre-filled data
 * Useful for directing users to SimBrief with flight data already filled
 */
export const getSimbriefRedirectUrl = (flight: SimbriefFlight): string => {
  const params = new URLSearchParams({
    orig: flight.origin,
    dest: flight.destination,
    type: flight.aircraft_type,
    reg: flight.registration,
    callsign: flight.flight_number,
    airline: '',
    fltnum: flight.flight_number.replace(/[^0-9]/g, ''),
  });

  return `https://www.simbrief.com/system/dispatch.php?${params.toString()}`;
};

export default {
  generateSimbriefPlan,
  fetchSimbriefData,
  getSimbriefMapUrl,
  getSimbriefOFPUrl,
  downloadSimbriefPDF,
  formatFlightTime,
  parseMetar,
  calculateFuelRemaining,
  isValidOFPId,
  getSimbriefRedirectUrl,
};
