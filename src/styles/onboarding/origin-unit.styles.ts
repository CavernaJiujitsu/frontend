import { StyleSheet } from "react-native";
import { BrandColors, Colors, Spacing } from "@/constants/theme";

export const originUnitStyles = StyleSheet.create({
  container: { flex: 1, gap: Spacing.three },
  header: { gap: Spacing.two },
  title: { color: Colors.light.text, fontSize: 24, fontWeight: "800" },
  body: { color: Colors.light.textSecondary, fontSize: 14, lineHeight: 20 },
  unit: {
    padding: Spacing.three,
    borderRadius: 16,
    gap: Spacing.two,
    borderWidth: 2,
    borderColor: BrandColors.border,
    backgroundColor: Colors.light.backgroundElement,
  },
  selected: { borderColor: BrandColors.secondary },
  unitName: { color: Colors.light.text, fontSize: 18, fontWeight: "700" },
  selection: { color: BrandColors.secondary, fontWeight: "700" },
  list: { gap: Spacing.three, paddingBottom: Spacing.three },
  pagination: { gap: Spacing.two },
  pageActions: { flexDirection: "row", gap: Spacing.two },
  pageAction: { flex: 1 },
  error: { color: BrandColors.danger, fontSize: 14, lineHeight: 20 },
});
