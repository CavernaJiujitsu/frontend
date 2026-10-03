import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

export const cardComponentStyles = StyleSheet.create({
  cardLayout: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.three,
  },
  cardPressed: {
    opacity: 0.8,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.light.backgroundSelected,
    marginRight: Spacing.three,
  },
  titleRowSpacing: {
    marginBottom: Spacing.one,
    gap: Spacing.two,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
    flexShrink: 1,
    marginRight: Spacing.two,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: Spacing.one,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSelected,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: BrandColors.borderSecondary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});
