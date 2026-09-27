import { Image, View } from "react-native";
import { locationPermissionImage } from "@/assets/images";
import { styles } from "@/styles/onboarding/location-permission.style";

export function LocationPermissionIllustration() {
  return (
    <View style={styles.illustrationContainer}>
      <Image
        source={locationPermissionImage}
        style={styles.illustration}
        resizeMode="contain"
        accessibilityLabel="Mapa mostrando o caminho até as cavernas"
      />
    </View>
  );
}
