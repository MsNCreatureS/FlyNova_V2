# FlyNova Tracker Integration Guide

This document describes how to build a flight tracker application that integrates with FlyNova.

## Overview

The flight tracker is a desktop application that:
1. Monitors flight simulator data (position, altitude, speed, etc.)
2. Detects takeoff and landing events
3. Sends flight telemetry to FlyNova API
4. Validates flight completion

## Architecture

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────┐
│ Flight Simulator│────────▶│    Tracker   │────────▶│   FlyNova   │
│   (MSFS/X-Plane)│         │  Application │         │     API     │
└─────────────────┘         └──────────────┘         └─────────────┘
        ▲                           │
        │                           │
        └───────────────────────────┘
            SimConnect/X-Plane SDK
```

## Tracker Workflow

### 1. User Starts Tracker
```
- User logs in with FlyNova credentials
- Tracker retrieves reserved flights via API
- User selects a flight to track
```

### 2. Pre-Flight
```
- Tracker connects to flight simulator
- Monitors aircraft position
- Waits for takeoff detection
```

### 3. Flight Starts
```
- Detect takeoff (altitude > 50 ft AGL)
- Call API: POST /api/flights/:flightId/start
- Begin recording telemetry
```

### 4. During Flight
```
- Record every 10 seconds:
  - Position (lat/lon)
  - Altitude
  - Speed
  - Heading
  - Fuel
  - VS (vertical speed)
```

### 5. Flight Ends
```
- Detect landing (on ground for 30s)
- Calculate landing rate
- Compile telemetry data
- Call API: POST /api/flights/:flightId/report
```

## API Integration

### Authentication

```javascript
// Login and get token
const response = await fetch('https://flynova.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'pilot@example.com',
    password: 'password123'
  })
});

const { token } = await response.json();
// Store token for subsequent requests
```

### Get Reserved Flights

```javascript
const response = await fetch('https://flynova.com/api/flights/my-flights', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { flights } = await response.json();
const reservedFlights = flights.filter(f => f.status === 'reserved');
```

### Start Flight

```javascript
await fetch(`https://flynova.com/api/flights/${flightId}/start`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Submit Flight Report

```javascript
const report = {
  actualDepartureTime: '2025-10-22T14:05:00Z',
  actualArrivalTime: '2025-10-22T19:28:00Z',
  flightDuration: 323, // minutes
  distanceFlown: 2470.5, // nautical miles
  fuelUsed: 8500, // lbs or kg
  landingRate: -125, // fpm
  telemetryData: {
    maxAltitude: 35000,
    maxSpeed: 450,
    route: [
      { lat: 33.9425, lon: -118.4081, alt: 0, timestamp: '...' },
      { lat: 34.0, lon: -118.0, alt: 5000, timestamp: '...' },
      // ... more points
    ],
    events: [
      { type: 'takeoff', timestamp: '...' },
      { type: 'landing', timestamp: '...' }
    ]
  }
};

await fetch(`https://flynova.com/api/flights/${flightId}/report`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(report)
});
```

## SimConnect Integration (MSFS)

### C# Example

```csharp
using Microsoft.FlightSimulator.SimConnect;

public class FlightTracker
{
    private SimConnect simConnect;
    
    public void Connect()
    {
        simConnect = new SimConnect("FlyNova Tracker", IntPtr.Zero, 0, null, 0);
        
        // Define data structure
        simConnect.AddToDataDefinition(
            DEFINITIONS.FlightData,
            "PLANE LATITUDE",
            "degrees",
            SIMCONNECT_DATATYPE.FLOAT64,
            0.0f,
            SimConnect.SIMCONNECT_UNUSED
        );
        
        simConnect.AddToDataDefinition(
            DEFINITIONS.FlightData,
            "PLANE LONGITUDE",
            "degrees",
            SIMCONNECT_DATATYPE.FLOAT64,
            0.0f,
            SimConnect.SIMCONNECT_UNUSED
        );
        
        simConnect.AddToDataDefinition(
            DEFINITIONS.FlightData,
            "PLANE ALTITUDE",
            "feet",
            SIMCONNECT_DATATYPE.FLOAT64,
            0.0f,
            SimConnect.SIMCONNECT_UNUSED
        );
        
        // Register data structure
        simConnect.RegisterDataDefineStruct<FlightData>(DEFINITIONS.FlightData);
        
        // Request data every second
        simConnect.RequestDataOnSimObject(
            DATA_REQUESTS.FlightData,
            DEFINITIONS.FlightData,
            SimConnect.SIMCONNECT_OBJECT_ID_USER,
            SIMCONNECT_PERIOD.SECOND,
            SIMCONNECT_DATA_REQUEST_FLAG.DEFAULT,
            0, 0, 0
        );
    }
    
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi, Pack = 1)]
    struct FlightData
    {
        public double latitude;
        public double longitude;
        public double altitude;
    }
}
```

### Python Example

```python
from SimConnect import SimConnect

class FlightTracker:
    def __init__(self):
        self.sm = SimConnect()
        self.aq = AircraftRequests(self.sm)
        
    def get_telemetry(self):
        return {
            'latitude': self.aq.get('PLANE_LATITUDE'),
            'longitude': self.aq.get('PLANE_LONGITUDE'),
            'altitude': self.aq.get('PLANE_ALTITUDE'),
            'speed': self.aq.get('AIRSPEED_INDICATED'),
            'heading': self.aq.get('PLANE_HEADING_DEGREES_TRUE'),
            'vs': self.aq.get('VERTICAL_SPEED')
        }
```

## X-Plane Integration

### Using X-Plane Connect (XPC)

```python
import xpc

class XPlaneTracker:
    def __init__(self):
        self.client = xpc.XPlaneConnect()
        
    def get_telemetry(self):
        posi = self.client.getPOSI()
        return {
            'latitude': posi[0],
            'longitude': posi[1],
            'altitude': posi[2],
            'pitch': posi[3],
            'roll': posi[4],
            'heading': posi[5],
            'speed': posi[6]
        }
```

## Takeoff Detection

```javascript
class TakeoffDetector {
  constructor() {
    this.groundTime = 0;
    this.airborneTime = 0;
    this.inAir = false;
  }
  
  update(altitude, onGround) {
    const AGL_THRESHOLD = 50; // feet
    const TIME_THRESHOLD = 5; // seconds
    
    if (altitude > AGL_THRESHOLD && !onGround) {
      this.airborneTime++;
      this.groundTime = 0;
      
      if (this.airborneTime >= TIME_THRESHOLD && !this.inAir) {
        this.inAir = true;
        return { event: 'takeoff', timestamp: Date.now() };
      }
    } else {
      this.groundTime++;
      this.airborneTime = 0;
    }
    
    return null;
  }
}
```

## Landing Detection & Rate Calculation

```javascript
class LandingDetector {
  constructor() {
    this.touchdownVS = null;
    this.landed = false;
  }
  
  update(altitude, verticalSpeed, onGround) {
    const GROUND_TIME_THRESHOLD = 30; // seconds
    
    // Detect touchdown
    if (onGround && !this.landed && this.touchdownVS === null) {
      this.touchdownVS = verticalSpeed;
    }
    
    // Confirm landing (on ground for 30s)
    if (onGround && altitude < 100) {
      this.groundTime++;
      
      if (this.groundTime >= GROUND_TIME_THRESHOLD) {
        this.landed = true;
        return {
          event: 'landing',
          landingRate: this.touchdownVS,
          timestamp: Date.now()
        };
      }
    } else {
      this.groundTime = 0;
    }
    
    return null;
  }
}
```

## Telemetry Recording

```javascript
class TelemetryRecorder {
  constructor() {
    this.data = [];
    this.recording = false;
  }
  
  start() {
    this.recording = true;
    this.data = [];
  }
  
  record(telemetry) {
    if (!this.recording) return;
    
    this.data.push({
      timestamp: Date.now(),
      ...telemetry
    });
  }
  
  stop() {
    this.recording = false;
    return this.compile();
  }
  
  compile() {
    if (this.data.length === 0) return null;
    
    const first = this.data[0];
    const last = this.data[this.data.length - 1];
    
    return {
      departureTime: new Date(first.timestamp).toISOString(),
      arrivalTime: new Date(last.timestamp).toISOString(),
      duration: (last.timestamp - first.timestamp) / 60000, // minutes
      maxAltitude: Math.max(...this.data.map(d => d.altitude)),
      maxSpeed: Math.max(...this.data.map(d => d.speed)),
      route: this.data.map(d => ({
        lat: d.latitude,
        lon: d.longitude,
        alt: d.altitude,
        timestamp: d.timestamp
      }))
    };
  }
}
```

## Complete Tracker Example (Node.js)

```javascript
const axios = require('axios');

class FlyNovaTracker {
  constructor(apiUrl, token) {
    this.apiUrl = apiUrl;
    this.token = token;
    this.currentFlight = null;
    this.recorder = new TelemetryRecorder();
    this.takeoffDetector = new TakeoffDetector();
    this.landingDetector = new LandingDetector();
  }
  
  async selectFlight(flightId) {
    this.currentFlight = flightId;
  }
  
  async processSimData(simData) {
    // Detect takeoff
    const takeoff = this.takeoffDetector.update(
      simData.altitude,
      simData.onGround
    );
    
    if (takeoff) {
      console.log('✈️  Takeoff detected!');
      await this.startFlight();
    }
    
    // Record telemetry if in flight
    if (this.recorder.recording) {
      this.recorder.record(simData);
    }
    
    // Detect landing
    const landing = this.landingDetector.update(
      simData.altitude,
      simData.verticalSpeed,
      simData.onGround
    );
    
    if (landing) {
      console.log('🛬 Landing detected! Rate:', landing.landingRate, 'fpm');
      await this.completeFlight(landing.landingRate);
    }
  }
  
  async startFlight() {
    try {
      await axios.post(
        `${this.apiUrl}/flights/${this.currentFlight}/start`,
        {},
        { headers: { Authorization: `Bearer ${this.token}` }}
      );
      
      this.recorder.start();
      console.log('Flight started successfully');
    } catch (error) {
      console.error('Failed to start flight:', error.message);
    }
  }
  
  async completeFlight(landingRate) {
    const telemetryData = this.recorder.stop();
    
    const report = {
      actualDepartureTime: telemetryData.departureTime,
      actualArrivalTime: telemetryData.arrivalTime,
      flightDuration: telemetryData.duration,
      distanceFlown: this.calculateDistance(telemetryData.route),
      fuelUsed: 0, // Calculate if fuel data available
      landingRate: landingRate,
      telemetryData: telemetryData
    };
    
    try {
      await axios.post(
        `${this.apiUrl}/flights/${this.currentFlight}/report`,
        report,
        { headers: { Authorization: `Bearer ${this.token}` }}
      );
      
      console.log('✅ Flight report submitted successfully!');
    } catch (error) {
      console.error('Failed to submit report:', error.message);
    }
  }
  
  calculateDistance(route) {
    // Haversine formula to calculate distance
    let totalDistance = 0;
    for (let i = 1; i < route.length; i++) {
      totalDistance += this.haversine(
        route[i-1].lat, route[i-1].lon,
        route[i].lat, route[i].lon
      );
    }
    return totalDistance;
  }
  
  haversine(lat1, lon1, lat2, lon2) {
    const R = 3440.065; // Nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
```

## Testing the Tracker

1. **Manually trigger events** for testing:
```javascript
// Test takeoff
tracker.processSimData({
  altitude: 100,
  onGround: false,
  // ... other data
});

// Test landing
tracker.processSimData({
  altitude: 50,
  verticalSpeed: -150,
  onGround: true,
  // ... other data
});
```

2. **Use simulator replay** to test full flight

3. **Validate API responses** before production use

## Best Practices

1. **Error Handling**: Always handle network errors gracefully
2. **Offline Mode**: Queue reports if API is unavailable
3. **Data Validation**: Verify telemetry data before sending
4. **Rate Limiting**: Don't spam the API (max 1 request/second)
5. **Security**: Store tokens securely, never in plain text
6. **User Feedback**: Show clear status messages

## Resources

- **SimConnect SDK**: https://docs.flightsimulator.com/
- **X-Plane Connect**: https://github.com/nasa/XPlaneConnect
- **FlyNova API Docs**: See API.md in this repository

---

**Happy Tracking! ✈️**
