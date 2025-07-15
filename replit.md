# Bengali News Website - প্রথম আলো

## Overview

This is a comprehensive Bengali news website built with modern web technologies. The application features a responsive design, user authentication, content management, e-paper functionality, and personalized content recommendations. It serves as a complete digital newspaper platform with support for multimedia content, user engagement features, and administrative capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture:
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
The backend uses a Node.js/Express server with Supabase database:
- **Runtime**: Node.js with Express.js framework
- **Database**: Supabase PostgreSQL with Supabase client for database operations
- **Authentication**: Supabase Auth for user management
- **API Design**: RESTful API with proper error handling and middleware

### Database Design
Uses Supabase PostgreSQL with the following main entities:
- **Users**: Authentication and profile management via Supabase Auth
- **Categories**: News categorization (politics, sports, international, etc.)
- **Articles**: Main content with relationships to categories
- **E-papers**: Digital newspaper editions
- **Weather**: Location-based weather information
- **Breaking News**: Priority news items
- **User Interactions**: Saved articles, reading history, achievements

## Key Components

### Content Management
- **Articles System**: Full CRUD operations with rich text content, featured articles, view tracking
- **Category Management**: Hierarchical content organization
- **E-paper System**: Digital newspaper with PDF and image support
- **Breaking News**: Real-time important news updates

### User Features
- **Authentication**: Secure login/registration with Supabase
- **Personalization**: Reading history, saved articles, personalized recommendations
- **Interactive Elements**: Text-to-speech, article summaries, social sharing
- **Achievements System**: Gamified reading experience with progress tracking

### Media & Content
- **Multimedia Support**: Images, videos, audio articles
- **Text Processing**: Bengali text summarization, reading time estimation
- **Responsive Design**: Mobile-first approach with progressive enhancement

### Administrative Features
- **Content Management**: Admin dashboard for managing articles, categories, and e-papers
- **User Management**: Role-based access control
- **Analytics**: View tracking and engagement metrics

## Data Flow

### Client-Side Flow
1. User requests are handled by wouter router
2. Components fetch data using TanStack Query
3. Authentication state managed by Supabase client
4. UI updates handled by React with Tailwind CSS styling

### Server-Side Flow
1. Express server handles API requests
2. Authentication middleware validates user sessions
3. Supabase client manages database operations
4. Response data formatted and sent to client

### Database Operations
1. User actions trigger API calls
2. Server validates requests and permissions
3. Database operations executed via Supabase client
4. Real-time updates for reading history and achievements

## External Dependencies

### Core Technologies
- **Supabase**: Database, authentication, and real-time features
- **PostgreSQL**: Primary database via Supabase
- **Supabase Client**: Type-safe database operations
- **Tailwind CSS**: Utility-first styling framework
- **shadcn/ui**: Pre-built component library

### Build & Development
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast JavaScript bundling for production

### Optional Integrations
- **Social Media APIs**: For social media feed integration
- **Weather APIs**: For weather widget functionality
- **Payment Processing**: Stripe integration for potential subscription features

## Deployment Strategy

### Development Environment
- Local development using Vite dev server
- Hot module replacement for fast iteration
- TypeScript checking and ESLint for code quality

### Production Deployment
- **Platform**: Vercel (configured via vercel.json)
- **Build Process**: Vite builds client-side assets, ESBuild bundles server code
- **Static Assets**: Served via Vercel's CDN
- **Environment Variables**: Database connection and Supabase credentials

### Database Setup
- Uses Supabase database with direct table creation
- Seed script for initial data (categories, articles, weather, etc.)
- Connection managed via Supabase client

### Configuration Requirements
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for backend operations

## Recent Changes (January 15, 2025)

### Complete Migration to Supabase
✓ Removed Neon database dependencies (@neondatabase/serverless)
✓ Removed Drizzle ORM dependencies (drizzle-orm, drizzle-kit, drizzle-seed, drizzle-zod)
✓ Updated database connection to use Supabase client directly
✓ Migrated all storage functions to use Supabase PostgREST API
✓ Updated validation schemas to use Zod instead of Drizzle schemas
✓ Created new Supabase-compatible seed script
✓ Updated environment configuration to use Supabase service role key
✓ All API endpoints working correctly with Supabase database

The application is designed to be scalable, maintainable, and provides a complete digital newspaper experience with modern web technologies and Bengali language support.