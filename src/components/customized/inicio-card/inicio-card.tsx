import { Pressable, View } from "react-native";
import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";

import { globalStyles } from "@/styles/global.styles";
import { inicioCardStyles as styles } from "./styles/inicio-card.styles";

export type InicioCardProps = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
};

export function InicioCard({
  children,
  onPress,
  accessibilityLabel,
  style,
  testID,
}: InicioCardProps) {
  if (!onPress) {
    return (
      <View testID={testID} style={[globalStyles.card, styles.card, style]}>
        <View style={styles.contentGap}>{children}</View>
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        globalStyles.card,
        styles.card,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.contentGap}>{children}</View>
    </Pressable>
  );
}
