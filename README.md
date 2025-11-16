# Task Manager - Full Stack Application

A complete task management solution with Express.js backend and React Native frontend.

## Project Structure

```
task-manager/
├── backend/                 # Express.js API server
│   ├── package.json
│   ├── .env                # Environment variables
│   ├── server.js           # Express server entrypoint
│   ├── db.js              # Turso database client
│   ├── routes/            # API routes
│   ├── migrations/        # Database migrations
│   ├── scripts/           # Utility scripts
│   └── backups/           # JSON backups directory
└── frontend/               # React Native mobile app
    ├── package.json
    ├── App.js             # React Native entry point
    ├── src/
    │   ├── components/    # UI components
    │   ├── screens/       # App screens
    │   ├── services/      # API services
    │   ├── types/         # TypeScript definitions
    │   └── utils/         # Utilities and config
    └── assets/            # App assets (icons, images)
```

## Quick Start

### 1. Backend Setup

```bash
# Install backend dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Turso credentials

# Test database connection
npm run test-connection

# Run database migrations
npm run migrate

# Start the backend server
npm start
# or for development:
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the React Native development server
npm start

# Run on specific platforms
npm run android    # Android
npm run ios        # iOS (macOS required)
npm run web        # Web browser
```

## Features

### Backend API
- ✅ RESTful API with Express.js
- ✅ Turso database integration
- ✅ Complete CRUD operations for tasks
- ✅ Database migrations
- ✅ Environment configuration
- ✅ Error handling and validation
- ✅ Connection testing utilities

### Frontend Mobile App
- 📱 Cross-platform (iOS, Android, Web)
- ✨ Modern, intuitive UI
- 🔄 Real-time data synchronization
- 📋 Full task management features
- 🎯 Status tracking (Pending, In Progress, Completed)
- 🔍 Detailed task views
- 📱 Responsive design
- ♿ Accessibility support

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm run test-connection` - Test database connection

### Frontend
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser

## Setup Instructions

### Prerequisites
- Node.js 16.x or later
- Turso database account and credentials
- Expo CLI (for React Native development)

### Backend Configuration

1. **Get Turso credentials:**
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Login to Turso
   turso auth login
   
   # Create database (if needed)
   turso db create your-database-name
   
   # Get database URL
   turso db show your-database-name --url
   
   # Create auth token
   turso db tokens create your-database-name
   ```

2. **Configure environment variables:**
   ```env
   TURSO_DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your_auth_token_here
   PORT=3000
   ```

### Frontend Configuration

1. **Update API configuration:**
   Edit `frontend/src/utils/config.ts`:
   ```typescript
   export const Config = {
     API_BASE_URL: 'http://localhost:3000/api', // Your backend URL
   };
   ```

2. **For mobile device testing:**
   Replace `localhost` with your computer's IP address.

## Development Workflow

1. **Start the backend:**
   ```bash
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Test on devices:**
   - Install Expo Go app
   - Scan QR code displayed in terminal
   - App loads on your device

## Troubleshooting

### Backend Issues
- **401 Unauthorized**: Check your Turso auth token
- **Connection failed**: Verify database URL and network access
- **Migration errors**: Ensure database permissions are correct

### Frontend Issues
- **Cannot connect to API**: Check API_BASE_URL configuration
- **Metro bundler issues**: Try `npm start -- --clear`
- **Device connection**: Use IP address instead of localhost

### Network Configuration
For mobile development, ensure your computer and mobile device are on the same network, and update the API URL to use your computer's IP address.

## Production Deployment

### Backend
- Deploy to services like Railway, Render, or Vercel
- Configure environment variables in deployment platform
- Ensure Turso database is accessible

### Frontend
- Build web version: `npm run build:web`
- Build mobile apps using Expo Application Services (EAS)
- Configure app stores distribution

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.