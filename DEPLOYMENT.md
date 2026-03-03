# PrintPass Frontend - Architecture & Deployment Guide

## Architecture Overview

### Technology Stack

```
Frontend (React 18 + TypeScript)
    ↓
Vite (Build Tool)
    ↓
Tailwind CSS (Styling)
    ↓
React Router v6 (Routing)
    ↓
Zustand (State Management)
    ↓
Axios (HTTP Client)
    ↓
API Gateway (http://localhost:8080)
    ↓
Microservices (User, Shop, Job)
    ↓
Database & Cloud Storage
```

## Component Hierarchy

```
App (Main Router)
├── Navbar
└── Routes
    ├── / (HomePage)
    ├── /login (LoginPage)
    ├── /register (RegisterPage)
    ├── /dashboard (Dashboard - Role Based)
    │   ├── StudentDashboard
    │   └── VendorDashboard
    ├── /shops (ShopsPage)
    ├── /create-job (CreateJobPage)
    ├── /job/:jobId (JobDetailPage)
    ├── /verify-job (VerifyJobPage)
    └── * (404 Route)
```

## State Management Flow

```
┌─────────────────────────────────────────┐
│         Global State (Zustand)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Auth Store                 │   │
│  │  - user (User | null)           │   │
│  │  - token (string | null)        │   │
│  │  - isLoading (boolean)          │   │
│  │  - login()                      │   │
│  │  - logout()                     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Job Store                  │   │
│  │  - jobs (JobResponse[])         │   │
│  │  - selectedJob (JobResponse)    │   │
│  │  - updateJob()                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Shop Store                 │   │
│  │  - shops (ShopResponse[])       │   │
│  │  - selectedShop (ShopResponse)  │   │
│  │  - createShop()                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
User Input (Login/Register)
    ↓
Form Validation (useFormValidation)
    ↓
API Call (userApi.login/register)
    ↓
Backend Processing
    ↓
Token + User Response
    ↓
Store in AuthStore + localStorage
    ↓
Set API Headers (Authorization: Bearer token)
    ↓
Redirect to Dashboard
```

### Job Creation Flow

```
Student Fills Form
    ↓
Select Shop → Validate Input
    ↓
Upload File → Create FormData
    ↓
API Call (jobApi.create)
    ↓
Backend Processing:
  - Store Job
  - Generate PIN
  - Deduct from Wallet
  - Upload File
    ↓
Response with PIN
    ↓
Update JobStore
    ↓
Display Success & PIN
```

### Job Verification Flow (Vendor)

```
Vendor Enters PIN
    ↓
API Call (jobApi.verifyPin)
    ↓
Backend Fetches Job by PIN
    ↓
Display Job Details
    ↓
Vendor Updates Status
    ↓
API Call (jobApi.updateStatus)
    ↓
Backend Updates Status + Deletes File (if COMPLETED)
    ↓
Success Response
```

## API Integration

### Request/Response Interceptors

```typescript
// Request Interceptor
- Add Authorization header with token
- Set Content-Type

// Response Interceptor
- Check for 401 (Unauthorized)
- Auto-logout if unauthorized
- Return response data or throw error
```

### Error Handling

```
API Error
    ↓
ApiErrorHandler.handle()
    ↓
Map Status to Message:
  - 400 → Bad request
  - 401 → Unauthorized (logout)
  - 403 → Forbidden
  - 404 → Not found
  - 500 → Server error
    ↓
Display Error to User
```

## File Structure Best Practices

### Separation of Concerns

```
components/     → UI Components (Reusable)
pages/          → Page Components (Route-level)
services/       → API Communication
store/          → State Management
hooks/          → Custom Logic
types/          → TypeScript Types
utils/          → Helper Functions
```

### Component Size Guidelines

- **Small Components** (< 300 lines): Simple UI elements
- **Medium Components** (300-800 lines): Feature components
- **Large Components** (> 800 lines): Consider splitting

## Performance Optimization

### 1. Code Splitting (Automatic with Vite)
```typescript
// Lazy loading routes
const HomePage = lazy(() => import('./pages/HomePage'))
```

### 2. Image Optimization
- Use appropriate image formats
- Compress images before upload
- Use responsive images

### 3. Bundle Analysis
```bash
npm install --save-dev rollup-plugin-visualizer
```

### 4. Caching Strategies
- LocalStorage for user data
- SessionStorage for temporary data
- Browser cache for static assets

## Deployment Strategies

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_API_URL
```

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api_url"
  }
}
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[env.production]
  VITE_API_URL = "https://api.printpass.com/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Docker

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
ENV VITE_API_URL=http://localhost:8080/api
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:8080/api
    depends_on:
      - api-gateway
```

### Option 4: Traditional Server (Nginx)

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name printpass.com;

    root /var/www/printpass-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://api-gateway:8080;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Environment Configuration

### Development (.env.local)
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_ENV=development
```

### Staging (.env.staging)
```env
VITE_API_URL=https://staging-api.printpass.com/api
VITE_APP_ENV=staging
```

### Production (.env.production)
```env
VITE_API_URL=https://api.printpass.com/api
VITE_APP_ENV=production
```

## Security Checklist

### Frontend
- ✅ Remove sensitive data from code
- ✅ Use environment variables for API URLs
- ✅ Validate all user inputs
- ✅ Sanitize API responses
- ✅ Use HTTPS in production
- ✅ Implement CSP headers
- ✅ Use secure cookie flags

### API Communication
- ✅ Always use HTTPS
- ✅ Validate tokens
- ✅ Implement CORS properly
- ✅ Add rate limiting
- ✅ Use strong JWT secrets
- ✅ Implement refresh tokens

### Code
- ✅ No hardcoded credentials
- ✅ Use secret management
- ✅ Regular dependency updates
- ✅ Code reviews before deployment
- ✅ Security scanning (npm audit)

## Monitoring & Analytics

### Setup Google Analytics
```typescript
// Add to main.tsx
import ReactGA from 'react-ga4'
ReactGA.initialize('G-XXXXXXXXXX')
```

### Setup Error Tracking (Sentry)
```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://...@sentry.io/...',
  environment: import.meta.env.VITE_APP_ENV,
})
```

## Performance Metrics

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Monitor with:
- Lighthouse (built-in Chrome DevTools)
- WebPageTest
- GTmetrix

## CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Rollback Procedure

If deployment fails:

1. Revert commit
2. Trigger new deployment
3. Verify with smoke tests
4. Monitor error rates
5. Notify team

## Post-Deployment Checklist

- [ ] Run smoke tests
- [ ] Verify all features work
- [ ] Check error logs
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Verify API connectivity
- [ ] Check performance metrics
- [ ] Monitor error rates
- [ ] Update documentation
- [ ] Communicate with team

## Troubleshooting Deployment

### White Screen of Death
- Check console for errors
- Verify API URL in environment
- Check CORS configuration
- Clear browser cache

### 404 on Refresh
- Configure server to redirect to index.html
- Check Nginx/Apache routing rules

### API Connection Issues
- Verify API gateway is running
- Check CORS headers
- Verify environment variables
- Check firewall rules

## Maintenance

### Regular Tasks
- Update dependencies (npm update)
- Review error logs
- Monitor performance
- Test backup/restore
- Review security updates

### Weekly
- Check error rates
- Review user feedback
- Monitor performance metrics

### Monthly
- Update dependencies
- Security audit
- Performance optimization
- Capacity planning

---

**Ready to Deploy! 🚀**

