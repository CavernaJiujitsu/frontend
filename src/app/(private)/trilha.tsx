import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { globalStyles } from "@/styles/global.styles";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";

export default function Trilha() {
  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={[globalStyles.container, styles.content]}>
        <View style={styles.header}>
          <Text style={styles.greeting} accessibilityRole="header">
            Trilha
          </Text>
          <Text style={styles.greetingSub}>Sua evolução checkpoint a checkpoint</Text>
        </View>
        <Text style={styles.emptyText}>Em breve: checkpoints da sua faixa atual.</Text>
      </View>
    </SafeAreaView>
  );
}
