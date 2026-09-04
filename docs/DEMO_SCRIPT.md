# Video Explanation & Walkthrough Script

> **Video Guidelines**:
> - Camera ON with your face visible throughout the presentation.
> - Stay within the web browser UI (no raw terminal or SQL queries needed).
> - Target length: **5 to 8 minutes**.

---

## Pre-Recording Checklist
1. Start backend server:
   ```bash
   cd backend
   npm run start
   ```
2. Start frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open browser at `http://localhost:5173`.
4. Ensure the pre-seeded accounts are loaded (`npm run seed` in backend).

---

## Step-by-Step Video Walkthrough Script

### 1. Introduction (0:00 - 0:45)
- **Face on camera**: Introduce yourself:
  > *"Hi everyone, my name is [Your Name], and today I am presenting my technical assignment: the Weekly Report Generator & Team Dashboard."*
- State the objective:
  > *"This is a full-stack multi-user application designed to solve engineering visibility challenges. It features structured weekly work reporting, a strict review and correction cycle, executive team analytics, and role-based access control across Team Members, Managers, and Admins."*
- Briefly highlight the tech stack: React 18, Vite, Tailwind CSS, Recharts, Node.js Express REST API, Prisma ORM, and SQLite/PostgreSQL.

---

### 2. Team Member Experience & Structured Report Creation (0:45 - 2:00)
- **Show Login Screen**:
  - Point out the **One-Click Instant Evaluation Logins** at the bottom of the login card.
  - Click **Team Member (Alex Rivera)** to log in instantly.
- **Show Personal Report Page (`/report/current`)**:
  - Emphasize the **fixed, standard structure**:
    1. Reporting Week & Date Range
    2. Project / Work Category tag (e.g. Client A - Fintech Portal)
    3. Tasks Completed table (show task name, priority dropdown, planned % vs actual %, status, planned vs actual hours, and output deliverables)
    4. Tasks planned for next week
    5. Blockers & challenges (demonstrate clicking the **"Mark as Key"** flame button to flag critical blockers)
    6. Achievements & highlights (show the **"Mark as Key"** star button)
    7. Hours worked breakdown by activity (Development, Testing, Meetings, etc.)
    8. General notes and external PR/Figma links.
- **Show Draft Saving & Submission**:
  - Click **Save Draft** → show confirmation message.
  - Explain how team members can return to their draft anytime.

---

### 3. Report History & Multi-User Verification (2:00 - 3:00)
- Click **Report History** in the sidebar (`/history`):
  - Show the chronological log of past weeks (Weeks 34, 35, 36) with status badges (`Approved`, `Submitted`, `Needs Correction`).
  - Demonstrate filtering by status and project.
  - Click **Version History (1)** on a report to open the **Version Drawer**:
    - Show the timestamped submission snapshot and author information.
- **Prove Multi-User Isolation**:
  - Notice that Alex Rivera can **only** see his own reports.
  - Use the **Navbar Persona Switcher** to switch to **Sarah Chen**:
    - Observe that Sarah has her own separate reports (AI R&D Core Engine project) and cannot access Alex's private drafts.

---

### 4. Manager Team Dashboard & Visual Insights (3:00 - 4:30)
- Use the Navbar Switcher to switch to **David Miller (Manager)**:
- **Show Team Dashboard (`/dashboard`)**:
  - Highlight the 4 summary KPI metric cards:
    - Reports Submitted this week (e.g. 3 / 4)
    - Compliance Rate (e.g. 75% with on-time vs late indicators)
    - Reports in Needs Correction status
    - Open Team Blockers (and key critical count).
  - Highlight the **Team Member Submission Table**:
    - Show all 5 statuses: `Approved`, `Submitted`, `Needs Correction`, `Draft`, and **`Not Yet Started`** (Elena Rostova).
    - Point out the red **LATE** submission badge on reports submitted after the Friday 18:00 cutoff.
- **Show Side-by-Side Section Comparator (`/comparator`)**:
  - Switch between **Blockers & Challenges** and **Key Achievements** to show how managers can view every team member's status horizontally side by side in one screen.
- **Show Visual Insights (`/insights`)**:
  - Display the interactive Recharts graphs:
    - Task Completion Velocity Trend over time.
    - Submission / Approval breakdown by team member.
    - Project Workload allocation chart.
    - Team-wide Hours breakdown by task type.
    - Live Activity & Review Feed audit log.

---

### 5. Full Review & Correction Workflow Demonstration (4:30 - 6:00)
> *This is a core requirement of the evaluation.*

- In Manager view, navigate to **Review Reports (`/reviews`)**:
  - Select **Alex Rivera's Week 36 report** (Status: `Submitted`).
  - Click **Review / Take Action** to open the **Manager Review Workspace (`/review/:id`)**:
    - Point out that the manager can see the full report content and version history, but **cannot rewrite the team member's actual text**.
    - Select **Request Changes**.
    - Enter a clear feedback comment:
      > *"Alex, please add the PR link for the dark mode task and specify actual hours spent on the comparator component."*
    - Click **Send Back for Correction** → status updates to `Needs Correction`.
- Switch back to **Alex Rivera (Team Member)**:
  - Open **Weekly Report (`/report/current`)**:
  - Point out the **prominent yellow banner** showing the manager's comment:
    > *"Manager Requested Changes Before Approval: 'Alex, please add the PR link...'"*
  - Add the requested information in the form.
  - Click **Resubmit for Review** → status updates back to `Submitted`.
- Switch back to **David Miller (Manager)**:
  - Open the report again.
  - Click **Inspect Version History**:
    - Show **Version 1** (with the linked `REQUEST_CHANGES` comment) alongside **Version 2** (the new resubmission snapshot)!
  - Select **Approve** and click **Confirm Approval** → status turns green to **Approved**.

---

### 6. Admin Console & Projects (6:00 - 6:45)
- Switch to **Victoria Vance (Admin)**:
- Click **User Management (`/users`)**:
  - Show the user directory with department, role dropdown, and reports count.
  - Demonstrate changing a user's role (`TEAM_MEMBER` ⇄ `MANAGER` ⇄ `ADMIN`).
  - Show the **Invite / Add Member** modal.
- Click **Projects & Categories (`/projects`)**:
  - Show full CRUD capabilities: custom color pickers, project codes, active/completed status toggles.

---

### 7. AI Team Intelligence Assistant Demo (6:45 - 7:30)
- Click the floating **Ask AI Assistant** widget in the bottom-right:
  - Click the quick suggestion: *"What are the critical blockers across projects?"*
  - Show how the AI retrieves real blocker records from the SQLite database and highlights critical issues.
  - Ask: *"Summarize Alex Rivera's progress"*.
  - Show the generated response citing exact tasks and percentage completions.
- Navigate to **AI Team Assistant (`/assistant`)**:
  - Click **Generate Executive Summary** for Week 36.
  - Show the AI-generated workload distribution and blocker overview.

---

### 8. Conclusion (7:30 - 8:00)
- Conclude the demo on camera:
  > *"Thank you for your time. In summary, we have implemented all 10+ required and bonus pages, a strict review lifecycle with complete version snapshots, granular RBAC, and data-driven visual analytics. All code, ER diagrams, presentation slides, and setup instructions are included in the repository."*
