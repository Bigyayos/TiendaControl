# Store Management System

## Overview

This is a full-stack web application designed for managing retail stores, including tracking sales, employees, objectives, and generating reports. The system provides a comprehensive dashboard for store managers to monitor performance and manage their operations effectively.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Development**: tsx for TypeScript execution in development
- **Build System**: Vite for frontend bundling, esbuild for server bundling

### Database Layer
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Drizzle-Zod for type-safe schema validation

## Key Components

### Core Entities
1. **Stores**: Physical store locations with managers, employee counts, and monthly objectives
2. **Employees**: Staff members assigned to stores with roles (manager/vendedor)
3. **Sales**: Individual sales transactions linked to stores and employees
4. **Objectives**: Performance targets for stores across different time periods

### User Interface Components
- **Dashboard**: Overview with key metrics, charts, and performance indicators
- **Stores Management**: CRUD operations for store locations
- **Sales Tracking**: Record and view sales transactions
- **Employee Management**: Staff administration and assignment
- **Objectives Setting**: Define and track performance goals
- **Reports**: Data visualization and analytics

### Form Components
- Store creation/editing forms
- Employee management forms
- Sales entry forms
- Objective setting forms

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **API Layer**: Express.js routes handle HTTP requests and validate input
3. **Data Processing**: Business logic processes requests and interacts with database
4. **Database Operations**: Drizzle ORM executes SQL queries against PostgreSQL
5. **Response**: JSON data flows back through the stack to update UI components
6. **State Management**: TanStack Query caches responses and manages loading states

## External Dependencies

### Frontend Libraries
- **UI Components**: Comprehensive Radix UI component library
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date manipulation
- **Validation**: Zod for runtime type validation

### Backend Libraries
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development Tools**: Various development and build utilities

### Development Tools
- **Vite**: Modern build tool with HMR support
- **TypeScript**: Strong typing throughout the application
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with instant updates
- **Database**: Uses DATABASE_URL environment variable for connection
- **Port Configuration**: Runs on port 5000 with external port 80 mapping

### Production Build
- **Frontend**: Vite builds optimized React application
- **Backend**: esbuild bundles server code for Node.js runtime
- **Static Assets**: Frontend assets served from dist/public directory
- **Database Migrations**: Drizzle Kit manages schema updates

### Replit Configuration
- **Modules**: Node.js 20, web development, and PostgreSQL 16
- **Autoscale Deployment**: Configured for automatic scaling
- **Development Workflow**: Integrated run button and workflow management

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Feminine color palette suitable for women's shoe and clothing boutique.

## Changelog

Changelog:
- June 25, 2025. Initial setup
- June 25, 2025. Updated with real store locations: Ayala, San Sebastian, Sevilla, Málaga, Marbella, Doha, Perú
- June 25, 2025. Fixed chart visualization issues and SelectItem errors
- June 25, 2025. Added comprehensive sample data for all stores and employees
- June 27, 2025. Updated color palette to feminine theme with pinks, roses, and gold accents for women's boutique