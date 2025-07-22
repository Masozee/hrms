---
description: specification
globs:
alwaysApply: true
---
# 🏨 Hotel Management App — Specification

## 📌 Project Summary

**Goal:**  
An internal hotel management system for staff to manage reservations, rooms, guests, housekeeping, billing, and reporting.

**Tech Stack:**  
- **Framework:** Next.js (App Router)
- **UI Library:** Radix UI
- **Styling:** Tailwind CSS or CSS Modules
- **Database:** SQLite
- **ORM:** Drizzle ORM
- **Auth:** NextAuth.js (optional)
- **Hosting:** Vercel / Railway / Render

---

## ✅ Modules & Routes

| Module           | Routes / UI                     | DB Tables (Drizzle)      |
|------------------|---------------------------------|--------------------------|
| Reservations     | `/reservations`, `/reservation/[id]` | `reservations`           |
| Rooms            | `/rooms`, `/room/[id]`          | `rooms`                  |
| Guests           | `/guests`, `/guest/[id]`        | `guests`                 |
| Payments         | `/payments`, `/payment/[id]`    | `payments`               |
| Housekeeping     | `/housekeeping`                 | `housekeeping_tasks`     |
| Staff / Admin    | `/staff`, `/admin`              | `staff`                  |
| Reports          | `/reports`                      | N/A (uses queries)       |

---

## ✅ Example Directory Structure

```plaintext
.
├── app/
│   ├── page.tsx             # Dashboard
│   ├── reservations/        # Reservation pages
│   ├── rooms/               # Room management
│   ├── guests/              # Guest management
│   ├── housekeeping/        # Housekeeping tasks
│   ├── reports/             # Reporting & analytics
│   ├── api/                 # Next.js API Routes
├── components/              # Radix UI components
├── lib/
│   ├── db.ts                # Drizzle ORM client
│   ├── auth.ts              # Auth helpers
├── schema/                  # Drizzle table definitions
│   ├── reservations.ts
│   ├── rooms.ts
│   ├── guests.ts
│   ├── payments.ts
│   ├── housekeeping.ts
│   ├── staff.ts
├── styles/                  # Tailwind or CSS modules
├── drizzle.config.ts        # Drizzle config
├── .env                     # Environment variables
├── next.config.js           # Next.js config
