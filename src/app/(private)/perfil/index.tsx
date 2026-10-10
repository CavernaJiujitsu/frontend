import { Text, View } from "react-native";

import { BottomNavbar } from "@/components/bottom-navbar/bottom-navbar";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { globalStyles } from "@/styles/global.styles";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";

export default function Perfil() {
  return (
    <ScreenLayout bottomNav={<BottomNavbar />}>
      <View style={[globalStyles.container, styles.content]}>
        <View style={styles.header}>
          <Text style={styles.greeting} accessibilityRole="header">
            Perfil
          </Text>
          <Text style={styles.greetingSub}>Seus dados e sua graduação</Text>
        </View>
        <Text style={styles.emptyText}>Em breve: dados do praticante.</Text>
      </View>
    </ScreenLayout>
  );
}
