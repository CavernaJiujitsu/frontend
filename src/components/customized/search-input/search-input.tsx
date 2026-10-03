import { Image } from "expo-image";
import { Pressable, Text, TextInput, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import { Colors } from "@/constants/theme";
import { globalStyles } from "@/styles/global.styles";
import { searchInputStyles as styles } from "./styles/search-input.styles";

export type SearchInputWidth = number | "full" | "half";

export type SearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon: ImageSourcePropType;
  width?: SearchInputWidth;
  onClear?: () => void;
  editable?: boolean;
  testID?: string;
  accessibilityLabel?: string;
};

function resolveWidth(width: SearchInputWidth): `${number}%` {
  if (width === "full") return "100%";
  if (width === "half") return "50%";
  const clamped = Math.min(100, Math.max(10, Math.round(width)));
  return `${clamped}%` as `${number}%`;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder,
  icon,
  width = "full",
  onClear,
  editable = true,
  testID,
  accessibilityLabel,
}: SearchInputProps) {
  const showClear = value.length > 0 && onClear !== undefined;

  return (
    <View
      testID={testID}
      style={[globalStyles.input, styles.searchLayout, { width: resolveWidth(width) }]}
    >
      <Image
        source={icon}
        style={styles.icon}
        contentFit="contain"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />

      <TextInput
        accessibilityRole="search"
        accessibilityLabel={accessibilityLabel ?? placeholder ?? "Buscar"}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textSecondary}
        editable={editable}
        returnKeyType="search"
        style={styles.field}
      />

      {showClear && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          onPress={onClear}
          style={styles.clearButton}
        >
          <Text style={styles.clearText}>×</Text>
        </Pressable>
      )}
    </View>
  );
}
