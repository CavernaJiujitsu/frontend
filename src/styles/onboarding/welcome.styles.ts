import { StyleSheet } from "react-native";

import { BrandColors, Colors } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    width: "100%",
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 28,
    marginLeft: 4,
  },
  card: {
    width: "100%",
    height: 350,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  image: {
    width: 200,
    height: 200,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    gap: 10,
    padding: 50,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.light.backgroundSelected,
  },
  dotActive: {
    backgroundColor: BrandColors.secondary,
    width: 18,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  skipText: {
    fontSize: 18,
    color: Colors.light.text,
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: BrandColors.secondary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    minWidth: 166,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: BrandColors.onPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
});
