import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

type MapControlsProps = {
  is3D: boolean;
  onToggle3D: () => void;
  onExpand?: () => void;
};

export function MapControls({ is3D, onToggle3D, onExpand }: MapControlsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={is3D ? "Desativar visão 3D" : "Ativar visão 3D"}
        accessibilityState={{ selected: is3D }}
        onPress={onToggle3D}
        style={({ pressed }) => [styles.button, is3D && styles.buttonActive, pressed && styles.pressed]}
      >
        <Text style={[styles.label, is3D && styles.labelActive]}>3D</Text>
      </Pressable>
      {onExpand ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Expandir mapa"
          onPress={onExpand}
          style={({ pressed }) => [styles.button, styles.expandButton, pressed && styles.pressed]}
        >
          <Text style={styles.label}>Expandir</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Spacing.two,
    right: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    zIndex: 2,
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: Colors.light.backgroundElement,
  },
  expandButton: { paddingHorizontal: Spacing.three },
  buttonActive: {
    borderColor: BrandColors.borderSecondary,
    backgroundColor: BrandColors.primary,
  },
  pressed: { opacity: 0.8 },
  label: { color: Colors.light.text, fontSize: 13, fontWeight: "700" },
  labelActive: { color: BrandColors.borderSecondary },
});
