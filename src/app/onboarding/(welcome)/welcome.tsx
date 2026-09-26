import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { onboardingGlobe } from "@/assets/images";
import { globalStyles } from "@/styles/global.styles";
import { styles } from "@/styles/onboarding/welcome.styles";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push("/");
  };

  const handleSkip = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Image
              source={onboardingGlobe}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <Text
            style={styles.title}
          >{`Faixa justa,\nem qualquer unidade`}</Text>
          <Text style={styles.description}>
            {
              "Sua trilha técnica segue o padrão da\nCBJJ — treine em academias\ndiferentes sem perder seu progresso."
            }
          </Text>

          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Pular</Text>
          </Pressable>

          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Avançar</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
