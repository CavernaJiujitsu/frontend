import { StyleSheet } from "react-native";

import { BrandColors, Colors } from "@/constants/theme";

export const teacherNavbarStyles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    backgroundColor: BrandColors.background,
    minHeight: 84,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  itemPressed: {
    opacity: 0.7,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "transparent",
    marginBottom: 2,
  },
  dotSelected: {
    backgroundColor: BrandColors.secondary,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  labelSelected: {
    color: Colors.light.text,
  },
});
