import { DefaultButton } from '@/components/customized/default-button';
import { useRouter } from 'expo-router';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 360;
  const isLargeScreen = width >= 768; 
  const handleNext = () => {
    router.push('/');
  };

  const handleSkip = () => {
    router.replace('/');
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
            styles.container,
            isLargeScreen && styles.containerLarge,
          ]}
        >
        
          <View
            style={[
              styles.imageCard,
              isSmallScreen && styles.imageCardSmall,
              isLargeScreen && styles.imageCardLarge,
            ]}
          >
            <Image
              source={require('@/assets/images/onboarding-globe.png')}
              style={[
                styles.image,
                isSmallScreen && styles.imageSmall,
                isLargeScreen && styles.imageLarge,
              ]}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.title,
              isSmallScreen && styles.titleSmall,
              isLargeScreen && styles.titleLarge,
            ]}
          >
            Faixa justa,{"\n"}em qualquer unidade
          </Text>

          <Text
            style={[
              styles.subtitle,
              isSmallScreen && styles.subtitleSmall,
              isLargeScreen && styles.subtitleLarge,
            ]}
          >
            Sua trilha técnica segue o padrão da CBJJ — treine em academias
            diferentes sem perder seu progresso.
          </Text>

          <View
            style={[
              styles.paginationContainer,
              isSmallScreen && styles.paginationSmall,
              isLargeScreen && styles.paginationLarge,
            ]}
          >
            <View style={[styles.dot, styles.inactiveDot, isLargeScreen && styles.dotLarge]} />
            <View style={[styles.dot, styles.activeDot, isLargeScreen && styles.activeDotLarge]} />
            <View style={[styles.dot, styles.inactiveDot, isLargeScreen && styles.dotLarge]} />
          </View>

          <View style={[styles.footer, isLargeScreen && styles.footerLarge]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSkip}
              style={[
                styles.skipButton,
                isSmallScreen && styles.skipButtonSmall,
              ]}
            >
              <Text
                style={[
                  styles.skipText,
                  isSmallScreen && styles.skipTextSmall,
                  isLargeScreen && styles.skipTextLarge,
                ]}
              >
                Pular
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.nextButtonWrapper,
                isSmallScreen && styles.nextButtonWrapperSmall,
                isLargeScreen && styles.nextButtonWrapperLarge,
              ]}
            >
              <DefaultButton
                label="Avançar"
                color="#FF6B35"
                action={handleNext}
              />
            </View>
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
    paddingVertical: 24,
  },

  container: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerLarge: {
    maxWidth: 560,
    paddingHorizontal: 32,
  },

  imageCard: {
    width: '100%',
    height: 220,
    backgroundColor: '#181C27',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  imageCardSmall: {
    height: 160,
    borderRadius: 18,
    marginBottom: 20,
  },
  imageCardLarge: {
    height: 300,
    borderRadius: 28,
    marginBottom: 36,
  },

  image: {
    width: 140,
    height: 140,
  },
  imageSmall: {
    width: 100,
    height: 100,
  },
  imageLarge: {
    width: 190,
    height: 190,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 30,
  },
  titleSmall: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 8,
  },
  titleLarge: {
    fontSize: 30,
    lineHeight: 38,
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  subtitleSmall: {
    fontSize: 12,
    lineHeight: 16,
  },
  subtitleLarge: {
    fontSize: 17,
    lineHeight: 24,
  },

  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    gap: 8,
  },
  paginationSmall: {
    marginTop: 18,
  },
  paginationLarge: {
    marginTop: 36,
    gap: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotLarge: {
    height: 10,
    borderRadius: 5,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#2A2D37',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#FF6B35',
  },
  activeDotLarge: {
    width: 36,
  },

  footer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
  },
  footerLarge: {
    marginTop: 44,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  skipButtonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  skipTextSmall: {
    fontSize: 14,
  },
  skipTextLarge: {
    fontSize: 18,
  },
  nextButtonWrapper: {
    width: 140,
  },
  nextButtonWrapperSmall: {
    flex: 1,
    maxWidth: 130,
  },
  nextButtonWrapperLarge: {
    width: 170,
  },
});