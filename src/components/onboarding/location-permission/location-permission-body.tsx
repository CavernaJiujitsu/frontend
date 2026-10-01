import { Text, View } from "react-native";
import { styles } from "@/styles/onboarding/location-permission.style";

export function LocationPermissionBody() {
  return (
    <View style={styles.textContainer}>
      <Text style={styles.title}>Encontre sua Caverna</Text>

      <Text style={styles.description}>
        Permita que o Caverna Jiu-Jitsu acesse sua localização para
        encontrarmos as cavernas mais próximas de você.
      </Text>

      <Text style={styles.secondaryDescription}>
        Sua localização será usada apenas para encontrar unidades próximas.
      </Text>
    </View>
  );
}
