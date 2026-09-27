import { DefaultButton } from "@/components/customized/default-button";
import { styles } from "@/styles/onboarding/belt-info/belt-info.style";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BELTS = [
  { id: "white", name: "Branca", color: "⚪" },
  { id: "yellow", name: "Amarela", color: "🟡" },
  { id: "orange", name: "Laranja", color: "🟠" },
  { id: "green", name: "Verde", color: "🟢" },
  { id: "blue", name: "Azul", color: "🔵" },
  { id: "purple", name: "Roxa", color: "🟣" },
  { id: "brown", name: "Marrom", color: "🟤" },
  { id: "black", name: "Preta", color: "⚫" },
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function BeltInfoScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const [selectedBelt, setSelectedBelt] = useState<string>("blue");
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        if (file.size && file.size > MAX_FILE_SIZE_BYTES) {
          Alert.alert(
            "Arquivo muito grande",
            "O tamanho máximo permitido para o certificado é de 5MB.",
          );
          return;
        }

        setSelectedFile(file);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleContinue = async () => {
    if (!selectedBelt) {
      Alert.alert("Atenção", "Selecione uma faixa para continuar.");
      return;
    }

    setIsLoading(true);

    try {
      if (selectedFile) {
        const formData = new FormData();

        if (selectedFile.file) {
          formData.append("file", selectedFile.file);
        } else {
          formData.append("file", {
            uri: selectedFile.uri,
            name: selectedFile.name,
            type: selectedFile.mimeType || "application/pdf",
          } as any);
        }

        formData.append("belt", selectedBelt);

        const response = await fetch(
          "http://localhost:3000/certificates/upload",
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error("Falha no upload do certificado");
        }
      }

      // CORREÇÃO DOS ESTADOS:
      setIsLoading(false);
      setIsSuccess(true);

      // Redireciona após 1.5s
      setTimeout(() => {
        router.replace("/onboarding/belt-info");
      }, 1500);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar os dados. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.cardContainer,
            isSmallScreen && styles.cardContainerSmall,
          ]}
        >
          {/* BANNER DE NOTIFICAÇÃO SUPERIOR */}
          {isSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>
                ✅ Dados e certificado enviados com sucesso!
              </Text>
            </View>
          )}

          <View style={styles.header}>
            <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
              Informe sua faixa
            </Text>
            <Text style={styles.subtitle}>
              Um professor homologado vai validar na sua primeira aula.
            </Text>
          </View>

          <View style={styles.beltsGrid}>
            {BELTS.map((belt) => {
              const isSelected = selectedBelt === belt.id;
              return (
                <TouchableOpacity
                  key={belt.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedBelt(belt.id)}
                  disabled={isLoading || isSuccess}
                  style={[
                    styles.beltChip,
                    isSelected && styles.selectedBeltChip,
                    isSmallScreen && styles.beltChipSmall,
                  ]}
                >
                  <Text style={styles.emoji}>{belt.color}</Text>
                  <Text
                    style={[
                      styles.beltText,
                      isSelected && styles.selectedBeltText,
                    ]}
                  >
                    {belt.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickFile}
            disabled={isLoading || isSuccess}
            style={[
              styles.uploadCard,
              selectedFile && styles.uploadCardSelected,
              isSmallScreen && styles.uploadCardSmall,
            ]}
          >
            <View style={styles.uploadHeader}>
              <Text style={styles.uploadEmoji}>
                {selectedFile ? "✅" : "📄"}
              </Text>
              <Text style={styles.uploadTitle} numberOfLines={1}>
                {selectedFile
                  ? selectedFile.name
                  : "Enviar certificado (opcional)"}
              </Text>
            </View>
            <Text style={styles.uploadDescription}>
              {selectedFile
                ? `Tamanho: ${(selectedFile.size! / (1024 * 1024)).toFixed(2)} MB.`
                : "Toque para anexar uma foto ou PDF do seu certificado (máx. 5MB)."}
            </Text>

            {selectedFile && !isSuccess && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveFile}
                disabled={isLoading}
              >
                <Text style={styles.removeButtonText}>
                  Upload concluído. Toque para substituir
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <Text style={styles.infoText}>
            Sem certificado? Sem problema — o professor confirma sua faixa na
            aula.
          </Text>

          <View style={styles.footer}>
            <DefaultButton
              label={
                isLoading
                  ? "Enviando..."
                  : isSuccess
                    ? "Enviado com Sucesso! ✅"
                    : "Continuar"
              }
              color={isSuccess ? "#00B894" : "#FF6B35"}
              action={handleContinue}
              disabled={!selectedBelt || isLoading || isSuccess}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
