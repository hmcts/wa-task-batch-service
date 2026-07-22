# Development Guidelines: WA Task Batch Service

## Core Principles

### I. Code Quality Is Non-Negotiable
Changes must be maintainable: no new duplication, keep cognitive load flat, idiomatic TypeScript, strictly typed request/response boundaries where practical, modular Express components, and structured logging. ESLint, TypeScript compilation, Jest failures, and build failures block merge. Use existing naming patterns and HMCTS taxonomy; avoid new abbreviations unless already established nearby.

### II. Tests Define Release Readiness
Every behavior change ships with appropriate Jest coverage. Keep unit tests focused on services, utilities, and error handling. Route tests should cover HTTP contracts and middleware behavior. Smoke and functional tests validate startup and deployed/local integration paths where relevant.

### III. Security & Access Management Are Paramount
This service calls Task Monitor using S2S credentials and reads environment/configuration values at runtime. Do not hardcode secrets, tokens, service URLs, or job names. Keep Helmet/security middleware intact and ensure any new route has an explicit access and CSRF decision.

### IV. Test Quality And Maintainability Standards
Tests must remain clear, deterministic, and resistant to implementation-only refactors. For non-trivial test changes:
*   Assert behavior and collaborator contracts at module boundaries.
*   Cover happy paths and dependency/error paths with explicit rejected/error assertions.
*   Use explicit negative-path assertions for status, message, or error type; avoid broad catch-all checks.
*   Freeze or inject time-sensitive values; do not rely on live time in assertions.
*   Avoid coupling tests to private implementation details where a public service, route, or utility contract can be asserted.
*   Extract repeated large fixtures into typed builders/factories once duplication appears.
*   Keep tests focused: one behavior per test where practical.

### V. Collaboration, Scope, And Uncertainty
*   Ask, do not assume. If intent, architecture, or requirements are unclear, ask before writing code. When running unattended, choose the most reasonable interpretation, proceed, and record the assumption instead of blocking.
*   Keep the solution proportional to the problem. Implement the simplest solution for simple problems and better-designed solutions for harder problems. Do not over-engineer or add flexibility before it is needed.
*   Do not touch unrelated code. If you discover bad code or design smells outside the requested scope, surface them for discussion so they can be addressed separately.
*   Flag uncertainty explicitly. If unsure, ask first. When useful, conduct a small, localised, low-risk experiment, then share the hypothesis and result for discussion.
*   Suggest better approaches when they would improve the outcome, especially when they have longer-lasting impact than a tactical change.

## Active Technologies
*   Runtime: Node.js 18.17+ with TypeScript and CommonJS modules.
*   Framework: Express, Helmet, config, ts-node, tsconfig-paths.
*   Integrations: Task Monitor service and S2S service-auth-provider.
*   Build: Yarn 4, webpack, Docker/Docker Compose.
*   Testing: Jest, Supertest, Nock/MSW, smoke tests, route tests, functional tests.
*   Observability: Application Insights and HMCTS nodejs logging.
*   Quality: ESLint, TypeScript checks, Yarn audit, Fortify client under `test/java`.

## Subagents (When Available)
Use subagents to parallelize work that can be done independently, then consolidate findings in the main thread. Good fit examples:
*   Broad discovery: one agent scans README/config/scripts, another scans `src/main`, another scans `src/test`.
*   Cross-cutting refactors: routes/middleware vs. services vs. configuration/tests.
*   Dependency maintenance: one agent inspects dependency paths, another checks code usage, another validates audit output.
*   Verification orchestration: delegate linting, unit tests, route tests, dependency checks, and builds to separate agents.

For verification after code changes, use subagents by default and run independent checks in parallel:
*   Spawn one subagent each for `yarn lint`, `yarn test`, `yarn test:routes`, and `yarn build` when those checks are relevant.
*   For dependency maintenance, also run `yarn test:dependencies` and the relevant `yarn npm audit` command.
*   Run checks in parallel unless a concrete dependency requires sequencing.

## Agent Workflow Efficiency
Optimise for fast, correct progress with the smallest reliable feedback loop:
*   Start with targeted discovery: read the relevant README/config/scripts, then use `rg` or `rg --files` to find the smallest set of code and tests needed for the task.
*   Batch independent read-only inspection where possible, especially related file reads, searches, and git diffs.
*   Prefer focused Jest tests first, then broaden to lint, route tests, dependency checks, build, smoke, or functional tests when risk justifies it.
*   Keep context small and current: summarise findings, record assumptions, and avoid carrying stale hypotheses once the code contradicts them.
*   Escalate deliberately: use an ExecPlan only for genuinely complex work, subagents for independent workstreams, and full builds when narrower checks cannot give enough confidence.
*   Report only actionable findings in progress updates and final responses: changed files, verification results, known risks, and suggested follow-up issues.

## Project Structure
```
src/main/
+-- app.ts                  # Express app composition
+-- server.ts               # Application entrypoint
+-- routes/                 # HTTP route handlers
+-- services/               # Task Monitor and S2S service logic
+-- modules/                # App Insights, Helmet, properties-volume setup
+-- model/                  # Shared TypeScript models
+-- utils/                  # Logging and process utilities
+-- public/                 # Bundled/static assets

src/test/
+-- unit/                   # Unit tests
+-- routes/                 # Route tests
+-- smoketest/              # Startup smoke tests
+-- functional/             # Functional tests

config/                     # Runtime YAML config and env var mapping
skills/                     # Repo skills for repeatable agent workflows
test/java/                  # Fortify scan Gradle wrapper/config
```

## Key Commands
Use Yarn through the checked-in Yarn 4 release.
*   `yarn install --immutable` - verify lockfile and dependency install consistency.
*   `yarn lint` - run ESLint.
*   `yarn test` - run unit tests.
*   `yarn test:coverage` - run unit tests with coverage.
*   `yarn test:routes` - run route tests.
*   `yarn test:dependencies` - validate production dependency scope with TypeScript.
*   `yarn build` - run webpack build.
*   `yarn cichecks` - run install, build, lint, unit tests, and route tests.
*   `yarn test:smoke` - run smoke tests.
*   `yarn test:functional` - run functional tests; requires the documented environment variables.
*   `yarn audit` - run `yarn npm audit`.
*   `yarn start:dev` - start the service locally through nodemon.
*   `docker-compose up` - run through Docker Compose.

## Implementation Guidance
*   Keep routing thin: routes handle HTTP details, validation, and delegation.
*   Keep integration logic in `src/main/services`, with external URLs and secrets supplied through config/environment.
*   Preserve startup behavior: the service starts, creates the configured job through Task Monitor, logs the result, and exits with the intended code.
*   Update README/config examples when runtime variables, startup behavior, or verification commands change.
*   Do not commit generated or cached dependency artifacts beyond files already tracked by the repository.
*   Do not manually edit bundled public output unless the existing workflow expects it; prefer changing source/build configuration and regenerating.

## ExecPlans
When writing complex features or significant refactors, use an ExecPlan from design to implementation.
*   ExecPlans may be treated as working artifacts and can remain uncommitted, but important, durable outcomes must be transferred into committed README.md or docs/ before the related code change is considered complete.
*   Transfer only what helps future contributors understand and evolve the system. Omit transient planning artifacts.

## Repo Skills
*   `skills/maintenance/SKILL.md` - use for CVE fixes, dependency upgrades, unused dependency cleanup, and stale `resolutions` pruning.
*   `skills/git-strategy/SKILL.md` - use for branch naming, staging, commit hygiene, and PR preparation.

## Git Strategy
Use `skills/git-strategy/SKILL.md` when creating branches, preparing commits, staging files, or drafting PR notes. Core constraints: branch names must start with the parent ticket, commits must stay focused, only PR-related files should be staged, and history must not be overwritten.
