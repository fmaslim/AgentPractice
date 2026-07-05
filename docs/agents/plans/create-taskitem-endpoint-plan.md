# Create TaskItem Endpoint Plan

Current State:
- The app already exposes `GET /api/taskitems` through a thin MVC controller under the existing `/api/[controller]` routing pattern.
- `TaskItem` currently has three fields: `id`, `title`, and `isDone`.
- The current `TaskItemService` returns a fresh hard-coded list on every call, so created items would not survive even for the next request.
- `ITaskItemService` only supports reads today.
- Dependency injection currently registers `ITaskItemService` as scoped, which is fine for stateless reads but not for app-lifetime in-memory writes.
- Integration tests already exist for the task items slice using `WebApplicationFactory<Program>`.

Recommended Next Step:
- Add one small write endpoint at `POST /api/taskitems` that accepts a minimal create payload and stores the new item in the existing in-memory service for the lifetime of the running app instance.

Why This Step:
- It completes the smallest useful vertical slice around the existing task items API.
- It stays inside the current no-database, demo-friendly architecture.
- It avoids over-engineering with repositories, async persistence, or external dependencies.
- It fixes the main behavioral gap first: a create endpoint should be observable through a later `GET /api/taskitems` call.

Goal:
- Allow a client to create a new open task item during runtime and then retrieve it from the existing list endpoint within the same app instance.

Recommended Request Shape:
```json
{
  "title": "Write endpoint plan"
}
```

Recommended Response Shape:
```json
{
  "id": 4,
  "title": "Write endpoint plan",
  "isDone": false
}
```

Recommended Status Code:
- Return `200 OK` with the created `TaskItem` in the response body for this first step.
- Defer stricter resource-oriented `201 Created` plus `Location` handling until there is an approved `GET /api/taskitems/{id}` route. Adding that route now would widen the slice unnecessarily.

Design Notes:
- Keep the input contract separate from `TaskItem`. A small create request DTO with only `title` is the simplest contract.
- Do not accept a client-supplied `id`.
- Default `isDone` to `false` on creation. Marking a task complete at creation time is not needed for this step.
- Keep validation minimal: require a non-empty, non-whitespace `title`.
- Reuse the existing `TaskItem` model as the response shape.
- Change the in-memory task item storage so it persists across requests for the lifetime of the app instance.
- The simplest way to support that behavior is to keep a mutable in-memory collection in the service and register that service as a singleton.
- Generate ids on the server side. A simple incrementing strategy based on the current in-memory items is enough for this demo app.
- Do not add a database, repository abstraction, background worker, or eventing for this step.
- Do not add update, delete, filtering, or item-by-id routes in the same change.

Behavioral Rules:
- `POST /api/taskitems` creates exactly one new task item.
- The created item is appended to the in-memory list.
- The created item is returned in the response body.
- A later `GET /api/taskitems` call should include the newly created item while the app instance is still running.
- Invalid input should return the framework's normal validation response (`400 Bad Request`) rather than a custom error format.

Files Likely To Change After Approval:
- `AgentPractice.Web/Controllers/TaskItemsController.cs`
- `AgentPractice.Web/Services/ITaskItemService.cs`
- `AgentPractice.Web/Services/TaskItemService.cs`
- `AgentPractice.Web/Program.cs`
- `AgentPractice.Web/Models/` for a create request DTO
- `AgentPractice.Web.Tests/TaskItemsEndpointTests.cs`
- `NOTES.md`
- `docs/ROADMAP.md` if the roadmap should reflect the newly approved write slice

Small Task Plan:
1. Add a minimal request DTO for creating a task item with a required `title` field.
2. Extend `ITaskItemService` with a create method.
3. Update `TaskItemService` to hold a mutable in-memory collection that survives across requests during app runtime.
4. Adjust DI registration so the in-memory service lifetime matches the intended behavior.
5. Add `POST /api/taskitems` to the existing controller and return the created item.
6. Add focused integration tests for the happy path and basic validation.
7. Update notes and roadmap only after the implementation is approved and completed.

Tests:
- `POST /api/taskitems` returns `200 OK`.
- The response body contains a generated `id`, the submitted `title`, and `isDone: false`.
- A follow-up `GET /api/taskitems` in the same test includes the newly created item.
- Posting a missing, empty, or whitespace-only `title` returns `400 Bad Request`.

Acceptance Criteria:
- `POST /api/taskitems` accepts a minimal JSON body containing `title`.
- The server generates the new task item's `id`.
- The server sets `isDone` to `false` for newly created items.
- The created item is visible from `GET /api/taskitems` for the lifetime of the running app instance.
- The feature is implemented without a database or new packages.
- Focused integration tests cover creation and invalid input.

Definition of Done:
- The create endpoint exists and matches the agreed request and response contract.
- The in-memory behavior is consistent across requests within one running app instance.
- Automated tests cover the happy path and basic validation failures.
- Project notes are updated after the approved implementation lands.

Risks / Watchouts:
- A mutable singleton service can leak state between tests if the test host is reused unexpectedly. The implementation should keep test isolation explicit.
- In-memory created items will disappear when the app restarts. That is acceptable for this demo slice and should not be hidden.
- Avoid reusing the domain response model as the create request model; that would invite client-controlled ids and unnecessary input surface.
- Avoid broadening the change into full CRUD. Creation alone is the right next step.