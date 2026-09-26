# Weekly Report Generator & Team Dashboard (TeamSync Pro)

<p align="center">
  A production-grade, full-stack multi-user web application for structured weekly work reporting, manager review and correction workflows, team analytics, project management, and AI-powered team intelligence.
</p>

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC):**
  - **`TEAM_MEMBER`**: Can create one report per reporting week, edit and save drafts, submit their own weekly reports, and resubmit reports after requested corrections. Strictly isolated from viewing other members' reports.
  - **`MANAGER`**: Can view and analyze reports across all team members, review/approve/request changes with comments, inspect visual insights, and manage projects.
  - **`ADMIN`**: Complete user and role management console, project administration, and all manager review capabilities.

- **Strict & Standardized Weekly Report Structure:**
  - Fixed schema in exact order across all team members, ensuring consistent comparison on the manager dashboard:
    1. Reporting Week & Year with automated ISO date range and Friday 18:00 cutoff.
    2. Project / Work Category tag.
    3. Tasks Completed table (task title, priority, planned % vs actual %, status, time planned vs actual hours, output deliverable).
    4. Tasks Planned for Next Week.
    5. Blockers & Challenges (with key blocker flag).
    6. Achievements & Highlights (with key win flag).
    7. Hours Worked breakdown by task type (Development, Testing, Meetings, Documentation, DevOps, Other).
    8. General Notes and External Deliverable Links.

- **End-to-End Review & Correction Workflow:**
  - `Draft` ➔ `Submitted` ➔ `Needs Correction` ➔ `Approved`.
  - When changes are requested, the manager leaves a general comment and the report status updates to `Needs Correction`.
  - The team member clearly sees the manager's comment on their report page, edits the report, and resubmits it back to `Submitted`.
  - Managers can review and approve reports, but **cannot overwrite or rewrite** team members' report content.

- **Report Version History (Bonus & Auditability):**
  - Each correction cycle preserves an immutable snapshot of the report's content in the `ReportVersion` table.
  - The manager and author can inspect historical submitted versions alongside the current version and see which review comment was associated with each version.

- **Team Dashboard & Section Comparator:**
  - 4 Executive KPI metrics: Reports Submitted, Compliance Rate with on-time vs late indicators, Needs Correction count, and Open Blockers count.
  - 5-status tracking per member for a selected week: `Draft`, `Submitted`, `Needs Correction`, `Approved`, and derived `Not Yet Started`.
  - Side-by-Side Section Comparator: Horizontal matrix view to inspect Blockers or Achievements across all team members at once.

- **Visual Insights & Recharts Analytics:**
  - Task completion velocity trend over time.
  - Submission and approval status breakdown per team member.
  - Workload and task distribution by project.
  - Team-wide hours spent by activity type.
  - Activity feed of recent submissions and review decisions.

- **AI Team Intelligence Assistant (Bonus - Manager & Admin Only):**
  - Role-protected: Manager and Admin only. Team Members receive `403 Forbidden` when attempting to access protected AI endpoints.
  - In-app floating chat widget and dedicated intelligence workspace for Managers and Admins.
  - Grounded AI responses using actual team report records stored in PostgreSQL.
  - Answers natural language questions about team tasks and blockers and generates one-click executive summaries.

- **OpenAPI / Swagger Interactive Documentation:**
  - Available locally at `http://localhost:5000/api/docs`.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide React, React Router v6, Axios |
| **Backend** | Node.js, Express, Prisma ORM, JSON Web Tokens (JWT), BcryptJS |
| **Database** | PostgreSQL (Relational database with schema enforcement) |
| **Testing** | Jest, Supertest (covering RBAC & Review Workflow) |
| **API Docs** | OpenAPI 3.0 & Swagger UI |

---

## 🚀 Setup & Run Instructions

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)
- PostgreSQL database instance

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
3. Configure `backend/.env` with your PostgreSQL connection string:
   ```env
   DATABASE_URL="your database url add"
   ```
4. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
5. Apply the Prisma database migration:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database with multi-user, multi-week demo data:
   ```bash
   npm run seed
   ```
6. Start the backend API server:
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

## 🔑 **Pre-Seeded Test Accounts**

You can use the **One-Click Instant Evaluation Logins** available directly on the login page (`http://localhost:5173/login`).

| Role            | Name           | Pre-Seeded Context                                                  |
| --------------- | -------------- | ------------------------------------------------------------------- |
| **ADMIN**       | Victoria Vance | Executive leadership, User Management & Role Assignment             |
| **MANAGER**     | David Miller   | Reviews all reports, approves/requests changes, dashboard analytics |
| **TEAM MEMBER** | Alex Rivera    | Frontend Developer; reports in Approved & Submitted status          |
| **TEAM MEMBER** | Sarah Chen     | Cloud/AI Developer; reports in Approved & Draft status              |
| **TEAM MEMBER** | Marcus Johnson | QA Engineer; report currently in **Needs Correction** status        |
| **TEAM MEMBER** | Elena Rostova  | Designer; **Not Yet Started** report for the active week            |

---

## 📚 **REST API Documentation**

The backend includes interactive **OpenAPI / Swagger documentation**, available locally at:

**`http://localhost:5000/api/docs`**

### Core API Endpoints

#### Authentication (`/api/auth`)

* `POST /api/auth/register` — Register a new user account.
* `POST /api/auth/login` — Sign in and receive a JWT token.
* `GET /api/auth/me` — Retrieve the authenticated user's profile (Bearer token required).

#### Weekly Reports (`/api/reports`)

* `GET /api/reports` — List reports with pagination (`page`, `limit`) and filters (`userId`, `projectId`, `status`, `weekNumber`, `year`, `isLate`, `search`).
* `POST /api/reports/draft` — Save or update a report draft using the defined report schema.
* `POST /api/reports/:id/submit` — Submit a report for review, record the submission timestamp, check the late cutoff, and create a `ReportVersion`.
* `GET /api/reports/:id` — Retrieve a single report (author or Manager/Admin only).
* `POST /api/reports/:id/review` — Review a report (`APPROVE` or `REQUEST_CHANGES` with feedback) [Manager/Admin only].
* `GET /api/reports/:id/versions` — Retrieve full report version history and associated review comments.

#### Analytics & Dashboard (`/api/analytics`)

* `GET /api/analytics/dashboard` — Summary KPIs and 5-status team member overview (`Draft`, `Submitted`, `Needs Correction`, `Approved`, `Not Yet Started`).
* `GET /api/analytics/insights` — Velocity trends, member submission distributions, workload, team hours breakdown, and activity audit feed.
* `GET /api/analytics/comparator` — Side-by-side section comparison for Blockers, Achievements, and Planned Tasks.

#### Projects & Work Categories (`/api/projects`)

* `GET /api/projects` — List all active and archived projects.
* `POST /api/projects` — Create a new project [Manager/Admin only].
* `PUT /api/projects/:id` — Update project details and color codes [Manager/Admin only].
* `DELETE /api/projects/:id` — Delete a project [Manager/Admin only].

#### Users Administration (`/api/users`)

* `GET /api/users` — List all team members with statistics [Manager/Admin only].
* `GET /api/users/:id/profile` — Retrieve a team member profile, compliance rate, task statistics, and reporting history.
* `POST /api/users` — Create a user account [Admin only].
* `PUT /api/users/:id` — Update user details or change role [Admin only].
* `DELETE /api/users/:id` — Remove a user [Admin only].

#### AI Team Intelligence (`/api/ai`)

* `POST /api/ai/chat` — Ask natural language questions grounded in actual team report data [Manager/Admin only].
* `GET /api/ai/summary` — Generate a structured executive summary for a selected week [Manager/Admin only].

---

## 🗄️ **Database**

TeamSync Pro uses **PostgreSQL** as its relational database, with **Prisma ORM** for database access, schema management, and migrations.

1. Configure `backend/prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Configure `DATABASE_URL` in `backend/.env`:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/weekly_reports?schema=public"
   ```

3. Generate the Prisma client:

   ```bash
   npx prisma generate
   ```

4. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

5. Seed the database:

   ```bash
   npm run seed
   ```

---

## 📁 **Repository Deliverables**

* **Frontend Code**: `frontend/`
* **Backend Code**: `backend/`
* **Entity Relationship Diagram**: `docs/ER_DIAGRAM.svg` & `docs/ER_DIAGRAM.md`
* **Google Slides Presentation Guide**: `docs/PRESENTATION.md`
* **Video Walkthrough Script**: `docs/DEMO_SCRIPT.md`
* **Automated Tests**: `backend/tests/`
