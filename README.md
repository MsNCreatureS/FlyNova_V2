# FlyNova - Virtual Airline Management Platform

![FlyNova Banner](https://img.shields.io/badge/FlyNova-Virtual%20Airline%20Platform-0ea5e9?style=for-the-badge)

A modern, production-ready virtual airline management platform built with Next.js, Express.js, and MySQL. Designed for flight simulation enthusiasts to create, manage, and participate in virtual airlines.

## ✈️ Features

### Core Functionality
- **Virtual Airline Management**: Create and manage your own VA or join existing ones
- **Fleet Management**: Track aircraft using real-world data from OpenFlights
- **Route Planning**: Create routes between thousands of airports worldwide
- **Flight Tracking**: Real-time flight tracking with telemetry data
- **Flight Validation**: Admin approval system for completed flights
- **Points System**: Earn points for validated flights
- **Leaderboards**: Compete with other pilots in your VA
- **Events & Challenges**: Create focus airport challenges and special events
- **Downloads**: Share liveries, tracker software, and resources
- **Achievements**: Unlock achievements based on flight milestones

### User Roles
- **Pilot**: Join VAs, book flights, track flights, earn points
- **Admin**: Manage fleet, routes, validate flights, manage events
- **Owner**: Full VA management + admin privileges

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - RESTful API server
- **MySQL** - Relational database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **MySQL** >= 5.7 or MariaDB >= 10.3
- **npm** or **yarn**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd FlyNova
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Application
NODE_ENV=development
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=flynova

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760

# OpenFlights Data URLs
AIRPORTS_DATA_URL=https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat
AIRCRAFT_DATA_URL=https://raw.githubusercontent.com/jpatokal/openflights/master/data/planes.dat
```

### 4. Create Database

```sql
CREATE DATABASE flynova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Run Migrations

```bash
npm run migrate
```

### 6. Import OpenFlights Data

```bash
npm run import:data
```

This will import:
- ~250 aircraft types
- ~7,500+ airports worldwide

### 7. Create Uploads Directory

```bash
mkdir -p public/uploads
```

## 🏃 Running the Application

### Development Mode

```bash
# Terminal 1: Start API server
npm run server:dev

# Terminal 2: Start Next.js frontend
npm run dev
```

Access the application:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001

### Production Mode

```bash
# Build frontend
npm run build

# Start both servers
npm run server & npm start
```

## 📁 Project Structure

```
FlyNova/
├── database/
│   └── schema.sql                 # Database schema
├── public/
│   └── uploads/                   # File uploads directory
├── server/
│   ├── config/
│   │   └── database.js           # Database connection
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── migrations/
│   │   └── run.js                # Migration runner
│   ├── routes/
│   │   ├── admin.js              # Admin endpoints
│   │   ├── auth.js               # Authentication
│   │   ├── data.js               # Aircraft/Airport data
│   │   ├── downloads.js          # File downloads
│   │   ├── fleet.js              # Fleet management
│   │   ├── flights.js            # Flight operations
│   │   ├── profile.js            # User profiles
│   │   ├── routes.js             # Route management
│   │   └── virtualAirlines.js    # VA management
│   ├── scripts/
│   │   └── import-openflights.js # Data import script
│   └── index.js                   # Express server
├── src/
│   └── app/
│       ├── auth/
│       │   ├── login/            # Login page
│       │   └── register/         # Registration page
│       ├── globals.css           # Global styles
│       ├── layout.tsx            # Root layout
│       └── page.tsx              # Homepage
├── .env.example                   # Environment template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Virtual Airlines
- `GET /api/virtual-airlines` - List all VAs
- `POST /api/virtual-airlines` - Create VA (protected)
- `GET /api/virtual-airlines/:vaId` - Get VA details
- `POST /api/virtual-airlines/:vaId/join` - Join VA (protected)
- `GET /api/virtual-airlines/:vaId/leaderboard` - Get leaderboard
- `PUT /api/virtual-airlines/:vaId` - Update VA (admin)

### Fleet Management
- `GET /api/fleet/:vaId` - Get VA fleet
- `POST /api/fleet/:vaId` - Add aircraft (admin)
- `PUT /api/fleet/:vaId/:fleetId` - Update aircraft (admin)
- `DELETE /api/fleet/:vaId/:fleetId` - Remove aircraft (admin)

### Routes
- `GET /api/routes/:vaId` - Get VA routes
- `POST /api/routes/:vaId` - Create route (admin)
- `PUT /api/routes/:vaId/:routeId` - Update route (admin)
- `DELETE /api/routes/:vaId/:routeId` - Delete route (admin)

### Flights
- `GET /api/flights/my-flights` - Get user flights (protected)
- `POST /api/flights/reserve` - Reserve flight (protected)
- `POST /api/flights/:flightId/start` - Start flight (protected)
- `POST /api/flights/:flightId/report` - Submit flight report (protected)
- `GET /api/flights/active/:vaId` - Get active flights

### Admin
- `GET /api/admin/:vaId/pending-reports` - Get pending reports (admin)
- `POST /api/admin/:vaId/validate-report/:reportId` - Validate flight (admin)
- `GET /api/admin/:vaId/members` - Get VA members (admin)
- `PUT /api/admin/:vaId/members/:memberId` - Update member (owner)
- `GET /api/admin/:vaId/events` - Get events
- `POST /api/admin/:vaId/events` - Create event (admin)
- `PUT /api/admin/:vaId/events/:eventId` - Update event (admin)
- `DELETE /api/admin/:vaId/events/:eventId` - Delete event (admin)
- `GET /api/admin/:vaId/statistics` - Get statistics (admin)

### Downloads
- `GET /api/downloads/:vaId` - Get downloads
- `POST /api/downloads/:vaId/upload` - Upload file (admin)
- `DELETE /api/downloads/:vaId/:downloadId` - Delete download (admin)
- `POST /api/downloads/:vaId/:downloadId/track` - Track download

### Data
- `GET /api/data/aircraft` - Get all aircraft
- `GET /api/data/aircraft/search?q=` - Search aircraft
- `GET /api/data/airports` - Get all airports
- `GET /api/data/airports/search?q=` - Search airports

### Profile
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile/me` - Update profile (protected)

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts
- **virtual_airlines** - Virtual airlines
- **va_members** - VA membership with roles and stats
- **aircraft** - Aircraft types from OpenFlights
- **airports** - Airports from OpenFlights
- **va_fleet** - VA aircraft fleet
- **va_routes** - VA routes
- **flights** - Flight bookings
- **flight_reports** - Flight telemetry and validation
- **events** - VA events and challenges
- **downloads** - File downloads
- **achievements** - Achievement definitions
- **user_achievements** - User-earned achievements

See `database/schema.sql` for complete schema with relationships.

## 🌐 Hostinger Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Checklist

1. ✅ Upload files via FTP/File Manager
2. ✅ Create MySQL database in hPanel
3. ✅ Update `.env` with production values
4. ✅ Run migrations: `node server/migrations/run.js`
5. ✅ Import data: `node server/scripts/import-openflights.js`
6. ✅ Build frontend: `npm run build`
7. ✅ Configure `.htaccess` for routing
8. ✅ Start Node.js application in hPanel
9. ✅ Test all endpoints

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CORS**: Configured for specific origins
- **File Upload Validation**: Type and size limits
- **Role-Based Access Control**: Granular permissions

## 🎨 Design Philosophy

- **Aviation-Themed**: Blue color palette, clean design
- **Minimalist UI**: No information overload
- **Responsive**: Optimized for all devices
- **Modern**: Inspired by airline booking systems
- **Professional**: Production-ready code quality

## 📱 Tracker Integration

The platform is designed to integrate with a flight tracker (desktop application):

### Flight Tracker Workflow
1. Pilot reserves a flight in FlyNova
2. Launches tracker application
3. Tracker monitors flight simulator
4. On landing, tracker sends data to API
5. Admin validates the flight
6. Pilot earns points

### Tracker API Endpoints
- `POST /api/flights/:flightId/start` - Mark flight as in progress
- `POST /api/flights/:flightId/report` - Submit telemetry data

### Flight Report Data Structure
```json
{
  "actualDepartureTime": "2025-10-22T14:30:00Z",
  "actualArrivalTime": "2025-10-22T16:45:00Z",
  "flightDuration": 135,
  "distanceFlown": 450.5,
  "fuelUsed": 1250.3,
  "landingRate": -120,
  "telemetryData": {
    "maxAltitude": 35000,
    "maxSpeed": 450,
    "route": [...],
    "events": [...]
  }
}
```

## 🛠️ Development

### Adding New Features

1. **Database**: Update `database/schema.sql`
2. **API**: Add routes in `server/routes/`
3. **Frontend**: Create pages in `src/app/`
4. **Types**: Update TypeScript interfaces

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Formatting**: Consistent indentation
- **Naming**: camelCase for JS, PascalCase for components

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL service
mysql -u root -p

# Verify credentials in .env
# Ensure DB_HOST is correct (localhost vs 127.0.0.1)
```

### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change PORT in .env
```

### Migration Errors
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS flynova; CREATE DATABASE flynova;"

# Re-run migrations
npm run migrate
```

## 📄 License

This project is open-source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues and questions:
- Open a GitHub issue
- Check existing documentation
- Review API endpoints

## 🙏 Acknowledgments

- **OpenFlights** - Aircraft and airport data
- **Next.js Team** - Amazing framework
- **Flight Simulation Community** - Inspiration

---

**Built with ❤️ for the virtual aviation community**

🌐 **Website**: [Your Domain]  
📖 **Documentation**: [Docs Link]  
💬 **Community**: [Discord/Forum Link]
