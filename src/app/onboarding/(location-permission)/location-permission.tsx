import { locationPermissionImage } from "@/assets/images";
import { globalStyles } from "@/styles/global.styles";
import { styles } from "@/styles/onboarding/location-permission.style";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { DefaultButton } from "@/components/customized/default-button";
import { BottomTabInset, BrandColors, Spacing } from "@/constants/theme";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type LocationPermissionScreenProps = {
  onPermissionGranted?: (location: Location.LocationObject) => void;
  onPermissionDenied?: () => void;
  onSkip?: () => void;
};

export default function LocationPermissionScreen() {
  const handlePermissionGranted = useCallback(
    (location: Location.LocationObject) => {
      console.log(location.coords);
    },
    [],
  );

  const handlePermissionDenied = useCallback(() => {
    Alert.alert(
      "Localização indisponível",
      "Não foi possível acessar sua localização. Você pode tentar novamente ou continuar sem ela.",
    );
  }, []);

  const handleSkip = useCallback(() => {
    Alert.alert("Busca manual", "A busca manual ainda não está disponível.");
  }, []);

  return (
    <LocationPermissionContent
      onPermissionGranted={handlePermissionGranted}
      onPermissionDenied={handlePermissionDenied}
      onSkip={handleSkip}
    />
  );
}

function LocationPermissionContent({
  onPermissionGranted,
  onPermissionDenied,
  onSkip,
}: LocationPermissionScreenProps) {
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const hasRequestedOnOpen = useRef(false);
  const safeAreaInsets = useSafeAreaInsets();

  const handleRequestLocation = useCallback(async () => {
    if (isRequestingPermission) {
      return;
    }

    try {
      setIsRequestingPermission(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        onPermissionDenied?.();
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      onPermissionGranted?.(location);
    } catch (error) {
      console.error("Erro ao solicitar localização:", error);

      onPermissionDenied?.();
    } finally {
      setIsRequestingPermission(false);
    }
  }, [isRequestingPermission, onPermissionGranted, onPermissionDenied]);

  useEffect(() => {
    if (hasRequestedOnOpen.current) {
      return;
    }

    hasRequestedOnOpen.current = true;
    void handleRequestLocation();
  }, [handleRequestLocation]);

  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <Image
            source={locationPermissionImage}
            style={styles.illustration}
            resizeMode="contain"
            accessibilityLabel="Mapa mostrando o caminho até as cavernas"
          />
        </View>

        {/* Conteúdo */}
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

        {/* Ação */}
        <View style={[styles.actions, { paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three }]}>
          <DefaultButton
            label="Permitir localização"
            color={BrandColors.secondary}
            action={handleRequestLocation}
            disabled={isRequestingPermission}
          />

          <Pressable
            style={styles.skipButton}
            onPress={onSkip}
            disabled={isRequestingPermission}
          >
            <Text style={styles.skipButtonText}>
              Agora não, prefiro buscar manualmente
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
