# Technical Presentation: Weekly Report Generator & Team Dashboard

> **Deliverable Format**: Copy and paste the slide structure below directly into **Google Slides** or use the structured talking points during your presentation.

---

## Slide 1: Title & Overview
- **Title**: Weekly Report Generator & Role-Based Team Dashboard
- **Subtitle**: Engineering Work Visibility, Structured Correction Cycles, and Predictive Team Analytics
- **Candidate Name**: [Your Name]
- **Stack**: React 18, Vite, Tailwind CSS, Recharts, Node.js, Express, Prisma ORM, SQLite/PostgreSQL, Jest
- **Presenter Notes**:
  - Introduce yourself and the objective of the project: providing a standardized, multi-user weekly reporting platform with a strict review/approval lifecycle and executive analytics.

---

## Slide 2: System Architecture Overview
- **Frontend Layer**:
  - React 18 SPA built with Vite for lightning-fast HMR and bundle optimization.
  - Tailwind CSS for clean, responsive design system.
  - Recharts for visual analytics (velocity trends, time allocation, status distributions).
  - Centralized AuthContext with instant demo persona switching for seamless evaluation.
- **Backend API Layer**:
  - Node.js & Express RESTful API with modular 3-tier structure: Controllers, Services, and Middlewares.
  - Stateless JWT authentication and granular Role-Based Access Control (RBAC).
  - Interactive OpenAPI / Swagger UI live at `/api/docs`.
- **Data Persistence Layer**:
  - Prisma ORM providing strict relational foreign keys, cascades, and ACID transactions.
  - Dual-target design: zero-friction SQLite locally (`file:./dev.db`) + instant switch to PostgreSQL in cloud deployments.

---

## Slide 3: Database Design & ER Architecture
- **Entities & Relationships**:
  - `User`: Handles authentication, department, and role (`TEAM_MEMBER`, `MANAGER`, `ADMIN`).
  - `Project`: Work categories with color badges, descriptions, and code identifiers.
  - `Report`: Central entity with composite unique key `(userId, weekNumber, year)`.
  - `Task`: Detailed task table recording planned % vs actual %, priority, status, and time spent.
  - `ReviewComment`: Audit record of manager decisions (`APPROVE`, `REQUEST_CHANGES`) with explanatory comments.
  - `ReportVersion`: Immutable snapshots capturing report state at every submission, explicitly linked to review comments via `reviewCommentId`.
- **Key Design Decision**:
  - Storing structured deliverables as relational `Task` rows while capturing historical snapshots as immutable JSON dumps in `ReportVersion`. This guarantees complete auditability across correction iterations without polluting operational queries.

---

## Slide 4: Key Frontend Views & Navigation
- **1. Personal Weekly Report Workspace (`/report/current`)**:
  - Strict, fixed field schema: Week/date range, Project tag, Tasks Completed table, Planned tasks next week, Blockers (with key issue toggle), Achievements (with key highlight toggle), Hours breakdown by task type, Notes & Links.
  - Interactive status badges and prominent warning banner displaying manager comments when in `Needs Correction` status.
- **2. Report History Page (`/history`)**:
  - Chronological list of user reports with status filters, project filters, pagination, and one-click version drawer inspection.
- **3. Team Dashboard (`/dashboard`)**:
  - Executive KPI summary cards (compliance rate, open blockers, review backlog).
  - 5-status team compliance table tracking: `Draft`, `Submitted`, `Needs Correction`, `Approved`, and derived `Not Yet Started`.
- **4. Side-by-Side Section Comparator (`/comparator`)**:
  - Unique manager view allowing direct horizontal comparison of all team members' Blockers, Achievements, or Planned Tasks for any chosen week.
- **5. Visual Insights & Activity Feed (`/insights`)**:
  - Task completion velocity, member approval distribution, project workload, and time allocation charts.

---

## Slide 5: Role-Based Access Control (RBAC) & Security
- **Permissions Matrix**:
  | Role | Personal Reports | Team Dashboard & Insights | Review Actions | Project Management | User Management |
  |---|---|---|---|---|---|
  | **TEAM_MEMBER** | Full Access (Own only) | Forbidden (403) | Forbidden (403) | View Only | Forbidden (403) |
  | **MANAGER** | Full Access (Own only) | Full Access | Full Access | Full CRUD | Forbidden (403) |
  | **ADMIN** | Full Access (Own only) | Full Access | Full Access | Full CRUD | Full CRUD & Role Assignment |
- **Security Enforcement**:
  - Enforced at the API route layer via `authMiddleware` and `requireRole(['MANAGER', 'ADMIN'])`.
  - Ownership check: A team member cannot read or mutate another member's report (`report.userId !== req.user.id` returns `403 Forbidden`).
  - Content Integrity: Managers can review and approve reports but **cannot rewrite** team members' report content.

---

## Slide 6: Report Review & Correction Workflow
- **Lifecycle Flow**:
  1. `Draft`: Author edits report freely; only visible to author.
  2. `Submitted`: Author submits report; timestamp recorded, `dueDate` evaluated for `isLate` flag, and `ReportVersion` (v1) snapshot created. Report appears on Manager Dashboard.
  3. `Needs Correction`: Manager reviews report and requests changes with a mandatory feedback comment. Status changes to `Needs Correction`, and comment is linked to Version 1.
  4. `Edit & Resubmit`: Author sees manager feedback in prominent yellow banner, updates tasks/blockers, and resubmits. Status becomes `Submitted`, and `ReportVersion` (v2) is stored.
  5. `Approved`: Manager inspects changes and approves report. Status updates to `Approved`, freezing further modifications.

---

## Slide 7: AI Chat Assistant (RAG Grounding)
- **Concept & Architecture**:
  - Lightweight Retrieval-Augmented Generation (RAG) operating over the actual SQLite / PostgreSQL database.
  - Dual-mode engine:
    - **Cloud Mode**: Direct integration with Gemini / OpenAI API if keys are provided in `.env`.
    - **Local Intelligence Mode**: Offline semantic heuristic engine that parses actual database records to answer questions without external API dependencies.
- **Capabilities**:
  - Natural language Q&A: *"What are the critical blockers this week?"*, *"Summarize Alex's achievements"*, *"Check for workload imbalances"*.
  - One-click Executive Team Summary generator highlighting progress, recurring impediments, and workload distribution.

---

## Slide 8: Challenges Faced & Solutions
1. **Handling Windows Execution Policies & Special Path Characters**:
   - *Challenge*: The workspace folder name contained an ampersand (`&`), which standard Windows shells interpret as a command delimiter.
   - *Solution*: Configured `npm` package scripts with quoted execution paths and invoked Node directly (`node ./node_modules/...`).
2. **Preserving Historical Version Snapshots with Comment Associations**:
   - *Challenge*: Overwriting report records in place caused loss of historical context during correction cycles.
   - *Solution*: Designed a dedicated `ReportVersion` entity with foreign key back to `ReviewComment`, capturing frozen JSON state at each submission.
3. **Tracking Non-Reporting Members ("Not Yet Started")**:
   - *Challenge*: Members with no report had no records in the `Report` table for the active week.
   - *Solution*: Developed a derived query comparing all active team members with weekly report submissions, dynamically generating the `Not Yet Started` state.

---

## Slide 9: Possible Future Improvements
- **Automated Notification Triggers**: Webhook / Slack integration when a manager requests corrections or when a deadline approaches.
- **Git Provider Integration**: Direct OAuth integration with GitHub / GitLab to automatically populate pull requests into the completed tasks table.
- **Customizable Submission Deadlines**: Configurable department-level submission cutoff times with automated timezone adjustment.
- **Export Capabilities**: One-click PDF or executive PowerPoint export of the weekly team dashboard.

---

## Slide 10: Conclusion & Demo Transition
- Summary of evaluation accomplishments:
  - 10+ completed, fully responsive frontend views.
  - End-to-end review lifecycle with immutable version snapshots.
  - 13 passing automated Jest tests verifying RBAC and workflow correctness.
  - Pre-seeded multi-user, multi-week dataset with one-click test persona switcher.
  - Ready for live video demo walkthrough!
