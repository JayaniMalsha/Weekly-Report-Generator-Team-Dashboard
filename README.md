# Weekly Report Generator & Team Dashboard (TeamSync Pro)

A production-grade, full-stack multi-user web application that allows individual team members to submit structured weekly work reports, allows managers to review those reports and send them back for correction when needed, and gives managers a consolidated dashboard to view and analyze reports across the entire team.

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**:
  - **`TEAM_MEMBER`**: Can create, edit, save drafts, and submit their own weekly reports. Strictly isolated from viewing other members' reports.
  - **`MANAGER`**: Can view and analyze reports across all team members, review/approve/request changes with comments, inspect visual insights, and manage projects.
  - **`ADMIN`**: Complete user and role management console, project administration, and all manager review capabilities.
- **Strict & Standardized Weekly Report Structure**:
  - Fixed schema in exact order across all team members ensuring 100% comparability on the manager dashboard:
    1. Reporting Week & Year with automated ISO date range and Friday 18:00 cutoff.
    2. Project / Work Category tag.
    3. Tasks Completed table (task title, priority, planned % vs actual %, status, time planned vs actual hours, output deliverable).
    4. Tasks Planned for Next Week.
    5. Blockers & Challenges (with key blocker flag).
    6. Achievements & Highlights (with key win flag).
    7. Hours Worked breakdown by task type (Development, Testing, Meetings, Documentation, DevOps, Other).
    8. General Notes and External Deliverable Links.
- **End-to-End Review & Correction Workflow**:
  - `Draft` ➔ `Submitted` ➔ `Needs Correction` ➔ `Approved`.
  - When changes are requested, the manager leaves a general comment and the report status updates to `Needs Correction`.
  - The team member clearly sees the manager's comment on their report page, edits the report, and resubmits it back to `Submitted`.
  - Managers can review and approve, but **cannot overwrite or rewrite** team members' report content.
- **Report Version History (Bonus & Auditability)**:
  - Each correction cycle preserves an immutable snapshot of the report's content in the `ReportVersion` table.
  - The manager and author can inspect any past submitted version alongside the current one, and see which review comment was made against which version.
- **Team Dashboard & Section Comparator**:
  - 4 Executive KPI metrics: Reports Submitted, Compliance Rate (with on-time vs late indicators), Needs Correction count, Open Blockers count.
  - 5-Status tracking per member for a selected week: `Draft`, `Submitted`, `Needs Correction`, `Approved`, and derived `Not Yet Started`.
  - Side-by-Side Section Comparator: Horizontal matrix view to inspect Blockers or Achievements across all team members at once.
- **Visual Insights & Recharts Analytics**:
  - Task completion velocity trend over time.
  - Submission & approval status breakdown per team member.
  - Workload and task distribution by project.
  - Team-wide hours spent by activity type.
  - Live activity feed of recent submissions and review decisions.
- **AI Team Intelligence Assistant (Bonus)**:
  - In-app floating chat widget + dedicated intelligence workspace.
  - Grounded RAG over actual team report records in SQLite/PostgreSQL.
  - Answers natural language questions about team tasks, blockers, and generates one-click executive summaries.
- **OpenAPI / Swagger Interactive Documentation**:
  - Live at `http://localhost:5000/api/docs`.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide React, React Router v6, Axios |
| **Backend** | Node.js, Express, Prisma ORM, JSON Web Tokens (JWT), BcryptJS |
| **Database** | SQLite (Default frictionless local evaluation) / PostgreSQL (Production ready) |
| **Testing** | Jest, Supertest (13 automated tests covering RBAC & Review Workflow) |
| **API Docs** | OpenAPI 3.0 & Swagger UI |

---

## 🚀 Setup & Run Instructions

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

---

### 1) Running the Database & Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Sync database schema (Prisma automatically initializes the local SQLite database `dev.db` with foreign keys and relations):
   ```bash
   npm run prisma:push
   ```
4. Seed the database with multi-user, multi-week demo data (Weeks 34, 35, 36 in different statuses):
   ```bash
   npm run seed
   ```
5. Start the backend API server:
   ```bash
   npm start
   ```
   *The backend will be running at `http://localhost:5000`.*  
   *Interactive Swagger API documentation will be available at `http://localhost:5000/api/docs`.*

---

### 2) Running the Frontend

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at **`http://localhost:5173`**.

---

### 3) Running Automated Tests

To run the automated test suite covering Role-Based Access Control and the Report Review & Correction lifecycle:

```bash
cd backend
npm test
```

Expected output:
```
PASS tests/workflow.test.js
PASS tests/rbac.test.js

Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
```

---

## 🔑 Pre-Seeded Test Accounts

You can log in manually or use the **One-Click Instant Evaluation Logins** located directly on the login page (`http://localhost:5173/login`) or the Navbar Persona Switcher:

| Role | Name | Email | Password | Pre-Seeded Context |
|---|---|---|---|---|
| **ADMIN** | Victoria Vance | `admin@example.com` | `Password123!` | Executive leadership, User Management & Role Assignment |
| **MANAGER** | David Miller | `manager@example.com` | `Password123!` | Reviews all reports, approves/requests changes, dashboard analytics |
| **TEAM MEMBER** | Alex Rivera | `alex@example.com` | `Password123!` | Frontend dev; has reports in Approved & Submitted status |
| **TEAM MEMBER** | Sarah Chen | `sarah@example.com` | `Password123!` | Cloud/AI dev; has reports in Approved & Draft status |
| **TEAM MEMBER** | Marcus Johnson | `marcus@example.com` | `Password123!` | QA Engineer; report currently in **Needs Correction** status |
| **TEAM MEMBER** | Elena Rostova | `elena@example.com` | `Password123!` | Designer; has **Not Yet Started** report for active week |

---

## 📚 REST API Documentation

The backend includes interactive OpenAPI / Swagger documentation at:
**`http://localhost:5000/api/docs`**

### Core API Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET  /api/auth/me` — Retrieve authenticated user profile (Bearer token required).

#### Weekly Reports (`/api/reports`)
- `GET  /api/reports` — List reports with pagination (`page`, `limit`) and filters (`userId`, `projectId`, `status`, `weekNumber`, `year`, `isLate`, `search`).
- `POST /api/reports/draft` — Save or update report draft (strict field schema).
- `POST /api/reports/:id/submit` — Submit report for review (records submission timestamp, checks late cutoff, creates `ReportVersion`).
- `GET  /api/reports/:id` — Read single report detail (enforces RBAC: author or manager/admin only).
- `POST /api/reports/:id/review` — Review report (`APPROVE` or `REQUEST_CHANGES` with feedback comment) [Manager/Admin only].
- `GET  /api/reports/:id/versions` — Get full version history snapshots linked to review comments.

#### Analytics & Dashboard (`/api/analytics`)
- `GET /api/analytics/dashboard` — Summary KPIs and 5-status team member overview (`Draft`, `Submitted`, `Needs Correction`, `Approved`, `Not Yet Started`).
- `GET /api/analytics/insights` — Velocity trends, member submission distributions, workload, team hours breakdown, and activity audit feed.
- `GET /api/analytics/comparator` — Horizontal side-by-side section comparison (Blockers, Achievements, Planned Tasks).

#### Projects & Work Categories (`/api/projects`)
- `GET    /api/projects` — List all active and archived projects.
- `POST   /api/projects` — Create new project [Manager/Admin only].
- `PUT    /api/projects/:id` — Update project details and color codes [Manager/Admin only].
- `DELETE /api/projects/:id` — Remove project [Manager/Admin only].

#### Users Administration (`/api/users`)
- `GET    /api/users` — List all team members with stats [Manager/Admin only].
- `GET    /api/users/:id/profile` — Team member profile with compliance rate, total tasks, and full reporting history.
- `POST   /api/users` — Invite / create user account [Admin only].
- `PUT    /api/users/:id` — Update user details or change role [Admin only].
- `DELETE /api/users/:id` — Remove user [Admin only].

#### AI Team Intelligence (`/api/ai`)
- `POST /api/ai/chat` — Ask natural language questions grounded on actual team report data.
- `GET  /api/ai/summary` — Generate structured executive summary for a selected week.

---

## 🗄️ Database: Switching to PostgreSQL for Production

While SQLite is configured by default for zero-setup evaluation, the architecture is 100% compatible with PostgreSQL:

1. Update `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/weekly_reports?schema=public"
   ```
3. Run migrations and seed:
   ```bash
   npm run prisma:push
   npm run seed
   ```

---

## 📁 Repository Deliverables

- **Frontend Code**: `frontend/`
- **Backend Code**: `backend/`
- **Entity Relationship Diagram**: `docs/ER_DIAGRAM.svg` & `docs/ER_DIAGRAM.md`
- **Google Slides Presentation Guide**: `docs/PRESENTATION.md`
- **Video Walkthrough Script**: `docs/DEMO_SCRIPT.md`
- **Automated Tests**: `backend/tests/`
