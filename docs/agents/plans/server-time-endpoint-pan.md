# Server Time Endpoint Plan

Current State:
- The app already exposes small JSON API endpoints under `/api/[controller]` using thin MVC controllers.
- Existing endpoints such as `/api/ping` and `/api/buildinfo` already return UTC timestamps, so a server time endpoint fits the current style.
- Integration tests already exist for the current API slices using `WebApplicationFactory<Program>`.
- Dependency injection is minimal today, and this feature does not require a new package, database, or external service.

Recommended Next Step:
- Add one small read-only API endpoint at `/api/servertime` that returns the server's current UTC time.

Why This Step:
- It is consistent with the app's existing API patterns.
- It is small, easy to review, and low risk.
- It creates a clear example of a server-generated value that clients can use for diagnostics or clock comparison.
- It does not force broader architectural decisions yet.

Goal:
- Provide a simple endpoint that returns the current server time in a predictable JSON response.

Proposed Response Shape:
```json
{
  "utcTimestamp": "2026-07-05T12:34:56.789Z"
}
```

Design Notes:
- Prefer UTC only. Do not expose local server time by default.
- Keep the endpoint read-only and unauthenticated, matching the current simple internal/demo API posture.
- Start with a minimal payload containing only `utcTimestamp`.
- Do not introduce a service abstraction unless a second consumer or a testing constraint makes it necessary.
- Use the framework's default JSON serialization conventions so the property name remains `utcTimestamp`.

Files Likely To Change:
- `AgentPractice.Web/Controllers/ServerTimeController.cs`
- `AgentPractice.Web.Tests/ServerTimeEndpointTests.cs`
- `docs/ROADMAP.md`
- `NOTES.md`
- `docs/decisions.md` only if the team wants the UTC-only choice recorded explicitly.

Small Task Plan:
1. Add a thin controller that follows the existing `/api/[controller]` routing pattern.
2. Return HTTP 200 with a minimal JSON payload containing the current UTC timestamp.
3. Add one integration test that verifies the route, status code, and presence of `utcTimestamp`.
4. In the same test, validate that the timestamp parses correctly and is close to the current UTC time within a small tolerance.
5. Update roadmap and notes after implementation is approved and completed.

Tests:
- Integration test for `GET /api/servertime` returns `200 OK`.
- Assert the JSON contains `utcTimestamp`.
- Assert the timestamp parses as a UTC value.
- Assert the timestamp is recent relative to test execution time.

Acceptance Criteria:
- `GET /api/servertime` returns `200 OK`.
- Response body contains one field: `utcTimestamp`.
- The timestamp is produced by the server at request time and is in UTC.
- The feature is implemented without new packages, persistence, or configuration.
- A focused integration test covers the endpoint.

Definition of Done:
- Endpoint exists and matches the agreed route and payload.
- Automated test coverage exists for the happy path.
- Project docs are updated to reflect the new completed API slice.

Risks / Watchouts:
- Avoid adding extra fields such as timezone name, offset, or machine details unless there is a real client need.
- Avoid introducing a separate service too early; this is only justified if time generation needs to be reused or mocked across multiple slices.
- If consumers later need deterministic testing around time, that would be the right moment to introduce a small clock abstraction in a separate approved step.
