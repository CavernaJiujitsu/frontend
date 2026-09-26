---
name: pr-create
description: "Prepare and open a pull request for the current changes. Summarize what was done, why it was done, changed files, reviewer test guide, and open questions."
argument-hint: "Optional PR title or ticket reference"
user-invocable: true
---

# Create Pull Request

Use when asked to prepare or open a pull request for the current branch.

## Procedure

1. Ask the developer whether they want to write the commit message themselves or have the agent draft it. Use the interactive `AskUserQuestion` tool, or the available VS Code `vscode_askQuestions` equivalent, with these options:
   - I will write the commit message.
   - The agent can write the commit message.
     Wait for the answer before preparing a message. If the developer writes it, validate it against the editable commit convention table below and ask before changing their wording. If the agent writes it, draft a concise message based on the reviewed diff and show it for approval.
2. Inspect the current branch, base branch, working tree, commit history, and complete diff. Preserve unrelated user changes. Do not stage, create, or amend a commit unless explicitly requested; choosing who writes a message is not permission to create a commit.
3. Identify the intended base branch and ticket/issue reference. If either is unclear and cannot be inferred safely, ask the developer before opening the PR.
4. Review the diff for scope, accidental secrets, generated files, and unrelated changes. Do not claim work that is not present in the diff.
5. Determine which tests or checks have actually been run. If relevant checks have not been run, run them when possible or report that status accurately. Never mark an unrun check as passed.
6. Prepare the PR title and description using the exact sections below. Write in the language used by the developer or explicitly requested for the PR.
7. Present the completed title and description for review before publishing. Open the PR only after the developer approves the content, using the available GitHub/Git provider PR creation tool. If no provider tool is available, provide the ready-to-paste title and description and state that the PR was not opened.
8. Return the PR URL and number if creation succeeds. Report failures without claiming success.

## Editable Commit Convention

Keep this table as the project's editable source of truth for commit types. Apply it to every commit message, whether drafted by the developer or agent. Use the Conventional Commits `feat` type for feature work; `feat` is the conventional spelling of “feature.”

| Type       | Use when                                                        |
| ---------- | --------------------------------------------------------------- |
| `feat`     | Adds or changes user-facing functionality (feature).            |
| `fix`      | Fixes a defect or incorrect behavior.                           |
| `docs`     | Changes documentation only.                                     |
| `style`    | Changes formatting or visual styling without changing behavior. |
| `refactor` | Restructures code without changing behavior.                    |
| `perf`     | Improves performance.                                           |
| `test`     | Adds or updates tests.                                          |
| `build`    | Changes build configuration or dependencies.                    |
| `ci`       | Changes continuous integration or delivery configuration.       |
| `chore`    | Performs maintenance that does not fit another type.            |
| `revert`   | Reverts a prior commit.                                         |

Required format: `<type>(<optional-scope>): <imperative summary>`. Add `!` after the type/scope for a breaking change and explain it in a `BREAKING CHANGE:` footer. Keep the summary concise and do not end it with a period. Examples: `feat(onboarding): add account creation entry point`, `chore(deps): update Expo packages`.

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
