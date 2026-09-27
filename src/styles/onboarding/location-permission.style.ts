import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: "space-between",
  },

  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    minHeight: 280,
    maxHeight: 430,
  },

  illustration: {
    width: "100%",
    height: "100%",
  },

  textContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 28,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  description: {
    color: "#B5B5BD",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 340,
  },

  secondaryDescription: {
    color: "#73737D",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 320,
    marginTop: 10,
  },

  actions: {
    width: "100%",
    alignItems: "center",
  },

  primaryButton: {
    width: "100%",
    height: 54,
    borderRadius: 12,

    backgroundColor: "#FF6338",

    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  primaryButtonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: "#0B0B0F",
    fontSize: 15,
    fontWeight: "800",
  },

  skipButton: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  skipButtonText: {
    color: "#777780",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});
