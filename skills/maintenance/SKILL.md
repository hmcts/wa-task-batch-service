---
name: maintenance
description: Use this skill for maintaining Node/Yarn repositories in Task Management, especially CVE remediation, dependency upgrades, unused dependency cleanup, and pruning stale package resolution entries.
---

# Maintenance

Use this skill when working on dependency maintenance for `wa-task-batch-service` or related Task Management Node repositories. The usual maintenance scope is:

* fixing CVEs raised by audit tooling, Dependabot, Renovate, GitHub Advanced Security, or pipeline scans;
* upgrading runtime and development dependencies;
* removing unused dependencies;
* cleaning up outdated `resolutions` entries that are no longer needed.

## Repository Context

This service is a Node.js TypeScript application using Yarn 4 with `nodeLinker: node-modules`.

Key files:

* `package.json` - dependency declarations, scripts, `resolutions`, and package manager version.
* `yarn.lock` - resolved dependency graph.
* `.yarnrc.yml` - Yarn configuration.
* `tsconfig.runtime.json` - runtime dependency compilation check.
* `src/`, `src/test/` - code and tests that reveal whether a dependency is runtime, test-only, or unused.

Prefer Yarn commands via the checked-in Yarn release. Do not edit `yarn.lock` manually.

## Maintenance Workflow

1. Identify the maintenance driver.
   * For CVEs, record the vulnerable package, vulnerable range, patched range, dependency path, severity, and source advisory.
   * For general upgrades, identify whether the package is direct, transitive, runtime, development, or test-only.
   * For unused dependency cleanup, verify with code search and TypeScript/build checks before removal.

2. Inspect the current dependency graph.
   * Use `yarn why <package>` for dependency ownership and transitive paths.
   * Use `yarn npm info <package> version` only when the latest published version matters.
   * Use `yarn npm audit --recursive --environment production` for production CVEs.
   * Use `yarn npm audit --recursive` when development/test dependencies are in scope.

3. Choose the smallest effective fix.
   * Prefer upgrading the owning direct dependency when that removes the vulnerable transitive package.
   * Use a `resolutions` entry only when the upstream direct dependency cannot be upgraded safely or promptly.
   * Keep direct dependencies in the correct block: runtime imports in `dependencies`, build/test/lint tooling in `devDependencies`.
   * Avoid broad version ranges when a precise patched version is needed for a CVE.

4. Apply changes with Yarn.
   * Upgrade direct dependencies with `yarn up <package>@<version>`.
   * Upgrade recursively only when justified by the CVE path: `yarn up -R <package>@<version>`.
   * Remove unused direct dependencies with `yarn remove <package>`.
   * After editing `resolutions`, run `yarn install` to refresh `yarn.lock`.

5. Clean up stale `resolutions`.
   * For each existing resolution, run `yarn why <package>`.
   * Remove a resolution if the package is no longer present, the resolved version already satisfies the required safe range without forcing, or the owning dependency now declares a safe range.
   * Keep a resolution only when there is a current dependency path requiring it, and note the reason in the PR description.
   * Re-run `yarn install` after removing resolution entries.

6. Verify behavior and dependency health.
   * Run `yarn install --immutable` to confirm lockfile consistency.
   * Run `yarn lint`.
   * Run `yarn test`.
   * Run `yarn test:routes`.
   * Run `yarn test:dependencies` after moving/removing dependencies or when runtime dependency scope changes.
   * Run `yarn build` when dependency changes touch build tooling, TypeScript, webpack, loaders, or runtime imports.
   * Run the relevant audit command again and confirm the target CVE is fixed.

## CVE Fix Rules

* Do not silence CVEs by adding broad suppressions or unexplained resolutions.
* Do not upgrade unrelated major packages in the same change unless the target fix requires it.
* If a patched version causes breaking changes, prefer a minimal compatibility patch in code plus focused tests over pinning to an unsafe version.
* If no patched version exists, document the dependency path, exploitability assessment for this service, and the temporary mitigation.
* Treat production dependency CVEs as higher priority than dev-only CVEs, but still fix dev-only CVEs when tooling runs in CI or handles untrusted input.

## Unused Dependency Cleanup

Before removing a dependency:

* search imports and requires with `rg "from '<package>|require\\('<package>|require\\(\"<package>"`;
* check generated/config references where relevant, including webpack, Jest, ESLint, TypeScript, Docker, and scripts;
* distinguish type packages from their runtime package usage;
* run `yarn test:dependencies` to catch runtime-only dependency mistakes.

If a dependency is used only by tests, move it to `devDependencies` instead of removing it. If a type package is obsolete because the runtime package now ships its own types, remove the type package and run TypeScript checks.

## PR Notes

Summarise maintenance PRs with:

* CVEs fixed, including advisory IDs where available;
* direct dependencies upgraded, removed, or moved;
* transitive packages forced via `resolutions`, with reasons;
* stale resolutions removed;
* verification commands and outcomes;
* any remaining CVEs or deferred upgrades with a concrete reason.
