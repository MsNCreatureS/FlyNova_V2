# FlyNova API Documentation

Complete API reference for the FlyNova Virtual Airline Management Platform.

**Base URL**: `https://yourdomain.com/api`

**Authentication**: JWT Bearer Token (where marked as 🔒)

## Table of Contents

1. [Authentication](#authentication)
2. [Virtual Airlines](#virtual-airlines)
3. [Fleet Management](#fleet-management)
4. [Routes](#routes)
5. [Flights](#flights)
6. [Admin](#admin)
7. [Downloads](#downloads)
8. [Profile](#profile)
9. [Data](#data)

---

## Authentication

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body**:
```json
{
  "email": "pilot@example.com",
  "username": "pilot123",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201):
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "pilot@example.com",
    "username": "pilot123",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

### Login

**POST** `/auth/login`

Authenticate a user.

**Request Body**:
```json
{
  "email": "pilot@example.com",
  "password": "securepass123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "pilot@example.com",
    "username": "pilot123",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": null
  }
}
```

---

### Get Current User

**GET** `/auth/me` 🔒

Get authenticated user details.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "user": {
    "id": 1,
    "email": "pilot@example.com",
    "username": "pilot123",
    "first_name": "John",
    "last_name": "Doe",
    "avatar_url": null,
    "created_at": "2025-10-22T10:00:00Z"
  }
}
```

---

## Virtual Airlines

### List All Virtual Airlines

**GET** `/virtual-airlines`

Get all active virtual airlines.

**Response** (200):
```json
{
  "virtualAirlines": [
    {
      "id": 1,
      "name": "Atlantic Airways Virtual",
      "callsign": "ATLANTIC",
      "icao_code": "AAV",
      "iata_code": "AA",
      "owner_id": 1,
      "logo_url": "/uploads/logo.png",
      "description": "Professional virtual airline...",
      "owner_username": "pilot123",
      "member_count": 25,
      "created_at": "2025-10-22T10:00:00Z"
    }
  ]
}
```

---

### Create Virtual Airline

**POST** `/virtual-airlines` 🔒

Create a new virtual airline. Each user can only create ONE VA.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Pacific Virtual Airlines",
  "callsign": "PACIFIC",
  "icaoCode": "PVA",
  "iataCode": "PV",
  "description": "Exploring the Pacific region...",
  "website": "https://pacificva.com"
}
```

**Response** (201):
```json
{
  "message": "Virtual Airline created successfully",
  "virtualAirline": {
    "id": 2,
    "name": "Pacific Virtual Airlines",
    "callsign": "PACIFIC",
    "icaoCode": "PVA",
    "iataCode": "PV"
  }
}
```

**Error** (400):
```json
{
  "error": "You can only create one Virtual Airline"
}
```

---

### Get VA Details

**GET** `/virtual-airlines/:vaId`

Get detailed information about a virtual airline.

**Response** (200):
```json
{
  "virtualAirline": {
    "id": 1,
    "name": "Atlantic Airways Virtual",
    "callsign": "ATLANTIC",
    "icao_code": "AAV",
    "iata_code": "AA",
    "description": "Professional virtual airline...",
    "logo_url": "/uploads/logo.png",
    "website": "https://atlanticva.com",
    "owner_username": "pilot123",
    "member_count": 25,
    "total_flights": 450,
    "total_hours": 1250.5,
    "created_at": "2025-10-22T10:00:00Z"
  }
}
```

---

### Join Virtual Airline

**POST** `/virtual-airlines/:vaId/join` 🔒

Join a virtual airline as a member.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (201):
```json
{
  "message": "Successfully joined Virtual Airline"
}
```

---

### Get VA Leaderboard

**GET** `/virtual-airlines/:vaId/leaderboard`

Get top pilots ranked by points.

**Response** (200):
```json
{
  "leaderboard": [
    {
      "user_id": 1,
      "username": "pilot123",
      "avatar_url": "/uploads/avatar.jpg",
      "points": 5000,
      "total_flights": 120,
      "total_hours": 350.5,
      "join_date": "2025-10-22T10:00:00Z"
    }
  ]
}
```

---

### Update VA

**PUT** `/virtual-airlines/:vaId` 🔒 (Admin/Owner)

Update virtual airline details.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Atlantic Airways Virtual - Updated",
  "description": "New description...",
  "website": "https://newsite.com",
  "logoUrl": "/uploads/new-logo.png"
}
```

**Response** (200):
```json
{
  "message": "Virtual Airline updated successfully"
}
```

---

## Fleet Management

### Get VA Fleet

**GET** `/fleet/:vaId`

Get all aircraft in a VA's fleet.

**Response** (200):
```json
{
  "fleet": [
    {
      "id": 1,
      "va_id": 1,
      "aircraft_id": 42,
      "registration": "N123AB",
      "status": "active",
      "total_flights": 45,
      "total_hours": 125.5,
      "aircraft_name": "Boeing 737-800",
      "aircraft_icao": "B738",
      "home_airport_name": "Los Angeles International",
      "home_airport_icao": "KLAX"
    }
  ]
}
```

---

### Add Aircraft to Fleet

**POST** `/fleet/:vaId` 🔒 (Admin/Owner)

Add a new aircraft to the fleet.

**Request Body**:
```json
{
  "aircraftId": 42,
  "registration": "N456CD",
  "homeAirportId": 123,
  "notes": "New acquisition"
}
```

**Response** (201):
```json
{
  "message": "Aircraft added to fleet",
  "fleetId": 2
}
```

---

### Update Fleet Aircraft

**PUT** `/fleet/:vaId/:fleetId` 🔒 (Admin/Owner)

Update aircraft details.

**Request Body**:
```json
{
  "status": "maintenance",
  "homeAirportId": 456,
  "notes": "Scheduled maintenance"
}
```

**Response** (200):
```json
{
  "message": "Fleet aircraft updated"
}
```

---

### Remove Aircraft from Fleet

**DELETE** `/fleet/:vaId/:fleetId` 🔒 (Admin/Owner)

Remove aircraft from fleet.

**Response** (200):
```json
{
  "message": "Aircraft removed from fleet"
}
```

---

## Routes

### Get VA Routes

**GET** `/routes/:vaId`

Get all routes for a virtual airline.

**Response** (200):
```json
{
  "routes": [
    {
      "id": 1,
      "va_id": 1,
      "flight_number": "AA001",
      "departure_airport_name": "Los Angeles International",
      "departure_icao": "KLAX",
      "departure_iata": "LAX",
      "departure_city": "Los Angeles",
      "arrival_airport_name": "John F Kennedy International",
      "arrival_icao": "KJFK",
      "arrival_iata": "JFK",
      "arrival_city": "New York",
      "aircraft_name": "Boeing 737-800",
      "aircraft_icao": "B738",
      "distance": 2475,
      "duration": 330,
      "status": "active"
    }
  ]
}
```

---

### Create Route

**POST** `/routes/:vaId` 🔒 (Admin/Owner)

Create a new route.

**Request Body**:
```json
{
  "flightNumber": "AA002",
  "departureAirportId": 123,
  "arrivalAirportId": 456,
  "aircraftId": 42,
  "distance": 2475,
  "duration": 330
}
```

**Response** (201):
```json
{
  "message": "Route created successfully",
  "routeId": 2
}
```

---

### Update Route

**PUT** `/routes/:vaId/:routeId` 🔒 (Admin/Owner)

Update route details.

**Request Body**:
```json
{
  "status": "inactive",
  "aircraftId": 43,
  "distance": 2500,
  "duration": 340
}
```

**Response** (200):
```json
{
  "message": "Route updated successfully"
}
```

---

### Delete Route

**DELETE** `/routes/:vaId/:routeId` 🔒 (Admin/Owner)

Delete a route.

**Response** (200):
```json
{
  "message": "Route deleted successfully"
}
```

---

## Flights

### Get My Flights

**GET** `/flights/my-flights` 🔒

Get all flights for the authenticated user.

**Response** (200):
```json
{
  "flights": [
    {
      "id": 1,
      "user_id": 1,
      "va_id": 1,
      "route_id": 1,
      "flight_number": "AA001",
      "status": "completed",
      "departure_time": "2025-10-22T14:00:00Z",
      "arrival_time": "2025-10-22T19:30:00Z",
      "va_name": "Atlantic Airways Virtual",
      "va_callsign": "ATLANTIC",
      "departure_airport_name": "Los Angeles International",
      "departure_icao": "KLAX",
      "arrival_airport_name": "John F Kennedy International",
      "arrival_icao": "KJFK",
      "aircraft_name": "Boeing 737-800",
      "validation_status": "approved",
      "points_awarded": 150
    }
  ]
}
```

---

### Reserve Flight

**POST** `/flights/reserve` 🔒

Reserve a flight.

**Request Body**:
```json
{
  "vaId": 1,
  "routeId": 1,
  "fleetId": 2
}
```

**Response** (201):
```json
{
  "message": "Flight reserved successfully",
  "flightId": 5
}
```

---

### Start Flight

**POST** `/flights/:flightId/start` 🔒

Mark flight as in progress (called by tracker).

**Response** (200):
```json
{
  "message": "Flight started successfully"
}
```

---

### Submit Flight Report

**POST** `/flights/:flightId/report` 🔒

Submit flight report after landing (called by tracker).

**Request Body**:
```json
{
  "actualDepartureTime": "2025-10-22T14:05:00Z",
  "actualArrivalTime": "2025-10-22T19:28:00Z",
  "flightDuration": 323,
  "distanceFlown": 2470.5,
  "fuelUsed": 8500,
  "landingRate": -125,
  "telemetryData": {
    "maxAltitude": 35000,
    "maxSpeed": 450,
    "route": [],
    "events": []
  }
}
```

**Response** (200):
```json
{
  "message": "Flight report submitted successfully"
}
```

---

### Get Active Flights

**GET** `/flights/active/:vaId`

Get all in-progress flights for a VA.

**Response** (200):
```json
{
  "flights": [
    {
      "id": 1,
      "user_id": 1,
      "username": "pilot123",
      "flight_number": "AA001",
      "departure_airport_name": "Los Angeles International",
      "departure_icao": "KLAX",
      "arrival_airport_name": "John F Kennedy International",
      "arrival_icao": "KJFK",
      "aircraft_name": "Boeing 737-800",
      "registration": "N123AB",
      "departure_time": "2025-10-22T14:00:00Z"
    }
  ]
}
```

---

## Admin

### Get Pending Reports

**GET** `/admin/:vaId/pending-reports` 🔒 (Admin/Owner)

Get all pending flight reports for validation.

**Response** (200):
```json
{
  "reports": [
    {
      "id": 1,
      "flight_id": 5,
      "flight_number": "AA001",
      "username": "pilot123",
      "route_number": "AA001",
      "departure_icao": "KLAX",
      "arrival_icao": "KJFK",
      "aircraft_name": "Boeing 737-800",
      "flight_duration": 323,
      "distance_flown": 2470.5,
      "landing_rate": -125,
      "created_at": "2025-10-22T19:30:00Z"
    }
  ]
}
```

---

### Validate Flight Report

**POST** `/admin/:vaId/validate-report/:reportId` 🔒 (Admin/Owner)

Approve or reject a flight report.

**Request Body**:
```json
{
  "status": "approved",
  "adminNotes": "Great flight! Smooth landing.",
  "pointsAwarded": 150
}
```

**Response** (200):
```json
{
  "message": "Flight report approved"
}
```

---

### Get VA Members

**GET** `/admin/:vaId/members` 🔒 (Admin/Owner)

Get all members of the VA.

**Response** (200):
```json
{
  "members": [
    {
      "id": 1,
      "user_id": 1,
      "va_id": 1,
      "role": "owner",
      "points": 5000,
      "total_flights": 120,
      "total_hours": 350.5,
      "join_date": "2025-10-22T10:00:00Z",
      "username": "pilot123",
      "email": "pilot@example.com",
      "avatar_url": null
    }
  ]
}
```

---

### Update Member

**PUT** `/admin/:vaId/members/:memberId` 🔒 (Owner only)

Update member role or status.

**Request Body**:
```json
{
  "role": "admin",
  "status": "active"
}
```

**Response** (200):
```json
{
  "message": "Member updated successfully"
}
```

---

### Get VA Events

**GET** `/admin/:vaId/events`

Get all events for a VA.

**Response** (200):
```json
{
  "events": [
    {
      "id": 1,
      "va_id": 1,
      "name": "Focus: Los Angeles",
      "description": "Fly to or from KLAX to earn bonus points!",
      "event_type": "focus_airport",
      "focus_airport_name": "Los Angeles International",
      "focus_airport_icao": "KLAX",
      "start_date": "2025-10-25T00:00:00Z",
      "end_date": "2025-10-31T23:59:59Z",
      "bonus_points": 50,
      "status": "active",
      "created_by_username": "pilot123"
    }
  ]
}
```

---

### Create Event

**POST** `/admin/:vaId/events` 🔒 (Admin/Owner)

Create a new event.

**Request Body**:
```json
{
  "name": "Focus: New York",
  "description": "Fly to or from JFK to earn bonus points!",
  "eventType": "focus_airport",
  "focusAirportId": 456,
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-11-07T23:59:59Z",
  "bonusPoints": 75
}
```

**Response** (201):
```json
{
  "message": "Event created successfully",
  "eventId": 2
}
```

---

### Get VA Statistics

**GET** `/admin/:vaId/statistics` 🔒 (Admin/Owner)

Get comprehensive VA statistics.

**Response** (200):
```json
{
  "statistics": {
    "total_members": 25,
    "total_aircraft": 15,
    "total_routes": 50,
    "total_flights": 450,
    "active_flights": 5,
    "pending_reports": 8,
    "total_hours": 1250.5
  }
}
```

---

## Downloads

### Get Downloads

**GET** `/downloads/:vaId`

Get all downloads for a VA.

**Response** (200):
```json
{
  "downloads": [
    {
      "id": 1,
      "va_id": 1,
      "title": "Boeing 737-800 Livery",
      "description": "Official AA livery for PMDG 737",
      "file_type": "livery",
      "file_name": "AA_737_Livery.zip",
      "file_url": "/uploads/AA_737_Livery.zip",
      "file_size": 15728640,
      "download_count": 45,
      "aircraft_name": "Boeing 737-800",
      "aircraft_icao": "B738",
      "uploaded_by_username": "pilot123",
      "created_at": "2025-10-22T10:00:00Z"
    }
  ]
}
```

---

### Upload File

**POST** `/downloads/:vaId/upload` 🔒 (Admin/Owner)

Upload a file (livery, tracker, document).

**Headers**:
```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Data**:
- `file`: File to upload
- `title`: File title
- `description`: File description
- `fileType`: Type (livery, tracker, document, other)
- `aircraftId`: Aircraft ID (for liveries)

**Response** (201):
```json
{
  "message": "File uploaded successfully",
  "downloadId": 2,
  "fileUrl": "/uploads/filename.zip"
}
```

---

### Delete Download

**DELETE** `/downloads/:vaId/:downloadId` 🔒 (Admin/Owner)

Delete a download.

**Response** (200):
```json
{
  "message": "Download deleted successfully"
}
```

---

### Track Download

**POST** `/downloads/:vaId/:downloadId/track`

Increment download count.

**Response** (200):
```json
{
  "message": "Download tracked"
}
```

---

## Profile

### Get User Profile

**GET** `/profile/:userId`

Get user profile with stats and achievements.

**Response** (200):
```json
{
  "user": {
    "id": 1,
    "username": "pilot123",
    "email": "pilot@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "avatar_url": null,
    "created_at": "2025-10-22T10:00:00Z"
  },
  "memberships": [
    {
      "id": 1,
      "va_id": 1,
      "va_name": "Atlantic Airways Virtual",
      "callsign": "ATLANTIC",
      "logo_url": "/uploads/logo.png",
      "role": "owner",
      "points": 5000,
      "total_flights": 120,
      "total_hours": 350.5
    }
  ],
  "stats": {
    "total_flights": 120,
    "total_hours": 350.5,
    "total_points": 5000
  },
  "recentFlights": [],
  "achievements": []
}
```

---

### Update Profile

**PUT** `/profile/me` 🔒

Update own profile.

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "avatarUrl": "/uploads/avatar.jpg"
}
```

**Response** (200):
```json
{
  "message": "Profile updated successfully"
}
```

---

## Data

### Get All Aircraft

**GET** `/data/aircraft`

Get all aircraft types.

**Response** (200):
```json
{
  "aircraft": [
    {
      "id": 1,
      "name": "Boeing 737-800",
      "iata_code": "738",
      "icao_code": "B738"
    }
  ]
}
```

---

### Search Aircraft

**GET** `/data/aircraft/search?q=737`

Search aircraft by name or code.

**Response** (200):
```json
{
  "aircraft": [
    {
      "id": 1,
      "name": "Boeing 737-800",
      "iata_code": "738",
      "icao_code": "B738"
    }
  ]
}
```

---

### Get All Airports

**GET** `/data/airports`

Get all airports (limited to 1000).

**Response** (200):
```json
{
  "airports": [
    {
      "id": 1,
      "name": "Los Angeles International Airport",
      "city": "Los Angeles",
      "country": "United States",
      "iata_code": "LAX",
      "icao_code": "KLAX",
      "latitude": 33.942536,
      "longitude": -118.408075
    }
  ]
}
```

---

### Search Airports

**GET** `/data/airports/search?q=los angeles`

Search airports by name, city, or code.

**Response** (200):
```json
{
  "airports": [
    {
      "id": 1,
      "name": "Los Angeles International Airport",
      "city": "Los Angeles",
      "country": "United States",
      "iata_code": "LAX",
      "icao_code": "KLAX"
    }
  ]
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Something went wrong!"
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **100 requests per 15 minutes** per IP address
- Exceeded limits return `429 Too Many Requests`

---

## Authentication

Include JWT token in header for protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens expire after 7 days. Refresh by logging in again.

---

**For questions or issues, open a GitHub issue or contact support.**
