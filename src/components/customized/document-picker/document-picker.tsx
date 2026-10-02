import * as DocumentPicker from "expo-document-picker";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useCallback } from "react";

import { type CertificateMock } from "@/api/mocks/belts";
import { documentPickerStyles as styles } from "@/components/customized/document-picker/styles/document-picker.styles";
import { validateCertificateFile } from "@/utils/certificate-validation";

type CertificatePickerProps = {
  value: CertificateMock | null;
  onChange: (file: CertificateMock | null) => void;
  disabled?: boolean;
};

function formatSizeMB(size?: number): string {
  if (!size) return "";
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export function CertificatePicker({
  value,
  onChange,
  disabled = false,
}: CertificatePickerProps) {
  const handlePick = useCallback(async () => {
    if (disabled) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const size = asset.size ?? asset.file?.size;
      const validationError = validateCertificateFile({
        name: asset.name,
        size,
        mimeType: asset.mimeType,
      });
      if (validationError) {
        Alert.alert(validationError.title, validationError.message);
        return;
      }

      onChange({
        name: asset.name,
        uri: asset.uri,
        size,
        mimeType: asset.mimeType ?? undefined,
      });
    } catch {
      Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
    }
  }, [disabled, onChange]);

  const handleRemove = useCallback(() => {
    if (!disabled) onChange(null);
  }, [disabled, onChange]);

  return (
    <View style={[styles.card, value && styles.cardSelected]}>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.8}
        onPress={handlePick}
        disabled={disabled}
        style={styles.pickArea}
      >
        <Text style={styles.pickTitle} numberOfLines={1}>
          {value ? value.name : "Enviar certificado (opcional)"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.description}>
        {value && value.size
          ? `Tamanho: ${formatSizeMB(value.size)}.`
          : "Toque para anexar uma foto ou PDF do seu certificado (máx. 5MB)."}
      </Text>

      {value && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={value ? handleRemove : handlePick}
          disabled={disabled}
          style={styles.removeButton}
        >
          <Text style={styles.removeButtonText}>
            {value
              ? "Toque para substituir o certificado"
              : "Toque para anexar"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
