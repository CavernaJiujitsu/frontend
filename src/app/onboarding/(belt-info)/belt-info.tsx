import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  declareBeltValidation,
} from "@/api/services/belt-validations.service";
import { listBelts, type Belt } from "@/api/services/belts.service";
import { uploadCertificate, type CertificateFile } from "@/api/services/certificates.service";
import { DefaultButton } from "@/components/customized/default-button";
import { CertificatePicker } from "@/components/customized/document-picker/document-picker";
import { getErrorMessage } from "@/constants/error-messages";
import { BrandColors } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { beltInfoStyles as styles } from "@/styles/onboarding/belt-info.styles";
import { notify, notifyError } from "@/utils/dialogs";
import { normalizeApiError } from "@/utils/normalize-api-error";

/** Time the success banner stays visible before moving on to the schedule. */
const SUCCESS_REDIRECT_DELAY_MS = 1500;

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
  const [selectedFile, setSelectedFile] = useState<CertificateFile | null>(
    null,
  );
  const [isLoadingBelts, setIsLoadingBelts] = useState<boolean>(true);
  const [beltsError, setBeltsError] = useState<string | null>(null);
  const [beltsAttempt, setBeltsAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  // A pending redirect must not fire after the screen is gone.
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
      redirectTimer.current = null;
    };
  }, []);

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
        if (active) setBeltsError(getErrorMessage(normalizeApiError(err)));
      })
      .finally(() => {
        if (active) setIsLoadingBelts(false);
      });
    return () => {
      active = false;
    };
  }, [beltsAttempt]);

  const retryBelts = () => {
    setBeltsError(null);
    setIsLoadingBelts(true);
    setBeltsAttempt((attempt) => attempt + 1);
  };

  const handleContinue = async () => {
    if (!selectedBelt) {
      notify("Atenção", "Selecione uma faixa para continuar.");
      return;
    }
    if (!practitionerId) {
      notify(
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
      // The API checks the certificate owner by id (another user's → 403).
      const validation = await declareBeltValidation({
        practitionerId,
        targetBeltId: selectedBelt,
        ...(uploaded ? { certificateId: uploaded.id } : {}),
      });
      setBeltValidationId(validation.id);
      if (!isMounted.current) return;
      setIsLoading(false);
      setIsSuccess(true);
      redirectTimer.current = setTimeout(() => {
        redirectTimer.current = null;
        router.push({
          pathname: "/onboarding/schedule",
          params: cavernaParams,
        });
      }, SUCCESS_REDIRECT_DELAY_MS);
    } catch (err: unknown) {
      if (!isMounted.current) return;
      setIsLoading(false);
      notifyError("Não foi possível salvar os dados", err);
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

          {beltsError ? (
            // Without belts there is nothing to pick: offer a way out.
            <View style={styles.header}>
              <Text style={styles.subtitle} accessibilityRole="alert">
                Não foi possível carregar as faixas. {beltsError}
              </Text>
              <DefaultButton
                label="Tentar novamente"
                color={BrandColors.primary}
                action={retryBelts}
              />
            </View>
          ) : null}

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
