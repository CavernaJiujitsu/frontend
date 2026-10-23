import { StyleSheet } from "react-native";

import { Colors, Spacing } from "@/constants/theme";

export const scheduleStyles = StyleSheet.create({
  pageGap: {
    gap: Spacing.three,
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backChevron: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 30,
    color: Colors.light.text,
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
  selectedDate: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    textAlign: "left",
    textTransform: "capitalize",
  },
  list: {
    flex: 1,
  },
  feedback: {
    gap: Spacing.two,
  },
  listContent: {
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.five,
    gap: Spacing.one,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});
