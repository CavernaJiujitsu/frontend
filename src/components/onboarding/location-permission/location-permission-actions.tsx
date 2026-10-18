import { DefaultButton } from "@/components/customized/default-button";
import { BrandColors } from "@/constants/theme";
import { styles } from "@/styles/onboarding/location-permission.style";
import { Pressable, Text, View } from "react-native";

type LocationPermissionActionsProps = {
  isRequestingPermission: boolean;
  isSavingLocation: boolean;
  handleRequestLocation: () => void;
  onSkip?: () => void;
};

export function LocationPermissionActions({
  isRequestingPermission,
  isSavingLocation,
  handleRequestLocation,
  onSkip,
}: LocationPermissionActionsProps) {
  const isBusy = isRequestingPermission || isSavingLocation;

  return (
    <View style={styles.actions}>
      <DefaultButton
        label={isSavingLocation ? "Salvando localização..." : "Permitir localização"}
        color={BrandColors.secondary}
        action={handleRequestLocation}
        disabled={isBusy}
      />

      <Pressable
        style={styles.skipButton}
        onPress={onSkip}
        disabled={isBusy}
      >
        <Text style={styles.skipButtonText}>
          Agora não, prefiro buscar manualmente
        </Text>
      </Pressable>
    </View>
  );
}
