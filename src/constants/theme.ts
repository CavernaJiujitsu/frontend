import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#FFFFFF",
    background: "#0B0C10",
    backgroundElement: "#1C1F26",
    backgroundSelected: "#2A2D37",
    textSecondary: "#B0B4BA",
  },
  dark: {
    text: "#FFFFFF",
    background: "#0B0C10",
    backgroundElement: "#1C1F26",
    backgroundSelected: "#2A2D37",
    textSecondary: "#B0B4BA",
  },
} as const;

export const BrandColors = {
  background: "#0B0C10",
  primary: "#2A2D37",
  secondary: "#FF6B35",
  border: "#2A2D37",
  borderSecondary: "#00E5C9",
  onPrimary: "#FFFFFF",
  danger: "#FF6B6B",
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const PageInset = {
  horizontal: Spacing.four,
  vertical: Spacing.two,
} as const;

export const MaxContentWidth = 800;

export const BeltColors = {
  white: '#F5F5F5', yellow: '#FFD600', orange: '#FF8A00', green: '#24C76A',
  blue: '#2E7CF6', purple: '#8A4DAB', brown: '#8B5E34', black: '#16171B',
} as const;
