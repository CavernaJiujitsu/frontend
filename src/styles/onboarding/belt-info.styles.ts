import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

export const beltInfoStyles = StyleSheet.create({
  pageGap: {
    gap: Spacing.three,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.text,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "left",
    lineHeight: 20,
  },
  successBanner: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.borderSecondary,
    alignItems: "center",
  },
  successBannerText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    color: BrandColors.borderSecondary,
  },
  beltsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  beltChip: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedBeltChip: {
    borderColor: BrandColors.borderSecondary,
  },
  beltText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.light.textSecondary,
  },
  selectedBeltText: {
    fontWeight: "700",
    color: Colors.light.text,
  },
  infoText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
  actions: {
    width: "100%",
  },
});
