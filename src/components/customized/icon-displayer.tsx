import { Image } from "expo-image";
import { type ImageSourcePropType, StyleSheet, View } from "react-native";

type IconDisplayerProps = {
  Icon: ImageSourcePropType;
  borderColor: string;
  backgroundDefinition: string;
};

export function IconDisplayer({
  Icon,
  borderColor,
  backgroundDefinition,
}: IconDisplayerProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.container,
        {
          backgroundColor: backgroundDefinition,
          borderColor,
        },
      ]}
    >
      <Image contentFit="contain" source={Icon} style={styles.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 92,
    height: 92,
    borderWidth: 2,
    borderRadius: 46,
  },
  icon: {
    width: 48,
    height: 48,
  },
});
