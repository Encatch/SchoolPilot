# EduManage - School Management System

## Overview

EduManage is a comprehensive school management system built with React, TypeScript, Express.js, and PostgreSQL. The application provides role-based dashboards for administrators, teachers, and parents to manage students, classes, attendance, fees, assignments, and communications. The system features a modern UI with Tailwind CSS and shadcn/ui components, implementing a full-stack architecture with authentication via Replit's OAuth system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **Routing**: Wouter for client-side routing with role-based navigation
- **State Management**: React Query (@tanstack/react-query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with role-based route protection
- **Authentication**: Replit OAuth integration with session management
- **Middleware**: Custom logging, error handling, and authentication middleware

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL via Neon serverless
- **Schema Management**: Type-safe schema definitions with Drizzle-Zod integration
- **Sessions**: PostgreSQL session store using connect-pg-simple

### Authentication & Authorization
- **Provider**: Replit OAuth with OpenID Connect
- **Session Management**: Express sessions stored in PostgreSQL
- **Role System**: Three-tier role system (admin, teacher, parent)
- **Route Protection**: Middleware-based authentication checks on API routes

### Data Models
The system manages the following core entities:
- **Users**: Base user accounts with role assignment
- **Teachers**: Extended user profiles with subject specialization and experience
- **Students**: Student records with class assignments and parent relationships
- **Classes**: Academic classes with teacher assignments and capacity limits
- **Attendance**: Daily attendance tracking per class
- **Assignments**: Homework and project management with submissions
- **Fees**: Fee structure definition and payment tracking
- **Notifications**: System-wide messaging and alerts

### Development Tools
- **Build System**: Vite for frontend, ESBuild for backend production builds
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Development Experience**: Hot reload, error overlays, and Replit integration plugins

### Deployment Architecture
- **Environment**: Replit hosting with automatic deployments
- **Static Assets**: Vite-built frontend served via Express in production
- **Environment Variables**: Database URL and session secrets via environment configuration
- **Process Management**: Single Node.js process serving both API and static files

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection Management**: @neondatabase/serverless with WebSocket support

### Authentication Services
- **Replit OAuth**: OpenID Connect integration for user authentication
- **Session Storage**: PostgreSQL-backed session management

### UI Component Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form state management and validation

### Development Services
- **Replit Platform**: Development environment and hosting
- **Vite Plugins**: Runtime error handling and development tools integration

### Utility Libraries
- **Date Handling**: date-fns for date manipulation and formatting
- **Class Management**: clsx and tailwind-merge for conditional styling
- **Validation**: Zod schemas for runtime type validation