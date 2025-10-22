const express = require('express');
const db = require('../config/database');
const { authMiddleware, checkVARole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/logos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'va-logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all Virtual Airlines
router.get('/', async (req, res) => {
  try {
    const [vas] = await db.query(`
      SELECT 
        va.*,
        u.username as owner_username,
        COUNT(DISTINCT vm.user_id) as member_count
      FROM virtual_airlines va
      LEFT JOIN users u ON va.owner_id = u.id
      LEFT JOIN va_members vm ON va.id = vm.va_id AND vm.status = 'active'
      WHERE va.status = 'active'
      GROUP BY va.id
      ORDER BY va.created_at DESC
    `);

    res.json({ virtualAirlines: vas });
  } catch (error) {
    console.error('Get VAs error:', error);
    res.status(500).json({ error: 'Failed to fetch virtual airlines' });
  }
});

// Create Virtual Airline
router.post('/', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const { name, callsign, icao_code, iata_code, description, website, logo_url } = req.body;
    const userId = req.user.id;

    // Check if user already owns a VA
    const [existing] = await db.query(
      'SELECT id FROM virtual_airlines WHERE owner_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You can only create one Virtual Airline' });
    }

    // Check if callsign is taken
    const [callsignCheck] = await db.query(
      'SELECT id FROM virtual_airlines WHERE callsign = ?',
      [callsign]
    );

    if (callsignCheck.length > 0) {
      return res.status(400).json({ error: 'Callsign already taken' });
    }

    // Determine logo URL (uploaded file or external URL)
    let finalLogoUrl = logo_url || null;
    if (req.file) {
      finalLogoUrl = '/uploads/logos/' + req.file.filename;
    }

    // Create VA
    const [result] = await db.query(
      'INSERT INTO virtual_airlines (name, callsign, icao_code, iata_code, owner_id, description, website, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, callsign, icao_code || null, iata_code || null, userId, description || null, website || null, finalLogoUrl]
    );

    const vaId = result.insertId;

    // Add owner as member with owner role
    await db.query(
      'INSERT INTO va_members (user_id, va_id, role) VALUES (?, ?, ?)',
      [userId, vaId, 'Owner']
    );

    res.status(201).json({
      message: 'Virtual Airline created successfully',
      virtualAirline: {
        id: vaId,
        name,
        callsign,
        icao_code,
        iata_code,
        logo_url: finalLogoUrl
      }
    });
  } catch (error) {
    console.error('Create VA error:', error);
    res.status(500).json({ error: 'Failed to create Virtual Airline' });
  }
});

// Get VA details
router.get('/:vaId', async (req, res) => {
  try {
    const { vaId } = req.params;

    const [vas] = await db.query(`
      SELECT 
        va.*,
        u.username as owner_username,
        COUNT(DISTINCT vm.user_id) as member_count,
        COUNT(DISTINCT f.id) as total_flights,
        SUM(CASE WHEN vm.status = 'active' THEN vm.total_hours ELSE 0 END) as total_hours
      FROM virtual_airlines va
      LEFT JOIN users u ON va.owner_id = u.id
      LEFT JOIN va_members vm ON va.id = vm.va_id
      LEFT JOIN flights f ON va.id = f.va_id AND f.status = 'completed'
      WHERE va.id = ?
      GROUP BY va.id
    `, [vaId]);

    if (vas.length === 0) {
      return res.status(404).json({ error: 'Virtual Airline not found' });
    }

    // Get members list
    const [members] = await db.query(`
      SELECT 
        vm.user_id,
        u.username,
        u.avatar_url,
        vm.role,
        vm.points,
        vm.total_flights,
        vm.total_hours,
        vm.join_date as joined_at,
        vm.status
      FROM va_members vm
      JOIN users u ON vm.user_id = u.id
      WHERE vm.va_id = ?
      ORDER BY 
        CASE vm.role 
          WHEN 'owner' THEN 1 
          WHEN 'admin' THEN 2 
          ELSE 3 
        END,
        vm.points DESC
    `, [vaId]);

    res.json({ 
      virtualAirline: vas[0],
      members: members
    });
  } catch (error) {
    console.error('Get VA error:', error);
    res.status(500).json({ error: 'Failed to fetch Virtual Airline' });
  }
});

// Join VA
router.post('/:vaId/join', authMiddleware, async (req, res) => {
  try {
    const { vaId } = req.params;
    const userId = req.user.id;

    // Check if VA exists
    const [vas] = await db.query('SELECT id FROM virtual_airlines WHERE id = ?', [vaId]);
    if (vas.length === 0) {
      return res.status(404).json({ error: 'Virtual Airline not found' });
    }

    // Check if already member
    const [existing] = await db.query(
      'SELECT id FROM va_members WHERE user_id = ? AND va_id = ?',
      [userId, vaId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already a member of this VA' });
    }

    // Add member
    await db.query(
      'INSERT INTO va_members (user_id, va_id, role) VALUES (?, ?, ?)',
      [userId, vaId, 'Member']
    );

    res.status(201).json({ message: 'Successfully joined Virtual Airline' });
  } catch (error) {
    console.error('Join VA error:', error);
    res.status(500).json({ error: 'Failed to join Virtual Airline' });
  }
});

// Get VA leaderboard
router.get('/:vaId/leaderboard', async (req, res) => {
  try {
    const { vaId } = req.params;

    const [leaderboard] = await db.query(`
      SELECT 
        vm.user_id,
        u.username,
        u.avatar_url,
        vm.points,
        vm.total_flights,
        vm.total_hours,
        vm.join_date
      FROM va_members vm
      JOIN users u ON vm.user_id = u.id
      WHERE vm.va_id = ? AND vm.status = 'active'
      ORDER BY vm.points DESC, vm.total_hours DESC
      LIMIT 100
    `, [vaId]);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Update VA (admin only)
router.put('/:vaId', authMiddleware, checkVARole(['Owner', 'Admin']), upload.single('logo'), async (req, res) => {
  try {
    const { vaId } = req.params;
    const { name, description, website, logo_url } = req.body;

    // Determine logo URL (uploaded file or external URL)
    let finalLogoUrl = logo_url;
    if (req.file) {
      finalLogoUrl = '/uploads/logos/' + req.file.filename;
    }

    await db.query(
      'UPDATE virtual_airlines SET name = ?, description = ?, website = ?, logo_url = ? WHERE id = ?',
      [name, description, website, finalLogoUrl, vaId]
    );

    res.json({ message: 'Virtual Airline updated successfully' });
  } catch (error) {
    console.error('Update VA error:', error);
    res.status(500).json({ error: 'Failed to update Virtual Airline' });
  }
});

module.exports = router;
