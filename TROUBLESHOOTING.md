# Troubleshooting Guide

This guide helps resolve common issues encountered during setup and development of the Jenkins Dashboard.

## 🚀 Quick Setup

### 1. Automated Setup
```bash
# Run the automated setup script
./setup.sh
```

### 2. Manual Setup
```bash
# Install all dependencies
npm run install-all

# Create environment file
cp env.example .env

# Start database services
docker-compose up -d postgres redis

# Run database migrations
cd server && npm run db:migrate && cd ..

# Start development servers
npm run dev
```

## 🔧 Common Issues & Solutions

### TypeScript Compilation Errors

#### Issue: "Cannot find module" errors
**Solution:**
```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json

# Reinstall
npm run install-all
```

#### Issue: TypeScript version conflicts
**Solution:**
```bash
# Check TypeScript versions
npm list typescript
cd client && npm list typescript
cd ../server && npm list typescript

# Ensure consistent versions (use 4.9.5 for React compatibility)
npm install typescript@4.9.5
cd client && npm install typescript@4.9.5
cd ../server && npm install typescript@4.9.5
```

### Database Connection Issues

#### Issue: "DATABASE_URL not found"
**Solution:**
```bash
# Ensure .env file exists in server directory
cp .env server/.env

# Check DATABASE_URL format
# Should be: postgresql://postgres:postgres@localhost:5432/jenkins_dashboard
```

#### Issue: "Connection refused" for PostgreSQL
**Solution:**
```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Check if container is running
docker ps

# Check logs
docker-compose logs postgres
```

#### Issue: Prisma migration errors
**Solution:**
```bash
# Generate Prisma client
cd server && npm run db:generate

# Run migrations
npm run db:migrate

# If issues persist, reset database
docker-compose down -v
docker-compose up -d postgres
npm run db:migrate
```

### React Development Issues

#### Issue: "Proxy error: Could not proxy request"
**Solution:**
```bash
# Check if server is running on port 3001
lsof -i :3001

# Ensure proxy configuration in client/package.json
# Should have: "proxy": "http://localhost:3001"
```

#### Issue: "Module not found" errors in React
**Solution:**
```bash
# Clear React cache
cd client
rm -rf node_modules/.cache
npm start
```

#### Issue: Material-UI icon errors
**Solution:**
```bash
# Check icon imports - use correct names
# Correct: Clear (not Clean)
# Correct: color="inherit" (not color="default")
```

### Server Development Issues

#### Issue: "Redis connection failed"
**Solution:**
```bash
# Start Redis container
docker-compose up -d redis

# Check Redis connection
docker exec -it jenkins_dashboard_redis redis-cli ping
```

#### Issue: "JWT_SECRET not found"
**Solution:**
```bash
# Ensure .env file has JWT_SECRET
echo "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" >> .env
```

#### Issue: "Port already in use"
**Solution:**
```bash
# Check what's using the port
lsof -i :3001

# Kill the process or change port in .env
# PORT=3002
```

### Docker Issues

#### Issue: "Permission denied" for Docker
**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again, or run:
newgrp docker
```

#### Issue: "Container name already exists"
**Solution:**
```bash
# Remove existing containers
docker-compose down
docker rm -f jenkins_dashboard_postgres jenkins_dashboard_redis
```

### Environment Variables

#### Issue: Environment variables not loading
**Solution:**
```bash
# Check .env file location
ls -la .env

# Ensure .env is in root directory
# Copy to server directory if needed
cp .env server/.env
```

#### Issue: "Missing required configuration"
**Solution:**
```bash
# Check required variables in .env
cat .env | grep -E "(JENKINS_USER|JENKINS_TOKEN|JENKINS_BASE_URL)"

# Ensure all required variables are set
```

## 🐛 Debug Mode

### Enable Debug Logging
```bash
# Set debug level in .env
LOG_LEVEL=debug

# Restart server
npm run dev
```

### Check Server Logs
```bash
# View server logs
cd server && npm run dev

# Check Docker logs
docker-compose logs -f
```

### Check Client Logs
```bash
# Open browser developer tools
# Check Console tab for errors
# Check Network tab for failed requests
```

## 🔄 Reset Everything

If you need to start completely fresh:

```bash
# Stop all services
docker-compose down -v

# Remove all node_modules
rm -rf node_modules client/node_modules server/node_modules

# Remove lock files
rm -f package-lock.json client/package-lock.json server/package-lock.json

# Remove build artifacts
rm -rf client/build server/dist

# Remove environment files
rm -f .env server/.env

# Start fresh
./setup.sh
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the logs** - Look for specific error messages
2. **Verify versions** - Ensure Node.js 18+ and compatible package versions
3. **Check network** - Ensure ports 3000, 3001, 5432, 6379 are available
4. **Review configuration** - Double-check .env file settings

## 🎯 Common Success Patterns

### Working Setup Checklist
- [ ] Node.js 18+ installed
- [ ] Docker and Docker Compose installed
- [ ] All dependencies installed (`npm run install-all`)
- [ ] .env file configured with Jenkins credentials
- [ ] PostgreSQL and Redis containers running
- [ ] Database migrations completed
- [ ] Server starts without errors
- [ ] Client starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:3001/health

### Performance Tips
- Use `npm run dev` for development (concurrent client/server)
- Use `docker-compose --profile production up -d` for production
- Monitor memory usage with large Jenkins instances
- Consider increasing `RATE_LIMIT_MAX_REQUESTS` for high-traffic setups 