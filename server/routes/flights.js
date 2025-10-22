const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user's flights
router.get('/my-flights', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [flights] = await db.query(`
      SELECT 
        f.*,
        va.name as va_name,
        va.callsign as va_callsign,
        vr.flight_number,
        dep.name as departure_airport_name,
        dep.icao_code as departure_icao,
        arr.name as arrival_airport_name,
        arr.icao_code as arrival_icao,
        a.name as aircraft_name,
        fr.validation_status,
        fr.points_awarded
      FROM flights f
      JOIN virtual_airlines va ON f.va_id = va.id
      JOIN va_routes vr ON f.route_id = vr.id
      JOIN airports dep ON vr.departure_airport_id = dep.id
      JOIN airports arr ON vr.arrival_airport_id = arr.id
      LEFT JOIN va_fleet vf ON f.fleet_id = vf.id
      LEFT JOIN aircraft a ON vf.aircraft_id = a.id
      LEFT JOIN flight_reports fr ON f.id = fr.flight_id
      WHERE f.user_id = ?
      ORDER BY f.reserved_at DESC
    `, [userId]);

    res.json({ flights });
  } catch (error) {
    console.error('Get flights error:', error);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

// Reserve a flight
router.post('/reserve', authMiddleware, async (req, res) => {
  try {
    const { vaId, routeId, fleetId } = req.body;
    const userId = req.user.id;

    // Verify user is member of VA
    const [membership] = await db.query(
      'SELECT id FROM va_members WHERE user_id = ? AND va_id = ? AND status = "active"',
      [userId, vaId]
    );

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not a member of this Virtual Airline' });
    }

    // Get route info
    const [routes] = await db.query(
      'SELECT flight_number FROM va_routes WHERE id = ? AND va_id = ?',
      [routeId, vaId]
    );

    if (routes.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const [result] = await db.query(
      'INSERT INTO flights (user_id, va_id, route_id, fleet_id, flight_number, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, vaId, routeId, fleetId || null, routes[0].flight_number, 'reserved']
    );

    res.status(201).json({
      message: 'Flight reserved successfully',
      flightId: result.insertId
    });
  } catch (error) {
    console.error('Reserve flight error:', error);
    res.status(500).json({ error: 'Failed to reserve flight' });
  }
});

// Start flight (tracker integration)
router.post('/:flightId/start', authMiddleware, async (req, res) => {
  try {
    const { flightId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const [flights] = await db.query(
      'SELECT id FROM flights WHERE id = ? AND user_id = ? AND status = "reserved"',
      [flightId, userId]
    );

    if (flights.length === 0) {
      return res.status(404).json({ error: 'Flight not found or already started' });
    }

    await db.query(
      'UPDATE flights SET status = ?, departure_time = NOW() WHERE id = ?',
      ['in_progress', flightId]
    );

    res.json({ message: 'Flight started successfully' });
  } catch (error) {
    console.error('Start flight error:', error);
    res.status(500).json({ error: 'Failed to start flight' });
  }
});

// Submit flight report (tracker integration)
router.post('/:flightId/report', authMiddleware, async (req, res) => {
  try {
    const { flightId } = req.params;
    const userId = req.user.id;
    const {
      actualDepartureTime,
      actualArrivalTime,
      flightDuration,
      distanceFlown,
      fuelUsed,
      landingRate,
      telemetryData
    } = req.body;

    // Verify ownership
    const [flights] = await db.query(
      'SELECT id, va_id FROM flights WHERE id = ? AND user_id = ? AND status = "in_progress"',
      [flightId, userId]
    );

    if (flights.length === 0) {
      return res.status(404).json({ error: 'Flight not found or not in progress' });
    }

    // Update flight status
    await db.query(
      'UPDATE flights SET status = ?, arrival_time = NOW() WHERE id = ?',
      ['completed', flightId]
    );

    // Create flight report
    await db.query(
      `INSERT INTO flight_reports 
       (flight_id, actual_departure_time, actual_arrival_time, flight_duration, distance_flown, fuel_used, landing_rate, telemetry_data) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [flightId, actualDepartureTime, actualArrivalTime, flightDuration, distanceFlown, fuelUsed, landingRate, JSON.stringify(telemetryData)]
    );

    res.json({ message: 'Flight report submitted successfully' });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ error: 'Failed to submit flight report' });
  }
});

// Get active flights for a VA
router.get('/active/:vaId', async (req, res) => {
  try {
    const { vaId } = req.params;

    const [flights] = await db.query(`
      SELECT 
        f.*,
        u.username,
        vr.flight_number,
        dep.name as departure_airport_name,
        dep.icao_code as departure_icao,
        arr.name as arrival_airport_name,
        arr.icao_code as arrival_icao,
        a.name as aircraft_name,
        vf.registration
      FROM flights f
      JOIN users u ON f.user_id = u.id
      JOIN va_routes vr ON f.route_id = vr.id
      JOIN airports dep ON vr.departure_airport_id = dep.id
      JOIN airports arr ON vr.arrival_airport_id = arr.id
      LEFT JOIN va_fleet vf ON f.fleet_id = vf.id
      LEFT JOIN aircraft a ON vf.aircraft_id = a.id
      WHERE f.va_id = ? AND f.status = 'in_progress'
      ORDER BY f.departure_time DESC
    `, [vaId]);

    res.json({ flights });
  } catch (error) {
    console.error('Get active flights error:', error);
    res.status(500).json({ error: 'Failed to fetch active flights' });
  }
});

module.exports = router;
