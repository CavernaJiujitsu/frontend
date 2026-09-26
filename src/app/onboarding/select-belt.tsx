import { DefaultButton } from '@/components/customized/default-button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OptionType = 'none' | 'graduated' | null;

export default function SelectBeltScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const [selectedOption, setSelectedOption] = useState<OptionType>('graduated');

  const handleContinue = () => {
    if (selectedOption === 'graduated') {
      router.push('/onboarding/belt-info');
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.cardContainer, isSmallScreen && styles.cardContainerSmall]}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
              Qual sua faixa atual?
            </Text>
            <Text style={styles.subtitle}>Isso define por onde sua trilha começa</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedOption('none')}
            style={[
              styles.optionCard,
              selectedOption === 'none' && styles.selectedOptionCard,
              isSmallScreen && styles.optionCardSmall,
            ]}
          >
            <View style={styles.optionHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.emoji}>🆕</Text>
                <Text style={[styles.optionTitle, isSmallScreen && styles.optionTitleSmall]}>
                  Não tenho graduação
                </Text>
              </View>
              {selectedOption === 'none' && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selecionado</Text>
                </View>
              )}
            </View>
            <Text style={styles.optionDescription}>
              Vou começar pela aula de validação e receber minha primeira faixa lá.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedOption('graduated')}
            style={[
              styles.optionCard,
              selectedOption === 'graduated' && styles.selectedOptionCard,
              isSmallScreen && styles.optionCardSmall,
            ]}
          >
            <View style={styles.optionHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.emoji}>🥋</Text>
                <Text style={[styles.optionTitle, isSmallScreen && styles.optionTitleSmall]}>
                  Sou graduado
                </Text>
              </View>
              {selectedOption === 'graduated' && (
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0E14',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#121620',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: '#1E2330',
    gap: 16,
  },
  cardContainerSmall: {
    paddingHorizontal: 14,
    paddingVertical: 20,
    borderRadius: 16,
    gap: 12,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  titleSmall: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  optionCard: {
    width: '100%',
    backgroundColor: '#181C27',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSmall: {
    padding: 14,
  },
  selectedOptionCard: {
    borderColor: '#00B894',
    backgroundColor: '#162224',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 140,
  },
  emoji: {
    fontSize: 18,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  optionTitleSmall: {
    fontSize: 15,
  },
  selectedBadge: {
    backgroundColor: '#0A3832',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00B894',
  },
  selectedBadgeText: {
    color: '#00B894',
    fontSize: 11,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginTop: 4,
  },
  footer: {
    marginTop: 16,
    width: '100%',
  },
});