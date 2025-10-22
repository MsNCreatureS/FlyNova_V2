# FlyNova - Troubleshooting Guide

Common issues and their solutions for FlyNova Virtual Airline Platform.

## 🔧 Installation Issues

### "Cannot find module" Error

**Symptom**: `Error: Cannot find module 'express'` or similar

**Solution**:
```bash
# Delete and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Setup Script Fails

**Symptom**: `node setup.js` crashes or hangs

**Solution**:
```bash
# Manually create .env file
cp .env.example .env

# Edit .env with your database credentials
# Then run migrations manually:
node server/migrations/run.js
node server/scripts/import-openflights.js
```

### Permission Denied on setup.js

**Symptom**: Cannot execute setup script

**Solution**:
```bash
# Make script executable (Linux/Mac)
chmod +x setup.js

# Or run with node directly
node setup.js
```

## 🗄️ Database Issues

### Cannot Connect to Database

**Symptom**: `ECONNREFUSED` or `Access denied for user`

**Solution**:
```bash
# 1. Verify MySQL is running
# Windows:
net start MySQL

# Linux:
sudo service mysql start

# Mac:
brew services start mysql

# 2. Test connection manually
mysql -u root -p

# 3. Check .env credentials match your MySQL setup
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=flynova
```

### Database Already Exists Error

**Symptom**: Migration fails with "database exists"

**Solution**:
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS flynova;"
mysql -u root -p -e "CREATE DATABASE flynova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations again
npm run migrate
```

### Table Already Exists

**Symptom**: Migration errors about existing tables

**Solution**:
```bash
# Either drop all tables manually, or
# Drop the entire database and recreate:
mysql -u root -p flynova < database/schema.sql
```

### Unknown Column Error

**Symptom**: `Unknown column 'xyz' in 'field list'`

**Solution**:
```bash
# Re-run migrations to ensure all columns exist
npm run migrate

# Or manually add missing column:
mysql -u root -p flynova
ALTER TABLE table_name ADD COLUMN column_name VARCHAR(255);
```

## 🌐 API Server Issues

### Port Already in Use

**Symptom**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solution**:

**Option 1**: Kill process using the port
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

**Option 2**: Change port in `.env`
```bash
PORT=3002  # Use different port
```

### API Returns 502/504

**Symptom**: Frontend can't connect to API

**Solution**:
```bash
# 1. Ensure API server is running
npm run server:dev

# 2. Check API URL in .env
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# 3. Test API directly
curl http://localhost:3001/api/health
```

### CORS Errors

**Symptom**: Browser console shows CORS policy errors

**Solution**:

In `server/index.js`, update CORS configuration:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

## 🖥️ Frontend Issues

### Next.js Build Fails

**Symptom**: `npm run build` fails with errors

**Solution**:
```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Rebuild
npm run build

# 3. If TypeScript errors, fix them or temporarily disable strict mode
# In tsconfig.json: "strict": false
```

### Page Not Found (404)

**Symptom**: Routes return 404 in production

**Solution**:

Ensure `.htaccess` is configured correctly:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

### White Screen of Death

**Symptom**: Frontend shows blank page

**Solution**:
```bash
# 1. Check browser console for errors
# 2. Verify API is running
# 3. Check .env variables
# 4. Clear browser cache
# 5. Rebuild application:
npm run build
```

### Styles Not Loading

**Symptom**: Page appears unstyled

**Solution**:
```bash
# Ensure Tailwind CSS is properly configured
npm install -D tailwindcss postcss autoprefixer

# Rebuild
npm run build
```

## 🔐 Authentication Issues

### JWT Token Invalid

**Symptom**: `Invalid or expired token` error

**Solution**:
```javascript
// Check JWT_SECRET is set in .env
JWT_SECRET=your-very-long-secret-key-at-least-32-characters

// Token might be expired, login again to get new token
```

### Cannot Login After Registration

**Symptom**: Login fails immediately after registering

**Solution**:
```bash
# Check database users table
mysql -u root -p flynova
SELECT * FROM users WHERE email = 'your@email.com';

# Verify password_hash column is populated
# If empty, re-register
```

### Session Lost After Refresh

**Symptom**: User logged out on page reload

**Solution**:
```javascript
// Frontend: Ensure token is stored in localStorage
localStorage.setItem('token', data.token);

// Check token retrieval on app load
const token = localStorage.getItem('token');
```

## 📁 File Upload Issues

### Upload Fails

**Symptom**: File upload returns error

**Solution**:
```bash
# 1. Create uploads directory
mkdir -p public/uploads

# 2. Set proper permissions
chmod 755 public/uploads

# 3. Check MAX_FILE_SIZE in .env
MAX_FILE_SIZE=10485760  # 10MB

# 4. Verify file type is allowed in routes/downloads.js
```

### Uploaded Files Not Accessible

**Symptom**: Cannot access uploaded files via URL

**Solution**:

Ensure static file serving in `server/index.js`:
```javascript
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
```

## 🔄 Data Import Issues

### OpenFlights Import Fails

**Symptom**: `npm run import:data` fails

**Solution**:
```bash
# 1. Check internet connection (data fetched from GitHub)

# 2. Manually download data:
curl -o aircraft.dat https://raw.githubusercontent.com/jpatokal/openflights/master/data/planes.dat
curl -o airports.dat https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat

# 3. Modify import script to read local files
```

### No Aircraft/Airports After Import

**Symptom**: Database tables are empty

**Solution**:
```bash
# Check import logs for errors
node server/scripts/import-openflights.js

# Verify data in database
mysql -u root -p flynova
SELECT COUNT(*) FROM aircraft;
SELECT COUNT(*) FROM airports;

# Should show ~250 aircraft and 7500+ airports
```

## 🚀 Deployment Issues (Hostinger)

### Node.js Application Won't Start

**Symptom**: Application status shows "Stopped"

**Solution**:
```bash
# 1. Check logs in hPanel
# 2. Verify package.json has correct start script
# 3. Ensure all dependencies are installed:
npm install --production

# 4. Check Node.js version in hPanel matches your app
```

### Database Connection Fails on Hostinger

**Symptom**: `ECONNREFUSED` on production

**Solution**:
```env
# Use Hostinger's database hostname (from hPanel)
DB_HOST=localhost  # or specific hostname provided
DB_USER=u123456789_user
DB_PASSWORD=your_password
DB_NAME=u123456789_dbname
```

### API Endpoints Return 404

**Symptom**: `/api/*` routes don't work

**Solution**:

Check `.htaccess` proxy configuration:
```apache
RewriteCond %{REQUEST_URI} ^/api/(.*)$ [NC]
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]
```

### Slow Performance

**Symptom**: Pages load slowly

**Solution**:
```bash
# 1. Enable caching in .htaccess
# 2. Compress assets
# 3. Use CDN (Cloudflare)
# 4. Optimize database queries
# 5. Consider upgrading hosting plan
```

## 📊 Performance Issues

### Slow API Responses

**Symptom**: API takes >2 seconds to respond

**Solution**:
```sql
-- Add missing indexes
CREATE INDEX idx_flights_user_va ON flights(user_id, va_id);
CREATE INDEX idx_flight_reports_status ON flight_reports(validation_status);

-- Optimize queries with EXPLAIN
EXPLAIN SELECT * FROM flights WHERE user_id = 1;
```

### High Memory Usage

**Symptom**: Server runs out of memory

**Solution**:
```javascript
// Limit result sets in queries
const [flights] = await db.query('SELECT * FROM flights LIMIT 100');

// Use pagination for large datasets
const page = req.query.page || 1;
const limit = 20;
const offset = (page - 1) * limit;
```

## 🐛 Common Runtime Errors

### "undefined is not a function"

**Location**: Frontend

**Solution**:
```javascript
// Check if object/variable exists before calling
if (user && user.getName) {
  user.getName();
}

// Or use optional chaining
user?.getName();
```

### "Cannot read property 'x' of undefined"

**Location**: Frontend or Backend

**Solution**:
```javascript
// Check if object exists first
if (data && data.user) {
  console.log(data.user.name);
}

// Or use optional chaining
console.log(data?.user?.name);
```

### JSON Parse Error

**Location**: Backend

**Solution**:
```javascript
// Wrap JSON parsing in try-catch
try {
  const data = JSON.parse(req.body.telemetryData);
} catch (error) {
  return res.status(400).json({ error: 'Invalid JSON' });
}
```

## 🧪 Testing Issues

### Cannot Create Virtual Airline

**Symptom**: "You can only create one Virtual Airline"

**Solution**:
```sql
-- Check if user already owns a VA
SELECT * FROM virtual_airlines WHERE owner_id = YOUR_USER_ID;

-- If testing, delete the existing VA
DELETE FROM virtual_airlines WHERE owner_id = YOUR_USER_ID;
```

### Cannot Join VA

**Symptom**: "Already a member of this VA"

**Solution**:
```sql
-- Check membership
SELECT * FROM va_members WHERE user_id = YOUR_USER_ID AND va_id = VA_ID;

-- If testing, leave the VA
UPDATE va_members SET status = 'left' WHERE id = MEMBERSHIP_ID;
```

## 🔍 Debugging Tips

### Enable Detailed Logging

**Backend** (`server/index.js`):
```javascript
// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

### Check API Responses

```bash
# Use curl to test endpoints directly
curl -X GET http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Database Query Debugging

```javascript
// Log queries in database.js
pool.on('query', (query) => {
  console.log('QUERY:', query.sql);
});
```

### Frontend State Debugging

```javascript
// React DevTools: Install browser extension
// Console logging:
console.log('State:', { flights, loading, error });
```

## 📞 Getting Help

If you're still stuck:

1. **Check Logs**: Always check error messages carefully
2. **Search Issues**: Look for similar problems in GitHub Issues
3. **Read Docs**: Review README.md, API.md, DEPLOYMENT.md
4. **Test Endpoints**: Use curl or Postman to isolate issues
5. **Fresh Install**: Try clean installation if all else fails

## 🆘 Emergency Reset

Complete reset if everything is broken:

```bash
# 1. Stop all servers
# Ctrl+C in all terminal windows

# 2. Delete everything except source code
rm -rf node_modules .next package-lock.json

# 3. Reset database
mysql -u root -p -e "DROP DATABASE IF EXISTS flynova;"
mysql -u root -p -e "CREATE DATABASE flynova;"

# 4. Reinstall
npm install

# 5. Reconfigure
node setup.js

# 6. Rebuild
npm run build

# 7. Restart
npm run server:dev  # Terminal 1
npm run dev         # Terminal 2
```

---

**Still having issues?**

1. Check the full [README.md](./README.md)
2. Review [QUICKSTART.md](./QUICKSTART.md)
3. Search existing GitHub issues
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)
   - What you've already tried

**Good luck! ✈️**
