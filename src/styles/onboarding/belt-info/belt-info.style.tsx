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
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#1E2330",
    gap: 16,
  },
  cardContainerSmall: {
    paddingHorizontal: 14,
    paddingVertical: 18,
    borderRadius: 16,
  },
  successBanner: {
    backgroundColor: "rgba(0, 184, 148, 0.15)",
    borderWidth: 1,
    borderColor: "#00B894",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  successBannerText: {
    color: "#00B894",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  header: {
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  titleSmall: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  beltsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 10,
  },
  beltChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#181C27",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 8,
  },
  beltChipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  selectedBeltChip: {
    borderColor: "#00B894",
    backgroundColor: "#162224",
  },
  emoji: {
    fontSize: 13,
  },
  beltText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
  },
  selectedBeltText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  uploadCard: {
    width: "100%",
    backgroundColor: "#181C27",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2D37",
    marginTop: 4,
  },
  uploadCardSmall: {
    padding: 12,
  },
  uploadCardSelected: {
    borderColor: "#00B894",
    backgroundColor: "#142022",
  },
  uploadHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  uploadEmoji: {
    fontSize: 18,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  uploadDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 16,
  },
  removeButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  removeButtonText: {
    color: "#ade766",
    fontSize: 12,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  footer: {
    marginTop: 8,
    width: "100%",
  },
});
