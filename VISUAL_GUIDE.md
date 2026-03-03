# PrintPass Frontend - Visual Guide 🎨

## 🎯 User Interface Overview

### Page Structure

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR (Always Visible)                                │
│  Logo | Links | Auth Info | Logout Button               │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  PAGE CONTENT (Changes based on route)                  │
│                                                          │
│  - Full width on mobile                                 │
│  - Max width container on desktop                       │
│  - Responsive grid layouts                              │
│  - Consistent padding & spacing                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🗺️ Navigation Map

```
Home Page (/)
├── [Not Logged In]
│   ├── Login (/login)
│   └── Register (/register)
│
└── [Logged In]
    ├── STUDENT Role
    │   ├── Dashboard (/dashboard) → StudentDashboard
    │   ├── Shops (/shops) → ShopsPage
    │   ├── New Job (/create-job) → CreateJobPage
    │   └── Job Details (/job/:id) → JobDetailPage
    │
    └── VENDOR Role
        ├── Dashboard (/dashboard) → VendorDashboard
        └── Verify Job (/verify-job) → VerifyJobPage
```

## 📱 Responsive Breakpoints

### Mobile View (< 768px)
```
┌──────────────────┐
│  Print☰Pass      │  ← Navbar (condensed)
└──────────────────┘
┌──────────────────┐
│                  │
│  Full Width      │
│  Content         │
│                  │
│  Single Column   │
│  Cards           │
│                  │
└──────────────────┘
```

### Tablet View (768px - 1024px)
```
┌────────────────────────────────┐
│  📠 PrintPass  [Links]  [User]  │
└────────────────────────────────┘
┌────────────────────────────────┐
│  Two Column Layout             │
│  Cards Side by Side            │
└────────────────────────────────┘
```

### Desktop View (> 1024px)
```
┌──────────────────────────────────────────┐
│  📠 PrintPass  [Dashboard] [Shops] [User] │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│  Three Column Layout                     │
│  Cards in Grid                           │
└──────────────────────────────────────────┘
```

## 🎨 Color Palette

```
┌─────────────┬──────────────┬──────────────────────┐
│ Color       │ Hex Code     │ Usage                │
├─────────────┼──────────────┼──────────────────────┤
│ Primary     │ #3b82f6      │ Buttons, links       │
│ Secondary   │ #8b5cf6      │ Accents              │
│ Success     │ #10b981      │ Status: READY        │
│ Warning     │ #f59e0b      │ Status: PENDING      │
│ Danger      │ #ef4444      │ Errors, cancel       │
│ Info        │ #0ea5e9      │ Messages             │
│ Gray        │ #6b7280      │ Text, borders        │
└─────────────┴──────────────┴──────────────────────┘
```

## 📊 Job Status Visual

```
PENDING ────→ PROCESSING ────→ READY ────→ COMPLETED
  🟡              🔵            🟢         🟣
  Yellow          Blue          Green      Purple

                ↓
              (Cancel)
               ↓
            CANCELLED
              🔴
              Red
```

## 🎭 Component Examples

### Button Styles
```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ Primary Button │  │Secondary Button│  │ Danger Button  │
│ (Blue)         │  │ (Gray)         │  │ (Red)          │
└────────────────┘  └────────────────┘  └────────────────┘
```

### Card Layout
```
┌─────────────────────────────────┐
│  Title              Status Badge │
│  ─────────────────────────────  │
│  📄 Pages: 10                   │
│  💰 Cost: ₹50.00                │
│  🔑 PIN: ABC123                 │
│  ─────────────────────────────  │
│  [View Details Button]          │
└─────────────────────────────────┘
```

### Form Input
```
Label Text
┌──────────────────────────┐
│ Placeholder              │
└──────────────────────────┘
✗ Error message (if any)
```

### Loading State
```
    ⟳ Loading...
```

### Messages
```
┌─────────────────────────────────┐
│ ✔ Success: Job created!         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ✘ Error: Invalid PIN            │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ⚠ Warning: Shop is closed       │
└─────────────────────────────────┘
```

## 🔄 Data Flow Diagrams

### Login Flow
```
User Input Form
    ↓
[Submit Button]
    ↓
Form Validation
    ↓ (Valid)
API Call (POST /login)
    ↓ (Success)
Store Token & User
    ↓
Redirect to Dashboard
    ↓
Display Welcome Message
```

### Create Job Flow
```
[Select Shop Dropdown]
    ↓
[Enter Document Details]
    ↓
[Choose File]
    ↓
[Calculate Cost] ← Shop price × Pages
    ↓
[Submit Button]
    ↓
Multipart Form Data
    ↓
API Call (POST /jobs)
    ↓ (Success)
Show PIN
    ↓
Redirect Dashboard
```

### Job Verification Flow
```
[Enter PIN Input]
    ↓
[Verify Button]
    ↓
API Call (GET /jobs/verify/{pin})
    ↓ (Success)
Show Job Details
    ↓
[Update Status Button]
    ↓
Select New Status
    ↓
API Call (PUT /jobs/{id}/status)
    ↓ (Success)
Show Confirmation
```

## 📐 Layout Grid

### 12-Column Grid System (Tailwind)
```
Desktop (1200px+): 3 columns
┌──────┬──────┬──────┐
│ Card │ Card │ Card │  (Each 4 columns)
├──────┼──────┼──────┤
│ Card │ Card │ Card │
└──────┴──────┴──────┘

Tablet (768px-1199px): 2 columns
┌──────────┬──────────┐
│  Card    │  Card    │  (Each 6 columns)
├──────────┼──────────┤
│  Card    │  Card    │
└──────────┴──────────┘

Mobile (<768px): 1 column
┌─────────────────┐
│     Card        │  (Full width)
├─────────────────┤
│     Card        │
└─────────────────┘
```

## 🎬 Animation Types

### Fade In
```
Opacity: 0%  ────→  100%
Duration: 0.3s
```

### Slide In
```
Position: Y-10px, Opacity 0%
    ↓
Position: Y0, Opacity 100%
Duration: 0.3s
```

### Hover Effects
```
Normal        Hover
┌────────┐   ┌────────┐
│ Button │ → │ Button │  (Darker color)
└────────┘   └────────┘
              (Slight shadow)
```

## 📋 Form Component Anatomy

```
┌─────────────────────────────────────────┐
│  Form Title                             │
│  Form Description                       │
├─────────────────────────────────────────┤
│                                         │
│  Label *                                │
│  ┌───────────────────────────────────┐  │
│  │ Input / Select / Textarea         │  │
│  └───────────────────────────────────┘  │
│  ✗ Error message (if validation fails)  │
│                                         │
│  Label *                                │
│  ┌───────────────────────────────────┐  │
│  │ Input / Select / Textarea         │  │
│  └───────────────────────────────────┘  │
│  ✗ Error message (if validation fails)  │
│                                         │
│  [Reset]  [Submit]                      │
│                                         │
└─────────────────────────────────────────┘
```

## 🎯 Student Dashboard Layout

```
┌─────────────────────────────────────────┐
│ Welcome, [Student Name]!                │
│ Wallet Balance: ₹[Amount]               │
├─────────────────────────────────────────┤
│ [New Job Button] [Browse Shops Button]  │
├─────────────────────────────────────────┤
│                                         │
│  Job Card 1   │  Job Card 2   │ Job 3 │
│  ┌─────────┐  │  ┌─────────┐  │       │
│  │ Job 1   │  │  │ Job 2   │  │ Job 3 │
│  └─────────┘  │  └─────────┘  │       │
│               │                │       │
│               (Grid Layout)     │       │
│                                |       │
└─────────────────────────────────────────┘
```

## 🏪 Vendor Dashboard Layout

```
┌─────────────────────────────────────────┐
│ Vendor Dashboard                        │
├─────────────────────────────────────────┤
│ Your Shops                              │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ Shop 1  │ │ Shop 2  │ │ Shop 3  │   │
│ └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────┤
│ Pending Jobs                            │
│ ┌─────────────────────────────────────┐ │
│ │ Job 1                               │ │
│ │ PIN: ABC123                         │ │
│ │ [Process] [Cancel]                  │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Job 2                               │ │
│ │ PIN: XYZ789                         │ │
│ │ [Process] [Cancel]                  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 📝 Status Badge Styles

```
PENDING   ┌──────────────┐
          │ 🟡 PENDING   │
          └──────────────┘
          (Yellow background)

PROCESSING ┌──────────────┐
           │ 🔵 PROCESSING│
           └──────────────┘
           (Blue background)

READY   ┌──────────────┐
        │ 🟢 READY     │
        └──────────────┘
        (Green background)

COMPLETED ┌──────────────┐
          │ 🟣 COMPLETED │
          └──────────────┘
          (Purple background)

CANCELLED ┌──────────────┐
          │ 🔴 CANCELLED │
          └──────────────┘
          (Red background)
```

## 🔐 Authentication States

### Logged Out
```
[PrintPass Logo] → [Login Button] [Sign Up Button]
```

### Logged In (Student)
```
[PrintPass] [Dashboard] [Shops] [New Job] [John Doe] [STUDENT] [Logout]
```

### Logged In (Vendor)
```
[PrintPass] [Dashboard] [Verify Job] [Jane Smith] [VENDOR] [Logout]
```

## 📊 Shopping Experience Flow

```
Student Views Shops
    ↓
    ├─ Shop 1: 📍 Downtown, ₹5/page ✅ Open
    ├─ Shop 2: 📍 Campus, ₹3/page ✅ Open
    ├─ Shop 3: 📍 Mall, ₹4/page ❌ Closed
    └─ Shop 4: 📍 Center, ₹6/page ✅ Open
    ↓
[Select Shop]
    ↓
Create Job Form
    ├─ Document Name
    ├─ Number of Pages
    ├─ File Upload
    └─ Color Option
    ↓
Est. Cost Calculation: Pages × Price
    ↓
[Create Job]
    ↓
Success! PIN: ABC123
```

## 🎓 Key Visual Elements

### Icons Used (Text-based)
```
📠 - App Logo (Fax Machine)
🔐 - Security/Auth
👤 - User/Profile
📋 - Document/Job
🏪 - Shop
📍 - Location
💵 - Price/Cost
🔑 - PIN
🔄 - Status/Update
📥 - Download
📤 - Upload
✅ - Success/Open
❌ - Error/Closed
🟡 - Pending
🔵 - Processing
🟢 - Ready
🟣 - Completed
🔴 - Cancelled
⚠️ - Warning
ℹ️ - Info
```

## 🎨 Theme Consistency

All pages follow:
- Same navbar style
- Same color scheme
- Same typography
- Same spacing
- Same button styles
- Same card designs
- Same form styles
- Same animations

Creates cohesive, professional appearance!

---

**This visual guide helps understand the UI/UX layout and design system! 🎨**

