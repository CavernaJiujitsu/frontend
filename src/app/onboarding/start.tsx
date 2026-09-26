import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import kimonoGif from "@/assets/images/start-kimono-cloth.gif";
import { DefaultButton } from "@/components/customized/default-button";
import { IconDisplayer } from "@/components/customized/icon-displayer";
import { BrandColors } from "@/constants/theme";
import { styles } from "@/styles/onboarding/start.styles";

export default function OnboardingStartScreen() {
  function handleCreateAccount() {
    Alert.alert(
      "Em breve",
      "O fluxo para criar conta será disponibilizado em breve.",
    );
  }

  function handleSignIn() {
    Alert.alert("Em breve", "O fluxo de login será disponibilizado em breve.");
  }

  return (
    <SafeAreaView style={styles.screen}>
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
