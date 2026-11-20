import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";
import type { NoticeTone } from "@/store/useNoticeStore";

export const toneColors: Record<NoticeTone, string> = {
  success: BrandColors.success,
  error: BrandColors.danger,
  info: BrandColors.secondary,
};

export const noticeToastStyles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: Spacing.six,
    left: Spacing.four,
    right: Spacing.four,
    zIndex: 1000,
    elevation: 10,
    alignItems: "flex-end",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    minHeight: 76,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderLeftWidth: 4,
    borderRadius: 14,
    padding: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { color: BrandColors.background, fontSize: 17, fontWeight: "800" },
  copy: { flex: 1, gap: Spacing.one },
  title: { color: Colors.light.text, fontSize: 15, fontWeight: "700" },
  message: { color: Colors.light.textSecondary, fontSize: 13, lineHeight: 19 },
  closeButton: { minWidth: 28, minHeight: 28, alignItems: "center" },
  closeText: { color: Colors.light.textSecondary, fontSize: 22, lineHeight: 26 },
});
