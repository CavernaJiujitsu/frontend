---
name: ui-style
description: Apply the Caverna JiuJitsu visual language to mobile interfaces.
---

# Caverna JiuJitsu UI Style

Use this skill when creating or changing user-facing screens and components in this project.

## Color System

- App background: `#0B0C10`. Use it as the default screen, navigation, and splash background.
- Primary: `#2A2D37`. Use it for primary actions such as "Já tenho conta".
- Secondary/accent: `#FF6B35`. Use it for selected details and emphasis.
- Button border: `#2A2D37`.
- Text on dark surfaces: `#FFFFFF`.

Use shared tokens from `@/constants/theme`; avoid one-off brand colors in screens.

## Components

- Use the app-owned `DefaultButton` component from `@/components/customized/default-button` for tappable primary and secondary actions.
- Pass `label`, `color`, and `action` at each use site. Use `textColor` only when the background requires contrast.
- Buttons have a minimum height of 56 and an 8px border radius. Preserve these dimensions unless there is a specific accessibility reason to change them.

## Layout

- Respect safe areas with `SafeAreaView` from `react-native-safe-area-context`.
- Keep onboarding messages centered, with clear hierarchy and comfortable spacing.
- Anchor persistent onboarding actions at the bottom of the screen with enough inset for device safe areas.
