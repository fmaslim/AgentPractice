# Auto-Run Feature Prompt

Read docs/agents/orchestrator-agent.md.
Read docs/agents/project-memory.md if it exists.
Read docs/agents/planner-agent.md.
Read docs/agents/frontend-dev-agent.md.
Read docs/agents/qa-agent.md.

Auto-Run Mode.

Build this feature:

[FEATURE NAME HERE]

Requirements:

[FEATURE REQUIREMENTS HERE]

Rules:
- Keep the feature small.
- Stay within existing architecture.
- Do not change backend code unless the feature explicitly requires it and passes safety rules.
- Do not change database code.
- Do not add packages.
- Do not delete files.
- Do not commit or push.
- Run relevant tests.
- If tests or QA fail, fix once and re-test.
- Stop when QA passes or when a hard stop rule is hit.

Final report must include:
- files changed
- tests run
- QA result
- whether any fix loop happened
- confirmation that no forbidden changes happened
- confirmation that no commit or push happened
- what Franky should browser-test before commit