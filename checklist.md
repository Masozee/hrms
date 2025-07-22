---
description: checklist
alwaysApply: false
---
# 🏨 Hotel Management App — Product Requirements Document (PRD)

## 1. Project Overview

**Goal:**  
Develop an internal hotel property management system (PMS) for hotel staff to manage room bookings, check-ins/outs, guest information, housekeeping, billing, and reporting.

**Users:**  
- Front desk staff  
- Housekeeping staff  
- Hotel manager/admin  
- Finance team

**Objectives:**  
- Improve operational efficiency
- Reduce overbooking errors
- Centralize guest data
- Provide real-time room status updates
- Generate business insights through reports

---

## 2. Features & Requirements

### ✅ A. Reservation Management
- [x] Create, view, modify, and cancel reservations
- [x] Search reservations by guest name, date, room number
- [x] Calendar/timeline view of all bookings
- [x] Support group bookings (e.g., events)

### ✅ B. Room Management
- [x] Add/edit room types and inventory
- [x] Update room status (available, occupied, dirty, maintenance)
- [x] Block rooms for maintenance
- [ ] Configure seasonal rates and promotions

### ✅ C. Guest Management
- [x] Guest profiles (contact info, ID, history)
- [x] Store special requests & notes
- [x] Check-in / check-out workflows
- [x] Optional ID verification

### ✅ D. Billing & Payments
- [x] Generate invoices (room, services, taxes)
- [x] Record payments (cash, card, online)
- [ ] Support split billing (room, minibar, etc.)
- [x] View payment status (paid, pending, refunded)

### ✅ E. Housekeeping
- [x] Assign cleaning tasks to staff
- [x] Mark rooms as cleaned/inspected
- [x] Real-time updates for room status

### ✅ F. Reporting & Analytics
- [x] Occupancy rate reports
- [x] Daily/monthly revenue reports
- [x] Metrics (ADR, RevPAR)
- [ ] Export reports to PDF/Excel

### ✅ G. Staff/Admin Management
- [x] Create/manage staff accounts
- [x] Role-based access control
- [ ] Activity/audit logs
- [ ] System configuration (taxes, fees, policies)

### ✅ H. Integrations (Optional)
- [ ] Channel manager (OTA sync)
- [ ] Booking engine for hotel website
- [ ] POS system for restaurants/spa

### ✅ I. Mobile/Tablet Support
- [x] Responsive design for tablets
- [x] Housekeeping mobile module
- [x] System notifications and alerts dashboard

---

## 3. Non-Functional Requirements

- [x] Secure user authentication (RBAC)
- [x] Data encryption at rest & in transit (NextAuth + bcrypt)
- [ ] Reliable backups & recovery
- [ ] GDPR/local privacy compliance
- [ ] High availability & performance
- [ ] Multi-language & multi-currency support

---

## 4. Success Metrics

- 0% overbooking incidents
- 50% faster check-in/check-out time
- Accurate daily occupancy & revenue reports
- 95% staff adoption within 3 months

---

# ✅ Hotel Management App — Development Checklist

## 🗂️ Planning
- [x] Finalize requirements & user stories
- [ ] Create wireframes for key screens
- [x] Define database schema
- [x] Choose tech stack (Next.js + Drizzle ORM + SQLite)

## ⚙️ Core Modules

**Reservations**
- [x] Create/update/cancel bookings
- [x] Room availability checking
- [x] Confirmation number generation
- [x] Status filtering and management
- [x] Guest and room association
- [x] Automatic rate calculation
- [x] Calendar view with monthly timeline
- [x] Group booking support for events and conferences

**Rooms**
- [x] CRUD for rooms
- [x] Room status updates (available, occupied, dirty, maintenance, blocked)
- [x] Room type management (single, double, suite, deluxe, family)
- [x] Rate management and occupancy limits
- [x] Search and filtering by status
- [x] Amenities and description management

**Guests**
- [x] CRUD for guest profiles
- [x] Check-in/out flow
- [x] Contact information management
- [x] ID verification fields (passport, license, national ID)
- [x] Special requests and notes
- [x] Search functionality (name, email, phone)
- [x] Guest history tracking

**Housekeeping**
- [x] Task assignment & status updates
- [x] Automatic task creation on checkout
- [x] Priority management (urgent, high, normal, low)
- [x] Task type categorization (cleaning, maintenance, inspection)
- [x] Time tracking (start/completion times)
- [x] Room status integration
- [x] Mobile-friendly responsive UI

**Billing**
- [x] Payment amount tracking
- [x] Balance calculation
- [x] Invoice generation
- [x] Payment method tracking
- [x] Receipt generation

**Reporting**
- [x] Occupancy rate and room status reports
- [x] Revenue analytics (ADR, RevPAR)
- [x] Today's check-in/check-out tracking
- [x] Recent reservations overview
- [x] Room type and status breakdown
- [x] Date range filtering for reports
- [x] Real-time dashboard metrics
- [ ] Export functionality (PDF/Excel)

**Admin**
- [x] Staff accounts & permissions
- [x] Role-based access control
- [ ] Audit trail

**Basic Setup**
- [x] Project structure created
- [x] Dependencies installed (Radix UI, Tailwind, Drizzle ORM, SQLite)
- [x] Database schema defined for all tables
- [x] Drizzle ORM configured and migrations run
- [x] Basic page routing structure created
- [x] Dashboard homepage with navigation

**Authentication & Security**
- [x] NextAuth.js integration with credentials provider
- [x] Login/logout pages and functionality
- [x] Session management and middleware protection
- [x] Role-based access control structure
- [x] Staff user creation and management API
- [x] Password hashing with bcryptjs
- [x] Initial admin user creation script

**Advanced Features Implemented**
- [x] Complete check-in/check-out workflow
- [x] Automatic room status management
- [x] Housekeeping task automation on checkout
- [x] Real-time search with debouncing
- [x] Room availability conflict detection
- [x] Responsive design for mobile/tablet use
- [x] Professional UI with card-based layouts
- [x] Comprehensive error handling
- [x] Data validation (client & server-side)
- [x] Confirmation workflows for critical actions
- [x] Business intelligence reporting with key hotel metrics
- [x] Revenue tracking and analytics (ADR, RevPAR, occupancy)
- [x] Sample data generation for testing
- [x] Multiple user role support with appropriate permissions
- [x] Professional dashboard with quick actions
- [x] System notifications and alerts for operational events
- [x] Real-time notification badges and priority indicators
- [x] Comprehensive invoice generation with PDF export capability

## 🧪 Testing
- [ ] Unit tests for all modules
- [ ] End-to-end booking flow tests
- [ ] Role-based access tests
- [ ] Load testing for high booking volume

## 📦 Deployment
- [ ] Staging environment
- [ ] Production environment with SSL
- [ ] Backups enabled
- [ ] Monitoring/logging in place

## 🚀 Post-Launch
- [ ] Staff training materials
- [ ] User feedback loop
- [ ] Regular updates & support plan

---

**Author:** [Your Name]  
**Date:** [YYYY-MM-DD]  
