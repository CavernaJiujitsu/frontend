import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import kimonoGif from "@/assets/images/start-kimono-cloth.gif";
import { DefaultButton } from "@/components/customized/default-button";
import { IconDisplayer } from "@/components/customized/icon-displayer";
import { BrandColors } from "@/constants/theme";
import { globalStyles } from "@/styles/global.styles";
import { styles } from "@/styles/onboarding/start.styles";
import { useRouter } from "expo-router";

export default function OnboardingStartScreen() {
  const router = useRouter();

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
          <View style={styles.iconDisplayer}>
            <IconDisplayer
              Icon={kimonoGif}
              backgroundDefinition={BrandColors.primary}
              borderColor={BrandColors.secondary}
              format="rounded"
              size={92}
            />
          </View>
          <Text style={styles.title}>Caverna JiuJitsu</Text>
          <Text style={styles.description}>
            O wellhub do jiu-jiteiro. Treine em{"\n"}
            qualquer academia da rede, com{"\n"}
            graduação justa e reconhecida.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <DefaultButton
          action={handleCreateAccount}
          color={BrandColors.secondary}
          label="Criar conta"
        />
        <DefaultButton
          action={handleSignIn}
          color={BrandColors.primary}
          label="Já tenho conta"
        />
      </View>
    </SafeAreaView>
  );
}
