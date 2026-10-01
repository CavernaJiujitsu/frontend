import { useCallback } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useLocationPermission } from "@/hooks/use-location-permission";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";

import { LocationPermissionActions } from "@/components/onboarding/location-permission/location-permission-actions";
import { LocationPermissionBody } from "@/components/onboarding/location-permission/location-permission-body";
import { LocationPermissionIllustration } from "@/components/onboarding/location-permission/location-permission-illustration";

export default function LocationPermissionScreen() {
  const router = useRouter();
  const setUserLocation = useAppStore((state) => state.setUserLocation);
  const setLocationPermissionGranted = useAppStore(
    (state) => state.setLocationPermissionGranted,
  );

  const handlePermissionGranted = useCallback(
    (location: Location.LocationObject) => {
      setUserLocation(location);
      setLocationPermissionGranted(true);
      router.replace("/onboarding/nearby-gym");
    },
    [router, setUserLocation, setLocationPermissionGranted],
  );

  const handlePermissionDenied = useCallback(() => {
    Alert.alert(
      "Localização indisponível",
      "Não foi possível acessar sua localização. Você pode tentar novamente ou continuar sem ela.",
    );
  }, []);

  const handleSkip = useCallback(() => {
    router.replace("/onboarding/nearby-gym");
  }, [router]);

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
        handleRequestLocation={handleRequestLocation}
        onSkip={handleSkip}
      />
    </SafeAreaView>
  );
}
