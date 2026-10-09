import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { globalStyles } from "@/styles/global.styles";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";

export default function Cavernas() {
  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={[globalStyles.container, styles.content]}>
        <View style={styles.header}>
          <Text style={styles.greeting} accessibilityRole="header">
            Cavernas
          </Text>
          <Text style={styles.greetingSub}>Encontre a caverna mais próxima de você</Text>
        </View>
        <Text style={styles.emptyText}>Em breve: lista completa de cavernas.</Text>
      </View>
    </SafeAreaView>
  );
}
