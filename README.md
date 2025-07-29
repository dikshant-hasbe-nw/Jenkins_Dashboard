# Jenkins Dashboard

A modern, full-stack Jenkins Dashboard built with React, Node.js, and PostgreSQL. Monitor and analyze Jenkins jobs and pipelines with advanced insights and cleanup recommendations.

## 🚀 Features

- **📊 Real-time Dashboard**: Live monitoring of Jenkins jobs with success/failure rates
- **🧹 Cleanup Insights**: Identify test jobs, inactive jobs, and disabled pipelines
- **📈 Advanced Analytics**: Build duration analysis, performance insights, and outlier detection
- **🔍 Smart Filtering**: Search and filter jobs by name, folder, or status
- **💾 Database Storage**: PostgreSQL with Prisma ORM for reliable data persistence
- **🔄 Real-time Updates**: WebSocket integration for live data updates
- **🔐 Authentication**: JWT-based authentication with role-based access control
- **📱 Responsive Design**: Modern UI built with Material-UI
- **🐳 Docker Ready**: Complete containerization with Docker Compose
- **📊 Interactive Charts**: Beautiful visualizations with Chart.js

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript
- **Material-UI** for modern UI components
- **React Query** for server state management
- **React Router** for navigation
- **Socket.io Client** for real-time updates
- **Chart.js** for data visualizations
- **Zustand** for client state management

### Backend (Node.js + TypeScript)
- **Express.js** with TypeScript
- **Prisma ORM** for database operations
- **PostgreSQL** for data persistence
- **Redis** for caching and sessions
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Winston** for logging
- **Helmet** for security

### Infrastructure
- **Docker** and **Docker Compose** for containerization
- **Nginx** for production serving
- **PostgreSQL** for primary database
- **Redis** for caching and sessions

## 📦 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL (for development)
- Redis (for development)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Jenkins_Dashboard
```

### 2. Environment Configuration
```bash
cp env.example .env
# Edit .env with your Jenkins credentials and other settings
```

### 3. Install Dependencies
```bash
npm run install-all
```

### 4. Start Database Services
```bash
docker-compose up -d postgres redis
```

### 5. Database Setup
```bash
cd server
npm run db:generate
npm run db:migrate
```

### 6. Start Development Servers
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 🔧 Configuration

### Required Environment Variables
```bash
# Jenkins API Configuration
JENKINS_USER=your-jenkins-username
JENKINS_TOKEN=your-jenkins-api-token
JENKINS_BASE_URL=https://your-jenkins-instance.com/

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jenkins_dashboard
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret-key
```

### Optional Configuration
```bash
# Dashboard Settings
DASHBOARD_TITLE=Jenkins Dashboard
INACTIVE_JOB_THRESHOLD_DAYS=60
ITEMS_PER_PAGE_DEFAULT=50

# Test Job Detection
TEST_JOB_KEYWORDS=test,testing,tst,demo,trial,experiment
TEST_JOB_EXCLUDE_WORDS=latest,saastest,attest,contest,detest,protest

# Timezone
TIMEZONE=UTC
TIMEZONE_DISPLAY_FORMAT=%d %b %H:%M %Z
```

## 🐳 Production Deployment

### Using Docker Compose
```bash
# Build and start all services
docker-compose --profile production up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment
```bash
# Build frontend
cd client && npm run build

# Build backend
cd server && npm run build

# Start services
npm start
```

## 📊 Key Features Explained

### Dashboard Overview
- **KPI Cards**: Total jobs, success rate, failure rate, average build duration
- **Build Status Distribution**: Visual breakdown of job statuses
- **Jobs by Folder**: Distribution of jobs across folders
- **Interactive Data Table**: Sortable, filterable job list with pagination

### Cleanup Insights
- **Test Jobs**: Identifies jobs with test-related keywords
- **Inactive Jobs**: Shows jobs not triggered for configurable days
- **Disabled Jobs**: Lists all disabled pipelines
- **Cleanup Recommendations**: Actionable suggestions for each job type

### Advanced Analytics
- **Build Duration Analysis**: Statistical analysis of build times
- **Outlier Detection**: Identifies jobs with unrealistic build durations
- **Performance Insights**: Success rate trends and build frequency analysis

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Jenkins Data
- `GET /api/jenkins/jobs` - Get all Jenkins jobs
- `POST /api/jenkins/sync` - Sync data from Jenkins

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/widgets` - Get dashboard widgets

### Analytics
- `GET /api/analytics/performance` - Get performance analytics
- `GET /api/analytics/cleanup` - Get cleanup insights

### Webhooks
- `POST /api/webhooks/jenkins` - Handle Jenkins webhooks

## 🛠️ Development

### Project Structure
```
Jenkins_Dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── services/      # Business logic
│   └── prisma/           # Database schema
├── docker-compose.yml     # Docker services
└── README.md             # This file
```

### Available Scripts
```bash
# Root level
npm run install-all        # Install all dependencies
npm run dev               # Start development servers
npm run build             # Build for production

# Server
cd server
npm run dev               # Start development server
npm run build             # Build TypeScript
npm run db:migrate        # Run database migrations
npm run db:generate       # Generate Prisma client

# Client
cd client
npm start                 # Start development server
npm run build             # Build for production
```

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Role-based Access Control** (RBAC)
- **Rate Limiting** to prevent abuse
- **Helmet.js** for security headers
- **Input Validation** with express-validator
- **CORS Configuration** for cross-origin requests
- **Session Management** with Redis

## 📈 Performance Features

- **Redis Caching** for frequently accessed data
- **Database Indexing** for fast queries
- **Compression** for API responses
- **Lazy Loading** for large datasets
- **Pagination** for data tables
- **Real-time Updates** via WebSockets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [Configuration Guide](CONFIGURATION.md)
- Review the API documentation
- Open an issue on GitHub

## 🔄 Migration from Streamlit

This modern web stack version maintains all the functionality of the original Streamlit app while providing:

- **Better Performance**: React's virtual DOM and optimized rendering
- **Real-time Updates**: WebSocket integration for live data
- **Scalability**: Microservices architecture with separate frontend/backend
- **Modern UI**: Material-UI components with responsive design
- **Database**: PostgreSQL with Prisma ORM for better data management
- **Authentication**: JWT-based auth with role-based access
- **Deployment**: Docker containerization for easy deployment
- **Monitoring**: Built-in logging and error tracking 