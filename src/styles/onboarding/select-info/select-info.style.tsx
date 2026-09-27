import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0E14",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#121620",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: "#1E2330",
    gap: 16,
  },
  cardContainerSmall: {
    paddingHorizontal: 14,
    paddingVertical: 20,
    borderRadius: 16,
    gap: 12,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  titleSmall: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  optionCard: {
    width: "100%",
    backgroundColor: "#181C27",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCardSmall: {
    padding: 14,
  },
  selectedOptionCard: {
    borderColor: "#00B894",
    backgroundColor: "#162224",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
    flexWrap: "wrap",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 140,
  },
  emoji: {
    fontSize: 18,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  optionTitleSmall: {
    fontSize: 15,
  },
  selectedBadge: {
    backgroundColor: "#0A3832",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00B894",
  },
  selectedBadgeText: {
    color: "#00B894",
    fontSize: 11,
    fontWeight: "600",
  },
  optionDescription: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
    marginTop: 4,
  },
  footer: {
    marginTop: 16,
    width: "100%",
  },
});
