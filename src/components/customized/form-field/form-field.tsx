import { Text, TextInput, View } from "react-native";
import type { KeyboardTypeOptions, TextInputProps } from "react-native";

import { Colors } from "@/constants/theme";
import { formFieldStyles as styles } from "./styles/form-field.styles";

export type FormFieldWidth = number | "full" | "half";

export type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: TextInputProps["autoComplete"];
  autoCorrect?: boolean;
  rightAction?: React.ReactNode;
  width?: FormFieldWidth;
  editable?: boolean;
  testID?: string;
  accessibilityLabel?: string;
};

function resolveWidth(width: FormFieldWidth): `${number}%` {
  if (width === "full") return "100%";
  if (width === "half") return "50%";
  const clamped = Math.min(100, Math.max(10, Math.round(width)));
  return `${clamped}%` as `${number}%`;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoComplete,
  autoCorrect,
  rightAction,
  width = "full",
  editable = true,
  testID,
  accessibilityLabel,
}: FormFieldProps) {
  return (
    <View testID={testID} style={[styles.group, { width: resolveWidth(width) }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputWrapError]}>
        <TextInput
          accessibilityLabel={accessibilityLabel ?? placeholder ?? label}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          editable={editable}
        />
        {rightAction}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
