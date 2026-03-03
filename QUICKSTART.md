# PrintPass Frontend - Quick Start Guide 🚀

## 5-Minute Setup

### Step 1: Install Dependencies (2 min)
```bash
cd D:\PrintPass\frontend
npm install
```

### Step 2: Configure Environment (1 min)
```bash
# Copy example file
cp .env.example .env.local

# File already configured with default backend URL
```

### Step 3: Start Development Server (1 min)
```bash
npm run dev
```

### Step 4: Open in Browser (1 min)
- Browser opens automatically at `http://localhost:3000`
- If not, open manually

## ✅ Verification

- [ ] Page loads without errors
- [ ] Can navigate to login page
- [ ] Can see "PrintPass" header

## First Run - Create Test Account

### Student Account:
1. Click "Sign Up"
2. Select "STUDENT"
3. Fill in details:
   - Name: Test Student
   - Email: student@test.com
   - Password: Test@1234
4. Click "Sign Up"
5. Login with same credentials

### Vendor Account:
1. Click "Sign Up"
2. Select "VENDOR"
3. Fill in details:
   - Name: Test Vendor
   - Email: vendor@test.com
   - Password: Test@1234
4. Click "Sign Up"
5. Login with same credentials

## Common Tasks

### Create a Print Job (Student)
1. Login as student
2. Click "New Job"
3. Select a shop
4. Enter document name & pages
5. Upload a PDF file
6. Click "Create Job"
7. Save the PIN displayed

### Verify Job (Vendor)
1. Login as vendor
2. Click "Verify Job"
3. Enter the PIN you saved
4. Click "Verify PIN"
5. Update job status
6. Download file

### Browse Shops (Student)
1. Login as student
2. Click "Shops" in navbar
3. See all available shops with pricing
4. Click "Select Shop" to create job there

## Project Structure (Quick Reference)

```
src/
├── components/     → Navbar, ProtectedRoute, Feedback components
├── pages/          → All page components
├── services/       → API client (api.ts)
├── store/          → Global state (Zustand)
├── hooks/          → Custom React hooks
├── types/          → TypeScript definitions
├── utils/          → Helper functions
├── App.tsx         → Main routing
└── index.css       → Global styles
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/services/api.ts` | API client & endpoints |
| `src/store/index.ts` | State management |
| `src/hooks/index.ts` | Custom React hooks |
| `src/types/index.ts` | TypeScript types |
| `vite.config.ts` | Build configuration |
| `.env.local` | Environment variables |

## API Endpoints Quick Reference

```javascript
// Authentication
POST /api/users          // Register
POST /api/users/login    // Login

// Shops
GET /api/shops           // List all shops
POST /api/shops          // Create shop

// Jobs
GET /api/jobs            // List all jobs
POST /api/jobs           // Create job
GET /api/jobs/verify/{pin} // Verify by PIN
PUT /api/jobs/{id}/status  // Update status
GET /api/jobs/download/{file} // Download file
```

## Testing Features

### Student Features to Test:
- [ ] Register as student
- [ ] Login/logout
- [ ] Browse shops
- [ ] Create print job
- [ ] View job status
- [ ] See wallet balance

### Vendor Features to Test:
- [ ] Register as vendor
- [ ] Login/logout
- [ ] View vendor dashboard
- [ ] Verify job by PIN
- [ ] Update job status
- [ ] Download file

## Troubleshooting Quick Fixes

### "Can't connect to API"
```bash
# Check backend is running
# Should see API Gateway on http://localhost:8080
# Check .env.local has correct VITE_API_URL
```

### "Port 3000 already in use"
```bash
# Kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in vite.config.ts
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "CORS error"
```bash
# Check backend CORS configuration
# Ensure API gateway allows http://localhost:3000
```

### "Login fails"
- Verify backend user-service is running
- Check credentials exist in database
- Clear localStorage and try again

## Development Tools

### VS Code Setup
1. Install ES7+ React snippets extension
2. Install Tailwind CSS IntelliSense
3. Install Prettier
4. Format on save enabled

### Browser DevTools
- React DevTools extension
- Network tab for API debugging
- Console for error messages
- Application tab for localStorage

## Build & Deploy

### Local Build Test
```bash
npm run build
npm run preview
# Opens http://localhost:4173
```

### Deploy to Production
```bash
npm run build
# Upload dist/ folder to hosting
```

## Performance Tips

- Clear browser cache if styles look wrong
- Use production build for accurate performance
- Network tab shows real API call times
- DevTools Lighthouse for performance audit

## File Upload Tips

- Supported: PDF, DOC, DOCX, TXT
- Max recommended: 10MB
- Must enter page count manually
- PIN generation is automatic

## Wallet & Pricing

- Student starts with balance
- Cost calculated: pages × shop price
- Deducted on job creation
- Vendors set their own pricing per page

## Navigation Tips

- Use navbar to navigate between pages
- Protected routes redirect to login if not authenticated
- Student/Vendor dashboards are role-specific
- Back buttons available on most pages

## Database Seeding (if needed)

If you need test data, ensure backend creates sample shops:

```java
// User Service - Create test vendor
POST /api/users
{
  "name": "Test Vendor",
  "email": "vendor@test.com",
  "password": "Test@1234",
  "role": "VENDOR"
}

// Shop Service - Create shop for vendor
POST /api/shops
{
  "vendorId": 1,
  "shopName": "Main Print Shop",
  "location": "Downtown",
  "perPageCost": 5.00
}
```

## Common Error Messages

| Error | Solution |
|-------|----------|
| "Login failed" | Check credentials |
| "Shop not found" | Backend might not have shops |
| "Invalid PIN" | Check PIN is correct |
| "File upload failed" | Check file size & format |
| "Unauthorized" | Logout and login again |

## Next Steps After Setup

1. ✅ Test all features
2. ✅ Customize styling (colors, fonts)
3. ✅ Add your logo/branding
4. ✅ Test on mobile
5. ✅ Deploy to production
6. ✅ Monitor error logs
7. ✅ Gather user feedback

## Useful Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Check code quality

# Reinstall everything
npm ci               # Clean install

# Update dependencies
npm update           # Update all packages
npm outdated        # Check outdated packages
```

## Need Help?

### Check These First:
1. Browser console (F12)
2. Network tab (DevTools)
3. Application/Storage tab
4. Backend logs
5. README.md in frontend folder

### Documentation Files:
- `README.md` - Full documentation
- `SETUP_GUIDE.md` - Detailed setup
- `DEPLOYMENT.md` - Deployment guide
- `ARCHITECTURE.md` - Technical details

## Environment Variables

```env
VITE_API_URL        # Backend API URL (default: http://localhost:8080/api)
VITE_APP_NAME       # App name (for display)
VITE_APP_VERSION    # App version
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Performance Baseline

- Bundle size: ~200KB (gzipped)
- Initial load: ~2s (on 4G)
- API response: ~100-500ms

## Tips for Success

1. **Keep token safe** - Don't share your auth token
2. **Test file uploads** - Try with small files first
3. **Check backend logs** - When API calls fail
4. **Use DevTools** - Network tab is your friend
5. **Read error messages** - They usually tell you what's wrong
6. **Clear cache** - If styles look broken
7. **Restart server** - If something seems stuck
8. **Check timestamps** - PINs and dates are important

---

**Ready to Code! Happy Printing! 📠✨**

For detailed info, check:
- README.md - Full feature documentation
- SETUP_GUIDE.md - Complete setup instructions
- DEPLOYMENT.md - Production deployment guide

