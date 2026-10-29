import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/api/bootstrap/query-client";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ErrorToast } from "@/components/customized/error-toast/error-toast";
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
    <QueryClientProvider client={queryClient}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
      <ErrorToast />
    </QueryClientProvider>
    </ThemeProvider>
  );
}
