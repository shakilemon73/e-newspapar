# Bengali News Website - Compressed Guide

## Overview

This project is a comprehensive Bengali news website built with modern web technologies, offering a full-stack architecture. Its main purpose is to provide a rich news reading experience with advanced features. The platform is designed for a global audience with a focus on Bangladesh, aiming to be a trusted news source with features like personalized recommendations, user analytics, and multilingual support. It integrates AI for content analysis and aims for high performance and world-class UX/UI.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Migration to Replit Environment (August 1-2, 2025)
- **COMPLETED MIGRATION**: Successfully migrated from Replit Agent to Replit environment
- Fixed Supabase environment variable configuration
- Resolved admin API data structure issues
- All admin functions now working properly with direct Supabase integration
- Service role key properly configured for admin operations
- All TypeScript errors resolved
- **FIXED**: All admin pages (SEO Management, Trending Analytics, Users Admin, Comment Management) now display real database data instead of mock data
- Fixed admin functions data structure mismatches (getSEOAnalytics, getMetaTags, getUserStats, getTrendingAnalytics)
- Enhanced admin-supabase-direct.ts to return proper data structures with all required properties
- All admin pages now connected to live Supabase database with authentic data display
- **RESOLVED**: JSX syntax errors in TrendingAnalyticsPage that were causing workflow crashes
- All admin dashboard functionality restored and operational
- **MIGRATION COMPLETE**: Bengali news website fully operational in Replit environment

### Admin System Fixes (August 1, 2025)
- Fixed admin/articles and admin/settings pages not showing data
- Implemented graceful fallbacks for missing database tables
- All 26 admin sections now use direct Supabase API with service role key
- Settings page loads with default values when site_settings table is missing
- Articles page handles empty states gracefully instead of throwing errors
- Complete removal of Express server dependencies for admin operations
- Admin dashboard, articles, and settings pages all functional
- Created comprehensive admin system documentation (ADMIN_SYSTEM_GUIDE.md)
- Removed temporary test files and implemented production-ready solutions

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite for optimized builds.
- **UI Library**: shadcn/ui components with Radix UI primitives.
- **Styling**: Tailwind CSS with custom Bengali font support.
- **State Management**: TanStack Query for server state, React hooks for local state.
- **Routing**: Wouter for lightweight client-side routing.
- **Authentication**: Supabase Auth with custom hooks.
- **UI/UX Decisions**: Mobile-first responsive design, Bangladesh-specific cultural color psychology (green, red, white), 44px minimum touch targets, professional Bengali typography (SolaimanLipi, Kalpurush, Noto Sans Bengali), minimalistic design principles, WCAG AA compliance for accessibility.

### Backend Architecture
- **Runtime**: Node.js with Express.js server (minimal frontend-only server; direct Supabase calls preferred).
- **Database**: Supabase (PostgreSQL) with real-time capabilities.
- **Schema Management**: Drizzle ORM configuration (PostgreSQL dialect).
- **API Design**: RESTful APIs with comprehensive CRUD operations, with a strong emphasis on direct Supabase API calls.
- **Authentication**: Supabase Auth integration with JWT tokens.

### System Design Choices
- **Content Management System**: Full CRUD for articles, hierarchical categories, digital newspaper editions (E-Papers) with LaTeX/PDF support, video content management, and audio articles.
- **User Experience Features**: ML-based personalized recommendations, reading analytics, advanced Bengali search, social features (sharing, bookmarking), and accessibility features.
- **Administrative Features**: Comprehensive admin dashboard, real-time analytics, user management with roles/permissions, and content moderation.
- **Data Flow**: Content published through admin dashboard, stored in Supabase; user interactions tracked for analytics and recommendations; search and discovery use PostgreSQL full-text search and AI algorithms for trending topics.
- **AI Integration**: Backend AI processing using TensorFlow.js and Hugging Face Transformers for Bengali text summarization, sentiment analysis, automatic tagging, and reading time calculation. AI analysis is dynamic and research-based, integrated into discovery widgets and reading stats.
- **Security**: Row Level Security (RLS) policies across 38 tables, role-based access control, JWT-based authentication with refresh tokens, input validation with Zod schemas, and secure environment variable management.
- **Performance Optimizations**: Code splitting, image optimization (WebP), database indexing (17 indexes), and caching strategies (TanStack Query, Supabase real-time updates).
- **Deployment Strategy**: Frontend static site generation (Vite) deployed on Vercel/Netlify; backend (minimal Express) on Node.js hosting; Supabase for production database.

## External Dependencies

- **Supabase**: Primary database, authentication, real-time subscriptions, file storage.
- **Vercel/Netlify**: Frontend deployment and CDN.
- **Node.js Environment**: Backend runtime.
- **Open-Meteo API**: Real-time Bangladesh weather data with Bengali translations and location-based detection.
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Accessible component primitives.
- **Lucide Icons**: Modern icon library.
- **Bengali Fonts**: SolaimanLipi, Kalpurush, Noto Sans Bengali.
- **TypeScript**: Type safety.
- **Vite**: Development server and build tool.
- **TanStack Query**: Server state management and caching.
- **Zod**: Runtime type validation.
- **TensorFlow.js**: AI processing for frontend (now backend-only processing).
- **Hugging Face Transformers**: AI processing for Bengali text analysis.