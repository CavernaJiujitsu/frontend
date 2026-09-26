---
name: pr-create
description: "Prepare and open a pull request for the current changes. Summarize what was done, why it was done, changed files, reviewer test guide, and open questions."
argument-hint: "Optional PR title or ticket reference"
user-invocable: true
---

# Create Pull Request

Use when asked to prepare or open a pull request for the current branch.

## Procedure

1. Inspect the current branch, base branch, working tree, commit history, and complete diff. Preserve unrelated user changes and do not stage or commit them unless explicitly requested.
2. Identify the intended base branch and ticket/issue reference. If either is unclear and cannot be inferred safely, ask the developer before opening the PR.
3. Review the diff for scope, accidental secrets, generated files, and unrelated changes. Do not claim work that is not present in the diff.
4. Determine which tests or checks have actually been run. If relevant checks have not been run, run them when possible or report that status accurately. Never mark an unrun check as passed.
5. Prepare the PR title and description using the exact sections below. Write in the language used by the developer or explicitly requested for the PR.
6. Present the completed title and description for review before publishing. Open the PR only after the developer approves the content, using the available GitHub/Git provider PR creation tool. If no provider tool is available, provide the ready-to-paste title and description and state that the PR was not opened.
7. Return the PR URL and number if creation succeeds. Report failures without claiming success.

## Required Description

```markdown
## What was done

- Concise, implementation-specific summary.

## Why was it done

- User or product need this change addresses.

## Changed files

- `path/to/file`: what changed and why.

## Test guide for reviewers

1. Exact setup or command needed.
2. Steps to exercise the changed behavior.
3. Expected result for each relevant flow.

- Automated checks run: list commands and outcomes; explicitly say when none were run.

## Open questions

- Unresolved decisions, follow-ups, or `None`.
```

Keep the description factual and useful to reviewers. The test guide must let another developer verify the feature, not merely repeat the implementation summary. Separate automated test results from manual reviewer steps.
