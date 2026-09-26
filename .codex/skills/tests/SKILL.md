---
name: tests
description: "Test the complete feature or code change just implemented. Inspect its acceptance criteria, exercise changed behavior, run focused and project checks, and report gaps and results."
argument-hint: "Optional feature, route, or ticket to test"
user-invocable: true
---

# Feature Tests

Use after implementing a feature, fixing a bug, or changing user-facing behavior. Test the actual feature end to end to the extent supported by the repository; do not stop at lint or typechecking when behavior can be exercised.

## Procedure

1. Read the feature requirements, acceptance criteria, changed files, and relevant existing tests. Inspect `package.json` and project instructions to discover the actual test tools and commands; do not assume a test framework is installed.
2. Build a coverage checklist from the requested behavior. Include the primary success path, meaningful alternate paths, input validation, loading/empty/error states, navigation or persistence effects, and relevant platform behavior when applicable.
3. Run the narrowest automated tests for the changed feature first. Add or update focused tests when the project has an established test framework and the behavior is not adequately covered.
4. Run applicable static checks, lint, typecheck, and build/smoke checks. Use repository-defined commands and SDK-compatible tools.
5. For UI changes, inspect the actual rendered screen and interactions when a simulator, browser, or project workflow is available. Check layout, safe areas, text overflow, controls, and the supported platforms affected. Do not claim a visual check that was not performed.
6. If checks fail, determine whether the failure is caused by the feature. Fix in-scope issues and rerun the failed check. Do not silently modify unrelated behavior to make the suite green.
7. Report every check with its exact command or manual steps and result. List untested scenarios, environment limitations, and residual risk explicitly.

## Completion Report

Return:

- Feature behaviors verified and their expected outcomes.
- Automated checks run, with pass/fail status.
- Manual/device/browser checks run, with platform and outcome.
- Failures, untested cases, limitations, and remaining risks.

Never say the feature is fully tested when only lint, typechecking, or compilation ran. Distinguish “not run” from “passed.”
