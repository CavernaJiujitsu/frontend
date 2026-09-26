import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { BrandColors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const navigationTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: BrandColors.background,
        },
      }}
    >
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
