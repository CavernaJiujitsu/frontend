import { Pressable, StyleSheet, Text } from "react-native";

import { BrandColors } from "@/constants/theme";

type DefaultButtonProps = {
  label: string;
  color: string;
  action: () => void;
  textColor?: string;
  disabled?: boolean;
};

export function DefaultButton({
  label,
  color,
  action,
  textColor = BrandColors.onPrimary,
  disabled = false,
}: DefaultButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={action}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color },
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
});
