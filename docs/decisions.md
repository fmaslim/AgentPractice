# Decision Log

Purpose: capture every meaningful project decision with context, rationale, and consequences so future-you can understand why choices were made.

## Decision Template

- Date:
- Decision:
- Why:
- Alternatives considered:
- Consequences:

## Decisions

### 2026-07-01 - DEC-0001 - Use an approval-first workflow
- Decision: Work in very small steps and make changes only after explicit user approval.
- Why: Keep scope controlled, reduce rework, and preserve clarity.
- Alternatives considered: Larger batch changes without approval checkpoints.
- Consequences: Slower per step, but higher confidence and traceability.

### 2026-07-01 - DEC-0002 - Establish documentation-first repo foundation
- Decision: Start with AGENTS.md, README.md, NOTES.md, and TODO.md before feature work.
- Why: Define process and accountability before implementation.
- Alternatives considered: Start coding immediately.
- Consequences: Better project hygiene and easier onboarding.

### 2026-07-01 - DEC-0003 - Standardize task tracking with lifecycle states
- Decision: Use Open -> In Progress -> Done status tags in TODO.md with move-on-status-change rule.
- Why: Keep task state explicit and avoid drift.
- Alternatives considered: Free-form checklist without status semantics.
- Consequences: Slightly more maintenance, much clearer progress history.

### 2026-07-01 - DEC-0004 - Choose ASP.NET Core MVC app structure
- Decision: Build a regular .NET Core app with API layer plus controllers, models, and views.
- Why: Matches requested architecture and supports both web UI and API evolution.
- Alternatives considered: Console app; standalone script.
- Consequences: More moving parts than a script, but aligns with long-term app goals.

### 2026-07-01 - DEC-0005 - Add a minimal health API endpoint first
- Decision: Implement /api/health as the first API endpoint.
- Why: Smallest vertical API slice to validate routing and JSON responses.
- Alternatives considered: Start with a broader domain endpoint immediately.
- Consequences: Fast validation of API wiring before domain complexity.

### 2026-07-01 - DEC-0006 - Implement a typed status summary vertical slice
- Decision: Add StatusSummary model used by both API output and MVC status view.
- Why: Demonstrate model reuse across API and view layers.
- Alternatives considered: Anonymous API objects and untyped view data.
- Consequences: Slightly more code, better consistency and maintainability.

### 2026-07-01 - DEC-0007 - Introduce Swagger in Development
- Decision: Enable Swagger/OpenAPI UI in Development and add Swashbuckle.AspNetCore.
- Why: Make endpoint discovery and manual testing easy.
- Alternatives considered: Test endpoints only via browser/curl/Postman.
- Consequences: Extra package dependency, improved developer productivity.

### 2026-07-01 - DEC-0008 - Start domain work with in-memory TaskItem endpoint
- Decision: Add TaskItem model and GET /api/taskitems backed by hardcoded in-memory data.
- Why: Deliver the first domain API increment without database complexity.
- Alternatives considered: Introduce database and persistence immediately.
- Consequences: Quick progress now; persistence remains a future step.

### 2026-07-02 - DEC-0009 - Use built-in ASP.NET Core logging for API request telemetry
- Decision: Implement minimal structured logging for /api routes using built-in ASP.NET Core logging and custom middleware.
- Why: Improve troubleshooting quickly without adding external logging dependencies.
- Alternatives considered: Adding a third-party logging package now.
- Consequences: Simple and reviewable logging baseline now, with option to evolve later if requirements grow.
