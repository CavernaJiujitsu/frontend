---
name: feature-implementation
description: "Interview the developer about a ticket, requirements, and language, then implement the feature, review the UI with ui-style, and verify the whole feature with tests."
argument-hint: "Optional ticket title or short feature request"
user-invocable: true
---

# Feature Implementation

Use for implementing a feature from a ticket or product request. This is a gated workflow: collect and confirm requirements before editing files.

## Mandatory Interview Gate

Use the interactive `AskUserQuestion` tool before doing implementation work. In VS Code, use the available `vscode_askQuestions` equivalent if the exact `AskUserQuestion` tool is unavailable. Ask one focused question at a time when the next answer depends on the prior one. Each blocking question must have explicit options and an `Other` choice that accepts a free-form developer response. Do not infer the user's answer, skip the gate, start implementation while answers are pending, or continue past an unanswered blocking question.

### 1. Language First

The very first question must ask which language to use for the interview, implementation guide, and user-facing deliverables:

- Portuguese
- English
- Other (developer specifies)

Wait for the developer to choose before asking the remaining questions. Use their selected language consistently. Code identifiers and established repository conventions remain as required by the codebase.

### 2. Ticket and Scope

Ask for each item below unless it was explicitly supplied in the request or earlier answer. Offer useful choices plus `Other` on every blocking question:

- Ticket title and, if available, ID or link.
- What needs to be built or changed? Ask for the expected user-visible behavior and affected routes/components.
- Why is the change needed? Ask for the user problem or product outcome.
- Functional requirements: required flows, actions, data, validation, permissions, navigation, and persistence.
- Non-functional requirements and constraints: platforms, responsiveness/accessibility, performance, compatibility, dependencies, and security where relevant.
- Acceptance criteria: observable pass conditions, edge cases, empty/loading/error states, and exclusions.
- Existing API/data contracts or design references, if relevant.

Use `Other` to let the developer supply requirements not covered by the offered choices. Ask concise follow-ups wherever an answer is ambiguous, contradictory, or not verifiable. Summarize the ticket, why, scope, requirements, constraints, and acceptance criteria in the selected language; ask the developer to confirm or correct this summary. Do not edit files until confirmed.

## Implementation Workflow

1. Read the repository's `AGENTS.md`, relevant route/components, `package.json`, and the existing `.claude/skills/feature-creation/SKILL.md` (or the matching skill path for the active host). Respect its Expo, routing, component ownership, styles, theme, and validation conventions. Keep app-owned components under `src/components/customized/`, Expo starter components under `src/components/`, and screen styles in matching files under `src/styles/`.
2. Trace the nearest code path that implements the requested behavior. State the local implementation approach and the acceptance criteria it will satisfy, then make focused changes only.
3. Implement all confirmed requirements and needed states. Do not add features or dependencies outside the confirmed scope. Ask another blocking question if implementation uncovers a product decision that cannot be resolved from the ticket or code.
4. Before finalizing UI work, explicitly load and apply `/ui-style`. Review the changed screen/component against the project's brand tokens, interaction conventions, safe areas, responsive layout, text fit, and accessibility. Correct violations within the feature scope.
5. After implementation and UI review, explicitly load and run `/tests` against the entire implemented feature and confirmed acceptance criteria. Add/execute appropriate focused tests and checks, repair in-scope failures, and rerun them. Do not treat lint/typecheck alone as proof of feature behavior.
6. Report the ticket title, what and why, implemented files, acceptance criteria verified, exact automated/manual test outcomes, and unresolved questions or untested areas in the selected language. Do not report unrun checks as passed.

## Hard Stops

- No implementation before the language selection, required ticket details, and confirmation gate are complete.
- No silently choosing among conflicting product requirements; ask through the blocking question tool with `Other` available.
- No skipping the `/ui-style` review for UI changes or the `/tests` workflow after implementation.
- If a required tool or environment is unavailable, report the limitation and perform the strongest honest alternative; never imply the blocked step ran.
