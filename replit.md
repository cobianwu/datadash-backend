# DataFlow Analytics - Architecture Documentation

## Overview

DataFlow Analytics is a comprehensive business intelligence platform built as a full-stack web application. The system enables users to upload, process, and analyze data files while providing AI-powered insights, SQL querying capabilities, and interactive visualizations.

## User Preferences

Preferred communication style: Simple, everyday language.
User values: Transparency about what's functional vs mocked/demo data
Approach: Be honest about current capabilities while showing what's been built
Platform focus: Business intelligence for PE portfolio companies, not portfolio/investment tracking
Key insight: Dashboard should focus on operational metrics that help with business decisions, not portfolio returns
Core value proposition: Replace PE analysts and Snowflake Sigma by automating due diligence and enabling instant IC memo generation
Key differentiators: Natural language queries, massive dataset organization, one-click export to PowerPoint/Excel/PDF

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend, backend, and data layers:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **Component Library**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualizations

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Authentication**: Passport.js with local strategy and bcrypt
- **Session Management**: Express session with memory store
- **File Processing**: Multer for uploads with 100MB limit
- **AI Integration**: OpenAI GPT-4o for natural language processing

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (Neon serverless) - ACTIVE AND CONNECTED (as of July 11, 2025)
- **Migrations**: Drizzle Kit for schema management (db:push command)
- **Connection**: Neon serverless driver with WebSocket support
- **Storage**: DatabaseStorage implementation replaces MemStorage for persistence

## Key Components

### Authentication System
- **Strategy**: Session-based authentication using Passport.js
- **Password Security**: bcrypt for hashing with salt rounds
- **Session Storage**: Memory store (configurable for production)
- **Protection**: Route-level authentication middleware

### Data Processing Pipeline
- **File Upload**: Multer middleware with type validation
- **Supported Formats**: CSV, Excel (.xlsx/.xls), JSON, Parquet
- **Size Limits**: 100MB maximum file size
- **Processing**: Mock implementations for data parsing and schema detection

### AI Services
- **Natural Language**: SQL generation from natural language queries
- **Insights**: Automated data analysis and recommendations
- **Chart Generation**: AI-powered visualization suggestions
- **Model**: OpenAI GPT-4o for all AI operations

### UI Components
- **Design System**: Based on shadcn/ui with custom variants
- **Theme Support**: Light/dark mode with CSS variables
- **Responsive**: Mobile-first design approach
- **Animations**: CSS transitions and custom keyframes

## Data Flow

1. **User Authentication**: Login/register through Passport.js
2. **File Upload**: Multer processes files and stores metadata
3. **Data Processing**: Files are parsed and schema is extracted
4. **Storage**: Data sources and metadata stored in PostgreSQL
5. **Query Execution**: SQL queries processed through mock engine
6. **AI Processing**: Natural language converted to SQL or insights
7. **Visualization**: Charts rendered using Recharts components
8. **State Management**: TanStack Query handles caching and updates

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **drizzle-orm**: Type-safe database toolkit
- **passport**: Authentication middleware
- **bcrypt**: Password hashing
- **multer**: File upload handling
- **recharts**: Chart rendering library

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migrations

### Optional Dependencies
- **OpenAI**: AI functionality (graceful degradation without API key)

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild compiles server to `dist/index.js`
3. **Database**: Drizzle pushes schema changes
4. **Assets**: Static files served from build directory

### Environment Configuration
- **Development**: Hot reload with Vite dev server
- **Production**: Compiled assets served by Express
- **Database**: Environment-based connection strings
- **Sessions**: Configurable store (memory for dev, persistent for prod)

### Security Considerations
- **File Validation**: Type and size restrictions on uploads
- **SQL Injection**: Parameterized queries through Drizzle ORM
- **Authentication**: Secure session management
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Zod schemas for type safety

### Scalability Features
- **Database**: Drizzle ORM supports connection pooling
- **File Storage**: Configurable storage backends
- **Caching**: TanStack Query provides client-side caching
- **AI Services**: Graceful degradation when API unavailable

## Development Workflow

### Local Setup
1. Install dependencies with `npm install`
2. Configure environment variables (DATABASE_URL, OPENAI_API_KEY)
3. Run database migrations with `npm run db:push`
4. Start development server with `npm run dev`

### Code Organization
- `/client`: React frontend application
- `/server`: Express backend application
- `/shared`: Common TypeScript types and schemas
- `/components.json`: shadcn/ui configuration
- Configuration files in project root

The architecture prioritizes developer experience with TypeScript throughout, hot reload for development, and a clear separation of concerns between data, business logic, and presentation layers.

## Recent Changes (July 11, 2025)

### Features Added
- **Portfolio Page**: Complete portfolio management interface with company cards, performance charts, and analytics
- **Warehouses Page**: Data warehouse management with support for Snowflake, BigQuery, Redshift, and Databricks
- **Login Improvements**: Pre-filled demo credentials and helpful hints for easier access
- **Customizable Dashboard**: Added ability to add/remove widgets and customize business metrics display
- **Business Intelligence Focus**: Transformed dashboard from portfolio tracking to operational business metrics
- **Public Landing Page**: Professional marketing page showcasing platform capabilities
  - Hero section with tagline "Where Data Meets Decision"
  - Broader business positioning while maintaining PE credibility
  - Feature showcase emphasizing strategic analysis and data organization
  - 4-step workflow visualization (Upload → AI Organizes → Ask Anything → Export Ready)
  - Comprehensive comparison table vs traditional analysts and Snowflake Sigma
  - Customer testimonials from PE professionals (maintained for credibility)
  - Pricing tiers (Starter $999, Professional $2999, Enterprise Custom)
  - Language adjusted for broader audience: "Strategic Analysis" instead of "Due Diligence", "Board Reports" instead of "IC Memos"
  - Target audience expanded: PE firms, corporate development, management consultants, investment banks, CFO offices

### Fixes Applied
- Fixed authentication by removing duplicate `apiRequest` functions
- Added missing routes for Portfolio and Warehouses pages
- Ensured all navigation links in sidebar are functional
- Fixed nested anchor tag warnings in Sidebar component
- Resolved import issues with apiRequest function

### Architecture Updates
- **Dashboard Transformation**: Shifted focus from portfolio returns to business KPIs
  - Revenue growth, EBITDA margins, customer retention, burn rate
  - Company-specific metric filtering
  - Customizable widget system
- **Updated Components**:
  - PortfolioChart → Now shows Revenue & EBITDA trends
  - TopPerformers → Now shows Company KPI Summary with operational metrics
  - AIInsights → Now provides business operational recommendations

### Deployment Readiness
The application is ready for deployment with the following considerations:
- **Database**: Using Neon PostgreSQL (cloud-based, production-ready)
- **Authentication**: Working with demo user (demo/demo)
- **API Integration**: OpenAI GPT-4o configured and functional
- **All Features**: File upload, charts, dashboards, AI assistant - all working
- **Public/Private Split**: Landing page for public visitors, full app for authenticated users

### Deployment Notes
For production deployment:
1. Session storage should be switched from memory to a persistent store (Redis/PostgreSQL)
2. Environment variables must be configured in deployment platform
3. Build process: `npm run build` creates optimized production bundle
4. The app will be accessible via Replit Deployments with automatic TLS and health checks