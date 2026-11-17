import { updatePractitionerLocation } from "@/api/services/practitioners.service";
import { getErrorMessage } from "@/constants/error-messages";
import { useLocationPermission } from "@/hooks/use-location-permission";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { confirmAction, notify } from "@/utils/dialogs";
import { normalizeCoordinates } from "@/utils/location";
import { normalizeApiError } from "@/utils/normalize-api-error";
import type * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

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

      // Alert.alert is a no-op on the web: use the cross-platform dialogs and
      // never depend on a dialog button to leave the screen.
      if (!coordinates) {
        notify(
          "Localização indisponível",
          "Não foi possível obter coordenadas válidas. Você vai continuar sem sincronizar sua localização.",
        );
        continueToNearbyGym();
        return;
      }

      if (!practitionerId) {
        notify(
          "Cadastro não encontrado",
          "Sua localização foi obtida, mas não encontramos o praticante para sincronizá-la. Você vai continuar sem sincronizar.",
        );
        continueToNearbyGym();
        return;
      }

      setIsSavingLocation(true);
      try {
        await updatePractitionerLocation(practitionerId, coordinates);
        continueToNearbyGym();
      } catch (error) {
        const appError = normalizeApiError(error);
        // The session handler already warns and redirects to the login.
        if (appError.kind === "session-expired") return;
        // Declining keeps the user here, where "Permitir localização" retries
        // and "Agora não" skips.
        confirmAction(
          "Não foi possível salvar a localização",
          `${getErrorMessage(appError)} Deseja continuar sem sincronizar sua localização?`,
          continueToNearbyGym,
          "Continuar",
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

  const handlePermissionGranted = useCallback(
    (location: Location.LocationObject) => saveLocation(location),
    [saveLocation],
  );

  const handlePermissionDenied = useCallback(() => {
    notify(
      "Localização indisponível",
      "Não foi possível acessar sua localização. Você pode tentar novamente ou continuar sem ela.",
    );
  }, []);

  const handleSkip = useCallback(() => {
    continueToNearbyGym();
  }, [continueToNearbyGym]);

  const { isRequestingPermission, handleRequestLocation } =
    useLocationPermission({
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
