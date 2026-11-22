import { useState, type ComponentType } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandColors, Colors, Spacing } from "@/constants/theme";
import { MapControls } from "./map-controls";
import { validCoordinate, type CaveMapProps } from "./map-data";

export type MapCanvasProps = Omit<CaveMapProps, "height"> & { is3D: boolean };

type CaveMapShellProps = CaveMapProps & {
  Canvas: ComponentType<MapCanvasProps>;
};

export function CaveMapShell({ Canvas, center, units, selectedId, onUnitPress, height = 210 }: CaveMapShellProps) {
  const [expanded, setExpanded] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const hasContent = validCoordinate(center) || units.length > 0;
  const canvasProps = { center, units, selectedId, onUnitPress, is3D };
  const toggle3D = () => setIs3D((value) => !value);

  return (
    <>
      <View style={[styles.frame, { height }]}>
        <Canvas {...canvasProps} />
        {hasContent ? (
          <MapControls is3D={is3D} onToggle3D={toggle3D} onExpand={() => setExpanded(true)} />
        ) : null}
      </View>
      {expanded ? (
        <Modal
          visible
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setExpanded(false)}
        >
          <SafeAreaView style={styles.modal} edges={["top", "bottom", "left", "right"]}>
            <View style={styles.header}>
              <Text accessibilityRole="header" style={styles.title}>Mapa das cavernas</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar mapa"
                onPress={() => setExpanded(false)}
                style={({ pressed }) => [styles.close, pressed && styles.pressed]}
              >
                <Text style={styles.closeIcon}>×</Text>
              </Pressable>
            </View>
            <View style={styles.map}>
              <Canvas {...canvasProps} />
              <MapControls is3D={is3D} onToggle3D={toggle3D} />
            </View>
          </SafeAreaView>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: Colors.light.backgroundElement,
  },
  modal: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  title: { color: Colors.light.text, fontSize: 18, fontWeight: "700" },
  close: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: Colors.light.backgroundElement,
  },
  closeIcon: { color: Colors.light.text, fontSize: 26, lineHeight: 28 },
  map: { flex: 1, overflow: "hidden", backgroundColor: Colors.light.backgroundElement },
  pressed: { opacity: 0.8 },
});
