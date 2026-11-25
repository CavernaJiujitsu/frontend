This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Team collaboration

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before starting a card or preparing a PR/deploy. It records the shared sprint workflow; verify current GitHub state.

## SDD workflow (skills + `.docs/`)

- Skills live in `.agents/skills/` (single source; no mirrors). Flow: `feature-plan` → `feature-implementation` → `feature-teste`; `feature-review` and `pr-create` on demand; `trello-ticket` runs the whole flow for a board card; `ui-style` defines the visual language.
- Every demand stores its artifacts in `.docs/<slug>/` (`plan.md`, `blueprint.md`, `implement.md`, `test.md`, `review.md`) — conventions in [`.docs/README.md`](./.docs/README.md).
- Rules: never start coding without an approved `plan.md`; never call something done without `test.md`.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md
- Private area menu: custom `BottomNavbar` (`src/components/bottom-navbar/`) with
  `ScreenLayout` (`src/components/screen-layout/`), one real route per tab
  (`/inicio`, `/trilha`, `/cavernas`, `/perfil`). Tab switch: always
  `router.replace`, never `push`. Full standard: `docs/bottom-menu/prd.md`.
- Teacher area lives under the real segment `src/app/professor/` (`/professor`,
  `/professor/aulas`, `/professor/validacoes`, `/professor/perfil`) with
  `TeacherNavbar` + `TeacherPage`. Both areas are protected by `RoleGuard`
  (waits for store hydration, checks token + role). Dual-role accounts pick a
  mode in `/escolher-perfil` and switch from each profile screen.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- Backend is the source of truth for the API contract (route names, query params,
  body, enums, error codes). Before creating or changing anything in
  `src/api/services/`, read the matching DTO + controller in
  `backend/src/<resource>/` and mirror the exact names (e.g. `caveUnitId`, never
  `academyUnitId`). On any mismatch, fix the frontend — never add compat aliases
  to the backend without explicit approval. Full standard: `docs/api-contract/prd.md`.
  Error format: `docs/backend-error-contract.md`.

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
- Write all code comments in English. User-facing strings (UI copy, error messages) stay in PT-BR.
