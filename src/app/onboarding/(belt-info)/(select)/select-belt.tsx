import { DefaultButton } from "@/components/customized/default-button";
import { styles } from "@/styles/onboarding/select-info/select-info.style";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OptionType = "none" | "graduated" | null;

export default function SelectBeltScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const [selectedOption, setSelectedOption] = useState<OptionType>("graduated");

  const handleContinue = () => {
    if (selectedOption === "graduated") {
      router.push("/onboarding/belt-info");
    } else {
      router.replace("/");
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
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
              Qual sua faixa atual?
            </Text>
            <Text style={styles.subtitle}>
              Isso define por onde sua trilha começa
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedOption("none")}
            style={[
              styles.optionCard,
              selectedOption === "none" && styles.selectedOptionCard,
              isSmallScreen && styles.optionCardSmall,
            ]}
          >
            <View style={styles.optionHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.emoji}>🆕</Text>
                <Text
                  style={[
                    styles.optionTitle,
                    isSmallScreen && styles.optionTitleSmall,
                  ]}
                >
                  Não tenho graduação
                </Text>
              </View>
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
            activeOpacity={0.8}
            onPress={() => setSelectedOption("graduated")}
            style={[
              styles.optionCard,
              selectedOption === "graduated" && styles.selectedOptionCard,
              isSmallScreen && styles.optionCardSmall,
            ]}
          >
            <View style={styles.optionHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.emoji}>🥋</Text>
                <Text
                  style={[
                    styles.optionTitle,
                    isSmallScreen && styles.optionTitleSmall,
                  ]}
                >
                  Sou graduado
                </Text>
              </View>
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

          <View style={styles.footer}>
            <DefaultButton
              label="Continuar"
              color="#FF6B35"
              action={handleContinue}
              disabled={!selectedOption}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
