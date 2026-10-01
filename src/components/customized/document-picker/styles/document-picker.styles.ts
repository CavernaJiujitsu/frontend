import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

/**
 * Deltas específicos do DocumentPicker.
 * Base vem de `globalStyles.card/input`. Nenhum hex aqui.
 */
export const documentPickerStyles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  cardSelected: {
    borderColor: BrandColors.borderSecondary,
  },
  pickArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  pickTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
  },
  description: {
    marginTop: Spacing.one,
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
  removeButton: {
    marginTop: Spacing.two,
    alignSelf: "flex-start",
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: BrandColors.borderSecondary,
  },
});
