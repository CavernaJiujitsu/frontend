import type { ViewStyle } from "react-native";
import { Image, Pressable, Text, View } from "react-native";

import { globalStyles } from "@/styles/global.styles";
import { cardComponentStyles as styles } from "./styles/card-component.styles";

export type CardComponentProps = {
  image: string | number;
  title: string;
  tags: string[];
  subtitle: string;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export default function CardComponent({
  image,
  title,
  tags,
  subtitle,
  onPress,
  accessibilityLabel,
  style,
}: CardComponentProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [
        globalStyles.card,
        styles.cardLayout,
        pressed && styles.cardPressed,
        style,
      ]}
    >
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        style={styles.thumb}
        resizeMode="cover"
      />

      <View style={globalStyles.flex}>
        <View style={[globalStyles.row, styles.titleRowSpacing]}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {tags.map((tag, index) => (
            <View key={`${tag}-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}
