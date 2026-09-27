import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useLocationPermission } from "@/hooks/use-location-permission";
import { globalStyles } from "@/styles/global.styles";

import { LocationPermissionActions } from "./(components)/location-permission-actions";
import { LocationPermissionBody } from "./(components)/location-permission-body";
import { LocationPermissionIllustration } from "./(components)/location-permission-illustration";

export default function LocationPermissionScreen() {
  const handlePermissionGranted = (location: Location.LocationObject) => {
    console.log(location.coords);
  };

  const handlePermissionDenied = () => {
    Alert.alert(
      "Localização indisponível",
      "Não foi possível acessar sua localização. Você pode tentar novamente ou continuar sem ela.",
    );
  };

  const handleSkip = () => {
    Alert.alert("Busca manual", "A busca manual ainda não está disponível.");
  };

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
