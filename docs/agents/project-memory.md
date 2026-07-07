# Project Memory

Project: AgentPractice

## App Summary

AgentPractice is a small ASP.NET Core MVC/Web project used for agentic coding training.

Current Task Items page supports:
- loading task items
- creating task items
- editing task items inline
- deleting task items
- marking open tasks complete
- filtering by status: All, Open, Done
- searching tasks by title

## Architecture Rules

- Keep controllers thin.
- Keep frontend behavior simple.
- Prefer small vertical slices.
- Preserve existing behavior.
- Avoid scope creep.
- Do not add packages unless Franky explicitly approves.
- Do not change backend/database unless the feature requires it.
- Do not commit or push from Auto-Run Mode.

## Agent Workflow

Default loop:
1. Orchestrator classifies scope.
2. Planner creates small plan.
3. Developer implements.
4. Tests run.
5. QA reviews.
6. Developer fixes once if needed.
7. QA re-checks.
8. Stop for Franky final browser review.

## Current Safety Policy

Auto-Run Mode is allowed for:
- frontend-only UI changes
- test-only changes
- small backend endpoint changes if explicitly requested

Auto-Run Mode must stop for:
- database migrations
- authentication changes
- payment changes
- deployment changes
- package installs
- file deletion
- large refactors
- commit/push