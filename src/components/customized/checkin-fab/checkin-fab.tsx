import { Pressable, Text, View } from "react-native";
import type { ViewStyle } from "react-native";

import { checkinFabStyles as styles } from "./styles/checkin-fab.styles";

export type CheckinFabProps = {
  onPress: () => void;
  label?: string;
  style?: ViewStyle;
};

export function CheckinFab({ onPress, label = "Check-in", style }: CheckinFabProps) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fazer check-in"
        onPress={onPress}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.plus}>+</Text>
      </Pressable>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
