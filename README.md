# PrintPass Frontend

Advanced React + TypeScript frontend for the PrintPass print job management system.

## Features

- 🎓 **For Students**: Submit print jobs, track status, manage wallet
- 🏪 **For Vendors**: Manage shops, verify jobs, update job status
- 🔐 **Authentication**: Secure login/register system
- ⚡ **Real-time Updates**: Job status tracking
- 💰 **Cost Calculation**: Automatic price estimation
- 📱 **Responsive Design**: Mobile-first UI with Tailwind CSS

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Zustand** - State management
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
cd D:\PrintPass\frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   └── common/
│       └── Feedback.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── student/
│   │   ├── StudentDashboard.tsx
│   │   ├── ShopsPage.tsx
│   │   └── CreateJobPage.tsx
│   └── vendor/
│       ├── VendorDashboard.tsx
│       └── VerifyJobPage.tsx
├── services/
│   └── api.ts
├── store/
│   └── index.ts
├── hooks/
│   └── index.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:8080/api
```

## Key Features

### Authentication
- Login with email and password
- Register as Student or Vendor
- Token-based authentication with JWT
- Automatic logout on 401 errors

### Student Features
- View all available shops
- Create print jobs with file upload
- Track job status (PENDING, PROCESSING, READY, COMPLETED)
- View estimated costs
- Access unique PIN for job verification

### Vendor Features
- Manage multiple shops
- Verify jobs by PIN
- Update job status
- Download customer files
- View pending jobs

### API Integration
- Centralized API client with interceptors
- Automatic error handling
- Token management
- Form data handling for file uploads
- File download support

### State Management
- Zustand for global state
- Auth store for user session
- Job store for job management
- Shop store for shop management
- Custom hooks for data fetching

## Advanced Features

- **Form Validation**: Built-in validation with error messages
- **Loading States**: Loading spinners and disabled buttons during requests
- **Error Handling**: Comprehensive error messages and recovery options
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Proper semantic HTML and ARIA labels
- **TypeScript**: Full type safety throughout the application

## API Endpoints

- `POST /users` - Register
- `POST /users/login` - Login
- `GET /users` - Get all users
- `GET /users/{id}` - Get user by ID
- `GET /shops` - Get all shops
- `POST /shops` - Create shop
- `GET /shops/{id}` - Get shop by ID
- `GET /jobs` - Get all jobs
- `POST /jobs` - Create job
- `GET /jobs/verify/{pin}` - Verify job by PIN
- `PUT /jobs/{jobId}/status` - Update job status
- `GET /jobs/download/{fileName}` - Download file

## Troubleshooting

### API Connection Issues
- Ensure backend is running on `http://localhost:8080`
- Check CORS configuration in API gateway
- Verify token is being sent in Authorization header

### Authentication Issues
- Clear localStorage if stuck on login page
- Ensure user registration creates account with correct role
- Check token expiration

### File Upload Issues
- Ensure file size is within limits
- Check accepted file types (PDF, DOC, DOCX, TXT)
- Verify multipart form data is being sent correctly

## Development Tips

- Use React DevTools to inspect component state
- Use Redux DevTools (or Zustand DevTools) to track state changes
- Check browser console for API errors
- Use Network tab to debug API requests

## Future Enhancements

- [ ] Wallet management and payment integration
- [ ] Email notifications for job status updates
- [ ] Advanced analytics for vendors
- [ ] Chat/messaging between students and vendors
- [ ] Job history and export functionality
- [ ] Admin dashboard
- [ ] Dark mode support

## License

MIT

