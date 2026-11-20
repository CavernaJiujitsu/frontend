import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { queryClient } from "@/api/bootstrap/query-client";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ErrorToast } from "@/components/customized/error-toast/error-toast";
import { NoticeToast } from "@/components/customized/notice-toast/notice-toast";
import { DebugConsole } from "@/components/debug-console";
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
        <NoticeToast />
        <DebugConsole />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
