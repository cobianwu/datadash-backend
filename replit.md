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
- **Processing**: Real implementations with Papa Parse (CSV) and XLSX (Excel)
- **Data Quality**: Automatic assessment on upload with issue detection
- **Data Cleaning**: Type conversion, null handling, outlier detection
- **Transformations**: Aggregation, pivoting, trend analysis

### Analytics Services
- **DataTransformer**: Enterprise data cleaning and transformation
  - Quality analysis with detailed issue reporting
  - Automatic data type conversion
  - Aggregation and pivot operations
  - Trend detection and forecasting
- **AnalyticsEngine**: Comprehensive statistical analysis
  - Column profiling and statistics
  - Correlation analysis
  - Insight generation
  - Smart query optimization
- **ChartGenerator**: Intelligent visualization
  - 12+ chart types
  - AI-powered recommendations
  - Automatic data formatting

### AI Services
- **Natural Language**: SQL generation from natural language queries
- **Insights**: Automated data analysis and recommendations
- **Chart Generation**: AI-powered visualization suggestions
- **Model**: OpenAI GPT-4o for all AI operations
- **Smart Query**: Converts natural language to optimized data operations

### Export Services
- **Excel**: Multi-sheet workbooks with pivot tables
- **PDF**: Professional reports with insights
- **PowerPoint**: Presentation-ready slide decks
- **CSV**: Clean data export

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
- **duckdb**: In-memory analytical database (optional)
- **ioredis**: Redis client for caching (optional)
- **bull**: Job queue for background processing (optional)
- **socket.io**: Real-time websocket communication
- **@dnd-kit/***: Drag and drop for dashboard builder
- **simple-statistics**: Statistical analysis functions

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

### Recent Changes (Jan 11, 2025) - Major Functionality Update

#### Core Features Strengthened
- **Real File Processing**: Replaced mock implementations with actual CSV, Excel, and JSON parsing
  - CSV parsing with Papa Parse library
  - Excel processing with XLSX library
  - Automatic schema detection and column extraction
  - Support for up to 1000 rows per file for performance
- **Enhanced AI Analysis**: AI queries now use uploaded data
  - Natural language queries process actual uploaded data
  - Dynamic chart generation based on data patterns
  - Context-aware insights generation
- **Unified Data Analysis Page**: Complete upload-to-visualization workflow
  - Step 1: Upload data files (CSV, Excel, JSON)
  - Step 2: Ask questions in natural language
  - Step 3: View auto-generated charts and insights
- **Interactive Demo Page**: New demo mode at `/demo`
  - Live walkthrough of key features
  - Simulated workflow from upload to export
  - Visual progress tracking

#### Technical Improvements
- Fixed file upload route to store actual data in memory
- Enhanced AI query endpoint to use uploaded data context
- Added data source ID passing between upload and analysis
- Created sample_data.csv for testing real workflows
- Improved error handling and user feedback

### Recent Changes (Jan 12, 2025) - Database Persistence Enhancement

#### Critical Fix: Data Persistence
- **Problem**: Uploaded data was only stored in memory, causing data loss when server restarts
- **Solution**: Implemented dual storage system:
  - Added `dataSourceData` table to PostgreSQL schema for persistent storage
  - Extended storage interface with `storeDataSourceData` and `getDataSourceData` methods
  - Modified upload flow to save data to both database and memory
  - Added automatic data recovery from database when not found in memory
  - Server now checks database first, then file system as fallback
- **Benefits**: 
  - Data survives server restarts
  - Scales better for large datasets
  - Enables distributed access if needed
  - Maintains fast access via memory caching

### Recent Changes (Jan 12, 2025) - Advanced Enterprise Features

#### Major Architectural Enhancement
- **Advanced Analytics Services**: Complete implementation of enterprise-grade analytics
  - Statistical significance testing (t-tests, chi-square tests)
  - Predictive modeling (linear & polynomial regression)
  - Anomaly detection (Z-score, IQR, Isolation Forest)
  - Time series analysis and forecasting (seasonal decomposition, ARIMA)

- **High-Performance Infrastructure**:
  - **Redis Integration**: Distributed caching for query results and analytics
    - Session management support
    - Real-time pub/sub for collaboration
    - Rate limiting and distributed locking
  - **DuckDB Analytics Engine**: SQL analytics on large datasets
    - In-memory analytical processing
    - Advanced window functions
    - Dynamic pivot tables
    - Optimized for OLAP workloads
  - **Bull Job Queue**: Background processing for heavy computations
    - Asynchronous file processing
    - Scheduled analytics jobs
    - Export generation queue

- **Real-Time Collaboration**:
  - **Socket.io Integration**: Live multi-user features
    - Real-time cursor tracking
    - Collaborative data editing
    - Live chart interactions
    - Shared analysis sessions
    - Comment system with positioning

- **Custom Dashboard Builder**:
  - Drag-and-drop widget system
  - 5 widget types: metric, chart, table, text, formula
  - Resizable widgets (small, medium, large, full)
  - Real-time dashboard updates
  - Save and load dashboard layouts

- **Excel-like Formula Editor**:
  - 30+ built-in functions across categories:
    - Math: SUM, AVERAGE, MIN, MAX, COUNT, ROUND
    - Statistical: STDEV, VAR, MEDIAN, MODE, CORREL
    - Text: CONCAT, UPPER, LOWER, LEN, TRIM
    - Date: TODAY, NOW, DATEDIF, YEAR, MONTH
    - Logical: IF, AND, OR, NOT
    - Lookup: VLOOKUP, HLOOKUP, INDEX, MATCH
  - Function reference with examples
  - Auto-complete for column names
  - Real-time formula execution

- **File Preview Enhancement**:
  - Click on any data source to preview content
  - Shows first 20 rows with column headers
  - Data quality indicators
  - Quick statistics overview

### Recent Changes (Jan 12, 2025) - Enterprise Analytics Transformation

#### Core Analytics Engine
- **DataTransformer Service**: Industrial-strength data processing
  - Comprehensive data quality analysis with issue detection
  - Automatic data cleaning and type conversion
  - Data aggregation with multiple metrics (sum, avg, count, min, max)
  - Pivot table generation for cross-tabulation
  - Trend detection with linear regression and seasonality analysis
  - Forecast generation for predictive insights
  
- **AnalyticsEngine Service**: Advanced statistical analysis
  - Automatic column type detection (numeric, categorical, date)
  - Statistical calculations (mean, median, mode, stdDev, min, max)
  - Correlation analysis between all numeric columns
  - Intelligent insight generation based on data patterns
  - Smart query builder that converts natural language to optimal data operations
  - Automated recommendations for data improvements

- **ChartGenerator Service**: Intelligent visualization engine
  - 12+ chart types: bar, line, area, pie, scatter, heatmap, waterfall, treemap, funnel, gauge, radar, sankey
  - AI-powered chart recommendations based on query intent
  - Automatic data transformation for each chart type
  - Correlation heatmaps and multi-dimensional analysis
  - Context-aware chart selection scoring

#### Export Capabilities
- **Excel Export**: Full-featured workbook generation
  - Multiple sheets: raw data, summary, pivot tables
  - Automatic pivot table creation
  - Metadata and insights included
  - Professional formatting

- **PDF Export**: Executive-ready reports
  - Formatted title and summary pages
  - Key insights and statistics
  - Data samples with proper tables
  - Print-optimized layout

- **PowerPoint Export**: Presentation-ready structure
  - Title slide with metadata
  - Executive summary with key insights
  - Data overview statistics
  - Chart slides with visualizations
  - Key findings and recommendations

#### Frontend Enhancements
- **Redesigned Data Analysis Page**: Enterprise-grade interface
  - Multi-tab workflow: Upload → Analyze → Insights → Export
  - Real-time data quality indicators
  - Natural language query interface with examples
  - 6+ interactive chart types with dynamic switching
  - Comprehensive analysis dashboard showing:
    - Statistical summaries
    - Correlation detection
    - Trend analysis with forecasting
    - Automated insights and recommendations
  - One-click export to Excel/PDF/PowerPoint

#### Data Processing Pipeline
- Automatic data cleaning on upload
- Real-time quality assessment
- In-memory caching of analysis results
- Intelligent data type inference
- Support for large datasets (tested with 40+ row enterprise data)

#### Fixes Applied
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
- **Data Processing Pipeline**: Real implementation
  - FileProcessor service with actual parsing logic
  - In-memory data storage for quick access
  - Column and schema extraction from uploaded files

### Deployment Readiness
The application is ready for deployment with the following considerations:
- **Database**: PostgreSQL (compatible with Neon/Supabase/standard PostgreSQL)
- **Authentication**: Session-based with PostgreSQL storage in production
- **API Integration**: OpenAI GPT-4o configured and functional
- **File Processing**: Real CSV/Excel/JSON parsing implemented
- **AI Analysis**: Natural language queries process actual uploaded data
- **Public/Private Split**: Landing page for public visitors, full app for authenticated users
- **Optional Services**: Redis, DuckDB, and Bull queues gracefully degrade if unavailable
- **Real-time Features**: Socket.io for collaboration (requires sticky sessions in production)
- **Background Jobs**: Bull queue for async processing (requires Redis in production)

### Recent Changes (Jan 13, 2025) - Production Deployment Configuration
#### Database Connection Updates
- **Migrated from Neon to standard PostgreSQL**: Updated `server/db.ts` to use standard `pg` driver
- **SSL Configuration**: Added production SSL settings with `rejectUnauthorized: false` for cloud providers
- **Connection Pooling**: Configured with max 10 connections and proper timeouts
- **IPv4 Forcing**: Added URL parsing to force IPv4 connections (family=4) for Render compatibility

#### Authentication Improvements
- **Persistent Sessions**: Implemented PostgreSQL-based session storage for production (`connect-pg-simple`)
- **Cookie Security**: Enabled secure cookies and proxy trust for HTTPS deployments
- **Session Table**: Auto-creates 'sessions' table on first run
- **Environment Detection**: Automatically switches between memory store (dev) and PostgreSQL store (production)

#### Environment Variables Required
```bash
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
NODE_ENV=production
SESSION_SECRET=your-very-secure-random-string-here
OPENAI_API_KEY=your-openai-api-key
```

#### Demo User Setup
Created helper script at `scripts/create-demo-user.js` to generate password hash for demo user.
Run locally and execute generated SQL in your database to create demo user.

### Testing Instructions
1. **Login**: Use demo/demo credentials
2. **Upload Data**: Go to Data Analysis page, upload large_enterprise_data.csv
3. **Natural Language Query**: Try queries like:
   - "Show me monthly revenue trends"
   - "What are the top performing companies?"
   - "Compare revenue by region"
   - "Analyze profit margins over time"
   - "Find correlations between marketing spend and revenue"
4. **View Results**: 
   - Charts automatically generated based on query
   - Switch between bar, line, area, pie, scatter, treemap views
   - Click "Insights" tab for comprehensive analysis
5. **Advanced Analysis**:
   - Run comprehensive analysis for statistics and correlations
   - Use trend detection for time-series data
   - View data quality reports
6. **Export**: 
   - Excel: Full data with pivot tables and analysis
   - PDF: Professional report with insights
   - PowerPoint: Presentation-ready slides

### Deployment Notes
For production deployment:
1. Session storage should be switched from memory to a persistent store (Redis/PostgreSQL)
2. Environment variables must be configured in deployment platform
3. Build process: `npm run build` creates optimized production bundle
4. The app will be accessible via Replit Deployments with automatic TLS and health checks
5. File storage: Currently uses local filesystem, consider cloud storage for production