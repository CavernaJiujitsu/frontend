import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DefaultButton } from "@/components/customized/default-button";
import { BrandColors } from "@/constants/theme";
import { declareBeltValidation } from "@/api/services/belt-validations.service";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { selectBeltStyles as styles } from "@/styles/onboarding/select-belt.styles";
import { notify, notifyError } from "@/utils/dialogs";

type OptionType = "none" | "graduated" | null;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function SelectBeltScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cavernaId?: string | string[];
    cavernaTitle?: string | string[];
  }>();
  const cavernaId = firstParam(params.cavernaId);
  const cavernaTitle = firstParam(params.cavernaTitle);
  const cavernaParams = { cavernaId, cavernaTitle };
  const [selectedOption, setSelectedOption] =
    useState<OptionType>("graduated");
  const [isLoading, setIsLoading] = useState(false);
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const setBeltValidationId = useAppStore(
    (state) => state.setBeltValidationId,
  );

  const goToSchedule = () => {
    router.push({
      pathname: "/onboarding/schedule",
      params: cavernaParams,
    });
  };

  const handleContinue = async () => {
    if (selectedOption === "graduated") {
      router.push({
        pathname: "/onboarding/belt-info",
        params: cavernaParams,
      });
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
      const validation = await declareBeltValidation({ practitionerId });
      setBeltValidationId(validation.id);
      goToSchedule();
    } catch (err: unknown) {
      notifyError("Não foi possível salvar os dados", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={[globalStyles.container, styles.pageGap]}>
        <View style={[globalStyles.flex, styles.content]}>
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              Qual sua faixa atual?
            </Text>
            <Text style={styles.subtitle}>
              Isso define por onde sua trilha começa
            </Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={() => setSelectedOption("none")}
            style={[
              styles.optionCard,
              selectedOption === "none" && styles.selectedOptionCard,
            ]}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Não tenho graduação</Text>
              {selectedOption === "none" && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selecionado</Text>
                </View>
              )}
            </View>
            <Text style={styles.optionDescription}>
              Vou começar pela aula de validação e receber minha primeira faixa
              lá.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={() => setSelectedOption("graduated")}
            style={[
              styles.optionCard,
              selectedOption === "graduated" && styles.selectedOptionCard,
            ]}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Sou graduado</Text>
              {selectedOption === "graduated" && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selecionado</Text>
                </View>
              )}
            </View>
            <Text style={styles.optionDescription}>
              Vou informar minha faixa e enviar meu certificado para validação.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <DefaultButton
            label={isLoading ? "Salvando..." : "Continuar"}
            color={BrandColors.secondary}
            action={handleContinue}
            disabled={!selectedOption || isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
