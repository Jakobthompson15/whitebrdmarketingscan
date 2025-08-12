# replit.md

## Overview

Whitebrd Pro Scanner is an AI-powered competitor intelligence and marketing analysis platform specifically designed for home service businesses (HVAC, plumbing, roofing, pest control, electrical, landscaping, etc.). The platform combines real business data from Google Places API with advanced AI analysis to provide strategic insights, market positioning recommendations, and actionable business intelligence for local home service providers.

The application is built as a full-stack web application with a React frontend, Express.js backend, and PostgreSQL database. It leverages the Google Places API to gather authentic business data and OpenAI's GPT-4o to generate comprehensive strategic analysis with real-time competitor intelligence and streaming progress updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with a custom black/white design system using dark orange (#FF6B35) as the primary accent color for all data visualizations
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Single-page application with component-based routing using state management

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with streaming endpoints for real-time progress updates
- **Database ORM**: Drizzle ORM with type-safe schema definitions
- **Services**: Modular service architecture with GooglePlacesService, CompetitorAnalysisService, and AIAnalysisService
- **AI Integration**: OpenAI GPT-4o for strategic analysis, review sentiment analysis, and business recommendations

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema**: Drizzle ORM manages schema with tables for users and home service businesses
- **Data Model**: Stores business information including ratings, reviews, location data, service capabilities, and competitive metrics

### Authentication & Authorization
- **Strategy**: Session-based authentication with database storage
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **User Management**: Simple username/password authentication with encrypted password storage

### Real-time Features
- **Progress Tracking**: Server-sent events for real-time analysis progress updates
- **Streaming API**: Custom streaming endpoints that provide live feedback during competitor analysis
- **State Synchronization**: React Query handles real-time state updates and caching

### UI/UX Design System
- **Color Palette**: Black and white base with dark orange (#FF6B35) for all data visualizations and metrics
- **Typography**: Inter font family for clean, professional appearance
- **Component Library**: Comprehensive set of Radix UI components styled with Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive breakpoints

## External Dependencies

### Third-party Services
- **Google Places API**: Primary data source for authentic business information and competitor discovery
- **OpenAI API**: GPT-4o model for AI-powered strategic analysis, market insights, and business recommendations
- **Neon Database**: Serverless PostgreSQL hosting for production database
- **Google Maps Integration**: Location-based services and geocoding capabilities

### Key npm Packages
- **Frontend**: React, TypeScript, Vite, TanStack React Query, Radix UI, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, Axios for HTTP requests
- **Database**: @neondatabase/serverless, drizzle-orm, pg drivers
- **Development**: ESBuild for production builds, TSX for development server
- **Authentication**: express-session, connect-pg-simple for session management

### Development Tools
- **Build System**: Vite for frontend bundling, ESBuild for backend bundling
- **Type Safety**: TypeScript throughout the stack with strict type checking
- **Database Management**: Drizzle Kit for schema migrations and database management
- **Code Quality**: Tailwind CSS for consistent styling, shadcn/ui for component consistency

## Recent Changes (August 12, 2025)

### AI Integration Enhancement
- **Added OpenAI GPT-4o Integration**: Implemented AIAnalysisService for comprehensive strategic analysis
- **Enhanced Competitor Analysis**: Integrated AI insights into competitor analysis workflow
- **New AI Features**:
  - Executive summaries of competitive positioning
  - Strategic recommendations based on market data
  - Market opportunity identification
  - Risk factor analysis
  - Actionable business insights
  - Review sentiment analysis capabilities
- **Frontend AI Components**: Created AIInsightsComponent with comprehensive UI for displaying AI-generated insights
- **Real-time Analysis**: AI analysis runs automatically during competitor scanning process

### Branding Updates
- **Logo Integration**: Added and refined Whitebrd Co. logo placement in headers
- **Name Change**: Updated from "HomeServicePro Scanner" to "Whitebrd Pro Scanner"
- **Visual Refinements**: Optimized logo sizing and background color matching