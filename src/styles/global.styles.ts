import { StyleSheet } from "react-native";

import {
  BrandColors,
  Colors,
  PageInset,
  Spacing,
} from "@/constants/theme";

export const globalStyles = StyleSheet.create({
  /**
   * Caixa grande do layout: dona do respiro entre a borda da página e o conteúdo.
   * Telas e subcaixas não repetem esse espaçamento.
   */
  screen: {
    flex: 1,
    backgroundColor: BrandColors.background,
    paddingHorizontal: PageInset.horizontal,
    paddingVertical: PageInset.vertical,
  },
  /**
   * Subcaixa de conteúdo: cuida apenas do conteúdo interno, sem gutter de página.
   */
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  containerHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerVertical: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
    alignItems: "center",
  },
  flex: {
    flex: 1,
  },
  flexRow: {
    flex: 1,
    flexDirection: "row",
  },
  flexColumn: {
    flex: 1,
    flexDirection: "column",
  },
  paddingHorizontal: {
    paddingHorizontal: Spacing.four,
  },
  paddingVertical: {
    paddingVertical: Spacing.four,
  },
  padding: {
    padding: Spacing.four,
  },
  marginHorizontal: {
    marginHorizontal: Spacing.four,
  },
  marginVertical: {
    marginVertical: Spacing.four,
  },
  marginTop: {
    marginTop: Spacing.three,
  },
  marginBottom: {
    marginBottom: Spacing.three,
  },
  gap: {
    gap: Spacing.three,
  },
  gapSmall: {
    gap: Spacing.two,
  },
  gapLarge: {
    gap: Spacing.four,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullWidth: {
    width: "100%",
  },
  fullHeight: {
    height: "100%",
  },
  image: {
    resizeMode: "contain",
  },
  textCenter: {
    textAlign: "center",
  },
  textLeft: {
    textAlign: "left",
  },
  textRight: {
    textAlign: "right",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: BrandColors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 16,
    padding: Spacing.four,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  input: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    padding: Spacing.three,
    color: Colors.light.text,
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: BrandColors.border,
    marginVertical: Spacing.three,
  },
});
