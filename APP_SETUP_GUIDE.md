# Bengali News App - Complete Setup Guide for Replit

## 🚀 How to Run Your Entire App in Replit

Your Bengali news website is **already running successfully** on port 5000! Here's everything you need to know:

## ✅ Currently Running Setup

### Primary Command
```bash
npm run dev
```
This starts the Express server with Vite integration serving both frontend and backend.

### Port Configuration
- **Server Port**: 5000 (Express + Frontend)
- **External Access**: Available via Replit's webview
- **Configuration**: Defined in `.replit` file

## 📁 Essential Files & Folders to Run the App

### 🔧 Core Configuration Files
```
package.json          # All dependencies and scripts
.replit              # Replit configuration (port 5000, nodejs-20)
.env                 # Environment variables (Supabase keys)
tsconfig.json        # TypeScript configuration
vite.config.ts       # Frontend build configuration
postcss.config.js    # CSS processing
tailwind.config.ts   # UI styling configuration
```

### 🖥️ Server Files (Backend)
```
server/
├── index.ts         # Main Express server (port 5000)
├── vite.ts          # Vite integration for frontend
├── admin-api.ts     # Admin API endpoints
├── ai-routes.ts     # AI functionality routes
├── ai-services.ts   # AI processing services
└── supabase.ts      # Database connection
```

### 🌐 Frontend Files
```
client/
├── src/
│   ├── App.tsx              # Main app router
│   ├── UserApp.tsx          # Public pages (29 routes)
│   ├── AdminApp.tsx         # Admin pages (35 routes)
│   ├── main.tsx             # React app entry point
│   ├── index.css            # Global styles
│   │
│   ├── components/          # All UI components
│   │   ├── Header.tsx       # Site navigation
│   │   ├── Footer.tsx       # Site footer
│   │   ├── ui/              # shadcn/ui components
│   │   └── [80+ components] # All feature components
│   │
│   ├── pages/               # All page components
│   │   ├── Home.tsx         # Homepage
│   │   ├── ArticleDetail.tsx
│   │   ├── admin/           # 25 admin pages
│   │   └── [28+ pages]      # All public pages
│   │
│   ├── lib/                 # Utilities & APIs
│   │   ├── supabase.ts      # Supabase client
│   │   ├── queryClient.ts   # React Query setup
│   │   └── [30+ utilities]  # API services
│   │
│   ├── hooks/               # Custom React hooks
│   └── contexts/            # React contexts
│
└── public/                  # Static assets
    ├── favicon.ico
    └── [placeholder images]
```

### 🗄️ Database Integration
```
db/
├── index.ts             # Database utilities
└── supabase-setup.ts    # Database initialization

shared/
├── schema.ts            # Database schema types
└── supabase-types.ts    # Type definitions
```

### 🚀 Deployment Files
```
vercel.json              # Vercel deployment config
netlify.toml            # Netlify deployment config
vercel-build.js         # Custom build script
dist-static/            # Built static files (1.66MB)
```

## ⚡ Quick Start Commands

### Start the App
```bash
npm run dev
```

### Build for Production
```bash
node vercel-build.js
```

### Check Types
```bash
npm run check
```

## 🔑 Required Environment Variables

Your `.env` file contains:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## 📊 App Features Currently Running

### ✅ Public Features (29 pages)
- Homepage with Bengali content
- Article reading with comments/likes
- Video and audio content
- Search and recommendations
- User authentication and profiles
- E-paper and breaking news

### ✅ Admin Features (35 pages)
- Complete content management
- User management
- Analytics dashboard
- AI processing system
- Settings and configuration

## 🌐 How It Works

1. **Express Server** (`server/index.ts`) runs on port 5000
2. **Vite Frontend** is served through Express
3. **Supabase Database** handles all data storage
4. **React Router** (Wouter) manages all 64 pages
5. **Direct API Calls** to Supabase (no complex backend needed)

## 🎯 Current Status

✅ **Fully Functional** - App is running successfully
✅ **All 64 Routes Working** - Public and admin pages accessible
✅ **Database Connected** - Supabase integration working
✅ **Authentication Working** - User and admin login functional
✅ **Bengali Content** - Real news articles and data
✅ **AI Features Active** - Article processing and recommendations
✅ **Weather System** - Real-time Bangladesh weather data
✅ **Vercel Ready** - Complete SPA deployment configuration

## 🔧 Troubleshooting

If the app stops working:

1. **Restart the workflow**: Click the restart button in Replit
2. **Check environment variables**: Ensure `.env` file has valid Supabase keys
3. **Install dependencies**: Run `npm install` if packages are missing
4. **Check port 5000**: App should be accessible via Replit's webview

## 📱 Access Your App

- **Development**: Available in Replit webview (port 5000)
- **Admin Panel**: `/admin-login` for admin access
- **Public Site**: `/` for regular users

Your Bengali news website is **complete and fully operational** in Replit!