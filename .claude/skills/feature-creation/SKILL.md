---
name: feature-creation
description: Plan and implement a feature or screen in the Caverna JiuJitsu Expo app using its folder structure, brand tokens, and mobile conventions. Ask the developer for missing product and behavior details before implementation.
---

# Feature Creation

Use this skill when creating or extending a screen, component, or user-facing workflow in this application.

## Before Implementation

Read the relevant route, neighboring components, and current `package.json` before changing code. If the request does not specify the feature behavior in enough detail, ask the developer concise questions before implementation. Clarify the following where applicable:

- Who is the user and what outcome should this feature support?
- What is the entry point, primary action, and expected navigation afterward?
- What data is displayed or submitted, and where does it come from?
- What validation, loading, empty, success, and error states are required?
- Are there access, role, or platform-specific constraints?
- What acceptance criteria or edge cases should be covered?

Do not ask questions whose answers are already explicit in the request or codebase. For small, fully specified changes, proceed directly.

## Brand Colors

- Default page, navigator, and splash background: `#0B0C10`.
- Primary: `#2A2D37`.
- Secondary/accent: `#FF6B35`; use for selected details and emphasis.
- Shared button border: `#2A2D37`.
- Text on dark surfaces: `#FFFFFF`.
- Read tokens from `src/constants/theme.ts`; avoid hard-coded brand colors in feature screens.
- Keep screens dark by default. Do not use orange as a full-page background.

## Application Structure

```text
.
├── AGENTS.md
├── CLAUDE.md
├── app.json
├── package.json
├── README.md
├── eslint.config.js
├── tsconfig.json
├── .claude/skills/
│   ├── feature-creation/SKILL.md
│   └── ui-style/SKILL.md
├── assets/
│   ├── expo.icon/
│   └── images/
│       └── tabIcons/
├── scripts/
│   └── reset-project.js
└── src/
    ├── app/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── explore.tsx
    │   └── onboarding/
    │       └── start.tsx
    ├── components/
    │   ├── animated-icon.module.css
    │   ├── animated-icon.tsx
    │   ├── animated-icon.web.tsx
    │   ├── app-tabs.tsx
    │   ├── app-tabs.web.tsx
    │   ├── external-link.tsx
    │   ├── hint-row.tsx
    │   ├── themed-text.tsx
    │   ├── themed-view.tsx
    │   ├── web-badge.tsx
    │   ├── ui/
    │   │   └── collapsible.tsx
    │   └── customized/
    │       └── default-button.tsx
    ├── constants/
    │   └── theme.ts
    ├── hooks/
    │   ├── use-color-scheme.ts
    │   ├── use-color-scheme.web.ts
    │   └── use-theme.ts
    ├── types/
    │   └── css.d.ts
    ├── styles/
    │   └── onboarding/
    │       └── start.styles.ts
    └── global.css
```

Keep Expo-provided or starter-template components directly inside `src/components/` (including its `ui/` folder). Put only components created or customized for Caverna JiuJitsu inside `src/components/customized/`, grouped into subfolders there when useful. Keep route files inside `src/app/`; Expo Router treats files in that directory as routes. Put each screen's `StyleSheet.create` definition in a separate `src/styles/<screen-group>/<screen>.styles.ts` file, mirroring its route group, and import the styles into the screen. Keep shared tokens in `src/constants/`, hooks in `src/hooks/`, and app-wide types in `src/types/`.

## Implementation Rules

- Use Expo Router for navigation; route screens belong in `src/app/`. Keep styles outside `src/app/` in matching files under `src/styles/`. Keep Expo starter components in `src/components/` and app-owned UI in `src/components/customized/`.
- Reuse existing components and theme tokens before introducing new abstractions or dependencies.
- Use `SafeAreaView` from `react-native-safe-area-context` for screens that need safe-area handling.
- Keep layouts mobile-first, accessible, and compatible with iOS, Android, and web.
- Preserve the existing design system and nearby code conventions.
- Before using Expo or React Native APIs, read the Expo major version from `package.json` and consult the matching Expo documentation. This repository currently uses Expo SDK 57 and React Native 0.86.
- Do not create or edit generated native `ios/` or `android/` directories; configure native behavior through Expo configuration and plugins.

## Verification

Run the narrowest relevant checks after editing, then run both required project checks before completion:

```bash
bun run lint
bunx tsc --noEmit
```
