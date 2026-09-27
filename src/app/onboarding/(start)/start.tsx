import { Alert, Image, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { mascoteCaverna } from "@/assets/images";
import { DefaultButton } from "@/components/customized/default-button";
import { BrandColors } from "@/constants/theme";
import { globalStyles } from "@/styles/global.styles";
import { styles } from "@/styles/onboarding/start.styles";
import { useRouter } from "expo-router";

export default function OnboardingStartScreen() {
  const router = useRouter();
  const mascotEntranceStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1, { duration: 260 }),
    transform: [
      {
        scale: withSequence(
          withTiming(1.035, { duration: 320 }),
          withSpring(1, { damping: 14, stiffness: 115 }),
        ),
      },
    ],
  }));
  const titleEntranceStyle = useAnimatedStyle(() => ({
    opacity: withDelay(850, withTiming(1, { duration: 420 })),
    transform: [
      { translateY: withDelay(850, withTiming(0, { duration: 420 })) },
    ],
  }));
  const descriptionEntranceStyle = useAnimatedStyle(() => ({
    opacity: withDelay(1000, withTiming(1, { duration: 420 })),
  }));
  const primaryButtonStyle = useAnimatedStyle(() => ({
    opacity: withDelay(1150, withTiming(1, { duration: 180 })),
    transform: [
      {
        translateY: withDelay(
          1150,
          withSpring(0, { damping: 11, stiffness: 120 }),
        ),
      },
      {
        scale: withDelay(
          1150,
          withSequence(
            withTiming(1.035, { duration: 260 }),
            withSpring(1, { damping: 11, stiffness: 120 }),
          ),
        ),
      },
    ],
  }));
  const secondaryButtonStyle = useAnimatedStyle(() => ({
    opacity: withDelay(1450, withTiming(1, { duration: 400 })),
    transform: [
      { translateY: withDelay(1450, withTiming(0, { duration: 400 })) },
    ],
  }));
  const eyeGlowStyle = useAnimatedStyle(() => ({
    opacity: withDelay(
      950,
      withRepeat(
        withSequence(
          withTiming(0.62, { duration: 1100 }),
          withTiming(0.2, { duration: 1300 }),
        ),
        -1,
      ),
    ),
  }));

  function handleCreateAccount() {
    router.push("/onboarding/welcome");
  }

  function handleSignIn() {
    Alert.alert("Em breve", "O fluxo de login será disponibilizado em breve.");
    router.push("/onboarding/welcome");
  }

  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={styles.content}>
        <View style={styles.message}>
          <Animated.View style={[styles.mascotContainer, mascotEntranceStyle]}>
            <Image
              accessibilityLabel="Mascote da Caverna JiuJitsu"
              resizeMode="contain"
              source={mascoteCaverna}
              style={styles.mascot}
            />
            <Svg
              width="100%"
              height={140}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={styles.mascotFade}
            >
              <Defs>
                <LinearGradient
                  id="start-mascot-fade"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <Stop
                    offset="0%"
                    stopColor={BrandColors.background}
                    stopOpacity={0}
                  />
                  <Stop
                    offset="100%"
                    stopColor={BrandColors.background}
                    stopOpacity={1}
                  />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#start-mascot-fade)" />
            </Svg>
            <Animated.View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.eyeGlow, eyeGlowStyle]}
            >
              <Svg width="100%" height="100%">
                <Defs>
                  <RadialGradient id="start-eye-glow" cx="50%" cy="50%" r="50%">
                    <Stop
                      offset="0%"
                      stopColor={BrandColors.secondary}
                      stopOpacity={0.55}
                    />
                    <Stop
                      offset="100%"
                      stopColor={BrandColors.secondary}
                      stopOpacity={0}
                    />
                  </RadialGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#start-eye-glow)" />
              </Svg>
            </Animated.View>
          </Animated.View>
          <Animated.Text style={[styles.title, titleEntranceStyle]}>
            Caverna JiuJitsu
          </Animated.Text>
          <Animated.Text style={[styles.description, descriptionEntranceStyle]}>
            O wellhub do jiu-jiteiro. Treine em{"\n"}
            qualquer academia da rede, com{"\n"}
            graduação justa e reconhecida.
          </Animated.Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Animated.View
          style={[styles.primaryButtonEntrance, primaryButtonStyle]}
        >
          <DefaultButton
            action={handleCreateAccount}
            color={BrandColors.secondary}
            label="Criar conta"
          />
        </Animated.View>
        <Animated.View
          style={[styles.secondaryButtonEntrance, secondaryButtonStyle]}
        >
          <DefaultButton
            action={handleSignIn}
            color={BrandColors.primary}
            label="Já tenho conta"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
