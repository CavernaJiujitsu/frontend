import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#00CEC9",
    marginBottom: 10,
    backgroundColor: "#1A1A1E",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  badge: {
    backgroundColor: "#093A3E",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  badgeText: {
    color: "#00CEC9",
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "#1A1A1E",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    color: "#FF5722",
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#A0A0A0",
    fontSize: 12,
  },
  accordionGroup: {
    width: "100%",
  },
  accordionItem: {
    backgroundColor: "#1A1A1E",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  accordionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  accordionContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2E",
  },
  subText: {
    color: "#A0A0A0",
    fontSize: 12,
  },
});
