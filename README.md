# AgentPractice

Purpose: A minimal workspace for practicing an Architect-style development workflow with small, approved steps.

Scope: Keep the project intentionally simple, document decisions clearly, and add code only after explicit user approval.

## Working Rules

- Keep solutions simple and avoid over-engineering.
- Suggest one small next step at a time and explain why.
- Do not create or modify code until the user approves.

## Principle

- Keep project documentation minimal and approval-first.

## Current Status

- Documentation foundation is in place: [README.md](README.md), [TODO.md](TODO.md), [NOTES.md](NOTES.md), and [docs/decisions.md](docs/decisions.md).
- Application baseline exists in [AgentPractice.Web](AgentPractice.Web): ASP.NET Core MVC app with API + views.
- Implemented API slices include health endpoints and an in-memory TaskItem endpoint, with Swagger enabled in Development.
- Roadmap planning is tracked in [docs/ROADMAP.md](docs/ROADMAP.md).

## How to Use

- Propose one small change, wait for approval, then implement.
- Record each approved change as a short dated note in [NOTES.md](NOTES.md).
- Record each architecture or design decision in [docs/decisions.md](docs/decisions.md).
- Track active tasks in [TODO.md](TODO.md).
- Use [docs/ROADMAP.md](docs/ROADMAP.md) for current priorities and [docs/decisions.md](docs/decisions.md) as the rationale source of truth.

## Troubleshooting

### Local Run

- From the repo root, run:
	- `dotnet run --project AgentPractice.Web`
- If HTTPS certificate trust prompts appear, run:
	- `dotnet dev-certs https --trust`
- If startup fails because a port is already in use, stop the process using that port or run with a temporary URL:
	- `dotnet run --project AgentPractice.Web --urls http://localhost:5050`

### Swagger Access

- Swagger UI is enabled only in Development.
- Default local URLs from launch settings are:
	- https://localhost:7217/swagger
	- http://localhost:5034/swagger
- If Swagger returns 404:
	- Confirm `ASPNETCORE_ENVIRONMENT` is `Development`.
	- Check startup logs for the listening URLs and open `{baseUrl}/swagger`.
	- Ensure you are opening the web project, not the test project.
