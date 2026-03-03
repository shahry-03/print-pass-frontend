# PrintPass Frontend - Setup Guide

## Complete Installation & Development Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Step 1: Navigate to Frontend Directory

```bash
cd D:\PrintPass\frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- React 18
- React Router v6
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Zustand

### Step 3: Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your backend API URL (if different from default):
```env
VITE_API_URL=http://localhost:8080/api
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### Step 5: Verify Backend Connection

Before using the app, ensure:
1. Backend is running on `http://localhost:8080`
2. Eureka Discovery Server is running on `http://localhost:8761`
3. All microservices (user-service, shop-service, job-service) are running

## Project Structure

```
printpass-frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── common/
│   │       └── Feedback.tsx  # Alert/Loading/Error components
│   │
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── ShopsPage.tsx
│   │   │   └── CreateJobPage.tsx
│   │   └── vendor/
│   │       ├── VendorDashboard.tsx
│   │       └── VerifyJobPage.tsx
│   │
│   ├── services/           # API services
│   │   └── api.ts          # API client with interceptors
│   │
│   ├── store/              # Zustand state management
│   │   └── index.ts        # Auth, Job, Shop stores
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── index.ts        # useJobs, useShops, useFormValidation
│   │
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # All API types and interfaces
│   │
│   ├── utils/              # Utility functions
│   │   ├── helpers.ts      # Format, validation, storage helpers
│   │   ├── errorHandler.ts # API error handling
│   │   └── toast.ts        # Toast notifications
│   │
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # React DOM render
│   └── index.css           # Global styles
│
├── public/                 # Static assets
├── index.html             # HTML entry point
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
└── README.md              # Documentation
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint
```

## Feature Walkthrough

### For Students

1. **Register/Login**
   - Go to `/register` to create an account
   - Select "STUDENT" as account type
   - Fill in your details

2. **Browse Shops**
   - Visit `/shops` to see all available print shops
   - Check location, pricing, and availability

3. **Create Print Job**
   - Click "New Job" or select a shop
   - Upload your document (PDF, DOC, DOCX, TXT)
   - Set number of pages and color preference
   - Get your unique PIN
   - Pay through wallet (balance deducted automatically)

4. **Track Job Status**
   - Dashboard shows all your jobs
   - Status updates: PENDING → PROCESSING → READY → COMPLETED
   - Download completed files if needed

### For Vendors

1. **Register/Login**
   - Go to `/register` to create an account
   - Select "VENDOR" as account type

2. **Manage Shops**
   - View your shops in dashboard
   - Each shop shows location, pricing, and status

3. **Verify and Process Jobs**
   - Go to `/verify-job`
   - Enter customer's PIN to find their job
   - Update job status through the workflow
   - Download customer's file to print

4. **Job Lifecycle**
   - PENDING: New job awaiting processing
   - PROCESSING: Currently being printed
   - READY: Ready for pickup
   - COMPLETED: Job completed and handed to customer
   - CANCELLED: Job cancelled by vendor or customer

## API Integration

### Authentication Flow

```typescript
// 1. User logs in
POST /api/users/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response includes token
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "walletBalance": 500.00
  }
}

// 2. Token is stored and used in all requests
Authorization: Bearer <token>
```

### Create Job Flow

```typescript
// 1. Prepare FormData
const formData = new FormData()
formData.append('studentId', userId)
formData.append('shopId', shopId)
formData.append('documentName', 'My Document')
formData.append('totalPages', 10)
formData.append('isColor', false)
formData.append('file', fileObject)

// 2. Send to backend
POST /api/jobs
Content-Type: multipart/form-data
Authorization: Bearer <token>

// 3. Response includes job details and PIN
{
  "id": 1,
  "studentId": 1,
  "shopId": 1,
  "documentName": "My Document",
  "totalPages": 10,
  "totalCost": 50.00,
  "status": "PENDING",
  "pin": "ABC123"
}
```

### Job Status Update

```typescript
// Update from vendor dashboard
PUT /api/jobs/{jobId}/status?newStatus=PROCESSING
Authorization: Bearer <token>
```

## State Management (Zustand)

### Auth Store

```typescript
import { useAuthStore } from '@/store'

const { user, token, login, logout, isLoading } = useAuthStore()
```

### Job Store

```typescript
import { useJobStore } from '@/store'

const { jobs, selectedJob, setJobs, addJob, updateJob } = useJobStore()
```

### Shop Store

```typescript
import { useShopStore } from '@/store'

const { shops, selectedShop, setShops, addShop } = useShopStore()
```

## Custom Hooks

### useJobs()

```typescript
const {
  jobs,
  isLoading,
  error,
  fetchJobs,
  createJob,
  updateJobStatus,
  verifyPin
} = useJobs()
```

### useShops()

```typescript
const {
  shops,
  isLoading,
  error,
  fetchShops,
  createShop
} = useShops()
```

### useFormValidation()

```typescript
const {
  values,
  errors,
  touched,
  isSubmitting,
  handleChange,
  handleBlur,
  handleSubmit,
  resetForm
} = useFormValidation(initialValues, onSubmit)
```

## Styling with Tailwind CSS

The project uses Tailwind CSS for styling. Common classes used:

```html
<!-- Container -->
<div class="container">

<!-- Buttons -->
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-danger">Danger</button>

<!-- Forms -->
<input class="input-field" />
<label class="form-label">Label</label>

<!-- Cards -->
<div class="card">Content</div>

<!-- Messages -->
<p class="error-message">Error</p>
<p class="success-message">Success</p>
```

## Troubleshooting

### Port Already in Use

If port 3000 is in use:

```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in vite.config.ts
server: {
  port: 3001
}
```

### CORS Issues

Ensure the backend API gateway has CORS enabled:

```yaml
# In api-gateway application.yml
spring:
  cloud:
    gateway:
      default-filters:
        - DedupeResponseHeader=Access-Control-Allow-Origin Access-Control-Allow-Credentials
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "http://localhost:3000"
            allowedMethods: GET,POST,PUT,DELETE,OPTIONS
            allowedHeaders: "*"
```

### Login Not Working

1. Verify backend is running
2. Check network tab in DevTools
3. Ensure correct credentials
4. Clear localStorage if stuck

### File Upload Issues

1. Check file size limits
2. Ensure correct file types
3. Verify multipart/form-data header
4. Check backend file upload configuration

## Performance Optimization

- Code splitting enabled automatically by Vite
- Lazy loading for routes (can be added)
- Image optimization
- Bundle analysis

## Building for Production

```bash
npm run build

# Output will be in dist/ folder
# Deploy dist/ folder to your hosting service
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tools

### Recommended VS Code Extensions

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- Prettier - Code formatter

### Debugging

1. **React DevTools** - Chrome extension for component inspection
2. **Browser DevTools** - Network, Console, Application tabs
3. **VS Code Debugger** - Set breakpoints in VS Code

## Testing (Optional Setup)

To add testing:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

## Security Best Practices

✅ Implemented:
- Token stored in localStorage
- Secure API calls with Authorization header
- Protected routes checking authentication
- HTTPS ready (for production)

⚠️ For Production:
- Use httpOnly cookies instead of localStorage for token
- Implement CSRF tokens
- Add rate limiting
- Enable HTTPS only
- Add Content Security Policy

## Next Steps

1. Test all features thoroughly
2. Customize styling/branding as needed
3. Add additional features (notifications, analytics)
4. Deploy to production environment
5. Set up CI/CD pipeline

## Support & Troubleshooting

For issues:
1. Check browser console for errors
2. Check network tab for API failures
3. Review backend logs
4. Check environment variables
5. Ensure all services are running

## Additional Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Axios Documentation](https://axios-http.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Happy Coding! 🚀**

