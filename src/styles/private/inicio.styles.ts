import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

export const inicioStyles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  scrollContent: {
    flexGrow: 1,
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.text,
    textAlign: "left",
  },
  greetingSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: "left",
    lineHeight: 20,
  },
  linkWrap: {
    alignSelf: "flex-start",
  },
  link: {
    fontSize: 12,
    fontWeight: "600",
    color: BrandColors.borderSecondary,
  },
  beltRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  beltDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  },
  beltName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  beltProgressText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.secondary,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.light.textSecondary,
  },
  nextClassRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextClassTime: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.text,
    marginRight: 10,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: Spacing.one,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSelected,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: BrandColors.borderSecondary,
  },
  nextClassFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teacher: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    flexShrink: 1,
    marginRight: Spacing.two,
  },
  confirmBtn: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: BrandColors.secondary,
  },
  confirmBtnPressed: {
    opacity: 0.85,
  },
  confirmBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: BrandColors.background,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.light.textSecondary,
  },
  feedbackCard: {
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  retryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 16,
    backgroundColor: BrandColors.secondary,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: BrandColors.background,
  },
  nearbyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  nearbyHeaderText: {
    marginLeft: 12,
    flexShrink: 1,
  },
  nearbyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  nearbySub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.light.backgroundElement,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundSelected,
  },
  avatarOverlap: {
    marginLeft: -12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarExtra: {
    backgroundColor: Colors.light.backgroundSelected,
  },
  avatarExtraText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.light.textSecondary,
  },
  closestName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
  },
  closestFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closestMeta: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    flexShrink: 1,
    marginRight: 8,
  },
});
