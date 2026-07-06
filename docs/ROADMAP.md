# AgentPractice Roadmap

Canonical decision log path: /docs/decisions.md.
Decision rationale: see [decisions.md](decisions.md).

## Completed

- Adopted approval-first workflow with small, reviewable steps.
- Established documentation-first project foundation.
- Standardized task lifecycle tracking (Open -> In Progress -> Done).
- Initialized ASP.NET Core MVC application in [AgentPractice.Web](../AgentPractice.Web).
- Added health API endpoint at /api/health.
- Added typed status vertical slice (model + API response + MVC status view).
- Enabled Swagger/OpenAPI in Development.
- Added first domain API slice: in-memory TaskItem endpoint at /api/taskitems.
- Added TaskItem create slice: POST /api/taskitems with app-lifetime in-memory storage.
- Added minimal structured request logging for /api routes (method, path, status, elapsed time, request id).
- Added one small service layer abstraction for TaskItem retrieval (still in-memory).
- Added minimal tests for health and TaskItem GET/POST endpoints.
- Added a short troubleshooting section for local run and Swagger access.
- Added UTC-only server time endpoint at /api/servertime with integration coverage.

## In Progress

- Keeping roadmap, README, and decision log continuously aligned.

## Next

1. PATCH /api/TaskItems/{id}/complete
	- Business action endpoint.
	- Marks an existing task item complete.
	- Follow controller/service/tests pattern.
2. Static Task Items UI page
	- Simple page only.
	- No API wiring yet.
	- Show title, input box, Add button, placeholder task list, done checkbox, edit button, and delete button.
3. Wire UI to GET /api/TaskItems
	- Load task list from API.
4. Wire UI to POST /api/TaskItems
	- Add task from page.
5. Wire UI to PUT /api/TaskItems/{id}
	- Edit task title and done status from page.
6. Wire UI to DELETE /api/TaskItems/{id}
	- Delete task from page.

## Later

- Introduce persistence for TaskItems (after explicit approval).
- Add DTOs if API shape diverges from domain models.
- Add deployment and environment configuration notes.
