---
name: ui-style
description: Apply the Caverna JiuJitsu visual language to mobile interfaces.
---

# Caverna JiuJitsu UI Style

Use this skill when creating or changing user-facing screens and components in this project.

## Vocabulary

- The product talks about **cavernas**, never about academias. Whenever a screen, label, placeholder, empty state, mock, or comment refers to the training location, write `caverna` (plural: `cavernas`).
- Examples: "Escolha sua caverna", "Buscar caverna...", "Encontramos estas perto de você".
- Keep this in code comments and mocks too, so the vocabulary stays consistent across the codebase.
- Existing identifiers/paths may still use `gym` (`nearby-gym.tsx`, `NearbyGymMock`); that is an internal naming detail and does not need renaming, but any user-facing string must say `caverna`.

## Color System

- App background: `#0B0C10`. Use it as the default background on every screen, including navigation and splash surfaces.
- Primary: `#2A2D37`. Use it for primary actions such as "Já tenho conta" and charcoal UI surfaces.
- Secondary/accent: `#FF6B35`. Use it for selected details, highlights, and emphasis rather than as the default page background.
- Button border: `#2A2D37`. Apply a visible border to shared buttons.
- Text on dark surfaces: `#FFFFFF`.

Use the shared tokens from `@/constants/theme`; do not introduce one-off brand hex values in screens.

## Components

- Use the app-owned `DefaultButton` component from `@/components/customized/default-button` for tappable primary and secondary actions.
- Pass `label`, `color`, and `action` at each use site. Use `textColor` only when the background requires contrast.
- Buttons have a minimum height of 56 and an 8px border radius. Preserve these dimensions unless there is a specific accessibility reason to change them.
- Use the app-owned `SearchInput` component from `@/components/customized/search-input/search-input` for text search backed by GET requests. It is presentational (dumb): the screen owns the text state and fetches via `usePaginatedSearch(route, term)`.
- `SearchInput` props: `value`, `onChangeText`, `placeholder`, `icon` (local `require`, `ImageSourcePropType` like `IconDisplayer`), `width`, optional `onClear`.
- `SearchInput` style is hybrid: `globalStyles.input` (background/border/radius/padding) + local `search-input.styles.ts` deltas. No hardcoded hex; `placeholderTextColor` is `Colors.light.textSecondary`.

## Mocks de UI

- Mocks que definem o design esperado do frontend vivem em `src/api/mocks/<contexto>.ts` (ex.: `nearby-gym.ts`).
- Cada mock é tipado e espelha as props do componente que alimenta, para deixar explícito como o design deve ficar antes do service real existir.

## Width Convention

- Width is owned by the implementing page via the `width` prop.
- Accepts a percentage number (`10`–`100`, clamped) or the `full` (`100%`, default) and `half` (`50%`) variants.
- Examples: `<SearchInput width="full" />`, `<SearchInput width="half" />`, `<SearchInput width={30} />`.

## Page Header

- List/search screens open with a page header above the content: title `24/800` in `Colors.light.text`, subtitle `14` in `Colors.light.textSecondary`, both `textAlign: "left"`.
- Mark the title with `accessibilityRole="header"` and keep `lineHeight: 20` on the subtitle.
- Style the header locally in the screen's `src/styles/<group>/<screen>.styles.ts` (`header`, `title`, `subtitle` with `gap: Spacing.one`). Do not reuse `globalStyles.title`/`globalStyles.subtitle` — they are centered and the global `title` color is not readable on the dark background.
- Keep the header fixed above the `FlatList`/`ScrollView` so the page title and any search input stay visible while the list scrolls.
- Buttons and inputs use `caverna`/brand wording in copy (e.g. search placeholder `Buscar caverna...`).

## Layout & Page Inset

The big box owns the space; the inner boxes own their content.

- The outer box is the layout (`globalStyles.screen`, wrapped in `SafeAreaView`). It owns the breathing room between the page edge and the content.
- Inner boxes (screens, sub-components, `globalStyles.container`) only handle their own internal content and gaps.
- If a screen has to think about "where I am placed", the responsibility is on the wrong layer — fix the layout box, not the screen.
- `PageInset` from `@/constants/theme` is the single source of that breathing room: `horizontal` 24, `vertical` 8. It is applied only in `globalStyles.screen`.
- Never repeat page-level `paddingHorizontal`/`paddingVertical`/`paddingBottom` inside screens or sub-components. Use `gap`, `marginBottom`, `maxWidth` and `alignSelf` for internal composition instead.
- `SafeAreaView` from `react-native-safe-area-context` handles device insets; do not recompute `insets.bottom` manually in a sub-component.
- Persistent bottom UI (tab bar, `BottomTabInset`) belongs to the layout box, not to the screen's action block.

## Layout

- Respect safe areas with `SafeAreaView` from `react-native-safe-area-context`.
- Keep onboarding messages centered, with clear hierarchy and comfortable spacing.
- Anchor persistent onboarding actions at the bottom of the screen with enough inset for device safe areas.
