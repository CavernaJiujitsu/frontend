import { StyleSheet } from "react-native";

import { Colors, Spacing } from "@/constants/theme";

export const SKELETON_ROWS = 4;

export const classSkeletonStyles = StyleSheet.create({
  block: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 16,
    padding: Spacing.three,
    overflow: "hidden",
  },
  bars: {
    flex: 1,
    gap: Spacing.two,
  },
  bar: {
    backgroundColor: Colors.light.backgroundSelected,
    borderRadius: 6,
  },
  titleBar: {
    height: 18,
    width: "62%",
  },
  subtitleBar: {
    height: 12,
    width: "42%",
  },
  paw: {
    opacity: 0.9,
  },
  sweep: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 96,
    backgroundColor: Colors.light.text,
    opacity: 0.07,
  },
});
