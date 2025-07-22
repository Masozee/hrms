# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development:**
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

**Database Operations (Local SQLite - Deprecated):**
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:migrate` - Apply pending migrations to database
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:seed` - Create admin user account
- `npm run db:create-user` - Create new staff user
- `npm run db:sample-data` - Seed database with sample data

## Architecture Overview

This is a **hotel management system frontend** built with Next.js App Router that connects to an external HRMS API backend. The system manages reservations, rooms, guests, housekeeping, billing, and reporting.

**Tech Stack:**
- **Framework:** Next.js 15 with App Router
- **Backend API:** External HRMS API at `localhost:8000`
- **Authentication:** Basic Auth (admin/admin123) + Token-based authentication
- **UI:** Radix UI components with Tailwind CSS
- **PDF Generation:** @react-pdf/renderer for invoices

**Backend API Integration:**
- **Base URL:** Configurable via `NEXT_PUBLIC_API_URL` environment variable (default: `http://localhost:8000/api/v1/`)
- **Authentication:** 
  - Initial login: Configurable via `NEXT_PUBLIC_BACKEND_USERNAME` and `NEXT_PUBLIC_BACKEND_PASSWORD` (default: `admin/admin123`)
  - Token authentication via `Authorization: Token <token>` header
  - Login endpoint: `POST /api-token-auth/`
- **Data Format:** All requests/responses use JSON
- **Currency:** All monetary values in Rupiah (Rp)

**API Documentation:**
- `swagger.json` - Complete OpenAPI specification for all endpoints
- `backend_api.md` - API usage guidelines and authentication details
- `backend_feature.md` - Comprehensive feature documentation for all modules

**Key API Modules:**
- **Staff Management:** `/api/v1/users/staff/` - Employee profiles, departments, positions
- **Hotel Management:** `/api/v1/hotel/` - Rooms, reservations, rates, housekeeping tasks
- **Restaurant Management:** `/api/v1/restaurant/` - Menu items, tables, orders
- **Guest Management:** `/api/v1/guest/` - Guest profiles, loyalty programs
- **Attendance & Scheduling:** `/api/v1/attendance/` - Check-in/out, schedules, leave requests
- **Billing & Payments:** `/api/v1/billing/` - Invoices, payments, financial tracking
- **Inventory Management:** `/api/v1/inventory/` - Items, suppliers, purchase orders
- **Housekeeping:** `/api/v1/housekeeping/` - Room cleaning, task assignments, maintenance
- **Reports & Analytics:** `/api/v1/reports/` - Occupancy, revenue, performance reports
- **System Administration:** `/api/v1/administration/` - Audit logs, system configuration

**Frontend Application Structure:**
- `/src/app/` - Next.js App Router pages for each module
- `/components/` - Reusable UI components organized by feature
- `/lib/` - API utilities, authentication helpers, currency formatting
- `/types/` - TypeScript type definitions for API responses
- `/contexts/` - React context for authentication state management

**Authentication Flow:**
1. User logs in with admin/admin123 credentials
2. Frontend calls `/api-token-auth/` to get authentication token
3. Token stored in session/context for subsequent API calls
4. All API requests include `Authorization: Token <token>` header

**API Request Patterns:**
- **Filtering:** Use query parameters (e.g., `?status=available`, `?department__name=Engineering`)
- **Pagination:** Standard pagination with `limit`/`offset` or `page`/`page_size`
- **Related Fields:** Access via double underscore (e.g., `room__room_number=101`)

**Development Guidelines:**
- All data operations should use the external API, not local SQLite
- Implement proper error handling for API requests
- Use authentication token for all API calls
- Follow the API patterns documented in `backend_api.md`
- Reference `backend_feature.md` for complete feature specifications
- Handle currency formatting for Rupiah values consistently
- always check the api before integrating
- dont use mock data
- All Using Rupiah Instead of USD