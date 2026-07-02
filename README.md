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
