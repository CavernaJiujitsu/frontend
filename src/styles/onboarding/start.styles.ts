import { StyleSheet } from "react-native";

import { BrandColors } from "@/constants/theme";

export const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  message: {
    alignItems: "center",
    width: "100%",
  },
  mascotContainer: {
    width: "100%",
    maxWidth: 416,
    aspectRatio: 1144 / 1375,
    marginBottom: 16,
    opacity: 0,
    transform: [{ scale: 0.88 }],
  },
  mascot: {
    width: "100%",
    height: "100%",
  },
  mascotFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    pointerEvents: "none",
  },
  eyeGlow: {
    position: "absolute",
    top: "8%",
    left: "46%",
    width: "20%",
    height: "10%",
    pointerEvents: "none",
    opacity: 0.2,
  },
  title: {
    color: BrandColors.secondary,
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    opacity: 0,
    transform: [{ translateY: 14 }],
  },
  description: {
    marginTop: 16,
    color: BrandColors.onPrimary,
    fontSize: 18,
    lineHeight: 27,
    textAlign: "center",
    opacity: 0,
  },
  primaryButtonEntrance: {
    opacity: 0,
    transform: [{ translateY: 22 }, { scale: 0.96 }],
  },
  secondaryButtonEntrance: {
    opacity: 0,
    transform: [{ translateY: 8 }],
  },
  actions: {
    gap: 12,
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
});
