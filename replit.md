# Bengali News Website - Compressed Guide

## ⚠️ CRITICAL SECURITY NOTICE
**This project currently has a severe security vulnerability that must be addressed before production deployment:**

The admin system uses Supabase service role keys directly in client-side code (files in `client/src/lib/admin/`). This means sensitive database credentials are bundled into JavaScript sent to browsers, potentially exposing full admin database access to malicious users.

**Immediate Actions Required:**
1. **DO NOT deploy this application to production** until the security issue is resolved
2. The service role key must be moved to server-side only
3. Admin operations need to be refactored to use server-side API endpoints
4. Client code should only use the anon key with proper Row Level Security (RLS)

**Temporary Mitigation:**
- Only use this application in development/testing environments
- Do not expose the Replit URL publicly
- Change all Supabase credentials if they have been exposed

**Long-term Fix Needed:**
- Refactor all admin operations to use server-side endpoints (server/admin-api.ts)
- Remove all client-side usage of VITE_SUPABASE_SERVICE_KEY
- Implement proper RLS policies for admin operations
- Use Replit Secrets for sensitive environment variables

## Overview
This project is a comprehensive Bengali news website designed to offer a rich news reading experience with advanced features for a global audience, focusing on Bangladesh. It aims to be a trusted news source by integrating AI for content analysis, providing personalized recommendations, user analytics, and multilingual support. The platform prioritizes high performance, world-class UX/UI, and aims for significant market potential.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **UI Library**: shadcn/ui components with Radix UI primitives.
- **Styling**: Tailwind CSS with custom Bengali font support.
- **State Management**: TanStack Query for server state, React hooks for local state.
- **Routing**: Wouter for lightweight client-side routing.
- **Authentication**: Supabase Auth with custom hooks.
- **UI/UX Decisions**: Mobile-first responsive design, Bangladesh-specific cultural color psychology (green, red, white), 44px minimum touch targets, professional Bengali typography (SolaimanLipi, Kalpurush, Noto Sans Bengali), minimalistic design principles, WCAG AA compliance for accessibility. Features a comprehensive branding control system with 6 color themes and 9 Bengali fonts, allowing full customization of website appearance and typography.

### Backend Architecture
- **Runtime**: Node.js with Express.js server (primarily for legacy/minimal needs; direct Supabase calls preferred).
- **Database**: Supabase (PostgreSQL) with real-time capabilities.
- **Schema Management**: Drizzle ORM configuration (PostgreSQL dialect).
- **API Design**: RESTful APIs with comprehensive CRUD operations, emphasizing direct Supabase API calls.
- **Authentication**: Supabase Auth integration with JWT tokens.

### System Design Choices
- **Content Management System**: Full CRUD for articles, hierarchical categories, digital newspaper editions (E-Papers) with LaTeX/PDF support, video content management, and audio articles.
- **User Experience Features**: ML-based personalized recommendations, reading analytics, advanced Bengali search, social features (sharing, bookmarking), and accessibility features.
- **Administrative Features**: Comprehensive admin dashboard with real-time analytics, user management with roles/permissions, content moderation, and all admin sections connected to live Supabase data.
- **Data Flow**: Content published through admin dashboard, stored in Supabase; user interactions tracked for analytics and recommendations; search and discovery utilize PostgreSQL full-text search and AI algorithms for trending topics.
- **AI Integration**: Backend AI processing using TensorFlow.js and Hugging Face Transformers for Bengali text summarization, sentiment analysis, automatic tagging, and reading time calculation. AI analysis is dynamic, research-based, and integrated into discovery widgets and reading stats.
- **World-Class E-Paper Generation**: Advanced algorithmic system inspired by top Bangladesh newspapers (Prothom Alo, Daily Star) and international newspaper design principles. Features professional layout algorithms, authentic newspaper typography, advanced column balancing, and real PDF generation using Puppeteer. Includes multiple template systems (Bangladesh Premium Broadsheet, Modern Tabloid, Compact Modern) with CSS Grid-based layouts, professional masthead design, breaking news banners, and optimized print quality output.
- **Security**: Row Level Security (RLS) policies across 38 tables, role-based access control, JWT-based authentication with refresh tokens, input validation with Zod schemas, and secure environment variable management.
- **Performance Optimizations**: Code splitting, image optimization (WebP), database indexing, and caching strategies (TanStack Query, Supabase real-time updates).
- **Deployment Strategy**: Frontend static site generation (Vite) deployed on Vercel/Netlify; backend (minimal Express) on Node.js hosting; Supabase for production database. Includes enterprise-grade Vercel setup with 7 professional Edge Functions for SEO (sitemap, robots.txt, RSS, AMP), social media optimization (Open Graph, Twitter Cards), and performance.

## External Dependencies
- **Supabase**: Primary database, authentication, real-time subscriptions, file storage.
- **Vercel/Netlify**: Frontend deployment and CDN.
- **Node.js Environment**: Backend runtime.
- **Open-Meteo API**: Real-time Bangladesh weather data.
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Accessible component primitives.
- **Lucide Icons**: Modern icon library.
- **Bengali Fonts**: SolaimanLipi, Kalpurush, Noto Sans Bengali.
- **TypeScript**: Type safety.
- **Vite**: Development server and build tool.
- **TanStack Query**: Server state management and caching.
- **Zod**: Runtime type validation.
- **TensorFlow.js**: AI processing for backend.
- **Hugging Face Transformers**: AI processing for Bengali text analysis.