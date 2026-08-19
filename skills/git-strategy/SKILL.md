---
name: git-strategy
description: Use this skill for repository Git workflow in WA Task Batch Service, including ticket-based branch naming, staging only related files, preserving user changes, commit hygiene, and PR preparation.
---

# Git Strategy

Use this skill when creating branches, preparing commits, staging files, reviewing changed files before a PR, or drafting PR notes.

## Branch Naming

All branches should be named after the parent ticket with a short suffix describing the change.

Format:

```text
<TICKET>_<short-description>
```

Examples:

```text
RWA-0001_add_agentsmd
RWA-1234_fix_dependency_cves
RWA-1234_cleanup_resolutions
```

Use lowercase words in the suffix, separated by underscores. Keep the suffix specific enough to identify the change without becoming a sentence.

## Before Editing

Check the worktree first:

```bash
git status --short
```

If the worktree already contains changes:

* treat them as user-owned unless you made them in the current task;
* do not revert, overwrite, restage, or reformat unrelated changes;
* read any changed file that you need to edit and work with the existing content;
* ask before proceeding only when user-owned changes make the requested task ambiguous or unsafe.

## Staging Rules

Only stage files related to the PR. Prefer explicit paths:

```bash
git add AGENTS.md skills/maintenance/SKILL.md skills/git-strategy/SKILL.md
```

Before staging, review the diff:

```bash
git diff -- <path>
```

After staging, review the staged diff:

```bash
git diff --cached
```

Do not use broad staging commands like `git add .` when unrelated files are present.

## Commit Hygiene

Keep commits focused on the requested change. A commit should have one clear reason to exist.

Before committing:

* confirm `git status --short` contains only intended staged files;
* run the relevant verification commands for the changed files;
* include documentation-only verification such as `git diff --check` when tests are not relevant;
* record any skipped verification with a concrete reason.

Commit messages should be concise and ticket-aware when the team convention expects it. Use an imperative summary:

```text
RWA-1234 Add maintenance skill guidance
```

## PR Preparation

PR notes should include:

* what changed;
* why it changed;
* verification commands and outcomes;
* any known risks, skipped checks, or follow-up work;
* dependency/CVE details when using the maintenance skill.

Keep the PR focused. If unrelated cleanup is found, mention it as a follow-up instead of adding it to the same PR.

## Hard Constraints

* Do not overwrite Git history.
* Do not run destructive commands such as `git reset --hard` or `git checkout -- <path>` unless explicitly requested.
* Do not stage unrelated files.
* Do not amend or rewrite commits unless explicitly requested.
