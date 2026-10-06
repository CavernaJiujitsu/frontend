import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CertificateMock } from "@/api/mocks/belts";
import {
  declareBeltValidation,
} from "@/api/services/belt-validations.service";
import { listBelts, type Belt } from "@/api/services/belts.service";
import { uploadCertificate } from "@/api/services/certificates.service";
import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { CertificatePicker } from "@/components/customized/document-picker/document-picker";
import { toAbsoluteUrl } from "@/constants/api";
import { BrandColors } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { beltInfoStyles as styles } from "@/styles/onboarding/belt-info.styles";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function BeltInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cavernaId?: string | string[];
    cavernaTitle?: string | string[];
  }>();
  const cavernaParams = {
    cavernaId: firstParam(params.cavernaId),
    cavernaTitle: firstParam(params.cavernaTitle),
  };
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const setBeltValidationId = useAppStore(
    (state) => state.setBeltValidationId,
  );
  const [belts, setBelts] = useState<Belt[]>([]);
  const [selectedBelt, setSelectedBelt] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<CertificateMock | null>(
    null,
  );
  const [isLoadingBelts, setIsLoadingBelts] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    listBelts()
      .then((result) => {
        if (!active) return;
        setBelts(result);
        setSelectedBelt(
          result.find((belt) => belt.name === "Azul")?.id ?? result[0]?.id ?? "",
        );
      })
      .catch((err: unknown) => {
        Alert.alert(
          "Erro",
          backendMessage(err, "Não foi possível carregar as faixas."),
        );
      })
      .finally(() => {
        if (active) setIsLoadingBelts(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleContinue = async () => {
    if (!selectedBelt) {
      Alert.alert("Atenção", "Selecione uma faixa para continuar.");
      return;
    }
    if (!practitionerId) {
      Alert.alert(
        "Atenção",
        "Sua conta não foi criada. Volte e crie sua conta novamente.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const uploaded = selectedFile
        ? await uploadCertificate(selectedFile)
        : undefined;
      const validation = await declareBeltValidation({
        practitionerId,
        targetBeltId: selectedBelt,
        ...(uploaded ? { certificateUrl: toAbsoluteUrl(uploaded.url) } : {}),
      });
      setBeltValidationId(validation.id);
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push({
          pathname: "/onboarding/schedule",
          params: cavernaParams,
        });
      }, 1500);
    } catch (err: unknown) {
      setIsLoading(false);
      Alert.alert(
        "Erro",
        backendMessage(err, "Não foi possível salvar os dados. Tente novamente."),
      );
    }
  };

  const isBusy = isLoading || isSuccess;

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
            {belts.map((belt) => {
              const isSelected = selectedBelt === belt.id;
              return (
                <TouchableOpacity
                  key={belt.id}
                  accessibilityRole="button"
                  activeOpacity={0.8}
                  onPress={() => setSelectedBelt(belt.id)}
                  disabled={isLoadingBelts || isBusy}
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
            disabled={isLoadingBelts || isBusy}
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
            disabled={!selectedBelt || isLoadingBelts || isBusy}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
