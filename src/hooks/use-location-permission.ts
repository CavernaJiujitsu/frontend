import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

type OnPermissionGranted = (location: Location.LocationObject) => void;
type OnPermissionDenied = () => void;

export function useLocationPermission({
  onPermissionGranted,
  onPermissionDenied,
}: {
  onPermissionGranted?: OnPermissionGranted;
  onPermissionDenied?: OnPermissionDenied;
}) {
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const hasRequestedOnOpen = useRef(false);

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

  return { isRequestingPermission, handleRequestLocation };
}
