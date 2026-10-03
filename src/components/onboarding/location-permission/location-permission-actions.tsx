import { DefaultButton } from "@/components/customized/default-button";
import { BrandColors } from "@/constants/theme";
import { styles } from "@/styles/onboarding/location-permission.style";
import { Pressable, Text, View } from "react-native";

type LocationPermissionActionsProps = {
  isRequestingPermission: boolean;
  handleRequestLocation: () => void;
  onSkip?: () => void;
};

export function LocationPermissionActions({
  isRequestingPermission,
  handleRequestLocation,
  onSkip,
}: LocationPermissionActionsProps) {
  return (
    <View style={styles.actions}>
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
  );
}
