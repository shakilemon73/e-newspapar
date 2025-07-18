# Bengali News Website - Comprehensive Development Guide

## Overview

This is a comprehensive Bengali news website built with modern web technologies, featuring a full-stack architecture with React frontend, Express backend, and Supabase database integration. The platform provides a complete news reading experience with advanced features like personalized recommendations, user analytics, and multilingual support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom Bengali font support
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Supabase Auth with custom hooks

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: Supabase (PostgreSQL) with real-time capabilities
- **Schema Management**: Drizzle ORM configuration (PostgreSQL dialect)
- **API Design**: RESTful APIs with comprehensive CRUD operations
- **Authentication**: Supabase Auth integration with JWT tokens

### Database Design
- **Primary Database**: Supabase PostgreSQL with 19+ advanced tables
- **Core Tables**: articles, categories, users, weather, epapers, breaking_news
- **Advanced Features**: user_reading_history, article_analytics, trending_topics, user_interactions
- **Security**: Row Level Security (RLS) policies for user data protection

## Key Components

### Content Management System
- **Articles**: Full CRUD with rich content support, featured articles, view tracking
- **Categories**: Hierarchical categorization with Bengali slugs
- **E-Papers**: Digital newspaper editions with PDF support
- **Videos**: Video content management with YouTube integration
- **Audio Articles**: Text-to-speech and audio content support

### User Experience Features
- **Personalized Recommendations**: ML-based content suggestions using user behavior
- **Reading Analytics**: Comprehensive user reading history and progress tracking
- **Accessibility**: Screen reader support, text-to-speech, font customization
- **Search**: Advanced Bengali search with autocomplete and filters
- **Social Features**: Article sharing, bookmarking, user interactions

### Administrative Features
- **Admin Dashboard**: Comprehensive content management interface
- **Analytics**: Real-time user engagement and content performance metrics
- **User Management**: User roles, permissions, and activity monitoring
- **Content Moderation**: Comment management and content approval workflows

## Data Flow

### Content Publishing Flow
1. Admin creates/edits content through admin dashboard
2. Content stored in Supabase with proper categorization and metadata
3. Real-time updates propagated to frontend using Supabase subscriptions
4. CDN-optimized images and assets served through Supabase storage

### User Interaction Flow
1. User authentication handled by Supabase Auth
2. User interactions tracked in real-time (reading history, likes, shares)
3. ML algorithms process user behavior for personalized recommendations
4. Analytics data aggregated for admin dashboard insights

### Search and Discovery Flow
1. Advanced Bengali text search using PostgreSQL full-text search
2. Trending topics calculated using engagement metrics
3. Category-based filtering and sorting
4. Personalized content recommendations based on user preferences

## External Dependencies

### Core Infrastructure
- **Supabase**: Database, authentication, real-time subscriptions, file storage
- **Vercel/Netlify**: Frontend deployment and CDN
- **Node.js Environment**: Backend runtime with Express server

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Modern icon library
- **Bengali Fonts**: SolaimanLipi, Kalpurush, Noto Sans Bengali for proper Bengali typography

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development server and build tool
- **TanStack Query**: Server state management and caching
- **Zod**: Runtime type validation for API endpoints

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Supabase cloud instance with development environment
- **Environment Variables**: Centralized configuration for API keys and database URLs

### Production Deployment
- **Frontend**: Static site generation with Vite build
- **Backend**: Express server deployment on Node.js hosting
- **Database**: Supabase production instance with proper security policies
- **CDN**: Asset optimization and global distribution

### Security Considerations
- **Authentication**: JWT-based authentication with refresh tokens
- **Data Protection**: Row Level Security (RLS) for user data isolation
- **API Security**: Input validation with Zod schemas
- **Environment Security**: Secure environment variable management

### Performance Optimizations
- **Code Splitting**: Lazy loading of admin routes and heavy components
- **Image Optimization**: WebP format with responsive loading
- **Database Indexing**: 17 performance indexes for optimal query performance
- **Caching Strategy**: TanStack Query for client-side caching, Supabase for real-time updates

## Development Notes

The application follows a monorepo structure with clear separation between client, server, and shared code. The database schema is designed to support advanced features like user analytics, trending topics, and personalized recommendations while maintaining performance through proper indexing and Row Level Security policies.

The system is built to handle Bengali content with proper font support and URL slug generation, making it suitable for Bangladeshi news consumption patterns.

### Recent Cleanup (July 18, 2025)
- ✅ Removed 50+ unused migration scripts, test files, and legacy database setup files
- ✅ Cleaned up unused SQL files, mock data files, and temporary documentation
- ✅ Eliminated all `.js` migration files and duplicate table creation scripts
- ✅ Fixed broken imports after file cleanup to ensure server stability
- ✅ Maintained clean project structure with only essential files for production
- ✅ All admin APIs (101+ endpoints) remain properly authenticated and functional
- ✅ Public APIs continue serving real Bengali content from Supabase
- ✅ Project is now optimized for future development with organized file structure