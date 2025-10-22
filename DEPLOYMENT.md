# FlyNova - Hostinger Deployment Guide

Complete guide for deploying FlyNova Virtual Airline Platform on Hostinger shared hosting.

## 📋 Prerequisites

### Hostinger Requirements
- **Hosting Plan**: Business or higher (for Node.js support)
- **Node.js**: Version 18.x or higher
- **MySQL**: Database included with plan
- **SSH Access**: Available in Business plan and above
- **Domain**: Connected to your hosting account

### Before You Start
- ✅ Hostinger account with Business plan or higher
- ✅ Domain configured and pointing to Hostinger
- ✅ FTP credentials from hPanel
- ✅ SSH access enabled
- ✅ Project files ready for upload

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Files

1. **Build the Next.js application locally:**

```bash
# On your local machine
cd FlyNova
npm install
npm run build
```

2. **Create production environment file:**

Create `.env` with production values:

```env
# Application
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Database (Get from Hostinger hPanel)
DB_HOST=localhost
DB_PORT=3306
DB_USER=u123456789_flynova
DB_PASSWORD=YourSecurePassword123!
DB_NAME=u123456789_flynova

# JWT (Generate a strong secret)
JWT_SECRET=your-production-secret-key-min-32-chars-long
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760

# OpenFlights Data URLs
AIRPORTS_DATA_URL=https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat
AIRCRAFT_DATA_URL=https://raw.githubusercontent.com/jpatokal/openflights/master/data/planes.dat
```

3. **Create deployment package:**

Include these files/folders:
- `.next/` (built Next.js app)
- `public/`
- `server/`
- `database/`
- `node_modules/` (or install on server)
- `package.json`
- `package-lock.json`
- `.env` (production version)
- `next.config.js`

### Step 2: Create MySQL Database

1. **Log into Hostinger hPanel**
2. Navigate to **Databases** → **MySQL Databases**
3. Click **Create Database**
4. Database Name: `u123456789_flynova` (Hostinger adds prefix)
5. Create a database user with a strong password
6. Grant all privileges to the user
7. **Save credentials** - you'll need them for `.env`

### Step 3: Upload Files

#### Option A: Using File Manager (Easier)

1. Log into hPanel
2. Go to **File Manager**
3. Navigate to `public_html/` or your domain's root
4. Create folder: `flynova/`
5. Upload all files:
   - Click **Upload**
   - Upload `.next` folder
   - Upload all other folders and files
   - This may take 10-30 minutes depending on file size

#### Option B: Using FTP (Recommended for Large Files)

1. **Get FTP credentials from hPanel:**
   - Go to **File Manager** → **FTP Accounts**
   - Use existing or create new FTP account

2. **Connect using FileZilla or similar:**
   - Host: `ftp.yourdomain.com`
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

3. **Upload files:**
   - Navigate to `public_html/flynova/`
   - Upload all project files
   - Ensure `.env` is uploaded

#### Option C: Using SSH (Fastest)

1. **Connect via SSH:**

```bash
ssh u123456789@yourdomain.com
# Enter password when prompted
```

2. **Navigate to web directory:**

```bash
cd domains/yourdomain.com/public_html
mkdir flynova
cd flynova
```

3. **Clone repository (if using Git):**

```bash
git clone <your-repo-url> .
```

4. **Or upload via SCP from local machine:**

```bash
# On your local machine
scp -r FlyNova/* u123456789@yourdomain.com:domains/yourdomain.com/public_html/flynova/
```

### Step 4: Install Dependencies on Server

1. **SSH into your server:**

```bash
ssh u123456789@yourdomain.com
cd domains/yourdomain.com/public_html/flynova
```

2. **Check Node.js version:**

```bash
node --version  # Should be 18.x or higher
```

If Node.js is not available or wrong version:

```bash
# In hPanel, go to Advanced → Node.js
# Select your domain
# Choose Node.js version 18.x or 20.x
# Click "Enable"
```

3. **Install dependencies:**

```bash
npm install --production
```

### Step 5: Run Database Migrations

1. **Still in SSH, run migrations:**

```bash
node server/migrations/run.js
```

You should see:
```
🚀 Running database migrations...
✅ Database migrations completed successfully
✅ Default achievements added
```

2. **Import OpenFlights data:**

```bash
node server/scripts/import-openflights.js
```

You should see:
```
🚀 Starting OpenFlights data import...
📦 Importing aircraft data...
✅ Imported 250 aircraft
📦 Importing airports data...
✅ Imported 7500+ airports
✅ OpenFlights data import completed successfully
```

### Step 6: Configure Node.js Application in hPanel

1. **Go to hPanel → Advanced → Node.js**
2. **Click "Create Application"**
3. **Configure:**
   - **Application Mode**: Production
   - **Application Root**: `public_html/flynova`
   - **Application URL**: `yourdomain.com` or `api.yourdomain.com`
   - **Application Startup File**: `server/index.js`
   - **Node.js Version**: 18.x or 20.x
   - **Environment Variables**: Add from `.env` file
     - Click "Add Variable" for each env var
     - Copy from your `.env` file

4. **Click "Create"**

5. **Start the application:**
   - Click "Start Application" button
   - Status should show "Running"

### Step 7: Configure Next.js Frontend

#### Option A: Static Export (Recommended for Hostinger)

1. **Update `next.config.js` for static export:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

2. **Rebuild locally:**

```bash
npm run build
```

3. **Upload `out/` folder to Hostinger**

#### Option B: Standalone Next.js (If Node.js supports it)

If your Hostinger plan supports running Next.js:

1. Keep current `next.config.js` with `output: 'standalone'`
2. Start Next.js via Node.js panel
3. Application Startup File: `server.js` or custom entry point

### Step 8: Configure Web Server (.htaccess)

Create `.htaccess` in your domain root:

```apache
# FlyNova .htaccess Configuration

# Enable Rewrite Engine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API Proxy to Node.js Backend
RewriteCond %{REQUEST_URI} ^/api/(.*)$ [NC]
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Next.js Static Files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
</IfModule>
```

### Step 9: Set File Permissions

Via SSH or File Manager:

```bash
# Make scripts executable
chmod +x server/migrations/run.js
chmod +x server/scripts/import-openflights.js

# Ensure uploads directory is writable
chmod 755 public/uploads
chown <your-user>:www-data public/uploads

# Secure .env file
chmod 600 .env
```

### Step 10: Test the Deployment

1. **Test API endpoints:**

```bash
curl https://yourdomain.com/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

2. **Test database connection:**

```bash
curl https://yourdomain.com/api/virtual-airlines
# Should return: {"virtualAirlines":[]}
```

3. **Test frontend:**
   - Visit `https://yourdomain.com`
   - You should see the FlyNova homepage

4. **Test registration:**
   - Go to `/auth/register`
   - Create a test account
   - Check database for new user

### Step 11: Monitor and Maintain

1. **View Application Logs:**
   - hPanel → Node.js → Your Application
   - Click "View Logs"

2. **Restart Application:**
   - hPanel → Node.js
   - Click "Restart"

3. **Monitor Database:**
   - hPanel → MySQL Databases
   - Use phpMyAdmin to check data

## 🔧 Troubleshooting

### API Endpoints Return 502/504

**Problem**: Node.js application not running

**Solution**:
1. Check Node.js application status in hPanel
2. View application logs for errors
3. Verify `.env` database credentials
4. Restart application

### Database Connection Errors

**Problem**: `ECONNREFUSED` or authentication errors

**Solution**:
```bash
# Test database connection
mysql -u u123456789_flynova -p -h localhost
# Enter password

# If connection works, check .env file
# Ensure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are correct
```

### 404 Errors on Frontend Routes

**Problem**: `.htaccess` not configured correctly

**Solution**:
1. Verify `.htaccess` exists in document root
2. Check if `mod_rewrite` is enabled
3. Test with simpler rewrite rules
4. Check file permissions (644 for `.htaccess`)

### File Upload Errors

**Problem**: Permission denied errors

**Solution**:
```bash
# SSH into server
cd public_html/flynova
chmod 755 public/uploads
chown $(whoami):www-data public/uploads
```

### Node.js Application Won't Start

**Problem**: Dependency or syntax errors

**Solution**:
1. View logs in hPanel
2. Check Node.js version compatibility
3. Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install --production
```

### High Memory Usage

**Problem**: Application consuming too much RAM

**Solution**:
1. Optimize Next.js build
2. Enable caching
3. Consider upgrading hosting plan
4. Use PM2 for process management

## 📊 Performance Optimization

### 1. Enable Caching

Add to `.htaccess`:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</IfModule>
```

### 2. Compress Assets

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>
```

### 3. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_flights_user_va ON flights(user_id, va_id);
CREATE INDEX idx_flight_reports_status ON flight_reports(validation_status);
```

### 4. CDN Integration

Consider using Cloudflare (free):
1. Sign up at cloudflare.com
2. Add your domain
3. Update nameservers
4. Enable caching and minification

## 🔒 Security Best Practices

### 1. Secure Environment Variables

```bash
# Set restrictive permissions
chmod 600 .env
```

### 2. Enable HTTPS

In hPanel:
- Go to SSL/TLS
- Install free Let's Encrypt SSL
- Force HTTPS in `.htaccess`

### 3. Database Security

```sql
-- Create user with limited privileges
CREATE USER 'flynova_app'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON flynova.* TO 'flynova_app'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Rate Limiting

Install and configure in `server/index.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 📱 Domain Configuration

### Subdomain Setup (Optional)

To use `api.yourdomain.com` for API:

1. **In hPanel → Domains → Subdomains**
2. Create subdomain: `api`
3. Point to `public_html/flynova/server`
4. Update `.env`:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Hostinger
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ftp.yourdomain.com
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./
          server-dir: /public_html/flynova/
```

## 📞 Support Resources

- **Hostinger Support**: https://support.hostinger.com
- **Node.js Docs**: https://nodejs.org/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **MySQL Docs**: https://dev.mysql.com/doc/

## ✅ Deployment Checklist

- [ ] MySQL database created
- [ ] Files uploaded to server
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] OpenFlights data imported
- [ ] Node.js application started
- [ ] `.htaccess` configured
- [ ] SSL certificate installed
- [ ] API endpoints tested
- [ ] Frontend accessible
- [ ] User registration working
- [ ] File uploads working
- [ ] Logs monitored
- [ ] Backup strategy in place

---

**🎉 Congratulations! Your FlyNova platform is now live!**

For issues or questions, refer to the main README.md or open a support ticket with Hostinger.
