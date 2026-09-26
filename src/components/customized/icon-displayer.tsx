import { Image } from "expo-image";
import { type ImageSourcePropType, StyleSheet, View } from "react-native";

type IconDisplayerProps = {
  Icon: ImageSourcePropType;
  borderColor: string;
  backgroundDefinition: string;
  format: "rounded" | "square";
  size: number;
};

export function IconDisplayer({
  Icon,
  borderColor,
  backgroundDefinition,
  format,
  size,
}: IconDisplayerProps) {
  const iconSize = Math.round(size * 0.52);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: format === "rounded" ? size / 2 : 0,
          backgroundColor: backgroundDefinition,
          borderColor,
        },
      ]}
    >
      <Image
        contentFit="contain"
        source={Icon}
        style={{ width: iconSize, height: iconSize }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
});
