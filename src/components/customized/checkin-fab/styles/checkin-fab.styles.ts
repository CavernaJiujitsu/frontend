import { StyleSheet } from "react-native";

import { BrandColors, Colors } from "@/constants/theme";

export const checkinFabStyles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 24,
    bottom: 24,
    alignItems: "center",
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BrandColors.secondary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  plus: {
    fontSize: 32,
    lineHeight: 34,
    color: BrandColors.background,
    fontWeight: "400",
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
});
