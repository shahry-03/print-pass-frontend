# PrintPass — Frontend

Modern React frontend for the PrintPass print job management platform.

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS v4** — utility-first styling with dark mode
- **Zustand** — lightweight state management
- **React Router v7** — client-side routing
- **Axios** — HTTP client with JWT interceptors
- **Framer Motion** — animations
- **React Hot Toast** — notifications
- **Lucide React** — icons

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.tsx       # Main layout (Navbar + Outlet + Footer)
│   ├── Navbar.tsx       # Responsive navbar with role-based links
│   ├── ProtectedRoute.tsx
│   └── ui/              # UI atoms (LoadingSpinner, StatusBadge)
├── pages/               # Route pages
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── OtpVerifyPage.tsx
│   ├── UploadPage.tsx
│   ├── VendorDashboardPage.tsx
│   ├── ShopSettingsPage.tsx
│   ├── AdminDashboardPage.tsx
│   └── NotFoundPage.tsx
├── services/            # API integration
│   ├── api.ts           # Axios instance + interceptors
│   ├── authService.ts
│   ├── shopService.ts
│   ├── jobService.ts
│   ├── adminService.ts
│   └── otpService.ts
├── store/               # Zustand stores
│   ├── authStore.ts     # JWT + role + email
│   └── themeStore.ts    # Dark mode toggle
├── types/               # TypeScript interfaces
│   └── index.ts
├── App.tsx              # Router configuration
├── main.tsx             # Entry point
└── index.css            # TailwindCSS + custom styles
```

## Roles & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/upload` | Public | Student file upload (anonymous) |
| `/login` | Public | Login form |
| `/register` | Public | Shop registration |
| `/verify-otp` | Public | Email OTP verification |
| `/dashboard` | PRINT_SHOP | Vendor dashboard + PIN entry |
| `/shop-settings` | PRINT_SHOP | Edit shop profile |
| `/admin` | ADMIN | Admin panel — manage shops |

## API Integration

All API calls go through the gateway at `VITE_API_BASE_URL` (default: `http://localhost:8080`).
JWT tokens are automatically attached via Axios interceptors. 401 responses trigger auto-logout.
