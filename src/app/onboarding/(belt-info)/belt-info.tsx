import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  beltMocks,
  uploadCertificateMock,
  type CertificateMock,
} from "@/api/mocks/belts";
import { DefaultButton } from "@/components/customized/default-button";
import { CertificatePicker } from "@/components/customized/document-picker/document-picker";
import { BrandColors } from "@/constants/theme";
import { globalStyles } from "@/styles/global.styles";
import { beltInfoStyles as styles } from "@/styles/onboarding/belt-info.styles";

// TODO: substituir o mock por `GET /belts` + `POST /certificates/upload`
// quando o contrato do back estiver definido. Fluxo mantido navegável.
// Rota: /onboarding/belt-info (grupo `belt-info` segue o padrão das demais telas).
export default function BeltInfoScreen() {
  const router = useRouter();
  const [selectedBelt, setSelectedBelt] = useState<string>("blue");
  const [selectedFile, setSelectedFile] = useState<CertificateMock | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleContinue = async () => {
    if (!selectedBelt) {
      Alert.alert("Atenção", "Selecione uma faixa para continuar.");
      return;
    }

    setIsLoading(true);
    try {
      await uploadCertificateMock(selectedBelt, selectedFile);
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } catch {
      setIsLoading(false);
      Alert.alert("Erro", "Não foi possível salvar os dados. Tente novamente.");
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={[globalStyles.container, styles.pageGap]}>
        <View style={[globalStyles.flex, styles.content]}>
          {isSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>
                Dados e certificado enviados com sucesso!
              </Text>
            </View>
          )}

          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              Informe sua faixa
            </Text>
            <Text style={styles.subtitle}>
              Um professor homologado vai validar na sua primeira aula.
            </Text>
          </View>

          <View style={styles.beltsGrid}>
            {beltMocks.map((belt) => {
              const isSelected = selectedBelt === belt.id;
              return (
                <TouchableOpacity
                  key={belt.id}
                  accessibilityRole="button"
                  activeOpacity={0.8}
                  onPress={() => setSelectedBelt(belt.id)}
                  disabled={isLoading || isSuccess}
                  style={[
                    styles.beltChip,
                    isSelected && styles.selectedBeltChip,
                  ]}
                >
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

          <CertificatePicker
            value={selectedFile}
            onChange={setSelectedFile}
            disabled={isLoading || isSuccess}
          />

          <Text style={styles.infoText}>
            Sem certificado? Sem problema — o professor confirma sua faixa na
            aula.
          </Text>
        </View>

        <View style={styles.actions}>
          <DefaultButton
            label={
              isLoading
                ? "Enviando..."
                : isSuccess
                  ? "Enviado com sucesso!"
                  : "Continuar"
            }
            color={
              isSuccess ? BrandColors.borderSecondary : BrandColors.secondary
            }
            action={handleContinue}
            disabled={!selectedBelt || isLoading || isSuccess}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
