# FlyNova - Quick Start Guide

Get FlyNova up and running in 5 minutes!

## Prerequisites

- **Node.js** 18+ installed ([Download](https://nodejs.org))
- **MySQL** or **MariaDB** installed
- **Git** (optional, for cloning)

## Installation Steps

### 1. Get the Code

```bash
# Clone or download the repository
cd path/to/FlyNova
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages for both frontend and backend.

### 3. Configure Environment

**Option A: Use Setup Wizard (Recommended)**

```bash
node setup.js
```

Follow the prompts to automatically configure your environment.

**Option B: Manual Setup**

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
# Update database credentials and other settings
```

### 4. Create Database

If you didn't use the setup wizard:

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE flynova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 5. Run Migrations

```bash
npm run migrate
```

This creates all database tables and adds default achievements.

### 6. Import Data

```bash
npm run import:data
```

This imports ~250 aircraft types and 7,500+ airports from OpenFlights.

**Note**: This may take 2-5 minutes. Be patient!

### 7. Start the Application

**Terminal 1 - API Server:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 8. Open in Browser

Visit **http://localhost:3000**

You should see the FlyNova homepage! 🎉

## Create Your First Virtual Airline

1. **Register an account** at http://localhost:3000/auth/register
2. **Login** with your credentials
3. Click **"Create Virtual Airline"** (you can only create one!)
4. Fill in the details:
   - Name: "My Virtual Airlines"
   - Callsign: "MVA"
   - ICAO: "MVA"
   - Description: Your airline description

## Add Aircraft to Your Fleet

1. Go to **Admin Panel** → **Fleet Management**
2. Click **"Add Aircraft"**
3. Search for an aircraft (e.g., "Boeing 737")
4. Enter registration number (e.g., "N123AB")
5. Select home airport
6. Save

## Create Routes

1. Go to **Admin Panel** → **Route Management**
2. Click **"Create Route"**
3. Fill in:
   - Flight Number: "MVA001"
   - Departure Airport: Search "KLAX" (Los Angeles)
   - Arrival Airport: Search "KJFK" (New York)
   - Aircraft: Select from your fleet
4. Save

## Book and Fly

1. Go to **Dashboard**
2. Browse **Available Routes**
3. Click **"Book Flight"**
4. Select aircraft from fleet
5. Flight is now reserved!
6. Launch tracker (when ready) to fly

## Default Test Account

For quick testing without registration:

```
Email: test@flynova.com
Password: test123456
```

(Create this manually through registration)

## Common Issues

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3002  # Or any available port

# Restart servers
```

### Database Connection Error

```bash
# Check MySQL is running
sudo service mysql status  # Linux
# or
net start MySQL  # Windows

# Verify credentials in .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=flynova
```

### "Cannot find module" Error

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Migration Fails

```bash
# Reset database
mysql -u root -p -e "DROP DATABASE IF EXISTS flynova; CREATE DATABASE flynova;"

# Run migrations again
npm run migrate
```

## Project Structure

```
FlyNova/
├── server/              # Backend (Express.js)
│   ├── routes/         # API endpoints
│   ├── config/         # Database config
│   ├── middleware/     # Auth middleware
│   ├── migrations/     # DB migrations
│   └── scripts/        # Utility scripts
├── src/                # Frontend (Next.js)
│   └── app/           # Pages and components
├── database/           # SQL schemas
├── public/            # Static files
│   └── uploads/       # User uploads
└── .env               # Environment config
```

## Development Workflow

1. **Make changes** to code
2. **Frontend auto-reloads** (Next.js)
3. **Backend needs restart** for changes
   - Use `npm run server:dev` for auto-restart with nodemon

## API Testing

Use the API at `http://localhost:3001/api`

**Test health endpoint:**
```bash
curl http://localhost:3001/api/health
```

**Should return:**
```json
{"status":"ok","timestamp":"2025-10-22T..."}
```

## Next Steps

- ✅ Read the full [README.md](./README.md)
- ✅ Check [API Documentation](./API.md)
- ✅ Review [Deployment Guide](./DEPLOYMENT.md)
- ✅ Build a [Flight Tracker](./TRACKER.md)

## Getting Help

- **Check existing docs** first
- **Review error messages** carefully
- **Search GitHub issues**
- **Ask in community forums**

## Production Deployment

When ready to deploy:

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Set `NODE_ENV=production`
3. Build frontend: `npm run build`
4. Use production database
5. Enable HTTPS
6. Set strong JWT_SECRET
7. Configure backups

---

**Welcome to FlyNova! Happy Flying! ✈️**

Need help? Check the docs or open an issue on GitHub.
