import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useLocationPermission } from "@/hooks/use-location-permission";
import { updatePractitionerLocation } from "@/api/services/practitioners.service";
import { backendMessage } from "@/api/utils/backend-message";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { normalizeCoordinates } from "@/utils/location";

import { LocationPermissionActions } from "@/components/onboarding/location-permission/location-permission-actions";
import { LocationPermissionBody } from "@/components/onboarding/location-permission/location-permission-body";
import { LocationPermissionIllustration } from "@/components/onboarding/location-permission/location-permission-illustration";

export default function LocationPermissionScreen() {
  const router = useRouter();
  const setUserLocation = useAppStore((state) => state.setUserLocation);
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const setLocationPermissionGranted = useAppStore(
    (state) => state.setLocationPermissionGranted,
  );
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const hasNavigated = useRef(false);
  const saveLocationRef = useRef<
    ((location: Location.LocationObject) => void) | null
  >(null);

  const continueToNearbyGym = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.replace("/onboarding/nearby-gym");
  }, [router]);

  const saveLocation = useCallback(
    async (location: Location.LocationObject) => {
      const coordinates = normalizeCoordinates(
        location.coords.latitude,
        location.coords.longitude,
      );

      setUserLocation(location);
      setLocationPermissionGranted(true);

      if (!coordinates) {
        Alert.alert(
          "Localização indisponível",
          "Não foi possível obter coordenadas válidas. Você pode continuar sem sincronizar sua localização.",
          [{ text: "Continuar", onPress: continueToNearbyGym }],
        );
        return;
      }

      if (!practitionerId) {
        Alert.alert(
          "Cadastro não encontrado",
          "Sua localização foi obtida, mas não encontramos o praticante para sincronizá-la. Você pode continuar sem sincronizar.",
          [{ text: "Continuar", onPress: continueToNearbyGym }],
        );
        return;
      }

      setIsSavingLocation(true);
      try {
        await updatePractitionerLocation(practitionerId, coordinates);
        continueToNearbyGym();
      } catch (error) {
        Alert.alert(
          "Não foi possível salvar a localização",
          backendMessage(
            error,
            "Tente novamente ou continue sem sincronizar sua localização.",
          ),
          [
            {
              text: "Tentar novamente",
              onPress: () => saveLocationRef.current?.(location),
            },
            { text: "Continuar sem sincronizar", onPress: continueToNearbyGym },
          ],
        );
      } finally {
        setIsSavingLocation(false);
      }
    },
    [
      continueToNearbyGym,
      practitionerId,
      setLocationPermissionGranted,
      setUserLocation,
    ],
  );

  useEffect(() => {
    saveLocationRef.current = (location) => {
      void saveLocation(location);
    };
  }, [saveLocation]);

  const handlePermissionGranted = useCallback(
    (location: Location.LocationObject) => saveLocation(location),
    [saveLocation],
  );

  const handlePermissionDenied = useCallback(() => {
    Alert.alert(
      "Localização indisponível",
      "Não foi possível acessar sua localização. Você pode tentar novamente ou continuar sem ela.",
    );
  }, []);

  const handleSkip = useCallback(() => {
    continueToNearbyGym();
  }, [continueToNearbyGym]);

  const { isRequestingPermission, handleRequestLocation } = useLocationPermission({
    onPermissionGranted: handlePermissionGranted,
    onPermissionDenied: handlePermissionDenied,
  });

  return (
    <SafeAreaView style={globalStyles.screen}>
      <LocationPermissionIllustration />
      <LocationPermissionBody />
      <LocationPermissionActions
        isRequestingPermission={isRequestingPermission}
        isSavingLocation={isSavingLocation}
        handleRequestLocation={handleRequestLocation}
        onSkip={handleSkip}
      />
    </SafeAreaView>
  );
}
