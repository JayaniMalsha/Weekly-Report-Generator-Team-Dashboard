# Entity Relationship (ER) Diagram

## Overview
This document details the relational data model for the **Weekly Report Generator & Team Dashboard** application. The database architecture is built using **Prisma ORM** with native support for both **PostgreSQL** (production deployment) and **SQLite** (frictionless local evaluation).

---

## Visual ER Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ REPORT : "creates / authors"
    USER ||--o{ REVIEW_COMMENT : "authors review feedback"
    USER ||--o{ REPORT_VERSION : "submits snapshot"
    USER ||--o{ USER_PROJECT : "assigned to"

    PROJECT ||--o{ REPORT : "categorizes"
    PROJECT ||--o{ USER_PROJECT : "has team members"

    REPORT ||--o{ TASK : "contains task table items"
    REPORT ||--o{ REVIEW_COMMENT : "receives reviews"
    REPORT ||--o{ REPORT_VERSION : "has version history snapshots"

    REVIEW_COMMENT ||--o| REPORT_VERSION : "links comment to version reviewed"

    USER {
        string id PK "UUID"
        string email UK "Unique lowercase email"
        string password "Bcrypt hashed password"
        string name "User full name"
        string role "TEAM_MEMBER | MANAGER | ADMIN"
        string department "Department name (e.g. Engineering)"
        string avatar "Optional avatar URL"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Update timestamp"
    }

    PROJECT {
        string id PK "UUID"
        string name "Project / Category title"
        string code UK "Unique project uppercase code"
        string description "Scope & objectives"
        string color "Hex color code for UI badges"
        string status "Active | On Hold | Completed"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Update timestamp"
    }

    USER_PROJECT {
        string id PK "UUID"
        string userId FK "References USER.id"
        string projectId FK "References PROJECT.id"
        datetime assignedAt "Assignment timestamp"
    }

    REPORT {
        string id PK "UUID"
        string userId FK "References USER.id"
        string projectId FK "References PROJECT.id"
        int weekNumber "ISO Week Number (1-53)"
        int year "Calendar Year"
        datetime startDate "Monday 00:00 UTC"
        datetime endDate "Sunday 23:59 UTC"
        datetime dueDate "Friday 18:00 UTC deadline"
        string status "Draft | Submitted | Needs Correction | Approved"
        boolean isLate "True if submittedAt > dueDate"
        datetime submittedAt "Submission timestamp"
        datetime approvedAt "Approval timestamp"
        string tasksPlannedNextWeek "JSON array of deliverables"
        string blockers "JSON array of [{ id, text, isKey }]"
        string achievements "JSON array of [{ id, text, isKey }]"
        string hoursBreakdown "JSON object of hours by task type"
        string notes "General markdown notes"
        string links "Artifact URLs & ticket links"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Update timestamp"
    }

    TASK {
        string id PK "UUID"
        string reportId FK "References REPORT.id"
        string name "Task description"
        string priority "Low | Medium | High | Urgent"
        int plannedPercent "Planned completion % (0-100)"
        int actualPercent "Actual completion % (0-100)"
        string status "Completed | In Progress | Blocked | Delayed"
        float timePlannedHours "Estimated hours"
        float timeSpentHours "Actual hours logged"
        string outputDeliverable "Tangible deliverable / PR link"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Update timestamp"
    }

    REVIEW_COMMENT {
        string id PK "UUID"
        string reportId FK "References REPORT.id"
        string authorId FK "References USER.id (Manager/Admin)"
        string action "APPROVE | REQUEST_CHANGES"
        string comment "Feedback message describing required changes or approval"
        int versionNumber "Target version number under review"
        datetime createdAt "Decision timestamp"
    }

    REPORT_VERSION {
        string id PK "UUID"
        string reportId FK "References REPORT.id"
        int versionNumber "Incremental version (1, 2, 3...)"
        datetime submittedAt "Snapshot submission timestamp"
        string submittedById FK "References USER.id"
        string snapshot "Complete JSON dump of report tasks, hours, blockers"
        string reviewCommentId FK "References REVIEW_COMMENT.id"
        string statusAtSnapshot "Submitted | Needs Correction | Approved"
        datetime createdAt "Snapshot timestamp"
    }
```

---

## Architectural Highlights

1. **Strict Versioning & Audit Trail (`ReportVersion`)**:
   - Every time a user submits or resubmits a report, an immutable snapshot is persisted in `ReportVersion`.
   - The `reviewCommentId` foreign key links the manager's review decision directly to the specific submitted version. This allows reviewers to easily see which feedback was given against which version.

2. **Derived Statuses & Deadline Latency**:
   - `REPORT.dueDate` represents Friday 18:00 UTC. When `submittedAt > dueDate`, `isLate` is automatically set to `true`.
   - On the Manager Dashboard, team members who have not yet started a report for the active week are derived dynamically as **`Not Yet Started`**, providing complete 5-status visibility:
     `Draft`, `Submitted`, `Needs Correction`, `Approved`, `Not Yet Started`.

3. **Composite Unique Constraints**:
   - `@@unique([userId, weekNumber, year])`: Enforces that a team member can have at most one report per calendar week.
   - `@@unique([userId, projectId])`: Prevents duplicate project assignment records.
