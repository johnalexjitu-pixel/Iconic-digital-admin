# Account Backoffice System

## Overview

This is a full-stack account backoffice management system built for managing customers, tasks, withdrawals, and administrative operations. The application provides a comprehensive dashboard for monitoring financial statistics, managing customer accounts, processing withdrawal requests, and configuring VIP levels and master data. It's designed as a team-based administrative tool (TEAM 1 - RUPEE) for handling customer financial operations and task management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite as build tool and dev server
- Wouter for client-side routing
- TanStack Query (React Query) for server state management
- Tailwind CSS with shadcn/ui component library (New York style)

**Key Design Patterns:**
- Component-based architecture with reusable UI components from shadcn/ui
- Custom hooks for state management (use-toast, use-mobile)
- Centralized API request handling through queryClient
- Layout wrapper pattern with shared Sidebar and Header components

**Routing Structure:**
- Dashboard (/) - Statistics overview
- Customer Management (/customer-management)
- Task Management (/task-management)
- Withdrawal Management (/withdrawal-management)
- User Management (/user-management)
- Master Data (/master-data)
- VIP Level (/vip-level)
- Tasklist Expiration (/tasklist-expiration)

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js
- TypeScript with ESM modules
- Drizzle ORM for database operations
- PostgreSQL database (via Neon serverless)

**API Design:**
- RESTful API endpoints under `/api` prefix
- CRUD operations for customers, withdrawals, products, admins
- Stats aggregation endpoint for dashboard
- Session management with connect-pg-simple

**Server Architecture:**
- Middleware-based request processing
- JSON request/response handling with raw body preservation for webhooks
- Request logging with duration tracking for API calls
- Vite integration for development with HMR support
- Production static file serving

### Data Storage Solutions

**Database:**
- PostgreSQL (configured via DATABASE_URL environment variable)
- Drizzle ORM with schema migrations in `/migrations` directory
- Shared schema definition at `shared/schema.ts`

**Schema Design:**
- `customers` - User accounts with wallet balances, VIP levels, task tracking
- `withdrawals` - Withdrawal requests with status tracking and bank details
- `products` - Task/product catalog with pricing and image metadata
- `admins` - Administrative user accounts
- `dailyCheckIns` - Check-in reward configuration
- `vipLevels` - VIP tier configuration with task and commission rules

**Data Models:**
- Decimal precision for financial amounts (10,2)
- UUID primary keys via `gen_random_uuid()`
- Timestamp tracking for created/updated records
- Boolean flags for feature toggles (allowTask, allowWithdraw, etc.)
- Reference codes for customer identification

### Authentication and Authorization

**Current Implementation:**
- Team-based access control (TEAM 1 - RUPEE badge visible in header)
- Admin identification via "updatedBy" tracking in mutations
- Session-based authentication using express-session with PostgreSQL store

**Security Considerations:**
- Login and pay passwords stored for customers
- IP tracking for customer registration (address, country, region, ISP)
- Credit score system for customer trustworthiness

### External Dependencies

**Third-Party UI Libraries:**
- Radix UI primitives for accessible component foundation
- Lucide React for iconography
- Embla Carousel for carousel functionality
- CMDK for command palette
- date-fns for date manipulation

**Development Tools:**
- Replit-specific plugins (cartographer, dev-banner, runtime-error-modal)
- tsx for TypeScript execution in development
- esbuild for production server bundling

**Database:**
- Neon Serverless PostgreSQL (@neondatabase/serverless)
- Drizzle ORM with PostgreSQL dialect
- connect-pg-simple for session storage

**Validation:**
- Zod for runtime validation
- drizzle-zod for schema-based validation
- @hookform/resolvers for form validation integration

**Styling:**
- Tailwind CSS with PostCSS
- class-variance-authority for variant management
- clsx and tailwind-merge for className utilities